// frontend/src/lib/flow-api.ts
// เชื่อมต่อ Backend จริง (FlowController) — mirror จาก project-team-api.ts
import { fetchApi } from "@/lib/api-client";
import {
  FlowListItem,
  FlowDetail,
  FlowStep,
  FlowTechStackTag,
  FlowTechLayer,
  FlowExecution,
  FlowLog,
  FlowStatus,
  FlowStepStatus,
  FlowWorkType,
  FlowExecutionStatus,
  FlowLogLevel,
} from "@/types/flow";

interface FlowDefinitionDtoRaw {
  flowDefinitionId: number;
  projectId?: number | null;
  flowCode: string;
  name: string;
  description?: string | null;
  status: string;
  workType: string;
  startDate?: string | null;
  endDate?: string | null;
  progressPercent: number;
  createdBy: number;
  createdByName: string;
}

interface FlowStepDtoRaw {
  flowStepId: number;
  flowDefinitionId: number;
  milestoneId?: number | null;
  stepNo: string;
  title: string;
  status: string;
  progressPercent: number;
  startDate?: string | null;
  endDate?: string | null;
  sortOrder: number;
}

interface FlowTechStackDtoRaw {
  flowTechStackId: number;
  flowDefinitionId: number;
  techStackId?: number | null;
  layer: string;
  name: string;
  sortOrder: number;
}

interface FlowDefinitionDetailDtoRaw {
  flow: FlowDefinitionDtoRaw;
  steps: FlowStepDtoRaw[];
  techStacks: FlowTechStackDtoRaw[];
}

interface FlowLogDtoRaw {
  flowLogId: number;
  flowExecutionId: number;
  logLevel: string;
  message: string;
  loggedDate: string;
}

interface FlowExecutionDtoRaw {
  flowExecutionId: number;
  flowDefinitionId: number;
  status: string;
  startedDate: string;
  finishedDate?: string | null;
  triggeredBy: number;
  triggeredByName: string;
  note?: string | null;
  logs: FlowLogDtoRaw[];
}

// ===========================================================================
// Status / WorkType mapping (Backend Code <-> Thai Label)
// ===========================================================================
function mapFlowStatus(status: string): FlowStatus {
  if (status === "COMPLETED") return "เสร็จแล้ว";
  if (status === "IN_PROGRESS") return "กำลังทำ";
  return "วางแผน";
}

function mapStepStatus(status: string): FlowStepStatus {
  if (status === "DONE") return "เสร็จแล้ว";
  if (status === "IN_PROGRESS") return "กำลังทำ";
  return "รอดำเนินการ";
}

function mapStepStatusToBackend(status: FlowStepStatus): string {
  if (status === "เสร็จแล้ว") return "DONE";
  if (status === "กำลังทำ") return "IN_PROGRESS";
  return "PENDING";
}

function mapWorkType(workType: string): FlowWorkType {
  return workType === "TEAM" ? "ทำกับทีม" : "ทำคนเดียว";
}

function toDisplayDate(iso?: string | null): string {
  if (!iso) return "-";
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, y, m, d] = match;
    return `${d}/${m}/${y}`;
  }
  return iso;
}

function mapListItem(raw: FlowDefinitionDtoRaw): FlowListItem {
  return {
    id: String(raw.flowDefinitionId),
    projectId: raw.projectId ?? null,
    flowCode: raw.flowCode,
    name: raw.name,
    description: raw.description || "",
    status: mapFlowStatus(raw.status),
    startDate: toDisplayDate(raw.startDate),
    endDate: toDisplayDate(raw.endDate),
    workType: mapWorkType(raw.workType),
    progress: Math.round(raw.progressPercent),
  };
}

function mapStep(raw: FlowStepDtoRaw): FlowStep {
  return {
    id: String(raw.flowStepId),
    milestoneId: raw.milestoneId ?? null,
    stepNo: raw.stepNo,
    title: raw.title,
    status: mapStepStatus(raw.status),
    progress: raw.progressPercent,
    startDate: raw.startDate || undefined,
    endDate: raw.endDate || undefined,
  };
}

function mapTechStack(raw: FlowTechStackDtoRaw): FlowTechStackTag {
  return {
    id: String(raw.flowTechStackId),
    techStackId: raw.techStackId ?? null,
    layer: raw.layer as FlowTechLayer,
    name: raw.name,
  };
}

function mapLog(raw: FlowLogDtoRaw): FlowLog {
  return {
    id: String(raw.flowLogId),
    logLevel: raw.logLevel as FlowLogLevel,
    message: raw.message,
    loggedDate: raw.loggedDate,
  };
}

function mapExecution(raw: FlowExecutionDtoRaw): FlowExecution {
  return {
    id: String(raw.flowExecutionId),
    status: raw.status as FlowExecutionStatus,
    startedDate: raw.startedDate,
    finishedDate: raw.finishedDate || undefined,
    triggeredByName: raw.triggeredByName,
    note: raw.note || undefined,
    logs: (raw.logs || []).map(mapLog),
  };
}

// ===========================================================================
// FlowDefinitions
// ===========================================================================
// ★ Data Isolation: ต้องส่ง userId เสมอ — Backend Filter ให้เห็นเฉพาะ Flow ของโปรเจกต์ที่เข้าถึงได้เท่านั้น
export async function getFlows(userId: number): Promise<FlowListItem[]> {
  const raw = await fetchApi<FlowDefinitionDtoRaw[]>(`/Flow?userId=${userId}`);
  return raw.map(mapListItem);
}

export async function getFlowDetail(flowDefinitionId: number, userId: number): Promise<FlowDetail> {
  const raw = await fetchApi<FlowDefinitionDetailDtoRaw>(`/Flow/${flowDefinitionId}?userId=${userId}`);
  return {
    ...mapListItem(raw.flow),
    techStacks: raw.techStacks.map(mapTechStack),
    phases: raw.steps.map(mapStep),
  };
}

export function deleteFlow(flowDefinitionId: number): Promise<void> {
  return fetchApi<void>(`/Flow/${flowDefinitionId}`, { method: "DELETE" });
}

// ===========================================================================
// FlowSteps
// ===========================================================================
export async function createStep(
  flowDefinitionId: number,
  data: {
    stepNo: string;
    title: string;
    status: FlowStepStatus;
    progress: number;
    startDate?: string;
    endDate?: string;
    sortOrder?: number;
  }
): Promise<FlowStep> {
  const raw = await fetchApi<FlowStepDtoRaw>("/Flow/steps", {
    method: "POST",
    body: JSON.stringify({
      flowDefinitionId,
      stepNo: data.stepNo,
      title: data.title,
      status: mapStepStatusToBackend(data.status),
      progressPercent: data.progress,
      startDate: data.startDate || null,
      endDate: data.endDate || null,
      sortOrder: data.sortOrder ?? 0,
    }),
  });
  return mapStep(raw);
}

export async function updateStep(
  flowStepId: number,
  flowDefinitionId: number,
  data: {
    stepNo: string;
    title: string;
    status: FlowStepStatus;
    progress: number;
    startDate?: string;
    endDate?: string;
    sortOrder?: number;
  }
): Promise<FlowStep> {
  const raw = await fetchApi<FlowStepDtoRaw>("/Flow/steps", {
    method: "PUT",
    body: JSON.stringify({
      flowStepId,
      flowDefinitionId,
      stepNo: data.stepNo,
      title: data.title,
      status: mapStepStatusToBackend(data.status),
      progressPercent: data.progress,
      startDate: data.startDate || null,
      endDate: data.endDate || null,
      sortOrder: data.sortOrder ?? 0,
    }),
  });
  return mapStep(raw);
}

export function deleteStep(flowStepId: number): Promise<void> {
  return fetchApi<void>(`/Flow/steps/${flowStepId}`, { method: "DELETE" });
}

export async function autoGenerateSteps(flowDefinitionId: number): Promise<FlowStep[]> {
  const raw = await fetchApi<FlowStepDtoRaw[]>(`/Flow/${flowDefinitionId}/steps/auto-generate`, {
    method: "POST",
  });
  return raw.map(mapStep);
}

// ===========================================================================
// FlowTechStacks
// ===========================================================================
export async function createTechStack(
  flowDefinitionId: number,
  layer: FlowTechLayer,
  name: string
): Promise<FlowTechStackTag> {
  const raw = await fetchApi<FlowTechStackDtoRaw>("/Flow/techstacks", {
    method: "POST",
    body: JSON.stringify({ flowDefinitionId, layer, name, sortOrder: 0 }),
  });
  return mapTechStack(raw);
}

export function deleteTechStack(flowTechStackId: number): Promise<void> {
  return fetchApi<void>(`/Flow/techstacks/${flowTechStackId}`, { method: "DELETE" });
}

export async function autoGenerateTechStacks(flowDefinitionId: number): Promise<FlowTechStackTag[]> {
  const raw = await fetchApi<FlowTechStackDtoRaw[]>(`/Flow/${flowDefinitionId}/techstacks/auto-generate`, {
    method: "POST",
  });
  return raw.map(mapTechStack);
}

// ===========================================================================
// FlowExecutions + FlowLogs — ประวัติการรัน Flow
// ===========================================================================
export async function getExecutions(flowDefinitionId: number): Promise<FlowExecution[]> {
  const raw = await fetchApi<FlowExecutionDtoRaw[]>(`/Flow/${flowDefinitionId}/executions`);
  return raw.map(mapExecution);
}

export async function createExecution(
  flowDefinitionId: number,
  data: { status: FlowExecutionStatus; note?: string },
  currentUserId: number
): Promise<FlowExecution> {
  const raw = await fetchApi<FlowExecutionDtoRaw>(`/Flow/${flowDefinitionId}/executions?userId=${currentUserId}`, {
    method: "POST",
    body: JSON.stringify({
      status: data.status,
      note: data.note,
      finishedDate: data.status === "RUNNING" ? null : new Date().toISOString(),
    }),
  });
  return mapExecution(raw);
}

export function deleteExecution(flowExecutionId: number): Promise<void> {
  return fetchApi<void>(`/Flow/executions/${flowExecutionId}`, { method: "DELETE" });
}

export async function addLog(
  flowExecutionId: number,
  logLevel: FlowLogLevel,
  message: string
): Promise<FlowLog> {
  const raw = await fetchApi<FlowLogDtoRaw>(`/Flow/executions/${flowExecutionId}/logs`, {
    method: "POST",
    body: JSON.stringify({ logLevel, message }),
  });
  return mapLog(raw);
}
