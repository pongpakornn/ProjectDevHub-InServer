// frontend/src/lib/dashboard-api.ts
import { fetchApi } from "@/lib/api-client";
import { DashboardSummary } from "@/types/dashboard";

// ★ Data Isolation: ต้องส่ง userId เสมอ — Backend Filter สถิติ/การ์ดให้เห็นเฉพาะโปรเจกต์ที่เข้าถึงได้เท่านั้น
export function getDashboardSummary(userId: number): Promise<DashboardSummary> {
  return fetchApi<DashboardSummary>(`/Dashboard/summary?userId=${userId}`);
}
