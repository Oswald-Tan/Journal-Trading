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

const app = express();

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://192.168.105.53:8080"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const sessionStore = SequelizeStore(session.Store);

const store = new sessionStore({
  db: db,
});

// store.sync(); //untuk buat table sessions nya

// app.use(
//   session({
//     secret: process.env.SESS_SECRET,
//     resave: false,
//     saveUninitialized: true,
//     store: store, //simpan session ke database
//     cookie: {
//       secure: "auto",
//     },
//   })
// );

const sessionMiddleware = session({
  secret: process.env.SESS_SECRET,
  resave: false,
  saveUninitialized: true,
  store: store, // Simpan session ke database
  cookie: {
    secure: "auto",
  },
});

app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

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

app.get("/api/v1/hello-world", (req, res) => {
  res.status(200).json({ message: "Hello, World!" });
});

app.use("/api/v1/auth", sessionMiddleware, Auth);
app.use("/api/v1/balance", sessionMiddleware, Balance);
app.use("/api/v1/trades", sessionMiddleware, Trade);
app.use('/api/v1/target', sessionMiddleware, Target);
app.use('/api/v1/subscription', sessionMiddleware, Subscription);
app.use('/api/v1/gamification', sessionMiddleware, Gamification);

const PORT = process.env.PORT;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});