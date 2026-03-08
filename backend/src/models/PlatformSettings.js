import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
const PlatformSettings = sequelize.define('PlatformSettings', {

  // ── Escrow & Payments ─────────────────────────────────────────────────────
  escrow_abandon_days: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 7,
    comment: 'Days after abandonment before escrow auto-releases to trainer'
  },
  platform_fee: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 20,
    comment: 'Percentage of course payment retained by the platform (0–100)'
  },
  auto_release: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Whether escrow auto-releases after escrow_abandon_days'
  },
  dispute_freezing: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Whether an active dispute prevents escrow auto-release'
  },

  // ── Hiring Fees ───────────────────────────────────────────────────────────
  // Stored in whole NPR. Controllers multiply × 100 to get paisa for Khalti.
  hiring_fee_npr: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 500,
    comment: 'Hiring fee in NPR charged to free-plan employers per hire'
  },
  hiring_fee_premium_npr: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 350,
    comment: 'Discounted hiring fee in NPR for premium employers per hire'
  },

  // ── Registration & Access ─────────────────────────────────────────────────
  seeker_registration: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Allow new job seekers to register'
  },
  employer_registration: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Allow new employers to register'
  },
  trainer_registration: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Allow new trainers to register'
  },
  require_otp: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Require OTP verification on sign-up'
  },
  premium_enabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Enable Khalti-based premium upgrades'
  },

  // ── AI Settings ───────────────────────────────────────────────────────────
  ai_matching: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Enable AI job-seeker matching engine'
  },
  ai_skill_analysis: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Enable AI skill gap analysis for job seekers'
  },
  free_ai_checks: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5,
    comment: 'Number of free AI checks available to non-premium users'
  },
  premium_ai_checks: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'unlimited',
    comment: 'AI checks for premium users — number or "unlimited"'
  },

  // ── Notifications ─────────────────────────────────────────────────────────
  email_notifications: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Send transactional emails'
  },
  admin_alerts: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Notify admins of pending verifications and escrow events'
  },
  dispute_alert: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Send immediate alert to admin when a dispute is raised'
  },

  // ── Platform ──────────────────────────────────────────────────────────────
  maintenance_mode: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Block all non-admin access when true'
  },
  platform_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'SkillRemit',
    comment: 'Platform name shown in emails and meta tags'
  },
  default_language: {
    type: DataTypes.ENUM('en', 'ne'),
    allowNull: false,
    defaultValue: 'en',
    comment: 'Default language for new users'
  }

}, {
  tableName: 'platform_settings',
  timestamps: true,
  createdAt: false,
  updatedAt: 'updated_at'
});

export default PlatformSettings;