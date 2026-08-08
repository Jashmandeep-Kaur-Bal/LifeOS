import React, { useEffect, useState } from "react";
import api from "../services/api";

// Lightweight checklist of the inputs/sources this module's AI assistant
// needs before you should trust it for a summary, generation, or review.
// Lives right on the module page (not tucked inside the chat popup) so it's
// visible at a glance.
export default function SourceChecklist({ module, title = "Source Checklist" }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get(`/checklist/${module}`)
      .then(({ data }) => {
        if (!cancelled) setItems(data.items || []);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [module]);

  const total = items.length;
  const done = items.filter((i) => i.completed).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const allDone = total > 0 && done === total;

  const toggle = async (item) => {
    const nextCompleted = !item.completed;
    setItems((prev) => prev.map((i) => (i.key === item.key ? { ...i, completed: nextCompleted } : i)));
    setSavingKey(item.key);
    try {
      const { data } = await api.patch(`/checklist/${module}`, {
        key: item.key,
        completed: nextCompleted,
      });
      setItems(data.items || []);
    } catch (err) {
      setItems((prev) => prev.map((i) => (i.key === item.key ? { ...i, completed: item.completed } : i)));
    } finally {
      setSavingKey(null);
    }
  };

  if (!loading && total === 0) return null;

  return (
    <div className="p-6 rounded-2xl bg-indigo-950/30 border border-violet-900/40 backdrop-blur-md mb-8">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-bold text-slate-100">{title}</h2>
        {total > 0 && (
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              allDone ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
            }`}
          >
            {allDone ? "✓ Ready for AI" : `${done}/${total} ready`}
          </span>
        )}
      </div>
      <p className="text-xs text-slate-400 mb-4">
        Required inputs for this module's AI assistant — complete these before generating or reviewing.
      </p>

      {total > 0 && (
        <div className="w-full h-1.5 rounded-full bg-slate-800/80 overflow-hidden mb-5">
          <div
            className={`h-full rounded-full transition-all ${allDone ? "bg-emerald-400" : "bg-gradient-to-r from-violet-400 to-fuchsia-400"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      {loading ? (
        <p className="text-xs text-slate-500">Loading checklist…</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {items.map((item) => (
            <label
              key={item.key}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-violet-900/30 cursor-pointer hover:border-violet-700/50 transition-colors"
            >
              <input
                type="checkbox"
                checked={item.completed}
                disabled={savingKey === item.key}
                onChange={() => toggle(item)}
                className="w-4 h-4 accent-violet-500 cursor-pointer disabled:opacity-50 shrink-0"
              />
              <span
                className={`text-xs font-medium ${item.completed ? "line-through text-slate-500" : "text-slate-200"}`}
              >
                {item.label}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
