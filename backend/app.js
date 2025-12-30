import express from "express";
import dotenv from "dotenv";
import authRoutes from "./src/routes/auth.routes.js";
import userRoutes from "./src/routes/user.routes.js"
import employerRoutes from "./src/routes/employer.routes.js";
import nodeCron from "node-cron";
import { cleanUpUnverifiedUsers } from "./src/utils/cleanUpUnverifiedUsers.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use('/api/employers', employerRoutes);

app.get("/", (req, res) => {
    res.send("Remittance Skill Matching API running");
});

nodeCron.schedule("0 * * * *", async () => {
  console.log("Running cleanup of unverified users...");
  await cleanUpUnverifiedUsers();
});

export default app;
