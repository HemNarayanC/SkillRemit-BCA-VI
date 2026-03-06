import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * CourseEnrollment
 * Tracks jobseeker enrollments in training courses.
 * Free courses → enrolled instantly (no transaction).
 * Paid courses → enrolled only after Khalti payment is verified.
 */
const CourseEnrollment = sequelize.define('CourseEnrollment', {
  enrollment_id: {
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

  // FK to course_enrollment_transactions.transaction_id (null for free courses)
  transaction_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  // pending → awaiting payment | active → paid/free, can access course | completed → finished
  status: {
    type: DataTypes.ENUM(
      'pending',
      'active',
      'completed',
      'abandoned',
      'disputed',
      'refunded'
    ),
    defaultValue: 'pending',
  },

  // Set when status moves to 'active'
  enrolled_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  // Set when jobseeker marks the course as done
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  // Certificate URL generated on completion
  certificate_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },

  // Trainer confirms completion (escrow release trigger)
  trainer_confirmed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  // Seeker confirms they finished the course
  seeker_confirmed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

}, {
  tableName: 'course_enrollments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      name: 'uq_course_jobseeker',
      fields: ['course_id', 'jobseeker_id'],
    }
  ],
});

export default CourseEnrollment;