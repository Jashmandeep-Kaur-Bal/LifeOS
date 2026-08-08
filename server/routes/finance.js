import express from "express";
import auth from "../middleware/auth.js";
import { Transaction, FinanceProfile } from "../models/Finance.js";

const router = express.Router();
router.use(auth);

// GET /api/finance -> balance + transactions
router.get("/", async (req, res) => {
  try {
    let profile = await FinanceProfile.findOne({ user: req.userId });
    if (!profile) profile = await FinanceProfile.create({ user: req.userId });

    const transactions = await Transaction.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json({ balance: profile.balance, transactions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/finance/transactions
router.post("/transactions", async (req, res) => {
  try {
    const { desc, amt, category } = req.body;
    if (!desc || amt === undefined || isNaN(amt)) {
      return res.status(400).json({ message: "desc and a numeric amt are required" });
    }

    const numericAmt = parseFloat(amt);
    const tx = await Transaction.create({ user: req.userId, desc, amt: numericAmt, category });

    const profile = await FinanceProfile.findOneAndUpdate(
      { user: req.userId },
      { $inc: { balance: -numericAmt } },
      { new: true, upsert: true }
    );

    res.status(201).json({ transaction: tx, balance: profile.balance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
