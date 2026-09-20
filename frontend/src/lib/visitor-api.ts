// frontend/src/lib/visitor-api.ts
// Visitor Mode — ทุกฟังก์ชันในไฟล์นี้เป็น "อ่านอย่างเดียว" ล้วนๆ (ไม่มี create/update/delete) เชื่อมต่อ
// backend/Controllers/VisitorController.cs จริง ไม่มี Mock — reuse mapper/raw type จาก project-solo-api.ts
// และ project-team-api.ts ตรงๆ เพราะ backend คืนรูปทรง DTO ชุดเดียวกันเป๊ะ (SoloProjectDetailDto/TeamProjectDetailDto)
import { fetchApi } from "@/lib/api-client";
import { SoloProjectDetail, TeamProjectDetail } from "@/types/project";
import {
  SoloProjectDetailDtoRaw,
  mapProject as mapSoloProject,
  mapPhase as mapSoloPhase,
  mapStackItem as mapSoloStackItem,
  mapWorkItem as mapSoloWorkItem,
} from "@/lib/project-solo-api";
import {
  TeamProjectDetailDtoRaw,
  mapProject as mapTeamProject,
  mapPhase as mapTeamPhase,
  mapStackItem as mapTeamStackItem,
  mapWorkItem as mapTeamWorkItem,
} from "@/lib/project-team-api";
import { FlowDefinitionDetailDtoRaw, mapListItem as mapFlowListItem } from "@/lib/flow-api";
import { FlowDetail } from "@/types/flow";

export interface VisitorUser {
  userId: number;
  empId: string;
  fullName: string;
  userLevel: number;
  divisionName?: string;
  departmentName?: string;
  projectCount: number;
  latestProjectDate?: string | null;
}

interface VisitorUserDtoRaw {
  userId: number;
  empId: string;
  fullName: string;
  userLevel: number;
  divisionName?: string | null;
  departmentName?: string | null;
  projectCount: number;
  latestProjectDate?: string | null;
}

function mapVisitorUser(raw: VisitorUserDtoRaw): VisitorUser {
  return {
    userId: raw.userId,
    empId: raw.empId,
    fullName: raw.fullName,
    userLevel: raw.userLevel,
    divisionName: raw.divisionName || undefined,
    departmentName: raw.departmentName || undefined,
    projectCount: raw.projectCount,
    latestProjectDate: raw.latestProjectDate,
  };
}

export async function getVisitableUsers(viewerUserId: number): Promise<VisitorUser[]> {
  const raw = await fetchApi<VisitorUserDtoRaw[]>(`/Visitor/users?userId=${viewerUserId}`);
  return raw.map(mapVisitorUser);
}

export interface VisitorProjectCard {
  id: number;
  projectCode: string;
  name: string;
  description?: string;
  projectTypeName: string;
  status: string;
  priority: string;
  startDate?: string;
  endDate?: string;
  progress: number;
  workType: "SOLO" | "TEAM";
  ownerName: string;
}

interface VisitorProjectCardDtoRaw {
  projectId: number;
  projectCode: string;
  projectName: string;
  description?: string | null;
  projectTypeName: string;
  status: string;
  priority: string;
  startDate?: string | null;
  endDate?: string | null;
  progressPercent: number;
  workType: "SOLO" | "TEAM";
  ownerName: string;
}

function mapVisitorProjectCard(raw: VisitorProjectCardDtoRaw): VisitorProjectCard {
  return {
    id: raw.projectId,
    projectCode: raw.projectCode,
    name: raw.projectName,
    description: raw.description || undefined,
    projectTypeName: raw.projectTypeName,
    status: raw.status,
    priority: raw.priority,
    startDate: raw.startDate || undefined,
    endDate: raw.endDate || undefined,
    progress: raw.progressPercent,
    workType: raw.workType,
    ownerName: raw.ownerName,
  };
}

export async function getUserProjectCards(targetUserId: number, viewerUserId: number): Promise<VisitorProjectCard[]> {
  const raw = await fetchApi<VisitorProjectCardDtoRaw[]>(
    `/Visitor/projects?targetUserId=${targetUserId}&userId=${viewerUserId}`
  );
  return raw.map(mapVisitorProjectCard);
}

export async function getSoloProjectDetail(
  projectId: number,
  targetUserId: number,
  viewerUserId: number
): Promise<SoloProjectDetail> {
  const raw = await fetchApi<SoloProjectDetailDtoRaw>(
    `/Visitor/projects/${projectId}?targetUserId=${targetUserId}&userId=${viewerUserId}&type=solo`
  );
  return {
    project: mapSoloProject(raw.project),
    phases: raw.phases.map(mapSoloPhase),
    stacks: raw.stacks.map(mapSoloStackItem),
    showcases: raw.showcases.map(mapSoloWorkItem),
  };
}

export async function getTeamProjectDetail(
  projectId: number,
  targetUserId: number,
  viewerUserId: number
): Promise<TeamProjectDetail> {
  const raw = await fetchApi<TeamProjectDetailDtoRaw>(
    `/Visitor/projects/${projectId}?targetUserId=${targetUserId}&userId=${viewerUserId}&type=team`
  );
  return {
    project: mapTeamProject(raw.project),
    phases: raw.phases.map(mapTeamPhase),
    stacks: raw.stacks.map(mapTeamStackItem),
    showcases: raw.showcases.map(mapTeamWorkItem),
  };
}

// อ่านอย่างเดียว: Flow Diagram ของโปรเจกต์นี้ — ใช้ FlowDefinitionId ที่ได้ไปเรียก getFlowDiagramData
// (frontend/src/lib/flow-api.ts) ต่อได้เลย เพราะ Endpoint นั้นไม่ได้ผูก Ownership Check เพิ่ม (Global Read)
export async function getUserProjectFlow(
  projectId: number,
  targetUserId: number,
  viewerUserId: number
): Promise<FlowDetail | null> {
  try {
    const raw = await fetchApi<FlowDefinitionDetailDtoRaw>(
      `/Visitor/projects/${projectId}/flow?targetUserId=${targetUserId}&userId=${viewerUserId}`
    );
    return mapFlowListItem(raw.flow);
  } catch {
    return null;
  }
}
