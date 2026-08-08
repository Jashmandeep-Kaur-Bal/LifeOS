import React from "react";
import { useNavigate } from "react-router-dom";

export default function FeatureCard({ title, description, linkTo, icon }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => linkTo && navigate(linkTo)}
      className="group relative p-6 rounded-2xl bg-indigo-950/30 border border-violet-900/40 hover:border-fuchsia-500/50 backdrop-blur-md transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(167,139,250,0.15)] cursor-pointer flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center space-x-4 mb-4 pb-3 border-b border-violet-900/30">
          <div className="p-3 bg-violet-900/40 rounded-xl text-violet-300 group-hover:bg-gradient-to-r group-hover:from-violet-400 group-hover:to-fuchsia-400 group-hover:text-slate-950 transition-all duration-300 shadow-sm">
            {icon}
          </div>
          <h3 className="text-xl font-bold text-slate-100 group-hover:text-fuchsia-300 transition-colors">
            {title}
          </h3>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="mt-6 flex items-center text-xs font-semibold text-violet-400 group-hover:text-fuchsia-300 group-hover:translate-x-1 transition-all">
        Explore Module &rarr;
      </div>
    </div>
  );
}