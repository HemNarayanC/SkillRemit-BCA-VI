import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import passport from "./src/config/passport.js";
import session from "express-session";
import authRoutes from "./src/routes/auth.routes.js";
import userRoutes from "./src/routes/user.routes.js"
import employerRoutes from "./src/routes/employer.routes.js";
import jobRoutes from './src/routes/job.routes.js';
import adminRoutes from './src/routes/admin.routes.js';
import aiRoutes from './src/routes/ai.routes.js';
import applicationRoutes from './src/routes/applications.routes.js';
import jobSeekerRoutes from './src/routes/jobseeker.routes.js';
import trainerRoutes from './src/routes/trainer.routes.js'
import aiPremiumRoutes from './src/routes/premium.routes.js'
import enrollmentRoutes from './src/routes/enrollment.routes.js';
import hiringRoutes from './src/routes/hiring.routes.js';
import PlatformSettings from "./src/routes/platformSettings.routes.js";
import nodeCron from "node-cron";
import { cleanUpUnverifiedUsers } from "./src/utils/cleanUpUnverifiedUsers.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));

// Session required for passport
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use('/api/employers', employerRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/users/jobseeker', jobSeekerRoutes);
app.use('/api/trainers', trainerRoutes);
app.use('/api/aipremium', aiPremiumRoutes);
app.use('/api/enrollment', enrollmentRoutes);
app.use('/api/hiring', hiringRoutes);
app.use('/api/admin/settings', PlatformSettings);

app.get("/", (req, res) => {
    res.send("Remittance Skill Matching API running");
});

nodeCron.schedule("0 * * * *", async () => {
  console.log("Running cleanup of unverified users...");
  await cleanUpUnverifiedUsers();
});

export default app;
