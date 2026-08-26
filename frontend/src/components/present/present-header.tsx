"use client";

import React from "react";
import { Plus, Tv } from "lucide-react";
import { Button } from "@/components/ui/buttons/button";
import { PresentProject } from "@/types/present";

interface PresentHeaderProps {
  project: PresentProject;
  itemCount: number;
  onOpenAddModal: () => void;
}

const statusBadgeClass = (status: string) => {
  if (status === "เสร็จแล้ว") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "กำลังทำ") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-slate-100 text-slate-600 border-slate-200";
};

export function PresentHeader({ project, itemCount, onOpenAddModal }: PresentHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-[#0f172a] via-[#1e1b4b] to-[#311042] border border-slate-800/80 p-6 shadow-xl">
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/40 border border-indigo-500/30 text-indigo-400 text-[10px] font-mono font-bold tracking-wider uppercase">
            <Tv className="w-3 h-3" />
            PRESENT STATION
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">{project.name}</h1>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${statusBadgeClass(project.status)}`}>
              {project.status}
            </span>
            <span className="font-mono text-slate-400">{project.startDate} → {project.endDate}</span>
            <span className="text-slate-500">· {itemCount} รายการนำเสนอ</span>
          </div>
        </div>

        <div className="w-full sm:w-auto shrink-0">
          <Button
            onClick={onOpenAddModal}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium px-4 py-2 rounded-xl transition-all shadow-md hover:shadow-indigo-500/25 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            เพิ่มรูป / รายละเอียด
          </Button>
        </div>
      </div>
    </div>
  );
}