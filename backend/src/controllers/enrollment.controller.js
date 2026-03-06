import axios from 'axios';
import { Op } from 'sequelize';
import {
  TrainingCourse, CourseEnrollment, CourseEnrollmentTransaction,
  Trainer, JobSeeker, User, Skill, JobSeekerSkill,
} from '../models/index.js';

const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;
const KHALTI_BASE_URL = process.env.KHALTI_BASE_URL;
const PLATFORM_FEE_PERCENT = parseFloat(process.env.PLATFORM_FEE_PERCENT || '20') / 100;
const ABANDON_RELEASE_DAYS = parseInt(process.env.ABANDON_RELEASE_DAYS || '7');

const _getSeeker = async (userId) => {
  return JobSeeker.findOne({ where: { user_id: userId } });
};

// ─── INTERNAL: release escrow funds ──────────────────────────────────────────
// Marks transaction as Released. In production, triggers bank disbursement.
const _releaseEscrow = async (transactionId, reason = 'confirmed') => {
  await CourseEnrollmentTransaction.update(
    {
      escrow_released: true,
      escrow_released_at: new Date(),
      status: 'Released',
      // release_reason field — add via migration if not present
    },
    { where: { transaction_id: transactionId } }
  );

  // ── PRODUCTION: uncomment and implement ──────────────────────────────────
  // const txn     = await CourseEnrollmentTransaction.findByPk(transactionId);
  // const trainer = await Trainer.findByPk(txn.trainer_id);
  // await _disbursePayout(trainer.bank_account, txn.trainer_payout_paisa, reason);
};

// ─── INTERNAL: auto-release abandoned enrollments past grace period ───────────
const _processExpiredAbandoned = async () => {
  try {
    const cutoff = new Date(Date.now() - ABANDON_RELEASE_DAYS * 86_400_000);

    // Find abandoned enrollments whose timer has expired and are not disputed
    const expired = await CourseEnrollment.findAll({
      where: {
        status: 'abandoned',
        // abandoned_at exists once migration is applied
      },
      include: [{
        model: CourseEnrollmentTransaction,
        where: { status: 'Abandoned' },
        required: true,
      }],
    });

    for (const enrollment of expired) {
      // Check if the abandoned_at field exists and has passed the grace period
      const abandonedAt = enrollment.dataValues.abandoned_at || enrollment.updated_at;
      if (!abandonedAt || new Date(abandonedAt) > cutoff) continue;

      await enrollment.update({ status: 'completed', completed_at: new Date() });
      await _releaseEscrow(enrollment.transaction_id, 'auto_release_after_abandonment');
    }
  } catch {
    // Silently fail — abandoned_at column may not exist yet in migration
  }
};

const getEnrollmentStatus = async (req, res) => {
  try {
    const { course_id } = req.params;
    const seeker = await _getSeeker(req.user.user_id);
    if (!seeker) return res.status(404).json({ message: 'JobSeeker profile not found.' });

    const enrollment = await CourseEnrollment.findOne({
      where: { course_id, jobseeker_id: seeker.jobseeker_id },
    });

    const course = await TrainingCourse.findByPk(course_id, {
      attributes: ['course_id', 'title', 'price', 'is_active'],
    });
    if (!course) return res.status(404).json({ message: 'Course not found.' });

    return res.json({
      is_enrolled: !!enrollment,
      enrollment_status: enrollment?.status || null,
      enrollment_id: enrollment?.enrollment_id || null,
      is_free: !course.price || parseFloat(course.price) === 0,
      course_price: course.price,
    });
  } catch (err) {
    console.error('getEnrollmentStatus error:', err.message);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// ─── POST /enrollments/courses/:course_id/enroll ─────────────────────────────
// For FREE courses: instantly enroll.
// For PAID courses: initiate Khalti payment and return payment_url.
const enrollCourse = async (req, res) => {
  try {
    const { course_id } = req.params;
    const userId = req.user.user_id;

    const seeker = await _getSeeker(userId);
    if (!seeker) return res.status(404).json({ message: 'JobSeeker profile not found.' });

    // Load course with trainer
    const course = await TrainingCourse.findByPk(course_id, {
      include: [{ model: Trainer }],
    });
    if (!course) return res.status(404).json({ message: 'Course not found.' });
    if (!course.is_active) return res.status(400).json({ message: 'Course is not accepting enrollments.' });

    // Check for existing enrollment
    const existing = await CourseEnrollment.findOne({
      where: { course_id, jobseeker_id: seeker.jobseeker_id },
    });
    if (existing) {
      if (existing.status === 'active' || existing.status === 'completed') {
        return res.status(400).json({ message: 'You are already enrolled in this course.' });
      }
      // Pending means payment was initiated — let them retry
    }

    const isFree = !course.price || parseFloat(course.price) === 0;

    // ── FREE COURSE: instant enrollment ──────────────────────────────────────
    if (isFree) {
      const enrollment = await CourseEnrollment.upsert({
        course_id,
        jobseeker_id: seeker.jobseeker_id,
        transaction_id: null,
        status: 'active',
        enrolled_at: new Date(),
      }, { conflictFields: ['course_id', 'jobseeker_id'] });

      // Increment cached enrollment count
      await TrainingCourse.increment('enrollment_count', { where: { course_id } });

      return res.status(201).json({
        message: 'Successfully enrolled in free course!',
        enrollment_id: enrollment[0].enrollment_id,
        status: 'active',
        is_free: true,
      });
    }

    // ── PAID COURSE: initiate Khalti payment ──────────────────────────────────
    const dbUser = await User.findByPk(userId, {
      attributes: ['user_id', 'name', 'email', 'phone'],
    });

    const amount_paisa = Math.round(parseFloat(course.price) * 100);
    const platform_fee_paisa = Math.round(amount_paisa * PLATFORM_FEE_PERCENT);
    const trainer_payout_paisa = amount_paisa - platform_fee_paisa;
    const purchase_order_id = `COURSE-${course_id}-${seeker.jobseeker_id}-${Date.now()}`;

    const khaltiPayload = {
      return_url: `${process.env.FRONTEND_URL}${process.env.KHALTI_RETURN_URL}` || 'http://localhost:5173/payment/success',
      website_url: process.env.KHALTI_WEBSITE_URL || 'http://localhost:5173',
      amount: amount_paisa,
      purchase_order_id,
      purchase_order_name: `Enrollment: ${course.title}`,
      customer_info: {
        name: dbUser.name || 'User',
        email: dbUser.email || 'user@example.com',
        phone: dbUser.phone || '9800000000',
      },
      product_details: [{
        identity: purchase_order_id,
        name: course.title,
        total_price: amount_paisa,
        quantity: 1,
        unit_price: amount_paisa,
      }],
    };

    const { data: khaltiData } = await axios.post(
      `${KHALTI_BASE_URL}/initiate/`,
      khaltiPayload,
      { headers: { Authorization: `Key ${KHALTI_SECRET_KEY}`, 'Content-Type': 'application/json' } }
    );

    // Create transaction record
    const txn = await CourseEnrollmentTransaction.create({
      course_id,
      jobseeker_id: seeker.jobseeker_id,
      trainer_id: course.Trainer.trainer_id,
      user_id: userId,
      pidx: khaltiData.pidx,
      purchase_order_id,
      amount_paisa,
      platform_fee_paisa,
      trainer_payout_paisa,
      status: 'Initiated',
      khalti_customer: { name: dbUser.name, email: dbUser.email, phone: dbUser.phone },
    });

    // Create pending enrollment record
    await CourseEnrollment.upsert({
      course_id,
      jobseeker_id: seeker.jobseeker_id,
      transaction_id: txn.transaction_id,
      status: 'pending',
    }, { conflictFields: ['course_id', 'jobseeker_id'] });

    return res.status(200).json({
      message: 'Payment initiated. Redirect user to payment_url.',
      pidx: khaltiData.pidx,
      payment_url: khaltiData.payment_url,
      course_title: course.title,
      amount_npr: parseFloat(course.price),
    });

  } catch (err) {
    console.error('enrollCourse error:', err.message);
    return res.status(500).json({ message: 'Failed to initiate enrollment payment.' });
  }
};

// ─── GET /enrollments/verify?pidx=XXX ────────────────────────────────────────
// Called by Khalti redirect or frontend after payment.
// Verifies payment, activates enrollment, records escrow.
const verifyEnrollmentPayment = async (req, res) => {
  try {
    const { pidx } = req.query;
    if (!pidx) return res.status(400).json({ message: 'pidx query parameter is required.' });

    // Verify with Khalti
    const { data: khaltiData } = await axios.post(
      `${KHALTI_BASE_URL}/lookup/`,
      { pidx },
      { headers: { Authorization: `Key ${KHALTI_SECRET_KEY}` } }
    );

    if (khaltiData.status !== 'Completed') {
      return res.status(400).json({
        message: `Payment not completed. Status: ${khaltiData.status}`,
        khalti_status: khaltiData.status,
      });
    }

    // Find our transaction record
    const txn = await CourseEnrollmentTransaction.findOne({ where: { pidx } });
    if (!txn) return res.status(404).json({ message: 'Transaction not found.' });

    // Already processed
    if (txn.status === 'Completed') {
      return res.json({ message: 'Already verified.', already_enrolled: true });
    }

    // Update transaction
    await txn.update({
      status: 'Completed',
      paid_at: new Date(),
      khalti_response: khaltiData,
    });

    // Activate enrollment
    await CourseEnrollment.update(
      { status: 'active', enrolled_at: new Date() },
      { where: { course_id: txn.course_id, jobseeker_id: txn.jobseeker_id } }
    );

    // Increment cached enrollment count
    await TrainingCourse.increment('enrollment_count', { where: { course_id: txn.course_id } });

    const course = await TrainingCourse.findByPk(txn.course_id, {
      attributes: ['course_id', 'title'],
    });

    return res.status(200).json({
      message: 'Payment verified! Enrollment activated.',
      course_id: txn.course_id,
      course_title: course?.title,
      is_enrolled: true,
      paid_at: txn.paid_at,
      // Escrow info: funds are held until completion confirmed
      escrow_note: 'Payment held in escrow. Released to trainer upon course completion confirmation.',
    });

  } catch (err) {
    console.error('verifyEnrollmentPayment error:', err.message);
    return res.status(400).json({ message: err.message || 'Payment verification failed.' });
  }
};

// ─── POST /enrollments/:enrollment_id/confirm-completion ─────────────────────
// Both seeker AND trainer must confirm → escrow released, certificate issued.
const confirmCompletion = async (req, res) => {
  try {
    const { enrollment_id } = req.params;
    const userId = req.user.user_id;
    const role = req.user.current_role;

    const enrollment = await CourseEnrollment.findByPk(enrollment_id, {
      include: [{ model: TrainingCourse, include: [{ model: Trainer }] }],
    });
    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found.' });
    if (enrollment.status !== 'active') {
      return res.status(400).json({ message: 'Enrollment is not active.' });
    }

    if (role === 'jobseeker') {
      const seeker = await _getSeeker(userId);
      if (!seeker || seeker.jobseeker_id !== enrollment.jobseeker_id) {
        return res.status(403).json({ message: 'Not your enrollment.' });
      }
      await enrollment.update({ seeker_confirmed: true });

    } else if (role === 'trainer') {
      const trainer = await Trainer.findOne({ where: { user_id: userId } });
      if (!trainer || trainer.trainer_id !== enrollment.TrainingCourse?.Trainer?.trainer_id) {
        return res.status(403).json({ message: 'Not your course.' });
      }
      await enrollment.update({ trainer_confirmed: true });

    } else {
      return res.status(403).json({ message: 'Only seekers or trainers can confirm completion.' });
    }

    await enrollment.reload();

    // ── Both confirmed → release escrow + certificate + skills ───────────────
    if (enrollment.seeker_confirmed && enrollment.trainer_confirmed) {
      const certificateUrl = `${process.env.FRONTEND_URL}/certificates/${enrollment_id}`;

      await enrollment.update({
        status: 'completed',
        completed_at: new Date(),
        certificate_url: certificateUrl,
      });

      if (enrollment.transaction_id) {
        await _releaseEscrow(enrollment.transaction_id, 'dual_confirmation');
      }

      const courseSkills = await Skill.findAll({
        include: [{
          model: TrainingCourse,
          where: { course_id: enrollment.course_id },
          through: { attributes: [] },
        }],
      });

      if (courseSkills.length > 0) {
        await JobSeekerSkill.bulkCreate(
          courseSkills.map(s => ({
            jobseeker_id: enrollment.jobseeker_id,
            skill_id: s.skill_id,
            proficiency_level: 'basic',
          })),
          { ignoreDuplicates: true }
        );
      }

      const txn = enrollment.transaction_id
        ? await CourseEnrollmentTransaction.findByPk(enrollment.transaction_id)
        : null;

      return res.json({
        message: 'Course completed! Certificate issued and skills added to your profile.',
        status: 'completed',
        certificate_url: certificateUrl,
        escrow_released: true,
        skills_added: courseSkills.map(s => s.skill_name),
        trainer_payout_npr: txn ? (txn.trainer_payout_paisa / 100) : 0,
      });
    }

    return res.json({
      message: 'Confirmation recorded. Waiting for the other party to confirm.',
      seeker_confirmed: enrollment.seeker_confirmed,
      trainer_confirmed: enrollment.trainer_confirmed,
    });

  } catch (err) {
    console.error('confirmCompletion error:', err.message);
    return res.status(500).json({ message: 'Server error.' });
  }
};

const raiseDispute = async (req, res) => {
  try {
    const { enrollment_id } = req.params;
    const { reason } = req.body;
    const role = req.user.current_role;

    const enrollment = await CourseEnrollment.findByPk(enrollment_id);
    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found.' });

    const disputeableStatuses = ['active', 'abandoned'];
    if (!disputeableStatuses.includes(enrollment.status)) {
      return res.status(400).json({ message: `Cannot dispute enrollment with status '${enrollment.status}'.` });
    }

    const updateData = {
      status: 'disputed',
      dispute_reason: reason || 'No reason provided.',
      disputed_by: role,
    };
    try { updateData.disputed_at = new Date(); } catch { }   // column may not exist yet
    await enrollment.update(updateData);

    if (enrollment.transaction_id) {
      await CourseEnrollmentTransaction.update(
        { status: 'Disputed' },
        { where: { transaction_id: enrollment.transaction_id } }
      );
    }

    return res.json({
      message: 'Dispute raised. Admin will review and resolve within 3–5 business days.',
      status: 'disputed',
    });

  } catch (err) {
    console.error('raiseDispute error:', err.message);
    return res.status(500).json({ message: 'Server error.' });
  }
};

const adminRelease = async (req, res) => {
  try {
    const { enrollment_id } = req.params;
    const { decision, notes } = req.body;

    if (!['release_to_trainer', 'refund_to_seeker'].includes(decision)) {
      return res.status(400).json({ message: "decision must be 'release_to_trainer' or 'refund_to_seeker'" });
    }

    const enrollment = await CourseEnrollment.findByPk(enrollment_id);
    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found.' });

    if (decision === 'release_to_trainer') {
      await enrollment.update({ status: 'completed', completed_at: new Date() });
      if (enrollment.transaction_id) {
        await _releaseEscrow(enrollment.transaction_id, 'admin_release');
        // Optionally store admin_notes in transaction
      }
      return res.json({ message: 'Escrow released to trainer by admin.', decision });

    } else {
      await enrollment.update({ status: 'refunded' });
      if (enrollment.transaction_id) {
        await CourseEnrollmentTransaction.update(
          { status: 'Refunded', escrow_released: false },
          { where: { transaction_id: enrollment.transaction_id } }
        );
        // PRODUCTION: trigger Khalti refund API or bank transfer here
      }
      return res.json({ message: 'Refund issued to jobseeker by admin.', decision });
    }

  } catch (err) {
    console.error('adminRelease error:', err.message);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// ─── GET /enrollments/my-courses ─────────────────────────────────────────────
// Returns all courses a seeker is enrolled in (active + completed)
const getMyCourses = async (req, res) => {
  try {
    await _processExpiredAbandoned();                        // auto-release check

    const seeker = await _getSeeker(req.user.user_id);
    if (!seeker) return res.status(404).json({ message: 'JobSeeker profile not found.' });

    const enrollments = await CourseEnrollment.findAll({
      where: { jobseeker_id: seeker.jobseeker_id },
      include: [{
        model: TrainingCourse,
        include: [
          { model: Skill, as: 'Skills' },
          { model: Trainer, include: [{ model: User, attributes: ['name', 'profile_image'] }] },
        ],
      }, {
        model: CourseEnrollmentTransaction,
        required: false,
      }],
      order: [['created_at', 'DESC']],
    });

    return res.json({ enrollments });
  } catch (err) {
    console.error('getMyCourses error:', err.message);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// ─── GET /enrollments/trainer/my-enrollments ─────────────────────────────────
// Trainer sees all enrollments in their courses (with escrow status)
const getTrainerEnrollments = async (req, res) => {
  try {
    await _processExpiredAbandoned();                        // auto-release check

    const trainer = await Trainer.findOne({ where: { user_id: req.user.user_id } });
    if (!trainer) return res.status(404).json({ message: 'Trainer profile not found.' });

    const { course_id, status } = req.query;
    const courseWhere     = { trainer_id: trainer.trainer_id };
    if (course_id) courseWhere.course_id = course_id;

    const enrollmentWhere = {};
    if (status) enrollmentWhere.status = status;

    const enrollments = await CourseEnrollment.findAll({
      where:   enrollmentWhere,
      include: [{
        model: TrainingCourse,
        where: courseWhere,
        attributes: ['course_id', 'title', 'price'],
      }, {
        model:    CourseEnrollmentTransaction,
        attributes: ['transaction_id', 'amount_paisa', 'platform_fee_paisa', 'trainer_payout_paisa', 'escrow_released', 'escrow_released_at', 'status', 'paid_at'],
        required: false,
      }, {
        model:   JobSeeker,
        attributes: ['jobseeker_id'],
        include: [{ model: User, attributes: ['name', 'email'] }],
      }],
      order: [['created_at', 'DESC']],
    });

    const totalEarnings = enrollments
      .filter(e => e.CourseEnrollmentTransaction?.escrow_released)
      .reduce((s, e) => s + (e.CourseEnrollmentTransaction?.trainer_payout_paisa || 0), 0);

    const pendingEscrow = enrollments
      .filter(e => e.CourseEnrollmentTransaction && !e.CourseEnrollmentTransaction.escrow_released
        && e.CourseEnrollmentTransaction.status === 'Completed')
      .reduce((s, e) => s + (e.CourseEnrollmentTransaction?.trainer_payout_paisa || 0), 0);

    const atRisk = enrollments
      .filter(e => ['abandoned', 'disputed'].includes(e.status) && e.CourseEnrollmentTransaction)
      .reduce((s, e) => s + (e.CourseEnrollmentTransaction?.trainer_payout_paisa || 0), 0);

    return res.json({
      enrollments,
      summary: {
        total_enrollments:  enrollments.length,
        total_earnings_npr: totalEarnings  / 100,
        pending_escrow_npr: pendingEscrow  / 100,
        at_risk_npr:        atRisk         / 100,
        abandoned_count:    enrollments.filter(e => e.status === 'abandoned').length,
        disputed_count:     enrollments.filter(e => e.status === 'disputed').length,
      },
    });
  } catch (err) {
    console.error('getTrainerEnrollments error:', err.message);
    return res.status(500).json({ message: 'Server error.' });
  }
};

const abandonCourse = async (req, res) => {
  try {
    const { enrollment_id } = req.params;
    const seeker = await _getSeeker(req.user.user_id);
    if (!seeker) return res.status(404).json({ message: 'JobSeeker profile not found.' });

    const enrollment = await CourseEnrollment.findByPk(enrollment_id);
    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found.' });
    if (enrollment.jobseeker_id !== seeker.jobseeker_id) return res.status(403).json({ message: 'Not your enrollment.' });
    if (enrollment.status !== 'active') return res.status(400).json({ message: `Cannot abandon enrollment with status '${enrollment.status}'.` });

    // Update enrollment to abandoned
    const updateData = { status: 'abandoned' };
    try { updateData.abandoned_at = new Date(); } catch { }   // column may not exist yet
    await enrollment.update(updateData);

    // Mark transaction as Abandoned (funds still held — auto-releases after grace period)
    if (enrollment.transaction_id) {
      await CourseEnrollmentTransaction.update(
        { status: 'Abandoned' },
        { where: { transaction_id: enrollment.transaction_id } }
      );
    }

    const releaseDate = new Date(Date.now() + ABANDON_RELEASE_DAYS * 86_400_000);

    return res.json({
      message: 'Course marked as abandoned.',
      status: 'abandoned',
      is_free: !enrollment.transaction_id,
      release_policy: enrollment.transaction_id
        ? `No refund. Payment auto-releases to trainer on ${releaseDate.toDateString()} unless you raise a dispute first.`
        : 'Free course — no payment involved.',
      release_date: releaseDate.toISOString(),
    });

  } catch (err) {
    console.error('abandonCourse error:', err.message);
    return res.status(500).json({ message: 'Server error.' });
  }
};

export {
  getEnrollmentStatus,
  enrollCourse,
  verifyEnrollmentPayment,
  abandonCourse,
  confirmCompletion,
  getMyCourses,
  getTrainerEnrollments,
  raiseDispute,
  adminRelease
};