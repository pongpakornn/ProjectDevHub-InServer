"use client";

import React, { useId } from "react";
import { PermissionFlagKey } from "./user-permission-matrix";

export interface MatrixCheckboxProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  permissionKey: PermissionFlagKey;
  title?: string;
}

const THEME_CONFIG: Record<
  PermissionFlagKey,
  {
    activeBg: string;
    borderActive: string;
    glow: string;
    stroke: string;
    label: string;
  }
> = {
  CanView: {
    activeBg: "bg-blue-600",
    borderActive: "border-blue-400",
    glow: "0 2px 10px rgba(59, 130, 246, 0.45)",
    stroke: "#ffffff",
    label: "CanView",
  },
  CanAdd: {
    activeBg: "bg-emerald-600",
    borderActive: "border-emerald-400",
    glow: "0 2px 10px rgba(16, 185, 129, 0.45)",
    stroke: "#ffffff",
    label: "CanAdd",
  },
  CanEdit: {
    activeBg: "bg-amber-500",
    borderActive: "border-amber-400",
    glow: "0 2px 10px rgba(245, 158, 11, 0.45)",
    stroke: "#ffffff",
    label: "CanEdit",
  },
  CanDelete: {
    activeBg: "bg-rose-600",
    borderActive: "border-rose-400",
    glow: "0 2px 10px rgba(244, 63, 94, 0.45)",
    stroke: "#ffffff",
    label: "CanDelete",
  },
  CanApprove: {
    activeBg: "bg-teal-600",
    borderActive: "border-teal-400",
    glow: "0 2px 10px rgba(20, 184, 166, 0.45)",
    stroke: "#ffffff",
    label: "CanApprove",
  },
  CanReject: {
    activeBg: "bg-purple-600",
    borderActive: "border-purple-400",
    glow: "0 2px 10px rgba(168, 85, 247, 0.45)",
    stroke: "#ffffff",
    label: "CanReject",
  },
};

export default function MatrixCheckbox({
  checked,
  onChange,
  disabled = false,
  permissionKey,
  title,
}: MatrixCheckboxProps) {
  const uniqueId = useId();
  const theme = THEME_CONFIG[permissionKey] || THEME_CONFIG.CanView;

  return (
    <div className="inline-flex items-center justify-center w-7 h-7 min-w-7 min-h-7 shrink-0 select-none">
      <input
        id={uniqueId}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only"
      />
      <label
        htmlFor={uniqueId}
        title={title || `${theme.label}: ${checked ? "เปิดใช้งาน" : "ปิด"}`}
        className={`relative flex items-center justify-center w-7 h-7 min-w-7 min-h-7 rounded-lg transition-colors duration-200 cursor-pointer overflow-hidden border ${
          disabled ? "opacity-40 cursor-not-allowed pointer-events-none" : ""
        } ${
          checked
            ? `${theme.activeBg} ${theme.borderActive}`
            : "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-400"
        }`}
        style={
          checked
            ? {
                boxShadow: theme.glow,
              }
            : undefined
        }
      >
        {/* Animated SVG Check Mark */}
        <svg
          viewBox="0 0 24 24"
          className={`w-4 h-4 transition-transform duration-200 ease-out ${
            checked ? "scale-100 opacity-100" : "scale-0 opacity-0"
          }`}
          fill="none"
          stroke={theme.stroke}
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline
            points="20 6 9 17 4 12"
            className="transition-all duration-200 [stroke-dasharray:24] [stroke-dashoffset:0]"
          />
        </svg>

        {/* Unchecked Empty Indicator Dot */}
        {!checked && (
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 transition-colors" />
        )}
      </label>
    </div>
  );
}

export { MatrixCheckbox };

