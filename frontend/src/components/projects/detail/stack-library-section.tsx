"use client";

import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { Dropdown } from "@/components/ui/inputs/dropdown";
import { Button } from "@/components/ui/buttons/button";
import { StackItem } from "@/types/project-detail";
import { useTechStackPicker } from "@/hooks/use-tech-stack-picker";

// ===========================================================================
// Stack / Library — Component กลางหนึ่งเดียวที่ใช้ร่วมกันระหว่างหน้า Solo Work และ Team Work
// (เดิมมี project-stack-section.tsx กับ team-project-stack-section.tsx แยกกันเป็น Logic คนละชุด
// ที่เหมือนกันทุกอย่างยกเว้น API Module ที่เรียก — รวมเป็นไฟล์เดียวแล้วรับ createStackItem/deleteStackItem
// เป็น Props แทน เพื่อไม่ให้แก้ที่เดียวแล้วอีกหน้าตกรุ่น)
//
// "ชื่อ" Dropdown ถูกปิดใช้งานจนกว่าจะเลือก "ประเภท" ก่อนเสมอ และรีเซ็ตค่า "ชื่อ" ทันทีที่เปลี่ยน "ประเภท"
// (ดู Logic เต็มใน hooks/use-tech-stack-picker.ts — ใช้ร่วมกับหน้า Flow Diagram ด้วย)
// ===========================================================================

export interface StackLibrarySectionProps {
  projectId: number;
  stacks: StackItem[];
  setStacks: React.Dispatch<React.SetStateAction<StackItem[]>>;
  createStackItem: (
    projectId: number,
    data: Pick<StackItem, "type" | "name" | "version" | "layer">
  ) => Promise<StackItem>;
  deleteStackItem: (techStackId: number) => Promise<void>;
  focusRingColorClass?: string; // เดิม Solo ใช้ emerald ring, Team ใช้ indigo ring — คงความต่างของสีไว้ตาม Props
  canAdd?: boolean;
  canDelete?: boolean;
}

export default function StackLibrarySection({
  projectId,
  stacks,
  setStacks,
  createStackItem,
  deleteStackItem,
  focusRingColorClass = "focus:ring-indigo-500/20 focus:border-indigo-500",
  canAdd = true,
  canDelete = true,
}: StackLibrarySectionProps) {
  const picker = useTechStackPicker();
  const [stackVersion, setStackVersion] = useState("");
  const [stackLayer, setStackLayer] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleAddStack = async () => {
    if (!picker.selectedName || isSaving) return;
    setIsSaving(true);
    try {
      const created = await createStackItem(projectId, {
        type: picker.selectedTypeLabel,
        name: picker.selectedName,
        version: stackVersion,
        layer: stackLayer || "Frontend",
      });
      setStacks([...stacks, created]);
      picker.setSelectedName("");
      setStackVersion("");
    } catch (err) {
      console.error("เพิ่ม Stack ไม่สำเร็จ", err);
      alert("เพิ่ม Stack ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteStack = async (id: string) => {
    const prevStacks = stacks;
    setStacks(stacks.filter((s) => s.id !== id));
    try {
      await deleteStackItem(Number(id));
    } catch (err) {
      console.error("ลบ Stack ไม่สำเร็จ", err);
      alert("ลบ Stack ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      setStacks(prevStacks);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
      <h3 className="font-bold text-slate-800 text-sm">Stack / Library</h3>

      {canAdd && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <Dropdown
            label="ประเภท"
            options={picker.typeOptions}
            value={picker.selectedTypeId != null ? String(picker.selectedTypeId) : ""}
            onChange={picker.handleTypeChange}
            placeholder="เลือกประเภท..."
          />

          <Dropdown
            label="ชื่อ"
            options={picker.nameOptions}
            value={picker.selectedName}
            onChange={picker.setSelectedName}
            disabled={picker.isNameDisabled}
            placeholder={
              picker.isNameDisabled ? "เลือกประเภทก่อน" : picker.isLoadingNames ? "กำลังโหลด..." : "เลือกรายการ..."
            }
          />

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">เวอร์ชัน</label>
            <input
              type="text"
              placeholder="เช่น 14.2"
              value={stackVersion}
              onChange={(e) => setStackVersion(e.target.value)}
              className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50/80 focus:bg-white focus:outline-none focus:ring-2 font-semibold transition-all ${focusRingColorClass}`}
            />
          </div>

          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Dropdown
                label="Layer *"
                options={picker.layerOptions}
                value={stackLayer}
                onChange={setStackLayer}
                placeholder="เลือก Layer..."
              />
            </div>
            <Button
              onClick={handleAddStack}
              disabled={isSaving || !picker.selectedName}
              className="w-auto! bg-indigo-600 hover:bg-indigo-700 shadow-[0_4px_12px_rgba(79,70,229,0.25)] hover:shadow-[0_6px_16px_rgba(79,70,229,0.4)] normal-case text-xs font-bold px-4 py-2 self-end h-[38px] flex items-center gap-1 shrink-0 disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              {isSaving ? "กำลังบันทึก..." : "เพิ่ม"}
            </Button>
          </div>
        </div>
      )}

      <div className="pt-2">
        {stacks.length === 0 ? (
          <p className="text-center text-slate-400 text-xs py-4 border border-dashed border-slate-200 rounded-xl">
            ยังไม่มีรายการ Stack / Library — เพิ่มด้านบนเพื่อให้หน้า Flow & Diagram สร้าง Architecture Diagram ได้
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {stacks.map((st) => (
              <div
                key={st.id}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
              >
                <span className="text-slate-400 text-[10px]">{st.type}:</span>
                <span className="font-bold text-slate-800">{st.name}</span>
                {st.version && <span className="text-slate-500">v{st.version}</span>}
                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200">
                  {st.layer}
                </span>
                {canDelete && (
                  <button onClick={() => handleDeleteStack(st.id)} className="text-slate-400 hover:text-rose-500 ml-1">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
