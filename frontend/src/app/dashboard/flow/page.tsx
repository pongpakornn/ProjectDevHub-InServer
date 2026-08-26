// // path: app/dashboard/flow/page.tsx
// "use client";

// import React from "react";
// import Link from "next/link";
// import { GitFork, User, Users, ArrowRight, Sparkles, Activity } from "lucide-react";

// export interface FlowPhaseStep {
//   id: string;
//   stepNo: string;
//   title: string;
//   status: "เสร็จแล้ว" | "กำลังทำ" | "รอดำเนินการ";
//   progress: number;
// }

// export interface FlowProjectItem {
//   id: string;
//   name: string;
//   description: string;
//   status: "เสร็จแล้ว" | "กำลังทำ" | "วางแผน";
//   startDate: string;
//   endDate: string;
//   workType: "ทำคนเดียว" | "ทำกับทีม";
//   progress: number;
//   frontend: string[];
//   backend: string[];
//   database: string[];
//   phases: FlowPhaseStep[];
// }

// // รายชื่อโปรเจคทั้งหมด (mockup) — ผูกกับ Solo + Team จริงทีหลังได้ (id ควรตรงกับของ Solo/Team)
// export const flowProjects: FlowProjectItem[] = [
//   {
//     id: "checkpallet-v1",
//     name: "CheckPallet V.1",
//     description: "โปรแกรม CheckPallet ที่บรรจุสินค้าไปส่งให้ลูกค้า...",
//     status: "เสร็จแล้ว",
//     startDate: "15/11/2025",
//     endDate: "21/11/2025",
//     workType: "ทำคนเดียว",
//     progress: 100,
//     frontend: ["VB.NET"],
//     backend: ["Visual Studio"],
//     database: ["Excel"],
//     phases: [
//       { id: "p1", stepNo: "STEP 01", title: "Get Requiament & System Analysis", status: "เสร็จแล้ว", progress: 100 },
//       { id: "p2", stepNo: "STEP 02", title: "Database & Figma Design", status: "เสร็จแล้ว", progress: 100 },
//       { id: "p3", stepNo: "STEP 03", title: "Frontend Developer", status: "เสร็จแล้ว", progress: 100 },
//       { id: "p4", stepNo: "STEP 04", title: "Backend Developer", status: "เสร็จแล้ว", progress: 100 },
//       { id: "p5", stepNo: "STEP 05", title: "Testing & Deploy", status: "เสร็จแล้ว", progress: 100 },
//     ],
//   },
//   {
//     id: "storepc-v1",
//     name: "StorePC V.1",
//     description: "ระบบจัดการสินค้าและคลังสินค้า แบบ Real-Time...",
//     status: "เสร็จแล้ว",
//     startDate: "12/12/2025",
//     endDate: "05/03/2026",
//     workType: "ทำคนเดียว",
//     progress: 100,
//     frontend: ["WPF", "XAML"],
//     backend: [".NET (MVVM)"],
//     database: ["SQL Server"],
//     phases: [
//       { id: "p1", stepNo: "STEP 01", title: "Get Requiament & System Analysis", status: "เสร็จแล้ว", progress: 100 },
//       { id: "p2", stepNo: "STEP 02", title: "Database Design", status: "เสร็จแล้ว", progress: 100 },
//       { id: "p3", stepNo: "STEP 03", title: "WPF Development (MVVM)", status: "เสร็จแล้ว", progress: 100 },
//       { id: "p4", stepNo: "STEP 04", title: "Testing & Deploy", status: "เสร็จแล้ว", progress: 100 },
//     ],
//   },
//   {
//     id: "smartops",
//     name: "SmartOps System",
//     description: "ระบบกรองข้อมูลจากไฟล์ PDF และ Export รายงาน...",
//     status: "กำลังทำ",
//     startDate: "03/08/2026",
//     endDate: "-",
//     workType: "ทำคนเดียว",
//     progress: 10,
//     frontend: ["WPF", "XAML"],
//     backend: [".NET (MVVM)"],
//     database: ["ไม่มี (ไม่ใช้ฐานข้อมูล)"],
//     phases: [
//       { id: "p1", stepNo: "STEP 01", title: "Get Requiament & System Analysis", status: "เสร็จแล้ว", progress: 100 },
//       { id: "p2", stepNo: "STEP 02", title: "PDF Import & กรองกรอบแดง", status: "กำลังทำ", progress: 30 },
//       { id: "p3", stepNo: "STEP 03", title: "Export Excel Template", status: "รอดำเนินการ", progress: 0 },
//       { id: "p4", stepNo: "STEP 04", title: "Testing & Deploy", status: "รอดำเนินการ", progress: 0 },
//     ],
//   },
//   {
//     id: "erp-hub",
//     name: "ERP Integration Hub",
//     description: "ระบบเชื่อมต่อข้อมูล ERP ระหว่างสาขา...",
//     status: "วางแผน",
//     startDate: "01/08/2026",
//     endDate: "15/08/2026",
//     workType: "ทำกับทีม",
//     progress: 5,
//     frontend: ["Next.js", "TypeScript", "Tailwind CSS"],
//     backend: ["REST API"],
//     database: ["SQL Server"],
//     phases: [
//       { id: "p1", stepNo: "STEP 01", title: "Get Requirement", status: "เสร็จแล้ว", progress: 100 },
//       { id: "p2", stepNo: "STEP 02", title: "System Analysis", status: "กำลังทำ", progress: 50 },
//       { id: "p3", stepNo: "STEP 03", title: "Figma Design", status: "รอดำเนินการ", progress: 0 },
//       { id: "p4", stepNo: "STEP 04", title: "Database Design", status: "รอดำเนินการ", progress: 0 },
//       { id: "p5", stepNo: "STEP 05", title: "Frontend / Backend Development", status: "รอดำเนินการ", progress: 0 },
//     ],
//   },
// ];

// const statusBadgeClass = (status: FlowProjectItem["status"]) => {
//   if (status === "เสร็จแล้ว") return "bg-emerald-50 text-emerald-700 border-emerald-200";
//   if (status === "กำลังทำ") return "bg-amber-50 text-amber-700 border-amber-200";
//   return "bg-slate-100 text-slate-600 border-slate-200";
// };

// export default function FlowListPage() {
//   const avgProgress = Math.round(
//     flowProjects.reduce((acc, p) => acc + p.progress, 0) / (flowProjects.length || 1)
//   );

//   return (
//     <div className="w-full select-none space-y-6">
//       {/* Header Banner — โทน indigo ให้ทางเดียวกับ Present Station / Team */}
//       <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-[#0f172a] via-[#1e1b4b] to-[#311042] border border-slate-800/80 p-6 md:p-8 shadow-xl">
//         <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

//         <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
//           <div className="space-y-3">
//             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/40 border border-indigo-500/30 text-indigo-400 backdrop-blur-md">
//               <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
//               <span className="font-mono text-[11px] font-bold tracking-wider uppercase">FLOW / DIAGRAM LOG</span>
//             </div>

//             <div className="flex items-center gap-3">
//               <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Flow & Diagram</h1>
//               <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
//                 FLOW STATION
//               </span>
//             </div>

//             <p className="text-xs font-medium text-slate-400">
//               เลือกโปรเจคที่ต้องการ เพื่อดูแผนผังเฟสงาน สถาปัตยกรรมระบบ และแผนงาน (Gantt)
//             </p>
//           </div>

//           <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
//             <div className="bg-slate-900/60 border border-indigo-500/20 rounded-xl p-4 min-w-65 space-y-2.5 backdrop-blur-md shadow-lg shadow-black/20">
//               <div className="flex items-center justify-between text-xs">
//                 <span className="text-slate-200 font-semibold flex items-center gap-2">
//                   <Activity className="w-4 h-4 text-indigo-400" />
//                   ความคืบหน้าเฉลี่ย
//                 </span>
//                 <span className="text-indigo-400 font-mono font-extrabold text-base">{avgProgress}%</span>
//               </div>

//               <div className="w-full bg-slate-950/80 rounded-full h-2 overflow-hidden p-0.5 border border-slate-800">
//                 <div
//                   className="bg-indigo-500 h-full rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(99,102,241,0.8)]"
//                   style={{ width: `${avgProgress}%` }}
//                 />
//               </div>

//               <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-0.5">
//                 <span>จำนวนโปรเจค: <strong className="text-indigo-300">{flowProjects.length}</strong> รายการ</span>
//                 <span className="text-slate-500">อัปเดตล่าสุด: เมื่อครู่นี้</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Grid การ์ดโปรเจค — คลิกที่การ์ดได้เลย สไตล์เดียวกับ Present Station */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
//         {flowProjects.map((p) => (
//           <Link
//             key={p.id}
//             href={`/dashboard/flow/${p.id}`}
//             className="group bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:shadow-lg hover:shadow-indigo-500/10 hover:border-indigo-300 hover:-translate-y-1 transition-all duration-300 ease-out flex flex-col gap-3 cursor-pointer"
//           >
//             <div className="flex items-start gap-2.5">
//               <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 shrink-0 transition-colors duration-300 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600">
//                 <GitFork className="w-4 h-4" />
//               </div>
//               <div className="min-w-0">
//                 <h3 className="font-bold text-slate-900 text-sm truncate transition-colors duration-300 group-hover:text-indigo-600">{p.name}</h3>
//                 <p className="text-[11px] text-slate-500 line-clamp-1">{p.description}</p>
//               </div>
//             </div>

//             <div className="flex items-center gap-2 text-[11px]">
//               <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${statusBadgeClass(p.status)}`}>
//                 {p.status}
//               </span>
//               <span className="text-slate-400 font-mono">
//                 {p.startDate} → {p.endDate}
//               </span>
//             </div>

//             <div className="flex items-center gap-2.5">
//               <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
//                 <div
//                   className="bg-indigo-500 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(99,102,241,0.7)]"
//                   style={{ width: `${p.progress}%` }}
//                 />
//               </div>
//               <span className="text-indigo-600 font-mono font-extrabold text-[11px] shrink-0 w-8 text-right">
//                 {p.progress}%
//               </span>
//             </div>

//             <div className="flex items-center justify-between pt-1 border-t border-slate-100">
//               <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
//                 {p.workType === "ทำคนเดียว" ? <User className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
//                 {p.workType}
//               </span>
//               <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-600">
//                 ดู Flow
//                 <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
//               </span>
//             </div>
//           </Link>
//         ))}
//       </div>
//     </div>
//   );
// }
"use client";

import React from "react";
import FlowHeaderBanner from "./components/flow-header-banner";
import FlowProjectCard from "./components/flow-project-card";

export interface FlowPhaseStep {
  id: string;
  stepNo: string;
  title: string;
  status: "เสร็จแล้ว" | "กำลังทำ" | "รอดำเนินการ";
  progress: number;
}

export interface FlowProjectItem {
  id: string;
  name: string;
  description: string;
  status: "เสร็จแล้ว" | "กำลังทำ" | "วางแผน";
  startDate: string;
  endDate: string;
  workType: "ทำคนเดียว" | "ทำกับทีม";
  progress: number;
  frontend: string[];
  backend: string[];
  database: string[];
  phases: FlowPhaseStep[];
}

export const flowProjects: FlowProjectItem[] = [
  {
    id: "checkpallet-v1",
    name: "CheckPallet V.1",
    description: "โปรแกรม CheckPallet ที่บรรจุสินค้าไปส่งให้ลูกค้า...",
    status: "เสร็จแล้ว",
    startDate: "15/11/2025",
    endDate: "21/11/2025",
    workType: "ทำคนเดียว",
    progress: 100,
    frontend: ["VB.NET"],
    backend: ["Visual Studio"],
    database: ["Excel"],
    phases: [
      { id: "p1", stepNo: "STEP 01", title: "Get Requiament & System Analysis", status: "เสร็จแล้ว", progress: 100 },
      { id: "p2", stepNo: "STEP 02", title: "Database & Figma Design", status: "เสร็จแล้ว", progress: 100 },
      { id: "p3", stepNo: "STEP 03", title: "Frontend Developer", status: "เสร็จแล้ว", progress: 100 },
      { id: "p4", stepNo: "STEP 04", title: "Backend Developer", status: "เสร็จแล้ว", progress: 100 },
      { id: "p5", stepNo: "STEP 05", title: "Testing & Deploy", status: "เสร็จแล้ว", progress: 100 },
    ],
  },
  {
    id: "storepc-v1",
    name: "StorePC V.1",
    description: "ระบบจัดการสินค้าและคลังสินค้า แบบ Real-Time...",
    status: "เสร็จแล้ว",
    startDate: "12/12/2025",
    endDate: "05/03/2026",
    workType: "ทำคนเดียว",
    progress: 100,
    frontend: ["WPF", "XAML"],
    backend: [".NET (MVVM)"],
    database: ["SQL Server"],
    phases: [
      { id: "p1", stepNo: "STEP 01", title: "Get Requiament & System Analysis", status: "เสร็จแล้ว", progress: 100 },
      { id: "p2", stepNo: "STEP 02", title: "Database Design", status: "เสร็จแล้ว", progress: 100 },
      { id: "p3", stepNo: "STEP 03", title: "WPF Development (MVVM)", status: "เสร็จแล้ว", progress: 100 },
      { id: "p4", stepNo: "STEP 04", title: "Testing & Deploy", status: "เสร็จแล้ว", progress: 100 },
    ],
  },
  {
    id: "smartops",
    name: "SmartOps System",
    description: "ระบบกรองข้อมูลจากไฟล์ PDF และ Export รายงาน...",
    status: "กำลังทำ",
    startDate: "03/08/2026",
    endDate: "-",
    workType: "ทำคนเดียว",
    progress: 10,
    frontend: ["WPF", "XAML"],
    backend: [".NET (MVVM)"],
    database: ["ไม่มี (ไม่ใช้ฐานข้อมูล)"],
    phases: [
      { id: "p1", stepNo: "STEP 01", title: "Get Requiament & System Analysis", status: "เสร็จแล้ว", progress: 100 },
      { id: "p2", stepNo: "STEP 02", title: "PDF Import & กรองกรอบแดง", status: "กำลังทำ", progress: 30 },
      { id: "p3", stepNo: "STEP 03", title: "Export Excel Template", status: "รอดำเนินการ", progress: 0 },
      { id: "p4", stepNo: "STEP 04", title: "Testing & Deploy", status: "รอดำเนินการ", progress: 0 },
    ],
  },
  {
    id: "erp-hub",
    name: "ERP Integration Hub",
    description: "ระบบเชื่อมต่อข้อมูล ERP ระหว่างสาขา...",
    status: "วางแผน",
    startDate: "01/08/2026",
    endDate: "15/08/2026",
    workType: "ทำกับทีม",
    progress: 5,
    frontend: ["Next.js", "TypeScript", "Tailwind CSS"],
    backend: ["REST API"],
    database: ["SQL Server"],
    phases: [
      { id: "p1", stepNo: "STEP 01", title: "Get Requirement", status: "เสร็จแล้ว", progress: 100 },
      { id: "p2", stepNo: "STEP 02", title: "System Analysis", status: "กำลังทำ", progress: 50 },
      { id: "p3", stepNo: "STEP 03", title: "Figma Design", status: "รอดำเนินการ", progress: 0 },
      { id: "p4", stepNo: "STEP 04", title: "Database Design", status: "รอดำเนินการ", progress: 0 },
      { id: "p5", stepNo: "STEP 05", title: "Frontend / Backend Development", status: "รอดำเนินการ", progress: 0 },
    ],
  },
];

export default function FlowListPage() {
  const avgProgress = Math.round(
    flowProjects.reduce((acc, p) => acc + p.progress, 0) / (flowProjects.length || 1)
  );

  return (
    <div className="w-full select-none space-y-6">
      <FlowHeaderBanner
        totalProjects={flowProjects.length}
        avgProgress={avgProgress}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {flowProjects.map((p) => (
          <FlowProjectCard key={p.id} project={p} />
        ))}
      </div>
    </div>
  );
}