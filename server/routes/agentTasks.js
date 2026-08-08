import express from "express";
import auth from "../middleware/auth.js";
import User, { ROLES, ROLE_META } from "../models/User.js";
import Checklist from "../models/Checklist.js";
import { buildModuleSnapshot } from "../utils/moduleSnapshot.js";
import { generateNarrative } from "../utils/reviewNarrative.js";

const router = express.Router();
router.use(auth);

const MODULE_LABELS = {
  health: "Health",
  finance: "Finance",
  study: "Study",
  travel: "Travel",
  calendar: "Calendar",
  email: "Email",
  shopping: "Shopping",
  dashboard: "Dashboard",
};

// LifeOS's persisted "agent task" records are its per-module source
// checklists.
//
// RBAC:
//   - Admin and Authority are the only roles with cross-user visibility —
//     they see every record for their view, across all users.
//   - Every other role (User, Hospital, Investigator, Reviewer) is scoped
//     to records they OWN, further filtered to what's relevant to that
//     role. A Hospital account never sees another user's Health records;
//     it only sees its own.
const FULL_ACCESS_ROLES = ["admin", "authority"];

// Module scoping applies to Hospital/Investigator regardless of who's
// looking — it defines what "relevant to this role" means. Admin/Authority
// still see this same module scope when they switch into that role's tab,
// just without the per-user restriction.
const MODULE_SCOPE = {
  hospital: ["health"],
  investigator: ["finance", "shopping"],
};

// Same rule the list endpoint below applies, but for a single record: full
// access roles see everything, everyone else only ever sees their own.
function canAccessChecklist(me, checklist) {
  if (FULL_ACCESS_ROLES.includes(me.role)) return true;
  const ownerId = checklist.user?._id ? checklist.user._id.toString() : checklist.user?.toString();
  return ownerId === me._id.toString();
}

function serializeNotes(checklist) {
  return (checklist.reviewNotes || [])
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((n) => ({ id: n._id, author: n.authorName, text: n.text, createdAt: n.createdAt }));
}

// GET /api/agent-tasks/roles -> role list + which one(s) the signed-in user
// currently has access to, for building the tab bar.
router.get("/roles", async (req, res) => {
  try {
    const me = await User.findById(req.userId);
    const roles = ROLES.map((r) => ({
      value: r,
      label: ROLE_META[r]?.label || r,
      description: ROLE_META[r]?.description || "",
      unlocked: r === "user" || FULL_ACCESS_ROLES.includes(me.role) || me.role === r,
    }));
    res.json({ currentRole: me.role, roles });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/agent-tasks?role=<role> -> scoped list + count for that role.
router.get("/", async (req, res) => {
  try {
    const requestedRole = req.query.role || "user";
    if (!ROLES.includes(requestedRole)) {
      return res.status(400).json({ message: `role must be one of: ${ROLES.join(", ")}` });
    }

    const me = await User.findById(req.userId);
    const hasFullAccess = FULL_ACCESS_ROLES.includes(me.role);
    const canView = requestedRole === "user" || hasFullAccess || me.role === requestedRole;
    if (!canView) {
      return res.status(403).json({
        message: `You need the '${requestedRole}' role to view these records. Your current role is '${me.role}'.`,
      });
    }

    // Only Admin/Authority ever get cross-user results. Everyone else
    // (including a matching Hospital/Investigator/Reviewer account) is
    // pinned to their own records — RBAC, not just a UI filter.
    let query = {};
    if (requestedRole === "user") {
      query = { user: req.userId };
    } else {
      if (MODULE_SCOPE[requestedRole]) {
        query.module = { $in: MODULE_SCOPE[requestedRole] };
      }
      if (!hasFullAccess) {
        query.user = req.userId;
      }
    }

    let checklists = await Checklist.find(query)
      .populate("user", "name email")
      .sort({ updatedAt: -1 });

    if (requestedRole === "reviewer") {
      checklists = checklists.filter((c) => c.items.some((i) => !i.completed));
    }

    const records = checklists.map((c) => {
      const total = c.items.length;
      const done = c.items.filter((i) => i.completed).length;
      return {
        id: c._id,
        module: c.module,
        owner: c.user ? { name: c.user.name, email: c.user.email } : null,
        total,
        done,
        complete: total > 0 && done === total,
        updatedAt: c.updatedAt,
      };
    });

    res.json({ role: requestedRole, count: records.length, records, scope: hasFullAccess ? "all_users" : "own" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/agent-tasks/:id/review-packet -> structured, shareable packet
// for a single agent task: AI-assisted (or template-fallback) generated
// sections, rule-based validation warnings, missing checklist fields, and
// persisted reviewer notes. Nothing here is cached — every call rebuilds it
// from live data, so it always reflects the record's current state. Notes
// are the one piece that persists (see POST/DELETE below).
router.get("/:id/review-packet", async (req, res) => {
  try {
    const me = await User.findById(req.userId);
    const checklist = await Checklist.findById(req.params.id).populate("user", "name email");
    if (!checklist) return res.status(404).json({ message: "Agent task not found." });
    if (!canAccessChecklist(me, checklist)) {
      return res.status(403).json({ message: "You don't have access to this agent task's review packet." });
    }

    const total = checklist.items.length;
    const done = checklist.items.filter((i) => i.completed).length;
    const missingFields = checklist.items.filter((i) => !i.completed).map((i) => ({ key: i.key, label: i.label }));

    const { metrics, warnings } = await buildModuleSnapshot(checklist.module, checklist.user._id);
    if (missingFields.length > 0) {
      warnings.push(
        `${missingFields.length} required source${missingFields.length === 1 ? "" : "s"} not yet marked complete: ${missingFields
          .map((f) => f.label)
          .join(", ")}.`
      );
    }

    const moduleLabel = MODULE_LABELS[checklist.module] || checklist.module;
    const ownerName = checklist.user?.name || "this user";

    const { sections } = await generateNarrative({
      moduleLabel,
      ownerName,
      done,
      total,
      metrics,
      warnings,
      missingFields,
    });

    res.json({
      meta: {
        taskId: checklist._id,
        module: checklist.module,
        moduleLabel,
        owner: checklist.user ? { name: checklist.user.name, email: checklist.user.email } : null,
        checklist: { total, done, complete: total > 0 && done === total },
        generatedAt: new Date().toISOString(),
      },
      metrics,
      generatedSections: sections,
      validationWarnings: warnings.map((message, idx) => ({ id: `w${idx}`, message })),
      missingFields,
      userNotes: serializeNotes(checklist),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/agent-tasks/:id/notes -> append a reviewer note. body: { text }
router.post("/:id/notes", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ message: "text is required" });

    const me = await User.findById(req.userId);
    const checklist = await Checklist.findById(req.params.id).populate("user", "name email");
    if (!checklist) return res.status(404).json({ message: "Agent task not found." });
    if (!canAccessChecklist(me, checklist)) {
      return res.status(403).json({ message: "You don't have access to add notes to this agent task." });
    }

    checklist.reviewNotes.push({ author: me._id, authorName: me.name, text: text.trim() });
    await checklist.save();

    res.status(201).json({ userNotes: serializeNotes(checklist) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/agent-tasks/:id/notes/:noteId -> remove a note (its author, or
// a full-access role, only).
router.delete("/:id/notes/:noteId", async (req, res) => {
  try {
    const me = await User.findById(req.userId);
    const checklist = await Checklist.findById(req.params.id).populate("user", "name email");
    if (!checklist) return res.status(404).json({ message: "Agent task not found." });
    if (!canAccessChecklist(me, checklist)) {
      return res.status(403).json({ message: "You don't have access to this agent task." });
    }

    const note = checklist.reviewNotes.id(req.params.noteId);
    if (!note) return res.status(404).json({ message: "Note not found." });
    if (note.author.toString() !== me._id.toString() && !FULL_ACCESS_ROLES.includes(me.role)) {
      return res.status(403).json({ message: "You can only remove your own notes." });
    }
    note.deleteOne();
    await checklist.save();

    res.json({ userNotes: serializeNotes(checklist) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
