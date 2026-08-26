"use client";

import React from "react";
import { Phase } from "./team-project-phase-table";

interface TeamProjectGanttTimelineProps {
  phases: Phase[];
}

export default function TeamProjectGanttTimeline({ phases }: TeamProjectGanttTimelineProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
      <h3 className="font-bold text-slate-800 text-sm">Project Timeline</h3>

      <div className="overflow-x-auto">
        <div className="min-w-175">
          <div className="grid grid-cols-12 border-b border-slate-200 pb-2 text-[11px] font-bold text-slate-500 text-center">
            <div className="col-span-4 text-left pl-2">Activity</div>
            <div className="col-span-1">มิ.ย.</div>
            <div className="col-span-1">ก.ค.</div>
            <div className="col-span-1">ส.ค.</div>
            <div className="col-span-1">ก.ย.</div>
            <div className="col-span-1">ต.ค.</div>
            <div className="col-span-1">พ.ย.</div>
            <div className="col-span-2">ธ.ค.</div>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {phases.map((phase, idx) => (
              <div key={phase.id} className="grid grid-cols-12 py-2.5 items-center hover:bg-slate-50">
                <div className="col-span-4 pl-2 font-medium text-slate-800 truncate">
                  {idx + 1}. {phase.name}
                </div>
                <div className="col-span-8 relative h-5 bg-slate-50 rounded border border-slate-100 flex items-center px-1">
                  {phase.startDate && (
                    <div
                      className="h-3.5 bg-indigo-600 rounded shadow-xs"
                      style={{
                        marginLeft: `${(idx * 8) % 70}%`,
                        width: `${Math.max(15, 100 - idx * 10)}%`,
                      }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}