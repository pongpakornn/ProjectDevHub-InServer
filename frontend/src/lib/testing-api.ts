// frontend/src/lib/testing-api.ts
// เชื่อมต่อ Backend จริง (TestingController) — mirror จาก flow-api.ts
import { fetchApi } from "@/lib/api-client";
import { getProjects as getSoloProjects } from "@/lib/project-solo-api";
import { getProjects as getTeamProjects } from "@/lib/project-team-api";
import { TestRunItem, TestEnvironment, TestStatus, TestTool } from "@/types/test-automation";

interface TestRunDtoRaw {
  testRunId: number;
  testSuiteId: number;
  suiteName: string;
  projectId: number;
  projectName: string;
  tool: string;
  environment: string;
  runDate: string;
  totalCases: number;
  passedCases: number;
  failedCases: number;
  skippedCases: number;
  durationSeconds: number;
  status: string;
  reportUrl?: string | null;
  note?: string | null;
}

export interface ProjectOption {
  id: number;
  name: string;
}

// รวมรายชื่อโปรเจกต์ Solo + Team เข้าด้วยกัน — ใช้กับ Dropdown เลือกโปรเจกต์ในฟอร์มบันทึกผลทดสอบ
export async function getProjectOptions(): Promise<ProjectOption[]> {
  const [soloProjects, teamProjects] = await Promise.all([getSoloProjects(), getTeamProjects()]);
  return [
    ...soloProjects.map((p) => ({ id: p.id, name: p.name })),
    ...teamProjects.map((p) => ({ id: p.id, name: p.name })),
  ];
}

function mapTestRun(raw: TestRunDtoRaw): TestRunItem {
  return {
    id: raw.testRunId,
    suiteName: raw.suiteName,
    subText: raw.note ? raw.note.slice(0, 30) : undefined,
    projectId: raw.projectId,
    projectName: raw.projectName,
    tool: raw.tool as TestTool,
    environment: raw.environment as TestEnvironment,
    runDate: raw.runDate,
    totalCases: raw.totalCases,
    passedCases: raw.passedCases,
    failedCases: raw.failedCases,
    skippedCases: raw.skippedCases,
    durationSeconds: raw.durationSeconds,
    status: raw.status as TestStatus,
    reportUrl: raw.reportUrl || undefined,
    note: raw.note || undefined,
  };
}

function toRunBody(data: {
  projectId: number;
  suiteName: string;
  tool: TestTool;
  environment: TestEnvironment;
  runDate: string;
  totalCases: number;
  passedCases: number;
  failedCases: number;
  skippedCases: number;
  durationSeconds: number;
  status: TestStatus;
  reportUrl?: string;
  note?: string;
}) {
  return {
    projectId: data.projectId,
    suiteName: data.suiteName,
    tool: data.tool,
    environment: data.environment,
    runDate: data.runDate,
    totalCases: data.totalCases,
    passedCases: data.passedCases,
    failedCases: data.failedCases,
    skippedCases: data.skippedCases,
    durationSeconds: data.durationSeconds,
    status: data.status,
    reportUrl: data.reportUrl || null,
    note: data.note || null,
  };
}

export async function getTestRuns(): Promise<TestRunItem[]> {
  const raw = await fetchApi<TestRunDtoRaw[]>("/Testing/runs");
  return raw.map(mapTestRun);
}

export async function createTestRun(
  data: Parameters<typeof toRunBody>[0],
  currentUserId: number
): Promise<TestRunItem> {
  const raw = await fetchApi<TestRunDtoRaw>(`/Testing/runs?userId=${currentUserId}`, {
    method: "POST",
    body: JSON.stringify(toRunBody(data)),
  });
  return mapTestRun(raw);
}

export async function updateTestRun(
  testRunId: number,
  data: Parameters<typeof toRunBody>[0],
  currentUserId: number
): Promise<TestRunItem> {
  const raw = await fetchApi<TestRunDtoRaw>(`/Testing/runs?userId=${currentUserId}`, {
    method: "PUT",
    body: JSON.stringify({ testRunId, ...toRunBody(data) }),
  });
  return mapTestRun(raw);
}

export function deleteTestRun(testRunId: number): Promise<void> {
  return fetchApi<void>(`/Testing/runs/${testRunId}`, { method: "DELETE" });
}
