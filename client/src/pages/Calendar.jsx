import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import ChatWidget from "../components/ChatWidget";
import SourceChecklist from "../components/SourceChecklist";

export default function Calendar() {
  const navigate = useNavigate();
  const [eventTitle, setEventTitle] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [priority, setPriority] = useState("High");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/calendar")
      .then(({ data }) => setEvents(data))
      .catch((err) => console.error("Failed to load events:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!eventTitle || !eventTime) return;
    try {
      const { data } = await api.post("/calendar", { title: eventTitle, time: eventTime, priority });
      setEvents([...events, data]);
      setEventTitle("");
      setEventTime("");
    } catch (err) {
      console.error("Failed to add event:", err);
    }
  };

  const getPriorityBadge = (p) => {
    switch (p) {
      case "High":
        return "bg-rose-500/20 text-rose-300 border-rose-500/40";
      case "Medium":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      case "Low":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-violet-900/40 pb-6 mb-8 gap-4">
          <div>
            <span className="text-xs font-mono text-violet-400 uppercase tracking-widest">LifeOS Module</span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mt-1">Calendar & Priority Agenda</h1>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 text-sm font-semibold text-violet-300 bg-violet-950/60 border border-violet-800/50 rounded-lg hover:bg-violet-900/50 transition-all cursor-pointer"
          >
            &larr; Back to Dashboard
          </button>
        </div>

        <SourceChecklist module="calendar" title="Calendar Source Checklist" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-indigo-950/30 border border-violet-900/40 backdrop-blur-md">
            <h2 className="text-lg font-bold text-slate-100 mb-4">Schedule Event</h2>
            <form onSubmit={handleAddEvent} className="space-y-3">
              <input
                type="text"
                placeholder="Event Title"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-violet-900/50 rounded-lg text-slate-100 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Time (e.g. 04:00 PM)"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-violet-900/50 rounded-lg text-slate-100 focus:outline-none"
              />
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-violet-900/50 rounded-lg text-slate-100 focus:outline-none"
              >
                <option value="High">Priority: High</option>
                <option value="Medium">Priority: Medium</option>
                <option value="Low">Priority: Low</option>
              </select>
              <button
                type="submit"
                className="w-full py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-violet-400 to-fuchsia-400 rounded-lg hover:opacity-90 transition-all cursor-pointer"
              >
                + Schedule
              </button>
            </form>
          </div>

          <div className="p-6 rounded-2xl bg-indigo-950/30 border border-violet-900/40 backdrop-blur-md md:col-span-2">
            <h2 className="text-lg font-bold text-slate-100 mb-4">Priority Agenda</h2>
            {loading ? (
              <p className="text-slate-400 text-sm">Loading agenda...</p>
            ) : (
              <div className="space-y-3">
                {events.map((evt) => (
                  <div key={evt._id} className="p-4 rounded-xl bg-slate-900/60 border border-violet-900/30 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPriorityBadge(evt.priority)}`}>
                        {evt.priority}
                      </span>
                      <span className="text-sm font-semibold text-white">{evt.title}</span>
                    </div>
                    <span className="text-xs font-mono text-fuchsia-400 bg-fuchsia-500/10 px-3 py-1 rounded-md border border-fuchsia-500/20">
                      {evt.time}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <ChatWidget module="calendar" label="Schedule Assistant" context={{ events }} />
    </div>
  );
}
