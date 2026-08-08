import mongoose from "mongoose";

const shoppingItemSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    bought: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const shoppingProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  budgetCap: { type: Number, default: 500 },
});

export const ShoppingItem = mongoose.model("ShoppingItem", shoppingItemSchema);
export const ShoppingProfile = mongoose.model("ShoppingProfile", shoppingProfileSchema);
