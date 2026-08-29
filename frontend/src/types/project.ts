import { Phase, StackItem, WorkItem } from "@/types/project-detail";

// ตรงกับ SoloProjectDto ฝั่ง Backend
export interface SoloProject {
  id: number;
  projectCode: string;
  name: string;               // ProjectName
  description?: string;

  projectTypeId: number;
  projectTypeName: string;

  department?: string;        // DivisionName
  requester?: string;         // RequesterName (Free Text)

  ownerId: number;            // ProjectOwnerId (ผูก User จริง)
  ownerName: string;

  status: "PLANNING" | "IN_PROGRESS" | "ON_HOLD" | "COMPLETED" | "CANCELLED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";

  startDate?: string;         // "YYYY-MM-DD"
  endDate?: string;
  actualEndDate?: string;

  progress: number;           // ProgressPercent — คำนวณจาก Backend อัตโนมัติ ห้ามแก้เอง
}

// รายละเอียดเต็มของหน้า Detail (Project + Phase + Stack + Showcase)
export interface SoloProjectDetail {
  project: SoloProject;
  phases: Phase[];
  stacks: StackItem[];
  showcases: WorkItem[];
}

// ตรงกับ CreateSoloProjectRequest ฝั่ง Backend (ใช้ทั้ง Create/Edit Form)
export interface CreateProjectFormData {
  name: string;
  description: string;
  projectTypeId: number;
  department: string;
  requester: string;
  ownerId: number;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "PLANNING" | "IN_PROGRESS" | "ON_HOLD" | "COMPLETED" | "CANCELLED";
  startDate: string;
  endDate: string;
  // หมายเหตุ: ตัด language/framework/library/database/apiService/otherTech ออกแล้ว
  // เพราะซ้ำซ้อนกับ Tech Stack Section (StackItem) — ใช้ Stack Section แทน
  // ตัด progress ออก เพราะ Backend คำนวณให้อัตโนมัติจาก Task
}