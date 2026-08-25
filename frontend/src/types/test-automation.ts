export type TestEnvironment = "DEV" | "SIT" | "UAT" | "PROD";
export type TestTool = "playwright" | "cypress" | "vitest" | "jest" | "robot";
export type TestStatus = "passed" | "failed" | "partial" | "skipped";

export interface TestRunItem {
  id: string | number;
  suiteName: string;
  subText?: string;
  projectName: string;
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
}