import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BrainCircuit, PlaySquare, ShieldAlert, Sparkles } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-[#0b0f17] border-r border-slate-800/80 flex flex-col justify-between shrink-0 min-h-screen">
      <div>
        {/* Brand Logo */}
        <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-teal-500 p-0.5 shadow-lg shadow-purple-900/20">
            <div className="w-full h-full bg-[#0b0f17] rounded-[10px] flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg text-slate-100 tracking-tight">RecallOps</span>
              <span className="text-[10px] font-semibold tracking-wider text-teal-400 bg-teal-950/80 border border-teal-800/50 px-1.5 py-0.5 rounded">SRE</span>
            </div>
            <p className="text-xs text-slate-400">AI Incident Memory Agent</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="p-3 space-y-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-purple-600/15 text-purple-300 border border-purple-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`
            }
          >
            <LayoutDashboard className="w-4 h-4" />
            Incident Dashboard
          </NavLink>

          <NavLink
            to="/memory"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-teal-600/15 text-teal-300 border border-teal-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`
            }
          >
            <BrainCircuit className="w-4 h-4 text-teal-400" />
            Memory Explorer
          </NavLink>

          <NavLink
            to="/demo"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`
            }
          >
            <PlaySquare className="w-4 h-4 text-indigo-400" />
            Hackathon Demo Suite
          </NavLink>
        </nav>
      </div>

      {/* Footer info box */}
      <div className="p-4 m-3 rounded-xl bg-slate-900/60 border border-slate-800/60 text-xs">
        <div className="flex items-center gap-2 text-purple-400 font-semibold mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          Hindsight Episodic Memory
        </div>
        <p className="text-slate-400 text-[11px] leading-relaxed">
          Retains verified root causes & fixes to recall solutions during future outages.
        </p>
      </div>
    </aside>
  );
}
