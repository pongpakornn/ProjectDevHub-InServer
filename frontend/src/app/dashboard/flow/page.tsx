"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import FlowHeaderBanner from "./components/flow-header-banner";
import FlowProjectCard from "./components/flow-project-card";
import FlowCreateModal from "./components/flow-create-modal";
import { FlowListItem } from "@/types/flow";
import { getFlows, createFlow } from "@/lib/flow-api";

// TODO: ยังไม่มี Auth Context ผูก User จริง — ใช้ userId ของ Admin ทดสอบไปก่อน (userId=1)
const CURRENT_USER_ID = 1;

export default function FlowListPage() {
  const [flows, setFlows] = useState<FlowListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const loadFlows = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await getFlows();
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

  const handleCreateFlow = async (data: Parameters<typeof createFlow>[0]) => {
    try {
      await createFlow(data, CURRENT_USER_ID);
      await loadFlows();
    } catch (err) {
      console.error(err);
      alert("สร้าง Flow ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    }
  };

  const avgProgress = Math.round(
    flows.reduce((acc, p) => acc + p.progress, 0) / (flows.length || 1)
  );

  return (
    <div className="w-full select-none space-y-6">
      <FlowHeaderBanner totalProjects={flows.length} avgProgress={avgProgress} />

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_4px_12px_rgba(79,70,229,0.25)] text-xs font-bold px-4 py-2 h-[38px] rounded-lg flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          สร้าง Flow ใหม่
        </button>
      </div>

      {isLoading ? (
        <div className="w-full py-20 text-center text-slate-500 text-xs font-medium">กำลังโหลดรายการ Flow...</div>
      ) : loadError ? (
        <div className="w-full py-20 text-center text-red-500 text-xs font-medium">{loadError}</div>
      ) : flows.length === 0 ? (
        <div className="w-full py-20 text-center text-slate-400 text-xs font-medium">
          ยังไม่มี Flow — กดปุ่ม &quot;สร้าง Flow ใหม่&quot; เพื่อเริ่มต้น
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {flows.map((p) => (
            <FlowProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}

      <FlowCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateFlow}
      />
    </div>
  );
}
