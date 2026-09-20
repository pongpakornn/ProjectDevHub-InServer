// พอร์ตมาจาก AutoFlowStudio_ModulesD (src/types/workflow.ts) — ปรับให้ตรงกับ Flow.FlowDiagramRows ฝั่ง Backend
// 6 ประเภทไดอะแกรม: System Flowchart, Use Case, DFD, Sequence, ERD, State Machine

export type FlowDiagramType =
  | "FLOWCHART"
  | "USECASE"
  | "DFD"
  | "SEQUENCE"
  | "ERD"
  | "STATE";

export interface FlowDiagramColumn {
  key: keyof FlowDiagramRow;
  label: string;
  placeholder: string;
  width?: string;
  type?: "text" | "select";
  options?: string[];
}

export interface FlowDiagramTypeMeta {
  id: FlowDiagramType;
  title: string;
  subtitle: string;
  description: string;
  columns: FlowDiagramColumn[];
}

// id เป็น Client-side key เท่านั้น (ใช้ react key/duplicate) — ถ้าโหลดมาจาก Backend จะใส่ dbId ไว้แทน
export interface FlowDiagramRow {
  id: string;
  dbId?: number;
  stepNo: string;
  actor: string;
  action: string;
  dataField: string;
  decision: string;
  nextStep: string;
  optionValue?: string;
}

export interface FlowDiagramProjectMeta {
  projectName: string;
  owner: string;
  systemType: string;
  moduleList: string;
}

export type DfdLevel = "context" | "level0" | "level1";

export interface FlowDiagramOptions {
  dfdLevel: DfdLevel;
}

export interface FlowDiagramValidationIssue {
  rowIndex: number;
  field: keyof FlowDiagramRow;
  message: string;
  severity: "error" | "warning";
}

export type FlowDiagramRowsByType = Record<FlowDiagramType, FlowDiagramRow[]>;

export interface FlowDiagramResult {
  code: string;
  error: string | null;
}
