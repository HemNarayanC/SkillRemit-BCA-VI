import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Job = sequelize.define('Job', {
  job_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  employer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING(100)
  },
  salary_min: {
    type: DataTypes.DECIMAL(10,2)
  },
  salary_max: {
    type: DataTypes.DECIMAL(10,2)
  },
  image: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  skills_required: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('open','closed'),
    defaultValue: 'open'
  }
}, {
  tableName: 'jobs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'created_at'
});

export default Job;
