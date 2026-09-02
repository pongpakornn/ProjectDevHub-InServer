"use client";

import React, { useEffect, useRef, useState } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  title: string;
  message: string;
  type?: ToastType;
  duration?: number; // Duration in ms, default 3500
}

export interface ToastNotificationProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

const EXIT_DURATION_MS = 220;

export default function ToastNotification({ toasts, onDismiss }: ToastNotificationProps) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 pointer-events-auto max-w-sm w-full select-none">
      {toasts.map((toast) => (
        <SingleToastCard key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function SingleToastCard({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const duration = toast.duration || 3500;
  const [isClosing, setIsClosing] = useState(false);

  const barRef = useRef<HTMLDivElement>(null);
  // เก็บเวลาที่เหลือไว้ตอน Pause (Hover ค้าง) เพื่อ Resume ต่อจากจุดเดิมตอน Mouse Leave
  const remainingMsRef = useRef(duration);

  const requestClose = () => {
    setIsClosing(true);
    setTimeout(() => onDismiss(toast.id), EXIT_DURATION_MS);
  };

  // สั่งให้แถบ Progress ไล่จาก fromPercent ลงมา 0% แบบ Linear ด้วย CSS Transition ล้วนๆ
  // (ไม่มี JS Loop คอย set state ทุก Frame แบบเดิม ซึ่งเป็นสาเหตุที่ทำให้เห็นเป็นขั้นบันได/กระตุก)
  const runCountdown = (fromPercent: number, ms: number) => {
    const bar = barRef.current;
    if (!bar) return;
    bar.style.transition = "none";
    bar.style.width = `${fromPercent}%`;
    // Force Reflow ให้ Browser จด Width ปัจจุบันไว้ก่อน แล้วค่อยเริ่ม Transition ในเฟรมถัดไป
    void bar.offsetWidth;
    requestAnimationFrame(() => {
      const el = barRef.current;
      if (!el) return;
      el.style.transition = `width ${ms}ms linear`;
      el.style.width = "0%";
    });
  };

  useEffect(() => {
    runCountdown(100, duration);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Transition ของแถบ Progress วิ่งจบเมื่อไหร่ = หมดเวลาแสดงผลจริง (นับรวม Pause/Resume มาแล้ว)
  const handleBarTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.propertyName === "width") {
      requestClose();
    }
  };

  const handleMouseEnter = () => {
    const bar = barRef.current;
    if (!bar) return;
    const containerWidth = bar.parentElement?.offsetWidth || 1;
    const currentPercent = (bar.offsetWidth / containerWidth) * 100;
    remainingMsRef.current = (currentPercent / 100) * duration;
    // "แช่แข็ง" แถบไว้ที่ตำแหน่งปัจจุบัน — ตัด Transition ออกเพื่อหยุดนับทันที
    bar.style.transition = "none";
    bar.style.width = `${currentPercent}%`;
  };

  const handleMouseLeave = () => {
    runCountdown(
      (parseFloat(barRef.current?.style.width || "0") || 0),
      remainingMsRef.current
    );
  };

  const getTheme = () => {
    switch (toast.type) {
      case "success":
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
          glow: "border-emerald-500/30 shadow-[0_4px_24px_rgba(16,185,129,0.2)]",
          barColor: "bg-gradient-to-r from-emerald-500 to-teal-400",
          iconBg: "bg-emerald-500/15 border-emerald-500/30",
        };
      case "error":
        return {
          icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
          glow: "border-rose-500/30 shadow-[0_4px_24px_rgba(244,63,94,0.2)]",
          barColor: "bg-gradient-to-r from-rose-500 to-red-500",
          iconBg: "bg-rose-500/15 border-rose-500/30",
        };
      case "warning":
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
          glow: "border-amber-500/30 shadow-[0_4px_24px_rgba(245,158,11,0.2)]",
          barColor: "bg-gradient-to-r from-amber-500 to-orange-400",
          iconBg: "bg-amber-500/15 border-amber-500/30",
        };
      case "info":
      default:
        return {
          icon: <Info className="w-5 h-5 text-indigo-400 shrink-0" />,
          glow: "border-indigo-500/30 shadow-[0_4px_24px_rgba(99,102,241,0.2)]",
          barColor: "bg-gradient-to-r from-indigo-500 to-violet-400",
          iconBg: "bg-indigo-500/15 border-indigo-500/30",
        };
    }
  };

  const theme = getTheme();

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden bg-[#232531]/95 backdrop-blur-xl border ${theme.glow} rounded-2xl p-4 text-zinc-100 shadow-2xl duration-200 ${
        isClosing
          ? "animate-out fade-out slide-out-to-right-4 zoom-out-95"
          : "animate-in fade-in slide-in-from-bottom-5 zoom-in-95 duration-300"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-xl border flex items-center justify-center shrink-0 ${theme.iconBg}`}>
          {theme.icon}
        </div>

        <div className="flex-1 min-w-0 pr-2">
          <h4 className="text-xs font-bold text-white tracking-tight leading-snug">
            {toast.title}
          </h4>
          <p className="text-[11px] text-zinc-400 font-medium leading-relaxed mt-0.5">
            {toast.message}
          </p>
        </div>

        <button
          type="button"
          onClick={requestClose}
          className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700/50 transition-colors shrink-0 cursor-pointer"
          title="ปิดการแจ้งเตือน"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Countdown Progress Bar at Bottom — ขับเคลื่อนด้วย CSS width Transition ล้วนๆ (Linear ตาม duration จริง)
          ไม่มี JS คอย setState ทุก Frame จึงไม่กระตุก และ transitionend ของแถบนี้เองคือตัวสั่งปิด Toast */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800/80 overflow-hidden">
        <div
          ref={barRef}
          onTransitionEnd={handleBarTransitionEnd}
          className={`h-full ${theme.barColor}`}
          style={{ width: "100%" }}
        />
      </div>
    </div>
  );
}

export { ToastNotification };
