"use client";

import React from "react";
import Link from "next/link";
import { GitFork, User, Users, ArrowRight } from "lucide-react";
import { FlowListItem } from "@/types/flow";

interface FlowProjectCardProps {
  project: FlowListItem;
}

const statusBadgeClass = (status: FlowListItem["status"]) => {
  if (status === "เสร็จแล้ว") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "กำลังทำ") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-slate-100 text-slate-600 border-slate-200";
};

export default function FlowProjectCard({ project: p }: FlowProjectCardProps) {
  return (
    <Link
      href={`/dashboard/flow/${p.id}`}
      className="group bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:shadow-lg hover:shadow-indigo-500/10 hover:border-indigo-300 hover:-translate-y-1 transition-all duration-300 ease-out flex flex-col gap-3 cursor-pointer"
    >
      <div className="flex items-start gap-2.5">
        <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 shrink-0 transition-colors duration-300 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600">
          <GitFork className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-slate-900 text-sm truncate transition-colors duration-300 group-hover:text-indigo-600">
            {p.name}
          </h3>
          <p className="text-[11px] text-slate-500 line-clamp-1">{p.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[11px]">
        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${statusBadgeClass(p.status)}`}>
          {p.status}
        </span>
        <span className="text-slate-400 font-mono">
          {p.startDate} → {p.endDate}
        </span>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
          <div
            className="bg-indigo-500 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(99,102,241,0.7)]"
            style={{ width: `${p.progress}%` }}
          />
        </div>
        <span className="text-indigo-600 font-mono font-extrabold text-[11px] shrink-0 w-8 text-right">
          {p.progress}%
        </span>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
        <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
          {p.workType === "ทำคนเดียว" ? <User className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
          {p.workType}
        </span>
        <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-600">
          ดู Flow
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}