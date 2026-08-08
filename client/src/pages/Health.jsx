import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import ChatWidget from "../components/ChatWidget";
import SourceChecklist from "../components/SourceChecklist";

export default function Health() {
  const navigate = useNavigate();

  const [waterIntake, setWaterIntake] = useState(0);
  const [workoutDone, setWorkoutDone] = useState(false);
  const [calorieInput, setCalorieInput] = useState("");
  const [caloriesLogged, setCaloriesLogged] = useState(0);
  const [reminderActive, setReminderActive] = useState(false);
  const [loading, setLoading] = useState(true);

  const [bpm, setBpm] = useState(72);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [bpmStatus, setBpmStatus] = useState("Normal");

  useEffect(() => {
    api
      .get("/health")
      .then(({ data }) => {
        setWaterIntake(data.waterIntake);
        setWorkoutDone(data.workoutDone);
        setCaloriesLogged(data.caloriesLogged);
        setReminderActive(data.reminderActive);
        setBpm(data.bpm);
        setBpmStatus(data.bpmStatus);
      })
      .catch((err) => console.error("Failed to load health data:", err))
      .finally(() => setLoading(false));
  }, []);

  const patchHealth = (updates) => {
    api.patch("/health", updates).catch((err) => console.error("Failed to save health data:", err));
  };

  // 60-Minute Reminder Effect
  useEffect(() => {
    if (loading) return;
    patchHealth({ reminderActive });
    let interval = null;

    if (reminderActive) {
      if ("Notification" in window && Notification.permission !== "granted") {
        Notification.requestPermission();
      }

      interval = setInterval(() => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.value = 587.33;
        gain.gain.setValueAtTime(0.1, audioContext.currentTime);
        osc.start();
        osc.stop(audioContext.currentTime + 0.3);

        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("LifeOS Hydration Alert 💧", {
            body: "Time to drink some water! Stay hydrated.",
          });
        }
      }, 3600000);
    }

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reminderActive]);

  const handleMeasurePulse = () => {
    setIsMeasuring(true);
    let count = 0;
    const interval = setInterval(() => {
      const simulatedBpm = Math.floor(Math.random() * (88 - 68 + 1)) + 68;
      setBpm(simulatedBpm);
      count++;

      if (count >= 10) {
        clearInterval(interval);
        setIsMeasuring(false);
        const status = simulatedBpm > 82 ? "Slightly Elevated" : simulatedBpm < 70 ? "Resting" : "Optimal";
        setBpmStatus(status);
        patchHealth({ bpm: simulatedBpm, bpmStatus: status });
      }
    }, 300);
  };

  const addWater = (amount) => {
    const next = amount === 0 ? 0 : waterIntake + amount;
    setWaterIntake(next);
    patchHealth({ waterIntake: next });
  };

  const toggleWorkout = () => {
    const next = !workoutDone;
    setWorkoutDone(next);
    patchHealth({ workoutDone: next });
  };

  const addCalories = (e) => {
    e.preventDefault();
    if (!calorieInput) return;
    const next = caloriesLogged + parseInt(calorieInput, 10);
    setCaloriesLogged(next);
    patchHealth({ caloriesLogged: next });
    setCalorieInput("");
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-violet-900/40 pb-6 mb-8 gap-4">
          <div>
            <span className="text-xs font-mono text-violet-400 uppercase tracking-widest">
              LifeOS Module
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mt-1">
              Health & Vitals Tracker
            </h1>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 text-sm font-semibold text-violet-300 bg-violet-950/60 border border-violet-800/50 rounded-lg hover:bg-violet-900/50 transition-all cursor-pointer self-start md:self-auto"
          >
            &larr; Back to Dashboard
          </button>
        </div>

        <SourceChecklist module="health" title="Health Source Checklist" />

        {loading ? (
          <p className="text-slate-400 text-sm">Loading your health data...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Heart Rate */}
            <div className="p-6 rounded-2xl bg-indigo-950/30 border border-violet-900/40 backdrop-blur-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-100">Heart Rate</h2>
                  <div className={`p-2 rounded-lg bg-rose-500/10 text-rose-400 ${isMeasuring ? "animate-ping" : ""}`}>
                    ❤️
                  </div>
                </div>
                <div className="flex items-baseline space-x-2 mb-2">
                  <span className="text-4xl font-black text-white">{bpm}</span>
                  <span className="text-sm text-slate-400 font-medium">BPM</span>
                </div>
                <div className="text-xs text-slate-400 mb-6">
                  Status: <strong className="text-slate-200">{bpmStatus}</strong>
                </div>
              </div>
              <button
                onClick={handleMeasurePulse}
                disabled={isMeasuring}
                className="w-full py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:opacity-90 active:scale-95"
              >
                {isMeasuring ? "Measuring..." : "Measure Heartbeat"}
              </button>
            </div>

            {/* Water Hydration */}
            <div className="p-6 rounded-2xl bg-indigo-950/30 border border-violet-900/40 backdrop-blur-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-bold text-slate-100">Hydration</h2>
                  <span className="p-2 rounded-lg bg-blue-500/10 text-blue-400">💧</span>
                </div>

                <div className="flex items-center justify-between mb-4 bg-slate-900/80 p-2 rounded-lg border border-violet-900/30">
                  <span className="text-[10px] text-slate-300 font-medium">60-Min Reminder</span>
                  <button
                    onClick={() => setReminderActive(!reminderActive)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                      reminderActive ? "bg-cyan-400 text-slate-950" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {reminderActive ? "ON" : "OFF"}
                  </button>
                </div>

                <p className="text-3xl font-extrabold text-white mb-1">
                  {(waterIntake / 1000).toFixed(2)} <span className="text-sm font-normal text-slate-400">/ 2.5 L</span>
                </p>
                <div className="w-full bg-slate-800 rounded-full h-2 mb-6">
                  <div
                    className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((waterIntake / 2500) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => addWater(250)}
                  className="flex-1 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-300 rounded-lg hover:opacity-90 cursor-pointer"
                >
                  +250 ml
                </button>
                <button
                  onClick={() => addWater(0)}
                  className="px-3 py-2 text-xs font-semibold text-slate-400 bg-slate-800/60 hover:text-rose-400 rounded-lg cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Workout */}
            <div className="p-6 rounded-2xl bg-indigo-950/30 border border-violet-900/40 backdrop-blur-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-100">Workout</h2>
                  <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">🏃</span>
                </div>
                <p className="text-xl font-bold text-white mb-2">
                  Status:{" "}
                  <span className={workoutDone ? "text-emerald-400" : "text-amber-400"}>
                    {workoutDone ? "Completed 🎉" : "Pending"}
                  </span>
                </p>
              </div>
              <button
                onClick={toggleWorkout}
                className={`w-full py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  workoutDone
                    ? "bg-slate-800 text-slate-300"
                    : "bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 hover:opacity-90"
                }`}
              >
                {workoutDone ? "Mark Incomplete" : "Mark Complete"}
              </button>
            </div>

            {/* Calories */}
            <div className="p-6 rounded-2xl bg-indigo-950/30 border border-violet-900/40 backdrop-blur-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-100">Calories</h2>
                  <span className="p-2 rounded-lg bg-fuchsia-500/10 text-fuchsia-400">🔥</span>
                </div>
                <p className="text-3xl font-extrabold text-white mb-4">
                  {caloriesLogged} <span className="text-sm font-normal text-slate-400">kcal</span>
                </p>
              </div>
              <form onSubmit={addCalories} className="flex gap-2">
                <input
                  type="number"
                  value={calorieInput}
                  onChange={(e) => setCalorieInput(e.target.value)}
                  placeholder="kcal"
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-violet-900/50 rounded-lg text-slate-100 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-fuchsia-400 to-violet-400 rounded-lg hover:opacity-90 cursor-pointer"
                >
                  + Add
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      <ChatWidget
        module="health"
        label="Health Coach"
        context={{ waterIntake, workoutDone, caloriesLogged, bpm, bpmStatus }}
      />
    </div>
  );
}
