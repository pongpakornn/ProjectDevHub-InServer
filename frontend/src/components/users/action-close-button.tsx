"use client";

import React from "react";
import { X } from "lucide-react";

export interface ActionCloseButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  title?: string;
  className?: string;
}

export default function ActionCloseButton({
  onClick,
  title = "ปิด",
  className = "",
}: ActionCloseButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`group relative flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-500 hover:text-rose-600 transition-all duration-200 ease-out hover:scale-105 active:scale-95 shadow-xs hover:shadow-[0_0_12px_rgba(244,63,94,0.3)] cursor-pointer ${className}`}
    >
      <X className="w-4 h-4 transition-transform duration-300 ease-out group-hover:rotate-90 group-active:scale-90" />
      <span className="sr-only">{title}</span>
    </button>
  );
}

export { ActionCloseButton };

