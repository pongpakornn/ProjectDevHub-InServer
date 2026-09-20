// ตรงกับ FlowDefinitionDto ฝั่ง Backend
// Status/WorkType แสดงเป็น Label ภาษาไทยฝั่ง Frontend (แปลงที่ lib/flow-api.ts) เพื่อให้ตรงกับ UI เดิม

export type FlowStatus = "เสร็จแล้ว" | "กำลังทำ" | "วางแผน";
export type FlowWorkType = "ทำคนเดียว" | "ทำกับทีม";

export interface FlowListItem {
  id: string; // FlowDefinitionId
  projectId: number | null; // ผูก 1:1 กับ Project.Projects (Solo/Team) — null เฉพาะ Flow เก่าก่อนรอบผูก 1:1
  flowCode: string;
  name: string;
  description: string;
  status: FlowStatus;
  startDate: string; // "DD/MM/YYYY" หรือ "-"
  endDate: string;
  workType: FlowWorkType;
  progress: number;
  ownerName: string; // ผู้สร้าง Flow (Project Owner/Creator) — ใช้เป็นค่าเริ่มต้นของ Owner ใน Diagram Studio
}

export type FlowDetail = FlowListItem;
