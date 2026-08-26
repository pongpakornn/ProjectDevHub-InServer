"use client";

import React from "react";
import { Layers } from "lucide-react";

interface ArchitectureDiagramSectionProps {
  frontend: string[];
  backend: string[];
  database: string[];
}

export default function ArchitectureDiagramSection({
  frontend,
  backend,
  database,
}: ArchitectureDiagramSectionProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
      <div className="flex items-center gap-2">
        <Layers className="w-4 h-4 text-indigo-600" />
        <h2 className="font-bold text-slate-900 text-sm">Architecture Diagram — โครงสร้างระบบ</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ArchColumn label="FRONTEND" tags={frontend} />
        <ArchColumn label="BACKEND / API" tags={backend} />
        <ArchColumn label="DATABASE" tags={database} />
      </div>
    </div>
  );
}

function ArchColumn({ label, tags }: { label: string; tags: string[] }) {
  return (
    <div className="border border-slate-200 rounded-xl p-4 space-y-2.5">
      <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wider">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {tags && tags.length > 0 ? (
          tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 bg-slate-100 rounded-md text-slate-700 font-semibold text-[11px]"
            >
              {tag}
            </span>
          ))
        ) : (
          <span className="text-[11px] text-slate-300 font-medium">ยังไม่ระบุ</span>
        )}
      </div>
    </div>
  );
}