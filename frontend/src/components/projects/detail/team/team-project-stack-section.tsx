"use client";

import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import SearchableSelect from "@/components/ui/inputs/searchable-select";

export interface StackItem {
  id: string;
  type: string;
  name: string;
  version: string;
  layer: string;
}

interface TeamProjectStackSectionProps {
  stacks: StackItem[];
  setStacks: React.Dispatch<React.SetStateAction<StackItem[]>>;
}

const stackOptions = [
  { label: "Next.js", value: "Next.js" },
  { label: "React", value: "React" },
  { label: "TypeScript", value: "TypeScript" },
  { label: "ASP.NET Core", value: "ASP.NET Core" },
  { label: "SQL Server", value: "SQL Server" },
  { label: "Tailwind CSS", value: "Tailwind CSS" },
  { label: "Zustand", value: "Zustand" },
  { label: "Docker", value: "Docker" },
];

export default function TeamProjectStackSection({
  stacks,
  setStacks,
}: TeamProjectStackSectionProps) {
  const [stackType, setStackType] = useState("ภาษา (Language)");
  const [stackName, setStackName] = useState("");
  const [stackVersion, setStackVersion] = useState("");
  const [stackLayer, setStackLayer] = useState("");

  const handleAddStack = () => {
    if (!stackName) return;
    setStacks([
      ...stacks,
      {
        id: Date.now().toString(),
        type: stackType,
        name: stackName,
        version: stackVersion,
        layer: stackLayer,
      },
    ]);
    setStackName("");
    setStackVersion("");
  };

  const handleDeleteStack = (id: string) => {
    setStacks(stacks.filter((s) => s.id !== id));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
      <h3 className="font-bold text-slate-800 text-sm">Stack / Library</h3>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">ประเภท</label>
          <select
            value={stackType}
            onChange={(e) => setStackType(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none cursor-pointer"
          >
            <option value="ภาษา (Language)">ภาษา (Language)</option>
            <option value="Framework">Framework</option>
            <option value="Library / Package">Library / Package</option>
            <option value="Database">Database</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">ชื่อ</label>
          <SearchableSelect
            options={stackOptions}
            value={stackName}
            onChange={setStackName}
            placeholder="พิมพ์ค้นหา เช่น Next.js"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">เวอร์ชัน</label>
          <input
            type="text"
            placeholder="14.2"
            value={stackVersion}
            onChange={(e) => setStackVersion(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-500 mb-1">Layer *</label>
            <select
              value={stackLayer}
              onChange={(e) => setStackLayer(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="">เลือก Layer</option>
              <option value="Frontend">Frontend</option>
              <option value="Backend">Backend</option>
              <option value="Database">Database</option>
              <option value="DevOps">DevOps</option>
            </select>
          </div>
          <button
            onClick={handleAddStack}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs self-end h-9.5 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            เพิ่ม
          </button>
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
                <button
                  onClick={() => handleDeleteStack(st.id)}
                  className="text-slate-400 hover:text-rose-500 ml-1 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}