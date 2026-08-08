import mongoose from "mongoose";

// One doc per user, captured during onboarding and editable later.
// Drives the personalized "Daily Score" and module targets on the dashboard.
const goalsSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    focusAreas: { type: [String], default: [] }, // e.g. ["Health", "Finance", "Study"]
    primaryGoal: { type: String, default: "" }, // free-text, e.g. "Save for a trip"
    waterGoalMl: { type: Number, default: 2500 },
    workoutGoalPerWeek: { type: Number, default: 5 }, // days/week
    taskGoalPerDay: { type: Number, default: 3 },
    monthlyBudget: { type: Number, default: 2000 },
  },
  { timestamps: true }
);

export default mongoose.model("Goals", goalsSchema);
