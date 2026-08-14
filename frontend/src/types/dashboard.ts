export interface StatItem {
  id: string;
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
  color?: string;
}

export interface ProjectProgress {
  id: string;
  name: string;
  progress: number;
  status: 'completed' | 'in_progress';
  startDate?: string;
  endDate?: string;
}

export interface YearlyTimelineProject {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: 'completed' | 'in_progress';
  startMonth: number; // 1-12
  endMonth: number;   // 1-12
}