"use client";

import React, { useCallback, useEffect, useState } from "react";
import FlowHeaderBanner from "./components/flow-header-banner";
import FlowProjectCard from "./components/flow-project-card";
import { FlowListItem } from "@/types/flow";
import { getFlows } from "@/lib/flow-api";
import { getStoredUser } from "@/lib/session";

// TODO: ยังไม่มี Auth Context ผูก User จริง — ใช้ userId ของ Admin ทดสอบไปก่อน (userId=1) ถ้ายังไม่ได้ล็อกอิน
const CURRENT_USER_ID = getStoredUser()?.userId ?? 1;

export default function FlowListPage() {
  const [flows, setFlows] = useState<FlowListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadFlows = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await getFlows(CURRENT_USER_ID);
      setFlows(data);
    } catch (err) {
      console.error(err);
      setLoadError("ไม่สามารถโหลดรายการ Flow ได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFlows();
  }, [loadFlows]);

  const avgProgress = Math.round(
    flows.reduce((acc, p) => acc + p.progress, 0) / (flows.length || 1)
  );

  return (
    <div className="w-full select-none space-y-6">
      <FlowHeaderBanner totalProjects={flows.length} avgProgress={avgProgress} />

      {isLoading ? (
        <div className="w-full py-20 text-center text-slate-500 text-xs font-medium">กำลังโหลดรายการ Flow...</div>
      ) : loadError ? (
        <div className="w-full py-20 text-center text-red-500 text-xs font-medium">{loadError}</div>
      ) : flows.length === 0 ? (
        <div className="w-full py-20 text-center text-slate-400 text-xs font-medium">
          ยังไม่มีโปรเจกต์ Solo/Team ในระบบ — สร้างโปรเจกต์ที่หน้า Solo หรือ Team ก่อน ระบบจะสร้าง Flow ให้อัตโนมัติ
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {flows.map((p) => (
            <FlowProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}
