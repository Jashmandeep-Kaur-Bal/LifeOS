import express from "express";
import auth from "../middleware/auth.js";
import Trip from "../models/Trip.js";

const router = express.Router();
router.use(auth);

// GET /api/travel
router.get("/", async (req, res) => {
  try {
    const trips = await Trip.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(trips);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/travel
router.post("/", async (req, res) => {
  try {
    const { dest, date } = req.body;
    if (!dest || !date) {
      return res.status(400).json({ message: "dest and date are required" });
    }
    const trip = await Trip.create({ user: req.userId, dest, date, status: "Planning" });
    res.status(201).json(trip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/travel/:id -> e.g. update status
router.patch("/:id", async (req, res) => {
  try {
    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { $set: req.body },
      { new: true }
    );
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    res.json(trip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
