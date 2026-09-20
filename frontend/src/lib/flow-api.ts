// frontend/src/lib/flow-api.ts
// เชื่อมต่อ Backend จริง (FlowController) — mirror จาก project-team-api.ts
import { fetchApi } from "@/lib/api-client";
import { FlowListItem, FlowDetail, FlowStatus, FlowWorkType } from "@/types/flow";

export interface FlowDefinitionDtoRaw {
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

export interface FlowDefinitionDetailDtoRaw {
  flow: FlowDefinitionDtoRaw;
}

// ===========================================================================
// Status / WorkType mapping (Backend Code <-> Thai Label)
// ===========================================================================
function mapFlowStatus(status: string): FlowStatus {
  if (status === "COMPLETED") return "เสร็จแล้ว";
  if (status === "IN_PROGRESS") return "กำลังทำ";
  return "วางแผน";
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

export function mapListItem(raw: FlowDefinitionDtoRaw): FlowListItem {
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
    ownerName: raw.createdByName || "",
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
  return mapListItem(raw.flow);
}

export function deleteFlow(flowDefinitionId: number, currentUserId: number): Promise<void> {
  return fetchApi<void>(`/Flow/${flowDefinitionId}?userId=${currentUserId}`, { method: "DELETE" });
}

// ===========================================================================
// FlowDiagramRows — Workflow Diagram Studio (พอร์ตมาจาก AutoFlowStudio_ModulesD)
// ===========================================================================
import type {
  FlowDiagramRow,
  FlowDiagramRowsByType,
  FlowDiagramType,
} from "@/types/flow-diagram";
import { FLOW_DIAGRAM_TYPES, uid } from "@/lib/flow-diagram-templates";

interface FlowDiagramRowDtoRaw {
  flowDiagramRowId: number;
  stepNo: string;
  actor: string;
  action: string;
  dataField: string;
  decision: string;
  nextStep: string;
  optionValue?: string | null;
}

interface FlowDiagramDataDtoRaw {
  systemType?: string | null;
  moduleList?: string | null;
  dfdLevel: string;
  rowsByType: Record<string, FlowDiagramRowDtoRaw[]>;
}

export interface FlowDiagramMeta {
  systemType: string;
  moduleList: string;
  dfdLevel: "context" | "level0" | "level1";
}

export interface FlowDiagramData extends FlowDiagramMeta {
  rows: FlowDiagramRowsByType;
}

function mapDiagramRow(raw: FlowDiagramRowDtoRaw): FlowDiagramRow {
  return {
    id: uid(),
    dbId: raw.flowDiagramRowId,
    stepNo: raw.stepNo,
    actor: raw.actor,
    action: raw.action,
    dataField: raw.dataField,
    decision: raw.decision,
    nextStep: raw.nextStep,
    optionValue: raw.optionValue ?? undefined,
  };
}

export async function getFlowDiagramData(flowDefinitionId: number): Promise<FlowDiagramData> {
  const raw = await fetchApi<FlowDiagramDataDtoRaw>(`/Flow/${flowDefinitionId}/diagram`);
  const rows = Object.fromEntries(
    FLOW_DIAGRAM_TYPES.map((f) => [f.id, (raw.rowsByType[f.id] ?? []).map(mapDiagramRow)]),
  ) as FlowDiagramRowsByType;

  return {
    systemType: raw.systemType ?? "",
    moduleList: raw.moduleList ?? "",
    dfdLevel: (raw.dfdLevel as FlowDiagramMeta["dfdLevel"]) || "level0",
    rows,
  };
}

export async function saveFlowDiagramRows(
  flowDefinitionId: number,
  diagramType: FlowDiagramType,
  rows: FlowDiagramRow[],
  currentUserId: number,
): Promise<FlowDiagramRow[]> {
  const raw = await fetchApi<FlowDiagramRowDtoRaw[]>(
    `/Flow/${flowDefinitionId}/diagram-rows?userId=${currentUserId}`,
    {
      method: "PUT",
      body: JSON.stringify({
        diagramType,
        rows: rows.map((r) => ({
          stepNo: r.stepNo,
          actor: r.actor,
          action: r.action,
          dataField: r.dataField,
          decision: r.decision,
          nextStep: r.nextStep,
          optionValue: r.optionValue,
        })),
      }),
    },
  );
  return raw.map(mapDiagramRow);
}

export async function updateFlowMeta(
  flowDefinitionId: number,
  meta: Partial<FlowDiagramMeta>,
  currentUserId: number,
): Promise<void> {
  await fetchApi<FlowDefinitionDtoRaw>(`/Flow/${flowDefinitionId}/meta?userId=${currentUserId}`, {
    method: "PUT",
    body: JSON.stringify({
      systemType: meta.systemType,
      moduleList: meta.moduleList,
      dfdLevel: meta.dfdLevel,
    }),
  });
}
