import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
    getPremiumPlans,
    getPremiumStatus,
    initiatePremiumPayment,
    verifyPremiumPayment
} from "../controllers/premium.controller.js";

const router = express.Router();

/**
 * GET  /premium/plans          — public
 * GET  /premium/status         — jobseeker or employer
 * POST /premium/initiate       — jobseeker or employer
 * GET  /premium/verify         — jobseeker or employer
 */

// Public route
router.get("/plans", getPremiumPlans);

// Authenticated routes (both roles allowed)
router.get(
    "/status",
    authMiddleware(["jobseeker", "employer"]),
    getPremiumStatus
);

router.post(
    "/initiate",
    authMiddleware(["jobseeker", "employer"]),
    initiatePremiumPayment
);

router.get(
    "/verify",
    authMiddleware(["jobseeker", "employer"]),
    verifyPremiumPayment
);

export default router;