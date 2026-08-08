// One-off seed script for the source checklist feature. Creates (or resets) a fully-completed sample Checklist record so the
// completed/saved state can be reviewed without manually clicking every box.
//
// Usage:
//   node scripts/seedSampleChecklist.js <user-email>
//
// If no email is given, it uses the first user found in the database.

import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Checklist from "../models/Checklist.js";

const SAMPLE_MODULE = "finance";
const SAMPLE_ITEMS = [
  { key: "transactions_added", label: "Added recent transactions", completed: true },
  { key: "budgets_reviewed", label: "Reviewed category budgets", completed: true },
  { key: "balance_confirmed", label: "Confirmed current balance", completed: true },
];

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
    { $set: { items: SAMPLE_ITEMS } },
    { new: true, upsert: true }
  );

  console.log(`Sample completed checklist saved for ${user.email} (module: ${SAMPLE_MODULE}):`);
  console.log(JSON.stringify(checklist, null, 2));

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
