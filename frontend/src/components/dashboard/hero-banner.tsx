"use client";

import { Sparkles, Activity } from "lucide-react";

interface HeroBannerProps {
  overallProgress: number;
}

export default function HeroBanner({ overallProgress }: HeroBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-zinc-900 via-slate-900 to-emerald-950 p-6 sm:p-8 text-white shadow-xl border border-zinc-800/80">
      {/* Decorative Ambient Glow Background */}
      <div className="absolute -right-12 -top-12 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute right-1/3 -bottom-12 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold tracking-wider uppercase backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            ENGINEERING DASHBOARD
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
            ภาพรวมโปรเจคและคุณภาพระบบ
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            ติดตามความก้าวหน้า, สถานะงานพัฒนา และผลการทดสอบอัตโนมัติแบบเรียลไทม์
          </p>
        </div>

        {/* Overall Progress Widget */}
        <div className="w-full md:w-80 bg-zinc-800/50 backdrop-blur-md border border-zinc-700/50 rounded-xl p-4 shadow-inner space-y-3">
          <div className="flex justify-between items-center text-xs font-medium">
            <span className="text-zinc-300 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-400" /> ความคืบหน้ารวม
            </span>
            <span className="text-emerald-400 font-extrabold text-sm font-mono">{overallProgress}%</span>
          </div>
          <div className="w-full h-3 bg-zinc-900/80 rounded-full overflow-hidden p-0.5 border border-zinc-700/60 shadow-inner">
            <div
              className="h-full bg-linear-to-r from-emerald-500 via-teal-400 to-emerald-300 rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}