import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

/**
 * PremiumTransaction
 * Tracks Khalti payment attempts for JobSeeker premium upgrades.
 * role: "jobseeker" | "employer"  (extensible for employer premium later)
 */
const PremiumTransaction = sequelize.define(
  "PremiumTransaction",
  {
    transaction_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // who is paying
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      onDelete: "CASCADE",
    },

    // jobseeker_id or employer_id (nullable; resolved after lookup)
    profile_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    role: {
      type: DataTypes.ENUM("jobseeker", "employer"),
      allowNull: false,
      defaultValue: "jobseeker",
    },

    // Khalti fields
    pidx: {
      type: DataTypes.STRING(100),
      allowNull: true,       // set after Khalti initiation
      unique: true,
    },
    purchase_order_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    // amount in paisa (NPR × 100)
    amount_paisa: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // "Initiated" | "Completed" | "Failed" | "Expired"
    status: {
      type: DataTypes.ENUM("Initiated", "Completed", "Failed", "Expired"),
      defaultValue: "Initiated",
    },

    // plan purchased, e.g. "premium_monthly", "premium_yearly"
    plan: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "premium_monthly",
    },

    // snapshot of Khalti customer info
    khalti_customer: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    // full Khalti lookup response saved on verification
    khalti_response: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    paid_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "premium_transactions",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default PremiumTransaction;