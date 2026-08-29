"use client";

import React, { useState } from "react";
import TeamProjectFormModal from "@/components/projects/team-project-form-modal";
import TeamProjectHeader from "@/components/projects/detail/team/team-project-header";
import TeamProjectOverview from "@/components/projects/detail/team/team-project-overview";
import TeamProjectPhaseTable, {
  Phase,
} from "@/components/projects/detail/team/team-project-phase-table";
import TeamProjectStackSection, {
  StackItem,
} from "@/components/projects/detail/team/team-project-stack-section";
import TeamProjectGanttTimeline from "@/components/projects/detail/team/team-project-gantt-timeline";
import TeamProjectGallerySection, {
  WorkItem,
} from "@/components/projects/detail/team/team-project-gallery-section";
import { SoloProject } from "@/types/project";

const STANDARD_PHASES: Phase[] = [
  {
    id: "p1",
    name: "Get Requirement",
    owner: "Pongpakorn, Somchai",
    startDate: "2026-07-01",
    endDate: "2026-07-10",
    status: "Done",
    items: [
      {
        id: "t1",
        title: "1. การทำงานหน้า Store",
        detail: "Store Max Min ปรับค่า Max Min ได้ และแก้ไข Stock(Box) Stock(Pcs) ได้",
        completed: true,
      },
      {
        id: "t2",
        title: "2. เชื่อมต่อ Database",
        detail:
          "สร้าง View เพื่อให้ระบบแสดงผลที่หน้าเอาเฉพาะข้อมูลในตารางที่สร้างเป็น View มาแสดง และ Update Realtime",
        completed: true,
      },
    ],
    isExpanded: true,
  },
  {
    id: "p2",
    name: "System Analysis",
    owner: "Pongpakorn, Somchai",
    startDate: "2026-07-10",
    endDate: "2026-07-13",
    status: "Done",
    items: [],
    isExpanded: false,
  },
  {
    id: "p3",
    name: "Figma Design",
    owner: "Anan",
    startDate: "2026-08-10",
    endDate: "2026-08-13",
    status: "In Progress",
    items: [],
    isExpanded: false,
  },
  { id: "p4", name: "Database Design", owner: "", startDate: "", endDate: "", status: "Not Started", items: [], isExpanded: false },
  { id: "p5", name: "Backend Development", owner: "", startDate: "", endDate: "", status: "Not Started", items: [], isExpanded: false },
  { id: "p6", name: "Frontend Development", owner: "", startDate: "", endDate: "", status: "Not Started", items: [], isExpanded: false },
  { id: "p7", name: "Integration", owner: "", startDate: "", endDate: "", status: "Not Started", items: [], isExpanded: false },
  { id: "p8", name: "Testing", owner: "", startDate: "", endDate: "", status: "Not Started", items: [], isExpanded: false },
  { id: "p9", name: "UAT", owner: "", startDate: "", endDate: "", status: "Not Started", items: [], isExpanded: false },
  { id: "p10", name: "Deployment", owner: "", startDate: "", endDate: "", status: "Not Started", items: [], isExpanded: false },
  { id: "p11", name: "Documentation", owner: "", startDate: "", endDate: "", status: "Not Started", items: [], isExpanded: false },
];

const initialProjectInfo: SoloProject = {
  id: "erp-integration-hub",
  name: "ERP Integration Hub",
  description:
    "ระบบเชื่อมต่อข้อมูล ERP ระหว่างสาขา พัฒนาร่วมกับทีมเพื่อรวมข้อมูลจากหลายระบบให้เป็นศูนย์กลางเดียว ลดเวลาการกรอกข้อมูลซ้ำซ้อนระหว่างแผนก",
  projectType: "Web Application",
  department: "ระบบดิจิตอลและIT",
  owner: "Pongpakorn, Somchai",
  requester: "ฝ่ายบัญชีและการเงิน",
  priority: "สูง",
  status: "กำลังทำ",
  startDate: "01/01/2026",
  endDate: "30/06/2026",
  progress: 0,
  language: "TypeScript",
  framework: "Next.js",
  library: "Tailwind CSS",
  database: "SQL Server",
  apiService: "REST API",
  otherTech: "",
};

export default function TeamProjectDetailPage() {
  const [projectInfo, setProjectInfo] = useState<SoloProject>(initialProjectInfo);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [phases, setPhases] = useState<Phase[]>(STANDARD_PHASES);

  const [stacks, setStacks] = useState<StackItem[]>([
    { id: "s1", type: "ภาษา (Language)", name: "TypeScript", version: "5.0", layer: "Frontend" },
    { id: "s2", type: "Framework", name: "Next.js", version: "14.2", layer: "Frontend" },
  ]);

  const [works, setWorks] = useState<WorkItem[]>([
    {
      id: "w1",
      title: "Test1",
      description: "Test1",
      flowDescription: "Admin -> จัดการระบบทั้งหมด / User -> ดูรายงานได้อย่างเดียว",
      imageUrl:
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
      date: "13/08/2026",
    },
    {
      id: "w2",
      title: "Test2",
      description: "Test2",
      flowDescription: "การรับส่งข้อมูลผ่าน Realtime WebSocket อัปเดตสถานะอัตโนมัติ",
      imageUrl:
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
      date: "13/08/2026",
    },
  ]);

  const allTasks = phases.flatMap((p) => p.items);
  const completedTasks = allTasks.filter((t) => t.completed);
  const overallProgress =
    allTasks.length > 0 ? Math.round((completedTasks.length / allTasks.length) * 100) : 0;

  const handleUpdateProject = (updatedProject: SoloProject) => {
    setProjectInfo(updatedProject);
    setIsEditModalOpen(false);
  };

  return (
    <div className="w-full space-y-6 pb-12 text-slate-800">
      <TeamProjectHeader
        projectName={projectInfo.name}
        department={projectInfo.department}
        overallProgress={overallProgress}
        onEditClick={() => setIsEditModalOpen(true)}
      />

      <TeamProjectOverview projectInfo={projectInfo} overallProgress={overallProgress} />

      <TeamProjectPhaseTable
        phases={phases}
        setPhases={setPhases}
        standardPhases={STANDARD_PHASES}
      />

      <TeamProjectStackSection stacks={stacks} setStacks={setStacks} />

      <TeamProjectGanttTimeline phases={phases} />

      <TeamProjectGallerySection works={works} setWorks={setWorks} />

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