import express from "express";
import auth from "../middleware/auth.js";
import Health from "../models/Health.js";

const router = express.Router();
router.use(auth);

// GET /api/health
router.get("/", async (req, res) => {
  try {
    let doc = await Health.findOne({ user: req.userId });
    if (!doc) doc = await Health.create({ user: req.userId });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/health -> partial update (water, workout, calories, reminder, bpm)
router.patch("/", async (req, res) => {
  try {
    const allowed = [
      "waterIntake",
      "workoutDone",
      "caloriesLogged",
      "reminderActive",
      "bpm",
      "bpmStatus",
    ];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const doc = await Health.findOneAndUpdate(
      { user: req.userId },
      { $set: updates },
      { new: true, upsert: true }
    );
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
