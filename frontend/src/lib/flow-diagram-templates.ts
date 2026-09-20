// พอร์ตมาจาก AutoFlowStudio_ModulesD (src/utils/flowTemplates.ts) — คอลัมน์/Label ของแต่ละประเภทไดอะแกรม
// ตัด defaultRows/defaultMeta/STORAGE_KEY ออก เพราะโปรเจกต์นี้ Persist ผ่าน Backend จริง ไม่ใช้ LocalStorage
import type { FlowDiagramRow, FlowDiagramType, FlowDiagramTypeMeta } from "@/types/flow-diagram";

export const uid = () => Math.random().toString(36).slice(2, 10);

const baseColumns = (labels: Partial<Record<keyof FlowDiagramRow, string>> = {}): FlowDiagramTypeMeta["columns"] => [
  { key: "stepNo", label: labels.stepNo ?? "Step", placeholder: "1", width: "w-20" },
  { key: "actor", label: labels.actor ?? "Actor", placeholder: "User" },
  { key: "action", label: labels.action ?? "Action", placeholder: "Do something" },
  { key: "dataField", label: labels.dataField ?? "Data", placeholder: "Payload / Fields" },
  { key: "decision", label: labels.decision ?? "Decision", placeholder: "Valid?" },
  { key: "nextStep", label: labels.nextStep ?? "Next", placeholder: "2" },
];

export const FLOW_DIAGRAM_TYPES: FlowDiagramTypeMeta[] = [
  {
    id: "FLOWCHART",
    title: "System Flowchart",
    subtitle: "Business Logic & Operation Flow",
    description: "ลำดับการทำงานของระบบพร้อมจุดตัดสินใจ",
    columns: baseColumns(),
  },
  {
    id: "USECASE",
    title: "Use Case Diagram",
    subtitle: "Actors vs Actions",
    description: "ความสัมพันธ์ระหว่างผู้ใช้งานกับความสามารถของระบบ",
    columns: baseColumns({ action: "Use Case", dataField: "Precondition", decision: "Include / Extend", nextStep: "System" }),
  },
  {
    id: "DFD",
    title: "Data Flow Diagram",
    subtitle: "Context, Level 0, Level 1",
    description: "การไหลของข้อมูลระหว่าง Process, Entity และ Data Store",
    columns: baseColumns({ actor: "Source", action: "Process", dataField: "Data Flow", decision: "Data Store", nextStep: "Destination" }),
  },
  {
    id: "SEQUENCE",
    title: "Sequence Diagram",
    subtitle: "Frontend → Controller → Service → Database",
    description: "ลำดับการเรียกข้ามชั้นของสถาปัตยกรรม",
    columns: baseColumns({ actor: "From", nextStep: "To", action: "Message", dataField: "Payload", decision: "Response" }),
  },
  {
    id: "ERD",
    title: "Entity Relationship",
    subtitle: "Database Schema, PK / FK",
    description: "ตาราง คอลัมน์ และความสัมพันธ์ในฐานข้อมูล",
    columns: [
      ...baseColumns({ stepNo: "No.", actor: "Table", action: "Columns", dataField: "Primary Key", decision: "Foreign Key", nextStep: "Relates To" }),
      {
        key: "optionValue",
        label: "Cardinality",
        placeholder: "1-to-many",
        width: "w-36",
        type: "select",
        options: ["1-to-many", "1-to-1", "many-to-many", "0-to-many"],
      },
    ],
  },
  {
    id: "STATE",
    title: "State Machine",
    subtitle: "Status Lifecycle",
    description: "การเปลี่ยนสถานะของเอกสารหรือรายการงาน",
    columns: baseColumns({ actor: "From State", nextStep: "To State", action: "Trigger", dataField: "Guard", decision: "Note" }),
  },
];

export const FLOW_DIAGRAM_TYPE_MAP = Object.fromEntries(
  FLOW_DIAGRAM_TYPES.map((f) => [f.id, f]),
) as Record<FlowDiagramType, FlowDiagramTypeMeta>;

export const emptyDiagramRow = (step: string | number = ""): FlowDiagramRow => ({
  id: uid(),
  stepNo: String(step),
  actor: "",
  action: "",
  dataField: "",
  decision: "",
  nextStep: "",
});
