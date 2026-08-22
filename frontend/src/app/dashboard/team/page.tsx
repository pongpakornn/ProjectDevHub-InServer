"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Activity,
  FolderGit2,
} from "lucide-react";

import ProjectsButton from "@/components/ui/buttons/projects-button";
import ViewButton from "@/components/ui/buttons/view-button";
import EditButton from "@/components/ui/buttons/edit-button";
import DeleteButton from "@/components/ui/buttons/delete-button";
import TeamProjectFormModal from "@/components/projects/team-project-form-modal";
import { SoloProject } from "@/types/project";
import { calculateProjectProgress } from "@/lib/project-utils";

const initialTeamProjects: SoloProject[] = [
  { id: 101, name: "ERP Integration Hub", description: "ระบบเชื่อมต่อข้อมูล ERP ระหว่างสาขา...", owner: "Pongpakorn, Somchai", priority: "สูง", startDate: "01/01/2026", endDate: "30/06/2026", status: "กำลังทำ" },
  { id: 102, name: "Smart Warehouse System", description: "ระบบคลังสินค้าอัจฉริยะรองรับ Mobile Scanner...", owner: "Pongpakorn, Anan", priority: "สูง", startDate: "15/02/2026", endDate: "20/05/2026", status: "กำลังทำ" },
  { id: 103, name: "HR Portal V.2", description: "ระบบพอร์ตัลพนักงานและลงเวลาทำงาน...", owner: "Somsak, Pongpakorn", priority: "ปกติ", startDate: "10/03/2026", endDate: "15/04/2026", status: "เสร็จแล้ว" },
];

export default function TeamWorkPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<SoloProject[]>(initialTeamProjects);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: "create" | "edit";
    project: SoloProject | null;
  }>({
    isOpen: false,
    mode: "create",
    project: null,
  });

  const totalProjects = projects.length;

  // คำนวณความคืบหน้ารวมของทีมแบบ Dynamic ผ่าน helper function
  const avgProgress = Math.round(
    projects.reduce(
      (acc, curr) =>
        acc + calculateProjectProgress(curr.phases, curr.status, curr.progress),
      0
    ) / (totalProjects || 1)
  );

  const handleOpenCreateModal = () => {
    setModalState({ isOpen: true, mode: "create", project: null });
  };

  const handleOpenEditModal = (project: SoloProject) => {
    setModalState({ isOpen: true, mode: "edit", project });
  };

  const handleCloseModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleSaveProject = (savedProject: SoloProject) => {
    if (modalState.mode === "create") {
      setProjects((prev) => [savedProject, ...prev]);
    } else {
      setProjects((prev) =>
        prev.map((p) => (p.id === savedProject.id ? savedProject : p))
      );
    }
  };

  // แก้ตรงนี้: โปรเจกต์ทีมต้องไปหน้ารายละเอียดของทีมโดยเฉพาะ
  // (แยกจาก Solo เพราะหน้ารายละเอียดทีมมีเรื่องสมาชิกทีมที่ไม่เหมือนกัน)
  const handleProjectClick = (id: number | string) => {
    router.push(`/dashboard/team/projects/${id}`);
  };

  const handleDelete = (id: number | string) => {
    if (confirm("คุณต้องการลบโปรเจกต์นี้ใช่หรือไม่?")) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="w-full select-none space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-[#0f172a] via-[#1e1b4b] to-[#311042] border border-slate-800/80 p-6 md:p-8 shadow-xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/40 border border-indigo-500/30 text-indigo-400 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span className="font-mono text-[11px] font-bold tracking-wider uppercase">TEAM / PROJECT LOG</span>
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">ทำระบบร่วมกับทีม (Team)</h1>
              <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                TEAM WORK
              </span>
            </div>

            <p className="text-xs font-medium text-slate-400">บันทึกและติดตามสถานะโปรเจกต์ที่พัฒนาร่วมกับทีมงาน</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
            <div className="bg-slate-900/60 border border-indigo-500/20 rounded-xl p-4 min-w-70 space-y-2.5 backdrop-blur-md shadow-lg shadow-black/20">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-200 font-semibold flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  ความคืบหน้ารวมทีม
                </span>
                <span className="text-indigo-400 font-mono font-extrabold text-base">{avgProgress}%</span>
              </div>

              <div className="w-full bg-slate-950/80 rounded-full h-2 overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(99,102,241,0.8)]"
                  style={{ width: `${avgProgress}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-0.5">
                <span>จำนวนโปรเจกต์ทีม: <strong className="text-indigo-300">{totalProjects}</strong> รายการ</span>
                <span className="text-slate-500">อัปเดตล่าสุด: เมื่อครู่นี้</span>
              </div>
            </div>

            {/*
              เปลี่ยนสีปุ่ม "New Team Project" เป็นม่วง/indigo ให้ต่างจาก Solo (เขียว)
              โดยไม่ต้องแก้ไฟล์ projects-button.tsx เลย —
              ครอบด้วย div ที่มี class เฉพาะหน้านี้ แล้วใช้ style jsx
              เจาะ selector "button" ที่อยู่ข้างในด้วย :global() + !important
              เพื่อ override สีเดิมของปุ่ม (ไม่ว่าปุ่มเดิมจะ hardcode สีอะไรมาก็ตาม)
            */}
            <div className="team-new-project-btn">
              <ProjectsButton 
                label="New Team Project" 
                onClick={handleOpenCreateModal}
              />
            </div>
            <style jsx>{`
              .team-new-project-btn :global(button) {
                background: linear-gradient(135deg, #6366f1, #4f46e5) !important;
                box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35) !important;
              }
              .team-new-project-btn :global(button:hover) {
                background: linear-gradient(135deg, #4f46e5, #4338ca) !important;
                box-shadow: 0 6px 18px rgba(79, 70, 229, 0.5) !important;
              }
            `}</style>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden p-4 sm:p-6">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                  <th className="py-3.5 px-3.5 w-12 text-center text-slate-400">NO</th>
                  <th className="py-3.5 px-3.5 min-w-65">PROJECT</th>
                  <th className="py-3.5 px-3.5 min-w-32.5">TEAM MEMBERS</th>
                  <th className="py-3.5 px-3.5 w-20">PRIORITY</th>
                  <th className="py-3.5 px-3.5 w-24">START</th>
                  <th className="py-3.5 px-3.5 w-24">END</th>
                  <th className="py-3.5 px-3.5 w-28">STATUS</th>
                  <th className="py-3.5 px-3.5 min-w-32.5">PROGRESS</th>
                  <th className="py-3.5 px-3.5 w-36 text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {projects.map((project, idx) => {
                  const currentProgress = calculateProjectProgress(
                    project.phases,
                    project.status,
                    project.progress
                  );

                  return (
                    <tr key={project.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-3.5 px-3.5 text-center font-mono font-bold text-slate-400">
                        {String(idx + 1).padStart(2, "0")}
                      </td>
                      
                      <td className="py-3.5 px-3.5">
                        <div 
                          onClick={() => handleProjectClick(project.id)}
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
                              className={`h-full rounded-full transition-all duration-300 ${currentProgress === 100 ? "bg-indigo-500" : "bg-indigo-500"}`}
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
                            onClick={() => handleProjectClick(project.id)} 
                          />
                          <EditButton 
                            title="แก้ไขโปรเจกต์" 
                            onClick={() => handleOpenEditModal(project)} 
                          />
                          <DeleteButton 
                            title="ลบโปรเจกต์" 
                            onClick={() => handleDelete(project.id)} 
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <TeamProjectFormModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        initialData={modalState.project}
        onClose={handleCloseModal}
        onSubmit={handleSaveProject}
      />
    </div>
  );
}