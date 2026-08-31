"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import TestRunModal from "@/components/testing/test-run-modal";
import { TestRunItem } from "@/types/test-automation";
import TestingHeaderBanner from "@/components/testing/testing-header-banner";
import TestingStatsCards from "@/components/testing/testing-stats-cards";
import TestingChartsSection from "@/components/testing/testing-charts-section";
import TestingTableReport from "@/components/testing/testing-table-report";
import {
  getTestRuns,
  createTestRun,
  updateTestRun,
  deleteTestRun,
  getProjectOptions,
  ProjectOption,
} from "@/lib/testing-api";

// TODO: ยังไม่มี Auth Context ผูก User จริง — ใช้ userId ของ Admin ทดสอบไปก่อน (userId=1)
const CURRENT_USER_ID = 1;

export default function TestAutomationPage() {
  const [testRuns, setTestRuns] = useState<TestRunItem[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "view" | "edit">("create");
  const [selectedRun, setSelectedRun] = useState<TestRunItem | null>(null);
  const [selectedProjectFilter, setSelectedProjectFilter] = useState("all");

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [runs, projectOptions] = await Promise.all([getTestRuns(), getProjectOptions()]);
      setTestRuns(runs);
      setProjects(projectOptions);
    } catch (err) {
      console.error(err);
      setLoadError("ไม่สามารถโหลดข้อมูลผลทดสอบได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredRuns = useMemo(() => {
    if (selectedProjectFilter === "all") return testRuns;
    return testRuns.filter((r) => r.projectName === selectedProjectFilter);
  }, [testRuns, selectedProjectFilter]);

  const totalRuns = filteredRuns.length;
  const totalCases = filteredRuns.reduce((acc, curr) => acc + curr.totalCases, 0);
  const totalPassed = filteredRuns.reduce((acc, curr) => acc + curr.passedCases, 0);
  const totalFailed = filteredRuns.reduce((acc, curr) => acc + curr.failedCases, 0);

  const passRate = totalCases > 0 ? Math.round((totalPassed / totalCases) * 100) : 0;
  const failRate = totalCases > 0 ? 100 - passRate : 0;

  const projectStats = useMemo(() => {
    const statsMap: Record<string, { name: string; passed: number; failed: number; total: number }> = {};

    testRuns.forEach((run) => {
      if (!statsMap[run.projectName]) {
        statsMap[run.projectName] = { name: run.projectName, passed: 0, failed: 0, total: 0 };
      }
      statsMap[run.projectName].passed += run.passedCases;
      statsMap[run.projectName].failed += run.failedCases;
      statsMap[run.projectName].total += run.totalCases;
    });

    return Object.values(statsMap);
  }, [testRuns]);

  const handleOpenCreateModal = () => {
    setSelectedRun(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleOpenViewModal = (run: TestRunItem) => {
    setSelectedRun(run);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (run: TestRunItem) => {
    setSelectedRun(run);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleSaveRun = async (data: TestRunItem) => {
    const payload = {
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
      reportUrl: data.reportUrl,
      note: data.note,
    };

    try {
      if (modalMode === "edit" && typeof data.id === "number") {
        await updateTestRun(data.id, payload, CURRENT_USER_ID);
      } else {
        await createTestRun(payload, CURRENT_USER_ID);
      }
      await loadData();
    } catch (err) {
      console.error(err);
      alert("บันทึกผลทดสอบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm("คุณต้องการลบผลการทดสอบนี้ใช่หรือไม่?")) return;
    const prevRuns = testRuns;
    setTestRuns((prev) => prev.filter((item) => item.id !== id));
    try {
      await deleteTestRun(Number(id));
    } catch (err) {
      console.error(err);
      alert("ลบผลทดสอบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      setTestRuns(prevRuns);
    }
  };

  const projectOptions = useMemo(() => {
    const set = new Set(testRuns.map((r) => r.projectName));
    return Array.from(set);
  }, [testRuns]);

  if (isLoading) {
    return <div className="w-full py-20 text-center text-slate-500 text-xs font-medium">กำลังโหลดข้อมูลผลทดสอบ...</div>;
  }

  return (
    <div className="w-full space-y-6 select-none pb-12">
      <TestingHeaderBanner
        passRate={passRate}
        totalRuns={totalRuns}
        onOpenCreateModal={handleOpenCreateModal}
      />

      {loadError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
          {loadError}
        </div>
      )}

      <TestingStatsCards
        totalRuns={totalRuns}
        totalCases={totalCases}
        totalPassed={totalPassed}
        totalFailed={totalFailed}
      />

      <TestingChartsSection
        passRate={passRate}
        failRate={failRate}
        totalCases={totalCases}
        totalPassed={totalPassed}
        totalFailed={totalFailed}
        projectStats={projectStats}
      />

      <TestingTableReport
        runs={filteredRuns}
        selectedProjectFilter={selectedProjectFilter}
        projectOptions={projectOptions}
        onFilterChange={setSelectedProjectFilter}
        onView={handleOpenViewModal}
        onEdit={handleOpenEditModal}
        onDelete={handleDelete}
      />

      <TestRunModal
        isOpen={isModalOpen}
        mode={modalMode}
        initialData={selectedRun}
        projects={projects}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveRun}
      />
    </div>
  );
}
