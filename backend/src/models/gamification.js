import { DataTypes } from "sequelize";
import db from "../config/database.js";
import User from "./user.js";

const Badge = db.define(
  "Badge",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(
        "consistency",
        "profit",
        "milestone",
        "achievement",
        "special"
      ),
      allowNull: false,
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING,
      defaultValue: "#8b5cf6",
    },
    requirement: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    rarity: {
      type: DataTypes.ENUM("common", "rare", "epic", "legendary"),
      defaultValue: "common",
    },
    xpReward: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
    tableName: "badges",
  }
);

const UserBadge = db.define(
  "UserBadge",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    badgeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "badges",
        key: "id",
      },
    },
    progress: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    achievedAt: {
      type: DataTypes.DATE,
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
  },
  {
    timestamps: true,
    tableName: "user_badges",
    indexes: [
      {
        fields: ["userId", "badgeId"],
        unique: true,
      },
    ],
  }
);

const UserLevel = db.define(
  "UserLevel",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    level: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    experience: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    totalExperience: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    dailyStreak: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    lastActiveDate: {
      type: DataTypes.DATEONLY,
    },
    profitStreak: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    lastProfitDate: {
      type: DataTypes.DATEONLY,
    },
    totalTrades: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    consecutiveWins: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    maxConsecutiveWins: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
    tableName: "user_levels",
  }
);

const Achievement = db.define(
  "Achievement",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    type: {
      type: DataTypes.ENUM(
        "first_trade",
        "first_profit",
        "weekly_consistency",
        "monthly_consistency",
        "profit_milestone",
        "trade_milestone"
      ),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    achievedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
  },
  {
    timestamps: true,
    tableName: "achievements",
    indexes: [
      {
        fields: ["userId", "type"],
      },
    ],
  }
);

const MonthlyLeaderboard = db.define(
  "MonthlyLeaderboard",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    period: {
      type: DataTypes.STRING, // Format: 'YYYY-MM'
      allowNull: false,
    },
    rank: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    score: {
      type: DataTypes.INTEGER, // Total poin bulan ini
      defaultValue: 0,
    },
    totalTrades: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    totalProfit: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    totalExperience: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    winRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
    tableName: "monthly_leaderboards",
    indexes: [
      {
        fields: ["period", "rank"],
      },
      {
        fields: ["userId", "period"],
        unique: true,
      },
    ],
  }
);

// Relationships
User.hasMany(UserBadge, { foreignKey: "userId", onDelete: "CASCADE" });
UserBadge.belongsTo(User, { foreignKey: "userId" });
UserBadge.belongsTo(Badge, { foreignKey: "badgeId" });

User.hasOne(UserLevel, { foreignKey: "userId", onDelete: "CASCADE" });
UserLevel.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Achievement, { foreignKey: "userId", onDelete: "CASCADE" });
Achievement.belongsTo(User, { foreignKey: "userId" });

User.hasMany(MonthlyLeaderboard, { foreignKey: "userId", onDelete: "CASCADE" });
MonthlyLeaderboard.belongsTo(User, { foreignKey: "userId" });

// Initialize default badges
export const initializeDefaultBadges = async () => {
  const defaultBadges = [
    // Consistency Badges
    {
      name: "Early Bird",
      description: "Log trades for 3 consecutive days",
      type: "consistency",
      icon: "calendar",
      color: "#f59e0b",
      requirement: { type: "daily_streak", value: 3 },
      rarity: "common",
      xpReward: 50,
    },
    {
      name: "Dedicated Trader",
      description: "Log trades for 7 consecutive days",
      type: "consistency",
      icon: "trending-up",
      color: "#ef4444",
      requirement: { type: "daily_streak", value: 7 },
      rarity: "rare",
      xpReward: 100,
    },
    {
      name: "Trading Warrior",
      description: "Log trades for 30 consecutive days",
      type: "consistency",
      icon: "shield",
      color: "#8b5cf6",
      requirement: { type: "daily_streak", value: 30 },
      rarity: "epic",
      xpReward: 500,
    },
    {
      name: "Legendary Consistency",
      description: "Log trades for 90 consecutive days",
      type: "consistency",
      icon: "crown",
      color: "#f59e0b",
      requirement: { type: "daily_streak", value: 90 },
      rarity: "legendary",
      xpReward: 1000,
    },

    // Profit Streak Badges
    {
      name: "Profit Starter",
      description: "Make profit for 2 trades in a row",
      type: "profit",
      icon: "dollar-sign",
      color: "#10b981",
      requirement: { type: "profit_streak", value: 2 },
      rarity: "common",
      xpReward: 75,
    },
    {
      name: "Hot Streak",
      description: "Make profit for 5 trades in a row",
      type: "profit",
      icon: "flame",
      color: "#ef4444",
      requirement: { type: "profit_streak", value: 5 },
      rarity: "rare",
      xpReward: 200,
    },
    {
      name: "Profit King",
      description: "Make profit for 10 trades in a row",
      type: "profit",
      icon: "award",
      color: "#f59e0b",
      requirement: { type: "profit_streak", value: 10 },
      rarity: "epic",
      xpReward: 500,
    },
    {
      name: "Unstoppable",
      description: "Make profit for 20 trades in a row",
      type: "profit",
      icon: "zap",
      color: "#8b5cf6",
      requirement: { type: "profit_streak", value: 20 },
      rarity: "legendary",
      xpReward: 1000,
    },

    // Milestone Badges
    {
      name: "First Step",
      description: "Complete your first trade",
      type: "milestone",
      icon: "flag",
      color: "#6b7280",
      requirement: { type: "total_trades", value: 1 },
      rarity: "common",
      xpReward: 25,
    },
    {
      name: "Apprentice Trader",
      description: "Complete 10 trades",
      type: "milestone",
      icon: "user",
      color: "#10b981",
      requirement: { type: "total_trades", value: 10 },
      rarity: "common",
      xpReward: 100,
    },
    {
      name: "Seasoned Trader",
      description: "Complete 50 trades",
      type: "milestone",
      icon: "bar-chart",
      color: "#3b82f6",
      requirement: { type: "total_trades", value: 50 },
      rarity: "rare",
      xpReward: 250,
    },
    {
      name: "Master Trader",
      description: "Complete 100 trades",
      type: "milestone",
      icon: "star",
      color: "#8b5cf6",
      requirement: { type: "total_trades", value: 100 },
      rarity: "epic",
      xpReward: 500,
    },
    {
      name: "Trading Legend",
      description: "Complete 500 trades",
      type: "milestone",
      icon: "crown",
      color: "#f59e0b",
      requirement: { type: "total_trades", value: 500 },
      rarity: "legendary",
      xpReward: 2000,
    },

    // Achievement Badges
    {
      name: "Risk Manager",
      description: "Maintain positive risk-reward ratio for 10 trades",
      type: "achievement",
      icon: "shield",
      color: "#10b981",
      requirement: { type: "risk_reward_positive", value: 10 },
      rarity: "rare",
      xpReward: 150,
    },
    {
      name: "Disciplined Trader",
      description: "Use stop loss in 20 consecutive trades",
      type: "achievement",
      icon: "target",
      color: "#3b82f6",
      requirement: { type: "stop_loss_used", value: 20 },
      rarity: "epic",
      xpReward: 300,
    },
  ];

  try {
    for (const badgeData of defaultBadges) {
      await Badge.findOrCreate({
        where: { name: badgeData.name },
        defaults: badgeData,
      });
    }
    console.log("Default badges initialized");
  } catch (error) {
    console.error("Error initializing default badges:", error);
  }
};

export { Badge, UserBadge, UserLevel, Achievement, MonthlyLeaderboard };