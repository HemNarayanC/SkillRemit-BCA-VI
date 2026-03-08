import dotenv from "dotenv";
dotenv.config();

import sequelize from "../config/database.js";

import User from "./User.js";
import OTPVerification from "./OTPVerification.js";
import JobSeeker from "./JobSeeker.js";
import Skill from "./Skill.js";
import JobSeekerSkill from "./JobSeekerSkill.js";
import Employer from "./Employer.js";
import Job from "./Job.js";
import JobRequiredSkill from "./JobRequiredSkill.js";
import JobApplication from "./JobApplication.js";
import AIJobMatch from "./AIJobMatch.js";
import Trainer from "./Trainer.js";
import TrainingCourse from "./TrainingCourse.js";
import CourseSkill from "./CourseSkill.js";
import CourseEnrollment from "./CourseEnrollment.js";
import CourseEnrollmentTransaction from "./CourseEnrollmentTransaction.js";
import RemittanceData from "./RemittanceData.js";
import Notification from "./Notification.js";
import PremiumTransaction from "./PremiumTransaction.js";
import HiringTransaction from "./HiringTransaction.js";
import PlatformSettings from "./PlatformSettings.js";

// ─── User → JobSeeker / Employer / Trainer (1:1) ──────────────────────────────
User.hasOne(JobSeeker, { foreignKey: "user_id", onDelete: "CASCADE" });
JobSeeker.belongsTo(User, { foreignKey: "user_id" });

User.hasOne(Employer, { foreignKey: "user_id", onDelete: "CASCADE" });
Employer.belongsTo(User, { foreignKey: "user_id" });

User.hasOne(Trainer, { foreignKey: "user_id", onDelete: "CASCADE" });
Trainer.belongsTo(User, { foreignKey: "user_id" });

// ─── User → PremiumTransactions (1:M) ────────────────────────────────────────
User.hasMany(PremiumTransaction, { foreignKey: "user_id", onDelete: "CASCADE" });
PremiumTransaction.belongsTo(User, { foreignKey: "user_id" });

// ─── JobSeeker ↔ Skills (Many-to-Many) ───────────────────────────────────────
JobSeeker.belongsToMany(Skill, { through: JobSeekerSkill, foreignKey: "jobseeker_id", otherKey: "skill_id", as: "skills" });
Skill.belongsToMany(JobSeeker, { through: JobSeekerSkill, foreignKey: "skill_id", otherKey: "jobseeker_id", as: "jobseekers" });

// ─── Employer → Jobs (1:M) ────────────────────────────────────────────────────
Employer.hasMany(Job, { foreignKey: "employer_id", onDelete: "CASCADE" });
Job.belongsTo(Employer, { foreignKey: "employer_id" });

// ─── Job ↔ Skills (Many-to-Many) ─────────────────────────────────────────────
Job.belongsToMany(Skill, { through: JobRequiredSkill, foreignKey: "job_id", otherKey: "skill_id" });
Skill.belongsToMany(Job, { through: JobRequiredSkill, foreignKey: "skill_id", otherKey: "job_id" });

// ─── JobSeeker ↔ Jobs through Applications (Many-to-Many) ────────────────────
JobSeeker.belongsToMany(Job, { through: JobApplication, foreignKey: "jobseeker_id", otherKey: "job_id" });
Job.belongsToMany(JobSeeker, { through: JobApplication, foreignKey: "job_id", otherKey: "jobseeker_id" });

// Direct associations for eager loading
JobSeeker.hasMany(JobApplication, { foreignKey: "jobseeker_id", onDelete: "CASCADE" });
JobApplication.belongsTo(JobSeeker, { foreignKey: "jobseeker_id" });

Job.hasMany(JobApplication, { foreignKey: "job_id", onDelete: "CASCADE" });
JobApplication.belongsTo(Job, { foreignKey: "job_id" });

// ─── Job ↔ JobSeeker through AIJobMatch (Many-to-Many) ───────────────────────
Job.belongsToMany(JobSeeker, { through: AIJobMatch, foreignKey: "job_id", otherKey: "jobseeker_id" });
JobSeeker.belongsToMany(Job, { through: AIJobMatch, foreignKey: "jobseeker_id", otherKey: "job_id" });

// Direct AIJobMatch associations (needed for ai_controller findAll queries)
Job.hasMany(AIJobMatch, { foreignKey: "job_id" });
AIJobMatch.belongsTo(Job, { foreignKey: "job_id" });
JobSeeker.hasMany(AIJobMatch, { foreignKey: "jobseeker_id" });
AIJobMatch.belongsTo(JobSeeker, { foreignKey: "jobseeker_id" });

// ─── Trainer → TrainingCourse (1:M) ──────────────────────────────────────────
Trainer.hasMany(TrainingCourse, { foreignKey: "trainer_id", onDelete: "CASCADE" });
TrainingCourse.belongsTo(Trainer, { foreignKey: "trainer_id" });

// ─── TrainingCourse ↔ Skills (Many-to-Many) ──────────────────────────────────
TrainingCourse.belongsToMany(Skill, { through: CourseSkill, foreignKey: "course_id", otherKey: "skill_id" });
Skill.belongsToMany(TrainingCourse, { through: CourseSkill, foreignKey: "skill_id", otherKey: "course_id" });

// ─── CourseEnrollment (JobSeeker enrolls in TrainingCourse) ──────────────────
JobSeeker.hasMany(CourseEnrollment, { foreignKey: "jobseeker_id", onDelete: "CASCADE" });
CourseEnrollment.belongsTo(JobSeeker, { foreignKey: "jobseeker_id" });

TrainingCourse.hasMany(CourseEnrollment, { foreignKey: "course_id", onDelete: "CASCADE" });
CourseEnrollment.belongsTo(TrainingCourse, { foreignKey: "course_id" });

// ─── CourseEnrollmentTransaction ─────────────────────────────────────────────
CourseEnrollmentTransaction.hasOne(CourseEnrollment, { foreignKey: "transaction_id" });
CourseEnrollment.belongsTo(CourseEnrollmentTransaction, { foreignKey: "transaction_id" });

TrainingCourse.hasMany(CourseEnrollmentTransaction, { foreignKey: "course_id" });
CourseEnrollmentTransaction.belongsTo(TrainingCourse, { foreignKey: "course_id" });

JobSeeker.hasMany(CourseEnrollmentTransaction, { foreignKey: "jobseeker_id" });
CourseEnrollmentTransaction.belongsTo(JobSeeker, { foreignKey: "jobseeker_id" });

Trainer.hasMany(CourseEnrollmentTransaction, { foreignKey: "trainer_id" });
CourseEnrollmentTransaction.belongsTo(Trainer, { foreignKey: "trainer_id" });

// ─── Notifications → User (1:M) ───────────────────────────────────────────────
User.hasMany(Notification, { foreignKey: "user_id", onDelete: "CASCADE" });
Notification.belongsTo(User, { foreignKey: "user_id" });

// ─── OTP → User (1:M) ────────────────────────────────────────────────────────
User.hasMany(OTPVerification, { foreignKey: "user_id", onDelete: "CASCADE" });
OTPVerification.belongsTo(User, { foreignKey: "user_id" });

JobApplication.hasOne(HiringTransaction, { foreignKey: "application_id", onDelete: "CASCADE" });
HiringTransaction.belongsTo(JobApplication, { foreignKey: "application_id" });

Job.hasMany(HiringTransaction, { foreignKey: "job_id" });
HiringTransaction.belongsTo(Job, { foreignKey: "job_id" });

Employer.hasMany(HiringTransaction, { foreignKey: "employer_id" });
HiringTransaction.belongsTo(Employer, { foreignKey: "employer_id" });

JobSeeker.hasMany(HiringTransaction, { foreignKey: "jobseeker_id" });
HiringTransaction.belongsTo(JobSeeker, { foreignKey: "jobseeker_id" });

User.hasMany(CourseEnrollment, { foreignKey: "jobseeker_id" });
CourseEnrollment.belongsTo(User, { foreignKey: "jobseeker_id" });

User.hasMany(PlatformSettings, { foreignKey: "updated_by", onDelete: "SET NULL" });
PlatformSettings.belongsTo(User, { foreignKey: "updated_by" });

export {
  User,
  OTPVerification,
  JobSeeker,
  Skill,
  JobSeekerSkill,
  Employer,
  Job,
  JobRequiredSkill,
  JobApplication,
  AIJobMatch,
  Trainer,
  TrainingCourse,
  CourseSkill,
  CourseEnrollment,
  CourseEnrollmentTransaction,
  RemittanceData,
  Notification,
  PremiumTransaction,
  PlatformSettings
};

export default sequelize;