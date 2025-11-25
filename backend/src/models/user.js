import { DataTypes } from "sequelize";
import db from "../config/database.js";

const User = db.define(
  "User",
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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6, 100],
      },
    },
    initialBalance: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    currentBalance: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    currency: {
      type: DataTypes.ENUM("USD", "IDR", "CENT"),
      defaultValue: "USD",
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 4, // user
    },
    status: {
      type: DataTypes.ENUM("active", "suspended", "inactive", "pending"),
      defaultValue: "pending",
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Timestamp login terakhir",
    },
    resetOtp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetOtpExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    emailVerificationToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    emailVerificationExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  },
  {
    timestamps: true,
    tableName: "users",
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default User;