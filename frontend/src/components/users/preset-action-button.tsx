"use client";

import React from "react";
import { Sparkles, CheckCheck, RotateCcw, Eye, Pencil } from "lucide-react";

export interface PresetButtonGroupProps {
  onApplyPreset: (preset: "ALL" | "VIEWER" | "EDITOR" | "MANAGER" | "NONE") => void;
  disabled?: boolean;
}

export function PresetButtonGroup({ onApplyPreset, disabled = false }: PresetButtonGroupProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 select-none">
      <span className="text-[10px] font-mono text-slate-400 mr-1 hidden md:inline">แม่แบบ:</span>

      {/* Full Access */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onApplyPreset("ALL")}
        className="group relative px-2.5 py-1 rounded-lg text-[11px] font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white border border-indigo-400/40 transition-all duration-200 shadow-[0_2px_8px_rgba(99,102,241,0.3)] hover:shadow-[0_4px_14px_rgba(99,102,241,0.5)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
        title="ให้สิทธิ์ทุกฟังก์ชัน (Full Access)"
      >
        <CheckCheck className="w-3 h-3 transition-transform duration-200 group-hover:scale-110" />
        <span>Full Access</span>
      </button>

      {/* Manager */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onApplyPreset("MANAGER")}
        className="group px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-800/90 hover:bg-slate-700/90 text-teal-300 hover:text-teal-200 border border-teal-500/30 hover:border-teal-400/60 transition-all duration-200 shadow-xs hover:shadow-[0_2px_10px_rgba(20,184,166,0.25)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
        title="สิทธิ์ผู้จัดการ (เพิ่ม, แก้ไข, อนุมัติ, ปฏิเสธ)"
      >
        <Sparkles className="w-3 h-3 text-teal-400 transition-transform duration-200 group-hover:rotate-12" />
        <span>Manager</span>
      </button>

      {/* Editor */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onApplyPreset("EDITOR")}
        className="group px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-800/90 hover:bg-slate-700/90 text-amber-300 hover:text-amber-200 border border-amber-500/30 hover:border-amber-400/60 transition-all duration-200 shadow-xs hover:shadow-[0_2px_10px_rgba(245,158,11,0.25)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
        title="สิทธิ์แก้ไข (ดู, เพิ่ม, แก้ไข)"
      >
        <Pencil className="w-3 h-3 text-amber-400 transition-transform duration-200 group-hover:-rotate-12" />
        <span>Editor</span>
      </button>

      {/* View Only */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onApplyPreset("VIEWER")}
        className="group px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-800/90 hover:bg-slate-700/90 text-blue-300 hover:text-blue-200 border border-blue-500/30 hover:border-blue-400/60 transition-all duration-200 shadow-xs hover:shadow-[0_2px_10px_rgba(59,130,246,0.25)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
        title="สิทธิ์ดูอย่างเดียว"
      >
        <Eye className="w-3 h-3 text-blue-400 transition-transform duration-200 group-hover:scale-110" />
        <span>View Only</span>
      </button>

      {/* Clear All */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onApplyPreset("NONE")}
        className="group px-2 py-1 rounded-lg text-[11px] font-bold bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-rose-100 border border-rose-800/50 hover:border-rose-600/80 transition-all duration-200 shadow-xs hover:shadow-[0_2px_10px_rgba(244,63,94,0.3)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
        title="ล้างสิทธิ์ทั้งหมด"
      >
        <RotateCcw className="w-3 h-3 transition-transform duration-300 group-hover:-rotate-90" />
        <span>Clear</span>
      </button>
    </div>
  );
}

export interface ResetRolePresetButtonProps {
  onClick: () => void;
  title?: string;
  disabled?: boolean;
}

export function ResetRolePresetButton({
  onClick,
  title = "คืนค่าตาม Role Preset",
  disabled = false,
}: ResetRolePresetButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="group relative overflow-hidden px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-50 via-violet-50 to-purple-50 hover:from-indigo-100 hover:via-violet-100 hover:to-purple-100 text-indigo-900 border border-indigo-200/90 hover:border-indigo-300 shadow-[0_2px_8px_rgba(99,102,241,0.15)] hover:shadow-[0_4px_16px_rgba(99,102,241,0.3)] font-bold text-xs transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-98 flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
      title={title}
    >
      {/* Background Animated Shimmer Glow */}
      <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-700 ease-in-out pointer-events-none" />

      <Sparkles className="w-4 h-4 text-indigo-600 group-hover:text-violet-700 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110 shrink-0 animate-pulse" />
      <span className="relative z-10 font-bold tracking-tight">{title}</span>
    </button>
  );
}

export default PresetButtonGroup;

