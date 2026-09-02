"use client";

import React from "react";
import { Ban, CheckCircle2 } from "lucide-react";

export interface SuspendToggleButtonProps {
  isSuspended: boolean;
  onToggle: () => void;
  className?: string;
  size?: "sm" | "md";
}

export default function SuspendToggleButton({
  isSuspended,
  onToggle,
  className = "",
  size = "sm",
}: SuspendToggleButtonProps) {
  const isSmall = size === "sm";

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`group relative inline-flex items-center justify-center gap-1.5 font-bold rounded-xl transition-all duration-300 ease-out cursor-pointer select-none active:scale-95 ${
        isSmall ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-xs"
      } ${
        isSuspended
          ? "bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white border border-rose-400/80 shadow-[0_3px_14px_rgba(225,29,72,0.4)] hover:shadow-[0_5px_20px_rgba(225,29,72,0.6)] hover:brightness-110"
          : "bg-emerald-50/90 hover:bg-emerald-100 text-emerald-800 border border-emerald-300/80 hover:border-emerald-400 shadow-[0_2px_8px_rgba(16,185,129,0.15)] hover:shadow-[0_4px_14px_rgba(16,185,129,0.3)]"
      } ${className}`}
      title={
        isSuspended
          ? "ผู้ใช้นี้ถูกระงับการใช้งาน - คลิกเพื่อปลดการระงับ"
          : "สถานะปกติ - คลิกเพื่อระงับการใช้งาน"
      }
    >
      {/* Radar Ping Pulse Indicator */}
      <span className="relative flex h-2 w-2">
        {isSuspended ? (
          <>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
          </>
        ) : (
          <>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
          </>
        )}
      </span>

      {/* Icon with Hover Motion */}
      {isSuspended ? (
        <>
          <Ban className="w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-12 shrink-0" />
          <span className="tracking-tight whitespace-nowrap">ถูกระงับ (ปลด)</span>
        </>
      ) : (
        <>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 transition-transform duration-200 group-hover:scale-110 shrink-0" />
          <span className="tracking-tight whitespace-nowrap">ปกติ (ระงับ)</span>
        </>
      )}
    </button>
  );
}

export { SuspendToggleButton };

