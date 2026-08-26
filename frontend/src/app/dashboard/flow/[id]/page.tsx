// // path: app/dashboard/flow/[id]/page.tsx
// "use client";

// import React from "react";
// import Link from "next/link";
// import { useParams } from "next/navigation";
// import {
//   ArrowLeft,
//   GitFork,
//   GitBranch,
//   Layers,
//   ShieldCheck,
//   CalendarRange,
// } from "lucide-react";

// import { flowProjects, FlowPhaseStep } from "../page";

// const statusBadgeClass = (status: string) => {
//   if (status === "เสร็จแล้ว") return "bg-emerald-50 text-emerald-700 border-emerald-200";
//   if (status === "กำลังทำ") return "bg-amber-50 text-amber-700 border-amber-200";
//   return "bg-slate-100 text-slate-600 border-slate-200";
// };

// const stepBadgeStyle: Record<FlowPhaseStep["status"], string> = {
//   "เสร็จแล้ว": "bg-emerald-50 text-emerald-700 border-emerald-200",
//   "กำลังทำ": "bg-amber-50 text-amber-700 border-amber-200",
//   "รอดำเนินการ": "bg-slate-100 text-slate-500 border-slate-200",
// };

// const stepBarStyle: Record<FlowPhaseStep["status"], string> = {
//   "เสร็จแล้ว": "bg-emerald-500",
//   "กำลังทำ": "bg-amber-500",
//   "รอดำเนินการ": "bg-slate-300",
// };

// export default function FlowProjectDetailPage() {
//   const params = useParams();
//   const projectId = String(params.id);
//   const project = flowProjects.find((p) => p.id === projectId) || flowProjects[0];

//   return (
//     <div className="w-full select-none space-y-6">
//       {/* ปุ่มย้อนกลับ */}
//       <Link
//         href="/dashboard/flow"
//         className="group inline-flex items-center gap-2 pl-2 pr-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-bold text-slate-600 hover:text-indigo-600 hover:border-indigo-300 hover:shadow-md transition-all duration-300 w-fit"
//       >
//         <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center transition-colors duration-300 group-hover:bg-indigo-50">
//           <ArrowLeft className="w-3.5 h-3.5" />
//         </span>
//         กลับไปเลือกโปรเจค
//       </Link>

//       {/* Header card — โทน indigo ให้ทางเดียวกับหน้า Present */}
//       <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-[#0f172a] via-[#1e1b4b] to-[#311042] border border-slate-800/80 p-6 shadow-xl">
//         <div className="absolute -top-20 -right-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

//         <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//           <div className="space-y-2">
//             <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/40 border border-indigo-500/30 text-indigo-400 text-[10px] font-mono font-bold tracking-wider uppercase">
//               <GitFork className="w-3 h-3" />
//               FLOW STATION
//             </span>
//             <h1 className="text-xl sm:text-2xl font-extrabold text-white">{project.name}</h1>
//             <div className="flex flex-wrap items-center gap-2 text-xs">
//               <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${statusBadgeClass(project.status)}`}>
//                 {project.status}
//               </span>
//               <span className="font-mono text-slate-400">{project.startDate} → {project.endDate}</span>
//               <span className="text-slate-500">· {project.workType}</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Flow Diagram — ลำดับเฟสงาน */}
//       <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
//         <div className="flex items-center gap-2">
//           <GitBranch className="w-4 h-4 text-indigo-600" />
//           <h2 className="font-bold text-slate-900 text-sm">Flow Diagram — ลำดับเฟสงาน</h2>
//         </div>

//         <div className="overflow-x-auto pb-2">
//           <div className="flex items-stretch min-w-max">
//             {project.phases.map((step, idx) => (
//               <React.Fragment key={step.id}>
//                 <div className="w-56 shrink-0 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
//                   <div className="flex items-center justify-between">
//                     <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wider">
//                       {step.stepNo}
//                     </span>
//                     <span
//                       className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${stepBadgeStyle[step.status]}`}
//                     >
//                       {step.status}
//                     </span>
//                   </div>
//                   <p className="text-xs font-bold text-slate-800 leading-snug min-h-8">
//                     {step.title}
//                   </p>
//                   <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
//                     <div
//                       className={`h-full rounded-full transition-all duration-300 ${stepBarStyle[step.status]}`}
//                       style={{ width: `${step.progress}%` }}
//                     />
//                   </div>
//                   <div className="text-right text-[10px] font-mono font-bold text-slate-400">
//                     {step.progress}%
//                   </div>
//                 </div>

//                 {idx < project.phases.length - 1 && (
//                   <div className="flex items-center justify-center w-8 shrink-0 text-slate-300">
//                     <ArrowRightIcon />
//                   </div>
//                 )}
//               </React.Fragment>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Architecture Diagram — โครงสร้างระบบ */}
//       <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
//         <div className="flex items-center gap-2">
//           <Layers className="w-4 h-4 text-indigo-600" />
//           <h2 className="font-bold text-slate-900 text-sm">Architecture Diagram — โครงสร้างระบบ</h2>
//         </div>

//         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//           <ArchColumn label="FRONTEND" tags={project.frontend} />
//           <ArchColumn label="BACKEND / API" tags={project.backend} />
//           <ArchColumn label="DATABASE" tags={project.database} />
//         </div>
//       </div>

//       {/* Gantt แผนงาน (Plan Timeline) */}
//       <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
//         <div className="flex items-center gap-2">
//           <CalendarRange className="w-4 h-4 text-indigo-600" />
//           <h2 className="font-bold text-slate-900 text-sm">Gantt แผนงาน (Plan Timeline)</h2>
//         </div>
//         <div className="py-10 flex items-center justify-center text-center">
//           <p className="text-xs text-slate-400 font-medium">
//             ใส่วันเริ่ม/สิ้นสุดในเฟสงาน เพื่อแสดงแผนงานแบบ Gantt
//           </p>
//         </div>
//       </div>

//       {/* คุณภาพระบบล่าสุด (QA Gate) */}
//       <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
//         <div className="flex items-center gap-2">
//           <ShieldCheck className="w-4 h-4 text-indigo-600" />
//           <h2 className="font-bold text-slate-900 text-sm">คุณภาพระบบล่าสุด (QA Gate)</h2>
//         </div>
//         <p className="text-xs text-slate-400 font-medium">
//           ยังไม่มีผลเทสของโปรเจคนี้ — บันทึกได้ที่เมนู{" "}
//           <Link href="/dashboard/testing" className="text-indigo-600 font-bold hover:underline">
//             Test Automation
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }

// function ArchColumn({ label, tags }: { label: string; tags: string[] }) {
//   return (
//     <div className="border border-slate-200 rounded-xl p-4 space-y-2.5">
//       <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wider">{label}</span>
//       <div className="flex flex-wrap gap-1.5">
//         {tags.length > 0 ? (
//           tags.map((tag) => (
//             <span
//               key={tag}
//               className="px-2.5 py-1 bg-slate-100 rounded-md text-slate-700 font-semibold text-[11px]"
//             >
//               {tag}
//             </span>
//           ))
//         ) : (
//           <span className="text-[11px] text-slate-300 font-medium">ยังไม่ระบุ</span>
//         )}
//       </div>
//     </div>
//   );
// }

// function ArrowRightIcon() {
//   return (
//     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//       <path d="M5 12h14" />
//       <path d="m12 5 7 7-7 7" />
//     </svg>
//   );
// }
"use client";

import React from "react";
import { useParams } from "next/navigation";
import { flowProjects } from "../page";
import FlowDetailHeader from "@/components/flow/flow-detail-header";
import FlowDiagramSection from "@/components/flow/flow-diagram-section";
import ArchitectureDiagramSection from "@/components/flow/architecture-diagram-section";
import FlowGanttQaSections from "@/components/flow/flow-gantt-qa-sections";

export default function FlowProjectDetailPage() {
  const params = useParams();
  const projectId = String(params.id);
  const project = flowProjects.find((p) => p.id === projectId) || flowProjects[0];

  return (
    <div className="w-full select-none space-y-6">
      <FlowDetailHeader
        name={project.name}
        status={project.status}
        startDate={project.startDate}
        endDate={project.endDate}
        workType={project.workType}
      />

      <FlowDiagramSection phases={project.phases} />

      <ArchitectureDiagramSection
        frontend={project.frontend}
        backend={project.backend}
        database={project.database}
      />

      <FlowGanttQaSections />
    </div>
  );
}