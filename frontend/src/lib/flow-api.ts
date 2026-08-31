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

function mapFlowStatusToBackend(status: FlowStatus): string {
  if (status === "เสร็จแล้ว") return "COMPLETED";
  if (status === "กำลังทำ") return "IN_PROGRESS";
  return "PLANNING";
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

function mapWorkTypeToBackend(workType: FlowWorkType): string {
  return workType === "ทำกับทีม" ? "TEAM" : "SOLO";
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

function toIsoDate(dateStr?: string | null): string | null {
  if (!dateStr || dateStr === "-") return null;
  const match = dateStr.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
  if (match) {
    const [, d, m, y] = match;
    return `${y}-${m}-${d}`;
  }
  return dateStr;
}

function mapListItem(raw: FlowDefinitionDtoRaw): FlowListItem {
  return {
    id: String(raw.flowDefinitionId),
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
export async function getFlows(): Promise<FlowListItem[]> {
  const raw = await fetchApi<FlowDefinitionDtoRaw[]>("/Flow");
  return raw.map(mapListItem);
}

export async function getFlowDetail(flowDefinitionId: number): Promise<FlowDetail> {
  const raw = await fetchApi<FlowDefinitionDetailDtoRaw>(`/Flow/${flowDefinitionId}`);
  return {
    ...mapListItem(raw.flow),
    techStacks: raw.techStacks.map(mapTechStack),
    phases: raw.steps.map(mapStep),
  };
}

export async function createFlow(
  data: {
    name: string;
    description: string;
    status: FlowStatus;
    workType: FlowWorkType;
    startDate: string;
    endDate: string;
  },
  currentUserId: number
): Promise<FlowListItem> {
  const raw = await fetchApi<FlowDefinitionDtoRaw>(`/Flow?userId=${currentUserId}`, {
    method: "POST",
    body: JSON.stringify({
      name: data.name,
      description: data.description,
      status: mapFlowStatusToBackend(data.status),
      workType: mapWorkTypeToBackend(data.workType),
      startDate: toIsoDate(data.startDate),
      endDate: toIsoDate(data.endDate),
    }),
  });
  return mapListItem(raw);
}

export async function updateFlow(
  flowDefinitionId: number,
  data: {
    name: string;
    description: string;
    status: FlowStatus;
    workType: FlowWorkType;
    startDate: string;
    endDate: string;
  }
): Promise<FlowListItem> {
  const raw = await fetchApi<FlowDefinitionDtoRaw>("/Flow", {
    method: "PUT",
    body: JSON.stringify({
      flowDefinitionId,
      name: data.name,
      description: data.description,
      status: mapFlowStatusToBackend(data.status),
      workType: mapWorkTypeToBackend(data.workType),
      startDate: toIsoDate(data.startDate),
      endDate: toIsoDate(data.endDate),
    }),
  });
  return mapListItem(raw);
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
