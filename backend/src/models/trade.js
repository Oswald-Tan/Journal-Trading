import { DataTypes } from "sequelize";
import db from "../config/database.js";
import User from "./user.js";

const Trade = db.define(
  "Trade",
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
    instrument: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("Buy", "Sell"),
      allowNull: false,
    },
    lot: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      get() {
        const value = this.getDataValue('lot');
        return value !== null ? parseFloat(value) : null;
      }
    },
    entry: {
      type: DataTypes.DECIMAL(15, 5),
      allowNull: false,
      get() {
        const value = this.getDataValue('entry');
        return value !== null ? parseFloat(value) : null;
      }
    },
    stop: {
      type: DataTypes.DECIMAL(15, 5),
      get() {
        const value = this.getDataValue('stop');
        return value !== null ? parseFloat(value) : null;
      }
    },
    take: {
      type: DataTypes.DECIMAL(15, 5),
      get() {
        const value = this.getDataValue('take');
        return value !== null ? parseFloat(value) : null;
      }
    },
    exit: {
      type: DataTypes.DECIMAL(15, 5),
      get() {
        const value = this.getDataValue('exit');
        return value !== null ? parseFloat(value) : null;
      }
    },
    pips: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    profit: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
      get() {
        const value = this.getDataValue('profit');
        return value !== null ? parseFloat(value) : null;
      }
    },
    balanceAfter: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      get() {
        const value = this.getDataValue('balanceAfter');
        return value !== null ? parseFloat(value) : null;
      }
    },
    result: {
      type: DataTypes.ENUM("Win", "Lose", "Break Even", "Pending"),
      allowNull: false,
    },
    riskReward: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
      get() {
        const value = this.getDataValue('riskReward');
        return value !== null ? parseFloat(value) : null;
      }
    },
    strategy: {
      type: DataTypes.STRING,
    },
    market: {
      type: DataTypes.STRING,
    },
    emotionBefore: {
      type: DataTypes.STRING,
    },
    emotionAfter: {
      type: DataTypes.STRING,
    },
    screenshot: {
      type: DataTypes.STRING,
    },
    notes: {
      type: DataTypes.TEXT,
    }
  },
  {
    timestamps: true,
    tableName: "trades",
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        fields: ["userId", "date"],
      },
      {
        fields: ["userId", "instrument"],
      },
    ],
  }
);

User.hasMany(Trade, { foreignKey: "userId", onDelete: "CASCADE" });
Trade.belongsTo(User, { foreignKey: "userId" });

export default Trade;