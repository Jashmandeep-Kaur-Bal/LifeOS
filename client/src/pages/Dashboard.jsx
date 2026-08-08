import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import ChatWidget from "../components/ChatWidget";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Dashboard() {
  const navigate = useNavigate();

  const [water, setWater] = useState(0);
  const [workout, setWorkout] = useState(false);
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState({
    waterGoalMl: 2500,
    taskGoalPerDay: 3,
    monthlyBudget: 2000,
    primaryGoal: "",
    focusAreas: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/health"), api.get("/study"), api.get("/finance"), api.get("/goals")])
      .then(([healthRes, studyRes, financeRes, goalsRes]) => {
        setWater(healthRes.data.waterIntake);
        setWorkout(healthRes.data.workoutDone);

        const tasks = studyRes.data.tasks || [];
        setTotalTasks(tasks.length);
        setTasksCompleted(tasks.filter((t) => t.completed).length);

        setBalance(financeRes.data.balance);
        setTransactions(financeRes.data.transactions || []);

        setGoals(goalsRes.data);
      })
      .catch((err) => console.error("Failed to load dashboard data:", err))
      .finally(() => setLoading(false));
  }, []);

  // Compute Daily Progress Percentage — personalized to THIS user's goals,
  // so two different accounts with different data/goals get different scores.
  const waterScore = Math.min(water / (goals.waterGoalMl || 2500), 1) * 25;
  const workoutScore = workout ? 25 : 0;
  const taskScore = Math.min(tasksCompleted / (goals.taskGoalPerDay || 1), 1) * 25;

  // Budget score: how much of THIS user's monthly budget they've spent so far
  // (this used to be a flat 25 for everyone — now it reflects real spending).
  // Full marks while under budget; score decays linearly once they go over.
  const totalSpent = transactions.reduce((sum, t) => sum + t.amt, 0);
  const budgetRatio = goals.monthlyBudget > 0 ? totalSpent / goals.monthlyBudget : 0;
  const budgetScore = budgetRatio <= 1 ? 25 : Math.max(0, 25 - (budgetRatio - 1) * 25);

  const overallProgress = Math.round(waterScore + workoutScore + taskScore + budgetScore);

  const cards = [
    {
      title: "Health",
      stat: `${water}ml Water • ${workout ? "Workout Done" : "Workout Pending"}`,
      path: "/health",
      color: "from-rose-500/20 to-pink-500/20",
    },
    {
      title: "Finance",
      stat: `$${totalSpent.toLocaleString()} spent of $${(goals.monthlyBudget || 0).toLocaleString()} budget`,
      path: "/finance",
      color: "from-emerald-500/20 to-teal-500/20",
    },
    { title: "Study", stat: `${tasksCompleted}/${goals.taskGoalPerDay || totalTasks || 1} Daily Tasks Completed`, path: "/study", color: "from-violet-500/20 to-purple-500/20" },
    { title: "Travel", stat: "Itineraries Active", path: "/travel", color: "from-cyan-500/20 to-blue-500/20" },
    { title: "Calendar", stat: "Priority Agenda Active", path: "/calendar", color: "from-amber-500/20 to-orange-500/20" },
    { title: "Email", stat: "Smart Inbox Active", path: "/email", color: "from-fuchsia-500/20 to-pink-500/20" },
    { title: "Shopping", stat: "Wishlist Budget Cap Active", path: "/shopping", color: "from-indigo-500/20 to-blue-500/20" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-violet-900/40 pb-6 mb-8 gap-6">
          <div>
            <span className="text-xs font-mono text-violet-400 uppercase tracking-widest">Overview</span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mt-1">LifeOS Control Center</h1>
            {goals.primaryGoal && (
              <p className="text-xs text-slate-400 mt-2">
                Focused on: <span className="text-violet-300 font-semibold">{goals.primaryGoal}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-4 bg-indigo-950/40 p-4 rounded-2xl border border-violet-900/40 backdrop-blur-md self-start">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-fuchsia-400 transition-all duration-1000 ease-out"
                  strokeDasharray={`${overallProgress}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-xs font-extrabold text-white">{loading ? "…" : overallProgress}%</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Daily Score</h3>
              <p className="text-[11px] text-slate-400">Workout + Water + Tasks + Budget</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, idx) => (
            <div
              key={idx}
              onClick={() => navigate(card.path)}
              className={`p-6 rounded-2xl bg-gradient-to-br ${card.color} border border-violet-900/40 backdrop-blur-md hover:border-fuchsia-400/50 transition-all cursor-pointer hover:-translate-y-1`}
            >
              <h2 className="text-xl font-bold text-white mb-2">{card.title}</h2>
              <p className="text-xs font-mono text-slate-300">{card.stat}</p>
              <div className="mt-4 text-xs font-semibold text-violet-300">Open Module &rarr;</div>
            </div>
          ))}
        </div>
      </main>

      <ChatWidget
        module="dashboard"
        label="LifeOS Assistant"
        context={{ overallProgress, water, workout, tasksCompleted, totalSpent, goals }}
      />
    </div>
  );
}
