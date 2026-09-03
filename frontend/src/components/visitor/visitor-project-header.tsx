"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Eye, FolderKanban, Users, User, Hash } from "lucide-react";
import { SoloProject } from "@/types/project";

interface VisitorProjectHeaderProps {
  projectInfo: SoloProject;
  workType: "SOLO" | "TEAM";
  overallProgress: number;
  backHref: string;
}

const STATUS_LABEL: Record<SoloProject["status"], string> = {
  PLANNING: "วางแผน",
  IN_PROGRESS: "กำลังทำ",
  ON_HOLD: "พักไว้",
  COMPLETED: "เสร็จแล้ว",
  CANCELLED: "ยกเลิก",
};

const PRIORITY_LABEL: Record<SoloProject["priority"], string> = {
  LOW: "Low (ต่ำ)",
  MEDIUM: "Normal (ปกติ)",
  HIGH: "High (สูง)",
  URGENT: "Urgent (เร่งด่วน)",
};

// Header สำหรับหน้ารายละเอียดโปรเจกต์ใน Visitor Mode — โครงเดียวกับ ProjectDetailHeader/TeamProjectHeader
// ปกติ แต่ตัด "แก้ไขโครงการ" ออก และแปะป้าย "โหมดดูอย่างเดียว" แทน ตรงกับกติกาที่ห้ามแก้ไข/ลบข้อมูลของผู้ใช้รายนี้
export const VisitorProjectHeader: React.FC<VisitorProjectHeaderProps> = ({
  projectInfo,
  workType,
  overallProgress,
  backHref,
}) => {
  const isHighPriority = projectInfo.priority === "HIGH" || projectInfo.priority === "URGENT";

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm">
      <div className="relative isolate overflow-hidden bg-gradient-to-r from-[#0f1123] via-[#161936] to-[#201c47] p-6 sm:p-8 text-white rounded-t-2xl border-b border-indigo-900/40">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-violet-600/10 rounded-full blur-2xl pointer-events-none -z-10" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wide">
                <Eye className="w-3.5 h-3.5" />
                โหมดดูอย่างเดียว (ตรวจสอบผลงาน)
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700">
                {workType === "SOLO" ? <User className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                {workType === "SOLO" ? "ทำคนเดียว" : "ทำทีม"}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-medium border border-slate-700">
                <Hash className="w-3 h-3" />
                {projectInfo.id}
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                <FolderKanban className="w-6 h-6 text-indigo-400 shrink-0" />
                {projectInfo.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 line-clamp-2">{projectInfo.description}</p>
            </div>
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

            <Link href={backHref} className="w-full sm:w-auto">
              <span className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl normal-case text-xs font-bold py-2 px-3.5 shadow-sm cursor-pointer transition-colors">
                <ArrowLeft className="w-4 h-4" />
                กลับ
              </span>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 space-y-6 rounded-b-2xl">
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
                isHighPriority ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isHighPriority ? "bg-rose-500" : "bg-emerald-500"}`} />
              {PRIORITY_LABEL[projectInfo.priority]}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block mb-1.5">Owner</span>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                {projectInfo.ownerName?.charAt(0) || "?"}
              </span>
              <span className="font-bold text-slate-800">{projectInfo.ownerName}</span>
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
              {projectInfo.projectTypeName}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
