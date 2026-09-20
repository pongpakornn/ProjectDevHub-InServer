// path: app/dashboard/visitor/[userId]/flow/[projectId]/page.tsx
// Visitor Mode — ดู Flow Diagram ของโปรเจกต์คนอื่นแบบอ่านอย่างเดียว (canAdd/canEdit/canDelete ปิดหมด)
"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import FlowDetailHeader from "@/components/flow/flow-detail-header";
import FlowDiagramStudio from "@/components/flow/flow-diagram-studio";
import { FlowDetail } from "@/types/flow";
import { getUserProjectFlow } from "@/lib/visitor-api";
import { getStoredUser } from "@/lib/session";

// TODO: ยังไม่มี Auth Context ผูก User จริง — ใช้ userId ของ Admin ทดสอบไปก่อน (userId=1) ถ้ายังไม่ได้ล็อกอิน
const CURRENT_USER_ID = getStoredUser()?.userId ?? 1;

export default function VisitorProjectFlowPage() {
  const params = useParams();
  const targetUserId = Number(params?.userId);
  const projectId = Number(params?.projectId);

  const [flow, setFlow] = useState<FlowDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadFlow = useCallback(async () => {
    if (!projectId || !targetUserId) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const detail = await getUserProjectFlow(projectId, targetUserId, CURRENT_USER_ID);
      if (!detail) {
        setLoadError("โปรเจกต์นี้ยังไม่มี Flow");
        return;
      }
      setFlow(detail);
    } catch (err) {
      console.error(err);
      setLoadError("ไม่สามารถโหลดข้อมูล Flow ได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  }, [projectId, targetUserId]);

  useEffect(() => {
    loadFlow();
  }, [loadFlow]);

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
        backHref={`/dashboard/visitor/${targetUserId}`}
        backLabel="กลับไปดูโปรเจกต์"
      />

      <FlowDiagramStudio
        flowDefinitionId={Number(flow.id)}
        projectName={flow.name}
        ownerNameDefault={flow.ownerName}
        currentUserId={CURRENT_USER_ID}
        canAdd={false}
        canEdit={false}
        canDelete={false}
      />
    </div>
  );
}
