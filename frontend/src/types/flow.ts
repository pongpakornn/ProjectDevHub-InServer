// ตรงกับ FlowDefinitionDto / FlowStepDto / FlowTechStackDto / FlowExecutionDto / FlowLogDto ฝั่ง Backend
// Status/WorkType แสดงเป็น Label ภาษาไทยฝั่ง Frontend (แปลงที่ lib/flow-api.ts) เพื่อให้ตรงกับ UI เดิม

export type FlowStatus = "เสร็จแล้ว" | "กำลังทำ" | "วางแผน";
export type FlowStepStatus = "เสร็จแล้ว" | "กำลังทำ" | "รอดำเนินการ";
export type FlowWorkType = "ทำคนเดียว" | "ทำกับทีม";
export type FlowTechLayer = "FRONTEND" | "BACKEND" | "DATABASE";
export type FlowExecutionStatus = "RUNNING" | "SUCCESS" | "FAILED";
export type FlowLogLevel = "INFO" | "WARN" | "ERROR";

export interface FlowStep {
  id: string;
  stepNo: string;
  title: string;
  status: FlowStepStatus;
  progress: number;
  startDate?: string; // ISO "YYYY-MM-DD" — ใช้ทำ Gantt
  endDate?: string;
}

export interface FlowTechStackTag {
  id: string;
  layer: FlowTechLayer;
  name: string;
}

export interface FlowListItem {
  id: string; // FlowDefinitionId
  flowCode: string;
  name: string;
  description: string;
  status: FlowStatus;
  startDate: string; // "DD/MM/YYYY" หรือ "-"
  endDate: string;
  workType: FlowWorkType;
  progress: number;
}

export interface FlowDetail extends FlowListItem {
  techStacks: FlowTechStackTag[];
  phases: FlowStep[];
}

export interface FlowLog {
  id: string;
  logLevel: FlowLogLevel;
  message: string;
  loggedDate: string;
}

export interface FlowExecution {
  id: string;
  status: FlowExecutionStatus;
  startedDate: string;
  finishedDate?: string;
  triggeredByName: string;
  note?: string;
  logs: FlowLog[];
}
