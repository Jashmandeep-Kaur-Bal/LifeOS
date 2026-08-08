import express from "express";
import auth from "../middleware/auth.js";
import { StudyTask, StudyProfile } from "../models/Study.js";

const router = express.Router();
router.use(auth);

// GET /api/study -> tasks + streak
router.get("/", async (req, res) => {
  try {
    let profile = await StudyProfile.findOne({ user: req.userId });
    if (!profile) profile = await StudyProfile.create({ user: req.userId });

    const tasks = await StudyTask.find({ user: req.userId }).sort({ createdAt: 1 });
    res.json({ streak: profile.streak, tasks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/study/tasks
router.post("/tasks", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "text is required" });
    const task = await StudyTask.create({ user: req.userId, text, completed: false });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/study/tasks/:id -> toggle completed
router.patch("/tasks/:id", async (req, res) => {
  try {
    const task = await StudyTask.findOne({ _id: req.params.id, user: req.userId });
    if (!task) return res.status(404).json({ message: "Task not found" });
    task.completed = !task.completed;
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/study/streak/increment -> call when a pomodoro session completes
router.post("/streak/increment", async (req, res) => {
  try {
    const profile = await StudyProfile.findOneAndUpdate(
      { user: req.userId },
      { $inc: { streak: 1 } },
      { new: true, upsert: true }
    );
    res.json({ streak: profile.streak });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
