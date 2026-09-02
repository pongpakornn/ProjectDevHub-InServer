"use client";

import React, { useState } from "react";
import { GitBranch, Plus, X } from "lucide-react";
import { FlowStep, FlowStepStatus } from "@/types/flow";
import { createStep, deleteStep, updateStep } from "@/lib/flow-api";

interface FlowDiagramSectionProps {
  flowDefinitionId: number;
  phases: FlowStep[];
  setPhases: React.Dispatch<React.SetStateAction<FlowStep[]>>;
  currentUserId: number;
  canAdd?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

const stepBadgeStyle: Record<FlowStepStatus, string> = {
  "เสร็จแล้ว": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "กำลังทำ": "bg-amber-50 text-amber-700 border-amber-200",
  "รอดำเนินการ": "bg-slate-100 text-slate-500 border-slate-200",
};

const stepBarStyle: Record<FlowStepStatus, string> = {
  "เสร็จแล้ว": "bg-emerald-500",
  "กำลังทำ": "bg-amber-500",
  "รอดำเนินการ": "bg-slate-300",
};

const statusCycle: Record<FlowStepStatus, FlowStepStatus> = {
  "รอดำเนินการ": "กำลังทำ",
  "กำลังทำ": "เสร็จแล้ว",
  "เสร็จแล้ว": "รอดำเนินการ",
};

const progressForStatus: Record<FlowStepStatus, number> = {
  "รอดำเนินการ": 0,
  "กำลังทำ": 50,
  "เสร็จแล้ว": 100,
};

export default function FlowDiagramSection({
  flowDefinitionId,
  phases,
  setPhases,
  currentUserId,
  canAdd = true,
  canEdit = true,
  canDelete = true,
}: FlowDiagramSectionProps) {
  const [newTitle, setNewTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleAddStep = async () => {
    if (!newTitle.trim() || isSaving) return;
    setIsSaving(true);
    try {
      const stepNo = `STEP ${String(phases.length + 1).padStart(2, "0")}`;
      const created = await createStep(flowDefinitionId, {
        stepNo,
        title: newTitle.trim(),
        status: "รอดำเนินการ",
        progress: 0,
        sortOrder: phases.length + 1,
      }, currentUserId);
      setPhases([...phases, created]);
      setNewTitle("");
    } catch (err) {
      console.error("เพิ่ม Step ไม่สำเร็จ", err);
      alert("เพิ่ม Step ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCycleStatus = async (step: FlowStep) => {
    const nextStatus = statusCycle[step.status];
    const prevPhases = phases;
    setPhases(phases.map((p) => (p.id === step.id ? { ...p, status: nextStatus, progress: progressForStatus[nextStatus] } : p)));
    try {
      await updateStep(Number(step.id), flowDefinitionId, {
        stepNo: step.stepNo,
        title: step.title,
        status: nextStatus,
        progress: progressForStatus[nextStatus],
        startDate: step.startDate,
        endDate: step.endDate,
      }, currentUserId);
    } catch (err) {
      console.error("อัปเดตสถานะ Step ไม่สำเร็จ", err);
      alert("อัปเดตสถานะ Step ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      setPhases(prevPhases);
    }
  };

  const handleDeleteStep = async (stepId: string) => {
    const prevPhases = phases;
    setPhases(phases.filter((p) => p.id !== stepId));
    try {
      await deleteStep(Number(stepId), currentUserId);
    } catch (err) {
      console.error("ลบ Step ไม่สำเร็จ", err);
      alert("ลบ Step ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      setPhases(prevPhases);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-indigo-600" />
          <h2 className="font-bold text-slate-900 text-sm">Flow Diagram — ลำดับเฟสงาน</h2>
        </div>
      </div>

      {canAdd && (
        <div className="flex gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="ชื่อเฟสงานใหม่ เช่น Testing & Deploy"
            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
          />
          <button
            type="button"
            onClick={handleAddStep}
            disabled={!newTitle.trim() || isSaving}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            เพิ่มเฟส
          </button>
        </div>
      )}

      {phases.length === 0 ? (
        <p className="text-center text-slate-400 text-xs py-6 border border-dashed border-slate-200 rounded-xl">
          ยังไม่มีเฟสงาน — เพิ่มด้านบนเพื่อเริ่มสร้าง Flow Diagram
        </p>
      ) : (
        <div className="overflow-x-auto pb-2">
          <div className="flex items-stretch min-w-max">
            {phases.map((step, idx) => (
              <React.Fragment key={step.id}>
                <div className="w-56 shrink-0 border border-slate-200 rounded-xl p-3.5 space-y-2.5 relative group">
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => handleDeleteStep(step.id)}
                      className="absolute top-1.5 right-1.5 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="ลบเฟสนี้"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wider">
                      {step.stepNo}
                    </span>
                    <button
                      type="button"
                      onClick={() => canEdit && handleCycleStatus(step)}
                      disabled={!canEdit}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${stepBadgeStyle[step.status]} ${canEdit ? "hover:brightness-95" : "opacity-70 cursor-default"}`}
                      title={canEdit ? "คลิกเพื่อเปลี่ยนสถานะ" : step.status}
                    >
                      {step.status}
                    </button>
                  </div>
                  <p className="text-xs font-bold text-slate-800 leading-snug min-h-8">
                    {step.title}
                  </p>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${stepBarStyle[step.status]}`}
                      style={{ width: `${step.progress}%` }}
                    />
                  </div>
                  <div className="text-right text-[10px] font-mono font-bold text-slate-400">
                    {step.progress}%
                  </div>
                </div>

                {idx < phases.length - 1 && (
                  <div className="flex items-center justify-center w-8 shrink-0 text-slate-300">
                    <ArrowRightIcon />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
