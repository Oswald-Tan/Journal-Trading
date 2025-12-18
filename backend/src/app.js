import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import SequelizeStore from "connect-session-sequelize";
import { Server } from "socket.io";
import http from "http";
import db from "./config/database.js";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import fs from "fs";
import cron from "node-cron";
import helmet from 'helmet';
import compression from 'compression';

// Mendapatkan direktori saat ini
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

import Auth from "./routes/authRoute.js";
import Balance from "./routes/balanceRoute.js";
import Trade from "./routes/tradeRoute.js";
import Target from "./routes/targetRoute.js";
import Subscription from "./routes/subscriptionRoute.js";
import Gamification from "./routes/gamificationRoute.js";
import CalenderEvent from "./routes/calendarRoutes.js"
import Transaction from "./routes/transactionRoutes.js";

import { resetMonthlyLeaderboard } from "./controllers/gamificationController.js";
import { initializeDefaultBadges, Badge } from "./models/gamification.js";
import { 
  checkAndSendExpirationReminders, 
  checkAndDowngradeExpiredSubscriptions 
} from './controllers/subscriptionController.js';

const app = express();

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(",") || [],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const sessionStore = SequelizeStore(session.Store);

const store = new sessionStore({
  db: db,
});

const initializeDatabase = async () => {
  try {
    await db.authenticate();
    console.log('✅ Database connected');
    
    // Development only
    if (process.env.NODE_ENV === 'development') {
      console.log('🛠️  Running in DEVELOPMENT mode');
      // await db.sync({ alter: true });
      await initializeDefaultBadges();
      console.log('🛠️  Development database synced');
    } else {
      console.log('🚀 Running in PRODUCTION mode');
      
      // Di production, cek apakah badges sudah ada
      try {
        const count = await Badge.count();
        console.log(`📊 Found ${count} badges in database`);
        
        if (count === 0) {
          console.warn('⚠️  WARNING: No badges found! Please run seeding script');
          console.log('   Command: npm run db:seed');
        }
      } catch (error) {
        console.warn('⚠️  Could not check badges table. If first run, create tables manually');
      }
    }
  } catch (error) {
    console.error('❌ Database error:', error.message);
    if (process.env.NODE_ENV === 'production') {
      console.error('💥 CRITICAL: Cannot connect to database in production');
      process.exit(1);
    }
  }
};

initializeDatabase();

// store.sync(); //untuk buat table sessions nya

// Settingan Development
const sessionMiddleware = session({
  secret: process.env.SESS_SECRET || "dev-secret",
  resave: false,
  saveUninitialized: true,
  store: store,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: "lax",
  },
});

// Settingan Production
// const sessionMiddleware = session({
//   secret: process.env.SESS_SECRET,
//   resave: false,
//   saveUninitialized: false,
//   store: store,
//   cookie: {
//     secure: process.env.NODE_ENV === "production",
//     httpOnly: true,
//     maxAge: 24 * 60 * 60 * 1000,
//     sameSite: "lax",
//   },
// });

app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// Security middleware untuk production
if (process.env.NODE_ENV === 'production') {
  app.use(helmet());
  app.use(compression());
  app.set('trust proxy', 1); // Trust first proxy
  console.log('🔒 Security middleware enabled for production');
}

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `CORS policy: Origin ${origin} not allowed`;
        console.warn(`🚫 CORS blocked: ${origin}`);
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"), {
    setHeaders: (res, path) => {
      // Cache-Control
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

      // ETag secara sinkron
      try {
        const fileBuffer = fs.readFileSync(path);
        const hash = crypto.createHash("md5").update(fileBuffer).digest("hex");
        res.setHeader("ETag", hash);
      } catch (error) {
        console.error("Error generating ETag:", error);
      }
    },
  })
);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "healthy",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    service: "pipsdiary-api"
  });
});

app.get("/api/v1/hello-world", (req, res) => {
  res.status(200).json({ message: "Hello, World!" });
});

app.use("/api/v1/auth", sessionMiddleware, Auth);
app.use("/api/v1/balance", sessionMiddleware, Balance);
app.use("/api/v1/trades", sessionMiddleware, Trade);
app.use("/api/v1/target", sessionMiddleware, Target);
app.use("/api/v1/subscription", sessionMiddleware, Subscription);
app.use("/api/v1/gamification", sessionMiddleware, Gamification);
app.use("/api/v1/calendar", sessionMiddleware, CalenderEvent);
app.use("/api/v1/transactions", sessionMiddleware, Transaction);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found"
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Jalankan tiap tanggal 1 jam 00:00
cron.schedule('0 0 1 * *', async () => {
  console.log('🔄 Running monthly leaderboard reset...');
  try {
    await resetMonthlyLeaderboard();
    console.log('✅ Monthly leaderboard reset completed');
  } catch (error) {
    console.error('❌ Error resetting leaderboard:', error);
  }
});

// Cron job untuk mengecek subscription yang akan expired (jalankan setiap hari jam 09:00)
cron.schedule('0 9 * * *', async () => {
  console.log('⏰ Running subscription expiration reminder check...');
  try {
    const result = await checkAndSendExpirationReminders();
    console.log('✅ Subscription reminder check completed:', result.message);
  } catch (error) {
    console.error('❌ Error in subscription reminder cron job:', error);
  }
});

// Cron job untuk mengecek dan downgrade subscription yang sudah expired (jalankan setiap hari jam 00:01)
cron.schedule('1 0 * * *', async () => {
  console.log('⏰ Running expired subscription check and downgrade...');
  try {
    const result = await checkAndDowngradeExpiredSubscriptions();
    console.log('✅ Expired subscription check completed:', result.message);
  } catch (error) {
    console.error('❌ Error in expired subscription cron job:', error);
  }
});

console.log('⏰ Leaderboard reset cron job scheduled');

const PORT = process.env.PORT || 8082;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  console.log(`🌐 Allowed origins: ${allowedOrigins.join(', ')}`);
});