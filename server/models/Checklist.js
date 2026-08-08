import mongoose from "mongoose";

// A single required input/source for an agent task (e.g. "Logged today's
// workout"). Kept intentionally tiny — this is a checklist, not a form.
const checklistItemSchema = new mongoose.Schema(
  {
    key: { type: String, required: true }, // stable id, e.g. "workout_logged"
    label: { type: String, required: true }, // shown to the user
    completed: { type: Boolean, default: false },
  },
  { _id: false }
);

// A free-text note left by whoever is reviewing this agent task. Kept on
// the checklist itself so notes travel with the record they're about, not
// a separate collection.
const reviewNoteSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    authorName: { type: String, default: "" }, // denormalized so old notes still show a name
    text: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

// One checklist per user per module (the module's AI assistant is the
// "agent task"). Lets the UI show "3/5 sources ready" before someone leans
// on that module's chatbot for a summary/generation/review.
const checklistSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    module: { type: String, required: true },
    items: { type: [checklistItemSchema], default: [] },
    reviewNotes: { type: [reviewNoteSchema], default: [] },
  },
  { timestamps: true }
);

checklistSchema.index({ user: 1, module: 1 }, { unique: true });

export default mongoose.model("Checklist", checklistSchema);
