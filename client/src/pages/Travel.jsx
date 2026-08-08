import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import ChatWidget from "../components/ChatWidget";
import SourceChecklist from "../components/SourceChecklist";

export default function Travel() {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/travel")
      .then(({ data }) => setTrips(data))
      .catch((err) => console.error("Failed to load trips:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleAddTrip = async (e) => {
    e.preventDefault();
    if (!destination || !date) return;
    try {
      const { data } = await api.post("/travel", { dest: destination, date });
      setTrips([data, ...trips]);
      setDestination("");
      setDate("");
    } catch (err) {
      console.error("Failed to add trip:", err);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-violet-900/40 pb-6 mb-8 gap-4">
          <div>
            <span className="text-xs font-mono text-violet-400 uppercase tracking-widest">LifeOS Module</span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mt-1">Travel & Trip Planner</h1>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 text-sm font-semibold text-violet-300 bg-violet-950/60 border border-violet-800/50 rounded-lg hover:bg-violet-900/50 transition-all cursor-pointer self-start md:self-auto"
          >
            &larr; Back to Dashboard
          </button>
        </div>

        <SourceChecklist module="travel" title="Travel Source Checklist" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-indigo-950/30 border border-violet-900/40 backdrop-blur-md">
            <h2 className="text-lg font-bold text-slate-100 mb-4">Plan New Trip</h2>
            <form onSubmit={handleAddTrip} className="space-y-3">
              <input
                type="text"
                placeholder="Destination City/Country"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-violet-900/50 rounded-lg text-slate-100 focus:outline-none focus:border-fuchsia-400"
              />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-violet-900/50 rounded-lg text-slate-100 focus:outline-none focus:border-fuchsia-400"
              />
              <button
                type="submit"
                className="w-full py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-violet-400 to-fuchsia-400 rounded-lg hover:opacity-90 transition-all cursor-pointer"
              >
                + Add Itinerary
              </button>
            </form>
          </div>

          <div className="p-6 rounded-2xl bg-indigo-950/30 border border-violet-900/40 backdrop-blur-md md:col-span-2">
            <h2 className="text-lg font-bold text-slate-100 mb-4">Upcoming Travel Itineraries</h2>
            {loading ? (
              <p className="text-slate-400 text-sm">Loading trips...</p>
            ) : (
              <div className="space-y-3">
                {trips.map((trip) => (
                  <div key={trip._id} className="p-4 rounded-xl bg-slate-900/60 border border-violet-900/30 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white">{trip.dest}</h3>
                      <p className="text-xs text-slate-400">Target Date: {trip.date}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-mono bg-violet-500/10 border border-violet-500/30 text-violet-300">
                      {trip.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <ChatWidget module="travel" label="Trip Planner" context={{ trips }} />
    </div>
  );
}
