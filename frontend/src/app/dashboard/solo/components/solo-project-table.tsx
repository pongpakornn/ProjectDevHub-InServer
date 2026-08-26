"use client";

import React from "react";
import SoloProjectRow from "./solo-project-row";
import { SoloProject } from "@/types/project";

interface SoloProjectTableProps {
  projects: SoloProject[];
  onProjectClick: (id: number | string) => void;
  onEdit: (project: SoloProject) => void;
  onDelete: (id: number | string) => void;
}

export default function SoloProjectTable({
  projects,
  onProjectClick,
  onEdit,
  onDelete,
}: SoloProjectTableProps) {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden p-4 sm:p-6">
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                <th className="py-3.5 px-3.5 w-12 text-center text-slate-400">NO</th>
                <th className="py-3.5 px-3.5 min-w-65">PROJECT</th>
                <th className="py-3.5 px-3.5 min-w-32.5">OWNER</th>
                <th className="py-3.5 px-3.5 w-20">PRIORITY</th>
                <th className="py-3.5 px-3.5 w-24">START</th>
                <th className="py-3.5 px-3.5 w-24">END</th>
                <th className="py-3.5 px-3.5 w-28">STATUS</th>
                <th className="py-3.5 px-3.5 min-w-32.5">PROGRESS</th>
                <th className="py-3.5 px-3.5 w-36 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {projects.map((project, idx) => (
                <SoloProjectRow
                  key={project.id}
                  project={project}
                  idx={idx}
                  onProjectClick={onProjectClick}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}