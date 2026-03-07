import { Op, Sequelize } from "sequelize";
import { CourseEnrollment, CourseEnrollmentTransaction, Employer, Job, JobApplication, JobSeeker, PremiumTransaction, Skill, Trainer, TrainingCourse, User } from "../models/index.js";
import HiringTransaction from "../models/HiringTransaction.js";

const ABANDON_RELEASE_DAYS = parseInt(process.env.ABANDON_RELEASE_DAYS || '7');

// Get all employers (optionally filtered by verification status)
const listAllEmployers = async (req, res) => {
  try {
    const { status } = req.query;

    const where = status ? { verification_status: status } : {};

    const employers = await Employer.findAll({
      where,
      include: [
        {
          model: User,
          attributes: [
            "user_id",
            "name",
            "email",
            "phone",
            "profile_image",
            "language",
            "is_verified"
          ]
        }
      ]
    });

    console.log("List employers:", employers.map((e) => e.toJSON()));

    return res.json(employers.map((e) => e.toJSON()));
  } catch (err) {
    console.error("List employers error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Verify or reject employer
const verifyEmployer = async (req, res) => {
  try {
    const { employer_id } = req.params;
    const { status, note } = req.body; // status: verified / rejected

    const employer = await Employer.findByPk(employer_id);
    if (!employer) return res.status(404).json({ message: 'Employer not found' });

    employer.verification_status = status;
    employer.verified_at = new Date();
    employer.verified_by = req.user.user_id; // Admin ID
    employer.verification_note = note;

    await employer.save();
    return res.json({ message: 'Employer verification updated', employer });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get all jobs (optional filter by status)
const listAllJobs = async (req, res) => {
  try {
    const { status } = req.query; // optional: open / closed
    const where = status ? { status } : {};

    const jobs = await Job.findAll({ where });
    return res.json(jobs);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

//create and add the skill
const addSkill = async (req, res) => {
  try {
    const { name } = req.body;
    const skill = await Skill.create({ name });
    return res.status(201).json({ message: 'Skill added', skill });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const listAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    return res.json(users);
  } catch (err) {
    console.error("List users error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const listAllJobSeekers = async (req, res) => {
  try {
    const { status } = req.query; // optional: pending / verified / rejected
    console.log("List jobseekers called with status:", status);

    const whereUser = {
      [Op.and]: [
        Sequelize.literal(`JSON_CONTAINS(roles, '"jobseeker"')`)
      ]
    };
    if (status) {
      whereUser.is_verified = status === "verified" ? true : false;
    }

    const jobSeekers = await JobSeeker.findAll({
      include: [
        {
          model: User,
          attributes: [
            "user_id",
            "name",
            "email",
            "phone",
            "profile_image",
            "language",
            "is_verified",
            "created_at"
          ],
          where: whereUser
        }
      ]
    });

    // Normalize for frontend
    // const normalized = jobSeekers.map((js) => {
    //   const user = js.User?.toJSON() || {};
    //   return {
    //     id: js.jobseeker_id,
    //     name: user.name || "—",
    //     email: user.email || "—",
    //     phone: user.phone || "—",
    //     profile_image: user.profile_image || null,
    //     language: user.language || "en",
    //     is_verified: user.is_verified || false,
    //     role: "jobseeker",
    //     jobseeker: {
    //       current_location: js.current_location,
    //       remittance_district: js.remittance_district,
    //       skill_description: js.skill_description,
    //       years_of_experience: js.years_of_experience,
    //       document_urls: js.document_urls || [],
    //       created_at: js.created_at
    //     }
    //   };
    // });

    console.log("List jobseekers:", jobSeekers.map((js) => js.toJSON()));

    return res.json(jobSeekers.map((js) => js.toJSON()));
  } catch (err) {
    console.error("List jobseekers error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// ─── INTERNAL: reuse same escrow release logic ────────────────────────────────
const _releaseEscrow = async (transactionId, reason = 'admin_release') => {
  await CourseEnrollmentTransaction.update(
    { escrow_released: true, escrow_released_at: new Date(), status: 'Released' },
    { where: { transaction_id: transactionId } }
  );
};

// Full enrollment include config — reused across queries
const _enrollmentIncludes = () => [
  {
    model: TrainingCourse,
    attributes: ['course_id', 'title', 'price'],
    include: [
      {
        model: Trainer,
        attributes: ['trainer_id'],
        include: [{ model: User, attributes: ['name', 'email'] }],
      },
    ],
  },
  {
    model: CourseEnrollmentTransaction,
    required: false,
    attributes: [
      'transaction_id', 'amount_paisa', 'platform_fee_paisa', 'trainer_payout_paisa',
      'status', 'escrow_released', 'escrow_released_at', 'paid_at', 'purchase_order_id',
    ],
  },
  {
    model: JobSeeker,
    attributes: ['jobseeker_id'],
    include: [{ model: User, attributes: ['name', 'email'] }],
  },
];

// ─── GET /admin/enrollments ───────────────────────────────────────────────────
const adminGetAllEnrollments = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await CourseEnrollment.findAndCountAll({
      where,
      include: _enrollmentIncludes(),
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    // Escrow summary
    const allEnrollments = await CourseEnrollment.findAll({
      include: [{ model: CourseEnrollmentTransaction, required: false }],
    });

    const escrowHeld = allEnrollments
      .filter(e => e.CourseEnrollmentTransaction && !e.CourseEnrollmentTransaction.escrow_released && e.CourseEnrollmentTransaction.status === 'Completed')
      .reduce((s, e) => s + (e.CourseEnrollmentTransaction?.amount_paisa || 0), 0);

    const escrowReleased = allEnrollments
      .filter(e => e.CourseEnrollmentTransaction?.escrow_released)
      .reduce((s, e) => s + (e.CourseEnrollmentTransaction?.amount_paisa || 0), 0);

    return res.json({
      enrollments: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
      summary: {
        total: count,
        active: allEnrollments.filter(e => e.status === 'active').length,
        completed: allEnrollments.filter(e => e.status === 'completed').length,
        disputed: allEnrollments.filter(e => e.status === 'disputed').length,
        abandoned: allEnrollments.filter(e => e.status === 'abandoned').length,
        pending: allEnrollments.filter(e => e.status === 'pending').length,
        escrow_held_npr: escrowHeld / 100,
        escrow_released_npr: escrowReleased / 100,
      },
    });
  } catch (err) {
    console.error('adminGetAllEnrollments error:', err.message);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// ─── GET /admin/enrollments/disputes ─────────────────────────────────────────
const adminGetDisputedEnrollments = async (req, res) => {
  try {
    const enrollments = await CourseEnrollment.findAll({
      where: { status: 'disputed' },
      include: _enrollmentIncludes(),
      order: [['updated_at', 'DESC']],
    });
    return res.json({ enrollments, total: enrollments.length });
  } catch (err) {
    console.error('adminGetDisputedEnrollments error:', err.message);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// ─── GET /admin/enrollments/abandoned ────────────────────────────────────────
const adminGetAbandonedEnrollments = async (req, res) => {
  try {
    const enrollments = await CourseEnrollment.findAll({
      where: { status: 'abandoned' },
      include: _enrollmentIncludes(),
      order: [['updated_at', 'DESC']],
    });

    // Annotate with time remaining until auto-release
    const annotated = enrollments.map(e => {
      const plain = e.toJSON();
      const abandonedAt = plain.abandoned_at || plain.updated_at;
      const releaseAt = new Date(new Date(abandonedAt).getTime() + ABANDON_RELEASE_DAYS * 86_400_000);
      const msLeft = releaseAt - Date.now();
      plain._days_until_auto_release = Math.max(0, Math.ceil(msLeft / 86_400_000));
      plain._auto_release_date = releaseAt.toISOString();
      plain._overdue = msLeft <= 0;
      return plain;
    });

    return res.json({ enrollments: annotated, total: annotated.length });
  } catch (err) {
    console.error('adminGetAbandonedEnrollments error:', err.message);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// ─── POST /admin/enrollments/:enrollment_id/release ──────────────────────────
const adminReleaseEscrow = async (req, res) => {
  try {
    const { enrollment_id } = req.params;
    const { decision, notes } = req.body;

    if (!['release_to_trainer', 'refund_to_seeker'].includes(decision)) {
      return res.status(400).json({ message: "decision must be 'release_to_trainer' or 'refund_to_seeker'" });
    }

    const enrollment = await CourseEnrollment.findByPk(enrollment_id, {
      include: _enrollmentIncludes(),
    });
    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found.' });

    if (decision === 'release_to_trainer') {
      await enrollment.update({ status: 'completed', completed_at: new Date() });
      if (enrollment.transaction_id) {
        await _releaseEscrow(enrollment.transaction_id, 'admin_release_to_trainer');
        if (notes) {
          await CourseEnrollmentTransaction.update(
            { admin_notes: notes },
            { where: { transaction_id: enrollment.transaction_id } }
          );
        }
      }
      return res.json({
        message: 'Escrow released to trainer by admin.',
        decision,
        enrollment_id,
        trainer_payout_npr: enrollment.CourseEnrollmentTransaction
          ? enrollment.CourseEnrollmentTransaction.trainer_payout_paisa / 100
          : 0,
      });
    } else {
      await enrollment.update({ status: 'refunded' });
      if (enrollment.transaction_id) {
        await CourseEnrollmentTransaction.update(
          { status: 'refunded', escrow_released: false, ...(notes ? { admin_notes: notes } : {}) },
          { where: { transaction_id: enrollment.transaction_id } }
        );
      }
      return res.json({
        message: 'Refund issued to jobseeker by admin.',
        decision,
        enrollment_id,
        refund_amount_npr: enrollment.CourseEnrollmentTransaction
          ? enrollment.CourseEnrollmentTransaction.amount_paisa / 100
          : 0,
      });
    }
  } catch (err) {
    console.error('adminReleaseEscrow error:', err.message);
    return res.status(500).json({ message: 'Server error.' });
  }
};

const getPlatformStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const last7Days = new Date(Date.now() - 7 * 86_400_000);

    // ── Parallel KPI counts ───────────────────────────────────────────────────
    const [
      totalUsers, newUsersThisWeek,
      jobSeekerCount, employerCount, trainerCount,
      openJobs, activeCourses, totalSkills,
      enrollmentsMTD, completedEnrollments, disputedEnrollments, abandonedEnrollments,
      pendingTrainers, pendingEmployers,
      premiumSeekers, premiumEmployers,
      totalHires, hiresThisMonth,
      totalApplications,
    ] = await Promise.all([
      User.count(),
      User.count({ where: { created_at: { [Op.gte]: last7Days } } }),
      JobSeeker.count(),
      Employer.count(),
      Trainer.count(),
      Job.count({ where: { status: 'open' } }),
      TrainingCourse.count({ where: { is_active: true } }),
      Skill.count(),
      CourseEnrollment.count({ where: { enrolled_at: { [Op.gte]: startOfMonth } } }),
      CourseEnrollment.count({ where: { status: 'completed' } }),
      CourseEnrollment.count({ where: { status: 'disputed' } }),
      CourseEnrollment.count({ where: { status: 'abandoned' } }),
      Trainer.count({ where: { verification_status: 'pending' } }),
      Employer.count({ where: { verification_status: 'pending' } }),
      JobSeeker.count({ where: { is_premium: true } }),
      Employer.count({ where: { is_premium: true } }),
      JobApplication.count({ where: { status: 'hired' } }),
      JobApplication.count({ where: { status: 'hired', applied_at: { [Op.gte]: startOfMonth } } }),
      JobApplication.count(),
    ]);

    // ── REVENUE STREAM 1: Course platform fees (20% of each enrollment) ───────
    // ── REVENUE STREAM 1: Course platform fees (20% of each enrollment) ───────
    // CourseEnrollmentTransaction.status ENUM is lowercase: initiated/completed/released/failed etc.
    // escrow_released_at is the release timestamp; fall back to paid_at for MTD filtering on released rows.
    const escrowRaw = await CourseEnrollmentTransaction.findAll({
      attributes: ['amount_paisa', 'platform_fee_paisa', 'trainer_payout_paisa', 'escrow_released', 'status', 'paid_at', 'escrow_released_at'],
    });

    // Escrow held = completed payments not yet released
    const escrowHeld = escrowRaw
      .filter(t => !t.escrow_released && t.status === 'completed')
      .reduce((s, t) => s + (t.amount_paisa || 0), 0);

    // Escrow released MTD — use escrow_released_at as the release date
    const escrowReleasedMTD = escrowRaw
      .filter(t => t.escrow_released && t.escrow_released_at && new Date(t.escrow_released_at) >= startOfMonth)
      .reduce((s, t) => s + (t.trainer_payout_paisa || 0), 0);

    // Disputed/abandoned funds
    const escrowDisputedValue = escrowRaw
      .filter(t => !t.escrow_released && ['disputed', 'abandoned'].includes(t.status))
      .reduce((s, t) => s + (t.amount_paisa || 0), 0);

    // Total enrolled (paid) MTD
    const totalEscrowMTD = escrowRaw
      .filter(t => t.paid_at && new Date(t.paid_at) >= startOfMonth && t.status === 'completed')
      .reduce((s, t) => s + (t.amount_paisa || 0), 0);

    // Platform keeps platform_fee_paisa (20%) only on released transactions
    // Store in paisa internally; convert to NPR only at response boundary
    const courseFeeEarningsPaisa = escrowRaw.filter(t => t.escrow_released).reduce((s, t) => s + (t.platform_fee_paisa || 0), 0);
    const courseFeeEarningsMTDPaisa = escrowRaw
      .filter(t => t.escrow_released && t.escrow_released_at && new Date(t.escrow_released_at) >= startOfMonth)
      .reduce((s, t) => s + (t.platform_fee_paisa || 0), 0);

    // Convert course fees to NPR once
    const courseFeeEarningsNpr = courseFeeEarningsPaisa / 100;
    const courseFeeEarningsMTDNpr = courseFeeEarningsMTDPaisa / 100;

    // ── REVENUE STREAM 2: Hiring fees from employers ──────────────────────────
    // HiringTransaction.status ENUM: 'initiated' | 'completed' | 'waived' | 'failed' | 'pending' | 'paid'
    // Hiring controller (v6) writes: 'initiated' on create, 'completed' after Khalti verify.
    // Count only actually-paid hires (completed) as confirmed revenue.
    // Count initiated (pending payment) separately.
    const hiringTxns = await HiringTransaction.findAll({
      attributes: ['fee_paisa', 'status', 'hired_at', 'created_at'],
    });

    // Confirmed revenue: status = 'completed' OR 'paid' (legacy)
    const HIRING_PAID_STATUSES = ['completed', 'paid'];
    const HIRING_PENDING_STATUSES = ['initiated', 'pending'];

    const hiringFeePaidPaisa = hiringTxns.filter(t => HIRING_PAID_STATUSES.includes(t.status)).reduce((s, t) => s + (t.fee_paisa || 0), 0);
    const hiringFeePendingPaisa = hiringTxns.filter(t => HIRING_PENDING_STATUSES.includes(t.status)).reduce((s, t) => s + (t.fee_paisa || 0), 0);

    const hiringFeePaidMTDPaisa = hiringTxns.filter(t => {
      const d = t.hired_at || t.created_at;
      return HIRING_PAID_STATUSES.includes(t.status) && d && new Date(d) >= startOfMonth;
    }).reduce((s, t) => s + (t.fee_paisa || 0), 0);

    // Convert hiring fees to NPR once
    const hiringFeePaidNpr = hiringFeePaidPaisa / 100;
    const hiringFeePendingNpr = hiringFeePendingPaisa / 100;
    const hiringFeePaidMTDNpr = hiringFeePaidMTDPaisa / 100;

    // Total hiring earnings = confirmed paid only (pending is not yet received)
    const hiringFeeEarningsNpr = hiringFeePaidNpr;
    const hiringFeeEarningsMTDNpr = hiringFeePaidMTDNpr;

    // ── REVENUE STREAM 3: Premium subscriptions ───────────────────────────────
    // PremiumTransaction.status uses Title-case ENUM: "Initiated" | "Completed" | "Failed" | "Expired"
    const premiumTxns = await PremiumTransaction.findAll({
      where: { status: 'Completed' },
      attributes: ['amount_paisa', 'paid_at', 'role'],
    });

    const premiumEarningsPaisa = premiumTxns.reduce((s, t) => s + (t.amount_paisa || 0), 0);
    const premiumEarningsMTDPaisa = premiumTxns.filter(t => t.paid_at && new Date(t.paid_at) >= startOfMonth).reduce((s, t) => s + (t.amount_paisa || 0), 0);
    const premiumSeekerRevPaisa = premiumTxns.filter(t => t.role === 'jobseeker').reduce((s, t) => s + (t.amount_paisa || 0), 0);
    const premiumEmployerRevPaisa = premiumTxns.filter(t => t.role === 'employer').reduce((s, t) => s + (t.amount_paisa || 0), 0);

    // Convert premium to NPR once
    const premiumEarningsNpr = premiumEarningsPaisa / 100;
    const premiumEarningsMTDNpr = premiumEarningsMTDPaisa / 100;
    const premiumSeekerRevNpr = premiumSeekerRevPaisa / 100;
    const premiumEmployerRevNpr = premiumEmployerRevPaisa / 100;

    // ── TOTAL PLATFORM EARNINGS — all in NPR ─────────────────────────────────
    // All three streams are now in NPR before adding — no unit mismatch.
    const totalPlatformEarnings = courseFeeEarningsNpr + hiringFeeEarningsNpr + premiumEarningsNpr;
    const totalPlatformEarningsMTD = courseFeeEarningsMTDNpr + hiringFeeEarningsMTDNpr + premiumEarningsMTDNpr;

    // ── Monthly chart — last 6 months, all 3 revenue streams ─────────────────
    const monthlyEarnings = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const dEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const label = d.toLocaleString('en-US', { month: 'short' });

      const mEscrow = escrowRaw.filter(t => {
        // Use release date for course fees so the month matches when money was earned
        const dt = t.escrow_released ? (t.escrow_released_at || t.paid_at) : t.paid_at;
        return dt && new Date(dt) >= d && new Date(dt) < dEnd;
      });
      const mHiring = hiringTxns.filter(t => { const dt = t.hired_at || t.created_at; return dt && new Date(dt) >= d && new Date(dt) < dEnd; });
      const mPremium = premiumTxns.filter(t => t.paid_at && new Date(t.paid_at) >= d && new Date(t.paid_at) < dEnd);

      const courseFee = mEscrow.filter(t => t.escrow_released).reduce((s, t) => s + (t.platform_fee_paisa || 0), 0) / 100;
      const hiringFee = mHiring.filter(t => HIRING_PAID_STATUSES.includes(t.status)).reduce((s, t) => s + (t.fee_paisa || 0), 0) / 100;
      const premiumFee = mPremium.reduce((s, t) => s + (t.amount_paisa || 0), 0) / 100;

      monthlyEarnings.push({ month: label, course_fees: courseFee, hiring_fees: hiringFee, premium: premiumFee, total: courseFee + hiringFee + premiumFee });
    }

    // Escrow chart kept separately for EscrowManagement page
    const monthlyEscrow = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const dEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const label = d.toLocaleString('en-US', { month: 'short' });
      const mTxns = escrowRaw.filter(t => t.paid_at && new Date(t.paid_at) >= d && new Date(t.paid_at) < dEnd);
      monthlyEscrow.push({
        month: label,
        // 'initiated' covers all non-failed payments in paisa
        initiated: mTxns.filter(t => t.status !== 'failed').reduce((s, t) => s + (t.amount_paisa || 0), 0),
        released: mTxns.filter(t => t.escrow_released).reduce((s, t) => s + (t.trainer_payout_paisa || 0), 0),
        disputed: mTxns.filter(t => ['disputed', 'abandoned'].includes(t.status)).reduce((s, t) => s + (t.amount_paisa || 0), 0),
      });
    }

    // ── Weekly activity (last 7 days) ─────────────────────────────────────────
    const weeklyActivity = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now); dayStart.setDate(now.getDate() - i); dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart); dayEnd.setDate(dayStart.getDate() + 1);
      const [dayUsers, dayJobs, dayEnrollments, dayHires] = await Promise.all([
        User.count({ where: { created_at: { [Op.between]: [dayStart, dayEnd] } } }),
        Job.count({ where: { created_at: { [Op.between]: [dayStart, dayEnd] } } }),
        CourseEnrollment.count({ where: { enrolled_at: { [Op.between]: [dayStart, dayEnd] } } }),
        JobApplication.count({ where: { status: 'hired', applied_at: { [Op.between]: [dayStart, dayEnd] } } }),
      ]);
      weeklyActivity.push({
        day: dayStart.toLocaleString('en-US', { weekday: 'short' }),
        users: dayUsers, jobs: dayJobs, enrollments: dayEnrollments, hires: dayHires,
      });
    }

    return res.json({
      kpis: {
        totalUsers, newUsersThisWeek,
        jobSeekerCount, employerCount, trainerCount,
        openJobs, activeCourses, totalSkills,
        enrollmentsMTD, completedEnrollments, disputedEnrollments, abandonedEnrollments,
        pendingTrainers, pendingEmployers,
        premiumSeekers, premiumEmployers, premiumTotal: premiumSeekers + premiumEmployers,
        totalHires, hiresThisMonth, totalApplications,
      },

      // ── Platform Earnings — all 3 revenue streams ─────────────────────────
      earnings: {
        // Grand totals — all in NPR
        total_npr: totalPlatformEarnings,
        mtd_npr: totalPlatformEarningsMTD,

        // Stream 1: course escrow fees (platform's 20% cut of released enrollments)
        course_fees: {
          total_npr: courseFeeEarningsNpr,
          mtd_npr: courseFeeEarningsMTDNpr,
          description: '20% platform cut on each released course enrollment',
        },

        // Stream 2: hiring fees from employers per successful hire
        hiring_fees: {
          total_npr: hiringFeeEarningsNpr,
          mtd_npr: hiringFeeEarningsMTDNpr,
          paid_npr: hiringFeePaidNpr,
          pending_npr: hiringFeePendingNpr,
          total_hires: hiringTxns.filter(t => HIRING_PAID_STATUSES.includes(t.status)).length,
          waived_hires: hiringTxns.filter(t => t.status === 'waived').length,
          fee_per_hire_npr: parseInt(process.env.HIRING_FEE_NPR ?? '500'),
          description: `NPR ${parseInt(process.env.HIRING_FEE_NPR ?? '500')} per hire (free employers); discounted for premium`,
        },

        // Stream 3: premium subscription payments
        premium: {
          total_npr: premiumEarningsNpr,
          mtd_npr: premiumEarningsMTDNpr,
          seeker_rev_npr: premiumSeekerRevNpr,
          employer_rev_npr: premiumEmployerRevNpr,
          total_subscribers: premiumSeekers + premiumEmployers,
          description: 'Khalti premium subscription fees from seekers & employers',
        },
      },

      escrow: {
        held_npr: escrowHeld / 100,
        released_mtd_npr: escrowReleasedMTD / 100,
        disputed_value_npr: escrowDisputedValue / 100,
        total_initiated_mtd_npr: totalEscrowMTD / 100,
      },

      charts: {
        weekly: weeklyActivity,
        monthlyEarnings,          // ← used by Dashboard earnings chart
        monthlyEscrow,            // ← used by EscrowManagement
        roleDistribution: [
          { name: 'Job Seekers', value: jobSeekerCount, color: '#6366F1' },
          { name: 'Employers', value: employerCount, color: '#10B981' },
          { name: 'Trainers', value: trainerCount, color: '#F59E0B' },
        ],
        earningsBreakdown: [
          { name: 'Course Fees (20%)', value: courseFeeEarningsNpr, color: '#6366F1' },
          { name: 'Hiring Fees', value: hiringFeeEarningsNpr, color: '#10B981' },
          { name: 'Premium Subs', value: premiumEarningsNpr, color: '#F59E0B' },
        ],
      },
    });
  } catch (err) {
    console.error('getPlatformStats error:', err.message);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// ─── GET /admin/logs ──────────────────────────────────────────────────────────
const getSystemLogs = async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const half = Math.floor(parseInt(limit) / 2);

    const [escrowTxns, hiringTxns] = await Promise.all([
      CourseEnrollmentTransaction.findAll({
        order: [['created_at', 'DESC']], limit: half,
        attributes: ['transaction_id', 'status', 'escrow_released', 'amount_paisa', 'paid_at', 'created_at'],
      }),
      HiringTransaction.findAll({
        order: [['created_at', 'DESC']], limit: half,
        attributes: ['hiring_txn_id', 'status', 'fee_paisa', 'hired_at', 'created_at'],
        include: [{ model: Employer, attributes: ['company_name'] }],
      }),
    ]);

    const escrowLogs = escrowTxns.map(t => {
      let event = 'Payment Initiated', type = 'Payment', logStatus = 'Success';
      // CourseEnrollmentTransaction status ENUM is lowercase
      if (t.status === 'completed' && !t.escrow_released) { event = 'Course Payment Verified'; }
      if (t.status === 'completed' && t.escrow_released) { event = 'Escrow Released to Trainer'; type = 'Escrow'; }
      if (t.status === 'released') { event = 'Escrow Released to Trainer'; type = 'Escrow'; }
      if (t.status === 'refunded') { event = 'Refund Issued'; type = 'Escrow'; }
      if (t.status === 'disputed') { event = 'Dispute Raised'; type = 'Enrollment'; logStatus = 'Warning'; }
      if (t.status === 'abandoned') { event = 'Course Abandoned'; type = 'Enrollment'; logStatus = 'Warning'; }
      if (t.status === 'failed') { event = 'Payment Failed'; type = 'Payment'; logStatus = 'Error'; }
      return { id: `e-${t.transaction_id}`, event, user: '—', type, logStatus, time: t.paid_at || t.created_at, amount: t.amount_paisa ? `NPR ${(t.amount_paisa / 100).toLocaleString()}` : null };
    });

    const hiringLogs = hiringTxns.map(t => ({
      id: `h-${t.hiring_txn_id}`,
      // Hiring controller writes 'completed'/'initiated'/'waived' — handle all ENUM variants
      event: t.status === 'waived' ? 'Hire Fee Waived (Premium)' :
        ['completed', 'paid'].includes(t.status) ? 'Hiring Fee Paid' :
          t.status === 'failed' ? 'Hiring Fee Failed' :
            'Candidate Hired — Fee Pending',
      user: t.Employer?.company_name || 'Employer',
      type: 'Hiring',
      logStatus: t.status === 'failed' ? 'Error' :
        ['initiated', 'pending'].includes(t.status) ? 'Warning' :
          'Success',
      time: t.hired_at || t.created_at,
      // fee_paisa is the only fee field in the HiringTransaction model
      amount: t.fee_paisa ? `NPR ${(t.fee_paisa / 100).toLocaleString()}` : 'Waived',
    }));

    const logs = [...escrowLogs, ...hiringLogs]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, parseInt(limit))
      .map(({ logStatus: status, ...rest }) => ({ ...rest, status }));

    return res.json({ logs });
  } catch (err) {
    console.error('getSystemLogs error:', err.message);
    return res.status(500).json({ message: 'Server error.' });
  }
};

export {
  listAllEmployers,
  verifyEmployer,
  listAllJobs,
  listAllUsers,
  addSkill,
  listAllJobSeekers,
  adminGetAllEnrollments,
  adminGetDisputedEnrollments,
  adminGetAbandonedEnrollments,
  adminReleaseEscrow,
  getPlatformStats,
  getSystemLogs
}