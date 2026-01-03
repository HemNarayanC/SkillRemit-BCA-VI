import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const OTPVerification = sequelize.define(
  "OTPVerification",
  {
    otp_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    otp_code: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    is_used: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  },
  {
    tableName: "otp_verifications",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false
  }
);

export default OTPVerification;
