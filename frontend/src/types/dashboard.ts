// ตรงกับ DashboardSummaryDto / DashboardProjectDto ฝั่ง Backend (DashboardController)
export interface DashboardProject {
  projectId: number;
  name: string;
  progress: number;
  status: "completed" | "in_progress";
  startDate?: string;
  endDate?: string;
}

export interface DashboardSummary {
  soloCount: number;
  teamCount: number;
  inProgressCount: number;
  completedCount: number;
  overallProgress: number;
  totalTestRuns: number;
  passRate: number;
  totalTestCases: number;
  totalDurationSeconds: number;
  projects: DashboardProject[];
}
