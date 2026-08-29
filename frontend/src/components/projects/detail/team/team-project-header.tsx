"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Edit3, Users } from "lucide-react";
import { Button } from "@/components/ui/buttons/button";

interface TeamProjectHeaderProps {
  projectName: string;
  department: string;
  overallProgress: number;
  onEditClick: () => void;
}

export default function TeamProjectHeader({
  projectName,
  department,
  overallProgress,
  onEditClick,
}: TeamProjectHeaderProps) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm">
      <div className="relative isolate overflow-hidden bg-gradient-to-r from-[#0f1123] via-[#161936] to-[#201c47] p-6 sm:p-8 text-white rounded-2xl border-b border-indigo-900/40">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-violet-600/10 rounded-full blur-2xl pointer-events-none -z-10" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wide">
                <Users className="w-3.5 h-3.5" />
                TEAM PROJECT
              </span>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700">
                {department}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {projectName}
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-slate-800/80">
            <div className="min-w-40">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-400 font-medium">ความคืบหน้ารวม</span>
                <span className="text-indigo-400 font-bold font-mono">{overallProgress}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full transition-all duration-500 shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Link href="/dashboard/team" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 normal-case text-xs font-bold py-2 px-3.5 flex items-center justify-center gap-2 shadow-sm">
                  <ArrowLeft className="w-4 h-4" />
                  กลับ
                </Button>
              </Link>

              <Button
                onClick={onEditClick}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_4px_16px_rgba(79,70,229,0.4)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.6)] normal-case text-xs font-bold py-2 px-4 flex items-center justify-center gap-1.5 border border-indigo-500/30"
              >
                <Edit3 className="w-3.5 h-3.5" />
                แก้ไขโครงการ
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}