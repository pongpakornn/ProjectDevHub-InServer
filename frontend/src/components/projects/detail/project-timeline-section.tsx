"use client";

import React from "react";
import { Phase } from "@/types/project-detail";

interface ProjectTimelineSectionProps {
  phases: Phase[];
}

export const ProjectTimelineSection: React.FC<ProjectTimelineSectionProps> = ({ phases }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-0">
      <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-extrabold text-slate-900 text-base tracking-tight">Project Timeline</h3>
      </div>
      
      <div className="p-3 overflow-x-auto">
        <div className="min-w-[850px]">
          <div className="grid grid-cols-12 bg-[#0f172a] py-3.5 text-xs font-extrabold text-white text-center items-center rounded-t-xl shadow-xs">
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-3 text-left pl-3">Activity</div>
            <div className="col-span-1">มิ.ย.</div>
            <div className="col-span-1">ก.ค.</div>
            <div className="col-span-1">ส.ค.</div>
            <div className="col-span-1">ก.ย.</div>
            <div className="col-span-1">ต.ค.</div>
            <div className="col-span-1">พ.ย.</div>
            <div className="col-span-2">ธ.ค.</div>
          </div>

          <div className="divide-y divide-slate-100 text-xs bg-white border-x border-b border-slate-100 rounded-b-xl">
            {phases.map((phase, idx) => {
              const startDateStr = phase.startDate || "01-07-2026";
              const endDateStr = phase.endDate || "10-07-2026";

              return (
                <div key={phase.id} className="grid grid-cols-12 py-3 items-center hover:bg-slate-50/70 transition-colors">
                  <div className="col-span-1 text-center font-extrabold text-slate-900 text-xs">
                    {String(idx + 1).padStart(2, '0')}
                  </div>

                  <div className="col-span-3 text-left pl-3 font-bold text-slate-900 text-sm truncate">
                    {phase.name}
                  </div>

                  <div className="col-span-8 relative h-7 bg-slate-100/60 rounded-full border border-slate-200/50 flex items-center px-1">
                    {phase.startDate && (
                      <div 
                        className="h-5 bg-indigo-600 rounded-full flex items-center justify-between px-2 shadow-xs transition-all" 
                        style={{
                          marginLeft: `${(idx * 7) % 60}%`,
                          width: `${Math.max(32, 100 - (idx * 8))}%`
                        }} 
                      >
                        <span className="font-mono text-[10px] font-bold text-white tracking-tighter bg-indigo-800/60 px-2 py-0.5 rounded-full shadow-2xs">
                          {startDateStr}
                        </span>
                        <span className="font-mono text-[10px] font-bold text-white tracking-tighter bg-indigo-800/60 px-2 py-0.5 rounded-full shadow-2xs">
                          {endDateStr}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};