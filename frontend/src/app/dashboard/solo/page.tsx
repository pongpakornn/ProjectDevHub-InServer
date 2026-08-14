"use client";

import React, { useState } from "react";
import { 
  Pencil, 
  Trash2, 
  ExternalLink, 
  FolderGit2, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  Activity 
} from "lucide-react";

// 🟢 Import ProjectsButton ตัวใหม่ของคุณนนท์จากโฟลเดอร์ ui/buttons
import ProjectsButton from "@/components/ui/buttons/projects-button";

interface SoloProject {
  id: number;
  name: string;
  description: string;
  owner: string;
  priority: "ปกติ" | "สูง";
  startDate: string;
  endDate: string;
  status: "เสร็จแล้ว" | "กำลังทำ";
  progress: number;
}

const initialProjects: SoloProject[] = [
  { id: 1, name: "CheckPallet V.1", description: "โปรแกรม CheckPallet ที่บรรจุสินค้าไปส่งให้ลูกค้า...", owner: "Pongpakorn", priority: "ปกติ", startDate: "15/11/2025", endDate: "21/11/2025", status: "เสร็จแล้ว", progress: 100 },
  { id: 2, name: "StorePC V.1", description: "ระบบจัดการสินค้าและคลังสินค้า แบบ Real-Time...", owner: "Pongpakorn", priority: "สูง", startDate: "12/12/2025", endDate: "05/03/2026", status: "เสร็จแล้ว", progress: 100 },
  { id: 3, name: "StoreSP - Spare Part", description: "ระบบจัดการวัตถุดิบคงคลังในการซ่อมบำรุงรักษาแม่พิมพ์", owner: "Pongpakorn", priority: "สูง", startDate: "05/03/2026", endDate: "10/04/2026", status: "เสร็จแล้ว", progress: 100 },
  { id: 4, name: "StoreRM - Raw Material", description: "ระบบจัดการวัตถุดิบคงคลัง ควบคุมการใช้งานวัตถุดิบสิ้นเปลือง...", owner: "Pongpakorn", priority: "สูง", startDate: "11/04/2026", endDate: "13/04/2026", status: "เสร็จแล้ว", progress: 100 },
  { id: 5, name: "Softpro Core API - Stock", description: "ระบบดึงข้อมูล Stock เหล็กจากระบบ ERP...", owner: "Pongpakorn", priority: "สูง", startDate: "11/04/2026", endDate: "13/04/2026", status: "เสร็จแล้ว", progress: 100 },
  { id: 6, name: "OT Web API", description: "ระบบดึงข้อมูล Stock เหล็กจากระบบ ERP...", owner: "Pongpakorn", priority: "สูง", startDate: "11/04/2026", endDate: "13/04/2026", status: "เสร็จแล้ว", progress: 100 },
  { id: 7, name: "Softpro Core API - HR", description: "ระบบดึงข้อมูล Stock เหล็กจากระบบ ERP...", owner: "Pongpakorn", priority: "สูง", startDate: "11/04/2026", endDate: "13/04/2026", status: "กำลังทำ", progress: 100 },
  { id: 8, name: "SmartOps System", description: "ระบบกรองข้อมูลจากไฟล์ PDF และ Export...", owner: "Pongpakorn", priority: "สูง", startDate: "03/08/2026", endDate: "-", status: "กำลังทำ", progress: 10 },
];

export default function SoloWorkPage() {
  const [projects] = useState<SoloProject[]>(initialProjects);

  const totalProjects = projects.length;
  const avgProgress = Math.round(
    projects.reduce((acc, curr) => acc + curr.progress, 0) / (totalProjects || 1)
  );

  const handleAddProject = () => {
    // Logic สำหรับเปิด Modal หรือ Action เพิ่มโปรเจค
    console.log("คลิกเพิ่มโปรเจคแล้ว");
  };

  return (
    <div className="w-full select-none space-y-6">
      
      {/* 🟢 1. Hero Dark Banner (Engineering Dashboard Style) */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-[#0d131f] via-[#0b1a20] to-[#062922] border border-slate-800/80 p-6 md:p-8 shadow-xl">
        
        {/* Background Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* ฝั่งซ้าย: Tag Line & Title */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="font-mono text-[11px] font-bold tracking-wider uppercase">
                DEV / PROJECT LOG
              </span>
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                ทำระบบคนเดียว (Solo)
              </h1>
              <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                SOLO WORK
              </span>
            </div>

            <p className="text-xs font-medium text-slate-400">
              บันทึกและจัดการโปรเจคที่คุณเขียนและดูแลเพียงผู้เดียว
            </p>
          </div>

          {/* ฝั่งขวา: Glassmorphism Progress Box + Custom Animated ProjectsButton */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
            
            {/* Progress Box แบบโปร่งแสง */}
            <div className="bg-slate-900/60 border border-emerald-500/20 rounded-xl p-4 min-w-70 space-y-2.5 backdrop-blur-md shadow-lg shadow-black/20">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-200 font-semibold flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  ความคืบหน้ารวม
                </span>
                <span className="text-emerald-400 font-mono font-extrabold text-base">
                  {avgProgress}%
                </span>
              </div>

              {/* Progress Bar นีออน */}
              <div className="w-full bg-slate-950/80 rounded-full h-2 overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(52,211,153,0.8)]"
                  style={{ width: `${avgProgress}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-0.5">
                <span>จำนวนโปรเจค: <strong className="text-emerald-300">{totalProjects}</strong> รายการ</span>
                <span className="text-slate-500">อัปเดตล่าสุด: เมื่อครู่นี้</span>
              </div>
            </div>

            {/* 🟢 เรียกใช้งาน ProjectsButton ตัวใหม่แทนที่ปุ่มเดิม */}
            <ProjectsButton 
              label="New Project" 
              onClick={handleAddProject}
            />

          </div>

        </div>
      </div>

      {/* ⚪ 2. Table Section (ส่วนตารางข้อมูลโปรเจกต์) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden p-4 sm:p-6">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              
              {/* Header ตาราง */}
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                  <th className="py-3.5 px-3.5 w-12 text-center text-slate-400">NO</th>
                  <th className="py-3.5 px-3.5 min-w-65">PROJECT</th>
                  <th className="py-3.5 px-3.5 min-w-27.5">OWNER</th>
                  <th className="py-3.5 px-3.5 w-20">PRIORITY</th>
                  <th className="py-3.5 px-3.5 w-24">START</th>
                  <th className="py-3.5 px-3.5 w-24">END</th>
                  <th className="py-3.5 px-3.5 w-28">STATUS</th>
                  <th className="py-3.5 px-3.5 min-w-32.5">PROGRESS</th>
                  <th className="py-3.5 px-3.5 w-24 text-center">ACTIONS</th>
                </tr>
              </thead>

              {/* Body แถวตาราง */}
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {projects.map((project) => (
                  <tr 
                    key={project.id} 
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="py-3.5 px-3.5 text-center font-mono font-bold text-slate-400">
                      {String(project.id).padStart(2, "0")}
                    </td>

                    <td className="py-3.5 px-3.5">
                      <div className="flex items-start gap-2.5">
                        <div className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 group-hover:text-emerald-600 group-hover:border-emerald-300 group-hover:bg-emerald-50/50 transition-all shrink-0 mt-0.5">
                          <FolderGit2 className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-xs group-hover:text-emerald-700 transition-colors">
                            {project.name}
                          </h3>
                          <p className="text-[11px] font-medium text-slate-500 line-clamp-1 leading-normal">
                            {project.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3.5 font-mono font-bold text-slate-600">
                      {project.owner}
                    </td>

                    <td className="py-3.5 px-3.5">
                      {project.priority === "สูง" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          สูง
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          ปกติ
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
                            className={`h-full rounded-full transition-all duration-300 ${
                              project.progress === 100 
                                ? "bg-emerald-500" 
                                : "bg-amber-500"
                            }`}
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-[10px] text-slate-600 min-w-6.5 text-right">
                          {project.progress}%
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3.5 text-center">
                      <div className="flex items-center justify-center gap-1 text-slate-400">
                        <button title="เปิดลิงก์" className="inline-flex items-center gap-1 p-1 rounded hover:bg-slate-100 hover:text-emerald-600 transition-colors text-[11px] font-bold text-slate-600">
                          <span>เปิด</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                        <button title="แก้ไข" className="p-1 rounded hover:bg-slate-100 hover:text-slate-900 transition-colors text-slate-500">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button title="ลบ" className="p-1 rounded hover:bg-rose-50 hover:text-rose-600 transition-colors text-slate-400">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}