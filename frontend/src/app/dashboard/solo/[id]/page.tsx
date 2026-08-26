// "use client";

// import React, { useState, useRef, useEffect } from "react";
// import Link from "next/link";
// import { 
//   ArrowLeft, 
//   Wand2, 
//   Plus, 
//   ChevronDown, 
//   GripVertical, 
//   RotateCw, 
//   Eye, 
//   X,
//   Workflow,
//   Edit3,
//   FolderKanban,
//   Calendar,
//   CheckCircle2,
//   Clock,
//   CircleDashed
// } from "lucide-react";

// // 📌 นำเข้า Dropdown ตัวใหม่ล่าสุดแทน SearchableSelect
// import { Dropdown, DropdownOption } from "@/components/ui/inputs/dropdown";
// import Checkbox from "@/components/ui/inputs/checkbox";
// import ProjectFormModal from "@/components/projects/project-form-modal";
// import { Button } from "@/components/ui/buttons/button";
// import EditButtonV2 from "@/components/ui/buttons/buttonv2/edit-buttonv2";
// import DeleteButtonV2 from "@/components/ui/buttons/buttonv2/delete-buttonv2";
// import { SoloProject } from "@/types/project";

// // 📌 Import Custom DatePicker จาก Folder ตามรูป Structure
// import { DatePicker } from "@/components/ui/inputs/date-picker";

// /* ============================================================================
//  * TableDatePickerCell Component
//  * ============================================================================ */
// export interface TableDatePickerCellProps {
//   value: string;
//   onChange: (val: string) => void;
//   placeholder?: string;
// }

// // 🎯 Helper Function แปลง ISO / YYYY-MM-DD เป็น DD-MM-YYYY
// const formatDateToDMY = (dateStr: string) => {
//   if (!dateStr) return "";
//   const cleanVal = dateStr.split("T")[0].trim();
//   const isoMatch = cleanVal.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
//   if (isoMatch) {
//     const [, y, m, d] = isoMatch;
//     return `${d.padStart(2, "0")}-${m.padStart(2, "0")}-${y}`;
//   }
//   return cleanVal;
// };

// export const TableDatePickerCell: React.FC<TableDatePickerCellProps> = ({
//   value,
//   onChange,
//   placeholder = "DD-MM-YYYY",
// }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const cellRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (cellRef.current && !cellRef.current.contains(event.target as Node)) {
//         setIsOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const displayValue = formatDateToDMY(value);

//   return (
//     <div className="relative flex items-center w-full" ref={cellRef}>
//       <button
//         type="button"
//         onClick={() => setIsOpen(!isOpen)}
//         className={`w-full flex items-center justify-between pl-7 pr-2 py-1.5 rounded-lg text-[12px] font-bold transition-all duration-150 cursor-pointer text-left select-none ${
//           isOpen
//             ? "bg-white border-indigo-500 ring-2 ring-indigo-500/20 text-slate-800 font-medium shadow-xs"
//             : "bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-slate-300 text-slate-700"
//         }`}
//       >
//         <span className={displayValue ? "text-slate-700" : "text-slate-400"}>
//           {displayValue || placeholder}
//         </span>
//         <ChevronDown
//           className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
//             isOpen ? "rotate-180 text-indigo-600" : ""
//           }`}
//         />
//       </button>

//       <Calendar
//         className={`w-3.5 h-3.5 absolute left-2 pointer-events-none transition-colors ${
//           isOpen ? "text-indigo-600" : "text-slate-400"
//         }`}
//       />

//       {isOpen && (
//         <div className="absolute z-[999] top-full left-0 mt-1.5 animate-in fade-in zoom-in-95 duration-150 origin-top-left shadow-2xl">
//           <DatePicker
//             onSelectRange={(start) => {
//               if (start) {
//                 const day = String(start.getDate()).padStart(2, "0");
//                 const month = String(start.getMonth() + 1).padStart(2, "0");
//                 const year = start.getFullYear();

//                 // 🎯 ส่งค่ากลับในรูปแบบ DD-MM-YYYY
//                 onChange(`${day}-${month}-${year}`);
//               }
//               setIsOpen(false);
//             }}
//             onCancel={() => setIsOpen(false)}
//           />
//         </div>
//       )}
//     </div>
//   );
// };


// /* ============================================================================
//  * Interfaces
//  * ============================================================================ */
// interface TaskItem {
//   id: string;
//   title: string;
//   detail: string;
//   completed: boolean;
// }

// interface Phase {
//   id: string;
//   name: string;
//   owner: string;
//   startDate: string;
//   endDate: string;
//   status: "Done" | "In Progress" | "Not Started";
//   items: TaskItem[];
//   isExpanded?: boolean;
// }

// interface StackItem {
//   id: string;
//   type: string;
//   name: string;
//   version: string;
//   layer: string;
// }

// interface WorkItem {
//   id: string;
//   title: string;
//   description: string;
//   flowDescription: string;
//   imageUrl: string;
//   date: string;
// }

// const STANDARD_PHASES: Phase[] = [
//   { id: "p1", name: "Get Requirement", owner: "NonPongpakorn", startDate: "2026-07-01", endDate: "2026-07-10", status: "Done", items: [
//     { id: "t1", title: "1. การทำงานหน้า Store", detail: "Store Max Min ปรับค่า Max Min ได้ และแก้ไข Stock(Box) Stock(Pcs) ได้", completed: true },
//     { id: "t2", title: "2. เชื่อมต่อ Database", detail: "สร้าง View เพื่อให้ระบบแสดงผลที่หน้าเอาเฉพาะข้อมูลในตารางที่สร้างเป็น View มาแสดง และ Update Realtime", completed: true }
//   ], isExpanded: true },
//   { id: "p2", name: "System Analysis", owner: "NonPongpakorn", startDate: "2026-07-10", endDate: "2026-07-13", status: "Done", items: [], isExpanded: false },
//   { id: "p3", name: "Figma Design", owner: "NonPongpakorn", startDate: "2026-08-10", endDate: "2026-08-13", status: "In Progress", items: [], isExpanded: false },
//   { id: "p4", name: "Database Design", owner: "", startDate: "", endDate: "", status: "Not Started", items: [], isExpanded: false },
//   { id: "p5", name: "Backend Development", owner: "", startDate: "", endDate: "", status: "Not Started", items: [], isExpanded: false },
//   { id: "p6", name: "Frontend Development", owner: "", startDate: "", endDate: "", status: "Not Started", items: [], isExpanded: false },
//   { id: "p7", name: "Integration", owner: "", startDate: "", endDate: "", status: "Not Started", items: [], isExpanded: false },
//   { id: "p8", name: "Testing", owner: "", startDate: "", endDate: "", status: "Not Started", items: [], isExpanded: false },
//   { id: "p9", name: "UAT", owner: "", startDate: "", endDate: "", status: "Not Started", items: [], isExpanded: false },
//   { id: "p10", name: "Deployment", owner: "", startDate: "", endDate: "", status: "Not Started", items: [], isExpanded: false },
//   { id: "p11", name: "Documentation", owner: "", startDate: "", endDate: "", status: "Not Started", items: [], isExpanded: false },
// ];

// const initialProjectInfo: SoloProject = {
//   id: "chr-synchorn",
//   name: "CHR SYNCHORN",
//   description: "พัฒนาระบบโดยการนำระบบทั้งหมดที่พัฒนานอกเหนือจากระบบ ERP ( Softpro ) มารวมกันเป็นระบบ ERP ขนาดเล็ก กำหนดให้นำ StorePC StoreSP EDP Planing มารวมกันและมี Plan ของระบบใหม่เพิ่มเติม เพื่อลดเวลาการทำงานให้กับพนักงาน Kanban Digital และเพิ่มเติมระบบ Maintainace",
//   projectType: "Web Application",
//   department: "ระบบดิจิตอลและIT",
//   owner: "NonPongpakorn",
//   requester: "วางแผนการผลิตและTPS",
//   priority: "สูง",
//   status: "Planning",
//   startDate: "2026-08-08",
//   endDate: "2026-08-15",
//   progress: 0,
//   language: "TypeScript",
//   framework: "Next.js",
//   library: "Tailwind CSS",
//   database: "SQL Server",
//   apiService: "REST API",
//   otherTech: "",
// };

// export default function ProjectDetailPage() {
//   const [projectInfo, setProjectInfo] = useState<SoloProject>(initialProjectInfo);
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);

//   const [phases, setPhases] = useState<Phase[]>(STANDARD_PHASES);
//   const [newPhaseName, setNewPhaseName] = useState("");
  
//   const [newTaskTitle, setNewTaskTitle] = useState<{ [phaseId: string]: string }>({});
//   const [newTaskDetail, setNewTaskDetail] = useState<{ [phaseId: string]: string }>({});

//   const [stacks, setStacks] = useState<StackItem[]>([
//     { id: "s1", type: "ภาษา (Language)", name: "TypeScript", version: "5.0", layer: "Frontend" },
//     { id: "s2", type: "Framework", name: "Next.js", version: "14.2", layer: "Frontend" },
//   ]);
//   const [stackType, setStackType] = useState("ภาษา (Language)");
//   const [stackName, setStackName] = useState("");
//   const [stackVersion, setStackVersion] = useState("");
//   const [stackLayer, setStackLayer] = useState("");

//   const [works, setWorks] = useState<WorkItem[]>([
//     {
//       id: "w1",
//       title: "Test1",
//       description: "Test1",
//       flowDescription: "Admin -> จัดการระบบทั้งหมด / User -> ดูรายงานได้อย่างเดียว",
//       imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
//       date: "13/08/2026"
//     },
//     {
//       id: "w2",
//       title: "Test2",
//       description: "Test2",
//       flowDescription: "การรับส่งข้อมูลผ่าน Realtime WebSocket อัปเดตสถานะอัตโนมัติ",
//       imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
//       date: "13/08/2026"
//     }
//   ]);
  
//   const [flippedCards, setFlippedCards] = useState<{ [id: string]: boolean }>({});

//   const [isAddWorkOpen, setIsAddWorkOpen] = useState(false);
//   const [editingWork, setEditingWork] = useState<WorkItem | null>(null);
//   const [isPreviewOpen, setIsPreviewOpen] = useState(false);
//   const [previewIndex, setPreviewIndex] = useState(0);

//   const [workTitle, setWorkTitle] = useState("");
//   const [workDesc, setWorkDesc] = useState("");
//   const [workFlow, setWorkFlow] = useState("");
//   const [workImage, setWorkImage] = useState<string | null>(null);

//   // 🎯 Dropdown Options Data Format
//   const stackTypeOptions: DropdownOption[] = [
//     { label: "ภาษา (Language)", value: "ภาษา (Language)" },
//     { label: "Framework", value: "Framework" },
//     { label: "Library / Package", value: "Library / Package" },
//     { label: "Database", value: "Database" }
//   ];

//   const stackNameOptions: DropdownOption[] = [
//     { label: "Next.js", value: "Next.js" },
//     { label: "React", value: "React" },
//     { label: "TypeScript", value: "TypeScript" },
//     { label: "ASP.NET Core", value: "ASP.NET Core" },
//     { label: "SQL Server", value: "SQL Server" },
//     { label: "Tailwind CSS", value: "Tailwind CSS" },
//     { label: "Zustand", value: "Zustand" },
//     { label: "Docker", value: "Docker" }
//   ];

//   const stackLayerOptions: DropdownOption[] = [
//     { label: "Frontend", value: "Frontend" },
//     { label: "Backend", value: "Backend" },
//     { label: "Database", value: "Database" },
//     { label: "DevOps", value: "DevOps" }
//   ];

//   const allTasks = phases.flatMap(p => p.items);
//   const completedTasks = allTasks.filter(t => t.completed);
//   const overallProgress = allTasks.length > 0 
//     ? Math.round((completedTasks.length / allTasks.length) * 100) 
//     : 0;

//   const calculatePhaseProgress = (phase: Phase) => {
//     if (phase.items.length === 0) return phase.status === "Done" ? 100 : 0;
//     const done = phase.items.filter(i => i.completed).length;
//     return Math.round((done / phase.items.length) * 100);
//   };

//   const handleUpdateProject = (updatedProject: SoloProject) => {
//     setProjectInfo(updatedProject);
//     setIsEditModalOpen(false);
//   };

//   const handleAutoGeneratePhases = () => {
//     setPhases(STANDARD_PHASES);
//   };

//   const handleAddPhase = () => {
//     if (!newPhaseName.trim()) return;
//     const newP: Phase = {
//       id: Date.now().toString(),
//       name: newPhaseName,
//       owner: "",
//       startDate: "",
//       endDate: "",
//       status: "Not Started",
//       items: [],
//       isExpanded: true
//     };
//     setPhases([...phases, newP]);
//     setNewPhaseName("");
//   };

//   const togglePhaseExpand = (id: string) => {
//     setPhases(phases.map(p => p.id === id ? { ...p, isExpanded: !p.isExpanded } : p));
//   };

//   const handleAddTask = (phaseId: string) => {
//     const title = newTaskTitle[phaseId];
//     if (!title || !title.trim()) return;

//     setPhases(phases.map(p => {
//       if (p.id === phaseId) {
//         const newTask: TaskItem = {
//           id: Date.now().toString(),
//           title: title,
//           detail: newTaskDetail[phaseId] || "",
//           completed: false
//         };
//         return { ...p, items: [...p.items, newTask] };
//       }
//       return p;
//     }));

//     setNewTaskTitle({ ...newTaskTitle, [phaseId]: "" });
//     setNewTaskDetail({ ...newTaskDetail, [phaseId]: "" });
//   };

//   const toggleTaskComplete = (phaseId: string, taskId: string) => {
//     setPhases(phases.map(p => {
//       if (p.id === phaseId) {
//         const updatedItems = p.items.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
//         return { ...p, items: updatedItems };
//       }
//       return p;
//     }));
//   };

//   const handleDeleteTask = (phaseId: string, taskId: string) => {
//     setPhases(phases.map(p => {
//       if (p.id === phaseId) {
//         return { ...p, items: p.items.filter(t => t.id !== taskId) };
//       }
//       return p;
//     }));
//   };

//   const handleDeletePhase = (id: string) => {
//     setPhases(phases.filter(p => p.id !== id));
//   };

//   const handleDragStart = (e: React.DragEvent, index: number) => {
//     e.dataTransfer.setData("text/plain", index.toString());
//   };

//   const handleDrop = (e: React.DragEvent, dropIndex: number) => {
//     const dragIndex = Number(e.dataTransfer.getData("text/plain"));
//     if (isNaN(dragIndex) || dragIndex === dropIndex) return;

//     const newPhases = [...phases];
//     const [draggedItem] = newPhases.splice(dragIndex, 1);
//     newPhases.splice(dropIndex, 0, draggedItem);
//     setPhases(newPhases);
//   };

//   const handleAddStack = () => {
//     if (!stackName) return;
//     setStacks([...stacks, {
//       id: Date.now().toString(),
//       type: stackType,
//       name: stackName,
//       version: stackVersion,
//       layer: stackLayer || "Frontend"
//     }]);
//     setStackName("");
//     setStackVersion("");
//   };

//   const handleDeleteStack = (id: string) => {
//     setStacks(stacks.filter(s => s.id !== id));
//   };

//   const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => setWorkImage(reader.result as string);
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleOpenAddWorkModal = () => {
//     setEditingWork(null);
//     setWorkTitle("");
//     setWorkDesc("");
//     setWorkFlow("");
//     setWorkImage(null);
//     setIsAddWorkOpen(true);
//   };

//   const handleOpenEditWorkModal = (work: WorkItem) => {
//     setEditingWork(work);
//     setWorkTitle(work.title);
//     setWorkDesc(work.description);
//     setWorkFlow(work.flowDescription);
//     setWorkImage(work.imageUrl);
//     setIsAddWorkOpen(true);
//   };

//   const handleSaveWork = () => {
//     if (!workTitle) return;

//     if (editingWork) {
//       setWorks(works.map(w => w.id === editingWork.id ? {
//         ...w,
//         title: workTitle,
//         description: workDesc,
//         flowDescription: workFlow,
//         imageUrl: workImage || w.imageUrl
//       } : w));
//     } else {
//       const newWork: WorkItem = {
//         id: Date.now().toString(),
//         title: workTitle,
//         description: workDesc,
//         flowDescription: workFlow,
//         imageUrl: workImage || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
//         date: new Date().toLocaleDateString("th-TH")
//       };
//       setWorks([...works, newWork]);
//     }

//     setIsAddWorkOpen(false);
//     setEditingWork(null);
//     setWorkTitle("");
//     setWorkDesc("");
//     setWorkFlow("");
//     setWorkImage(null);
//   };

//   const toggleCardFlip = (id: string) => {
//     setFlippedCards(prev => ({ ...prev, [id]: !prev[id] }));
//   };

//   return (
//     <div className="w-full space-y-6 pb-12 text-slate-800">
      
//       {/* 🚀 Dynamic Dark Header & Integrated Info Card */}
//       <div className="rounded-2xl bg-white border border-slate-200 shadow-sm">
//         <div className="relative isolate overflow-hidden bg-gradient-to-r from-[#0f1123] via-[#161936] to-[#201c47] p-6 sm:p-8 text-white rounded-t-2xl border-b border-indigo-900/40">
//           <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none -z-10" />
//           <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-violet-600/10 rounded-full blur-2xl pointer-events-none -z-10" />

//           <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
//             <div className="space-y-3 max-w-2xl">
//               <div className="flex items-center gap-2 flex-wrap">
//                 <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wide">
//                   <FolderKanban className="w-3.5 h-3.5" />
//                   PROJECT DETAILS
//                 </span>
//                 <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700">
//                   {projectInfo.department}
//                 </span>
//               </div>

//               <div>
//                 <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
//                   {projectInfo.name}
//                 </h1>
//                 <p className="text-xs sm:text-sm text-slate-400 mt-1 line-clamp-2">
//                   {projectInfo.description}
//                 </p>
//               </div>
//             </div>

//             <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-slate-800/80">
//               <div className="min-w-40">
//                 <div className="flex justify-between items-center text-xs mb-1.5">
//                   <span className="text-slate-400 font-medium">ความคืบหน้ารวม</span>
//                   <span className="text-indigo-400 font-bold font-mono">{overallProgress}%</span>
//                 </div>
//                 <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
//                   <div 
//                     className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full transition-all duration-500 shadow-[0_0_12px_rgba(99,102,241,0.5)]" 
//                     style={{ width: `${overallProgress}%` }} 
//                   />
//                 </div>
//               </div>

//               <div className="flex items-center gap-2 w-full sm:w-auto">
//                 <Link href="/dashboard/solo" className="w-full sm:w-auto">
//                   <Button 
//                     className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 normal-case text-xs font-bold py-2 px-3.5 flex items-center justify-center gap-2 shadow-sm"
//                   >
//                     <ArrowLeft className="w-4 h-4" />
//                     กลับ
//                   </Button>
//                 </Link>

//                 <Button 
//                   onClick={() => setIsEditModalOpen(true)}
//                   className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_4px_16px_rgba(79,70,229,0.4)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.6)] normal-case text-xs font-bold py-2 px-4 flex items-center justify-center gap-1.5 border border-indigo-500/30"
//                 >
//                   <Edit3 className="w-3.5 h-3.5" />
//                   แก้ไขโครงการ
//                 </Button>
//               </div>
//             </div>

//           </div>
//         </div>

//         <div className="bg-white p-6 space-y-6 rounded-b-2xl">
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs">
//             <div>
//               <span className="text-slate-400 font-medium block mb-1.5">Status</span>
//               <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md font-semibold">
//                 <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
//                 {projectInfo.status}
//               </span>
//             </div>
//             <div>
//               <span className="text-slate-400 font-medium block mb-1.5">Priority</span>
//               <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold border ${
//                 projectInfo.priority === "สูง" 
//                   ? "bg-rose-50 text-rose-600 border-rose-100" 
//                   : "bg-emerald-50 text-emerald-700 border-emerald-100"
//               }`}>
//                 <span className={`w-1.5 h-1.5 rounded-full ${projectInfo.priority === "สูง" ? "bg-rose-500" : "bg-emerald-500"}`} />
//                 {projectInfo.priority === "สูง" ? "Critical (สูง)" : "Normal (ปกติ)"}
//               </span>
//             </div>
//             <div>
//               <span className="text-slate-400 font-medium block mb-1.5">Owner</span>
//               <div className="flex items-center gap-2">
//                 <span className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
//                   {projectInfo.owner?.charAt(0) || "?"}
//                 </span>
//                 <span className="font-bold text-slate-800">{projectInfo.owner}</span>
//               </div>
//             </div>
//             <div>
//               <span className="text-slate-400 font-medium block mb-1.5">Requester</span>
//               <div className="flex items-center gap-2">
//                 <span className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
//                   {projectInfo.requester?.charAt(0) || "?"}
//                 </span>
//                 <span className="font-bold text-slate-800">{projectInfo.requester}</span>
//               </div>
//             </div>
//           </div>

//           <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs">
//             <div>
//               <span className="text-slate-400 font-medium block mb-1.5">Start Date</span>
//               <span className="inline-block px-2.5 py-1 bg-sky-50 text-sky-700 border border-sky-100 rounded-md font-bold font-mono">
//                 {projectInfo.startDate}
//               </span>
//             </div>
//             <div>
//               <span className="text-slate-400 font-medium block mb-1.5">Planned End</span>
//               <span className="inline-block px-2.5 py-1 bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-100 rounded-md font-bold font-mono">
//                 {projectInfo.endDate}
//               </span>
//             </div>
//             <div className="col-span-2 md:col-span-2">
//               <span className="text-slate-400 font-medium block mb-1.5">Project Type</span>
//               <span className="inline-block px-2.5 py-1 bg-slate-800 text-white rounded-md font-bold">
//                 {projectInfo.projectType}
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ============================================================================
//       * Phase Section - Auto Status & TableDatePickerCell Integration
//       * ============================================================================ */}
//       <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
//         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
//           <div className="flex items-center gap-2.5">
//             <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg">
//               <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
//               <span className="text-indigo-900 font-bold text-xs tracking-wide">Phase / ลำดับงาน</span>
//             </div>
            
//             <button 
//               onClick={handleAutoGeneratePhases}
//               title="สร้าง Phase อัตโนมัติตามมาตรฐาน"
//               className="px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-lg border border-slate-200 hover:border-indigo-200 transition-all flex items-center gap-1.5 text-xs font-semibold shadow-2xs group"
//             >
//               <Wand2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
//               <span>สร้าง Standard Phase</span>
//             </button>
//           </div>

//           <div className="flex items-center gap-2 w-full sm:w-auto">
//             <input 
//               type="text" 
//               placeholder="ชื่อขั้นตอนใหม่..."
//               value={newPhaseName}
//               onChange={(e) => setNewPhaseName(e.target.value)}
//               className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-xs w-full sm:w-52 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50/50 focus:bg-white"
//             />
//             <Button 
//               onClick={handleAddPhase}
//               className="w-auto! bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_4px_12px_rgba(79,70,229,0.25)] hover:shadow-[0_6px_16px_rgba(79,70,229,0.35)] normal-case text-xs font-bold py-1.5 px-3.5 flex items-center gap-1 shrink-0"
//             >
//               <Plus className="w-3.5 h-3.5" />
//               เพิ่ม Phase
//             </Button>
//           </div>
//         </div>

//         <div className="overflow-hidden border border-slate-200/90 rounded-xl shadow-2xs bg-white">
//           <div className="overflow-x-auto">
//             <table className="w-full text-left text-xs border-collapse">
//               <thead className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-slate-200 font-semibold border-b border-slate-800 select-none">
//                 <tr>
//                   <th className="py-3.5 px-3 w-10 text-center"></th>
//                   <th className="py-3.5 px-2 w-12 text-center font-mono text-[11px] font-bold uppercase tracking-wider text-slate-200">#</th>
//                   <th className="py-3.5 px-3 min-w-[220px] tracking-wide">Phase Name</th>
//                   <th className="py-3.5 px-3 w-36 tracking-wide">Owner</th>
//                   <th className="py-3.5 px-3 w-40 tracking-wide">Start Date</th>
//                   <th className="py-3.5 px-3 w-40 tracking-wide">End Date</th>
//                   <th className="py-3.5 px-3 w-36 tracking-wide">Status</th>
//                   <th className="py-3.5 px-3 w-36 tracking-wide">Progress</th>
//                   <th className="py-3.5 px-3 w-12 text-center">Action</th>
//                 </tr>
//               </thead>

//               <tbody className="divide-y divide-slate-100">
//                 {phases.map((phase, idx) => {
//                   const phaseProgress = calculatePhaseProgress(phase);
//                   const totalTasks = phase.items.length;
//                   const completedTasksCount = phase.items.filter((i) => i.completed).length;

//                   let autoStatus: "Not Started" | "In Progress" | "Done" = "Not Started";
//                   if (totalTasks > 0 && completedTasksCount === totalTasks) {
//                     autoStatus = "Done";
//                   } else if (completedTasksCount > 0) {
//                     autoStatus = "In Progress";
//                   }

//                   const isDone = autoStatus === "Done";
//                   const isInProgress = autoStatus === "In Progress";

//                   return (
//                     <React.Fragment key={phase.id}>
//                       <tr 
//                         draggable 
//                         onDragStart={(e) => handleDragStart(e, idx)}
//                         onDragOver={(e) => e.preventDefault()}
//                         onDrop={(e) => handleDrop(e, idx)}
//                         className="hover:bg-indigo-50/30 transition-colors group"
//                       >
//                         <td className="py-2.5 px-3 text-center cursor-grab active:cursor-grabbing text-slate-300 group-hover:text-slate-500 transition-colors">
//                           <GripVertical className="w-4 h-4 mx-auto" />
//                         </td>

//                         <td className="py-2.5 px-2 text-center">
//                           <div className="flex items-center justify-center gap-1">
//                             <button 
//                               onClick={() => togglePhaseExpand(phase.id)}
//                               className={`p-1 rounded-md transition-transform duration-200 hover:bg-slate-200/70 text-slate-500 ${phase.isExpanded ? "rotate-0" : "-rotate-90"}`}
//                             >
//                               <ChevronDown className="w-3.5 h-3.5" />
//                             </button>
//                             <span className="font-mono text-slate-700 text-xs font-extrabold tracking-tight min-w-[20px]">
//                               {String(idx + 1).padStart(2, '0')}
//                             </span>
//                           </div>
//                         </td>

//                         <td className="py-2.5 px-3">
//                           <input 
//                             type="text" 
//                             value={phase.name}
//                             onChange={(e) => {
//                               const val = e.target.value;
//                               setPhases(phases.map(p => p.id === phase.id ? { ...p, name: val } : p));
//                             }}
//                             className="w-full px-2.5 py-1.5 bg-transparent border border-transparent hover:border-slate-200 focus:border-indigo-500 focus:bg-white rounded-md font-bold text-slate-900 text-sm tracking-tight transition-all focus:outline-none"
//                           />
//                         </td>

//                         <td className="py-2.5 px-3">
//                           <input 
//                             type="text" 
//                             value={phase.owner}
//                             placeholder="ระบุผู้รับผิดชอบ"
//                             onChange={(e) => {
//                               const val = e.target.value;
//                               setPhases(phases.map(p => p.id === phase.id ? { ...p, owner: val } : p));
//                             }}
//                             className="w-full px-2.5 py-1.5 bg-transparent border border-transparent hover:border-slate-200 focus:border-indigo-500 focus:bg-white rounded-md font-bold text-slate-700 transition-all focus:outline-none"
//                           />
//                         </td>

//                         {/* 📅 Custom DatePicker Cell สำหรับ Start Date */}
//                         <td className="py-2.5 px-3">
//                           <TableDatePickerCell
//                             value={phase.startDate}
//                             placeholder="DD-MM-YYYY"
//                             onChange={(val) => {
//                               setPhases(phases.map(p => p.id === phase.id ? { ...p, startDate: val } : p));
//                             }}
//                           />
//                         </td>

//                         {/* 📅 Custom DatePicker Cell สำหรับ End Date */}
//                         <td className="py-2.5 px-3">
//                           <TableDatePickerCell
//                             value={phase.endDate}
//                             placeholder="DD-MM-YYYY"
//                             onChange={(val) => {
//                               setPhases(phases.map(p => p.id === phase.id ? { ...p, endDate: val } : p));
//                             }}
//                           />
//                         </td>

//                         <td className="py-2.5 px-3">
//                           <div
//                             className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-bold border transition-all duration-300 w-fit select-none ${
//                               isDone
//                                 ? "bg-emerald-50 text-emerald-700 border-emerald-200/80 shadow-2xs"
//                                 : isInProgress
//                                 ? "bg-indigo-50 text-indigo-700 border-indigo-200/80 shadow-2xs"
//                                 : "bg-slate-100/80 text-slate-500 border-slate-200/80"
//                             }`}
//                           >
//                             {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 animate-in zoom-in-50 duration-200" />}
//                             {isInProgress && <Clock className="w-3.5 h-3.5 text-indigo-600 animate-spin-slow" />}
//                             {!isDone && !isInProgress && <CircleDashed className="w-3.5 h-3.5 text-slate-400" />}
                            
//                             <span>{autoStatus}</span>
//                           </div>
//                         </td>

//                         <td className="py-2.5 px-3">
//                           <div className="flex items-center gap-2">
//                             <div className="flex-1 bg-slate-100 rounded-full h-2 border border-slate-200/80 overflow-hidden">
//                               <div 
//                                 className={`h-full transition-all duration-500 rounded-full ${
//                                   isDone 
//                                     ? "bg-indigo-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" 
//                                     : isInProgress
//                                     ? "bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.3)]"
//                                     : "bg-slate-300"
//                                 }`} 
//                                 style={{ width: `${phaseProgress}%` }}
//                               />
//                             </div>
//                             <span className="font-mono text-[12px] font-bold text-slate-600 min-w-[34px] text-right">
//                               {phaseProgress}%
//                             </span>
//                           </div>
//                         </td>

//                         <td className="py-2.5 px-3 text-center">
//                           <DeleteButtonV2 
//                             onClick={() => handleDeletePhase(phase.id)}
//                             title="ลบ Phase นี้"
//                           />
//                         </td>
//                       </tr>

//                       <tr>
//                         <td colSpan={9} className="p-0 border-none">
//                           <div className={`grid transition-all duration-300 ease-in-out ${
//                             phase.isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
//                           }`}>
//                             <div className="overflow-hidden">
//                               <div className="bg-slate-50/80 p-4 pl-12 border-t border-b border-slate-200/60 space-y-3">
                                
//                                 <div className="flex items-center justify-between">
//                                   <h4 className="font-semibold text-slate-700 text-xs flex items-center gap-1.5">
//                                     <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
//                                     รายการ Sub-tasks ในเฟสนี้ ({completedTasksCount}/{totalTasks})
//                                   </h4>
//                                 </div>

//                                 <div className="space-y-2">
//                                   {phase.items.map((task) => (
//                                     <div 
//                                       key={task.id} 
//                                       className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 ${
//                                         task.completed 
//                                           ? "bg-slate-50/80 border-slate-200/60 shadow-2xs" 
//                                           : "bg-white border-slate-200 shadow-xs hover:border-indigo-200"
//                                       }`}
//                                     >
//                                       <div className="pt-0.5">
//                                         <Checkbox 
//                                           checked={task.completed}
//                                           onChange={() => toggleTaskComplete(phase.id, task.id)}
//                                         />
//                                       </div>

//                                       <div className="flex-1 min-w-0">
//                                         <h5 className="relative inline-block text-xs font-bold text-slate-800 transition-colors duration-200">
//                                           <span className={`transition-all duration-300 ${
//                                             task.completed ? "text-slate-400" : "text-slate-800"
//                                           }`}>
//                                             {task.title}
//                                           </span>
//                                           <span 
//                                             className={`absolute left-0 top-1/2 h-[1.5px] bg-slate-400 transition-all duration-300 ease-out pointer-events-none ${
//                                               task.completed ? "w-full" : "w-0"
//                                             }`}
//                                           />
//                                         </h5>
                                        
//                                         {task.detail && (
//                                           <p className={`text-[11px] mt-0.5 transition-colors duration-200 ${
//                                             task.completed ? "text-slate-400/80" : "text-slate-500"
//                                           }`}>
//                                             {task.detail}
//                                           </p>
//                                         )}
//                                       </div>

//                                       <DeleteButtonV2 
//                                         onClick={() => handleDeleteTask(phase.id, task.id)}
//                                         className="scale-75"
//                                         title="ลบ Task"
//                                       />
//                                     </div>
//                                   ))}
//                                 </div>

//                                 <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-slate-200/50">
//                                   <input 
//                                     type="text" 
//                                     placeholder="ชื่อรายการงาน เช่น ออกแบบ Schema..."
//                                     value={newTaskTitle[phase.id] || ""}
//                                     onChange={(e) => setNewTaskTitle({ ...newTaskTitle, [phase.id]: e.target.value })}
//                                     className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs w-full focus:outline-none focus:border-indigo-500 shadow-2xs"
//                                   />
//                                   <input 
//                                     type="text" 
//                                     placeholder="รายละเอียดเพิ่มเติม (Optional)"
//                                     value={newTaskDetail[phase.id] || ""}
//                                     onChange={(e) => setNewTaskDetail({ ...newTaskDetail, [phase.id]: e.target.value })}
//                                     className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs w-full focus:outline-none focus:border-indigo-500 shadow-2xs"
//                                   />
//                                   <Button 
//                                     onClick={() => handleAddTask(phase.id)}
//                                     className="w-auto! bg-indigo-600 hover:bg-indigo-700 text-white normal-case text-xs font-bold py-1.5 px-3.5 flex items-center gap-1 shrink-0 shadow-2xs"
//                                   >
//                                     <Plus className="w-3.5 h-3.5" />
//                                     เพิ่ม Task
//                                   </Button>
//                                 </div>

//                               </div>
//                             </div>
//                           </div>
//                         </td>
//                       </tr>
//                     </React.Fragment>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//       {/* END FUNCTION - PHASE */}

//       {/* 🛠️ Stack Section - Updated with Custom Dropdown */}
//       <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
//         <h3 className="font-bold text-slate-800 text-sm">Stack / Library</h3>
        
//         <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
//           <div>
//             <Dropdown
//               label="ประเภท"
//               options={stackTypeOptions}
//               value={stackType}
//               onChange={setStackType}
//               placeholder="เลือกประเภท..."
//             />
//           </div>

//           <div>
//             <Dropdown
//               label="ชื่อ"
//               options={stackNameOptions}
//               value={stackName}
//               onChange={setStackName}
//               placeholder="เลือกรายการ..."
//             />
//           </div>

//           <div>
//             <label className="block text-xs font-bold text-slate-700 mb-1">เวอร์ชัน</label>
//             <input 
//               type="text" 
//               placeholder="เช่น 14.2" 
//               value={stackVersion}
//               onChange={(e) => setStackVersion(e.target.value)}
//               className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold transition-all"
//             />
//           </div>

//           <div className="flex gap-2 items-end">
//             <div className="flex-1">
//               <Dropdown
//                 label="Layer *"
//                 options={stackLayerOptions}
//                 value={stackLayer}
//                 onChange={setStackLayer}
//                 placeholder="เลือก Layer..."
//               />
//             </div>
//             <Button 
//               onClick={handleAddStack}
//               className="w-auto! bg-indigo-600 hover:bg-indigo-700 shadow-[0_4px_12px_rgba(79,70,229,0.25)] hover:shadow-[0_6px_16px_rgba(79,70,229,0.4)] normal-case text-xs font-bold px-4 py-2 self-end h-[38px] flex items-center gap-1 shrink-0"
//             >
//               <Plus className="w-3.5 h-3.5" />
//               เพิ่ม
//             </Button>
//           </div>
//         </div>

//         <div className="pt-2">
//           {stacks.length === 0 ? (
//             <p className="text-center text-slate-400 text-xs py-4 border border-dashed border-slate-200 rounded-xl">
//               ยังไม่มีรายการ Stack / Library — เพิ่มด้านบนเพื่อให้หน้า Flow & Diagram สร้าง Architecture Diagram ได้
//             </p>
//           ) : (
//             <div className="flex flex-wrap gap-2">
//               {stacks.map((st) => (
//                 <div key={st.id} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium">
//                   <span className="text-slate-400 text-[10px]">{st.type}:</span>
//                   <span className="font-bold text-slate-800">{st.name}</span>
//                   {st.version && <span className="text-slate-500">v{st.version}</span>}
//                   <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200">{st.layer}</span>
//                   <button onClick={() => handleDeleteStack(st.id)} className="text-slate-400 hover:text-rose-500 ml-1">
//                     <X className="w-3 h-3" />
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//       {/* END FUNCTION - STACK / LIBRARY */}


//       {/* Timeline Section */}
//       <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-0">
//         {/* Header Title */}
//         <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between">
//           <h3 className="font-extrabold text-slate-900 text-base tracking-tight">Project Timeline</h3>
//         </div>
        
//         <div className="p-3 overflow-x-auto">
//           <div className="min-w-[850px]">
//             {/* Table Header - Dark Navy (#0f172a) พร้อมขอบโค้งมน rounded-t-xl */}
//             <div className="grid grid-cols-12 bg-[#0f172a] py-3.5 text-xs font-extrabold text-white text-center items-center rounded-t-xl shadow-xs">
//               <div className="col-span-1 text-center">#</div>
//               <div className="col-span-3 text-left pl-3">Activity</div>
//               <div className="col-span-1">มิ.ย.</div>
//               <div className="col-span-1">ก.ค.</div>
//               <div className="col-span-1">ส.ค.</div>
//               <div className="col-span-1">ก.ย.</div>
//               <div className="col-span-1">ต.ค.</div>
//               <div className="col-span-1">พ.ย.</div>
//               <div className="col-span-2">ธ.ค.</div>
//             </div>

//             {/* Rows */}
//             <div className="divide-y divide-slate-100 text-xs bg-white border-x border-b border-slate-100 rounded-b-xl">
//               {phases.map((phase, idx) => {
//                 const startDateStr = phase.startDate || "01-07-2026";
//                 const endDateStr = phase.endDate || "10-07-2026";

//                 return (
//                   <div key={phase.id} className="grid grid-cols-12 py-3 items-center hover:bg-slate-50/70 transition-colors">
//                     {/* Column 1: # (เลข 01, 02 ตัวหนาเด่น) */}
//                     <div className="col-span-1 text-center font-extrabold text-slate-900 text-xs">
//                       {String(idx + 1).padStart(2, '0')}
//                     </div>

//                     {/* Column 2: Activity Name (ตัวหนาตามรูปที่ 2 & 3) */}
//                     <div className="col-span-3 text-left pl-3 font-bold text-slate-900 text-sm truncate">
//                       {phase.name}
//                     </div>

//                     {/* Column 3-12: Rounded Gantt Bar & Date Pill */}
//                     <div className="col-span-8 relative h-7 bg-slate-100/60 rounded-full border border-slate-200/50 flex items-center px-1">
//                       {phase.startDate && (
//                         <div 
//                           className="h-5 bg-indigo-600 rounded-full flex items-center justify-between px-2 shadow-xs transition-all" 
//                           style={{
//                             marginLeft: `${(idx * 7) % 60}%`,
//                             width: `${Math.max(32, 100 - (idx * 8))}%`
//                           }} 
//                         >
//                           {/* Start Date Pill */}
//                           <span className="font-mono text-[10px] font-bold text-white tracking-tighter bg-indigo-800/60 px-2 py-0.5 rounded-full shadow-2xs">
//                             {startDateStr}
//                           </span>
//                           {/* End Date Pill */}
//                           <span className="font-mono text-[10px] font-bold text-white tracking-tighter bg-indigo-800/60 px-2 py-0.5 rounded-full shadow-2xs">
//                             {endDateStr}
//                           </span>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         </div>
//       </div>
//       {/* END FUNCTION - TIMELINE */}

//       {/* Present / Showcase Section */}
//       <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
//         <div className="flex items-center justify-between">
//           <h3 className="font-bold text-slate-800 text-sm">Present ผลงาน / หน้าจอระบบ</h3>
//           <div className="flex items-center gap-2">
//             <Button 
//               onClick={() => setIsPreviewOpen(true)}
//               className="w-auto! bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs hover:shadow-sm normal-case text-xs font-bold py-1.5 px-3 flex items-center gap-1.5"
//             >
//               <Eye className="w-3.5 h-3.5" />
//               พรีวิว
//             </Button>
//             <Button 
//               onClick={handleOpenAddWorkModal}
//               className="w-auto! bg-indigo-600 hover:bg-indigo-700 shadow-[0_4px_12px_rgba(79,70,229,0.25)] hover:shadow-[0_6px_16px_rgba(79,70,229,0.4)] normal-case text-xs font-bold py-1.5 px-3 flex items-center gap-1"
//             >
//               <Plus className="w-3.5 h-3.5" />
//               เพิ่มผลงาน
//             </Button>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
//           {works.map((work) => {
//             const isFlipped = flippedCards[work.id];
//             return (
//               <div key={work.id} className="group relative [perspective:1000px] h-[260px]">
//                 <div className={`relative w-full h-full duration-500 [transform-style:preserve-3d] transition-transform rounded-xl border border-slate-200 shadow-xs ${isFlipped ? "[transform:rotateY(180deg)]" : ""}`}>
                  
//                   <div className="absolute inset-0 w-full h-full bg-white rounded-xl [backface-visibility:hidden] p-3 flex flex-col justify-between">
//                     <div 
//                       onClick={() => toggleCardFlip(work.id)} 
//                       className="cursor-pointer relative flex-1 bg-slate-100 rounded-lg overflow-hidden group/img"
//                     >
//                       <img src={work.imageUrl} alt={work.title} className="w-full h-full object-cover" />
//                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
//                         <RotateCw className="w-4 h-4" />
//                         คลิกเพื่อดู Flow
//                       </div>
//                     </div>
                    
//                     <div className="pt-2 flex items-center justify-between">
//                       <div>
//                         <h4 className="font-bold text-slate-900 text-xs">{work.title}</h4>
//                         <p className="text-[10px] text-slate-400">บันทึก {work.date}</p>
//                       </div>

//                       <div className="flex items-center gap-2">
//                         <EditButtonV2 
//                           onClick={() => handleOpenEditWorkModal(work)}
//                           title="แก้ไขผลงาน"
//                         />
//                         <DeleteButtonV2 
//                           onClick={() => setWorks(works.filter(w => w.id !== work.id))}
//                           title="ลบผลงาน"
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   <div className="absolute inset-0 w-full h-full bg-slate-900 text-white rounded-xl [backface-visibility:hidden] [transform:rotateY(180deg)] p-4 flex flex-col justify-between">
//                     <div>
//                       <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
//                         <span className="text-[11px] font-bold text-indigo-400 flex items-center gap-1">
//                           <Workflow className="w-3.5 h-3.5" />
//                           Workflow Diagram
//                         </span>
//                         <button onClick={() => toggleCardFlip(work.id)} className="text-slate-400 hover:text-white">
//                           <RotateCw className="w-3.5 h-3.5" />
//                         </button>
//                       </div>
//                       <h5 className="font-bold text-xs mb-1">{work.title}</h5>
//                       <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800">
//                         {work.flowDescription || "ไม่มีการระบุ Workflow"}
//                       </p>
//                     </div>

//                     <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
//                       <p className="text-[10px] text-slate-500">คลิกไอคอนหมุนเพื่อกลับไปดูรูป</p>
                      
//                       <div className="flex items-center gap-2">
//                         <EditButtonV2 
//                           onClick={() => handleOpenEditWorkModal(work)}
//                           title="แก้ไขผลงาน"
//                         />
//                         <DeleteButtonV2 
//                           onClick={() => setWorks(works.filter(w => w.id !== work.id))}
//                           title="ลบผลงาน"
//                         />
//                       </div>
//                     </div>
//                   </div>

//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       {/* Add Work Modal */}
//       {isAddWorkOpen && (
//         <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
//           <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
//             <div className="flex items-center justify-between border-b border-slate-100 pb-3">
//               <h3 className="font-bold text-slate-900 text-sm">
//                 {editingWork ? "แก้ไขผลงานของโครงการ" : "เพิ่มผลงานของโครงการ"}
//               </h3>
//               <button onClick={() => setIsAddWorkOpen(false)} className="text-slate-400 hover:text-slate-600">
//                 <X className="w-4 h-4" />
//               </button>
//             </div>

//             <div className="space-y-3 text-xs">
//               <div>
//                 <label className="block font-semibold text-slate-700 mb-1">ชื่อหน้า / ฟีเจอร์ *</label>
//                 <input 
//                   type="text" 
//                   placeholder="เช่น หน้า Dashboard สรุปโครงการ"
//                   value={workTitle}
//                   onChange={(e) => setWorkTitle(e.target.value)}
//                   className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
//                 />
//               </div>

//               <div>
//                 <label className="block font-semibold text-slate-700 mb-1">รายละเอียด</label>
//                 <textarea 
//                   placeholder="อธิบายว่าหน้านี้ทำอะไรได้บ้าง"
//                   value={workDesc}
//                   onChange={(e) => setWorkDesc(e.target.value)}
//                   className="w-full px-3 py-2 border border-slate-200 rounded-lg h-20 focus:outline-none focus:border-indigo-500"
//                 />
//               </div>

//               <div>
//                 <label className="block font-semibold text-slate-700 mb-1">ฟังก์ชั่นการทำงาน (สำหรับสร้าง Auto Flow)</label>
//                 <textarea 
//                   placeholder="เช่น หน้านี้หน้า Login Admin -> หน้าหลัก เห็นทั้งระบบ และ User -> หน้าหลัก เห็นบางเมนู"
//                   value={workFlow}
//                   onChange={(e) => setWorkFlow(e.target.value)}
//                   className="w-full px-3 py-2 border border-slate-200 rounded-lg h-20 focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
//                 />
//               </div>

//               <div>
//                 <label className="block font-semibold text-slate-700 mb-1">รูปภาพ</label>
//                 <input 
//                   type="file" 
//                   accept="image/*"
//                   onChange={handleImageUpload}
//                   className="w-full text-slate-500 text-xs"
//                 />
//               </div>
//             </div>

//             <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
//               <Button 
//                 onClick={() => setIsAddWorkOpen(false)}
//                 className="w-auto! bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 normal-case text-xs font-semibold py-2 px-4"
//               >
//                 ยกเลิก
//               </Button>
//               <Button 
//                 onClick={handleSaveWork}
//                 className="w-auto! bg-indigo-600 hover:bg-indigo-700 shadow-[0_4px_12px_rgba(79,70,229,0.25)] hover:shadow-[0_6px_16px_rgba(79,70,229,0.4)] normal-case text-xs font-bold py-2 px-4"
//               >
//                 บันทึก
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Preview Modal */}
//       {isPreviewOpen && works.length > 0 && (
//         <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
//           <button 
//             onClick={() => setIsPreviewOpen(false)} 
//             className="absolute top-4 right-4 text-white hover:text-slate-300"
//           >
//             <X className="w-6 h-6" />
//           </button>

//           <div className="max-w-4xl w-full flex flex-col items-center gap-4">
//             <img 
//               src={works[previewIndex].imageUrl} 
//               alt={works[previewIndex].title} 
//               className="max-h-[70vh] object-contain rounded-xl border border-slate-800"
//             />
//             <div className="text-center text-white space-y-1">
//               <h4 className="font-bold text-base">{works[previewIndex].title}</h4>
//               <p className="text-xs text-slate-400">{works[previewIndex].description}</p>
//             </div>

//             <div className="flex items-center gap-4 pt-2">
//               <Button 
//                 disabled={previewIndex === 0}
//                 onClick={() => setPreviewIndex(prev => prev - 1)}
//                 className="w-auto! bg-slate-800 hover:bg-slate-700 text-white normal-case text-xs font-semibold py-1 px-3 disabled:opacity-40"
//               >
//                 ย้อนกลับ
//               </Button>
//               <span className="text-xs text-slate-400 font-mono">
//                 {previewIndex + 1} / {works.length}
//               </span>
//               <Button 
//                 disabled={previewIndex === works.length - 1}
//                 onClick={() => setPreviewIndex(prev => prev + 1)}
//                 className="w-auto! bg-slate-800 hover:bg-slate-700 text-white normal-case text-xs font-semibold py-1 px-3 disabled:opacity-40"
//               >
//                 ถัดไป
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}

//       <ProjectFormModal
//         isOpen={isEditModalOpen}
//         mode="edit"
//         initialData={projectInfo}
//         onClose={() => setIsEditModalOpen(false)}
//         onSubmit={handleUpdateProject}
//       />

//     </div>
//   );
// }
"use client";

import React, { useState } from "react";
import ProjectFormModal from "@/components/projects/project-form-modal";
import { SoloProject } from "@/types/project";
import { Phase, StackItem, WorkItem } from "@/types/project-detail";
import { ProjectDetailHeader } from "@/components/projects/detail/project-detail-header";
import { ProjectPhaseSection } from "@/components/projects/detail/project-phase-section";
import { ProjectStackSection } from "@/components/projects/detail/project-stack-section";
import { ProjectTimelineSection } from "@/components/projects/detail/project-timeline-section";
import { ProjectShowcaseSection } from "@/components/projects/detail/project-showcase-section";
import { AddWorkModal } from "@/components/projects/detail/add-work-modal";

const STANDARD_PHASES: Phase[] = [
  { id: "p1", name: "Get Requirement", owner: "NonPongpakorn", startDate: "2026-07-01", endDate: "2026-07-10", status: "Done", items: [
    { id: "t1", title: "1. การทำงานหน้า Store", detail: "Store Max Min ปรับค่า Max Min ได้ และแก้ไข Stock(Box) Stock(Pcs) ได้", completed: true },
    { id: "t2", title: "2. เชื่อมต่อ Database", detail: "สร้าง View เพื่อให้ระบบแสดงผลที่หน้าเอาเฉพาะข้อมูลในตารางที่สร้างเป็น View มาแสดง และ Update Realtime", completed: true }
  ], isExpanded: true },
  { id: "p2", name: "System Analysis", owner: "NonPongpakorn", startDate: "2026-07-10", endDate: "2026-07-13", status: "Done", items: [], isExpanded: false },
  { id: "p3", name: "Figma Design", owner: "NonPongpakorn", startDate: "2026-08-10", endDate: "2026-08-13", status: "In Progress", items: [], isExpanded: false },
  { id: "p4", name: "Database Design", owner: "", startDate: "", endDate: "", status: "Not Started", items: [], isExpanded: false },
  { id: "p5", name: "Backend Development", owner: "", startDate: "", endDate: "", status: "Not Started", items: [], isExpanded: false },
  { id: "p6", name: "Frontend Development", owner: "", startDate: "", endDate: "", status: "Not Started", items: [], isExpanded: false },
  { id: "p7", name: "Integration", owner: "", startDate: "", endDate: "", status: "Not Started", items: [], isExpanded: false },
  { id: "p8", name: "Testing", owner: "", startDate: "", endDate: "", status: "Not Started", items: [], isExpanded: false },
  { id: "p9", name: "UAT", owner: "", startDate: "", endDate: "", status: "Not Started", items: [], isExpanded: false },
  { id: "p10", name: "Deployment", owner: "", startDate: "", endDate: "", status: "Not Started", items: [], isExpanded: false },
  { id: "p11", name: "Documentation", owner: "", startDate: "", endDate: "", status: "Not Started", items: [], isExpanded: false },
];

const initialProjectInfo: SoloProject = {
  id: "chr-synchorn",
  name: "CHR SYNCHORN",
  description: "พัฒนาระบบโดยการนำระบบทั้งหมดที่พัฒนานอกเหนือจากระบบ ERP ( Softpro ) มารวมกันเป็นระบบ ERP ขนาดเล็ก กำหนดให้นำ StorePC StoreSP EDP Planing มารวมกันและมี Plan ของระบบใหม่เพิ่มเติม เพื่อลดเวลาการทำงานให้กับพนักงาน Kanban Digital และเพิ่มเติมระบบ Maintainace",
  projectType: "Web Application",
  department: "ระบบดิจิตอลและIT",
  owner: "NonPongpakorn",
  requester: "วางแผนการผลิตและTPS",
  priority: "สูง",
  status: "Planning",
  startDate: "2026-08-08",
  endDate: "2026-08-15",
  progress: 0,
  language: "TypeScript",
  framework: "Next.js",
  library: "Tailwind CSS",
  database: "SQL Server",
  apiService: "REST API",
  otherTech: "",
};

export default function ProjectDetailPage() {
  const [projectInfo, setProjectInfo] = useState<SoloProject>(initialProjectInfo);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [phases, setPhases] = useState<Phase[]>(STANDARD_PHASES);

  const [stacks, setStacks] = useState<StackItem[]>([
    { id: "s1", type: "ภาษา (Language)", name: "TypeScript", version: "5.0", layer: "Frontend" },
    { id: "s2", type: "Framework", name: "Next.js", version: "14.2", layer: "Frontend" },
  ]);

  const [works, setWorks] = useState<WorkItem[]>([
    {
      id: "w1",
      title: "Test1",
      description: "Test1",
      flowDescription: "Admin -> จัดการระบบทั้งหมด / User -> ดูรายงานได้อย่างเดียว",
      imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
      date: "13/08/2026"
    },
    {
      id: "w2",
      title: "Test2",
      description: "Test2",
      flowDescription: "การรับส่งข้อมูลผ่าน Realtime WebSocket อัปเดตสถานะอัตโนมัติ",
      imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
      date: "13/08/2026"
    }
  ]);

  const [isAddWorkOpen, setIsAddWorkOpen] = useState(false);
  const [editingWork, setEditingWork] = useState<WorkItem | null>(null);

  const allTasks = phases.flatMap((p) => p.items);
  const completedTasks = allTasks.filter((t) => t.completed);
  const overallProgress = allTasks.length > 0 
    ? Math.round((completedTasks.length / allTasks.length) * 100) 
    : 0;

  const handleUpdateProject = (updatedProject: SoloProject) => {
    setProjectInfo(updatedProject);
    setIsEditModalOpen(false);
  };

  const handleAutoGeneratePhases = () => {
    setPhases(STANDARD_PHASES);
  };

  const handleOpenAddWorkModal = () => {
    setEditingWork(null);
    setIsAddWorkOpen(true);
  };

  const handleOpenEditWorkModal = (work: WorkItem) => {
    setEditingWork(work);
    setIsAddWorkOpen(true);
  };

  const handleSaveWork = (workData: { title: string; desc: string; flow: string; image: string | null }) => {
    if (editingWork) {
      setWorks(
        works.map((w) =>
          w.id === editingWork.id
            ? {
                ...w,
                title: workData.title,
                description: workData.desc,
                flowDescription: workData.flow,
                imageUrl: workData.image || w.imageUrl,
              }
            : w
        )
      );
    } else {
      const newWork: WorkItem = {
        id: Date.now().toString(),
        title: workData.title,
        description: workData.desc,
        flowDescription: workData.flow,
        imageUrl: workData.image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
        date: new Date().toLocaleDateString("th-TH"),
      };
      setWorks([...works, newWork]);
    }
    setIsAddWorkOpen(false);
    setEditingWork(null);
  };

  return (
    <div className="w-full space-y-6 pb-12 text-slate-800">
      <ProjectDetailHeader 
        projectInfo={projectInfo} 
        overallProgress={overallProgress}
        onOpenEditModal={() => setIsEditModalOpen(true)}
      />

      <ProjectPhaseSection 
        phases={phases} 
        setPhases={setPhases} 
        onAutoGeneratePhases={handleAutoGeneratePhases} 
      />

      <ProjectStackSection 
        stacks={stacks} 
        setStacks={setStacks} 
      />

      <ProjectTimelineSection 
        phases={phases} 
      />

      <ProjectShowcaseSection 
        works={works} 
        setWorks={setWorks}
        onOpenAddModal={handleOpenAddWorkModal}
        onOpenEditModal={handleOpenEditWorkModal}
      />

      <AddWorkModal 
        isOpen={isAddWorkOpen}
        editingWork={editingWork}
        onClose={() => setIsAddWorkOpen(false)}
        onSave={handleSaveWork}
      />

      <ProjectFormModal
        isOpen={isEditModalOpen}
        mode="edit"
        initialData={projectInfo}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateProject}
      />
    </div>
  );
}