"use client";

import React from "react";
import { Users } from "lucide-react";
import { SoloProject } from "@/types/project";

interface TeamProjectOverviewProps {
  projectInfo: SoloProject;
  overallProgress: number;
}

export default function TeamProjectOverview({
  projectInfo,
  overallProgress,
}: TeamProjectOverviewProps) {
  const teamMembers = projectInfo.owner
    ? projectInfo.owner.split(",").map((name) => name.trim()).filter(Boolean)
    : [];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs">
        <div>
          <span className="text-slate-400 font-medium block mb-1">Status</span>
          <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md font-semibold">
            {projectInfo.status}
          </span>
        </div>
        <div>
          <span className="text-slate-400 font-medium block mb-1">Priority</span>
          <span
            className={`inline-block px-2.5 py-1 rounded-md font-semibold border ${
              projectInfo.priority === "สูง"
                ? "bg-rose-50 text-rose-600 border-rose-100"
                : "bg-slate-100 text-slate-700 border-slate-200"
            }`}
          >
            {projectInfo.priority === "สูง" ? "Critical (สูง)" : "Normal (ปกติ)"}
          </span>
        </div>
        <div>
          <span className="text-slate-400 font-medium block mb-1 flex items-center gap-1">
            <Users className="w-3 h-3" />
            Team Members
          </span>
          <div className="flex flex-wrap gap-1">
            {teamMembers.length > 0 ? (
              teamMembers.map((name) => (
                <span
                  key={name}
                  className="inline-flex px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold text-[11px]"
                >
                  {name}
                </span>
              ))
            ) : (
              <span className="font-bold text-slate-400">-</span>
            )}
          </div>
        </div>
        <div>
          <span className="text-slate-400 font-medium block mb-1">Requester</span>
          <span className="font-bold text-slate-800">{projectInfo.requester}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs">
        <div>
          <span className="text-slate-400 font-medium block mb-1">Start Date</span>
          <span className="font-bold text-slate-800 font-mono">{projectInfo.startDate}</span>
        </div>
        <div>
          <span className="text-slate-400 font-medium block mb-1">Planned End</span>
          <span className="font-bold text-slate-800 font-mono">{projectInfo.endDate}</span>
        </div>
        <div>
          <span className="text-slate-400 font-medium block mb-1">Project Type</span>
          <span className="font-bold text-slate-800">{projectInfo.projectType}</span>
        </div>
        <div>
          <span className="text-slate-400 font-medium block mb-1">
            Progress (คำนวณจาก Phase) {overallProgress}%
          </span>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200 mt-1.5">
            <div
              className="bg-indigo-600 h-full transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      <hr className="border-slate-100" />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-slate-400 font-medium block mb-1">ภาษาที่ใช้</span>
          <div className="flex gap-1.5 flex-wrap">
            <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-medium">
              {projectInfo.language || "-"}
            </span>
          </div>
        </div>
        <div>
          <span className="text-slate-400 font-medium block mb-1">Framework</span>
          <div className="flex gap-1.5 flex-wrap">
            <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-medium">
              {projectInfo.framework || "-"}
            </span>
          </div>
        </div>
        <div>
          <span className="text-slate-400 font-medium block mb-1">Library / Package</span>
          <div className="flex gap-1.5 flex-wrap">
            <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-medium">
              {projectInfo.library || "-"}
            </span>
          </div>
        </div>
        <div>
          <span className="text-slate-400 font-medium block mb-1">Database</span>
          <div className="flex gap-1.5 flex-wrap">
            <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-medium">
              {projectInfo.database || "-"}
            </span>
          </div>
        </div>
      </div>

      <div>
        <span className="text-slate-400 font-medium block mb-1 text-xs">Description</span>
        <p className="text-xs text-slate-600 leading-relaxed">{projectInfo.description}</p>
      </div>
    </div>
  );
}