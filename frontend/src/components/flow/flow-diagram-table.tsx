"use client";

// ตารางข้อมูลของ Workflow Diagram Studio — พอร์ต Logic มาจาก AutoFlowStudio_ModulesD
// (src/components/workflow/FlowTableForm.tsx) ปรับ Markup ให้ตรงกับ Style ตารางเดิมของ ProjectDevHub
// (ดู project-phase-section.tsx) แทน shadcn/ui + framer-motion ของต้นทาง
import React from "react";
import { Plus, Copy, X } from "lucide-react";
import { Button } from "@/components/ui/buttons/button";
import { FlowDiagramRow, FlowDiagramType, FlowDiagramValidationIssue } from "@/types/flow-diagram";
import { FLOW_DIAGRAM_TYPE_MAP, emptyDiagramRow, uid } from "@/lib/flow-diagram-templates";

interface FlowDiagramTableProps {
  type: FlowDiagramType;
  rows: FlowDiagramRow[];
  issues: FlowDiagramValidationIssue[];
  onChange: (rows: FlowDiagramRow[]) => void;
  canAdd?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

export default function FlowDiagramTable({
  type,
  rows,
  issues,
  onChange,
  canAdd = true,
  canEdit = true,
  canDelete = true,
}: FlowDiagramTableProps) {
  const meta = FLOW_DIAGRAM_TYPE_MAP[type];

  const issueOf = (rowIndex: number, field: keyof FlowDiagramRow) =>
    issues.find((i) => i.rowIndex === rowIndex && i.field === field);

  // เลข Step/No. ผูกกับตำแหน่งแถวเสมอ (auto) ไม่ต้องพิมพ์เอง — sync ค่าจริงใน row.stepNo ทุกครั้งที่
  // แถวเปลี่ยน (เพิ่ม/ลบ/ทำซ้ำ) ให้ตรงกับลำดับ เพื่อให้ Field "Next" ที่อ้างอิงเลข Step ยังใช้งานได้ถูกต้อง
  const renumber = (list: FlowDiagramRow[]) => list.map((r, idx) => ({ ...r, stepNo: String(idx + 1) }));

  const update = (id: string, key: keyof FlowDiagramRow, value: string) =>
    onChange(rows.map((r) => (r.id === id ? { ...r, [key]: value } : r)));

  const addRow = () => onChange(renumber([...rows, emptyDiagramRow(rows.length + 1)]));

  const remove = (id: string) => onChange(renumber(rows.filter((r) => r.id !== id)));

  const duplicate = (id: string) => {
    const index = rows.findIndex((r) => r.id === id);
    const source = rows[index];
    if (!source) return;
    const copy: FlowDiagramRow = { ...source, id: uid(), dbId: undefined };
    onChange(renumber([...rows.slice(0, index + 1), copy, ...rows.slice(index + 1)]));
  };

  // Autocomplete: รวบรวมค่าที่เคยพิมพ์ไว้แล้วในคอลัมน์เดียวกัน (Actor/Next ฯลฯ) มาเสนอผ่าน <datalist>
  // ลดการพิมพ์ชื่อซ้ำๆ โดยไม่บังคับเลือก (ยังพิมพ์อิสระได้เหมือนเดิม)
  const suggestionsOf = (key: keyof FlowDiagramRow) =>
    Array.from(new Set(rows.map((r) => (r[key] as string) ?? "").filter(Boolean)));

  const canEditCell = canAdd || canEdit; // แก้ค่าในแถวที่มีอยู่แล้วนับเป็น Edit, พิมพ์ในแถวที่เพิ่งเพิ่มนับเป็น Add

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-slate-100">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-800">{meta.title} — ตารางข้อมูล</p>
          <p className="truncate text-xs text-slate-500">{meta.description}</p>
        </div>
        {canAdd && (
          <Button
            onClick={addRow}
            className="w-auto! bg-indigo-600 hover:bg-indigo-700 text-white normal-case text-xs font-bold py-1.5 px-3.5 flex items-center gap-1 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            เพิ่มแถว
          </Button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-xs border-collapse">
          <thead className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-slate-200 font-semibold border-b border-slate-800 select-none">
            <tr>
              {meta.columns.map((c) => (
                <th key={c.key} className="py-3 px-3 text-[11px] font-mono font-bold uppercase tracking-wider">
                  {c.label}
                </th>
              ))}
              <th className="py-3 px-3 w-20 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, i) => (
              <tr key={row.id} className="hover:bg-indigo-50/30 transition-colors">
                {meta.columns.map((c) => {
                  const issue = issueOf(i, c.key);
                  const tone = issue
                    ? issue.severity === "error"
                      ? "border-rose-300 bg-rose-50"
                      : "border-amber-300 bg-amber-50"
                    : "border-transparent bg-transparent";
                  const base = `h-9 w-full rounded-md border px-2 text-xs text-slate-800 transition-colors placeholder:text-slate-400 hover:border-slate-200 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${tone}`;

                  // Step/No. — Auto ผูกกับลำดับแถวเสมอ ไม่ต้องพิมพ์ (ดู renumber() ด้านบน)
                  if (c.key === "stepNo") {
                    return (
                      <td key={c.key} className="px-2 py-1.5 align-middle">
                        <span className="flex h-9 w-full items-center justify-center rounded-md bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-500">
                          {i + 1}
                        </span>
                      </td>
                    );
                  }

                  const datalistId = `dl-${type}-${c.key}`;
                  return (
                    <td key={c.key} className="px-2 py-1.5 align-middle" title={issue?.message ?? ""}>
                      {c.type === "select" ? (
                        <select
                          value={row[c.key] || (c.options?.[0] ?? "")}
                          onChange={(e) => update(row.id, c.key, e.target.value)}
                          disabled={!canEditCell}
                          className={base}
                        >
                          {(c.options ?? []).map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <>
                          <input
                            value={row[c.key] ?? ""}
                            placeholder={c.placeholder}
                            onChange={(e) => update(row.id, c.key, e.target.value)}
                            disabled={!canEditCell}
                            list={datalistId}
                            className={base}
                          />
                          <datalist id={datalistId}>
                            {suggestionsOf(c.key).map((v) => (
                              <option key={v} value={v} />
                            ))}
                          </datalist>
                        </>
                      )}
                    </td>
                  );
                })}
                <td className="px-2 py-1.5">
                  <div className="flex justify-center gap-1">
                    {canAdd && (
                      <button
                        type="button"
                        onClick={() => duplicate(row.id)}
                        title="ทำซ้ำแถว"
                        className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => remove(row.id)}
                        title="ลบแถว"
                        className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length === 0 ? (
        <p className="px-6 py-10 text-center text-xs text-slate-400">
          ยังไม่มีข้อมูล — {canAdd ? `กด "เพิ่มแถว" เพื่อเริ่มออกแบบ ${meta.title}` : "ยังไม่มีข้อมูลในตารางนี้"}
        </p>
      ) : null}
    </div>
  );
}
