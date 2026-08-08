import express from "express";
import auth from "../middleware/auth.js";
import Goals from "../models/Goals.js";
import User from "../models/User.js";

const router = express.Router();
router.use(auth);

// GET /api/goals -> this user's goals (created with defaults if missing)
router.get("/", async (req, res) => {
  try {
    let goals = await Goals.findOne({ user: req.userId });
    if (!goals) goals = await Goals.create({ user: req.userId });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/goals -> save onboarding answers / edited goals, marks user as onboarded
router.put("/", async (req, res) => {
  try {
    const allowed = [
      "focusAreas",
      "primaryGoal",
      "waterGoalMl",
      "workoutGoalPerWeek",
      "taskGoalPerDay",
      "monthlyBudget",
    ];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const goals = await Goals.findOneAndUpdate(
      { user: req.userId },
      { $set: updates },
      { new: true, upsert: true }
    );

    await User.findByIdAndUpdate(req.userId, { onboarded: true });

    res.json(goals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
