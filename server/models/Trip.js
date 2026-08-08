import mongoose from "mongoose";

const tripSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    dest: { type: String, required: true },
    date: { type: String, required: true },
    status: { type: String, enum: ["Planning", "Confirmed"], default: "Planning" },
  },
  { timestamps: true }
);

export default mongoose.model("Trip", tripSchema);
