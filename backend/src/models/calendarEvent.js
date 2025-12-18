import { DataTypes } from "sequelize";
import db from "../config/database.js";
import User from "./user.js";
import Trade from "./trade.js";

const CalendarEvent = db.define(
  "CalendarEvent",
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
        model: User,
        key: "id",
      },
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(
        "market_news",
        "economic_event",
        "trade_idea",
        "reminder",
        "trade_review",
        "journal_entry"
      ),
      defaultValue: "journal_entry",
    },
    description: {
      type: DataTypes.TEXT,
    },
    time: {
      type: DataTypes.STRING,
      comment: "Format HH:mm (e.g., 14:30)",
    },
    impact: {
      type: DataTypes.ENUM("high", "medium", "low", "none"),
      defaultValue: "none",
    },
    instrument: {
      type: DataTypes.STRING,
    },
    strategy: {
      type: DataTypes.STRING,
    },
    sentiment: {
      type: DataTypes.ENUM("bullish", "bearish", "neutral"),
      defaultValue: "neutral",
    },
    color: {
      type: DataTypes.STRING,
      defaultValue: "#8b5cf6", // Warna default violet
    },
    isCompleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    relatedTradeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "calendar_events",
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        fields: ["userId", "date"],
      },
      {
        fields: ["userId", "type"],
      },
    ],
  }
);

User.hasMany(CalendarEvent, { foreignKey: "userId", onDelete: "CASCADE" });
CalendarEvent.belongsTo(User, { foreignKey: "userId" });

export default CalendarEvent;