"use client";

import React, { useEffect, useState } from "react";
import { Trash2, Ban, AlertTriangle, ShieldCheck, X } from "lucide-react";
import Portal from "./portal";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";

const EXIT_DURATION_MS = 180;

export type ConfirmModalVariant = "danger" | "warning" | "primary";
export type ConfirmModalIconType = "trash" | "ban" | "alert" | "shield";

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmModalVariant;
  icon?: ConfirmModalIconType;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  description,
  confirmText = "ยืนยัน",
  cancelText = "ยกเลิก",
  variant = "danger",
  icon = "alert",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  // ค้าง Mount ไว้ระหว่างเล่น Exit Animation แล้วค่อย Unmount จริงหลัง Transition จบ
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
    } else if (shouldRender) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, EXIT_DURATION_MS);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  // Lock body scroll ตลอดช่วงที่ Modal ค้าง Mount อยู่ (รวมระหว่างเล่น Exit Animation)
  useBodyScrollLock(shouldRender);

  if (!shouldRender) return null;

  const renderIcon = () => {
    const iconClass = "w-8 h-8";
    switch (icon) {
      case "trash":
        return <Trash2 className={`${iconClass} text-rose-400`} />;
      case "ban":
        return <Ban className={`${iconClass} text-rose-400`} />;
      case "shield":
        return <ShieldCheck className={`${iconClass} text-indigo-400`} />;
      case "alert":
      default:
        return <AlertTriangle className={`${iconClass} text-amber-400`} />;
    }
  };

  const getIconContainerStyle = () => {
    switch (variant) {
      case "danger":
        return "bg-rose-500/10 border border-rose-500/30 shadow-[0_0_24px_rgba(244,63,94,0.3)]";
      case "warning":
        return "bg-amber-500/10 border border-amber-500/30 shadow-[0_0_24px_rgba(245,158,11,0.3)]";
      case "primary":
      default:
        return "bg-indigo-500/10 border border-indigo-500/30 shadow-[0_0_24px_rgba(99,102,241,0.3)]";
    }
  };

  const getConfirmBtnStyle = () => {
    switch (variant) {
      case "danger":
        return "bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white shadow-lg shadow-rose-600/30 border border-rose-400/40";
      case "warning":
        return "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-amber-600/30 border border-amber-400/40";
      case "primary":
      default:
        return "bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/40";
    }
  };

  return (
    <Portal>
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto duration-200 ${
        isClosing ? "animate-out fade-out" : "animate-in fade-in"
      }`}
    >
      <div
        className={`relative w-full max-w-md bg-[#18181b]/95 border border-zinc-800/90 rounded-2xl p-6 shadow-2xl text-center backdrop-blur-md overflow-hidden duration-200 ${
          isClosing
            ? "animate-out zoom-out-95 fade-out slide-out-to-bottom-2"
            : "animate-in zoom-in-95 fade-in slide-in-from-bottom-2"
        }`}
      >

        {/* Subtle Ambient Radial Glow */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button Top Right — Hover สีชุดเดียวกับ ActionCloseButton ของฟอร์มลงทะเบียนสมาชิก (เน้น rose ตอน hover) */}
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-500 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-500/30 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
          title="ปิด"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Animated Bouncing Icon */}
        <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-transform ${getIconContainerStyle()}`}>
          <div className="animate-bounce">
            {renderIcon()}
          </div>
        </div>

        {/* Modal Title */}
        <h3 className="text-base sm:text-lg font-extrabold text-white mb-2 tracking-tight">
          {title}
        </h3>

        {/* Modal Description */}
        <p className="text-xs text-zinc-400 mb-6 leading-relaxed max-w-xs mx-auto">
          {description}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 rounded-xl border border-zinc-700/80 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 font-bold text-xs transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-xs"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${getConfirmBtnStyle()}`}
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>
    </Portal>
  );
}

export { ConfirmModal };
