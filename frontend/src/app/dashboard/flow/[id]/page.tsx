"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import FlowDetailHeader from "@/components/flow/flow-detail-header";
import FlowDiagramSection from "@/components/flow/flow-diagram-section";
import ArchitectureDiagramSection from "@/components/flow/architecture-diagram-section";
import FlowGanttQaSections from "@/components/flow/flow-gantt-qa-sections";
import { GitBranch } from "lucide-react";
import { FlowDetail, FlowStep, FlowTechStackTag, FlowExecution } from "@/types/flow";
import { getFlowDetail, getExecutions, autoGenerateSteps, autoGenerateTechStacks } from "@/lib/flow-api";
import { useToast } from "@/lib/toast-context";
import { getStoredUser } from "@/lib/session";

// TODO: ยังไม่มี Auth Context ผูก User จริง — ใช้ userId ของ Admin ทดสอบไปก่อน (userId=1) ถ้ายังไม่ได้ล็อกอิน
const CURRENT_USER_ID = getStoredUser()?.userId ?? 1;

export default function FlowProjectDetailPage() {
  const params = useParams();
  const toast = useToast();
  const flowDefinitionId = Number(params?.id);

  const [flow, setFlow] = useState<FlowDetail | null>(null);
  const [phases, setPhases] = useState<FlowStep[]>([]);
  const [techStacks, setTechStacks] = useState<FlowTechStackTag[]>([]);
  const [executions, setExecutions] = useState<FlowExecution[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const loadFlowDetail = useCallback(async () => {
    if (!flowDefinitionId) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const [detail, executionList] = await Promise.all([
        getFlowDetail(flowDefinitionId, CURRENT_USER_ID),
        getExecutions(flowDefinitionId),
      ]);
      setFlow(detail);
      setPhases(detail.phases);
      setTechStacks(detail.techStacks);
      setExecutions(executionList);
    } catch (err) {
      console.error(err);
      setLoadError("ไม่สามารถโหลดข้อมูล Flow ได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  }, [flowDefinitionId]);

  useEffect(() => {
    loadFlowDetail();
  }, [loadFlowDetail]);

  const handleGenerateFromProject = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const [newPhases, newTechStacks] = await Promise.all([
        autoGenerateSteps(flowDefinitionId),
        autoGenerateTechStacks(flowDefinitionId),
      ]);
      setPhases(newPhases);
      setTechStacks(newTechStacks);
      toast.success("Generate Flow สำเร็จ", "สร้าง Flow Diagram และ Architecture จากข้อมูลโปรเจกต์เรียบร้อยแล้ว");
    } catch (err) {
      console.error("Generate Flow จากข้อมูลโปรเจกต์ไม่สำเร็จ", err);
      toast.error(
        "Generate Flow ไม่สำเร็จ",
        err instanceof Error ? err.message : "กรุณาลองใหม่อีกครั้ง"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return <div className="w-full py-20 text-center text-slate-500 text-xs font-medium">กำลังโหลดข้อมูล Flow...</div>;
  }

  if (loadError || !flow) {
    return (
      <div className="w-full py-20 text-center text-red-500 text-xs font-medium">
        {loadError || "ไม่พบ Flow นี้"}
      </div>
    );
  }

  return (
    <div className="w-full select-none space-y-6">
      <FlowDetailHeader
        name={flow.name}
        status={flow.status}
        startDate={flow.startDate}
        endDate={flow.endDate}
        workType={flow.workType}
      />

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleGenerateFromProject}
          disabled={isGenerating}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5"
        >
          <GitBranch className="w-3.5 h-3.5" />
          {isGenerating ? "กำลัง Generate..." : "Generate จากข้อมูลโปรเจกต์"}
        </button>
      </div>

      <FlowDiagramSection
        flowDefinitionId={flowDefinitionId}
        phases={phases}
        setPhases={setPhases}
      />

      <ArchitectureDiagramSection
        flowDefinitionId={flowDefinitionId}
        techStacks={techStacks}
        setTechStacks={setTechStacks}
      />

      <FlowGanttQaSections
        flowDefinitionId={flowDefinitionId}
        phases={phases}
        executions={executions}
        setExecutions={setExecutions}
        currentUserId={CURRENT_USER_ID}
      />
    </div>
  );
}
