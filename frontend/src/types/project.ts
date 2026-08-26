
export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface Phase {
  id: string;
  name: string;
  status: "Done" | "In Progress" | "Not Started";
  items?: TaskItem[];
}

export interface SoloProject {
  id: number | string;
  name: string;
  description: string;
  projectType?: string;
  department?: string;
  owner: string;
  requester?: string;
  priority: "ปกติ" | "สูง";
  status: "เสร็จแล้ว" | "กำลังทำ" | "Planning";
  startDate: string;
  plannedEndDate?: string;
  actualEndDate?: string;
  endDate: string;
  progress: number; // Dynamic calculated percentage
  phases?: Phase[]; // ใช้เก็บรายการ Phase/Task ย่อยภายใน
  language?: string;
  framework?: string;
  library?: string;
  database?: string;
  apiService?: string;
  otherTech?: string;
}

export interface CreateProjectFormData {
  name: string;
  description: string;
  projectType: string;
  department: string;
  owner: string;
  requester: string;
  priority: "ปกติ" | "สูง";
  status: "เสร็จแล้ว" | "กำลังทำ" | "Planning";
  startDate: string;
  plannedEndDate: string;
  actualEndDate: string;
  // ตัด progress ออก เพื่อไม่ให้กรอก Manual
  language: string;
  framework: string;
  library: string;
  database: string;
  apiService: string;
  otherTech: string;
}