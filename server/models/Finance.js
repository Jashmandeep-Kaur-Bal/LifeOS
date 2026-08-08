import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    desc: { type: String, required: true },
    amt: { type: Number, required: true },
    category: {
      type: String,
      enum: ["Food", "Utilities", "Entertainment", "Subscriptions"],
      required: true,
    },
  },
  { timestamps: true }
);

// One doc per user holding the running balance
const financeProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  balance: { type: Number, default: 3450 },
});

export const Transaction = mongoose.model("Transaction", transactionSchema);
export const FinanceProfile = mongoose.model("FinanceProfile", financeProfileSchema);
