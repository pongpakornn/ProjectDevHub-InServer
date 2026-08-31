"use client";

import React from "react";
import { FolderGit2, Users, CheckCircle2, Clock } from "lucide-react";
import ViewButtonV2 from "@/components/ui/buttons/buttonv2/view-buttonv2";
import EditButtonV2 from "@/components/ui/buttons/buttonv2/edit-buttonv2";
import DeleteButtonV2 from "@/components/ui/buttons/buttonv2/delete-buttonv2";
import { TeamProject } from "@/types/project";

interface TeamProjectRowProps {
  project: TeamProject;
  index: number;
  onProjectClick: (id: number | string) => void;
  onEdit: (project: TeamProject) => void;
  onDelete: (id: number | string) => void;
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

export default function TeamProjectRow({
  project,
  index,
  onProjectClick,
  onEdit,
  onDelete,
}: TeamProjectRowProps) {
  const currentProgress = project.progress;
  const isHighPriority = project.priority === "HIGH" || project.priority === "URGENT";
  const isCompleted = project.status === "COMPLETED";
  const members = project.members || [];

  return (
    <tr className="hover:bg-slate-50/80 transition-colors group">
      <td className="py-3.5 px-3.5 text-center font-mono font-bold text-slate-400">
        {String(index + 1).padStart(2, "0")}
      </td>

      <td className="py-3.5 px-3.5">
        <div
          onClick={() => onProjectClick(project.id)}
          className="flex items-start gap-2.5 cursor-pointer group/item"
        >
          <div className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 group-hover/item:text-indigo-600 group-hover/item:border-indigo-400 group-hover/item:bg-indigo-50 transition-all shrink-0 mt-0.5">
            <FolderGit2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-xs group-hover/item:text-indigo-600 transition-colors underline-offset-2 group-hover/item:underline">
              {project.name}
            </h3>
            <p className="text-[11px] font-medium text-slate-500 line-clamp-1 leading-normal">
              {project.description}
            </p>
          </div>
        </div>
      </td>

      <td className="py-3.5 px-3.5">
        <div className="flex items-center gap-1 flex-wrap max-w-45">
          <Users className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          {members.length > 0 ? (
            <>
              {members.slice(0, 2).map((m) => (
                <span
                  key={m.userId}
                  className="inline-flex items-center px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 font-mono text-[10px] font-bold"
                >
                  {m.fullName}
                </span>
              ))}
              {members.length > 2 && (
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  +{members.length - 2}
                </span>
              )}
            </>
          ) : (
            <span className="text-[10px] font-mono font-bold text-slate-400">-</span>
          )}
        </div>
      </td>

      <td className="py-3.5 px-3.5">
        {isHighPriority ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-200 text-rose-700 border border-rose-200">
            {PRIORITY_LABEL[project.priority]}
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-200 text-slate-600 border border-slate-200">
            {PRIORITY_LABEL[project.priority]}
          </span>
        )}
      </td>
      <td className="py-3.5 px-3.5 font-mono text-[11px] text-slate-500 font-bold">
        {project.startDate}
      </td>
      <td className="py-3.5 px-3.5 font-mono text-[11px] text-slate-500 font-bold">
        {project.endDate}
      </td>
      <td className="py-3.5 px-3.5">
        {isCompleted ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            {STATUS_LABEL[project.status]}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
            {STATUS_LABEL[project.status]}
          </span>
        )}
      </td>
      <td className="py-3.5 px-3.5">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${currentProgress}%` }}
            />
          </div>
          <span className="font-mono font-bold text-[10px] text-slate-600 min-w-6.5 text-right">
            {currentProgress}%
          </span>
        </div>
      </td>

      <td className="py-3.5 px-3.5 text-center">
        <div className="flex items-center justify-center gap-2">
          <ViewButtonV2
            title="ดูรายละเอียดโปรเจกต์"
            onClick={() => onProjectClick(project.id)}
          />
          <EditButtonV2
            title="แก้ไขโปรเจกต์"
            onClick={() => onEdit(project)}
          />
          <DeleteButtonV2
            title="ลบโปรเจกต์"
            onClick={() => onDelete(project.id)}
          />
        </div>
      </td>
    </tr>
  );
}
