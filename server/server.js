import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/auth.js";
import financeRoutes from "./routes/finance.js";
import healthRoutes from "./routes/health.js";
import travelRoutes from "./routes/travel.js";
import studyRoutes from "./routes/study.js";
import shoppingRoutes from "./routes/shopping.js";
import calendarRoutes from "./routes/calendar.js";
import emailRoutes from "./routes/email.js";
import goalsRoutes from "./routes/goals.js";
import chatRoutes from "./routes/chat.js";
import checklistRoutes from "./routes/checklist.js";
import agentTasksRoutes from "./routes/agentTasks.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health-check", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/travel", travelRoutes);
app.use("/api/study", studyRoutes);
app.use("/api/shopping", shoppingRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/goals", goalsRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/checklist", checklistRoutes);
app.use("/api/agent-tasks", agentTasksRoutes);

// Fallback error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong on the server." });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
