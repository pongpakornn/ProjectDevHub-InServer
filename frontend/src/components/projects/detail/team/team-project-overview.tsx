"use client";

import React from "react";
import { Users } from "lucide-react";
import { TeamProject } from "@/types/project";

interface TeamProjectOverviewProps {
  projectInfo: TeamProject;
}

const STATUS_LABEL: Record<TeamProject["status"], string> = {
  PLANNING: "วางแผน",
  IN_PROGRESS: "กำลังทำ",
  ON_HOLD: "พักไว้",
  COMPLETED: "เสร็จแล้ว",
  CANCELLED: "ยกเลิก",
};

const PRIORITY_LABEL: Record<TeamProject["priority"], string> = {
  LOW: "ต่ำ",
  MEDIUM: "ปกติ",
  HIGH: "สูง",
  URGENT: "เร่งด่วน",
};

export default function TeamProjectOverview({ projectInfo }: TeamProjectOverviewProps) {
  const isHighPriority = projectInfo.priority === "HIGH" || projectInfo.priority === "URGENT";
  const members = projectInfo.members || [];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs">
        <div>
          <span className="text-slate-400 font-medium block mb-1.5">Status</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            {STATUS_LABEL[projectInfo.status]}
          </span>
        </div>
        <div>
          <span className="text-slate-400 font-medium block mb-1.5">Priority</span>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold border ${
              isHighPriority
                ? "bg-rose-50 text-rose-600 border-rose-100"
                : "bg-emerald-50 text-emerald-700 border-emerald-100"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isHighPriority ? "bg-rose-500" : "bg-emerald-500"}`} />
            {PRIORITY_LABEL[projectInfo.priority]}
          </span>
        </div>
        <div>
          <span className="text-slate-400 font-medium block mb-1.5 flex items-center gap-1">
            <Users className="w-3 h-3" />
            Team Members ({members.length})
          </span>
          <div className="flex flex-wrap gap-1">
            {members.length > 0 ? (
              members.map((m) => (
                <span
                  key={m.userId}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold text-[11px]"
                  title={m.roleInProject}
                >
                  <span className="w-4 h-4 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-[8px] font-bold flex items-center justify-center shrink-0">
                    {m.fullName.charAt(0)}
                  </span>
                  {m.fullName}
                </span>
              ))
            ) : (
              <span className="font-bold text-slate-400">-</span>
            )}
          </div>
        </div>
        <div>
          <span className="text-slate-400 font-medium block mb-1.5">Requester</span>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
              {projectInfo.requester?.charAt(0) || "?"}
            </span>
            <span className="font-bold text-slate-800">{projectInfo.requester || "-"}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs">
        <div>
          <span className="text-slate-400 font-medium block mb-1.5">Start Date</span>
          <span className="inline-block px-2.5 py-1 bg-sky-50 text-sky-700 border border-sky-100 rounded-md font-bold font-mono">
            {projectInfo.startDate || "-"}
          </span>
        </div>
        <div>
          <span className="text-slate-400 font-medium block mb-1.5">Planned End</span>
          <span className="inline-block px-2.5 py-1 bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-100 rounded-md font-bold font-mono">
            {projectInfo.endDate || "-"}
          </span>
        </div>
        <div className="col-span-2 md:col-span-2">
          <span className="text-slate-400 font-medium block mb-1.5">Project Type</span>
          <span className="inline-block px-2.5 py-1 bg-slate-800 text-white rounded-md font-bold">
            {projectInfo.projectTypeName}
          </span>
        </div>
      </div>

      <hr className="border-slate-100" />

      <div>
        <span className="text-slate-400 font-medium block mb-1 text-xs">Description</span>
        <p className="text-xs text-slate-600 leading-relaxed">{projectInfo.description || "ไม่มีรายละเอียดเพิ่มเติม"}</p>
      </div>
    </div>
  );
}
