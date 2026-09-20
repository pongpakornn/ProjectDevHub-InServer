"use client";

// Workflow Diagram Studio — พอร์ตฟีเจอร์มาจาก AutoFlowStudio_ModulesD (Dashboard + FlowBuilder route)
// รวมเป็น Component เดียวฝัง /dashboard/flow/[id] แทนที่ FlowDiagramSection/ArchitectureDiagramSection/
// FlowGanttQaSections เดิม (ยังไม่ลบไฟล์เดิมทิ้ง เผื่อย้อนกลับ — แค่เลิกใช้ในหน้านี้)
import React, { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, CircleDashed, Save, FileDown, Workflow } from "lucide-react";
import { Button } from "@/components/ui/buttons/button";
import FlowDiagramTable from "./flow-diagram-table";
import FlowDiagramPreview from "./flow-diagram-preview";
import FlowDiagramExportModal from "./flow-diagram-export-modal";
import { useToast } from "@/lib/toast-context";
import {
  getFlowDiagramData,
  saveFlowDiagramRows,
  updateFlowMeta,
  FlowDiagramData,
} from "@/lib/flow-api";
import { FLOW_DIAGRAM_TYPES } from "@/lib/flow-diagram-templates";
import { generateFlowDiagram, validateFlowDiagram } from "@/lib/flow-diagram-generator";
import { DfdLevel, FlowDiagramProjectMeta, FlowDiagramRowsByType, FlowDiagramType } from "@/types/flow-diagram";

interface FlowDiagramStudioProps {
  flowDefinitionId: number;
  projectName: string;
  ownerNameDefault: string;
  currentUserId: number;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

const DFD_LEVELS: { id: DfdLevel; label: string }[] = [
  { id: "context", label: "Context Diagram" },
  { id: "level0", label: "Level 0" },
  { id: "level1", label: "Level 1" },
];

export default function FlowDiagramStudio({
  flowDefinitionId,
  projectName,
  ownerNameDefault,
  currentUserId,
  canAdd,
  canEdit,
  canDelete,
}: FlowDiagramStudioProps) {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [rows, setRows] = useState<FlowDiagramRowsByType | null>(null);
  const [systemType, setSystemType] = useState("");
  const [moduleList, setModuleList] = useState("");
  const [dfdLevel, setDfdLevel] = useState<DfdLevel>("level0");
  const [activeType, setActiveType] = useState<FlowDiagramType>("FLOWCHART");
  const [isSavingRows, setIsSavingRows] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const canEditCell = canAdd || canEdit;

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    getFlowDiagramData(flowDefinitionId)
      .then((data: FlowDiagramData) => {
        if (cancelled) return;
        setRows(data.rows);
        setSystemType(data.systemType);
        setModuleList(data.moduleList);
        setDfdLevel(data.dfdLevel);
      })
      .catch((err) => {
        console.error("โหลดข้อมูล Workflow Diagram Studio ไม่สำเร็จ", err);
        toast.error("โหลดข้อมูลไม่สำเร็จ", "ไม่สามารถโหลดข้อมูลไดอะแกรมได้ กรุณาลองใหม่อีกครั้ง");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flowDefinitionId]);

  const meta: FlowDiagramProjectMeta = useMemo(
    () => ({ projectName, owner: ownerNameDefault, systemType, moduleList }),
    [projectName, ownerNameDefault, systemType, moduleList],
  );
  const options = useMemo(() => ({ dfdLevel }), [dfdLevel]);

  const activeRows = rows?.[activeType] ?? [];
  const code = useMemo(() => generateFlowDiagram(activeType, activeRows, meta, options), [activeType, activeRows, meta, options]);
  const issues = useMemo(() => validateFlowDiagram(activeType, activeRows), [activeType, activeRows]);
  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warnCount = issues.length - errorCount;

  const counts = useMemo(() => {
    const out: Record<FlowDiagramType, number> = {} as Record<FlowDiagramType, number>;
    FLOW_DIAGRAM_TYPES.forEach((f) => {
      out[f.id] = (rows?.[f.id] ?? []).filter((r) => r.actor.trim() || r.action.trim() || r.nextStep.trim()).length;
    });
    return out;
  }, [rows]);

  const handleRowsChange = (next: typeof activeRows) => {
    if (!rows) return;
    setRows({ ...rows, [activeType]: next });
    setIsDirty(true);
  };

  const handleSaveRows = async () => {
    if (!rows || isSavingRows) return;
    setIsSavingRows(true);
    try {
      const saved = await saveFlowDiagramRows(flowDefinitionId, activeType, rows[activeType], currentUserId);
      setRows({ ...rows, [activeType]: saved });
      setIsDirty(false);
      toast.success("บันทึกตารางสำเร็จ", `บันทึกข้อมูล ${FLOW_DIAGRAM_TYPES.find((f) => f.id === activeType)?.title} เรียบร้อยแล้ว`);
    } catch (err) {
      console.error("บันทึกตารางไดอะแกรมไม่สำเร็จ", err);
      toast.error("บันทึกไม่สำเร็จ", "กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSavingRows(false);
    }
  };

  const syncMeta = async (patch: { systemType?: string; moduleList?: string; dfdLevel?: DfdLevel }) => {
    try {
      await updateFlowMeta(flowDefinitionId, { systemType, moduleList, dfdLevel, ...patch }, currentUserId);
    } catch (err) {
      console.error("อัปเดตข้อมูลโปรเจกต์ของ Flow ไม่สำเร็จ", err);
      toast.error("บันทึกข้อมูลโปรเจกต์ไม่สำเร็จ", "กรุณาลองใหม่อีกครั้ง");
    }
  };

  const handleDfdLevelChange = (level: DfdLevel) => {
    setDfdLevel(level);
    void syncMeta({ dfdLevel: level });
  };

  if (isLoading || !rows) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-10 text-center text-xs text-slate-400">
        กำลังโหลด Workflow Diagram Studio...
      </div>
    );
  }

  const activeMeta = FLOW_DIAGRAM_TYPES.find((f) => f.id === activeType)!;

  return (
    <div className="space-y-4">
      {/* ข้อมูลโปรเจกต์ */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Workflow className="w-4 h-4 text-indigo-600" />
          <h2 className="font-bold text-slate-900 text-sm">ข้อมูลโปรเจกต์ — Workflow Diagram Studio</h2>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Project Name</label>
            <input
              value={projectName}
              disabled
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Owner</label>
            <input
              value={ownerNameDefault}
              disabled
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">System Type</label>
            <input
              value={systemType}
              onChange={(e) => setSystemType(e.target.value)}
              onBlur={() => void syncMeta({ systemType })}
              disabled={!canEditCell}
              placeholder="Internal Web Application"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Module List</label>
            <input
              value={moduleList}
              onChange={(e) => setModuleList(e.target.value)}
              onBlur={() => void syncMeta({ moduleList })}
              disabled={!canEditCell}
              placeholder="Auth, Approval, Report"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>
      </section>

      {/* การ์ดเลือกประเภทไดอะแกรม */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {FLOW_DIAGRAM_TYPES.map((f) => {
          const ready = counts[f.id] > 0;
          const active = f.id === activeType;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveType(f.id)}
              className={`text-left rounded-2xl border p-4 transition-all ${
                active
                  ? "border-indigo-400 bg-indigo-50/60 shadow-[0_4px_12px_rgba(79,70,229,0.15)]"
                  : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/20"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-slate-800">{f.title}</p>
                  <p className="truncate text-[11px] text-slate-500">{f.subtitle}</p>
                </div>
                {ready ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-indigo-600" />
                ) : (
                  <CircleDashed className="w-4 h-4 shrink-0 text-slate-300" />
                )}
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px]">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono font-bold text-slate-500">
                  {counts[f.id]} แถว
                </span>
                <span className={ready ? "font-bold text-indigo-600" : "text-slate-400"}>
                  {ready ? "พร้อมสร้างไดอะแกรม" : "ยังไม่มีข้อมูล"}
                </span>
              </div>
            </button>
          );
        })}
      </section>

      {/* DFD Level Selector */}
      {activeType === "DFD" ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
          <span className="px-1 text-xs font-bold uppercase tracking-wide text-slate-500">ระดับของ DFD</span>
          {DFD_LEVELS.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => handleDfdLevelChange(l.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                dfdLevel === l.id
                  ? "bg-indigo-600 border-indigo-600 text-white"
                  : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      ) : null}

      {/* Validation Banner */}
      <section
        className={`flex items-start gap-2 rounded-xl border p-3 text-xs ${
          errorCount ? "border-rose-200 bg-rose-50 text-rose-700" : "border-slate-200 bg-white text-slate-500"
        }`}
      >
        {errorCount ? (
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        ) : (
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
        )}
        <div className="min-w-0">
          <p className="font-bold">
            {errorCount
              ? `พบข้อผิดพลาด ${errorCount} จุด${warnCount ? ` และคำเตือน ${warnCount} จุด` : ""}`
              : warnCount
                ? `ข้อมูลใช้งานได้ มีคำเตือน ${warnCount} จุด`
                : "ข้อมูลครบถ้วน พร้อมสร้างเอกสาร"}
          </p>
          {issues.length ? (
            <ul className="mt-1 space-y-0.5">
              {issues.slice(0, 5).map((i, idx) => (
                <li key={`${i.rowIndex}-${String(i.field)}-${idx}`}>
                  แถวที่ {i.rowIndex + 1}: {i.message}
                </li>
              ))}
              {issues.length > 5 ? <li>และอีก {issues.length - 5} รายการ</li> : null}
            </ul>
          ) : null}
        </div>
      </section>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-slate-800">{activeMeta.title}</h2>
        <div className="flex gap-2">
          {canEditCell && (
            <Button
              onClick={handleSaveRows}
              disabled={isSavingRows || !isDirty}
              className="w-auto! bg-slate-800 hover:bg-slate-900 text-white normal-case text-xs font-bold py-1.5 px-3.5 flex items-center gap-1 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {isSavingRows ? "กำลังบันทึก..." : isDirty ? "บันทึกตาราง" : "บันทึกแล้ว"}
            </Button>
          )}
          <Button
            onClick={() => setExportOpen(true)}
            className="w-auto! bg-indigo-600 hover:bg-indigo-700 text-white normal-case text-xs font-bold py-1.5 px-3.5 flex items-center gap-1"
          >
            <FileDown className="w-3.5 h-3.5" />
            Generate &amp; Export
          </Button>
        </div>
      </div>

      <FlowDiagramTable
        type={activeType}
        rows={activeRows}
        issues={issues}
        onChange={handleRowsChange}
        canAdd={canAdd}
        canEdit={canEdit}
        canDelete={canDelete}
      />

      <FlowDiagramPreview code={code} title={activeMeta.title} onReady={(svg) => (svgRef.current = svg)} />

      <FlowDiagramExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Generate & Export Diagrams"
        subtitle={`${activeMeta.title} · ${projectName || "ไม่ระบุชื่อโปรเจกต์"}`}
        meta={meta}
        rows={rows}
        options={options}
        diagramName={`${projectName}-${activeType.toLowerCase()}`}
        getSvg={() => svgRef.current}
      />
    </div>
  );
}
