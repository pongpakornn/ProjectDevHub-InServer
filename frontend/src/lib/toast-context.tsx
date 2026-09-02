"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import ToastNotification, { ToastItem, ToastType } from "@/components/ui/toast-notification";

interface ToastContextValue {
  // เรียกทั่วไป ระบุ Type เอง
  addToast: (title: string, message: string, type?: ToastType, duration?: number) => void;
  success: (title: string, message: string) => void;
  error: (title: string, message: string) => void;
  warning: (title: string, message: string) => void;
  info: (title: string, message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// จุดรวม Notification เดียวของทั้งระบบ — Mount ที่ Root Layout ครั้งเดียว
// ทุกหน้าเรียกผ่าน useToast() แทนการสร้าง Toast State/alert() แยกกันเองต่อหน้า
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (title: string, message: string, type: ToastType = "info", duration = 3500) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, title, message, type, duration }]);
    },
    []
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      addToast,
      success: (title, message) => addToast(title, message, "success"),
      error: (title, message) => addToast(title, message, "error"),
      warning: (title, message) => addToast(title, message, "warning"),
      info: (title, message) => addToast(title, message, "info"),
    }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastNotification toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast ต้องถูกเรียกภายใน <ToastProvider> เท่านั้น (ดู app/layout.tsx)");
  }
  return ctx;
}
