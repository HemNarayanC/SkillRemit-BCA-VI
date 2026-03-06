import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * CourseEnrollmentTransaction
 * Tracks Khalti payment attempts for course enrollment.
 * Mirrors the PremiumTransaction pattern for consistency.
 * Includes escrow: funds are held until both parties confirm completion.
 */
const CourseEnrollmentTransaction = sequelize.define('CourseEnrollmentTransaction', {
  transaction_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  course_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  jobseeker_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  trainer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  // Khalti payment identifier
  pidx: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true,
  },

  purchase_order_id: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },

  // Amount in paisa (NPR × 100)
  amount_paisa: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  // Platform fee (20% of amount_paisa)
  platform_fee_paisa: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },

  // Trainer payout (80% of amount_paisa)
  trainer_payout_paisa: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },

  // "Initiated" | "Completed" | "Failed" | "Expired" | "Released" | "Refunded" | "Disputed"
  status: {
    type: DataTypes.ENUM(
      'initiated',
      'completed',
      'failed',
      'expired',
      'released',
      'refunded',
      'disputed',
      'abandoned'
    ),
    defaultValue: 'initiated',
  },

  // Escrow: funds held until course completion confirmed
  escrow_released: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  escrow_released_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  khalti_customer: {
    type: DataTypes.JSON,
    allowNull: true,
  },

  khalti_response: {
    type: DataTypes.JSON,
    allowNull: true,
  },

  paid_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },

}, {
  tableName: 'course_enrollment_transactions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default CourseEnrollmentTransaction;