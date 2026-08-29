"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import ProjectFormModal from "@/components/projects/project-form-modal";
import { SoloProject, CreateProjectFormData } from "@/types/project";
import { Phase, StackItem, WorkItem, TaskItem } from "@/types/project-detail";
import { ProjectDetailHeader } from "@/components/projects/detail/project-detail-header";
import { ProjectPhaseSection } from "@/components/projects/detail/project-phase-section";
import { ProjectStackSection } from "@/components/projects/detail/project-stack-section";
import { ProjectTimelineSection } from "@/components/projects/detail/project-timeline-section";
import { ProjectShowcaseSection } from "@/components/projects/detail/project-showcase-section";
import { AddWorkModal } from "@/components/projects/detail/add-work-modal";
import {
  getProjectDetail,
  updateProject,
  createWorkItem,
  updateTaskItem,
  deleteWorkItem,
  autoGeneratePhases,
} from "@/lib/project-solo-api";

// TODO: ตอนนี้ยังไม่มี Auth Context ผูก User จริง — ใช้ userId ของ Admin ทดสอบไปก่อน (userId=1)
// พอมี Login/Session จริงแล้ว ให้เปลี่ยนไปดึงจาก Auth Context/Token แทน
const CURRENT_USER_ID = 1;

export default function ProjectDetailPage() {
  const params = useParams();
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
      const detail = await getProjectDetail(projectId);
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
  const handleUpdateProject = async (updatedProject: SoloProject) => {
    if (!projectInfo) return;
    try {
      const formData: CreateProjectFormData = {
        name: updatedProject.name,
        description: updatedProject.description || "",
        projectTypeId: updatedProject.projectTypeId,
        department: updatedProject.department || "",
        requester: updatedProject.requester || "",
        ownerId: updatedProject.ownerId,
        priority: updatedProject.priority,
        status: updatedProject.status,
        startDate: updatedProject.startDate || "",
        endDate: updatedProject.endDate || "",
      };
      const saved = await updateProject(projectInfo.id, formData, CURRENT_USER_ID);
      setProjectInfo(saved);
      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("บันทึกข้อมูลโปรเจกต์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    }
  };

  // ===========================================================================
  // Phase — Auto Generate (เรียก Backend จริงแล้ว ตาม Endpoint ที่นนท์เขียนไว้)
  // ===========================================================================
  const handleAutoGeneratePhases = async () => {
    if (!projectInfo) return;
    try {
      const generated = await autoGeneratePhases(projectInfo.id);
      setPhases(generated);
    } catch (err) {
      console.error("Auto-generate phases ไม่สำเร็จ", err);
      alert("สร้าง Phase อัตโนมัติไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    }
  };

  // ===========================================================================
  // Task (Toggle Complete — sync ขึ้น Backend จริง)
  // ===========================================================================
  const syncTaskItem = async (task: TaskItem) => {
    try {
      await updateTaskItem(Number(task.id), task);
    } catch (err) {
      console.error("อัปเดต Task ไม่สำเร็จ", err);
      alert("อัปเดต Task ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
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
        // หมายเหตุ: Backend ยังไม่มี UpdateWorkItem endpoint (มีแค่ Create/Delete)
        await deleteWorkItem(Number(editingWork.id));
      }
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
      await loadProjectDetail();
    } catch (err) {
      console.error(err);
      alert("บันทึกผลงานไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
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
      />

      <ProjectStackSection
        projectId={projectInfo.id}
        stacks={stacks}
        setStacks={setStacks}
      />

      <ProjectTimelineSection phases={phases} />

      <ProjectShowcaseSection
        works={works}
        setWorks={setWorks}
        onOpenAddModal={handleOpenAddWorkModal}
        onOpenEditModal={handleOpenEditWorkModal}
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