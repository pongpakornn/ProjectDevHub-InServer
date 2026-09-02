"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import ProjectFormModal from "@/components/projects/project-form-modal";
import { SoloProject, CreateProjectFormData } from "@/types/project";
import { Phase, StackItem, WorkItem, TaskItem } from "@/types/project-detail";
import { ProjectDetailHeader } from "@/components/projects/detail/project-detail-header";
import { ProjectPhaseSection } from "@/components/projects/detail/project-phase-section";
import StackLibrarySection from "@/components/projects/detail/stack-library-section";
import { ProjectTimelineSection } from "@/components/projects/detail/project-timeline-section";
import { ProjectShowcaseSection } from "@/components/projects/detail/project-showcase-section";
import { AddWorkModal } from "@/components/projects/detail/add-work-modal";
import {
  getProjectDetail,
  updateProject,
  createWorkItem,
  updateWorkItem,
  updateTaskItem,
  autoGeneratePhases,
  createStackItem,
  deleteStackItem,
} from "@/lib/project-solo-api";
import { useToast } from "@/lib/toast-context";
import { getStoredUser } from "@/lib/session";
import { useSystemPermissions } from "@/hooks/use-system-permissions";

// TODO: ตอนนี้ยังไม่มี Auth Context ผูก User จริง — ใช้ userId ของ Admin ทดสอบไปก่อน (userId=1) ถ้ายังไม่ได้ล็อกอิน
const CURRENT_USER_ID = getStoredUser()?.userId ?? 1;

export default function ProjectDetailPage() {
  const params = useParams();
  const toast = useToast();
  const permissions = useSystemPermissions("SOLO");
  const projectId = Number(params?.id);

  const [projectInfo, setProjectInfo] = useState<SoloProject | null>(null);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [stacks, setStacks] = useState<StackItem[]>([]);
  const [works, setWorks] = useState<WorkItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddWorkOpen, setIsAddWorkOpen] = useState(false);
  const [editingWork, setEditingWork] = useState<WorkItem | null>(null);

  // ===========================================================================
  // โหลดข้อมูลจริงจาก API
  // ===========================================================================
  const loadProjectDetail = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const detail = await getProjectDetail(projectId, CURRENT_USER_ID);
      setProjectInfo(detail.project);
      setPhases(detail.phases);
      setStacks(detail.stacks);
      setWorks(detail.showcases);
    } catch (err) {
      console.error(err);
      setLoadError("ไม่สามารถโหลดข้อมูลโปรเจกต์ได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadProjectDetail();
  }, [loadProjectDetail]);

  const allTasks = phases.flatMap((p) => p.items);
  const completedTasks = allTasks.filter((t) => t.completed);
  const overallProgress =
    allTasks.length > 0 ? Math.round((completedTasks.length / allTasks.length) * 100) : 0;

  // ===========================================================================
  // Project
  // ===========================================================================
  const handleUpdateProject = async (formData: CreateProjectFormData) => {
    if (!projectInfo) return;
    try {
      const saved = await updateProject(projectInfo.id, formData, CURRENT_USER_ID);
      setProjectInfo(saved);
      setIsEditModalOpen(false);
      toast.success("อัปเดตโปรเจกต์สำเร็จ", `บันทึกการแก้ไข "${saved.name}" เรียบร้อยแล้ว`);
    } catch (err) {
      console.error(err);
      toast.error("บันทึกข้อมูลโปรเจกต์ไม่สำเร็จ", "กรุณาลองใหม่อีกครั้ง");
    }
  };

  // ===========================================================================
  // Phase — Auto Generate (เรียก Backend จริงแล้ว ตาม Endpoint ที่นนท์เขียนไว้)
  // ===========================================================================
  const handleAutoGeneratePhases = async () => {
    if (!projectInfo) return;
    try {
      const generated = await autoGeneratePhases(projectInfo.id, CURRENT_USER_ID);
      setPhases(generated);
      toast.success("สร้าง Phase อัตโนมัติสำเร็จ", `สร้าง ${generated.length} Phase ให้โปรเจกต์นี้เรียบร้อยแล้ว`);
    } catch (err) {
      console.error("Auto-generate phases ไม่สำเร็จ", err);
      toast.error("สร้าง Phase อัตโนมัติไม่สำเร็จ", "กรุณาลองใหม่อีกครั้ง");
    }
  };

  // ===========================================================================
  // Task (Toggle Complete — sync ขึ้น Backend จริง)
  // ===========================================================================
  const syncTaskItem = async (task: TaskItem) => {
    try {
      await updateTaskItem(Number(task.id), task, CURRENT_USER_ID);
    } catch (err) {
      console.error("อัปเดต Task ไม่สำเร็จ", err);
      toast.error("อัปเดต Task ไม่สำเร็จ", "กรุณาลองใหม่อีกครั้ง");
      loadProjectDetail(); // ดึงข้อมูลจริงกลับมาใหม่ กัน State ฝั่ง Frontend ค้างผิดจาก DB
    }
  };

  // ===========================================================================
  // WorkItem (Showcase)
  // ===========================================================================
  const handleOpenAddWorkModal = () => {
    setEditingWork(null);
    setIsAddWorkOpen(true);
  };

  const handleOpenEditWorkModal = (work: WorkItem) => {
    setEditingWork(work);
    setIsAddWorkOpen(true);
  };

  const handleSaveWork = async (workData: {
    title: string;
    desc: string;
    flow: string;
    image: string | null;
  }) => {
    if (!projectInfo) return;
    try {
      if (editingWork) {
        await updateWorkItem(Number(editingWork.id), projectInfo.id, {
          title: workData.title,
          description: workData.desc,
          flowDescription: workData.flow,
          imageUrl: workData.image || "",
        }, CURRENT_USER_ID);
      } else {
        await createWorkItem(
          projectInfo.id,
          {
            title: workData.title,
            description: workData.desc,
            flowDescription: workData.flow,
            imageUrl: workData.image || "",
          },
          CURRENT_USER_ID
        );
      }
      await loadProjectDetail();
      toast.success(
        editingWork ? "อัปเดตผลงานสำเร็จ" : "เพิ่มผลงานสำเร็จ",
        `บันทึกรายการ "${workData.title}" เรียบร้อยแล้ว`
      );
    } catch (err) {
      console.error(err);
      toast.error("บันทึกผลงานไม่สำเร็จ", "กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsAddWorkOpen(false);
      setEditingWork(null);
    }
  };

  // ===========================================================================
  // Render
  // ===========================================================================
  if (isLoading) {
    return <div className="w-full py-20 text-center text-slate-500">กำลังโหลดข้อมูลโปรเจกต์...</div>;
  }

  if (loadError || !projectInfo) {
    return (
      <div className="w-full py-20 text-center text-red-500">
        {loadError || "ไม่พบโปรเจกต์นี้"}
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-12 text-slate-800">
      <ProjectDetailHeader
        projectInfo={projectInfo}
        overallProgress={overallProgress}
        onOpenEditModal={() => setIsEditModalOpen(true)}
      />

      <ProjectPhaseSection
        projectId={projectInfo.id}
        currentUserId={CURRENT_USER_ID}
        phases={phases}
        setPhases={setPhases}
        onAutoGeneratePhases={handleAutoGeneratePhases}
        onToggleTask={syncTaskItem}
        canAdd={permissions.canAdd}
        canDelete={permissions.canDelete}
      />

      <StackLibrarySection
        projectId={projectInfo.id}
        stacks={stacks}
        setStacks={setStacks}
        createStackItem={(projectId, data) => createStackItem(projectId, data, CURRENT_USER_ID)}
        deleteStackItem={(techStackId) => deleteStackItem(techStackId, CURRENT_USER_ID)}
        focusRingColorClass="focus:ring-emerald-500/20 focus:border-emerald-500"
        canAdd={permissions.canAdd}
        canDelete={permissions.canDelete}
      />

      <ProjectTimelineSection phases={phases} />

      <ProjectShowcaseSection
        works={works}
        setWorks={setWorks}
        phases={phases}
        currentUserId={CURRENT_USER_ID}
        onOpenAddModal={handleOpenAddWorkModal}
        onOpenEditModal={handleOpenEditWorkModal}
        canAdd={permissions.canAdd}
        canEdit={permissions.canEdit}
        canDelete={permissions.canDelete}
      />

      {/* <AddWorkModal
        isOpen={isAddWorkOpen}
        editingWork={editingWork}
        onClose={() => setIsAddWorkOpen(false)}
        onSave={handleSaveWork}
      /> */}
      <AddWorkModal
        isOpen={isAddWorkOpen}
        editingWork={editingWork}
        projectId={projectInfo.id}   // ★ เพิ่มบรรทัดนี้
        projectName={projectInfo.name}
        onClose={() => setIsAddWorkOpen(false)}
        onSave={handleSaveWork}
      />

      <ProjectFormModal
        isOpen={isEditModalOpen}
        mode="edit"
        initialData={projectInfo}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateProject}
      />
    </div>
  );
}