"use client";

// Flow Diagram — เปลี่ยนมาใช้ Workflow Diagram Studio (พอร์ตมาจาก AutoFlowStudio_ModulesD) แทนของเดิม
// (FlowDiagramSection/ArchitectureDiagramSection/FlowGanttQaSections ยังอยู่ในโปรเจกต์ แค่เลิกใช้ในหน้านี้)
import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import FlowDetailHeader from "@/components/flow/flow-detail-header";
import FlowDiagramStudio from "@/components/flow/flow-diagram-studio";
import { FlowDetail } from "@/types/flow";
import { getFlowDetail } from "@/lib/flow-api";
import { getStoredUser } from "@/lib/session";
import { useSystemPermissions } from "@/hooks/use-system-permissions";

// TODO: ยังไม่มี Auth Context ผูก User จริง — ใช้ userId ของ Admin ทดสอบไปก่อน (userId=1) ถ้ายังไม่ได้ล็อกอิน
const CURRENT_USER_ID = getStoredUser()?.userId ?? 1;

export default function FlowProjectDetailPage() {
  const params = useParams();
  const permissions = useSystemPermissions("FLOW");
  const flowDefinitionId = Number(params?.id);

  const [flow, setFlow] = useState<FlowDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadFlowDetail = useCallback(async () => {
    if (!flowDefinitionId) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const detail = await getFlowDetail(flowDefinitionId, CURRENT_USER_ID);
      setFlow(detail);
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
        progress={flow.progress}
      />

      <FlowDiagramStudio
        flowDefinitionId={flowDefinitionId}
        projectName={flow.name}
        ownerNameDefault={flow.ownerName}
        currentUserId={CURRENT_USER_ID}
        canAdd={permissions.canAdd}
        canEdit={permissions.canEdit}
        canDelete={permissions.canDelete}
      />
    </div>
  );
}
