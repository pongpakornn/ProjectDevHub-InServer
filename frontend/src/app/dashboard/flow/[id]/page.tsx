"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import FlowDetailHeader from "@/components/flow/flow-detail-header";
import FlowDiagramSection from "@/components/flow/flow-diagram-section";
import ArchitectureDiagramSection from "@/components/flow/architecture-diagram-section";
import FlowGanttQaSections from "@/components/flow/flow-gantt-qa-sections";
import { FlowDetail, FlowStep, FlowTechStackTag, FlowExecution } from "@/types/flow";
import { getFlowDetail, getExecutions } from "@/lib/flow-api";

// TODO: ยังไม่มี Auth Context ผูก User จริง — ใช้ userId ของ Admin ทดสอบไปก่อน (userId=1)
const CURRENT_USER_ID = 1;

export default function FlowProjectDetailPage() {
  const params = useParams();
  const flowDefinitionId = Number(params?.id);

  const [flow, setFlow] = useState<FlowDetail | null>(null);
  const [phases, setPhases] = useState<FlowStep[]>([]);
  const [techStacks, setTechStacks] = useState<FlowTechStackTag[]>([]);
  const [executions, setExecutions] = useState<FlowExecution[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadFlowDetail = useCallback(async () => {
    if (!flowDefinitionId) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const [detail, executionList] = await Promise.all([
        getFlowDetail(flowDefinitionId),
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
