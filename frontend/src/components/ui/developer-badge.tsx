"use client";

import { useState } from "react";
import { X, Code2 } from "lucide-react";

export default function DeveloperBadge() {
  const [showDevCard, setShowDevCard] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-9999 flex flex-col items-end gap-3 pointer-events-auto select-none">
      {/* Developer Info Popover Card */}
      {showDevCard && (
        <div className="w-72 bg-[#0d0e12]/95 backdrop-blur-md border border-zinc-800 rounded-2xl p-4 shadow-2xl shadow-black/80 text-zinc-200 animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* Header Card */}
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-mono font-bold tracking-wider text-emerald-400 uppercase">
                DEVELOPER PROFILE
              </span>
            </div>
            <button
              onClick={() => setShowDevCard(false)}
              className="text-zinc-500 hover:text-zinc-300 p-1 rounded-lg hover:bg-zinc-800/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content Body */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-linear-to-br from-zinc-800 to-zinc-900 border border-zinc-700/60 flex items-center justify-center text-cyan-400 font-mono font-black text-xs shadow-inner shrink-0">
                P.U
              </div>
              <div className="flex flex-col min-w-0">
                <h4 className="text-sm font-bold text-white truncate">
                  Pongpakorn Urang
                </h4>
                <p className="text-[11px] text-zinc-400 truncate">
                  Full-Stack Engineer
                </p>
              </div>
            </div>

            <div className="bg-zinc-900/80 rounded-xl p-2.5 border border-zinc-800/80 space-y-1.5 text-[11px] font-mono">
              <div className="flex justify-between text-zinc-400">
                <span>Project:</span>
                <span className="text-white font-bold">PROJECTDEVHUB</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Year:</span>
                <span className="text-emerald-400 font-bold">© 2026</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Circular Floating Trigger Badge (Next.js / Vercel Style) */}
      <button
        onClick={() => setShowDevCard((prev) => !prev)}
        className={`group relative w-12 h-12 rounded-full bg-[#121318]/90 backdrop-blur-md border border-zinc-700/80 flex items-center justify-center shadow-xl shadow-black/60 hover:border-cyan-400/80 hover:scale-105 active:scale-95 transition-all duration-200 ${
          showDevCard ? "ring-2 ring-cyan-500/50 border-cyan-400" : ""
        }`}
        title="Developer Information"
        aria-label="Developer Information"
      >
        <div className="absolute inset-0 rounded-full bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <span className="font-mono font-black text-xs tracking-wider text-cyan-400 group-hover:text-white transition-colors">
          P.U
        </span>

        {/* Live Indicator Dot */}
        <span className="absolute top-0.5 right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#0d0e12] rounded-full" />
      </button>
    </div>
  );
}