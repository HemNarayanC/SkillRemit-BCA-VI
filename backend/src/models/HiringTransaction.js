import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const HiringTransaction = sequelize.define('HiringTransaction', {
  hiring_txn_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  // One fee record per hire
  application_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },

  // Denormalised for fast admin queries — no joins needed for earnings reports
  job_id: { type: DataTypes.INTEGER, allowNull: false },
  employer_id: { type: DataTypes.INTEGER, allowNull: false },
  jobseeker_id: { type: DataTypes.INTEGER, allowNull: false },

  // Fee in paisa (NPR × 100). 0 when waived.
  fee_paisa: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },

  // Was the employer on premium plan at the exact moment of hire?
  was_premium: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  status: {
    type: DataTypes.ENUM('pending', 'waived', 'paid', 'failed', 'completed', 'initiated'),
    defaultValue: 'pending',
  },

  // Khalti pidx — populated when employer initiates the Khalti payment
  pidx: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true,
  },

  // Khalti full verification response — saved on payment success
  khalti_response: {
    type: DataTypes.JSON,
    allowNull: true,
  },

  paid_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  hired_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'hiring_transactions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default HiringTransaction;