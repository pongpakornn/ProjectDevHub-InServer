// // path: app/dashboard/testing/page.tsx
// "use client";

// import React, { useState, useMemo } from "react";
// import {
//   Plus,
//   TestTube,
//   Activity,
//   CheckCircle2,
//   XCircle,
//   Clock,
//   Layers,
// } from "lucide-react";
// import TestRunModal from "@/components/testing/test-run-modal";
// import { TestRunItem } from "@/types/test-automation";
// import ViewButton from "@/components/ui/buttons/view-button";
// import EditButton from "@/components/ui/buttons/edit-button";
// import DeleteButton from "@/components/ui/buttons/delete-button";

// const initialRuns: TestRunItem[] = [
//   {
//     id: 1,
//     suiteName: "Login & Register",
//     subText: "Row Coding Error 75-76",
//     projectName: "Softpro Core API - HR",
//     tool: "vitest",
//     environment: "DEV",
//     runDate: "2026-08-10",
//     totalCases: 5,
//     passedCases: 4,
//     failedCases: 1,
//     skippedCases: 0,
//     durationSeconds: 8,
//     status: "partial",
//   },
// ];

// export default function TestAutomationPage() {
//   const [testRuns, setTestRuns] = useState<TestRunItem[]>(initialRuns);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [modalMode, setModalMode] = useState<"create" | "view" | "edit">("create");
//   const [selectedRun, setSelectedRun] = useState<TestRunItem | null>(null);
//   const [selectedProjectFilter, setSelectedProjectFilter] = useState("all");

//   const filteredRuns = useMemo(() => {
//     if (selectedProjectFilter === "all") return testRuns;
//     return testRuns.filter((r) => r.projectName === selectedProjectFilter);
//   }, [testRuns, selectedProjectFilter]);

//   const totalRuns = filteredRuns.length;
//   const totalCases = filteredRuns.reduce((acc, curr) => acc + curr.totalCases, 0);
//   const totalPassed = filteredRuns.reduce((acc, curr) => acc + curr.passedCases, 0);
//   const totalFailed = filteredRuns.reduce((acc, curr) => acc + curr.failedCases, 0);

//   const passRate = totalCases > 0 ? Math.round((totalPassed / totalCases) * 100) : 0;
//   const failRate = totalCases > 0 ? 100 - passRate : 0;

//   const projectStats = useMemo(() => {
//     const statsMap: Record<string, { name: string; passed: number; failed: number; total: number }> = {};

//     testRuns.forEach((run) => {
//       if (!statsMap[run.projectName]) {
//         statsMap[run.projectName] = { name: run.projectName, passed: 0, failed: 0, total: 0 };
//       }
//       statsMap[run.projectName].passed += run.passedCases;
//       statsMap[run.projectName].failed += run.failedCases;
//       statsMap[run.projectName].total += run.totalCases;
//     });

//     return Object.values(statsMap);
//   }, [testRuns]);

//   const handleOpenCreateModal = () => {
//     setSelectedRun(null);
//     setModalMode("create");
//     setIsModalOpen(true);
//   };

//   const handleOpenViewModal = (run: TestRunItem) => {
//     setSelectedRun(run);
//     setModalMode("view");
//     setIsModalOpen(true);
//   };

//   const handleOpenEditModal = (run: TestRunItem) => {
//     setSelectedRun(run);
//     setModalMode("edit");
//     setIsModalOpen(true);
//   };

//   const handleSaveRun = (data: TestRunItem) => {
//     if (modalMode === "edit") {
//       setTestRuns((prev) =>
//         prev.map((item) => (item.id === data.id ? data : item))
//       );
//     } else if (modalMode === "create") {
//       setTestRuns((prev) => [data, ...prev]);
//     }
//   };

//   const handleDelete = (id: string | number) => {
//     if (confirm("คุณต้องการลบผลการทดสอบนี้ใช่หรือไม่?")) {
//       setTestRuns((prev) => prev.filter((item) => item.id !== id));
//     }
//   };

//   const projectOptions = useMemo(() => {
//     const set = new Set(testRuns.map((r) => r.projectName));
//     return Array.from(set);
//   }, [testRuns]);

//   // การ์ดสรุปสถิติ — สไตล์เดียวกับตัวอย่าง: พื้นขาว แถบสีบนขอบ, ตัวเลขใหญ่, tag พิลล์, ไอคอนกรอบสีลอยมุมขวา
//   const statCards = [
//     {
//       key: "runs",
//       label: "รอบการรัน",
//       value: totalRuns,
//       tag: "TEST RUN",
//       icon: Layers,
//       bar: "from-violet-400 to-purple-600",
//       iconBg: "from-violet-400 to-purple-600",
//       iconShadow: "shadow-violet-500/30",
//       tagClass: "bg-violet-50 text-violet-700 border-violet-100",
//     },
//     {
//       key: "cases",
//       label: "เคสทั้งหมด",
//       value: totalCases,
//       tag: "TEST CASE",
//       icon: TestTube,
//       bar: "from-sky-400 to-blue-600",
//       iconBg: "from-sky-400 to-blue-600",
//       iconShadow: "shadow-blue-500/30",
//       tagClass: "bg-sky-50 text-sky-700 border-sky-100",
//     },
//     {
//       key: "passed",
//       label: "ผ่าน (Passed)",
//       value: totalPassed,
//       tag: "PASSED",
//       icon: CheckCircle2,
//       bar: "from-emerald-400 to-emerald-600",
//       iconBg: "from-emerald-400 to-emerald-600",
//       iconShadow: "shadow-emerald-500/30",
//       tagClass: "bg-emerald-50 text-emerald-700 border-emerald-100",
//       valueClass: "text-emerald-600",
//     },
//     {
//       key: "failed",
//       label: "ไม่ผ่าน (Failed)",
//       value: totalFailed,
//       tag: "FAILED",
//       icon: XCircle,
//       bar: "from-rose-400 to-pink-600",
//       iconBg: "from-rose-400 to-pink-600",
//       iconShadow: "shadow-rose-500/30",
//       tagClass: "bg-rose-50 text-rose-700 border-rose-100",
//       valueClass: "text-rose-600",
//     },
//   ];

//   return (
//     <div className="w-full space-y-6 select-none pb-12">
//       {/* DARK BANNER HEADER */}
//       <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0f1123] via-[#161936] to-[#201c47] p-6 sm:p-8 text-white shadow-xl border border-indigo-900/40">
//         <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">

//           <div className="space-y-2">
//             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] font-mono font-bold uppercase tracking-wider">
//               <TestTube className="w-3.5 h-3.5" />
//               <span>TESTING / AUTOMATION LOG</span>
//             </div>

//             <div className="flex items-center gap-3">
//               <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
//                 Test Automation
//               </h1>
//               <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 uppercase">
//                 AUTOMATION WORK
//               </span>
//             </div>

//             <p className="text-xs text-indigo-200/70 max-w-xl">
//               บันทึกและติดตามสถานะการทดสอบระบบอัตโนมัติ พร้อมดูรายงานคุณภาพย้อนหลัง
//             </p>
//           </div>

//           <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
//             <div className="bg-[#0b0c18]/60 backdrop-blur-md border border-indigo-500/20 rounded-xl p-3.5 min-w-[240px] space-y-2">
//               <div className="flex items-center justify-between text-xs">
//                 <span className="flex items-center gap-1.5 font-bold text-indigo-200">
//                   <Activity className="w-3.5 h-3.5 text-indigo-400" />
//                   อัตราการผ่านรวม
//                 </span>
//                 <span className="font-mono font-bold text-indigo-300 text-sm">{passRate}%</span>
//               </div>

//               <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden border border-slate-700/50">
//                 <div
//                   className="bg-indigo-500 h-full rounded-full transition-all duration-500 shadow-sm shadow-indigo-500"
//                   style={{ width: `${passRate}%` }}
//                 />
//               </div>

//               <div className="flex justify-between text-[10px] text-indigo-300/60 font-mono">
//                 <span>รอบเทส: {totalRuns} รายการ</span>
//                 <span>อัปเดตล่าสุด: เมื่อครู่นี้</span>
//               </div>
//             </div>

//             <button
//               onClick={handleOpenCreateModal}
//               className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all active:scale-95 shrink-0 cursor-pointer"
//             >
//               <Plus className="w-4 h-4 stroke-[2.5]" />
//               New Test Run
//             </button>
//           </div>

//         </div>
//       </div>

//       {/* STATS SUMMARY CARDS — สไตล์ตามตัวอย่าง: การ์ดขาว แถบสีขอบบน + ไอคอนกรอบสีลอยมุมขวา */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         {statCards.map((card) => {
//           const Icon = card.icon;
//           return (
//             <div
//               key={card.key}
//               className="relative bg-white border border-slate-200/80 rounded-2xl p-4 pt-5 shadow-xs overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
//             >
//               <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${card.bar}`} />

//               <div className="flex items-start justify-between gap-3">
//                 <div className="min-w-0">
//                   <p className="text-[11px] font-bold text-slate-500">{card.label}</p>
//                   <p className={`text-3xl font-black font-mono mt-1 ${card.valueClass ?? "text-slate-900"}`}>
//                     {card.value}
//                   </p>
//                   <span
//                     className={`inline-flex mt-3 px-2.5 py-1 rounded-full text-[10px] font-bold border ${card.tagClass}`}
//                   >
//                     {card.tag}
//                   </span>
//                 </div>

//                 <div
//                   className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.iconBg} ${card.iconShadow} shadow-lg flex items-center justify-center text-white shrink-0`}
//                 >
//                   <Icon className="w-5 h-5" />
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* CHARTS SECTION */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="font-bold text-sm text-slate-900">สัดส่วนผลลัพธ์</h3>
//             <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
//               Pass Rate {passRate}%
//             </span>
//           </div>

//           <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-4">
//             <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
//               <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
//                 <path
//                   className="text-slate-100"
//                   strokeWidth="3.8"
//                   stroke="currentColor"
//                   fill="none"
//                   d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
//                 />
//                 {/* วาดส่วน "ผ่าน" ก่อน เริ่มที่ 0 */}
//                 <path
//                   className="text-emerald-500 transition-all duration-700 ease-out"
//                   strokeDasharray={`${passRate} ${100 - passRate}`}
//                   strokeDashoffset="0"
//                   strokeWidth="3.8"
//                   strokeLinecap="round"
//                   stroke="currentColor"
//                   fill="none"
//                   d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
//                 />
//                 {/* วาดส่วน "ไม่ผ่าน" ต่อจากส่วนผ่านทันที ไม่ให้ทับกัน (แก้บั๊กสีแดงไม่ขึ้น) */}
//                 <path
//                   className="text-rose-500 transition-all duration-700 ease-out"
//                   strokeDasharray={`${failRate} ${100 - failRate}`}
//                   strokeDashoffset={`-${passRate}`}
//                   strokeWidth="3.8"
//                   strokeLinecap="round"
//                   stroke="currentColor"
//                   fill="none"
//                   d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
//                 />
//               </svg>
//               <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
//                 <span className="text-2xl font-black font-mono text-slate-800">{totalCases}</span>
//                 <span className="text-[10px] font-bold text-slate-400 uppercase">Total Cases</span>
//               </div>
//             </div>

//             <div className="space-y-3 w-full sm:w-auto">
//               <div className="flex items-center justify-between sm:justify-start gap-4">
//                 <div className="flex items-center gap-2">
//                   <span className="w-3 h-3 rounded-full bg-emerald-500" />
//                   <span className="text-xs font-semibold text-slate-600">ผ่าน (Passed)</span>
//                 </div>
//                 <span className="font-mono font-bold text-xs text-slate-900">{totalPassed} เคส ({passRate}%)</span>
//               </div>

//               <div className="flex items-center justify-between sm:justify-start gap-4">
//                 <div className="flex items-center gap-2">
//                   <span className="w-3 h-3 rounded-full bg-rose-500" />
//                   <span className="text-xs font-semibold text-slate-600">ไม่ผ่าน (Failed)</span>
//                 </div>
//                 <span className="font-mono font-bold text-xs text-slate-900">{totalFailed} เคส ({failRate}%)</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="font-bold text-sm text-slate-900">ผลเทสแยกตามโปรเจกต์</h3>
//             <span className="text-xs text-slate-400 font-mono">{projectStats.length} Projects</span>
//           </div>

//           <div className="space-y-5 my-auto">
//             {projectStats.map((proj, idx) => {
//               const pRate = proj.total > 0 ? Math.round((proj.passed / proj.total) * 100) : 0;
//               const fRate = proj.total > 0 ? 100 - pRate : 0;

//               return (
//                 <div key={idx} className="space-y-2">
//                   <div className="flex items-center justify-between text-xs font-semibold">
//                     <span className="text-slate-800 truncate max-w-[220px]">{proj.name}</span>
//                     <span className="font-mono text-slate-500">
//                       {proj.passed}/{proj.total} ({pRate}%)
//                     </span>
//                   </div>

//                   <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
//                     <div
//                       className="bg-emerald-500 h-full transition-all duration-500"
//                       style={{ width: `${pRate}%` }}
//                       title={`Passed: ${proj.passed}`}
//                     />
//                     <div
//                       className="bg-rose-500 h-full transition-all duration-500"
//                       style={{ width: `${fRate}%` }}
//                       title={`Failed: ${proj.failed}`}
//                     />
//                   </div>
//                 </div>
//               );
//             })}
//           </div>

//           <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-slate-100 text-xs">
//             <div className="flex items-center gap-2">
//               <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
//               <span className="text-slate-500 font-medium">ผ่าน</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
//               <span className="text-slate-500 font-medium">ไม่ผ่าน</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Filter Options */}
//       <div className="flex items-center justify-between pt-2">
//         <h2 className="text-base font-bold text-slate-900">รายการทดสอบย้อนหลัง</h2>
//         <select
//           value={selectedProjectFilter}
//           onChange={(e) => setSelectedProjectFilter(e.target.value)}
//           className="text-xs border border-slate-200 rounded-xl px-3 py-2 font-medium bg-white text-slate-700 shadow-xs focus:outline-none focus:border-indigo-500"
//         >
//           <option value="all">ทุกโปรเจกต์</option>
//           {projectOptions.map((proj) => (
//             <option key={proj} value={proj}>
//               {proj}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* TABLE REPORT */}
//       <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full text-left border-collapse">
//             <thead>
//               <tr className="bg-[#0b0c18] text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800">
//                 <th className="py-3.5 px-4">NO</th>
//                 <th className="py-3.5 px-4">SUITE / PROJECT</th>
//                 <th className="py-3.5 px-4">TOOL</th>
//                 <th className="py-3.5 px-4">ENV</th>
//                 <th className="py-3.5 px-4">DATE</th>
//                 <th className="py-3.5 px-4 min-w-[160px]">PROGRESS</th>
//                 <th className="py-3.5 px-4">STATUS</th>
//                 <th className="py-3.5 px-4 text-center">ACTIONS</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
//               {filteredRuns.map((run, index) => {
//                 const runRate = Math.round((run.passedCases / (run.totalCases || 1)) * 100);
//                 const itemNo = String(index + 1).padStart(2, "0");

//                 return (
//                   <tr key={run.id} className="hover:bg-slate-50/80 transition-colors">
//                     <td className="py-4 px-4 font-mono text-slate-400 font-bold">{itemNo}</td>

//                     <td className="py-4 px-4">
//                       <div className="font-bold text-slate-900">{run.suiteName}</div>
//                       <div className="text-[11px] text-slate-400 font-normal">{run.projectName}</div>
//                     </td>

//                     <td className="py-4 px-4 font-mono text-slate-600">{run.tool}</td>

//                     <td className="py-4 px-4 font-mono font-bold text-slate-700">{run.environment}</td>

//                     <td className="py-4 px-4 font-mono text-slate-500">{run.runDate}</td>

//                     <td className="py-4 px-4">
//                       <div className="space-y-1">
//                         <div className="flex items-center justify-end text-[10px] font-mono text-slate-500 font-bold">
//                           <span>{runRate}%</span>
//                         </div>
//                         <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
//                           <div
//                             className="bg-indigo-600 h-full rounded-full"
//                             style={{ width: `${runRate}%` }}
//                           />
//                         </div>
//                         <div className="text-[10px] text-slate-400 font-mono">
//                           {run.passedCases}/{run.totalCases} ผ่าน · {run.failedCases} fail · {run.durationSeconds}s
//                         </div>
//                       </div>
//                     </td>

//                     <td className="py-4 px-4">
//                       {run.status === "passed" && (
//                         <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
//                           ● เสร็จสิ้น
//                         </span>
//                       )}
//                       {run.status === "partial" && (
//                         <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
//                           <Clock className="w-3 h-3 text-amber-600" /> ผ่านบางส่วน
//                         </span>
//                       )}
//                       {run.status === "failed" && (
//                         <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1">
//                           ● ล้มเหลว
//                         </span>
//                       )}
//                     </td>

//                     <td className="py-4 px-4 text-center">
//                       <div className="flex items-center justify-center gap-1.5">
//                         <ViewButton onClick={() => handleOpenViewModal(run)} />
//                         <EditButton onClick={() => handleOpenEditModal(run)} />
//                         <DeleteButton onClick={() => handleDelete(run.id)} />
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       <TestRunModal
//         isOpen={isModalOpen}
//         mode={modalMode}
//         initialData={selectedRun}
//         onClose={() => setIsModalOpen(false)}
//         onSubmit={handleSaveRun}
//       />
//     </div>
//   );
// }
"use client";

import React, { useState, useMemo } from "react";
import TestRunModal from "@/components/testing/test-run-modal";
import { TestRunItem } from "@/types/test-automation";
import TestingHeaderBanner from "@/components/testing/testing-header-banner";
import TestingStatsCards from "@/components/testing/testing-stats-cards";
import TestingChartsSection from "@/components/testing/testing-charts-section";
import TestingTableReport from "@/components/testing/testing-table-report";

const initialRuns: TestRunItem[] = [
  {
    id: 1,
    suiteName: "Login & Register",
    subText: "Row Coding Error 75-76",
    projectName: "Softpro Core API - HR",
    tool: "vitest",
    environment: "DEV",
    runDate: "2026-08-10",
    totalCases: 5,
    passedCases: 4,
    failedCases: 1,
    skippedCases: 0,
    durationSeconds: 8,
    status: "partial",
  },
];

export default function TestAutomationPage() {
  const [testRuns, setTestRuns] = useState<TestRunItem[]>(initialRuns);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "view" | "edit">("create");
  const [selectedRun, setSelectedRun] = useState<TestRunItem | null>(null);
  const [selectedProjectFilter, setSelectedProjectFilter] = useState("all");

  const filteredRuns = useMemo(() => {
    if (selectedProjectFilter === "all") return testRuns;
    return testRuns.filter((r) => r.projectName === selectedProjectFilter);
  }, [testRuns, selectedProjectFilter]);

  const totalRuns = filteredRuns.length;
  const totalCases = filteredRuns.reduce((acc, curr) => acc + curr.totalCases, 0);
  const totalPassed = filteredRuns.reduce((acc, curr) => acc + curr.passedCases, 0);
  const totalFailed = filteredRuns.reduce((acc, curr) => acc + curr.failedCases, 0);

  const passRate = totalCases > 0 ? Math.round((totalPassed / totalCases) * 100) : 0;
  const failRate = totalCases > 0 ? 100 - passRate : 0;

  const projectStats = useMemo(() => {
    const statsMap: Record<string, { name: string; passed: number; failed: number; total: number }> = {};

    testRuns.forEach((run) => {
      if (!statsMap[run.projectName]) {
        statsMap[run.projectName] = { name: run.projectName, passed: 0, failed: 0, total: 0 };
      }
      statsMap[run.projectName].passed += run.passedCases;
      statsMap[run.projectName].failed += run.failedCases;
      statsMap[run.projectName].total += run.totalCases;
    });

    return Object.values(statsMap);
  }, [testRuns]);

  const handleOpenCreateModal = () => {
    setSelectedRun(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleOpenViewModal = (run: TestRunItem) => {
    setSelectedRun(run);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (run: TestRunItem) => {
    setSelectedRun(run);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleSaveRun = (data: TestRunItem) => {
    if (modalMode === "edit") {
      setTestRuns((prev) =>
        prev.map((item) => (item.id === data.id ? data : item))
      );
    } else if (modalMode === "create") {
      setTestRuns((prev) => [data, ...prev]);
    }
  };

  const handleDelete = (id: string | number) => {
    if (confirm("คุณต้องการลบผลการทดสอบนี้ใช่หรือไม่?")) {
      setTestRuns((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const projectOptions = useMemo(() => {
    const set = new Set(testRuns.map((r) => r.projectName));
    return Array.from(set);
  }, [testRuns]);

  return (
    <div className="w-full space-y-6 select-none pb-12">
      <TestingHeaderBanner
        passRate={passRate}
        totalRuns={totalRuns}
        onOpenCreateModal={handleOpenCreateModal}
      />

      <TestingStatsCards
        totalRuns={totalRuns}
        totalCases={totalCases}
        totalPassed={totalPassed}
        totalFailed={totalFailed}
      />

      <TestingChartsSection
        passRate={passRate}
        failRate={failRate}
        totalCases={totalCases}
        totalPassed={totalPassed}
        totalFailed={totalFailed}
        projectStats={projectStats}
      />

      <TestingTableReport
        runs={filteredRuns}
        selectedProjectFilter={selectedProjectFilter}
        projectOptions={projectOptions}
        onFilterChange={setSelectedProjectFilter}
        onView={handleOpenViewModal}
        onEdit={handleOpenEditModal}
        onDelete={handleDelete}
      />

      <TestRunModal
        isOpen={isModalOpen}
        mode={modalMode}
        initialData={selectedRun}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveRun}
      />
    </div>
  );
}