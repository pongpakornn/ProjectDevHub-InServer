// frontend/src/lib/project-team-api.ts
// เชื่อมต่อ Backend จริง (ProjectTeamController) — mirror จาก project-solo-api.ts
// Master Data (ProjectTypes / Users) ใช้ร่วมกับ Solo ได้เลยเพราะเป็นข้อมูลกลาง ไม่ผูกกับ Solo/Team
// จึง re-export getProjectTypes / getUsers / uploadShowcaseImage จาก project-solo-api แทนการสร้างซ้ำ
import { fetchApi, API_HOST, API_BASE_URL } from "@/lib/api-client";
import { TeamProject, TeamProjectDetail, ProjectMember, CreateProjectFormData } from "@/types/project";
import { Phase, TaskItem, StackItem, WorkItem, TaskAssignee, ProjectComment, ProjectAttachment } from "@/types/project-detail";

export { getProjectTypes, getUsers, uploadShowcaseImage, getDepartments, getTechStackCatalog } from "@/lib/project-solo-api";
export type { ProjectType, UserOption, Department, TechStackCatalogOption, TechStackCatalogGroup } from "@/lib/project-solo-api";

interface TaskAssigneeDtoRaw {
  taskAssigneeId: number;
  taskId: number;
  userId: number;
  fullName: string;
  assignedDate: string;
}

interface ProjectMemberDtoRaw {
  projectMemberId: number;
  projectId: number;
  userId: number;
  empId: string;
  fullName: string;
  roleInProject: string;
  joinedDate: string;
}

interface TeamProjectDtoRaw {
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
  members: ProjectMemberDtoRaw[];
}

interface TeamTaskItemDtoRaw {
  taskId: number;
  milestoneId: number;
  title: string;
  detail?: string | null;
  completed: boolean;
  assignees: TaskAssigneeDtoRaw[];
}

interface TeamPhaseDtoRaw {
  milestoneId: number;
  projectId: number;
  milestoneName: string;
  ownerId?: number | null;
  ownerName?: string | null;
  startDate?: string | null;
  dueDate?: string | null;
  completedDate?: string | null;
  status: string;
  sortOrder: number;
  items: TeamTaskItemDtoRaw[];
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

interface TeamProjectDetailDtoRaw {
  project: TeamProjectDtoRaw;
  phases: TeamPhaseDtoRaw[];
  stacks: StackItemDtoRaw[];
  showcases: WorkItemDtoRaw[];
}

interface CommentDtoRaw {
  commentId: number;
  projectId?: number | null;
  taskId?: number | null;
  userId: number;
  fullName: string;
  commentText: string;
  createdDate: string;
}

interface AttachmentDtoRaw {
  attachmentId: number;
  projectId?: number | null;
  taskId?: number | null;
  fileName: string;
  filePath: string;
  fileSizeByte?: number | null;
  uploadedBy: number;
  uploadedByName: string;
  uploadedDate: string;
}

function mapMember(raw: ProjectMemberDtoRaw): ProjectMember {
  return {
    projectMemberId: raw.projectMemberId,
    userId: raw.userId,
    empId: raw.empId,
    fullName: raw.fullName,
    roleInProject: raw.roleInProject,
    joinedDate: raw.joinedDate,
  };
}

function mapProject(raw: TeamProjectDtoRaw): TeamProject {
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
    status: raw.status as TeamProject["status"],
    priority: raw.priority as TeamProject["priority"],
    startDate: raw.startDate || undefined,
    endDate: raw.endDate || undefined,
    progress: raw.progressPercent,
    members: (raw.members || []).map(mapMember),
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

function mapAssignee(raw: TaskAssigneeDtoRaw): TaskAssignee {
  return { userId: raw.userId, fullName: raw.fullName };
}

function mapTaskItem(raw: TeamTaskItemDtoRaw): TaskItem {
  return {
    id: String(raw.taskId),
    title: raw.title,
    detail: raw.detail || "",
    completed: raw.completed,
    assignees: (raw.assignees || []).map(mapAssignee),
  };
}

function mapPhase(raw: TeamPhaseDtoRaw): Phase {
  return {
    id: String(raw.milestoneId),
    name: raw.milestoneName,
    owner: raw.ownerName || "",
    startDate: raw.startDate || "",
    endDate: raw.dueDate || "",
    status: mapMilestoneStatus(raw.status),
    items: (raw.items || []).map(mapTaskItem),
    isExpanded: false,
  };
}

function mapStackItem(raw: StackItemDtoRaw): StackItem {
  return {
    id: String(raw.techStackId),
    type: raw.type,
    name: raw.name,
    version: raw.version || "",
    layer: raw.layer,
  };
}

function toIsoDate(dateStr?: string | null): string | null {
  if (!dateStr || dateStr === "-") return null;
  const match = dateStr.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
  if (match) {
    const [, d, m, y] = match;
    return `${y}-${m}-${d}`;
  }
  return dateStr;
}

function mapComment(raw: CommentDtoRaw): ProjectComment {
  return {
    id: String(raw.commentId),
    userId: raw.userId,
    fullName: raw.fullName,
    text: raw.commentText,
    createdDate: raw.createdDate,
  };
}

function mapAttachment(raw: AttachmentDtoRaw): ProjectAttachment {
  return {
    id: String(raw.attachmentId),
    fileName: raw.fileName,
    fileUrl: `${API_HOST}${raw.filePath}`,
    fileSizeByte: raw.fileSizeByte ?? null,
    uploadedBy: raw.uploadedBy,
    uploadedByName: raw.uploadedByName,
    uploadedDate: raw.uploadedDate,
  };
}

function mapWorkItem(raw: WorkItemDtoRaw): WorkItem {
  return {
    id: String(raw.showcaseItemId),
    title: raw.title,
    description: raw.description || "",
    flowDescription: raw.flowDescription || "",
    imageUrl: raw.imageUrl ? `${API_HOST}${raw.imageUrl}` : "",
    date: raw.createdDate ? new Date(raw.createdDate).toLocaleDateString("th-TH") : "",
  };
}

function toCreateProjectBody(data: CreateProjectFormData, memberUserIds: number[]) {
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
    memberUserIds,
  };
}

// ===========================================================================
// Project
// ===========================================================================
export async function getProjects(): Promise<TeamProject[]> {
  const raw = await fetchApi<TeamProjectDtoRaw[]>("/ProjectTeam");
  return raw.map(mapProject);
}

export async function getProjectDetail(projectId: number): Promise<TeamProjectDetail> {
  const raw = await fetchApi<TeamProjectDetailDtoRaw>(`/ProjectTeam/${projectId}`);
  return {
    project: mapProject(raw.project),
    phases: raw.phases.map(mapPhase),
    stacks: raw.stacks.map(mapStackItem),
    showcases: raw.showcases.map(mapWorkItem),
  };
}

export async function createProject(
  data: CreateProjectFormData,
  memberUserIds: number[],
  currentUserId: number
): Promise<TeamProject> {
  const raw = await fetchApi<TeamProjectDtoRaw>(`/ProjectTeam?userId=${currentUserId}`, {
    method: "POST",
    body: JSON.stringify(toCreateProjectBody(data, memberUserIds)),
  });
  return mapProject(raw);
}

export async function updateProject(
  projectId: number,
  data: CreateProjectFormData,
  memberUserIds: number[],
  currentUserId: number
): Promise<TeamProject> {
  const raw = await fetchApi<TeamProjectDtoRaw>(`/ProjectTeam?userId=${currentUserId}`, {
    method: "PUT",
    body: JSON.stringify({ projectId, ...toCreateProjectBody(data, memberUserIds) }),
  });
  return mapProject(raw);
}

export function deleteProject(projectId: number, currentUserId: number): Promise<void> {
  return fetchApi<void>(`/ProjectTeam/${projectId}?userId=${currentUserId}`, { method: "DELETE" });
}

// ===========================================================================
// ProjectMembers
// ===========================================================================
export async function getMembers(projectId: number): Promise<ProjectMember[]> {
  const raw = await fetchApi<ProjectMemberDtoRaw[]>(`/ProjectTeam/${projectId}/members`);
  return raw.map(mapMember);
}

export async function addMember(
  projectId: number,
  userId: number,
  roleInProject: string = "MEMBER"
): Promise<ProjectMember> {
  const raw = await fetchApi<ProjectMemberDtoRaw>(`/ProjectTeam/${projectId}/members`, {
    method: "POST",
    body: JSON.stringify({ userId, roleInProject }),
  });
  return mapMember(raw);
}

export function removeMember(projectId: number, userId: number): Promise<void> {
  return fetchApi<void>(`/ProjectTeam/${projectId}/members/${userId}`, { method: "DELETE" });
}

// ===========================================================================
// Phase (Milestone)
// ===========================================================================
export async function createPhase(
  projectId: number,
  data: Pick<Phase, "name" | "status"> & {
    ownerId?: number;
    startDate?: string;
    dueDate?: string;
    sortOrder?: number;
  }
): Promise<Phase> {
  const raw = await fetchApi<TeamPhaseDtoRaw>("/ProjectTeam/phases", {
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
    startDate?: string;
    dueDate?: string;
    sortOrder?: number;
  }
): Promise<Phase> {
  const raw = await fetchApi<TeamPhaseDtoRaw>("/ProjectTeam/phases", {
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

export function deletePhase(milestoneId: number): Promise<void> {
  return fetchApi<void>(`/ProjectTeam/phases/${milestoneId}`, { method: "DELETE" });
}

export async function autoGeneratePhases(projectId: number): Promise<Phase[]> {
  const raw = await fetchApi<TeamPhaseDtoRaw[]>(`/ProjectTeam/${projectId}/phases/auto-generate`, {
    method: "POST",
  });
  return raw.map(mapPhase);
}

// ===========================================================================
// TaskItem (Task) + TaskAssignees
// ===========================================================================
export async function createTaskItem(
  projectId: number,
  milestoneId: number,
  data: Pick<TaskItem, "title" | "detail">,
  currentUserId: number
): Promise<TaskItem> {
  const raw = await fetchApi<TeamTaskItemDtoRaw>(`/ProjectTeam/tasks?userId=${currentUserId}`, {
    method: "POST",
    body: JSON.stringify({ projectId, milestoneId, title: data.title, detail: data.detail }),
  });
  return mapTaskItem(raw);
}

export async function updateTaskItem(taskId: number, data: TaskItem): Promise<TaskItem> {
  const raw = await fetchApi<TeamTaskItemDtoRaw>("/ProjectTeam/tasks", {
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

export function deleteTaskItem(taskId: number): Promise<void> {
  return fetchApi<void>(`/ProjectTeam/tasks/${taskId}`, { method: "DELETE" });
}

export async function assignTaskAssignees(
  projectId: number,
  taskId: number,
  userIds: number[]
): Promise<TaskAssignee[]> {
  const raw = await fetchApi<TaskAssigneeDtoRaw[]>(`/ProjectTeam/${projectId}/tasks/${taskId}/assignees`, {
    method: "POST",
    body: JSON.stringify({ userIds }),
  });
  return raw.map(mapAssignee);
}

// ===========================================================================
// StackItem (TechStack)
// ===========================================================================
export async function createStackItem(
  projectId: number,
  data: Pick<StackItem, "type" | "name" | "version" | "layer">
): Promise<StackItem> {
  const raw = await fetchApi<StackItemDtoRaw>("/ProjectTeam/stacks", {
    method: "POST",
    body: JSON.stringify({ projectId, ...data }),
  });
  return mapStackItem(raw);
}

export function deleteStackItem(techStackId: number): Promise<void> {
  return fetchApi<void>(`/ProjectTeam/stacks/${techStackId}`, { method: "DELETE" });
}

// ===========================================================================
// WorkItem (ShowcaseItem)
// ===========================================================================
export async function createWorkItem(
  projectId: number,
  data: Pick<WorkItem, "title" | "description" | "flowDescription" | "imageUrl">,
  currentUserId: number
): Promise<WorkItem> {
  const raw = await fetchApi<WorkItemDtoRaw>(`/ProjectTeam/showcases?userId=${currentUserId}`, {
    method: "POST",
    body: JSON.stringify({ projectId, ...data }),
  });
  return mapWorkItem(raw);
}

export async function updateWorkItem(
  showcaseItemId: number,
  projectId: number,
  data: Pick<WorkItem, "title" | "description" | "flowDescription" | "imageUrl">
): Promise<WorkItem> {
  const raw = await fetchApi<WorkItemDtoRaw>("/ProjectTeam/showcases", {
    method: "PUT",
    body: JSON.stringify({ showcaseItemId, projectId, ...data }),
  });
  return mapWorkItem(raw);
}

export function deleteWorkItem(showcaseItemId: number): Promise<void> {
  return fetchApi<void>(`/ProjectTeam/showcases/${showcaseItemId}`, { method: "DELETE" });
}

// ===========================================================================
// Comments — Project.Comments (คอมเมนต์ระดับโปรเจกต์ ไม่ผูก Task)
// ===========================================================================
export async function getComments(projectId: number): Promise<ProjectComment[]> {
  const raw = await fetchApi<CommentDtoRaw[]>(`/ProjectTeam/${projectId}/comments`);
  return raw.map(mapComment);
}

export async function addComment(
  projectId: number,
  commentText: string,
  currentUserId: number
): Promise<ProjectComment> {
  const raw = await fetchApi<CommentDtoRaw>(`/ProjectTeam/${projectId}/comments?userId=${currentUserId}`, {
    method: "POST",
    body: JSON.stringify({ commentText }),
  });
  return mapComment(raw);
}

export function deleteComment(commentId: number): Promise<void> {
  return fetchApi<void>(`/ProjectTeam/comments/${commentId}`, { method: "DELETE" });
}

// ===========================================================================
// Attachments — Project.Attachments (ไฟล์แนบระดับโปรเจกต์ ไม่ผูก Task)
// ===========================================================================
export async function getAttachments(projectId: number): Promise<ProjectAttachment[]> {
  const raw = await fetchApi<AttachmentDtoRaw[]>(`/ProjectTeam/${projectId}/attachments`);
  return raw.map(mapAttachment);
}

async function uploadAttachmentFile(
  projectId: number,
  file: File
): Promise<{ url: string; fileName: string; fileSizeByte: number }> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/Upload/attachment?projectId=${projectId}`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("อัปโหลดไฟล์แนบไม่สำเร็จ");
  }

  return response.json();
}

export async function addAttachment(
  projectId: number,
  file: File,
  currentUserId: number
): Promise<ProjectAttachment> {
  const uploaded = await uploadAttachmentFile(projectId, file);
  const raw = await fetchApi<AttachmentDtoRaw>(`/ProjectTeam/${projectId}/attachments?userId=${currentUserId}`, {
    method: "POST",
    body: JSON.stringify({
      fileName: uploaded.fileName,
      filePath: uploaded.url,
      fileSizeByte: uploaded.fileSizeByte,
    }),
  });
  return mapAttachment(raw);
}

export function deleteAttachment(attachmentId: number): Promise<void> {
  return fetchApi<void>(`/ProjectTeam/attachments/${attachmentId}`, { method: "DELETE" });
}
