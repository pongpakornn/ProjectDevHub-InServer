"use client";

import { BarChart3, PieChart, Gauge, TrendingUp } from "lucide-react";
import { DashboardSummary } from "@/types/dashboard";

interface ProjectChartsProps {
  summary: DashboardSummary;
}

export default function ProjectCharts({ summary }: ProjectChartsProps) {
  const { projects, completedCount, inProgressCount, overallProgress, passRate, totalTestCases, totalTestRuns } = summary;
  const total = projects.length;
  const completedPct = total > 0 ? (completedCount / total) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Row 1: Bar Chart & Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Bar Chart Container */}
        <div className="lg:col-span-2 bg-white border border-slate-300 rounded-2xl shadow-md hover:shadow-lg transition-all overflow-hidden flex flex-col justify-between">

          {/* Dark Header */}
          <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-xs">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight">
                  กราฟแท่ง — ความคืบหน้ารายโปรเจค
                </h2>
                <p className="text-xs text-slate-400">เปรียบเทียบ % ความสำเร็จของแต่ละระบบ</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700 shadow-xs">
              TOTAL: {total} PROJECTS
            </span>
          </div>

          {/* Chart Outer Section */}
          <div className="p-6">
            {total === 0 ? (
              <p className="text-center text-slate-400 text-xs py-10">ยังไม่มีโปรเจกต์ในระบบ</p>
            ) : (
            <div className="border border-slate-200 bg-slate-50/60 rounded-xl p-4 shadow-inner">
              <div className="h-80 relative flex items-end justify-between gap-2 sm:gap-5 pt-14 pb-14 px-3 sm:px-6">

                {/* Background Dotted Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none p-3 opacity-40">
                  <div className="border-b border-dashed border-slate-300 w-full text-[10px] font-mono text-slate-400">100%</div>
                  <div className="border-b border-dashed border-slate-300 w-full text-[10px] font-mono text-slate-400">75%</div>
                  <div className="border-b border-dashed border-slate-300 w-full text-[10px] font-mono text-slate-400">50%</div>
                  <div className="border-b border-dashed border-slate-300 w-full text-[10px] font-mono text-slate-400">25%</div>
                  <div className="border-b border-slate-300 w-full text-[10px] font-mono text-slate-400">0%</div>
                </div>

                {/* Bars Render */}
                {projects.map((item) => (
                  <div key={item.projectId} className="flex-1 flex flex-col items-center h-full justify-end group relative z-10">

                    {/* Hover Floating Tooltip Badge */}
                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-slate-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-xl pointer-events-none whitespace-nowrap z-30 border border-slate-700 transform group-hover:-translate-y-1">
                      {item.name}: <span className="text-emerald-400 font-mono">{Math.round(item.progress)}%</span>
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45 border-r border-b border-slate-700"></div>
                    </div>

                    {/* Permanent Percentage Label Above Bar */}
                    <span className="text-[11px] font-extrabold font-mono text-slate-700 mb-1 transition-all group-hover:text-emerald-600 group-hover:scale-110">
                      {Math.round(item.progress)}%
                    </span>

                    {/* Bar Container */}
                    <div className="w-full max-w-10 bg-slate-200/80 rounded-t-xl h-full flex items-end p-1 shadow-inner border border-slate-300/40">
                      <div
                        className={`w-full rounded-t-lg transition-all duration-500 shadow-sm ${
                          item.status === "completed"
                            ? "bg-linear-to-t from-emerald-600 via-teal-500 to-emerald-400 group-hover:brightness-110"
                            : "bg-linear-to-t from-amber-500 via-orange-400 to-yellow-300 group-hover:brightness-110"
                        }`}
                        style={{ height: `${item.progress}%` }}
                      ></div>
                    </div>

                    {/* Bottom Rotated Project Name Label */}
                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-24 text-center pointer-events-none">
                      <span className="inline-block text-[10px] font-extrabold text-slate-700 -rotate-45 origin-center whitespace-nowrap transition-colors group-hover:text-emerald-600">
                        {item.name}
                      </span>
                    </div>

                  </div>
                ))}
              </div>
            </div>
            )}
          </div>

        </div>

        {/* Donut Chart Container */}
        <div className="bg-white border border-slate-300 rounded-2xl shadow-md hover:shadow-lg transition-all overflow-hidden flex flex-col justify-between">

          {/* Dark Header */}
          <div className="flex items-center gap-3 px-6 py-3.5 bg-slate-900 border-b border-slate-800">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-xs">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">กราฟวงกลม — สัดส่วนสถานะ</h2>
              <p className="text-xs text-slate-400">จำแนกตามสถานะปัจจุบัน</p>
            </div>
          </div>

          <div className="p-6 flex flex-col items-center justify-center my-auto">
            <div className="relative w-52 h-52 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-emerald-500/5 blur-xl"></div>

              <div
                className="w-48 h-48 rounded-full flex items-center justify-center shadow-lg relative z-10"
                style={{
                  background:
                    total > 0
                      ? `conic-gradient(#10b981 0% ${completedPct}%, #fbbf24 ${completedPct}% 100%)`
                      : "#e2e8f0",
                }}
              >
                <div className="w-36 h-36 rounded-full bg-white flex items-center justify-center text-center shadow-inner">
                  <div>
                    <span className="text-4xl font-black text-slate-900 tracking-tight font-mono">{total}</span>
                    <span className="block text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">โปรเจคทั้งหมด</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex justify-center gap-6 text-xs font-bold">
            <span className="flex items-center gap-2 text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="w-3 h-3 rounded-full bg-amber-400 shadow-xs"></span> กำลังทำ ({inProgressCount})
            </span>
            <span className="flex items-center gap-2 text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-xs"></span> เสร็จแล้ว ({completedCount})
            </span>
          </div>
        </div>

      </div>

      {/* Row 2: Gauge & Pass Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Gauge Chart Container */}
        <div className="bg-white border border-slate-300 rounded-2xl shadow-md hover:shadow-lg transition-all overflow-hidden flex flex-col justify-between">

          {/* Dark Header */}
          <div className="flex items-center gap-3 px-6 py-3.5 bg-slate-900 border-b border-slate-800">
            <div className="p-2 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-400 shadow-xs">
              <Gauge className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-white tracking-tight">
              เกจความคืบหน้ารวม
            </h2>
          </div>

          <div className="p-6 flex flex-col items-center justify-center">
            <div className="relative w-52 h-52 flex items-center justify-center">
              <div
                className="w-48 h-48 rounded-full flex flex-col items-center justify-center shadow-inner"
                style={{ background: `conic-gradient(#10b981 0% ${overallProgress}%, #e2e8f0 ${overallProgress}% 100%)` }}
              >
                <div className="w-36 h-36 rounded-full bg-slate-50 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-slate-900 font-mono">{overallProgress}%</span>
                  <span className="text-xs text-emerald-700 font-extrabold bg-emerald-100 px-3 py-1 rounded-full mt-2 border border-emerald-200 shadow-xs">
                    {total} โปรเจค
                  </span>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500 font-medium text-center mt-4">ภาพรวมความสมบูรณ์ของระบบในภาพรวม</p>
          </div>
        </div>

        {/* Pass Rate Summary */}
        <div className="lg:col-span-2 bg-white border border-slate-300 rounded-2xl shadow-md hover:shadow-lg transition-all overflow-hidden flex flex-col justify-between">

          {/* Dark Header */}
          <div className="flex items-center gap-3 px-6 py-3.5 bg-slate-900 border-b border-slate-800">
            <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-400 shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                ผลทดสอบอัตโนมัติ (Pass rate)
              </h2>
              <p className="text-xs text-slate-400">สรุปจากทุกรอบการรัน Test Automation</p>
            </div>
          </div>

          <div className="p-6">
            <div className="h-64 border border-slate-200 relative flex flex-col items-center justify-center gap-3 bg-linear-to-b from-emerald-500/10 via-slate-50 to-transparent rounded-xl overflow-hidden shadow-inner">
              <div className="relative flex items-center justify-center">
                <span className="absolute w-6 h-6 rounded-full bg-emerald-400 opacity-75 animate-ping"></span>
                <span className="relative w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-emerald-200 shadow-md"></span>
              </div>
              <span className="text-2xl text-emerald-800 font-black bg-emerald-100 border border-emerald-300 px-4 py-1.5 rounded-lg shadow-xs font-mono">
                {passRate}% Pass
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {totalTestCases} เคสทดสอบ จาก {totalTestRuns} รอบการรัน
              </span>
            </div>
          </div>

          <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex justify-center gap-6 text-xs font-bold">
            <span className="text-emerald-700 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 flex items-center gap-2 shadow-xs">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span> ผ่าน {passRate}%
            </span>
            <span className="text-rose-600 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 flex items-center gap-2 shadow-xs">
              <span className="w-3 h-3 rounded-full bg-rose-500"></span> ไม่ผ่าน {100 - passRate}%
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
