"use client";

import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/buttons/button";
import { WorkItem } from "@/types/project-detail";

interface WorkItemPreviewModalProps {
  works: WorkItem[];
  activeIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

// Fullscreen / Max-Width Dialog — ใหญ่กว่าเดิม (จาก max-w-4xl/max-h-[70vh]) เพื่อให้เห็นภาพชัดขึ้น
export default function WorkItemPreviewModal({
  works,
  activeIndex,
  onClose,
  onNavigate,
}: WorkItemPreviewModalProps) {
  if (works.length === 0) return null;
  const active = works[activeIndex];

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-slate-300">
        <X className="w-6 h-6" />
      </button>

      <div className="w-full h-full max-w-[95vw] max-h-[95vh] flex flex-col items-center justify-center gap-4">
        <img
          src={active.imageUrl}
          alt={active.title}
          className="max-w-full max-h-[80vh] object-contain rounded-xl border border-slate-800"
        />
        <div className="text-center text-white space-y-1">
          <h4 className="font-bold text-base">{active.title}</h4>
          <p className="text-xs text-slate-400">{active.description}</p>
        </div>

        <div className="flex items-center gap-4 pt-2">
          <Button
            disabled={activeIndex === 0}
            onClick={() => onNavigate(activeIndex - 1)}
            className="w-auto! bg-slate-800 hover:bg-slate-700 text-white normal-case text-xs font-semibold py-1 px-3 disabled:opacity-40"
          >
            ย้อนกลับ
          </Button>
          <span className="text-xs text-slate-400 font-mono">
            {activeIndex + 1} / {works.length}
          </span>
          <Button
            disabled={activeIndex === works.length - 1}
            onClick={() => onNavigate(activeIndex + 1)}
            className="w-auto! bg-slate-800 hover:bg-slate-700 text-white normal-case text-xs font-semibold py-1 px-3 disabled:opacity-40"
          >
            ถัดไป
          </Button>
        </div>
      </div>
    </div>
  );
}
