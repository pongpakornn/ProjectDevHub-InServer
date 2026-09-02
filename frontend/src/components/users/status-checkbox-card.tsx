"use client";

import React from "react";
import { Crown, Ban, CheckCircle2 } from "lucide-react";

export type StatusCardType = "super_admin" | "suspended" | "active";

export interface StatusCheckboxCardProps {
  type: StatusCardType;
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: string;
  subtitle: string;
  disabled?: boolean;
}

export default function StatusCheckboxCard({
  type,
  checked,
  onChange,
  title,
  subtitle,
  disabled = false,
}: StatusCheckboxCardProps) {
  // การ์ดวางอยู่บนพื้นหลังสีขาวของฟอร์ม (ไม่ใช่พื้นมืด) — ปรับให้เป็น Light Theme ที่มี Contrast
  // สูงพออ่านง่าย แทนสไตล์เดิมที่ใช้พื้นหลังโปร่งแสงสีเข้ม (bg-zinc-900/40) ทับบนพื้นขาวจนตัวอักษรจมพื้น
  const getCardStyle = () => {
    switch (type) {
      case "suspended":
        return {
          icon: <Ban className={`w-4 h-4 ${checked ? "text-rose-600 animate-pulse" : "text-slate-400"}`} />,
          activeBorder: "border-rose-400 bg-rose-50 text-rose-900 shadow-[0_0_16px_rgba(244,63,94,0.15)]",
          inactiveBorder: "border-slate-300 bg-slate-50 text-slate-700 hover:border-slate-400 hover:bg-slate-100/80",
          toggleBg: checked ? "bg-rose-600" : "bg-slate-300",
          iconBg: checked ? "bg-rose-100 border-rose-300" : "bg-white border-slate-300",
          badge: checked ? "bg-rose-100 text-rose-700 border-rose-300" : "bg-slate-200 text-slate-600 border-slate-300",
        };
      case "super_admin":
        return {
          icon: <Crown className={`w-4 h-4 ${checked ? "text-purple-600" : "text-slate-400"}`} />,
          activeBorder: "border-purple-400 bg-purple-50 text-purple-900 shadow-[0_0_16px_rgba(168,85,247,0.15)]",
          inactiveBorder: "border-slate-300 bg-slate-50 text-slate-700 hover:border-slate-400 hover:bg-slate-100/80",
          toggleBg: checked ? "bg-purple-600" : "bg-slate-300",
          iconBg: checked ? "bg-purple-100 border-purple-300" : "bg-white border-slate-300",
          badge: checked ? "bg-purple-100 text-purple-700 border-purple-300" : "bg-slate-200 text-slate-600 border-slate-300",
        };
      case "active":
      default:
        return {
          icon: <CheckCircle2 className={`w-4 h-4 ${checked ? "text-emerald-600" : "text-slate-400"}`} />,
          activeBorder: "border-emerald-400 bg-emerald-50 text-emerald-900 shadow-[0_0_16px_rgba(16,185,129,0.15)]",
          inactiveBorder: "border-slate-300 bg-slate-50 text-slate-700 hover:border-slate-400 hover:bg-slate-100/80",
          toggleBg: checked ? "bg-emerald-600" : "bg-slate-300",
          iconBg: checked ? "bg-emerald-100 border-emerald-300" : "bg-white border-slate-300",
          badge: checked ? "bg-emerald-100 text-emerald-700 border-emerald-300" : "bg-slate-200 text-slate-600 border-slate-300",
        };
    }
  };

  const style = getCardStyle();

  return (
    <div
      onClick={() => !disabled && onChange(!checked)}
      className={`relative flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer select-none ${
        checked ? style.activeBorder : style.inactiveBorder
      } ${disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "hover:scale-[1.01] active:scale-[0.99]"}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={`p-2 rounded-xl border flex items-center justify-center shrink-0 transition-colors ${style.iconBg}`}>
          {style.icon}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-slate-900 truncate">
              {title}
            </span>
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full border ${style.badge}`}>
              {checked ? "ENABLED" : "DISABLED"}
            </span>
          </div>
          <p className="text-[11px] text-slate-600 font-semibold truncate mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Smooth Toggle Switch Indicator */}
      <div
        className={`w-10 h-6 flex items-center rounded-full p-0.5 transition-colors duration-300 ease-in-out shrink-0 ml-3 ${style.toggleBg}`}
      >
        <div
          className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </div>
    </div>
  );
}

export { StatusCheckboxCard };
