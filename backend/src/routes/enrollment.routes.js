import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { abandonCourse, confirmCompletion, enrollCourse, getEnrollmentStatus, getMyCourses, getTrainerEnrollments, raiseDispute, verifyEnrollmentPayment } from '../controllers/enrollment.controller.js';


const router = express.Router();

router.get(
  '/courses/:course_id/status',
  authMiddleware(['jobseeker']),
  getEnrollmentStatus
);
router.post(
  '/courses/:course_id/enroll',
  authMiddleware(['jobseeker']),
  enrollCourse
);

router.get(
  '/verify',
  authMiddleware(['jobseeker']),
  verifyEnrollmentPayment
);

// View all enrolled courses
router.get(
  '/my-courses',
  authMiddleware(['jobseeker']),
  getMyCourses
);

// Confirm course completion (seeker side)
router.post(
  '/:enrollment_id/confirm-completion',
  authMiddleware(['jobseeker', 'trainer']),
  confirmCompletion
);

router.post(
  '/:enrollment_id/dispute',
  authMiddleware(['jobseeker','trainer']),
  raiseDispute
);

router.get(
  '/trainer/my-enrollments',
  authMiddleware(['trainer']),
  getTrainerEnrollments
);

router.post(
  '/:enrollment_id/abandon',
  authMiddleware(['jobseeker']),
  abandonCourse
);

export default router;