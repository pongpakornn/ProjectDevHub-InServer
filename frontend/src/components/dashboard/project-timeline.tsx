"use client";

import { Calendar, CheckCircle2, Clock } from "lucide-react";
import { DashboardProject } from "@/types/dashboard";

const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

function toDisplayDate(iso?: string): string {
  if (!iso) return "-";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

function getMonth(iso?: string): number | null {
  if (!iso) return null;
  const month = Number(iso.split("-")[1]);
  return month >= 1 && month <= 12 ? month : null;
}

interface ProjectTimelineProps {
  projects: DashboardProject[];
}

export default function ProjectTimeline({ projects }: ProjectTimelineProps) {
  const currentYear = new Date().getFullYear();

  const rows = projects.map((p) => {
    const monthStart = getMonth(p.startDate) ?? 1;
    const monthEnd = Math.max(monthStart, getMonth(p.endDate) ?? monthStart);
    return {
      ...p,
      dateLabel: `${toDisplayDate(p.startDate)} → ${toDisplayDate(p.endDate)}`,
      monthStart,
      monthEnd,
    };
  });

  return (
    <div className="space-y-6">
      {/* 1. Perfect Gantt Chart Layout */}
      <div className="bg-white border border-slate-300 rounded-2xl shadow-md hover:shadow-lg transition-all overflow-hidden space-y-4">

        {/* Dark Header */}
        <div className="flex justify-between items-center px-6 py-3.5 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">ไทม์ไลน์รายปี — วันเริ่ม → วันสำเร็จ</h2>
              <p className="text-xs text-slate-400">เป้าหมายและระยะเวลาการพัฒนาของแต่ละระบบ</p>
            </div>
          </div>
          <select className="text-xs border border-slate-700 rounded-xl px-3 py-1.5 bg-slate-800 font-semibold text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs cursor-pointer">
            <option>ปี {currentYear}</option>
          </select>
        </div>

        {rows.length === 0 ? (
          <p className="text-center text-slate-400 text-xs py-10">ยังไม่มีโปรเจกต์ในระบบ</p>
        ) : (
        <div className="px-6 pb-6 space-y-3">
          {/* Header Row: Left Title Space + 12 Months Grid */}
          <div className="flex gap-3 items-center">
            <div className="w-56 shrink-0 text-xs font-bold text-slate-500 uppercase tracking-wider px-2">
              ชื่อโปรเจค / ระยะเวลา
            </div>
            <div className="grow grid grid-cols-12 gap-1 text-[11px] font-bold text-slate-700 text-center bg-slate-100 py-2.5 rounded-xl border border-slate-200 shadow-xs">
              {months.map((m) => (
                <div key={m} className="border-r border-slate-300/60 last:border-r-0">{m}</div>
              ))}
            </div>
          </div>

          {/* Project Rows */}
          <div className="space-y-2 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-inner">
            {rows.map((project, idx) => (
              <div
                key={project.projectId}
                className={`flex gap-3 items-center text-xs p-2.5 border-b border-slate-200 last:border-b-0 ${
                  idx % 2 === 0 ? "bg-white" : "bg-slate-50/70"
                } hover:bg-emerald-50/50 transition-colors`}
              >
                {/* Fixed Left Project Info Column */}
                <div className="w-56 shrink-0 pr-2 border-r border-slate-200">
                  <p className="font-bold text-slate-800 text-xs truncate">{project.name}</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">{project.dateLabel}</p>
                </div>

                {/* 12-Month Gantt Bar Area */}
                <div className="grow bg-slate-200/80 h-8 rounded-lg relative flex items-center px-1 border border-slate-300/60 shadow-inner overflow-hidden">
                  {/* Background Month Grid Dividers */}
                  <div className="absolute inset-0 grid grid-cols-12 pointer-events-none opacity-20">
                    {months.map((_, i) => (
                      <div key={i} className="border-r border-slate-800 h-full"></div>
                    ))}
                  </div>

                  {/* Gantt Bar */}
                  <div
                    className={`h-6 rounded-md text-[10px] font-mono font-bold text-white flex items-center justify-center transition-all shadow-md relative z-10 ${
                      project.status === "completed"
                        ? "bg-linear-to-r from-emerald-600 via-teal-500 to-emerald-400"
                        : "bg-linear-to-r from-amber-500 via-orange-400 to-yellow-400"
                    }`}
                    style={{
                      marginLeft: `${((project.monthStart - 1) / 12) * 100}%`,
                      width: `${Math.max(((project.monthEnd - project.monthStart + 1) / 12) * 100, 6)}%`,
                    }}
                  >
                    {Math.round(project.progress) === 100 ? "100%" : `${Math.round(project.progress)}%`}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Summary Tags */}
          <div className="pt-3 flex flex-wrap gap-2">
            {rows.map((p) => (
              <span
                key={p.projectId}
                className={`text-[10px] font-bold px-3 py-1 rounded-lg border inline-flex items-center gap-1.5 shadow-2xs ${
                  p.status === "completed"
                    ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                    : "bg-amber-50 text-amber-900 border-amber-300"
                }`}
              >
                {p.status === "completed" ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Clock className="w-3 h-3 text-amber-600" />
                )}
                {p.name} - {p.status === "completed" ? "เสร็จแล้ว" : "กำลังทำ"}
              </span>
            ))}
          </div>
        </div>
        )}
      </div>

      {/* 2. Timeline Progress Bar List */}
      <div className="bg-white border border-slate-300 rounded-2xl shadow-md hover:shadow-lg transition-all overflow-hidden">

        {/* Dark Header */}
        <div className="px-6 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">
              ไทม์ไลน์โปรเจค (Progress bar)
            </h2>
            <p className="text-xs text-slate-400">ระดับความสำเร็จแต่ละระบบในรูปแบบแถบวัด</p>
          </div>
        </div>

        {rows.length === 0 ? (
          <p className="text-center text-slate-400 text-xs py-10">ยังไม่มีโปรเจกต์ในระบบ</p>
        ) : (
        <div className="p-6 space-y-3.5">
          {rows.map((p) => (
            <div key={p.projectId} className="space-y-1.5 bg-slate-50/60 p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-800">{p.name}</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${
                      p.status === "completed"
                        ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                        : "bg-amber-100 text-amber-900 border-amber-300"
                    }`}
                  >
                    {p.status === "completed" ? "เสร็จแล้ว" : "กำลังทำ"}
                  </span>
                  <span className="text-slate-900 font-bold text-xs font-mono">{Math.round(p.progress)}%</span>
                </div>
              </div>
              <div className="w-full h-3.5 bg-slate-200 rounded-full overflow-hidden p-0.5 shadow-inner border border-slate-300/60">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    p.status === "completed"
                      ? "bg-linear-to-r from-emerald-500 via-teal-400 to-emerald-300 shadow-xs"
                      : "bg-linear-to-r from-amber-400 via-orange-400 to-yellow-300 shadow-xs"
                  }`}
                  style={{ width: `${p.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
}
