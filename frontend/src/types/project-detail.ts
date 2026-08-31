export interface TaskAssignee {
  userId: number;
  fullName: string;
}

export interface TaskItem {
  id: string;
  title: string;
  detail: string;
  completed: boolean;
  // เฉพาะ Team — ผู้รับผิดชอบงาน (Join Project.TaskAssignees + Core.Users) ฝั่ง Solo จะเป็น undefined เสมอ
  assignees?: TaskAssignee[];
}

export interface Phase {
  id: string;
  name: string;
  owner: string;
  startDate: string;
  endDate: string;
  status: "Done" | "In Progress" | "Not Started";
  items: TaskItem[];
  isExpanded?: boolean;
}

export interface StackItem {
  id: string;
  type: string;
  name: string;
  version: string;
  layer: string;
}

export interface WorkItem {
  id: string;
  title: string;
  description: string;
  flowDescription: string;
  imageUrl: string;
  date: string;
}