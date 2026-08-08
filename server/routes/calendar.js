import express from "express";
import auth from "../middleware/auth.js";
import CalendarEvent from "../models/CalendarEvent.js";

const router = express.Router();
router.use(auth);

// GET /api/calendar
router.get("/", async (req, res) => {
  try {
    const events = await CalendarEvent.find({ user: req.userId }).sort({ createdAt: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/calendar
router.post("/", async (req, res) => {
  try {
    const { title, time, priority } = req.body;
    if (!title || !time) {
      return res.status(400).json({ message: "title and time are required" });
    }
    const event = await CalendarEvent.create({
      user: req.userId,
      title,
      time,
      priority: priority || "High",
    });
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
