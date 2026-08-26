"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Edit3 } from "lucide-react";

interface TeamProjectHeaderProps {
  projectName: string;
  department: string;
  onEditClick: () => void;
}

export default function TeamProjectHeader({
  projectName,
  department,
  onEditClick,
}: TeamProjectHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          {projectName}
        </h1>
        <p className="text-xs text-slate-500 font-medium">{department}</p>
      </div>
      <div className="flex items-center gap-3">
        <Link href="/dashboard/team">
          <button className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-xs">
            <ArrowLeft className="w-4 h-4" />
            กลับ
          </button>
        </Link>
        <button
          onClick={onEditClick}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5" />
          แก้ไขโครงการ
        </button>
      </div>
    </div>
  );
}