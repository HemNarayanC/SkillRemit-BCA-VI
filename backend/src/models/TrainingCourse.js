import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const TrainingCourse = sequelize.define('TrainingCourse', {
  course_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  trainer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  difficulty: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
  },
  duration: {
    type: DataTypes.STRING(50),
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    // null or 0 = free course
  },
  language: {
    type: DataTypes.ENUM('en', 'ne'),
  },
  enrollment_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'training_courses',
  timestamps: false,
});

export default TrainingCourse;