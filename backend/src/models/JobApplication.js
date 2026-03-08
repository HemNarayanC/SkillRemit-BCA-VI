import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const JobApplication = sequelize.define('JobApplication', {
  application_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  job_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    // references: { model: Job, key: 'job_id' }
  },
  jobseeker_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    // references: { model: JobSeeker, key: 'jobseeker_id' }
  },
  cover_letter: {
    type: DataTypes.TEXT
  },
  status: {
    type: DataTypes.ENUM('pending','shortlisted','rejected','hired'),
    defaultValue: 'pending'
  }
}, {
  tableName: 'job_applications',
  timestamps: true,
  createdAt: 'applied_at',
  updatedAt: false
});

export default JobApplication;
