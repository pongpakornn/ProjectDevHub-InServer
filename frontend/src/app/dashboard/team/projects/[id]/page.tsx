"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import TeamProjectFormModal from "@/components/projects/team-project-form-modal";
import TeamProjectHeader from "@/components/projects/detail/team/team-project-header";
import TeamProjectOverview from "@/components/projects/detail/team/team-project-overview";
import TeamProjectMembersPanel from "@/components/projects/detail/team/team-project-members-panel";
import TeamProjectPhaseTable from "@/components/projects/detail/team/team-project-phase-table";
import TeamProjectStackSection from "@/components/projects/detail/team/team-project-stack-section";
import TeamProjectGanttTimeline from "@/components/projects/detail/team/team-project-gantt-timeline";
import TeamProjectGallerySection from "@/components/projects/detail/team/team-project-gallery-section";
import TeamAddWorkModal from "@/components/projects/detail/team/team-add-work-modal";
import TeamProjectCommentsPanel from "@/components/projects/detail/team/team-project-comments-panel";
import TeamProjectAttachmentsPanel from "@/components/projects/detail/team/team-project-attachments-panel";
import { TeamProject, CreateProjectFormData } from "@/types/project";
import { Phase, StackItem, WorkItem, TaskItem, ProjectComment, ProjectAttachment } from "@/types/project-detail";
import {
  getProjectDetail,
  updateProject,
  createWorkItem,
  updateWorkItem,
  updateTaskItem,
  autoGeneratePhases,
  addMember,
  removeMember,
  getComments,
  getAttachments,
} from "@/lib/project-team-api";

// TODO: ยังไม่มี Auth Context ผูก User จริง — ใช้ userId ของ Admin ทดสอบไปก่อน (userId=1)
const CURRENT_USER_ID = 1;

export default function TeamProjectDetailPage() {
  const params = useParams();
  const projectId = Number(params?.id);

  const [projectInfo, setProjectInfo] = useState<TeamProject | null>(null);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [stacks, setStacks] = useState<StackItem[]>([]);
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [comments, setComments] = useState<ProjectComment[]>([]);
  const [attachments, setAttachments] = useState<ProjectAttachment[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddWorkOpen, setIsAddWorkOpen] = useState(false);
  const [editingWork, setEditingWork] = useState<WorkItem | null>(null);

  const loadProjectDetail = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const [detail, commentList, attachmentList] = await Promise.all([
        getProjectDetail(projectId),
        getComments(projectId),
        getAttachments(projectId),
      ]);
      setProjectInfo(detail.project);
      setPhases(detail.phases);
      setStacks(detail.stacks);
      setWorks(detail.showcases);
      setComments(commentList);
      setAttachments(attachmentList);
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
  const handleUpdateProject = async (formData: CreateProjectFormData, memberUserIds: number[]) => {
    if (!projectInfo) return;
    try {
      const saved = await updateProject(projectInfo.id, formData, memberUserIds, CURRENT_USER_ID);

      const prevUserIds = new Set(projectInfo.members.map((m) => m.userId));
      const nextUserIds = new Set(memberUserIds);
      const toAdd = memberUserIds.filter((id) => !prevUserIds.has(id));
      const toRemove = projectInfo.members
        .map((m) => m.userId)
        .filter((id) => !nextUserIds.has(id) && id !== formData.ownerId);

      await Promise.all([
        ...toAdd.map((userId) => addMember(projectInfo.id, userId, "MEMBER")),
        ...toRemove.map((userId) => removeMember(projectInfo.id, userId)),
      ]);

      setProjectInfo(saved);
      setIsEditModalOpen(false);
      await loadProjectDetail();
    } catch (err) {
      console.error(err);
      alert("บันทึกข้อมูลโปรเจกต์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    }
  };

  // ===========================================================================
  // Members — จัดการสมาชิกทีมโดยตรงจากแผงสมาชิก (ไม่ต้องผ่านฟอร์มแก้ไขโครงการ)
  // ===========================================================================
  const handleAddMember = async (userId: number) => {
    if (!projectInfo) return;
    try {
      const member = await addMember(projectInfo.id, userId, "MEMBER");
      setProjectInfo({ ...projectInfo, members: [...projectInfo.members, member] });
    } catch (err) {
      console.error("เพิ่มสมาชิกไม่สำเร็จ", err);
      alert("เพิ่มสมาชิกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!projectInfo) return;
    if (userId === projectInfo.ownerId) {
      alert("ไม่สามารถลบหัวหน้าโครงการ (Owner) ออกจากทีมได้");
      return;
    }
    const prevMembers = projectInfo.members;
    setProjectInfo({ ...projectInfo, members: prevMembers.filter((m) => m.userId !== userId) });
    try {
      await removeMember(projectInfo.id, userId);
    } catch (err) {
      console.error("ลบสมาชิกไม่สำเร็จ", err);
      alert("ลบสมาชิกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      setProjectInfo({ ...projectInfo, members: prevMembers });
    }
  };

  // ===========================================================================
  // Phase — Auto Generate
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
      loadProjectDetail();
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
        });
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
      <TeamProjectHeader
        projectName={projectInfo.name}
        department={projectInfo.department || "-"}
        overallProgress={overallProgress}
        onEditClick={() => setIsEditModalOpen(true)}
      />

      <TeamProjectOverview projectInfo={projectInfo} />

      <TeamProjectMembersPanel
        members={projectInfo.members}
        ownerId={projectInfo.ownerId}
        onAddMember={handleAddMember}
        onRemoveMember={handleRemoveMember}
      />

      <TeamProjectPhaseTable
        projectId={projectInfo.id}
        currentUserId={CURRENT_USER_ID}
        members={projectInfo.members}
        phases={phases}
        setPhases={setPhases}
        onAutoGeneratePhases={handleAutoGeneratePhases}
        onToggleTask={syncTaskItem}
      />

      <TeamProjectStackSection
        projectId={projectInfo.id}
        stacks={stacks}
        setStacks={setStacks}
      />

      <TeamProjectGanttTimeline phases={phases} />

      <TeamProjectGallerySection
        works={works}
        setWorks={setWorks}
        phases={phases}
        onOpenAddModal={handleOpenAddWorkModal}
        onOpenEditModal={handleOpenEditWorkModal}
      />

      <TeamProjectAttachmentsPanel
        projectId={projectInfo.id}
        currentUserId={CURRENT_USER_ID}
        attachments={attachments}
        setAttachments={setAttachments}
      />

      <TeamProjectCommentsPanel
        projectId={projectInfo.id}
        currentUserId={CURRENT_USER_ID}
        comments={comments}
        setComments={setComments}
      />

      <TeamAddWorkModal
        isOpen={isAddWorkOpen}
        editingWork={editingWork}
        projectId={projectInfo.id}
        onClose={() => setIsAddWorkOpen(false)}
        onSave={handleSaveWork}
      />

      <TeamProjectFormModal
        isOpen={isEditModalOpen}
        mode="edit"
        initialData={projectInfo}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateProject}
      />
    </div>
  );
}
