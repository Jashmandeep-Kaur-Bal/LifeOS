import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Roles that agent task records can be scoped to. "user" is the default
// every account gets; the rest are elevated/specialist roles chosen at
// registration (or switched into later for demo purposes via
// PATCH /api/auth/role).
export const ROLES = ["user", "admin", "authority", "hospital", "investigator", "reviewer"];

export const ROLE_META = {
  user: { label: "User", description: "Standard account — manage your own modules and data." },
  admin: { label: "Admin", description: "Full oversight: every agent task record, every user, every module." },
  authority: { label: "Authority", description: "Full oversight, same access as Admin." },
  hospital: { label: "Hospital", description: "Reviews Health-module records (your own only)." },
  investigator: { label: "Investigator", description: "Reviews Finance & Shopping records (your own only)." },
  reviewer: { label: "Reviewer", description: "Reviews records still awaiting completion (your own only)." },
};

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    onboarded: { type: Boolean, default: false },
    role: { type: String, enum: ROLES, default: "user" },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function () {
  return { id: this._id, name: this.name, email: this.email, onboarded: this.onboarded, role: this.role };
};

export default mongoose.model("User", userSchema);
