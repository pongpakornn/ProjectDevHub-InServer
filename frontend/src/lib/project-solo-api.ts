
// Cluade Code Mail Master
import { fetchApi, API_BASE_URL, API_HOST } from "@/lib/api-client";
import { SoloProject, SoloProjectDetail, CreateProjectFormData } from "@/types/project";
import { Phase, TaskItem, StackItem, WorkItem } from "@/types/project-detail";

export interface ProjectType {
  projectTypeId: number;
  typeName: string;
}

interface SoloProjectDtoRaw {
  projectId: number;
  projectCode: string;
  projectName: string;
  description?: string | null;
  projectTypeId: number;
  projectTypeName: string;
  divisionName?: string | null;
  requesterName?: string | null;
  projectOwnerId: number;
  ownerName: string;
  status: string;
  priority: string;
  startDate?: string | null;
  endDate?: string | null;
  progressPercent: number;
}

interface TaskItemDtoRaw {
  taskId: number;
  milestoneId: number;
  title: string;
  detail?: string | null;
  completed: boolean;
}

interface PhaseDtoRaw {
  milestoneId: number;
  projectId: number;
  milestoneName: string;
  ownerId?: number | null;
  ownerName?: string | null;
  startDate?: string | null;   // ★ เพิ่ม
  dueDate?: string | null;
  completedDate?: string | null;
  status: string;
  sortOrder: number;
  items: TaskItemDtoRaw[];
}

interface StackItemDtoRaw {
  techStackId: number;
  projectId: number;
  type: string;
  name: string;
  version?: string | null;
  layer: string;
}

interface WorkItemDtoRaw {
  showcaseItemId: number;
  projectId: number;
  title: string;
  description?: string | null;
  flowDescription?: string | null;
  imageUrl?: string | null;
  createdDate: string;
}

export interface SoloProjectDetailDtoRaw {
  project: SoloProjectDtoRaw;
  phases: PhaseDtoRaw[];
  stacks: StackItemDtoRaw[];
  showcases: WorkItemDtoRaw[];
}

export function mapProject(raw: SoloProjectDtoRaw): SoloProject {
  return {
    id: raw.projectId,
    projectCode: raw.projectCode,
    name: raw.projectName,
    description: raw.description || undefined,
    projectTypeId: raw.projectTypeId,
    projectTypeName: raw.projectTypeName,
    department: raw.divisionName || undefined,
    requester: raw.requesterName || undefined,
    ownerId: raw.projectOwnerId,
    ownerName: raw.ownerName,
    status: raw.status as SoloProject["status"],
    priority: raw.priority as SoloProject["priority"],
    startDate: raw.startDate || undefined,
    endDate: raw.endDate || undefined,
    progress: raw.progressPercent,
  };
}

function mapMilestoneStatus(status: string): Phase["status"] {
  if (status === "COMPLETED") return "Done";
  if (status === "IN_PROGRESS") return "In Progress";
  return "Not Started";
}

function mapPhaseStatusToMilestoneStatus(status: Phase["status"]): string {
  if (status === "Done") return "COMPLETED";
  if (status === "In Progress") return "IN_PROGRESS";
  return "PENDING";
}

function mapTaskItem(raw: TaskItemDtoRaw): TaskItem {
  return {
    id: String(raw.taskId),
    title: raw.title,
    detail: raw.detail || "",
    completed: raw.completed,
  };
}

export function mapPhase(raw: PhaseDtoRaw): Phase {
  return {
    id: String(raw.milestoneId),
    name: raw.milestoneName,
    owner: raw.ownerName || "",
    // ★ แก้: เดิม startDate ถูก hardcode เป็น "" เสมอ (เพราะ backend ไม่เคยมีคอลัมน์นี้)
    // ตอนนี้ backend มี StartDate จริงแล้ว (Part 5) เลย map จาก raw.startDate ได้ตรงๆ
    startDate: raw.startDate || "",
    endDate: raw.dueDate || "",
    status: mapMilestoneStatus(raw.status),
    items: (raw.items || []).map(mapTaskItem),
    isExpanded: false,
  };
}

export function mapStackItem(raw: StackItemDtoRaw): StackItem {
  return {
    id: String(raw.techStackId),
    type: raw.type,
    name: raw.name,
    version: raw.version || "",
    layer: raw.layer,
  };
}

// แปลง "DD-MM-YYYY" หรือ "DD/MM/YYYY" (จาก UI) ให้เป็น "YYYY-MM-DD" (ISO ที่ backend รับได้)
function toIsoDate(dateStr?: string | null): string | null {
  if (!dateStr || dateStr === "-") return null;
  const match = dateStr.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
  if (match) {
    const [, d, m, y] = match;
    return `${y}-${m}-${d}`;
  }
  return dateStr; // เผื่อกรณีเป็น ISO อยู่แล้ว (เช่นตอน edit ไม่ได้แตะวันที่)
}

export function mapWorkItem(raw: WorkItemDtoRaw): WorkItem {
  return {
    id: String(raw.showcaseItemId),
    title: raw.title,
    description: raw.description || "",
    flowDescription: raw.flowDescription || "",
    imageUrl: raw.imageUrl ? `${API_HOST}${raw.imageUrl}` : "",   // ★ ต่อ host เข้าไป
    date: raw.createdDate ? new Date(raw.createdDate).toLocaleDateString("th-TH") : "",
  };
}

function toCreateProjectBody(data: CreateProjectFormData) {
  return {
    projectName: data.name,
    description: data.description,
    projectTypeId: data.projectTypeId,
    divisionName: data.department,
    requesterName: data.requester,
    projectOwnerId: data.ownerId,
    priority: data.priority,
    status: data.status,
    startDate: toIsoDate(data.startDate),
endDate: toIsoDate(data.endDate),
  };
}

export function getProjectTypes(): Promise<ProjectType[]> {
  return fetchApi<ProjectType[]>("/ProjectSolo/types");
}

// ★ เพิ่มกลับเข้ามา — ที่ทำให้ build error หายไป
export interface UserOption {
  userId: number;
  empId: string;
  fullName: string;
}

export function getUsers(): Promise<UserOption[]> {
  return fetchApi<UserOption[]>("/ProjectSolo/users");
}

export interface Department {
  departmentId: number;
  departmentName: string;
}

export function getDepartments(): Promise<Department[]> {
  return fetchApi<Department[]>("/ProjectSolo/departments");
}

export type TechStackCatalogGroup = "TYPE" | "NAME" | "LAYER";

export interface TechStackCatalogOption {
  catalogId: number;
  optionGroup: TechStackCatalogGroup;
  optionValue: string;
  typeId?: number | null; // มีความหมายเฉพาะแถว NAME — ชี้กลับไป catalogId ของแถว TYPE ต้นทาง
}

// typeId ไม่ใส่มา -> ได้แค่ TYPE/LAYER (ยังไม่มี NAME ให้เลือก) — Backend บังคับ Rule นี้เพื่อให้ตรงกับ
// พฤติกรรม UI ที่ Dropdown "ชื่อ" ถูกปิดใช้งานจนกว่าจะเลือก "ประเภท" ก่อนเสมอ
export function getTechStackCatalog(typeId?: number | null): Promise<TechStackCatalogOption[]> {
  const query = typeId != null ? `?typeId=${typeId}` : "";
  return fetchApi<TechStackCatalogOption[]>(`/ProjectSolo/techstack-catalog${query}`);
}

// ★ Data Isolation: ต้องส่ง userId เสมอ — Backend Filter ให้เห็นเฉพาะโปรเจกต์ของตัวเองเท่านั้น
export async function getProjects(userId: number): Promise<SoloProject[]> {
  const raw = await fetchApi<SoloProjectDtoRaw[]>(`/ProjectSolo?userId=${userId}`);
  return raw.map(mapProject);
}

export async function getProjectDetail(projectId: number, userId: number): Promise<SoloProjectDetail> {
  const raw = await fetchApi<SoloProjectDetailDtoRaw>(`/ProjectSolo/${projectId}?userId=${userId}`);
  return {
    project: mapProject(raw.project),
    phases: raw.phases.map(mapPhase),
    stacks: raw.stacks.map(mapStackItem),
    showcases: raw.showcases.map(mapWorkItem),
  };
}

export async function createProject(
  data: CreateProjectFormData,
  currentUserId: number
): Promise<SoloProject> {
  const raw = await fetchApi<SoloProjectDtoRaw>(`/ProjectSolo?userId=${currentUserId}`, {
    method: "POST",
    body: JSON.stringify(toCreateProjectBody(data)),
  });
  return mapProject(raw);
}

export async function updateProject(
  projectId: number,
  data: CreateProjectFormData,
  currentUserId: number
): Promise<SoloProject> {
  const raw = await fetchApi<SoloProjectDtoRaw>(`/ProjectSolo?userId=${currentUserId}`, {
    method: "PUT",
    body: JSON.stringify({ projectId, ...toCreateProjectBody(data) }),
  });
  return mapProject(raw);
}

export function deleteProject(projectId: number, currentUserId: number): Promise<void> {
  return fetchApi<void>(`/ProjectSolo/${projectId}?userId=${currentUserId}`, { method: "DELETE" });
}

// ===========================================================================
// Phase (Milestone)
// ===========================================================================
export async function createPhase(
  projectId: number,
  data: Pick<Phase, "name" | "status"> & {
    ownerId?: number;
    startDate?: string;   // ★ เพิ่ม
    dueDate?: string;
    sortOrder?: number;
  },
  currentUserId: number
): Promise<Phase> {
  const raw = await fetchApi<PhaseDtoRaw>(`/ProjectSolo/phases?userId=${currentUserId}`, {
    method: "POST",
    body: JSON.stringify({
      projectId,
      milestoneName: data.name,
      ownerId: data.ownerId ?? null,
      startDate: toIsoDate(data.startDate),
      dueDate: toIsoDate(data.dueDate),
      status: mapPhaseStatusToMilestoneStatus(data.status),
      sortOrder: data.sortOrder ?? 0,
    }),
  });
  return mapPhase(raw);
}

export async function updatePhase(
  milestoneId: number,
  data: Pick<Phase, "name" | "status"> & {
    ownerId?: number;
    startDate?: string;   // ★ เพิ่ม
    dueDate?: string;
    sortOrder?: number;
  },
  currentUserId: number
): Promise<Phase> {
  const raw = await fetchApi<PhaseDtoRaw>(`/ProjectSolo/phases?userId=${currentUserId}`, {
    method: "PUT",
    body: JSON.stringify({
      milestoneId,
      milestoneName: data.name,
      ownerId: data.ownerId ?? null,
      startDate: toIsoDate(data.startDate),
      dueDate: toIsoDate(data.dueDate),
      status: mapPhaseStatusToMilestoneStatus(data.status),
      sortOrder: data.sortOrder ?? 0,
    }),
  });
  return mapPhase(raw);
}

export function deletePhase(milestoneId: number, currentUserId: number): Promise<void> {
  return fetchApi<void>(`/ProjectSolo/phases/${milestoneId}?userId=${currentUserId}`, { method: "DELETE" });
}

// ★ เพิ่มใหม่: Auto-Generate Phases
export async function autoGeneratePhases(projectId: number, currentUserId: number): Promise<Phase[]> {
  const raw = await fetchApi<PhaseDtoRaw[]>(`/ProjectSolo/${projectId}/phases/auto-generate?userId=${currentUserId}`, {
    method: "POST",
  });
  return raw.map(mapPhase);
}

// ===========================================================================
// TaskItem (Task)
// ===========================================================================
export async function createTaskItem(
  projectId: number,
  milestoneId: number,
  data: Pick<TaskItem, "title" | "detail">,
  currentUserId: number
): Promise<TaskItem> {
  const raw = await fetchApi<TaskItemDtoRaw>(`/ProjectSolo/tasks?userId=${currentUserId}`, {
    method: "POST",
    body: JSON.stringify({ projectId, milestoneId, title: data.title, detail: data.detail }),
  });
  return mapTaskItem(raw);
}

export async function updateTaskItem(taskId: number, data: TaskItem, currentUserId: number): Promise<TaskItem> {
  const raw = await fetchApi<TaskItemDtoRaw>(`/ProjectSolo/tasks?userId=${currentUserId}`, {
    method: "PUT",
    body: JSON.stringify({
      taskId,
      title: data.title,
      detail: data.detail,
      completed: data.completed,
    }),
  });
  return mapTaskItem(raw);
}

export function deleteTaskItem(taskId: number, currentUserId: number): Promise<void> {
  return fetchApi<void>(`/ProjectSolo/tasks/${taskId}?userId=${currentUserId}`, { method: "DELETE" });
}

// ===========================================================================
// StackItem (TechStack)
// ===========================================================================
export async function createStackItem(
  projectId: number,
  data: Pick<StackItem, "type" | "name" | "version" | "layer">,
  currentUserId: number
): Promise<StackItem> {
  const raw = await fetchApi<StackItemDtoRaw>(`/ProjectSolo/stacks?userId=${currentUserId}`, {
    method: "POST",
    body: JSON.stringify({ projectId, ...data }),
  });
  return mapStackItem(raw);
}

export function deleteStackItem(techStackId: number, currentUserId: number): Promise<void> {
  return fetchApi<void>(`/ProjectSolo/stacks/${techStackId}?userId=${currentUserId}`, { method: "DELETE" });
}

// ===========================================================================
// WorkItem (ShowcaseItem)
// ===========================================================================
export async function createWorkItem(
  projectId: number,
  data: Pick<WorkItem, "title" | "description" | "flowDescription" | "imageUrl">,
  currentUserId: number
): Promise<WorkItem> {
  const raw = await fetchApi<WorkItemDtoRaw>(`/ProjectSolo/showcases?userId=${currentUserId}`, {
    method: "POST",
    body: JSON.stringify({ projectId, ...data }),
  });
  return mapWorkItem(raw);
}

export async function updateWorkItem(
  showcaseItemId: number,
  projectId: number,
  data: Pick<WorkItem, "title" | "description" | "flowDescription" | "imageUrl">,
  currentUserId: number
): Promise<WorkItem> {
  const raw = await fetchApi<WorkItemDtoRaw>(`/ProjectSolo/showcases?userId=${currentUserId}`, {
    method: "PUT",
    body: JSON.stringify({ showcaseItemId, projectId, ...data }),
  });
  return mapWorkItem(raw);
}

export function deleteWorkItem(showcaseItemId: number, currentUserId: number): Promise<void> {
  return fetchApi<void>(`/ProjectSolo/showcases/${showcaseItemId}?userId=${currentUserId}`, { method: "DELETE" });
}

// projectName/pageName ใช้ตั้งชื่อโฟลเดอร์/ไฟล์จริงฝั่ง Backend (โฟลเดอร์ = ชื่อโปรเจกต์, ไฟล์ = ชื่อหน้า)
// แทนการใช้ projectId ดิบๆ กับชื่อไฟล์แบบ GUID เดิม เพื่อให้เปิดโฟลเดอร์แล้วรู้ทันทีว่าเป็นรูปของอะไร
export async function uploadShowcaseImage(
  projectId: number,
  file: File,
  projectName?: string,
  pageName?: string
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const params = new URLSearchParams({ projectId: String(projectId) });
  if (projectName) params.set("projectName", projectName);
  if (pageName) params.set("pageName", pageName);

  const response = await fetch(
    `${API_BASE_URL}/Upload/showcase-image?${params.toString()}`,
    { method: "POST", body: formData }
  );

  if (!response.ok) {
    throw new Error("อัปโหลดรูปภาพไม่สำเร็จ");
  }

  const data = await response.json();
  return data.url as string;
}