"use client";

import React from "react";
import { RotateCw, Users, Workflow } from "lucide-react";
import EditButtonV2 from "@/components/ui/buttons/buttonv2/edit-buttonv2";
import DeleteButtonV2 from "@/components/ui/buttons/buttonv2/delete-buttonv2";
import ViewButtonV2 from "@/components/ui/buttons/buttonv2/view-buttonv2";
import { Phase, WorkItem } from "@/types/project-detail";

interface WorkItemFlipCardProps {
  work: WorkItem;
  phases: Phase[];
  isFlipped: boolean;
  onToggleFlip: () => void;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

interface WhoDoesWhatEntry {
  phaseName: string;
  people: string[];
}

// สรุป "ใครทำอะไร" จาก Phase Owner + Task Assignees ของโปรเจกต์ (ไม่ผูกกับ Showcase Item โดยตรง
// เพราะ ShowcaseItems ไม่มีความสัมพันธ์กับ Phase/Task — จึงสรุปภาพรวมทั้งโปรเจกต์แทน)
function buildWhoDoesWhat(phases: Phase[]): WhoDoesWhatEntry[] {
  return phases
    .map((phase) => {
      const people = new Set<string>();
      if (phase.owner) people.add(phase.owner);
      phase.items.forEach((item) => {
        (item.assignees || []).forEach((a) => people.add(a.fullName));
      });
      return { phaseName: phase.name, people: Array.from(people) };
    })
    .filter((entry) => entry.people.length > 0);
}

export default function WorkItemFlipCard({
  work,
  phases,
  isFlipped,
  onToggleFlip,
  onView,
  onEdit,
  onDelete,
}: WorkItemFlipCardProps) {
  const whoDoesWhat = buildWhoDoesWhat(phases);

  return (
    <div className="group relative [perspective:1000px] h-[260px]">
      <div
        className={`relative w-full h-full duration-500 [transform-style:preserve-3d] transition-transform rounded-xl border border-slate-200 shadow-xs ${
          isFlipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        {/* FRONT */}
        <div className="absolute inset-0 w-full h-full bg-white rounded-xl [backface-visibility:hidden] p-3 flex flex-col justify-between">
          <div
            onClick={onToggleFlip}
            className="cursor-pointer relative flex-1 bg-slate-100 rounded-lg overflow-hidden group/img"
          >
            <img src={work.imageUrl} alt={work.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
              <RotateCw className="w-4 h-4" />
              คลิกเพื่อดู Flow
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900 text-xs">{work.title}</h4>
              <p className="text-[10px] text-slate-400">บันทึก {work.date}</p>
            </div>

            <div className="flex items-center gap-1">
              <ViewButtonV2
                onClick={(e) => {
                  e.stopPropagation();
                  onView();
                }}
                title="ดูภาพขนาดใหญ่"
              />
              <EditButtonV2 onClick={onEdit} title="แก้ไขผลงาน" />
              <DeleteButtonV2 onClick={onDelete} title="ลบผลงาน" />
            </div>
          </div>
        </div>

        {/* BACK */}
        <div className="absolute inset-0 w-full h-full bg-slate-900 text-white rounded-xl [backface-visibility:hidden] [transform:rotateY(180deg)] p-4 flex flex-col justify-between overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-0.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-1">
              <span className="text-[11px] font-bold text-indigo-400 flex items-center gap-1">
                <Workflow className="w-3.5 h-3.5" />
                Workflow Diagram
              </span>
              <button onClick={onToggleFlip} className="text-slate-400 hover:text-white">
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>
            <h5 className="font-bold text-xs">{work.title}</h5>
            <p className="text-[11px] text-slate-300 leading-relaxed font-mono bg-slate-950 p-2 rounded-lg border border-slate-800">
              {work.flowDescription || "ไม่มีการระบุ Workflow"}
            </p>

            {whoDoesWhat.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  ใครทำอะไร (Who does what)
                </span>
                <ul className="space-y-0.5">
                  {whoDoesWhat.map((entry) => (
                    <li key={entry.phaseName} className="text-[10px] text-slate-300">
                      <span className="font-semibold text-slate-200">{entry.phaseName}:</span>{" "}
                      {entry.people.join(", ")}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 shrink-0">
            <p className="text-[10px] text-slate-500">คลิกไอคอนหมุนเพื่อกลับไปดูรูป</p>
            <div className="flex items-center gap-1">
              <EditButtonV2 onClick={onEdit} title="แก้ไขผลงาน" />
              <DeleteButtonV2 onClick={onDelete} title="ลบผลงาน" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
