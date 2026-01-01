import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const JobSeeker = sequelize.define('JobSeeker', {
  jobseeker_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    // references: { model: User, key: 'user_id' }
  },
  current_location: {
    type: DataTypes.ENUM('nepal', 'abroad'),
    allowNull: false
  },
  remittance_district: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  skill_description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  years_of_experience: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  document_urls: {
    type: DataTypes.JSON, // store multiple file URLs
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'job_seekers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default JobSeeker;
