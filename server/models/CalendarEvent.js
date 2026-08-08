import mongoose from "mongoose";

const calendarEventSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    time: { type: String, required: true },
    priority: { type: String, enum: ["High", "Medium", "Low"], default: "High" },
  },
  { timestamps: true }
);

export default mongoose.model("CalendarEvent", calendarEventSchema);
