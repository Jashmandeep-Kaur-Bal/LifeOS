import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const FOCUS_OPTIONS = ["Health & Fitness", "Finance & Budgeting", "Study & Productivity", "Travel", "Organization"];

export default function Onboarding() {
  const navigate = useNavigate();
  const [focusAreas, setFocusAreas] = useState([]);
  const [primaryGoal, setPrimaryGoal] = useState("");
  const [waterGoalMl, setWaterGoalMl] = useState(2500);
  const [workoutGoalPerWeek, setWorkoutGoalPerWeek] = useState(5);
  const [taskGoalPerDay, setTaskGoalPerDay] = useState(3);
  const [monthlyBudget, setMonthlyBudget] = useState(2000);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const toggleFocus = (option) => {
    setFocusAreas((prev) => (prev.includes(option) ? prev.filter((f) => f !== option) : [...prev, option]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await api.put("/goals", {
        focusAreas,
        primaryGoal,
        waterGoalMl: Number(waterGoalMl),
        workoutGoalPerWeek: Number(workoutGoalPerWeek),
        taskGoalPerDay: Number(taskGoalPerDay),
        monthlyBudget: Number(monthlyBudget),
      });

      // Reflect onboarded status locally so ProtectedRoute lets the user through.
      const storedUser = JSON.parse(localStorage.getItem("lifeos_user") || "{}");
      localStorage.setItem("lifeos_user", JSON.stringify({ ...storedUser, onboarded: true }));

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't save your goals. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-12">
        <span className="text-xs font-mono text-violet-400 uppercase tracking-widest">Welcome to LifeOS</span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mt-1 mb-2">Let's set up your dashboard</h1>
        <p className="text-sm text-slate-400 mb-8">
          A few quick questions so your Daily Score and modules reflect your goals — not defaults.
        </p>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="p-6 rounded-2xl bg-indigo-950/30 border border-violet-900/40 backdrop-blur-md">
            <h2 className="text-sm font-bold text-white mb-4">What do you want LifeOS to help with most?</h2>
            <div className="flex flex-wrap gap-2">
              {FOCUS_OPTIONS.map((option) => (
                <button
                  type="button"
                  key={option}
                  onClick={() => toggleFocus(option)}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    focusAreas.includes(option)
                      ? "bg-gradient-to-r from-violet-400 to-fuchsia-400 text-slate-950 border-transparent"
                      : "bg-slate-900 text-slate-300 border-violet-900/50 hover:border-fuchsia-400/50"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-indigo-950/30 border border-violet-900/40 backdrop-blur-md">
            <label className="block text-sm font-bold text-white mb-2">What's your main goal right now?</label>
            <input
              type="text"
              value={primaryGoal}
              onChange={(e) => setPrimaryGoal(e.target.value)}
              placeholder="e.g. Save for a trip, get back into shape, finish my thesis..."
              className="w-full px-4 py-2.5 text-xs bg-slate-900 border border-violet-900/50 rounded-lg text-slate-100 focus:outline-none focus:border-fuchsia-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-indigo-950/30 border border-violet-900/40 backdrop-blur-md">
              <label className="block text-sm font-bold text-white mb-2">Daily water goal (ml)</label>
              <input
                type="number"
                min="500"
                step="250"
                value={waterGoalMl}
                onChange={(e) => setWaterGoalMl(e.target.value)}
                className="w-full px-4 py-2.5 text-xs bg-slate-900 border border-violet-900/50 rounded-lg text-slate-100 focus:outline-none focus:border-fuchsia-400"
              />
            </div>

            <div className="p-6 rounded-2xl bg-indigo-950/30 border border-violet-900/40 backdrop-blur-md">
              <label className="block text-sm font-bold text-white mb-2">Workout days per week</label>
              <input
                type="number"
                min="0"
                max="7"
                value={workoutGoalPerWeek}
                onChange={(e) => setWorkoutGoalPerWeek(e.target.value)}
                className="w-full px-4 py-2.5 text-xs bg-slate-900 border border-violet-900/50 rounded-lg text-slate-100 focus:outline-none focus:border-fuchsia-400"
              />
            </div>

            <div className="p-6 rounded-2xl bg-indigo-950/30 border border-violet-900/40 backdrop-blur-md">
              <label className="block text-sm font-bold text-white mb-2">Tasks to complete per day</label>
              <input
                type="number"
                min="1"
                value={taskGoalPerDay}
                onChange={(e) => setTaskGoalPerDay(e.target.value)}
                className="w-full px-4 py-2.5 text-xs bg-slate-900 border border-violet-900/50 rounded-lg text-slate-100 focus:outline-none focus:border-fuchsia-400"
              />
            </div>

            <div className="p-6 rounded-2xl bg-indigo-950/30 border border-violet-900/40 backdrop-blur-md">
              <label className="block text-sm font-bold text-white mb-2">Monthly budget ($)</label>
              <input
                type="number"
                min="0"
                step="50"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(e.target.value)}
                className="w-full px-4 py-2.5 text-xs bg-slate-900 border border-violet-900/50 rounded-lg text-slate-100 focus:outline-none focus:border-fuchsia-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 text-xs font-bold text-slate-950 bg-gradient-to-r from-violet-400 via-fuchsia-300 to-indigo-400 rounded-lg hover:opacity-90 transition-all cursor-pointer shadow-lg disabled:opacity-50"
          >
            {saving ? "Saving..." : "Build My Dashboard"}
          </button>
        </form>
      </main>
    </div>
  );
}
