"use client";

import React from "react";
import { Users } from "lucide-react";
import { SoloProject } from "@/types/project";

interface TeamProjectOverviewProps {
  projectInfo: SoloProject;
}

export default function TeamProjectOverview({ projectInfo }: TeamProjectOverviewProps) {
  const teamMembers = projectInfo.owner
    ? projectInfo.owner.split(",").map((name) => name.trim()).filter(Boolean)
    : [];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs">
        <div>
          <span className="text-slate-400 font-medium block mb-1.5">Status</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            {projectInfo.status}
          </span>
        </div>
        <div>
          <span className="text-slate-400 font-medium block mb-1.5">Priority</span>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold border ${
              projectInfo.priority === "สูง"
                ? "bg-rose-50 text-rose-600 border-rose-100"
                : "bg-emerald-50 text-emerald-700 border-emerald-100"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${projectInfo.priority === "สูง" ? "bg-rose-500" : "bg-emerald-500"}`} />
            {projectInfo.priority === "สูง" ? "Critical (สูง)" : "Normal (ปกติ)"}
          </span>
        </div>
        <div>
          <span className="text-slate-400 font-medium block mb-1.5 flex items-center gap-1">
            <Users className="w-3 h-3" />
            Team Members
          </span>
          <div className="flex flex-wrap gap-1">
            {teamMembers.length > 0 ? (
              teamMembers.map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold text-[11px]"
                >
                  <span className="w-4 h-4 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-[8px] font-bold flex items-center justify-center shrink-0">
                    {name.charAt(0)}
                  </span>
                  {name}
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
            <span className="font-bold text-slate-800">{projectInfo.requester}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs">
        <div>
          <span className="text-slate-400 font-medium block mb-1.5">Start Date</span>
          <span className="inline-block px-2.5 py-1 bg-sky-50 text-sky-700 border border-sky-100 rounded-md font-bold font-mono">
            {projectInfo.startDate}
          </span>
        </div>
        <div>
          <span className="text-slate-400 font-medium block mb-1.5">Planned End</span>
          <span className="inline-block px-2.5 py-1 bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-100 rounded-md font-bold font-mono">
            {projectInfo.endDate}
          </span>
        </div>
        <div className="col-span-2 md:col-span-2">
          <span className="text-slate-400 font-medium block mb-1.5">Project Type</span>
          <span className="inline-block px-2.5 py-1 bg-slate-800 text-white rounded-md font-bold">
            {projectInfo.projectType}
          </span>
        </div>
      </div>

      <hr className="border-slate-100" />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-slate-400 font-medium block mb-1">ภาษาที่ใช้</span>
          <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-medium">
            {projectInfo.language || "-"}
          </span>
        </div>
        <div>
          <span className="text-slate-400 font-medium block mb-1">Framework</span>
          <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-medium">
            {projectInfo.framework || "-"}
          </span>
        </div>
        <div>
          <span className="text-slate-400 font-medium block mb-1">Library / Package</span>
          <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-medium">
            {projectInfo.library || "-"}
          </span>
        </div>
        <div>
          <span className="text-slate-400 font-medium block mb-1">Database</span>
          <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-medium">
            {projectInfo.database || "-"}
          </span>
        </div>
      </div>

      <div>
        <span className="text-slate-400 font-medium block mb-1 text-xs">Description</span>
        <p className="text-xs text-slate-600 leading-relaxed">{projectInfo.description}</p>
      </div>
    </div>
  );
}