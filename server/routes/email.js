import express from "express";
import auth from "../middleware/auth.js";
import Email from "../models/Email.js";

const router = express.Router();
router.use(auth);

// GET /api/email
router.get("/", async (req, res) => {
  try {
    const emails = await Email.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(emails);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/email/:id -> mark as read
router.patch("/:id", async (req, res) => {
  try {
    const email = await Email.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { $set: { unread: false } },
      { new: true }
    );
    if (!email) return res.status(404).json({ message: "Email not found" });
    res.json(email);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
