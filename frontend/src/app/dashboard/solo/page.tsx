"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bot, LayoutGrid } from "lucide-react";
import SoloHeaderBanner from "@/app/dashboard/solo/components/solo-header-banner";
import SoloProjectTable from "@/app/dashboard/solo/components/solo-project-table";
import ProjectFormModal from "@/components/projects/project-form-modal";
import { SoloProject, CreateProjectFormData } from "@/types/project";
import { getProjects, createProject, updateProject, deleteProject } from "@/lib/project-solo-api";
import { useToast } from "@/lib/toast-context";
import { getStoredUser } from "@/lib/session";
import { useSystemPermissions } from "@/hooks/use-system-permissions";

// TODO: ยังไม่มี Auth Context ผูก User จริง — ใช้ userId ของ Admin ทดสอบไปก่อน (userId=1) ถ้ายังไม่ได้ล็อกอิน
const CURRENT_USER_ID = getStoredUser()?.userId ?? 1;

export default function SoloWorkPage() {
  const router = useRouter();
  const toast = useToast();
  const permissions = useSystemPermissions("SOLO");
  const [projects, setProjects] = useState<SoloProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showRpaView, setShowRpaView] = useState(false);

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
      const data = await getProjects(CURRENT_USER_ID);
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

  // แยกมุมมอง Project RPA ออกจากโปรเจกต์เขียนโปรแกรมทั่วไป — ปุ่มสลับตารางจะโชว์ก็ต่อเมื่อ User
  // มีโปรเจกต์ประเภท RPA บันทึกไว้อยู่แล้วอย่างน้อย 1 โปรเจกต์เท่านั้น
  const hasRpaProjects = projects.some((p) => p.projectTypeName === "RPA");
  const visibleProjects = projects.filter((p) =>
    showRpaView ? p.projectTypeName === "RPA" : p.projectTypeName !== "RPA"
  );

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
        toast.success("สร้างโปรเจกต์สำเร็จ", `เพิ่มโปรเจกต์ "${formData.name}" เรียบร้อยแล้ว`);
      } else if (modalState.project) {
        await updateProject(modalState.project.id, formData, CURRENT_USER_ID);
        toast.success("อัปเดตโปรเจกต์สำเร็จ", `บันทึกการแก้ไข "${formData.name}" เรียบร้อยแล้ว`);
      }
      await loadProjects();
      handleCloseModal();
    } catch (err: any) {
      console.error("Save project error:", err);
      toast.error("บันทึกโปรเจกต์ไม่สำเร็จ", err.message || "กรุณาตรวจสอบข้อมูลที่กรอกอีกครั้ง");
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
      await deleteProject(id, CURRENT_USER_ID);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.info("ลบโปรเจกต์สำเร็จ", "ลบโปรเจกต์นี้ออกจากระบบเรียบร้อยแล้ว");
    } catch (err: any) {
      console.error("Delete project error:", err);
      toast.error("ลบโปรเจกต์ไม่สำเร็จ", err.message || "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์");
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
        canAdd={permissions.canAdd}
      />

      {loadError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
          {loadError}
        </div>
      )}

      {hasRpaProjects && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setShowRpaView((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-xs border ${
              showRpaView
                ? "bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500"
                : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
            }`}
          >
            {showRpaView ? <LayoutGrid className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5 text-indigo-600" />}
            {showRpaView ? "กลับไปดูโปรเจกต์ทั่วไป" : "Project RPA"}
          </button>
        </div>
      )}

      <SoloProjectTable
        projects={visibleProjects}
        onProjectClick={handleProjectClick}
        onEdit={handleOpenEditModal}
        onDelete={handleDelete}
        canEdit={permissions.canEdit}
        canDelete={permissions.canDelete}
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