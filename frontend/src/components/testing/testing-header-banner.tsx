"use client";

import React from "react";
import { TestTube, Activity, Plus } from "lucide-react";

interface TestingHeaderBannerProps {
  passRate: number;
  totalRuns: number;
  onOpenCreateModal: () => void;
  canAdd?: boolean;
}

export default function TestingHeaderBanner({
  passRate,
  totalRuns,
  onOpenCreateModal,
  canAdd = true,
}: TestingHeaderBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0f1123] via-[#161936] to-[#201c47] p-6 sm:p-8 text-white shadow-xl border border-indigo-900/40">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] font-mono font-bold uppercase tracking-wider">
            <TestTube className="w-3.5 h-3.5" />
            <span>TESTING / AUTOMATION LOG</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Test Automation
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 uppercase">
              AUTOMATION WORK
            </span>
          </div>

          <p className="text-xs text-indigo-200/70 max-w-xl">
            บันทึกและติดตามสถานะการทดสอบระบบอัตโนมัติ พร้อมดูรายงานคุณภาพย้อนหลัง
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
          <div className="bg-[#0b0c18]/60 backdrop-blur-md border border-indigo-500/20 rounded-xl p-3.5 min-w-[240px] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-bold text-indigo-200">
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                อัตราการผ่านรวม
              </span>
              <span className="font-mono font-bold text-indigo-300 text-sm">
                {passRate}%
              </span>
            </div>

            <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden border border-slate-700/50">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-500 shadow-sm shadow-indigo-500"
                style={{ width: `${passRate}%` }}
              />
            </div>

            <div className="flex justify-between text-[10px] text-indigo-300/60 font-mono">
              <span>รอบเทส: {totalRuns} รายการ</span>
              <span>อัปเดตล่าสุด: เมื่อครู่นี้</span>
            </div>
          </div>

          {canAdd && (
            <button
              onClick={onOpenCreateModal}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all active:scale-95 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              New Test Run
            </button>
          )}
        </div>
      </div>
    </div>
  );
}