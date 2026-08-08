import React, { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import { downloadReviewPacket } from "../utils/exportReviewPacket";

// Shown when a record on the Agent Tasks page is opened for review. Fetches
// the structured packet (generated sections + validation warnings + missing
// fields + notes) fresh every time it opens, lets the reviewer add/remove
// notes on the spot, and exports the whole thing as a downloadable file.
export default function ReviewPacketPanel({ taskId, moduleLabel, onClose }) {
  const [packet, setPacket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [noteError, setNoteError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    api
      .get(`/agent-tasks/${taskId}/review-packet`)
      .then(({ data }) => setPacket(data))
      .catch((err) => setError(err.response?.data?.message || "Couldn't generate the review packet."))
      .finally(() => setLoading(false));
  }, [taskId]);

  useEffect(() => {
    load();
  }, [load]);

  const submitNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setAddingNote(true);
    setNoteError(null);
    try {
      const { data } = await api.post(`/agent-tasks/${taskId}/notes`, { text: noteText.trim() });
      setPacket((prev) => (prev ? { ...prev, userNotes: data.userNotes } : prev));
      setNoteText("");
    } catch (err) {
      setNoteError(err.response?.data?.message || "Couldn't save that note.");
    } finally {
      setAddingNote(false);
    }
  };

  const removeNote = async (noteId) => {
    try {
      const { data } = await api.delete(`/agent-tasks/${taskId}/notes/${noteId}`);
      setPacket((prev) => (prev ? { ...prev, userNotes: data.userNotes } : prev));
    } catch (err) {
      setNoteError(err.response?.data?.message || "Couldn't remove that note.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/80 backdrop-blur-sm px-4 py-8">
      <div className="w-full max-w-3xl rounded-2xl bg-slate-950 border border-violet-900/50 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-violet-900/40 sticky top-0 bg-slate-950 rounded-t-2xl z-10">
          <div>
            <span className="text-[10px] font-mono text-violet-400 uppercase tracking-widest">Review Packet</span>
            <h2 className="text-lg font-bold text-white">{moduleLabel}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => packet && downloadReviewPacket(packet)}
              disabled={!packet}
              className="px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-lg hover:opacity-90 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-all"
            >
              ⬇ Export Packet
            </button>
            <button
              onClick={onClose}
              className="px-3 py-2 text-xs font-semibold text-slate-300 bg-slate-900/70 border border-violet-900/40 rounded-lg hover:bg-slate-800/70 cursor-pointer transition-all"
            >
              ✕ Close
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-6">
          {loading ? (
            <p className="text-xs text-slate-500">Generating review packet…</p>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30">
              <p className="text-xs text-rose-300">{error}</p>
            </div>
          ) : packet ? (
            <>
              {/* Meta strip */}
              <div className="p-4 rounded-xl bg-indigo-950/30 border border-violet-900/40 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-slate-400">
                  Owner: <span className="text-slate-200 font-semibold">{packet.meta.owner?.name || "Unknown"}</span>
                  <span className="mx-2 text-slate-700">·</span>
                  Generated: <span className="text-slate-200">{new Date(packet.meta.generatedAt).toLocaleString()}</span>
                </p>
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    packet.meta.checklist.complete ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
                  }`}
                >
                  {packet.meta.checklist.done}/{packet.meta.checklist.total} sources ready
                </span>
              </div>

              {/* Generated sections */}
              {packet.generatedSections.map((s) => (
                <div key={s.id}>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-bold text-slate-100">{s.heading}</h3>
                    <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {s.source === "ai" ? "AI-generated" : "Template"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{s.body}</p>
                </div>
              ))}

              {/* Key metrics */}
              <div>
                <h3 className="text-sm font-bold text-slate-100 mb-2">Key Metrics</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {packet.metrics.map((m) => (
                    <div
                      key={m.label}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/60 border border-violet-900/30"
                    >
                      <span className="text-[11px] text-slate-400">{m.label}</span>
                      <span className="text-xs font-semibold text-slate-200">{m.value}</span>
                    </div>
                  ))}
                  {packet.metrics.length === 0 && <p className="text-xs text-slate-500">No metrics available.</p>}
                </div>
              </div>

              {/* Validation warnings */}
              <div>
                <h3 className="text-sm font-bold text-slate-100 mb-2">
                  Validation Warnings <span className="text-slate-500 font-normal">({packet.validationWarnings.length})</span>
                </h3>
                {packet.validationWarnings.length === 0 ? (
                  <p className="text-xs text-slate-500">No validation warnings were flagged.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {packet.validationWarnings.map((w) => (
                      <li key={w.id} className="text-xs text-amber-300 flex gap-2">
                        <span>⚠</span>
                        <span>{w.message}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Missing fields */}
              <div>
                <h3 className="text-sm font-bold text-slate-100 mb-2">
                  Missing Fields <span className="text-slate-500 font-normal">({packet.missingFields.length})</span>
                </h3>
                {packet.missingFields.length === 0 ? (
                  <p className="text-xs text-slate-500">All required sources are marked complete.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {packet.missingFields.map((f) => (
                      <li key={f.key} className="text-xs text-rose-300 flex gap-2">
                        <span>○</span>
                        <span>{f.label}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Reviewer notes */}
              <div>
                <h3 className="text-sm font-bold text-slate-100 mb-2">
                  Reviewer Notes <span className="text-slate-500 font-normal">({packet.userNotes.length})</span>
                </h3>
                <div className="space-y-2 mb-3">
                  {packet.userNotes.length === 0 ? (
                    <p className="text-xs text-slate-500">No notes yet — add one below.</p>
                  ) : (
                    packet.userNotes.map((n) => (
                      <div
                        key={n.id}
                        className="p-3 rounded-xl bg-slate-900/60 border-l-2 border-violet-500 flex items-start justify-between gap-2"
                      >
                        <div>
                          <p className="text-xs text-slate-200">{n.text}</p>
                          <p className="text-[10px] text-slate-500 mt-1">
                            {n.author} · {new Date(n.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => removeNote(n.id)}
                          className="text-[10px] text-slate-500 hover:text-rose-300 cursor-pointer shrink-0"
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>
                {noteError && <p className="text-[11px] text-rose-300 mb-2">{noteError}</p>}
                <form onSubmit={submitNote} className="flex gap-2">
                  <input
                    type="text"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Add a reviewer note…"
                    className="flex-1 px-3 py-2 text-xs rounded-lg bg-slate-900/70 border border-violet-900/40 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-600"
                  />
                  <button
                    type="submit"
                    disabled={addingNote || !noteText.trim()}
                    className="px-3.5 py-2 text-xs font-bold text-slate-950 bg-violet-400 rounded-lg hover:opacity-90 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-all"
                  >
                    {addingNote ? "Adding…" : "Add note"}
                  </button>
                </form>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
