import React, { useEffect, useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import ReviewPacketPanel from "../components/ReviewPacketPanel";

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

export default function AgentTasks() {
  const navigate = useNavigate();

  const [roles, setRoles] = useState([]);
  const [currentRole, setCurrentRole] = useState("user");
  const [activeTab, setActiveTab] = useState("user");

  const [result, setResult] = useState({ count: 0, records: [], scope: "own" });
  const [locked, setLocked] = useState(null); // error message when 403
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [reviewTask, setReviewTask] = useState(null); // { id, moduleLabel } while the packet modal is open

  const loadRoles = useCallback(() => {
    setLoadingRoles(true);
    return api
      .get("/agent-tasks/roles")
      .then(({ data }) => {
        setRoles(data.roles || []);
        setCurrentRole(data.currentRole || "user");
      })
      .catch(() => {})
      .finally(() => setLoadingRoles(false));
  }, []);

  const loadRecords = useCallback((role) => {
    setLoadingRecords(true);
    setLocked(null);
    api
      .get("/agent-tasks", { params: { role } })
      .then(({ data }) => setResult({ count: data.count, records: data.records, scope: data.scope }))
      .catch((err) => {
        setResult({ count: 0, records: [], scope: "own" });
        setLocked(err.response?.data?.message || "You don't have access to this role's records.");
      })
      .finally(() => setLoadingRecords(false));
  }, []);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  useEffect(() => {
    loadRecords(activeTab);
  }, [activeTab, loadRecords]);

  const grantSelfRole = async (role) => {
    setSwitching(true);
    try {
      const { data } = await api.patch("/auth/role", { role });
      const stored = JSON.parse(localStorage.getItem("lifeos_user") || "{}");
      localStorage.setItem("lifeos_user", JSON.stringify({ ...stored, role: data.user.role }));
      await loadRoles();
      loadRecords(activeTab);
    } catch (err) {
      console.error("Failed to switch role:", err);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-violet-900/40 pb-6 mb-8 gap-4">
          <div>
            <span className="text-xs font-mono text-violet-400 uppercase tracking-widest">LifeOS Module</span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mt-1">Agent Task Records</h1>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 text-sm font-semibold text-violet-300 bg-violet-950/60 border border-violet-800/50 rounded-lg hover:bg-violet-900/50 transition-all cursor-pointer self-start md:self-auto"
          >
            &larr; Back to Dashboard
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-950/30 border border-violet-900/40 backdrop-blur-md mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            Your current role: <span className="font-bold text-violet-300">{loadingRoles ? "…" : currentRole}</span>{" "}
            — switch roles below to demo how the record list changes.
          </p>
          {currentRole !== "user" && (
            <button
              onClick={() => grantSelfRole("user")}
              disabled={switching}
              className="text-[11px] font-semibold text-slate-400 hover:text-white underline cursor-pointer disabled:opacity-50 self-start sm:self-auto"
            >
              Reset to 'user'
            </button>
          )}
        </div>

        {/* Role tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {roles.map((r) => (
            <button
              key={r.value}
              onClick={() => setActiveTab(r.value)}
              title={r.description}
              className={`px-4 py-2 text-xs font-bold rounded-full border transition-all cursor-pointer ${
                activeTab === r.value
                  ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border-transparent"
                  : r.unlocked
                  ? "bg-slate-900/60 text-slate-300 border-violet-900/40 hover:border-violet-700/60"
                  : "bg-slate-900/30 text-slate-500 border-slate-800/60"
              }`}
            >
              {r.label}
              {!r.unlocked && <span className="ml-1">🔒</span>}
            </button>
          ))}
        </div>

        {/* Scoped results */}
        <div className="p-6 rounded-2xl bg-indigo-950/30 border border-violet-900/40 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-100">
              {roles.find((r) => r.value === activeTab)?.label || activeTab} view
            </h2>
            <div className="flex items-center gap-2">
              {!loadingRecords && !locked && (
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    result.scope === "all_users"
                      ? "bg-rose-500/20 text-rose-300"
                      : "bg-slate-700/50 text-slate-300"
                  }`}
                >
                  {result.scope === "all_users" ? "🔓 All users" : "🔒 Your records only"}
                </span>
              )}
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-violet-500/20 text-violet-300">
                {loadingRecords ? "…" : `${result.count} record${result.count === 1 ? "" : "s"}`}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            {roles.find((r) => r.value === activeTab)?.description}
          </p>

          {loadingRecords ? (
            <p className="text-xs text-slate-500">Loading records…</p>
          ) : locked ? (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <p className="text-xs text-amber-300 mb-3">{locked}</p>
              <button
                onClick={() => grantSelfRole(activeTab)}
                disabled={switching}
                className="px-3 py-1.5 text-[11px] font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-orange-400 rounded-lg hover:opacity-90 cursor-pointer disabled:opacity-50"
              >
                {switching ? "Switching…" : `Grant myself '${activeTab}' role (demo)`}
              </button>
            </div>
          ) : result.records.length === 0 ? (
            <p className="text-xs text-slate-500">No records in this view yet.</p>
          ) : (
            <div className="space-y-2">
              {result.records.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3 rounded-xl bg-slate-900/60 border border-violet-900/30 flex items-center justify-between gap-3 flex-wrap"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        rec.complete ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
                      }`}
                    >
                      {rec.done}/{rec.total}
                    </span>
                    <span className="text-xs font-semibold text-slate-200">
                      {MODULE_LABELS[rec.module] || rec.module}
                    </span>
                    {rec.owner && (activeTab !== "user") && (
                      <span className="text-[11px] text-slate-500">{rec.owner.name}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-500">
                      {new Date(rec.updatedAt).toLocaleString()}
                    </span>
                    <button
                      onClick={() =>
                        setReviewTask({ id: rec.id, moduleLabel: MODULE_LABELS[rec.module] || rec.module })
                      }
                      className="px-2.5 py-1 text-[10px] font-bold text-violet-300 bg-violet-950/60 border border-violet-800/50 rounded-full hover:bg-violet-900/50 transition-all cursor-pointer"
                    >
                      📄 Review Packet
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {reviewTask && (
        <ReviewPacketPanel
          taskId={reviewTask.id}
          moduleLabel={reviewTask.moduleLabel}
          onClose={() => setReviewTask(null)}
        />
      )}
    </div>
  );
}
