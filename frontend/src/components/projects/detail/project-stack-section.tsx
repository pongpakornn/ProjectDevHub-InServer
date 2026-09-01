"use client";

import React, { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { Dropdown, DropdownOption } from "@/components/ui/inputs/dropdown";
import { Button } from "@/components/ui/buttons/button";
import { StackItem } from "@/types/project-detail";
import { createStackItem, deleteStackItem, getTechStackCatalog } from "@/lib/project-solo-api";

interface ProjectStackSectionProps {
  projectId: number;   // ★ เพิ่ม — ต้องรู้ว่ากำลังเพิ่ม Stack ให้โปรเจกต์ไหน
  stacks: StackItem[];
  setStacks: React.Dispatch<React.SetStateAction<StackItem[]>>;
}

export const ProjectStackSection: React.FC<ProjectStackSectionProps> = ({
  projectId,
  stacks,
  setStacks,
}) => {
  const [stackTypeOptions, setStackTypeOptions] = useState<DropdownOption[]>([]);
  const [stackNameOptions, setStackNameOptions] = useState<DropdownOption[]>([]);
  const [stackLayerOptions, setStackLayerOptions] = useState<DropdownOption[]>([]);
  const [stackType, setStackType] = useState("");
  const [stackName, setStackName] = useState("");
  const [stackVersion, setStackVersion] = useState("");
  const [stackLayer, setStackLayer] = useState("");
  const [isSaving, setIsSaving] = useState(false); // ★ กันกดซ้ำระหว่างรอ API

  // โหลดตัวเลือก Dropdown (ประเภท/ชื่อ/Layer) จาก Project.TechStackCatalog แทนการ Hardcode
  useEffect(() => {
    getTechStackCatalog()
      .then((catalog) => {
        const toOptions = (group: string) =>
          catalog.filter((c) => c.optionGroup === group).map((c) => ({ label: c.optionValue, value: c.optionValue }));
        const typeOptions = toOptions("TYPE");
        setStackTypeOptions(typeOptions);
        setStackNameOptions(toOptions("NAME"));
        setStackLayerOptions(toOptions("LAYER"));
        if (typeOptions.length > 0) setStackType(typeOptions[0].value);
      })
      .catch((err) => console.error("โหลด Tech Stack Catalog ไม่สำเร็จ", err));
  }, []);

  // ★ แก้ทั้งฟังก์ชัน — เรียก createStackItem จริงแทนการ setStacks เฉยๆ
  const handleAddStack = async () => {
    if (!stackName || isSaving) return;
    setIsSaving(true);
    try {
      const created = await createStackItem(projectId, {
        type: stackType,
        name: stackName,
        version: stackVersion,
        layer: stackLayer || "Frontend",
      });
      setStacks([...stacks, created]); // ★ ใช้ id จริงจาก backend แทน Date.now()
      setStackName("");
      setStackVersion("");
    } catch (err) {
      console.error("เพิ่ม Stack ไม่สำเร็จ", err);
      alert("เพิ่ม Stack ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSaving(false);
    }
  };

  // ★ แก้ทั้งฟังก์ชัน — เรียก deleteStackItem จริง พร้อม rollback ถ้าพลาด
  const handleDeleteStack = async (id: string) => {
    const prevStacks = stacks;
    setStacks(stacks.filter(s => s.id !== id)); // Optimistic update
    try {
      await deleteStackItem(Number(id));
    } catch (err) {
      console.error("ลบ Stack ไม่สำเร็จ", err);
      alert("ลบ Stack ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      setStacks(prevStacks); // Rollback
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
      <h3 className="font-bold text-slate-800 text-sm">Stack / Library</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
        <div>
          <Dropdown
            label="ประเภท"
            options={stackTypeOptions}
            value={stackType}
            onChange={setStackType}
            placeholder="เลือกประเภท..."
          />
        </div>

        <div>
          <Dropdown
            label="ชื่อ"
            options={stackNameOptions}
            value={stackName}
            onChange={setStackName}
            placeholder="เลือกรายการ..."
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">เวอร์ชัน</label>
          <input 
            type="text" 
            placeholder="เช่น 14.2" 
            value={stackVersion}
            onChange={(e) => setStackVersion(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold transition-all"
          />
        </div>

        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Dropdown
              label="Layer *"
              options={stackLayerOptions}
              value={stackLayer}
              onChange={setStackLayer}
              placeholder="เลือก Layer..."
            />
          </div>
          <Button 
            onClick={handleAddStack}
            disabled={isSaving}
            className="w-auto! bg-indigo-600 hover:bg-indigo-700 shadow-[0_4px_12px_rgba(79,70,229,0.25)] hover:shadow-[0_6px_16px_rgba(79,70,229,0.4)] normal-case text-xs font-bold px-4 py-2 self-end h-[38px] flex items-center gap-1 shrink-0 disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            {isSaving ? "กำลังบันทึก..." : "เพิ่ม"}
          </Button>
        </div>
      </div>

      <div className="pt-2">
        {stacks.length === 0 ? (
          <p className="text-center text-slate-400 text-xs py-4 border border-dashed border-slate-200 rounded-xl">
            ยังไม่มีรายการ Stack / Library — เพิ่มด้านบนเพื่อให้หน้า Flow & Diagram สร้าง Architecture Diagram ได้
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {stacks.map((st) => (
              <div key={st.id} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium">
                <span className="text-slate-400 text-[10px]">{st.type}:</span>
                <span className="font-bold text-slate-800">{st.name}</span>
                {st.version && <span className="text-slate-500">v{st.version}</span>}
                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200">{st.layer}</span>
                <button onClick={() => handleDeleteStack(st.id)} className="text-slate-400 hover:text-rose-500 ml-1">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};