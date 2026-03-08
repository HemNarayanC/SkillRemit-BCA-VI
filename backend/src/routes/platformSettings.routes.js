import express from 'express';
import { getPlatformSettings, updatePlatformSettings } from '../controllers/platformSettings.controller.js';
import { authMiddleware } from '..//middlewares/auth.middleware.js';

const router = express.Router();

// Only admins can fetch or update platform settings
router.get('/', authMiddleware(['admin']), getPlatformSettings);
router.patch('/', authMiddleware(['admin']), updatePlatformSettings);

export default router;