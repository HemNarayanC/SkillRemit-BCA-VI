import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Employer = sequelize.define('Employer', {
  employer_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },

  company_name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },

  business_type: {
    type: DataTypes.ENUM('company', 'ngo', 'individual', 'government'),
    allowNull: false,
    defaultValue: 'company'
  },

  registration_number: {
    type: DataTypes.STRING(100)
  },

  registered_country: {
    type: DataTypes.STRING(100),
    defaultValue: 'Nepal'
  },

  address: {
    type: DataTypes.TEXT
  },

  document_type: {
    type: DataTypes.ENUM(
      'company_registration',
      'pan_vat',
      'license',
      'passport',
      'other'
    ),
    allowNull: false
  },

  document_urls: {
    type: DataTypes.JSON,
    allowNull: false
  },

  verification_status: {
    type: DataTypes.ENUM('pending', 'verified', 'rejected'),
    defaultValue: 'pending'
  },

  verified_at: {
    type: DataTypes.DATE
  },

  verified_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  verification_note: {
    type: DataTypes.TEXT
  },

  trust_score: {
    type: DataTypes.DECIMAL(4, 2),
    defaultValue: 0.00
  }

}, {
  tableName: 'employers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Employer;
