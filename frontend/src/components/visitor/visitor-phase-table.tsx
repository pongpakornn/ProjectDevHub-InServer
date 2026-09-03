"use client";

import React, { useState } from "react";
import { ChevronDown, CheckCircle2, Clock, CircleDashed, Square, CheckSquare } from "lucide-react";
import { Phase } from "@/types/project-detail";

interface VisitorPhaseTableProps {
  phases: Phase[];
}

// ตารางแสดง Phase/Task แบบ "ดูอย่างเดียว" ล้วนๆ — ไม่มี input/checkbox ที่กดแล้วยิง API เหมือน
// ProjectPhaseSection ตัวจริง (ตัวนั้นไม่มี Prop ควบคุมโหมด Read-only เลย จึงไม่ปลอดภัยที่จะเอามาใช้ตรงๆ ใน Visitor Mode)
export const VisitorPhaseTable: React.FC<VisitorPhaseTableProps> = ({ phases }) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const calculateProgress = (phase: Phase) => {
    if (phase.items.length === 0) return phase.status === "Done" ? 100 : 0;
    const done = phase.items.filter((i) => i.completed).length;
    return Math.round((done / phase.items.length) * 100);
  };

  if (phases.length === 0) {
    return (
      <p className="text-center text-slate-400 text-xs py-6 border border-dashed border-slate-200 rounded-xl">
        ยังไม่มีข้อมูล Phase สำหรับโปรเจกต์นี้
      </p>
    );
  }

  return (
    <div className="overflow-hidden border border-slate-200/90 rounded-xl shadow-2xs bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-slate-200 font-semibold border-b border-slate-800 select-none">
            <tr>
              <th className="py-3.5 px-2 w-12 text-center font-mono text-[11px] font-bold uppercase tracking-wider text-slate-200">#</th>
              <th className="py-3.5 px-3 min-w-[220px] tracking-wide">Phase Name</th>
              <th className="py-3.5 px-3 w-36 tracking-wide">Owner</th>
              <th className="py-3.5 px-3 w-32 tracking-wide">Start Date</th>
              <th className="py-3.5 px-3 w-32 tracking-wide">End Date</th>
              <th className="py-3.5 px-3 w-36 tracking-wide">Status</th>
              <th className="py-3.5 px-3 w-36 tracking-wide">Progress</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {phases.map((phase, idx) => {
              const phaseProgress = calculateProgress(phase);
              const totalTasks = phase.items.length;
              const completedTasksCount = phase.items.filter((i) => i.completed).length;

              let autoStatus: "Not Started" | "In Progress" | "Done" = "Not Started";
              if (totalTasks > 0 && completedTasksCount === totalTasks) autoStatus = "Done";
              else if (completedTasksCount > 0) autoStatus = "In Progress";

              const isDone = autoStatus === "Done";
              const isInProgress = autoStatus === "In Progress";
              const isExpanded = !!expanded[phase.id];

              return (
                <React.Fragment key={phase.id}>
                  <tr className="hover:bg-indigo-50/30 transition-colors group cursor-pointer" onClick={() => toggleExpand(phase.id)}>
                    <td className="py-2.5 px-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isExpanded ? "rotate-0" : "-rotate-90"}`} />
                        <span className="font-mono text-slate-700 text-xs font-extrabold tracking-tight min-w-[20px]">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 font-bold text-slate-900 text-sm">{phase.name}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-700">{phase.owner || "-"}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{phase.startDate || "-"}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{phase.endDate || "-"}</td>

                    <td className="py-2.5 px-3">
                      <div
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-bold border w-fit select-none ${
                          isDone
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
                            : isInProgress
                            ? "bg-indigo-50 text-indigo-700 border-indigo-200/80"
                            : "bg-slate-100/80 text-slate-500 border-slate-200/80"
                        }`}
                      >
                        {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                        {isInProgress && <Clock className="w-3.5 h-3.5 text-indigo-600" />}
                        {!isDone && !isInProgress && <CircleDashed className="w-3.5 h-3.5 text-slate-400" />}
                        <span>{autoStatus}</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 rounded-full h-2 border border-slate-200/80 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 rounded-full ${
                              isDone ? "bg-indigo-500" : isInProgress ? "bg-indigo-600" : "bg-slate-300"
                            }`}
                            style={{ width: `${phaseProgress}%` }}
                          />
                        </div>
                        <span className="font-mono text-[12px] font-bold text-slate-600 min-w-[34px] text-right">{phaseProgress}%</span>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td colSpan={7} className="p-0 border-none">
                      <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                        <div className="overflow-hidden">
                          <div className="bg-slate-50/80 p-4 pl-10 border-t border-b border-slate-200/60 space-y-2">
                            <h4 className="font-semibold text-slate-700 text-xs flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                              รายการ Sub-tasks ในเฟสนี้ ({completedTasksCount}/{totalTasks})
                            </h4>
                            {phase.items.length === 0 ? (
                              <p className="text-[11px] text-slate-400">ยังไม่มี Task ในเฟสนี้</p>
                            ) : (
                              <div className="space-y-1.5">
                                {phase.items.map((task) => (
                                  <div
                                    key={task.id}
                                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border ${
                                      task.completed ? "bg-slate-50/80 border-slate-200/60" : "bg-white border-slate-200"
                                    }`}
                                  >
                                    {task.completed ? (
                                      <CheckSquare className="w-3.5 h-3.5 text-indigo-500 mt-0.5 shrink-0" />
                                    ) : (
                                      <Square className="w-3.5 h-3.5 text-slate-300 mt-0.5 shrink-0" />
                                    )}
                                    <div className="min-w-0">
                                      <p className={`text-xs font-bold ${task.completed ? "text-slate-400 line-through" : "text-slate-800"}`}>
                                        {task.title}
                                      </p>
                                      {task.detail && <p className="text-[11px] text-slate-500 mt-0.5">{task.detail}</p>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
