import React from "react";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative flex flex-col items-center justify-center text-center px-4 pt-20 pb-12 overflow-hidden">
      {/* Category Pill Tag */}
      <div className="bg-violet-500/10 border border-violet-500/30 text-violet-300 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide mb-6">
        All-In-One Personal Operating System
      </div>

      {/* Main Title */}
      <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-4">
        Life<span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">OS</span>
      </h1>

      {/* Improved Subtitle */}
      <p className="text-lg md:text-xl font-medium text-slate-300 max-w-2xl tracking-wide leading-relaxed">
        Streamline your productivity, schedule, finances, and daily routine in one centralized workspace.
      </p>

      {/* Primary Working CTA Button */}
      <button
        onClick={() => navigate("/dashboard")}
        className="mt-8 px-10 py-3.5 text-base font-bold text-slate-950 bg-gradient-to-r from-violet-400 via-fuchsia-300 to-indigo-400 rounded-full shadow-[0_0_25px_rgba(167,139,250,0.4)] hover:shadow-[0_0_35px_rgba(192,132,252,0.7)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
      >
        Get Started Free
      </button>
    </section>
  );
}