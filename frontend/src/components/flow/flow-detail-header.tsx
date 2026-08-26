"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, GitFork } from "lucide-react";

interface FlowDetailHeaderProps {
  name: string;
  status: string;
  startDate: string;
  endDate: string;
  workType: string;
}

const statusBadgeClass = (status: string) => {
  if (status === "เสร็จแล้ว") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "กำลังทำ") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-slate-100 text-slate-600 border-slate-200";
};

export default function FlowDetailHeader({
  name,
  status,
  startDate,
  endDate,
  workType,
}: FlowDetailHeaderProps) {
  return (
    <div className="space-y-6">
      {/* ปุ่มย้อนกลับ */}
      <Link
        href="/dashboard/flow"
        className="group inline-flex items-center gap-2 pl-2 pr-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-bold text-slate-600 hover:text-indigo-600 hover:border-indigo-300 hover:shadow-md transition-all duration-300 w-fit"
      >
        <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center transition-colors duration-300 group-hover:bg-indigo-50">
          <ArrowLeft className="w-3.5 h-3.5" />
        </span>
        กลับไปเลือกโปรเจค
      </Link>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-[#0f172a] via-[#1e1b4b] to-[#311042] border border-slate-800/80 p-6 shadow-xl">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/40 border border-indigo-500/30 text-indigo-400 text-[10px] font-mono font-bold tracking-wider uppercase">
              <GitFork className="w-3 h-3" />
              FLOW STATION
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">{name}</h1>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${statusBadgeClass(status)}`}>
                {status}
              </span>
              <span className="font-mono text-slate-400">{startDate} → {endDate}</span>
              <span className="text-slate-500">· {workType}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}