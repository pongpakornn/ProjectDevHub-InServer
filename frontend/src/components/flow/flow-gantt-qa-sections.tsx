"use client";

import React, { useState } from "react";
import { CalendarRange, ShieldCheck, Play, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { FlowStep, FlowExecution, FlowExecutionStatus, FlowLogLevel } from "@/types/flow";
import { createExecution, deleteExecution, addLog } from "@/lib/flow-api";

interface FlowGanttQaSectionsProps {
  flowDefinitionId: number;
  phases: FlowStep[];
  executions: FlowExecution[];
  setExecutions: React.Dispatch<React.SetStateAction<FlowExecution[]>>;
  currentUserId: number;
}

const executionBadgeStyle: Record<FlowExecutionStatus, string> = {
  RUNNING: "bg-amber-50 text-amber-700 border-amber-200",
  SUCCESS: "bg-emerald-50 text-emerald-700 border-emerald-200",
  FAILED: "bg-rose-50 text-rose-700 border-rose-200",
};

const logLevelStyle: Record<FlowLogLevel, string> = {
  INFO: "text-slate-500",
  WARN: "text-amber-600",
  ERROR: "text-rose-600",
};

function GanttChart({ phases }: { phases: FlowStep[] }) {
  const withDates = phases.filter((p) => p.startDate && p.endDate);

  if (withDates.length === 0) {
    return (
      <div className="py-10 flex items-center justify-center text-center">
        <p className="text-xs text-slate-400 font-medium">
          ใส่วันเริ่ม/สิ้นสุดในเฟสงาน เพื่อแสดงแผนงานแบบ Gantt
        </p>
      </div>
    );
  }

  const starts = withDates.map((p) => new Date(p.startDate!).getTime());
  const ends = withDates.map((p) => new Date(p.endDate!).getTime());
  const minDate = Math.min(...starts);
  const maxDate = Math.max(...ends);
  const totalSpan = Math.max(maxDate - minDate, 1);

  return (
    <div className="space-y-2 pt-1">
      {withDates.map((p) => {
        const start = new Date(p.startDate!).getTime();
        const end = new Date(p.endDate!).getTime();
        const leftPct = ((start - minDate) / totalSpan) * 100;
        const widthPct = Math.max(((end - start) / totalSpan) * 100, 2);
        return (
          <div key={p.id} className="flex items-center gap-3 text-xs">
            <span className="w-40 shrink-0 truncate font-semibold text-slate-700">{p.title}</span>
            <div className="flex-1 relative h-5 bg-slate-100 rounded-md overflow-hidden border border-slate-200">
              <div
                className="absolute h-full bg-indigo-500 rounded-md"
                style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                title={`${p.startDate} → ${p.endDate}`}
              />
            </div>
            <span className="w-28 shrink-0 text-[10px] font-mono text-slate-400 text-right">
              {p.startDate} → {p.endDate}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function FlowGanttQaSections({
  flowDefinitionId,
  phases,
  executions,
  setExecutions,
  currentUserId,
}: FlowGanttQaSectionsProps) {
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<FlowExecutionStatus>("SUCCESS");
  const [isSaving, setIsSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [logDraft, setLogDraft] = useState("");

  const handleAddExecution = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const created = await createExecution(flowDefinitionId, { status, note: note.trim() || undefined }, currentUserId);
      setExecutions([created, ...executions]);
      setNote("");
    } catch (err) {
      console.error("บันทึกการรันไม่สำเร็จ", err);
      alert("บันทึกการรันไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteExecution = async (executionId: string) => {
    const prev = executions;
    setExecutions(executions.filter((e) => e.id !== executionId));
    try {
      await deleteExecution(Number(executionId));
    } catch (err) {
      console.error("ลบประวัติการรันไม่สำเร็จ", err);
      alert("ลบประวัติการรันไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      setExecutions(prev);
    }
  };

  const handleAddLog = async (executionId: string) => {
    if (!logDraft.trim()) return;
    try {
      const log = await addLog(Number(executionId), "INFO", logDraft.trim());
      setExecutions(
        executions.map((e) => (e.id === executionId ? { ...e, logs: [...e.logs, log] } : e))
      );
      setLogDraft("");
    } catch (err) {
      console.error("เพิ่ม Log ไม่สำเร็จ", err);
      alert("เพิ่ม Log ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    }
  };

  return (
    <div className="space-y-6">
      {/* Gantt แผนงาน (Plan Timeline) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <CalendarRange className="w-4 h-4 text-indigo-600" />
          <h2 className="font-bold text-slate-900 text-sm">Gantt แผนงาน (Plan Timeline)</h2>
        </div>
        <GanttChart phases={phases} />
      </div>

      {/* ประวัติการรัน Flow (Execution History) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <h2 className="font-bold text-slate-900 text-sm">ประวัติการรัน Flow (Execution History)</h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as FlowExecutionStatus)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
          >
            <option value="SUCCESS">SUCCESS</option>
            <option value="FAILED">FAILED</option>
            <option value="RUNNING">RUNNING</option>
          </select>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="บันทึกผลการรัน / หมายเหตุ..."
            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
          />
          <button
            type="button"
            onClick={handleAddExecution}
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shrink-0"
          >
            <Play className="w-3.5 h-3.5" />
            บันทึกการรัน
          </button>
        </div>

        {executions.length === 0 ? (
          <p className="text-xs text-slate-400 font-medium py-4">ยังไม่มีประวัติการรันของ Flow นี้</p>
        ) : (
          <div className="space-y-2 pt-1">
            {executions.map((ex) => {
              const isExpanded = expandedId === ex.id;
              return (
                <div key={ex.id} className="border border-slate-100 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between gap-3 px-3 py-2 bg-slate-50">
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : ex.id)}
                      className="flex items-center gap-2 text-left flex-1 min-w-0"
                    >
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border shrink-0 ${executionBadgeStyle[ex.status]}`}>
                        {ex.status}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono shrink-0">
                        {new Date(ex.startedDate).toLocaleString("th-TH")}
                      </span>
                      <span className="text-xs text-slate-700 truncate">{ex.note || "-"}</span>
                      <span className="text-[10px] text-slate-400 shrink-0 ml-auto">โดย {ex.triggeredByName}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteExecution(ex.id)}
                      className="text-slate-400 hover:text-rose-600 shrink-0"
                      title="ลบประวัติการรันนี้"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="p-3 space-y-2 border-t border-slate-100">
                      {ex.logs.length === 0 ? (
                        <p className="text-[11px] text-slate-400">ยังไม่มี Log</p>
                      ) : (
                        <div className="space-y-1">
                          {ex.logs.map((log) => (
                            <div key={log.id} className="text-[11px] font-mono flex gap-2">
                              <span className={`font-bold ${logLevelStyle[log.logLevel]}`}>[{log.logLevel}]</span>
                              <span className="text-slate-600">{log.message}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2 pt-1">
                        <input
                          type="text"
                          value={logDraft}
                          onChange={(e) => setLogDraft(e.target.value)}
                          placeholder="เพิ่มบรรทัด Log..."
                          className="flex-1 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-[11px] font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddLog(ex.id)}
                          disabled={!logDraft.trim()}
                          className="bg-slate-700 hover:bg-slate-800 disabled:opacity-50 text-white text-[11px] font-bold px-3 py-1.5 rounded-md shrink-0"
                        >
                          เพิ่ม
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <p className="text-[11px] text-slate-400 font-medium pt-1">
          ผลเทสอัตโนมัติ บันทึกได้ที่เมนู Test Automation แยกต่างหาก
        </p>
      </div>
    </div>
  );
}
