import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import ChatWidget from "../components/ChatWidget";
import SourceChecklist from "../components/SourceChecklist";

export default function Study() {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [taskInput, setTaskInput] = useState("");
  const [streak, setStreak] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/study")
      .then(({ data }) => {
        setStreak(data.streak);
        setTasks(data.tasks);
      })
      .catch((err) => console.error("Failed to load study data:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let timer = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      api
        .post("/study/streak/increment")
        .then(({ data }) => setStreak(data.streak))
        .catch((err) => console.error("Failed to update streak:", err));
      alert("Pomodoro Session Complete! Streak increased 🔥");
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleTask = async (id) => {
    try {
      const { data } = await api.patch(`/study/tasks/${id}`);
      setTasks(tasks.map((t) => (t._id === id ? data : t)));
    } catch (err) {
      console.error("Failed to update task:", err);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!taskInput) return;
    try {
      const { data } = await api.post("/study/tasks", { text: taskInput });
      setTasks([...tasks, data]);
      setTaskInput("");
    } catch (err) {
      console.error("Failed to add task:", err);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-violet-900/40 pb-6 mb-8 gap-4">
          <div>
            <span className="text-xs font-mono text-violet-400 uppercase tracking-widest">LifeOS Module</span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mt-1">Study & Focus Hub</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 text-sm font-semibold text-violet-300 bg-violet-950/60 border border-violet-800/50 rounded-lg hover:bg-violet-900/50 transition-all cursor-pointer"
            >
              &larr; Back to Dashboard
            </button>

            <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 rounded-xl">
              <span className="text-xl">🔥</span>
              <div>
                <div className="text-xs font-bold text-amber-300">{streak} Day Streak</div>
                <div className="text-[10px] text-slate-400">Focus Sessions Active</div>
              </div>
            </div>
          </div>
        </div>

        <SourceChecklist module="study" title="Study Source Checklist" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 rounded-2xl bg-indigo-950/30 border border-violet-900/40 backdrop-blur-md flex flex-col items-center justify-center text-center">
            <h2 className="text-sm font-bold text-violet-300 uppercase tracking-wider mb-4">Pomodoro Timer</h2>
            <div className="text-6xl font-black text-white font-mono mb-8">{formatTime(timeLeft)}</div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="px-6 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-violet-400 to-fuchsia-400 rounded-lg hover:opacity-90 cursor-pointer"
              >
                {isRunning ? "Pause" : "Start Focus Session"}
              </button>
              <button
                onClick={() => { setIsRunning(false); setTimeLeft(25 * 60); }}
                className="px-4 py-2.5 text-xs font-semibold text-slate-400 bg-slate-800/60 rounded-lg hover:text-white cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-indigo-950/30 border border-violet-900/40 backdrop-blur-md">
            <h2 className="text-lg font-bold text-slate-100 mb-4">Study Tasks</h2>
            <form onSubmit={addTask} className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="New study goal..."
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-slate-900 border border-violet-900/50 rounded-lg text-slate-100 focus:outline-none"
              />
              <button type="submit" className="px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-violet-400 to-fuchsia-400 rounded-lg cursor-pointer">
                Add
              </button>
            </form>
            {loading ? (
              <p className="text-slate-400 text-sm">Loading tasks...</p>
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task._id}
                    onClick={() => toggleTask(task._id)}
                    className="p-3 rounded-xl bg-slate-900/60 border border-violet-900/30 flex items-center justify-between cursor-pointer"
                  >
                    <span className={`text-xs font-medium ${task.completed ? "line-through text-slate-500" : "text-slate-200"}`}>
                      {task.text}
                    </span>
                    <span className="text-xs">{task.completed ? "✅" : "⭕"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <ChatWidget module="study" label="Study Coach" context={{ streak, tasks, timeLeft, isRunning }} />
    </div>
  );
}
