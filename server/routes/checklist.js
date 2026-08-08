import express from "express";
import auth from "../middleware/auth.js";
import Checklist from "../models/Checklist.js";

const router = express.Router();
router.use(auth);

// Default required inputs/sources per module — what should be true before
// that module's AI assistant has enough to work with. Keys are stable so
// toggling one item never renumbers the rest.
const DEFAULT_ITEMS = {
  dashboard: [
    { key: "goals_set", label: "Goals & focus areas set" },
    { key: "reviewed_today", label: "Reviewed today's summary" },
  ],
  health: [
    { key: "workout_logged", label: "Logged today's workout" },
    { key: "water_logged", label: "Logged water intake" },
    { key: "sleep_logged", label: "Logged sleep hours" },
    { key: "calorie_goal_set", label: "Set today's calorie goal" },
  ],
  finance: [
    { key: "transactions_added", label: "Added recent transactions" },
    { key: "budgets_reviewed", label: "Reviewed category budgets" },
    { key: "balance_confirmed", label: "Confirmed current balance" },
  ],
  study: [
    { key: "tasks_added", label: "Added today's study tasks" },
    { key: "session_length_set", label: "Set study session length" },
    { key: "streak_reviewed", label: "Reviewed current streak" },
  ],
  travel: [
    { key: "destination_added", label: "Added trip destination" },
    { key: "dates_set", label: "Set travel dates" },
    { key: "budget_estimated", label: "Added a budget estimate" },
  ],
  calendar: [
    { key: "events_reviewed", label: "Reviewed today's events" },
    { key: "missing_events_added", label: "Added any missing events" },
  ],
  email: [
    { key: "inbox_synced", label: "Synced inbox context" },
    { key: "unread_reviewed", label: "Reviewed unread count" },
  ],
  shopping: [
    { key: "budget_cap_set", label: "Set a budget cap" },
    { key: "wishlist_added", label: "Added wishlist items" },
  ],
};

function defaultsFor(moduleName) {
  const items = DEFAULT_ITEMS[moduleName] || DEFAULT_ITEMS.dashboard;
  return items.map((i) => ({ ...i, completed: false }));
}

// GET /api/checklist/:module -> this user's checklist for that module
// (created with module defaults on first request).
router.get("/:module", async (req, res) => {
  try {
    const moduleName = req.params.module;
    let checklist = await Checklist.findOne({ user: req.userId, module: moduleName });
    if (!checklist) {
      checklist = await Checklist.create({
        user: req.userId,
        module: moduleName,
        items: defaultsFor(moduleName),
      });
    }
    res.json(checklist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/checklist/:module -> toggle a single item by key
// body: { key: "workout_logged", completed: true }
router.patch("/:module", async (req, res) => {
  try {
    const moduleName = req.params.module;
    const { key, completed } = req.body;
    if (!key || typeof completed !== "boolean") {
      return res.status(400).json({ message: "key and completed (boolean) are required" });
    }

    let checklist = await Checklist.findOne({ user: req.userId, module: moduleName });
    if (!checklist) {
      checklist = await Checklist.create({
        user: req.userId,
        module: moduleName,
        items: defaultsFor(moduleName),
      });
    }

    const item = checklist.items.find((i) => i.key === key);
    if (!item) {
      return res.status(404).json({ message: `No checklist item '${key}' for module '${moduleName}'` });
    }
    item.completed = completed;
    await checklist.save();

    res.json(checklist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
