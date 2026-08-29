"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import SoloHeaderBanner from "@/app/dashboard/solo/components/solo-header-banner";
import SoloProjectTable from "@/app/dashboard/solo/components/solo-project-table";
import ProjectFormModal from "@/components/projects/project-form-modal";
import { SoloProject, CreateProjectFormData } from "@/types/project";
import { getProjects, createProject, updateProject, deleteProject } from "@/lib/project-solo-api";

const CURRENT_USER_ID = 1;

export default function SoloWorkPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<SoloProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: "create" | "edit";
    project: SoloProject | null;
  }>({
    isOpen: false,
    mode: "create",
    project: null,
  });

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (err: any) {
      console.error("Load projects error:", err);
      setLoadError(err.message || "ไม่สามารถโหลดรายการโปรเจกต์ได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const totalProjects = projects.length;
  const avgProgress =
    totalProjects > 0
      ? Math.round(projects.reduce((acc, curr) => acc + curr.progress, 0) / totalProjects)
      : 0;

  const handleOpenCreateModal = () => {
    setModalState({ isOpen: true, mode: "create", project: null });
  };

  const handleOpenEditModal = (project: SoloProject) => {
    setModalState({ isOpen: true, mode: "edit", project });
  };

  const handleCloseModal = () => {
    if (isSubmitting) return;
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleSaveProject = async (formData: CreateProjectFormData) => {
    setIsSubmitting(true);
    try {
      if (modalState.mode === "create") {
        await createProject(formData, CURRENT_USER_ID);
      } else if (modalState.project) {
        await updateProject(modalState.project.id, formData, CURRENT_USER_ID);
      }
      await loadProjects();
      handleCloseModal();
    } catch (err: any) {
      console.error("Save project error:", err);
      alert(`บันทึกโปรเจกต์ไม่สำเร็จ: ${err.message || "กรุณาตรวจสอบข้อมูลที่กรอกอีกครั้ง"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProjectClick = (id: number) => {
    router.push(`/dashboard/solo/${id}`);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("คุณต้องการลบโปรเจกต์นี้ใช่หรือไม่?")) return;
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      console.error("Delete project error:", err);
      alert(`ลบโปรเจกต์ไม่สำเร็จ: ${err.message || "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์"}`);
    }
  };

  if (isLoading) {
    return <div className="w-full py-20 text-center text-slate-500">กำลังโหลดรายการโปรเจกต์...</div>;
  }

  return (
    <div className="w-full select-none space-y-6">
      <SoloHeaderBanner
        totalProjects={totalProjects}
        avgProgress={avgProgress}
        onOpenCreateModal={handleOpenCreateModal}
      />

      {loadError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
          {loadError}
        </div>
      )}

      <SoloProjectTable
        projects={projects}
        onProjectClick={handleProjectClick}
        onEdit={handleOpenEditModal}
        onDelete={handleDelete}
      />

      <ProjectFormModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        initialData={modalState.project}
        onClose={handleCloseModal}
        onSubmit={handleSaveProject}
      />
    </div>
  );
}