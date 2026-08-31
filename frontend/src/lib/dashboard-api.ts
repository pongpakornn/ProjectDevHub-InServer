// frontend/src/lib/dashboard-api.ts
import { fetchApi } from "@/lib/api-client";
import { DashboardSummary } from "@/types/dashboard";

export function getDashboardSummary(): Promise<DashboardSummary> {
  return fetchApi<DashboardSummary>("/Dashboard/summary");
}
