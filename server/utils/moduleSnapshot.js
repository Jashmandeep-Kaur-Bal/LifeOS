import Health from "../models/Health.js";
import { Transaction, FinanceProfile } from "../models/Finance.js";
import { StudyTask, StudyProfile } from "../models/Study.js";
import Trip from "../models/Trip.js";
import CalendarEvent from "../models/CalendarEvent.js";
import Email from "../models/Email.js";
import { ShoppingItem, ShoppingProfile } from "../models/Shopping.js";
import Goals from "../models/Goals.js";

// Builds the read-only "what does this module's data actually look like"
// snapshot that feeds a review packet: a handful of headline metrics plus
// rule-based validation warnings. Never mutates anything. One builder per
// module, all with the same { metrics, warnings } shape so the route stays
// module-agnostic.
const BUILDERS = {
  health: async (userId) => {
    const doc = await Health.findOne({ user: userId });
    if (!doc) {
      return { metrics: [], warnings: ["No Health record found for this user yet."] };
    }
    const metrics = [
      { label: "Water intake", value: `${doc.waterIntake} ml` },
      { label: "Workout logged", value: doc.workoutDone ? "Yes" : "No" },
      { label: "Calories logged", value: `${doc.caloriesLogged} kcal` },
      { label: "Resting BPM", value: `${doc.bpm} (${doc.bpmStatus})` },
    ];
    const warnings = [];
    if (doc.waterIntake < 1000) {
      warnings.push(`Water intake (${doc.waterIntake}ml) is below the recommended 1000ml minimum.`);
    }
    if (!doc.workoutDone) warnings.push("No workout has been logged.");
    if (doc.caloriesLogged < 800) {
      warnings.push(`Calories logged (${doc.caloriesLogged}) looks unusually low — verify the entry.`);
    }
    if (doc.caloriesLogged > 4000) {
      warnings.push(`Calories logged (${doc.caloriesLogged}) looks unusually high — verify the entry.`);
    }
    if (doc.bpm < 40 || doc.bpm > 140) {
      warnings.push(`Resting BPM (${doc.bpm}) is outside the typical healthy range.`);
    }
    if (doc.bpmStatus && doc.bpmStatus.toLowerCase() !== "normal") {
      warnings.push(`BPM status is flagged as "${doc.bpmStatus}".`);
    }
    return { metrics, warnings };
  },

  finance: async (userId) => {
    const profile = await FinanceProfile.findOne({ user: userId });
    const transactions = await Transaction.find({ user: userId }).sort({ createdAt: -1 }).limit(25);
    const balance = profile?.balance ?? 0;
    const net = transactions.reduce((sum, t) => sum + t.amt, 0);
    const metrics = [
      { label: "Current balance", value: `$${balance.toFixed(2)}` },
      { label: "Transactions on file", value: String(transactions.length) },
      { label: "Net of listed transactions", value: `$${net.toFixed(2)}` },
    ];
    const warnings = [];
    if (balance < 0) warnings.push(`Balance is negative ($${balance.toFixed(2)}).`);
    if (transactions.length === 0) warnings.push("No transactions have been recorded.");
    const big = transactions.filter((t) => Math.abs(t.amt) >= 500);
    if (big.length > 0) {
      warnings.push(
        `${big.length} transaction(s) of $500+ found (e.g. "${big[0].desc}" — $${big[0].amt.toFixed(2)}).`
      );
    }
    return { metrics, warnings };
  },

  study: async (userId) => {
    const profile = await StudyProfile.findOne({ user: userId });
    const tasks = await StudyTask.find({ user: userId });
    const done = tasks.filter((t) => t.completed).length;
    const pending = tasks.length - done;
    const metrics = [
      { label: "Current streak", value: `${profile?.streak ?? 0} day(s)` },
      { label: "Study tasks", value: `${done}/${tasks.length} complete` },
    ];
    const warnings = [];
    if (tasks.length === 0) warnings.push("No study tasks have been added.");
    if ((profile?.streak ?? 0) === 0) warnings.push("Study streak is at 0 — momentum may have lapsed.");
    if (pending >= 5) warnings.push(`${pending} study tasks are still pending.`);
    return { metrics, warnings };
  },

  travel: async (userId) => {
    const trips = await Trip.find({ user: userId });
    const planning = trips.filter((t) => t.status === "Planning").length;
    const metrics = [
      { label: "Trips on file", value: String(trips.length) },
      { label: "Still planning", value: String(planning) },
      { label: "Confirmed", value: String(trips.length - planning) },
    ];
    const warnings = [];
    if (trips.length === 0) warnings.push("No trips have been added.");
    return { metrics, warnings };
  },

  calendar: async (userId) => {
    const events = await CalendarEvent.find({ user: userId });
    const high = events.filter((e) => e.priority === "High").length;
    const metrics = [
      { label: "Events on file", value: String(events.length) },
      { label: "High priority", value: String(high) },
    ];
    const warnings = [];
    if (events.length === 0) warnings.push("No calendar events have been logged.");
    return { metrics, warnings };
  },

  email: async (userId) => {
    const emails = await Email.find({ user: userId });
    const unread = emails.filter((e) => e.unread).length;
    const metrics = [
      { label: "Emails synced", value: String(emails.length) },
      { label: "Unread", value: String(unread) },
    ];
    const warnings = [];
    if (unread > 5) warnings.push(`${unread} unread emails may need triage.`);
    return { metrics, warnings };
  },

  shopping: async (userId) => {
    const profile = await ShoppingProfile.findOne({ user: userId });
    const items = await ShoppingItem.find({ user: userId });
    const spent = items.filter((i) => i.bought).reduce((sum, i) => sum + i.price, 0);
    const budgetCap = profile?.budgetCap ?? 0;
    const metrics = [
      { label: "Budget cap", value: `$${budgetCap.toFixed(2)}` },
      { label: "Wishlist items", value: String(items.length) },
      { label: "Spent so far", value: `$${spent.toFixed(2)}` },
    ];
    const warnings = [];
    if (items.length === 0) warnings.push("No wishlist items have been added.");
    if (spent > budgetCap) {
      warnings.push(`Spending ($${spent.toFixed(2)}) exceeds the budget cap ($${budgetCap.toFixed(2)}).`);
    }
    return { metrics, warnings };
  },

  dashboard: async (userId) => {
    const goals = await Goals.findOne({ user: userId });
    const metrics = [
      { label: "Primary goal", value: goals?.primaryGoal || "—" },
      { label: "Focus areas", value: goals?.focusAreas?.length ? goals.focusAreas.join(", ") : "—" },
    ];
    const warnings = [];
    if (!goals || goals.focusAreas.length === 0) warnings.push("No focus areas have been selected yet.");
    return { metrics, warnings };
  },
};

export async function buildModuleSnapshot(moduleName, userId) {
  const builder = BUILDERS[moduleName];
  if (!builder) {
    return { metrics: [], warnings: [`No data snapshot is defined for module "${moduleName}".`] };
  }
  try {
    return await builder(userId);
  } catch (err) {
    return { metrics: [], warnings: [`Couldn't load ${moduleName} data: ${err.message}`] };
  }
}
