"use client";

import React from "react";
import { FolderGit2, Users, CheckCircle2, Clock } from "lucide-react";
import ViewButton from "@/components/ui/buttons/view-button";
import EditButton from "@/components/ui/buttons/edit-button";
import DeleteButton from "@/components/ui/buttons/delete-button";
import { SoloProject } from "@/types/project";
import { calculateProjectProgress } from "@/lib/project-utils";

interface SoloProjectRowProps {
  project: SoloProject;
  idx: number;
  onProjectClick: (id: number | string) => void;
  onEdit: (project: SoloProject) => void;
  onDelete: (id: number | string) => void;
}

export default function SoloProjectRow({
  project,
  idx,
  onProjectClick,
  onEdit,
  onDelete,
}: SoloProjectRowProps) {
  const currentProgress = calculateProjectProgress(
    project.phases,
    project.status,
    project.progress
  );

  return (
    <tr className="hover:bg-slate-50/80 transition-colors group">
      <td className="py-3.5 px-3.5 text-center font-mono font-bold text-slate-400">
        {String(idx + 1).padStart(2, "0")}
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

      <td className="py-3.5 px-3.5 font-mono text-[11px] font-bold text-slate-600">
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span>{project.owner}</span>
        </div>
      </td>

      <td className="py-3.5 px-3.5">
        {project.priority === "สูง" ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-200 text-rose-700 border border-rose-200">สูง</span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-200 text-slate-600 border border-slate-200">ปกติ</span>
        )}
      </td>
      <td className="py-3.5 px-3.5 font-mono text-[11px] text-slate-500 font-bold">{project.startDate}</td>
      <td className="py-3.5 px-3.5 font-mono text-[11px] text-slate-500 font-bold">{project.endDate}</td>
      <td className="py-3.5 px-3.5">
        {project.status === "เสร็จแล้ว" ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            เสร็จแล้ว
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
            กำลังทำ
          </span>
        )}
      </td>
      <td className="py-3.5 px-3.5">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
            <div
              className="h-full rounded-full transition-all duration-300 bg-indigo-500"
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
          <ViewButton 
            title="ดูรายละเอียดโปรเจกต์" 
            onClick={() => onProjectClick(project.id)} 
          />
          <EditButton 
            title="แก้ไขโปรเจกต์" 
            onClick={() => onEdit(project)} 
          />
          <DeleteButton 
            title="ลบโปรเจกต์" 
            onClick={() => onDelete(project.id)} 
          />
        </div>
      </td>
    </tr>
  );
}