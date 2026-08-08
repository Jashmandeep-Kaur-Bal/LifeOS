import mongoose from "mongoose";

const healthSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    waterIntake: { type: Number, default: 1250 },
    workoutDone: { type: Boolean, default: false },
    caloriesLogged: { type: Number, default: 1450 },
    reminderActive: { type: Boolean, default: false },
    bpm: { type: Number, default: 72 },
    bpmStatus: { type: String, default: "Normal" },
  },
  { timestamps: true }
);

export default mongoose.model("Health", healthSchema);
