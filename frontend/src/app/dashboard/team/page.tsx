"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import TeamHeaderBanner from "./components/team-header-banner";
import TeamProjectTable from "./components/team-project-table";
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
      <TeamHeaderBanner
        avgProgress={avgProgress}
        totalProjects={totalProjects}
        onOpenCreateModal={handleOpenCreateModal}
      />

      <TeamProjectTable
        projects={projects}
        onProjectClick={handleProjectClick}
        onEditProject={handleOpenEditModal}
        onDeleteProject={handleDelete}
      />

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