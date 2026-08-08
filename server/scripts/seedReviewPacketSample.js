// One-off seed script for the review packet feature. Creates (or resets) a Health agent-task record that's deliberately
// incomplete and edge-case-y, so opening its Review Packet immediately shows
// generated sections, validation warnings, a missing field, and a sample
// reviewer note — no manual data entry required.
//
// Usage:
//   node scripts/seedReviewPacketSample.js <user-email>
//
// If no email is given, it uses the first user found in the database.

import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Checklist from "../models/Checklist.js";
import Health from "../models/Health.js";

const SAMPLE_MODULE = "health";

// Left half-done on purpose — "sleep_logged" and "calorie_goal_set" stay
// unchecked, so the packet has real "missing fields" to show.
const SAMPLE_ITEMS = [
  { key: "workout_logged", label: "Logged today's workout", completed: true },
  { key: "water_logged", label: "Logged water intake", completed: true },
  { key: "sleep_logged", label: "Logged sleep hours", completed: false },
  { key: "calorie_goal_set", label: "Set today's calorie goal", completed: false },
];

// Values chosen to trip several rule-based validation warnings at once: low
// water intake, no workout, high calories, and an elevated resting BPM.
const SAMPLE_HEALTH = {
  waterIntake: 650,
  workoutDone: false,
  caloriesLogged: 4300,
  reminderActive: true,
  bpm: 148,
  bpmStatus: "Elevated",
};

async function run() {
  await connectDB();

  const emailArg = process.argv[2];
  const user = emailArg ? await User.findOne({ email: emailArg }) : await User.findOne({});

  if (!user) {
    console.error(
      emailArg
        ? `No user found with email ${emailArg}.`
        : "No users found in the database — sign up a user first."
    );
    await mongoose.disconnect();
    process.exit(1);
  }

  const checklist = await Checklist.findOneAndUpdate(
    { user: user._id, module: SAMPLE_MODULE },
    {
      $set: {
        items: SAMPLE_ITEMS,
        reviewNotes: [
          {
            author: user._id,
            authorName: user.name,
            text: "Flagged the elevated resting BPM and low water intake — following up with the user before sign-off.",
          },
        ],
      },
    },
    { new: true, upsert: true }
  );

  await Health.findOneAndUpdate({ user: user._id }, { $set: SAMPLE_HEALTH }, { new: true, upsert: true });

  console.log(`Sample review-packet-ready record saved for ${user.email} (module: ${SAMPLE_MODULE}).`);
  console.log(`Agent task id: ${checklist._id}`);
  console.log(`Open Agent Tasks in the app, find this Health record, and click "Review Packet".`);

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
