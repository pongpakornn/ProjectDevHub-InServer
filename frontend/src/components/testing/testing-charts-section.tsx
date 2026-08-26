"use client";

import React from "react";

interface ProjectStat {
  name: string;
  passed: number;
  failed: number;
  total: number;
}

interface TestingChartsSectionProps {
  passRate: number;
  failRate: number;
  totalCases: number;
  totalPassed: number;
  totalFailed: number;
  projectStats: ProjectStat[];
}

export default function TestingChartsSection({
  passRate,
  failRate,
  totalCases,
  totalPassed,
  totalFailed,
  projectStats,
}: TestingChartsSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* สัดส่วนผลลัพธ์ */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm text-slate-900">สัดส่วนผลลัพธ์</h3>
          <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
            Pass Rate {passRate}%
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-4">
          <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.8"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500 transition-all duration-700 ease-out"
                strokeDasharray={`${passRate} ${100 - passRate}`}
                strokeDashoffset="0"
                strokeWidth="3.8"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-rose-500 transition-all duration-700 ease-out"
                strokeDasharray={`${failRate} ${100 - failRate}`}
                strokeDashoffset={`-${passRate}`}
                strokeWidth="3.8"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black font-mono text-slate-800">{totalCases}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total Cases</span>
            </div>
          </div>

          <div className="space-y-3 w-full sm:w-auto">
            <div className="flex items-center justify-between sm:justify-start gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold text-slate-600">ผ่าน (Passed)</span>
              </div>
              <span className="font-mono font-bold text-xs text-slate-900">
                {totalPassed} เคส ({passRate}%)
              </span>
            </div>

            <div className="flex items-center justify-between sm:justify-start gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="text-xs font-semibold text-slate-600">ไม่ผ่าน (Failed)</span>
              </div>
              <span className="font-mono font-bold text-xs text-slate-900">
                {totalFailed} เคส ({failRate}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ผลเทสแยกตามโปรเจกต์ */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm text-slate-900">ผลเทสแยกตามโปรเจกต์</h3>
          <span className="text-xs text-slate-400 font-mono">{projectStats.length} Projects</span>
        </div>

        <div className="space-y-5 my-auto">
          {projectStats.map((proj, idx) => {
            const pRate = proj.total > 0 ? Math.round((proj.passed / proj.total) * 100) : 0;
            const fRate = proj.total > 0 ? 100 - pRate : 0;

            return (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-800 truncate max-w-[220px]">{proj.name}</span>
                  <span className="font-mono text-slate-500">
                    {proj.passed}/{proj.total} ({pRate}%)
                  </span>
                </div>

                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-500"
                    style={{ width: `${pRate}%` }}
                    title={`Passed: ${proj.passed}`}
                  />
                  <div
                    className="bg-rose-500 h-full transition-all duration-500"
                    style={{ width: `${fRate}%` }}
                    title={`Failed: ${proj.failed}`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-500 font-medium">ผ่าน</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-slate-500 font-medium">ไม่ผ่าน</span>
          </div>
        </div>
      </div>
    </div>
  );
}