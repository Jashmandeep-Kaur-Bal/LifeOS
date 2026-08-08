import express from "express";
import jwt from "jsonwebtoken";
import User, { ROLES, ROLE_META } from "../models/User.js";
import { FinanceProfile } from "../models/Finance.js";
import Health from "../models/Health.js";
import { StudyProfile } from "../models/Study.js";
import { ShoppingProfile } from "../models/Shopping.js";
import Email from "../models/Email.js";
import Goals from "../models/Goals.js";
import auth from "../middleware/auth.js";

const router = express.Router();

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// GET /api/auth/roles -> public list of roles for the registration form
// (no auth required — a person needs this before they have an account).
router.get("/roles", (req, res) => {
  res.json({
    roles: ROLES.map((r) => ({
      value: r,
      label: ROLE_META[r]?.label || r,
      description: ROLE_META[r]?.description || "",
    })),
  });
});

// POST /api/auth/register
// Accepts an optional `role` so a new account can start as Admin/Authority/
// etc. instead of the default 'user'. Like PATCH /api/auth/role, this is
// self-service by design for this demo — a real deployment would only let
// an existing Admin grant elevated roles, not let anyone pick one at signup.
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill in all fields." });
    }

    let assignedRole = "user";
    if (role) {
      if (!ROLES.includes(role)) {
        return res.status(400).json({ message: `role must be one of: ${ROLES.join(", ")}` });
      }
      assignedRole = role;
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "An account with that email already exists." });
    }

    const user = await User.create({ name, email, password, role: assignedRole });

    // Seed per-user defaults so the dashboard has something to show immediately
    await Promise.all([
      FinanceProfile.create({ user: user._id }),
      Health.create({ user: user._id }),
      StudyProfile.create({ user: user._id }),
      ShoppingProfile.create({ user: user._id }),
      Goals.create({ user: user._id }),
      Email.insertMany([
        {
          user: user._id,
          sender: "LifeOS Team",
          subject: "Welcome to LifeOS",
          body: "Your workspace is ready. Explore Finance, Health, Study, Travel, Calendar and Shopping from the dashboard.",
          unread: true,
        },
      ]),
    ]);

    const token = signToken(user._id);
    res.status(201).json({ token, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Please enter your email and password." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = signToken(user._id);
    res.json({ token, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/auth/role -> switch the signed-in user's role (demo/testing
// only — a real deployment would gate this behind an invite/admin action
// instead of letting a user grant themselves any role).
router.patch("/role", auth, async (req, res) => {
  try {
    const { role } = req.body;
    if (!ROLES.includes(role)) {
      return res.status(400).json({ message: `role must be one of: ${ROLES.join(", ")}` });
    }
    const user = await User.findByIdAndUpdate(req.userId, { role }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
