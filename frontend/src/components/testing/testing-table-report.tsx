"use client";

import React from "react";
import { Clock } from "lucide-react";
import { TestRunItem } from "@/types/test-automation";
import ViewButton from "@/components/ui/buttons/view-button";
import EditButton from "@/components/ui/buttons/edit-button";
import DeleteButton from "@/components/ui/buttons/delete-button";

interface TestingTableReportProps {
  runs: TestRunItem[];
  selectedProjectFilter: string;
  projectOptions: string[];
  onFilterChange: (value: string) => void;
  onView: (run: TestRunItem) => void;
  onEdit: (run: TestRunItem) => void;
  onDelete: (id: string | number) => void;
}

export default function TestingTableReport({
  runs,
  selectedProjectFilter,
  projectOptions,
  onFilterChange,
  onView,
  onEdit,
  onDelete,
}: TestingTableReportProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pt-2">
        <h2 className="text-base font-bold text-slate-900">รายการทดสอบย้อนหลัง</h2>
        <select
          value={selectedProjectFilter}
          onChange={(e) => onFilterChange(e.target.value)}
          className="text-xs border border-slate-200 rounded-xl px-3 py-2 font-medium bg-white text-slate-700 shadow-xs focus:outline-none focus:border-indigo-500"
        >
          <option value="all">ทุกโปรเจกต์</option>
          {projectOptions.map((proj) => (
            <option key={proj} value={proj}>
              {proj}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0b0c18] text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800">
                <th className="py-3.5 px-4">NO</th>
                <th className="py-3.5 px-4">SUITE / PROJECT</th>
                <th className="py-3.5 px-4">TOOL</th>
                <th className="py-3.5 px-4">ENV</th>
                <th className="py-3.5 px-4">DATE</th>
                <th className="py-3.5 px-4 min-w-[160px]">PROGRESS</th>
                <th className="py-3.5 px-4">STATUS</th>
                <th className="py-3.5 px-4 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {runs.map((run, index) => {
                const runRate = Math.round((run.passedCases / (run.totalCases || 1)) * 100);
                const itemNo = String(index + 1).padStart(2, "0");

                return (
                  <tr key={run.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-mono text-slate-400 font-bold">{itemNo}</td>

                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900">{run.suiteName}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{run.projectName}</div>
                    </td>

                    <td className="py-4 px-4 font-mono text-slate-600">{run.tool}</td>

                    <td className="py-4 px-4 font-mono font-bold text-slate-700">{run.environment}</td>

                    <td className="py-4 px-4 font-mono text-slate-500">{run.runDate}</td>

                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-end text-[10px] font-mono text-slate-500 font-bold">
                          <span>{runRate}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full rounded-full"
                            style={{ width: `${runRate}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {run.passedCases}/{run.totalCases} ผ่าน · {run.failedCases} fail · {run.durationSeconds}s
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      {run.status === "passed" && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                          ● เสร็จสิ้น
                        </span>
                      )}
                      {run.status === "partial" && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600" /> ผ่านบางส่วน
                        </span>
                      )}
                      {run.status === "failed" && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1">
                          ● ล้มเหลว
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <ViewButton onClick={() => onView(run)} />
                        <EditButton onClick={() => onEdit(run)} />
                        <DeleteButton onClick={() => onDelete(run.id)} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}