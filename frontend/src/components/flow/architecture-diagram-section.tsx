"use client";

import React, { useState } from "react";
import { Layers, Plus, X } from "lucide-react";
import { FlowTechLayer, FlowTechStackTag } from "@/types/flow";
import { createTechStack, deleteTechStack } from "@/lib/flow-api";

interface ArchitectureDiagramSectionProps {
  flowDefinitionId: number;
  techStacks: FlowTechStackTag[];
  setTechStacks: React.Dispatch<React.SetStateAction<FlowTechStackTag[]>>;
}

const layers: { key: FlowTechLayer; label: string }[] = [
  { key: "FRONTEND", label: "FRONTEND" },
  { key: "BACKEND", label: "BACKEND / API" },
  { key: "DATABASE", label: "DATABASE" },
];

export default function ArchitectureDiagramSection({
  flowDefinitionId,
  techStacks,
  setTechStacks,
}: ArchitectureDiagramSectionProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
      <div className="flex items-center gap-2">
        <Layers className="w-4 h-4 text-indigo-600" />
        <h2 className="font-bold text-slate-900 text-sm">Architecture Diagram — โครงสร้างระบบ</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {layers.map((l) => (
          <ArchColumn
            key={l.key}
            flowDefinitionId={flowDefinitionId}
            label={l.label}
            layer={l.key}
            tags={techStacks.filter((t) => t.layer === l.key)}
            techStacks={techStacks}
            setTechStacks={setTechStacks}
          />
        ))}
      </div>
    </div>
  );
}

function ArchColumn({
  flowDefinitionId,
  label,
  layer,
  tags,
  techStacks,
  setTechStacks,
}: {
  flowDefinitionId: number;
  label: string;
  layer: FlowTechLayer;
  tags: FlowTechStackTag[];
  techStacks: FlowTechStackTag[];
  setTechStacks: React.Dispatch<React.SetStateAction<FlowTechStackTag[]>>;
}) {
  const [newName, setNewName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleAdd = async () => {
    if (!newName.trim() || isSaving) return;
    setIsSaving(true);
    try {
      const created = await createTechStack(flowDefinitionId, layer, newName.trim());
      setTechStacks([...techStacks, created]);
      setNewName("");
    } catch (err) {
      console.error("เพิ่ม Tech Stack ไม่สำเร็จ", err);
      alert("เพิ่ม Tech Stack ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const prev = techStacks;
    setTechStacks(techStacks.filter((t) => t.id !== id));
    try {
      await deleteTechStack(Number(id));
    } catch (err) {
      console.error("ลบ Tech Stack ไม่สำเร็จ", err);
      alert("ลบ Tech Stack ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      setTechStacks(prev);
    }
  };

  return (
    <div className="border border-slate-200 rounded-xl p-4 space-y-2.5">
      <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wider">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {tags.length > 0 ? (
          tags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-md text-slate-700 font-semibold text-[11px]"
            >
              {tag.name}
              <button
                type="button"
                onClick={() => handleDelete(tag.id)}
                className="text-slate-400 hover:text-rose-500"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))
        ) : (
          <span className="text-[11px] text-slate-300 font-medium">ยังไม่ระบุ</span>
        )}
      </div>
      <div className="flex gap-1.5 pt-1">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="เพิ่มรายการ..."
          className="flex-1 min-w-0 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-[11px] font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!newName.trim() || isSaving}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-md p-1.5 shrink-0"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
