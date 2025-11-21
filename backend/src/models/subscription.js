import { DataTypes } from "sequelize";
import db from "../config/database.js";
import User from "./user.js";

const Subscription = db.define(
  "Subscription",
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
    plan: {
      type: DataTypes.ENUM("free", "pro", "elite", "lifetime"),
      defaultValue: "free",
    },
    expiresAt: {
      type: DataTypes.DATE,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    paymentMethod: {
      type: DataTypes.STRING,
    },
    transactionId: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "subscriptions",
  }
);

User.hasOne(Subscription, { foreignKey: 'userId', onDelete: 'CASCADE' });
Subscription.belongsTo(User, { foreignKey: 'userId' });

export default Subscription;