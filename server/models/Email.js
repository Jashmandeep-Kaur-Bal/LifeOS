import mongoose from "mongoose";

const emailSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    sender: { type: String, required: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    unread: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Email", emailSchema);
