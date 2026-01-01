import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const JobSeekerSkill = sequelize.define('JobSeekerSkill', {
  jobseeker_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    // references: { model: JobSeeker, key: 'jobseeker_id' }
  },
  skill_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    // references: { model: Skills, key: 'skill_id' }
  },
  proficiency_level: {
    type: DataTypes.ENUM('basic','intermediate','advanced'),
    defaultValue: 'basic'
  }
}, {
  tableName: 'job_seeker_skills',
  timestamps: false
});

export default JobSeekerSkill;
