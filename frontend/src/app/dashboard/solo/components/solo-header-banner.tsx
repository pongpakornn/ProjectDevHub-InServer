"use client";

import React from "react";
import { Sparkles, Activity } from "lucide-react";
import ProjectsButton from "@/components/ui/buttons/projects-button";

interface SoloHeaderBannerProps {
  totalProjects: number;
  avgProgress: number;
  onOpenCreateModal: () => void;
}

export default function SoloHeaderBanner({
  totalProjects,
  avgProgress,
  onOpenCreateModal,
}: SoloHeaderBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-[#0f172a] via-[#1e1b4b] to-[#311042] border border-slate-800/80 p-6 md:p-8 shadow-xl">
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/40 border border-indigo-500/30 text-indigo-400 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span className="font-mono text-[11px] font-bold tracking-wider uppercase">DEV / PROJECT LOG</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">ทำระบบคนเดียว (Solo)</h1>
            <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              SOLO WORK
            </span>
          </div>

          <p className="text-xs font-medium text-slate-400">บันทึกและจัดการโปรเจคที่คุณเขียนและดูแลเพียงผู้เดียว</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
          <div className="bg-slate-900/60 border border-indigo-500/20 rounded-xl p-4 min-w-70 space-y-2.5 backdrop-blur-md shadow-lg shadow-black/20">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-200 font-semibold flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                ความคืบหน้ารวม
              </span>
              <span className="text-indigo-400 font-mono font-extrabold text-base">{avgProgress}%</span>
            </div>

            <div className="w-full bg-slate-950/80 rounded-full h-2 overflow-hidden p-0.5 border border-slate-800">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(99,102,241,0.8)]"
                style={{ width: `${avgProgress}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-0.5">
              <span>จำนวนโปรเจค: <strong className="text-indigo-300">{totalProjects}</strong> รายการ</span>
              <span className="text-slate-500">อัปเดตล่าสุด: เมื่อครู่นี้</span>
            </div>
          </div>

          <div className="solo-new-project-btn">
            <ProjectsButton 
              label="New Project" 
              onClick={onOpenCreateModal}
            />
          </div>
          <style jsx>{`
            .solo-new-project-btn :global(button) {
              background: linear-gradient(135deg, #6366f1, #4f46e5) !important;
              box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35) !important;
            }
            .solo-new-project-btn :global(button:hover) {
              background: linear-gradient(135deg, #4f46e5, #4338ca) !important;
              box-shadow: 0 6px 18px rgba(79, 70, 229, 0.5) !important;
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}