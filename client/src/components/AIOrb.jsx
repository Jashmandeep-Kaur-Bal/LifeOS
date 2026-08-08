import React from "react";

export default function AIOrb() {
  return (
    <div className="relative w-full max-w-4xl mx-auto my-8">
      {/* Soft Background Glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-violet-600/30 via-fuchsia-600/20 to-indigo-600/30 rounded-2xl blur-xl opacity-75"></div>

      {/* Hero Preview Card */}
      <div className="relative rounded-2xl bg-slate-900/80 border border-violet-900/50 backdrop-blur-xl p-6 shadow-2xl">
        {/* Window Bar Header */}
        <div className="flex items-center justify-between pb-4 border-b border-violet-900/40 mb-6">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
          </div>
          <div className="text-xs font-mono text-slate-400 bg-slate-950/60 px-3 py-1 rounded-md border border-violet-900/30">
            lifeos.app/workspace
          </div>
          <div className="w-12"></div>
        </div>

        {/* Mockup Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          <div className="p-4 rounded-xl bg-violet-950/40 border border-violet-900/30">
            <div className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-1">Productivity</div>
            <div className="text-xl font-bold text-slate-100">84% Completed</div>
            <p className="text-xs text-slate-400 mt-1">12 tasks synced today</p>
          </div>

          <div className="p-4 rounded-xl bg-violet-950/40 border border-violet-900/30">
            <div className="text-xs font-semibold text-fuchsia-400 uppercase tracking-wider mb-1">Financial Overview</div>
            <div className="text-xl font-bold text-slate-100">$2,450 Saved</div>
            <p className="text-xs text-slate-400 mt-1">Smart budget active</p>
          </div>

          <div className="p-4 rounded-xl bg-violet-950/40 border border-violet-900/30">
            <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">Schedule</div>
            <div className="text-xl font-bold text-slate-100">Next: Team Sync</div>
            <p className="text-xs text-slate-400 mt-1">Calendar optimized</p>
          </div>
        </div>
      </div>
    </div>
  );
}