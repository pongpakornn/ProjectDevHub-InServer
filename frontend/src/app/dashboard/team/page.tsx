"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import TeamHeaderBanner from "./components/team-header-banner";
import TeamProjectTable from "./components/team-project-table";
import TeamProjectFormModal from "@/components/projects/team-project-form-modal";
import { TeamProject, CreateProjectFormData } from "@/types/project";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} from "@/lib/project-team-api";
import { useToast } from "@/lib/toast-context";
import { getStoredUser } from "@/lib/session";
import { useSystemPermissions } from "@/hooks/use-system-permissions";

// TODO: ยังไม่มี Auth Context ผูก User จริง — ใช้ userId ของ Admin ทดสอบไปก่อน (userId=1) ถ้ายังไม่ได้ล็อกอิน
const CURRENT_USER_ID = getStoredUser()?.userId ?? 1;

export default function TeamWorkPage() {
  const router = useRouter();
  const toast = useToast();
  const permissions = useSystemPermissions("TEAM");
  const [projects, setProjects] = useState<TeamProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: "create" | "edit";
    project: TeamProject | null;
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
      console.error("Load team projects error:", err);
      setLoadError(err.message || "ไม่สามารถโหลดรายการโปรเจกต์ทีมได้ กรุณาลองใหม่อีกครั้ง");
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

  const handleOpenEditModal = (project: TeamProject) => {
    setModalState({ isOpen: true, mode: "edit", project });
  };

  const handleCloseModal = () => {
    if (isSubmitting) return;
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleSaveProject = async (formData: CreateProjectFormData, memberUserIds: number[]) => {
    setIsSubmitting(true);
    try {
      if (modalState.mode === "create") {
        await createProject(formData, memberUserIds, CURRENT_USER_ID);
        toast.success("สร้างโปรเจกต์ทีมสำเร็จ", `เพิ่มโปรเจกต์ "${formData.name}" เรียบร้อยแล้ว`);
      } else if (modalState.project) {
        const projectId = modalState.project.id;
        await updateProject(projectId, formData, memberUserIds, CURRENT_USER_ID);

        // Sync สมาชิกทีม — เทียบชุดเดิม (จาก initialData) กับชุดใหม่ที่เลือกในฟอร์ม แล้วยิง Add/Remove เฉพาะส่วนต่าง
        const prevUserIds = new Set(modalState.project.members.map((m) => m.userId));
        const nextUserIds = new Set(memberUserIds);

        const toAdd = memberUserIds.filter((id) => !prevUserIds.has(id));
        const toRemove = modalState.project.members
          .map((m) => m.userId)
          .filter((id) => !nextUserIds.has(id) && id !== formData.ownerId);

        await Promise.all([
          ...toAdd.map((userId) => addMember(projectId, userId, CURRENT_USER_ID, "MEMBER")),
          ...toRemove.map((userId) => removeMember(projectId, userId, CURRENT_USER_ID)),
        ]);
        toast.success("อัปเดตโปรเจกต์ทีมสำเร็จ", `บันทึกการแก้ไข "${formData.name}" เรียบร้อยแล้ว`);
      }
      await loadProjects();
      handleCloseModal();
    } catch (err: any) {
      console.error("Save team project error:", err);
      toast.error("บันทึกโปรเจกต์ไม่สำเร็จ", err.message || "กรุณาตรวจสอบข้อมูลที่กรอกอีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProjectClick = (id: number | string) => {
    router.push(`/dashboard/team/projects/${id}`);
  };

  const handleDelete = async (id: number | string) => {
    if (!confirm("คุณต้องการลบโปรเจกต์นี้ใช่หรือไม่?")) return;
    try {
      await deleteProject(Number(id), CURRENT_USER_ID);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.info("ลบโปรเจกต์ทีมสำเร็จ", "ลบโปรเจกต์นี้ออกจากระบบเรียบร้อยแล้ว");
    } catch (err: any) {
      console.error("Delete team project error:", err);
      toast.error("ลบโปรเจกต์ไม่สำเร็จ", err.message || "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์");
    }
  };

  if (isLoading) {
    return <div className="w-full py-20 text-center text-slate-500">กำลังโหลดรายการโปรเจกต์ทีม...</div>;
  }

  return (
    <div className="w-full select-none space-y-6">
      <TeamHeaderBanner
        avgProgress={avgProgress}
        totalProjects={totalProjects}
        onOpenCreateModal={handleOpenCreateModal}
        canAdd={permissions.canAdd}
      />

      {loadError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
          {loadError}
        </div>
      )}

      <TeamProjectTable
        projects={projects}
        onProjectClick={handleProjectClick}
        onEditProject={handleOpenEditModal}
        onDeleteProject={handleDelete}
        canEdit={permissions.canEdit}
        canDelete={permissions.canDelete}
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
