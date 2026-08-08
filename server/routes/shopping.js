import express from "express";
import auth from "../middleware/auth.js";
import { ShoppingItem, ShoppingProfile } from "../models/Shopping.js";

const router = express.Router();
router.use(auth);

// GET /api/shopping -> items + budget cap
router.get("/", async (req, res) => {
  try {
    let profile = await ShoppingProfile.findOne({ user: req.userId });
    if (!profile) profile = await ShoppingProfile.create({ user: req.userId });

    const items = await ShoppingItem.find({ user: req.userId }).sort({ createdAt: 1 });
    res.json({ budgetCap: profile.budgetCap, items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/shopping/items
router.post("/items", async (req, res) => {
  try {
    const { name, price } = req.body;
    if (!name || price === undefined || isNaN(price)) {
      return res.status(400).json({ message: "name and a numeric price are required" });
    }
    const item = await ShoppingItem.create({
      user: req.userId,
      name,
      price: parseFloat(price),
      bought: false,
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/shopping/items/:id -> toggle bought
router.patch("/items/:id", async (req, res) => {
  try {
    const item = await ShoppingItem.findOne({ _id: req.params.id, user: req.userId });
    if (!item) return res.status(404).json({ message: "Item not found" });
    item.bought = !item.bought;
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/shopping/budget -> update budget cap
router.patch("/budget", async (req, res) => {
  try {
    const { budgetCap } = req.body;
    if (budgetCap === undefined || isNaN(budgetCap)) {
      return res.status(400).json({ message: "numeric budgetCap is required" });
    }
    const profile = await ShoppingProfile.findOneAndUpdate(
      { user: req.userId },
      { $set: { budgetCap: parseFloat(budgetCap) } },
      { new: true, upsert: true }
    );
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
