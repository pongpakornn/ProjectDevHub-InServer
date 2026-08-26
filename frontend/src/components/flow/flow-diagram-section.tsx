"use client";

import React from "react";
import { GitBranch } from "lucide-react";

export interface FlowPhaseStep {
  id: string;
  stepNo: string;
  title: string;
  status: "เสร็จแล้ว" | "กำลังทำ" | "รอดำเนินการ";
  progress: number;
}

interface FlowDiagramSectionProps {
  phases: FlowPhaseStep[];
}

const stepBadgeStyle: Record<FlowPhaseStep["status"], string> = {
  "เสร็จแล้ว": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "กำลังทำ": "bg-amber-50 text-amber-700 border-amber-200",
  "รอดำเนินการ": "bg-slate-100 text-slate-500 border-slate-200",
};

const stepBarStyle: Record<FlowPhaseStep["status"], string> = {
  "เสร็จแล้ว": "bg-emerald-500",
  "กำลังทำ": "bg-amber-500",
  "รอดำเนินการ": "bg-slate-300",
};

export default function FlowDiagramSection({ phases }: FlowDiagramSectionProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
      <div className="flex items-center gap-2">
        <GitBranch className="w-4 h-4 text-indigo-600" />
        <h2 className="font-bold text-slate-900 text-sm">Flow Diagram — ลำดับเฟสงาน</h2>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="flex items-stretch min-w-max">
          {phases.map((step, idx) => (
            <React.Fragment key={step.id}>
              <div className="w-56 shrink-0 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wider">
                    {step.stepNo}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${stepBadgeStyle[step.status]}`}>
                    {step.status}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-800 leading-snug min-h-8">
                  {step.title}
                </p>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${stepBarStyle[step.status]}`}
                    style={{ width: `${step.progress}%` }}
                  />
                </div>
                <div className="text-right text-[10px] font-mono font-bold text-slate-400">
                  {step.progress}%
                </div>
              </div>

              {idx < phases.length - 1 && (
                <div className="flex items-center justify-center w-8 shrink-0 text-slate-300">
                  <ArrowRightIcon />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}