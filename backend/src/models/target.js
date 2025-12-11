import { DataTypes } from "sequelize";
import db from "../config/database.js";
import User from "./user.js";

const Target = db.define(
  "Target",
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
    enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    targetBalance: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    targetDate: {
      type: DataTypes.DATEONLY,
    },
    description: {
      type: DataTypes.TEXT,
    },
    startDate: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: true,
    tableName: "targets",
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

User.hasOne(Target, { foreignKey: 'userId', onDelete: 'CASCADE' });
Target.belongsTo(User, { foreignKey: 'userId' });

export default Target;