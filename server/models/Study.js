import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    text: { type: String, required: true },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const studyProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  streak: { type: Number, default: 3 },
});

export const StudyTask = mongoose.model("StudyTask", taskSchema);
export const StudyProfile = mongoose.model("StudyProfile", studyProfileSchema);
