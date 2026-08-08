import React, { useState, useRef, useEffect } from "react";
import api from "../services/api";

// Floating per-task AI assistant. Drop it into any page with a `module`
// name (matches the persona on the server) and optional `context` — the
// current stats on that page — so the assistant's answers are relevant.
export default function ChatWidget({ module = "dashboard", label = "LifeOS Assistant", context = {} }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setSending(true);

    try {
      const { data } = await api.post("/chat", {
        module,
        message: text,
        history: nextMessages.map((m) => ({ role: m.role, content: m.content })),
        context,
      });
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong reaching the assistant.";
      setMessages((prev) => [...prev, { role: "assistant", content: msg }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-[0_0_25px_rgba(167,139,250,0.5)] flex items-center justify-center text-2xl hover:scale-105 active:scale-95 transition-transform cursor-pointer"
        aria-label="Open AI assistant"
      >
        {open ? "✕" : "✨"}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 h-[28rem] rounded-2xl bg-slate-950/95 border border-violet-900/50 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-violet-900/40 bg-indigo-950/40">
            <h3 className="text-sm font-bold text-white">{label}</h3>
            <p className="text-[11px] text-slate-400">Ask about this module — powered by Gemini</p>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 && (
              <p className="text-xs text-slate-500">
                Ask me anything about this module — tips, summaries, or what to do next.
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`text-xs leading-relaxed px-3 py-2 rounded-xl max-w-[85%] whitespace-pre-wrap ${
                  m.role === "user" ? "bg-violet-600/30 text-slate-100 ml-auto" : "bg-slate-800/70 text-slate-200"
                }`}
              >
                {m.content}
              </div>
            ))}
            {sending && <div className="text-xs text-slate-500">Thinking…</div>}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={send} className="p-3 border-t border-violet-900/40 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 text-xs bg-slate-900 border border-violet-900/50 rounded-lg text-slate-100 focus:outline-none"
            />
            <button
              type="submit"
              disabled={sending}
              className="px-3 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-violet-400 to-fuchsia-400 rounded-lg hover:opacity-90 cursor-pointer disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
