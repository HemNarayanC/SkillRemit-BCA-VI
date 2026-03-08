import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const AIJobMatch = sequelize.define('AIJobMatch', {
  match_id: {
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
  match_score: {
    type: DataTypes.DECIMAL(5, 2)
  },
  missing_skills: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  // Skills the seeker already has (for reference)
  matched_skills: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  // Per-skill similarity scores { skill_name: score }
  // skill_scores: {
  //   type: DataTypes.JSON,
  //   allowNull: true,
  //   defaultValue: {},
  // },
  can_apply: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  generated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'ai_job_matches',
  timestamps: false,
  indexes: [
    {
      unique: true,
      name: 'uq_job_seeker',
      fields: ['job_id', 'jobseeker_id']
    }
  ]
});

export default AIJobMatch;