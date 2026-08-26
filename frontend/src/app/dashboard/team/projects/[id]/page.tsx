// "use client";

// import React, { useState } from "react";
// import Link from "next/link";
// import { 
//   ArrowLeft, 
//   Wand2, 
//   Plus, 
//   Trash2, 
//   ChevronDown, 
//   ChevronRight, 
//   GripVertical, 
//   RotateCw, 
//   Eye, 
//   X,
//   Workflow,
//   Edit3,
//   Users
// } from "lucide-react";

// import SearchableSelect from "@/components/ui/inputs/searchable-select";
// import TeamProjectFormModal from "@/components/projects/team-project-form-modal";
// import { SoloProject } from "@/types/project";

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
//   { id: "p1", name: "Get Requirement", owner: "Pongpakorn, Somchai", startDate: "2026-07-01", endDate: "2026-07-10", status: "Done", items: [
//     { id: "t1", title: "1. การทำงานหน้า Store", detail: "Store Max Min ปรับค่า Max Min ได้ และแก้ไข Stock(Box) Stock(Pcs) ได้", completed: true },
//     { id: "t2", title: "2. เชื่อมต่อ Database", detail: "สร้าง View เพื่อให้ระบบแสดงผลที่หน้าเอาเฉพาะข้อมูลในตารางที่สร้างเป็น View มาแสดง และ Update Realtime", completed: true }
//   ], isExpanded: true },
//   { id: "p2", name: "System Analysis", owner: "Pongpakorn, Somchai", startDate: "2026-07-10", endDate: "2026-07-13", status: "Done", items: [], isExpanded: false },
//   { id: "p3", name: "Figma Design", owner: "Anan", startDate: "2026-08-10", endDate: "2026-08-13", status: "In Progress", items: [], isExpanded: false },
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
//   id: "erp-integration-hub",
//   name: "ERP Integration Hub",
//   description: "ระบบเชื่อมต่อข้อมูล ERP ระหว่างสาขา พัฒนาร่วมกับทีมเพื่อรวมข้อมูลจากหลายระบบให้เป็นศูนย์กลางเดียว ลดเวลาการกรอกข้อมูลซ้ำซ้อนระหว่างแผนก",
//   projectType: "Web Application",
//   department: "ระบบดิจิตอลและIT",
//   owner: "Pongpakorn, Somchai",
//   requester: "ฝ่ายบัญชีและการเงิน",
//   priority: "สูง",
//   status: "กำลังทำ",
//   startDate: "01/01/2026",
//   endDate: "30/06/2026",
//   progress: 0,
//   language: "TypeScript",
//   framework: "Next.js",
//   library: "Tailwind CSS",
//   database: "SQL Server",
//   apiService: "REST API",
//   otherTech: "",
// };

// export default function TeamProjectDetailPage() {
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
//   const [isPreviewOpen, setIsPreviewOpen] = useState(false);
//   const [previewIndex, setPreviewIndex] = useState(0);

//   const [workTitle, setWorkTitle] = useState("");
//   const [workDesc, setWorkDesc] = useState("");
//   const [workFlow, setWorkFlow] = useState("");
//   const [workImage, setWorkImage] = useState<string | null>(null);

//   const stackOptions = [
//     { label: "Next.js", value: "Next.js" },
//     { label: "React", value: "React" },
//     { label: "TypeScript", value: "TypeScript" },
//     { label: "ASP.NET Core", value: "ASP.NET Core" },
//     { label: "SQL Server", value: "SQL Server" },
//     { label: "Tailwind CSS", value: "Tailwind CSS" },
//     { label: "Zustand", value: "Zustand" },
//     { label: "Docker", value: "Docker" }
//   ];

//   // แตกชื่อสมาชิกทีมจาก owner (คั่นด้วย comma) ให้แสดงเป็น chip รายคน
//   const teamMembers = projectInfo.owner
//     ? projectInfo.owner.split(",").map((name) => name.trim()).filter(Boolean)
//     : [];

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
//       layer: stackLayer
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

//   const handleSaveWork = () => {
//     if (!workTitle) return;
//     const newWork: WorkItem = {
//       id: Date.now().toString(),
//       title: workTitle,
//       description: workDesc,
//       flowDescription: workFlow,
//       imageUrl: workImage || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
//       date: new Date().toLocaleDateString("th-TH")
//     };
//     setWorks([...works, newWork]);
//     setIsAddWorkOpen(false);
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
      
//       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
//             {projectInfo.name}
//           </h1>
//           <p className="text-xs text-slate-500 font-medium">{projectInfo.department}</p>
//         </div>
//         <div className="flex items-center gap-3">
//           <Link href="/dashboard/team">
//             <button className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-xs">
//               <ArrowLeft className="w-4 h-4" />
//               กลับ
//             </button>
//           </Link>
//           <button 
//             onClick={() => setIsEditModalOpen(true)}
//             className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm"
//           >
//             <Edit3 className="w-3.5 h-3.5" />
//             แก้ไขโครงการ
//           </button>
//         </div>
//       </div>

//       <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs">
//           <div>
//             <span className="text-slate-400 font-medium block mb-1">Status</span>
//             <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md font-semibold">
//               {projectInfo.status}
//             </span>
//           </div>
//           <div>
//             <span className="text-slate-400 font-medium block mb-1">Priority</span>
//             <span className={`inline-block px-2.5 py-1 rounded-md font-semibold border ${
//               projectInfo.priority === "สูง" 
//                 ? "bg-rose-50 text-rose-600 border-rose-100" 
//                 : "bg-slate-100 text-slate-700 border-slate-200"
//             }`}>
//               {projectInfo.priority === "สูง" ? "Critical (สูง)" : "Normal (ปกติ)"}
//             </span>
//           </div>
//           {/* ===== เปลี่ยนจาก Owner (text เดี่ยว) เป็น Team Members (chip หลายคน) ===== */}
//           <div>
//             <span className="text-slate-400 font-medium block mb-1 flex items-center gap-1">
//               <Users className="w-3 h-3" />
//               Team Members
//             </span>
//             <div className="flex flex-wrap gap-1">
//               {teamMembers.length > 0 ? (
//                 teamMembers.map((name) => (
//                   <span
//                     key={name}
//                     className="inline-flex px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold text-[11px]"
//                   >
//                     {name}
//                   </span>
//                 ))
//               ) : (
//                 <span className="font-bold text-slate-400">-</span>
//               )}
//             </div>
//           </div>
//           <div>
//             <span className="text-slate-400 font-medium block mb-1">Requester</span>
//             <span className="font-bold text-slate-800">{projectInfo.requester}</span>
//           </div>
//         </div>

//         <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs">
//           <div>
//             <span className="text-slate-400 font-medium block mb-1">Start Date</span>
//             <span className="font-bold text-slate-800 font-mono">{projectInfo.startDate}</span>
//           </div>
//           <div>
//             <span className="text-slate-400 font-medium block mb-1">Planned End</span>
//             <span className="font-bold text-slate-800 font-mono">{projectInfo.endDate}</span>
//           </div>
//           <div>
//             <span className="text-slate-400 font-medium block mb-1">Project Type</span>
//             <span className="font-bold text-slate-800">{projectInfo.projectType}</span>
//           </div>
//           <div>
//             <span className="text-slate-400 font-medium block mb-1">
//               Progress (คำนวณจาก Phase) {overallProgress}%
//             </span>
//             <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200 mt-1.5">
//               <div 
//                 className="bg-indigo-600 h-full transition-all duration-300" 
//                 style={{ width: `${overallProgress}%` }} 
//               />
//             </div>
//           </div>
//         </div>

//         <hr className="border-slate-100" />

//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
//           <div>
//             <span className="text-slate-400 font-medium block mb-1">ภาษาที่ใช้</span>
//             <div className="flex gap-1.5 flex-wrap">
//               <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-medium">{projectInfo.language || "-"}</span>
//             </div>
//           </div>
//           <div>
//             <span className="text-slate-400 font-medium block mb-1">Framework</span>
//             <div className="flex gap-1.5 flex-wrap">
//               <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-medium">{projectInfo.framework || "-"}</span>
//             </div>
//           </div>
//           <div>
//             <span className="text-slate-400 font-medium block mb-1">Library / Package</span>
//             <div className="flex gap-1.5 flex-wrap">
//               <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-medium">{projectInfo.library || "-"}</span>
//             </div>
//           </div>
//           <div>
//             <span className="text-slate-400 font-medium block mb-1">Database</span>
//             <div className="flex gap-1.5 flex-wrap">
//               <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-medium">{projectInfo.database || "-"}</span>
//             </div>
//           </div>
//         </div>

//         <div>
//           <span className="text-slate-400 font-medium block mb-1 text-xs">Description</span>
//           <p className="text-xs text-slate-600 leading-relaxed">
//             {projectInfo.description}
//           </p>
//         </div>
//       </div>

//       <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
//         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
//           <div className="flex items-center gap-2">
//             <span className="bg-indigo-100 text-indigo-800 font-bold px-2 py-1 rounded text-xs">Phase / ลำดับงาน</span>
            
//             <button 
//               onClick={handleAutoGeneratePhases}
//               title="สร้าง Phase อัตโนมัติตามมาตรฐาน"
//               className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg border border-indigo-200 transition-all flex items-center gap-1 text-xs font-medium"
//             >
//               <Wand2 className="w-4 h-4 text-indigo-600" />
//               <span>สร้าง Standard Phase</span>
//             </button>
//           </div>

//           <div className="flex items-center gap-2 w-full sm:w-auto">
//             <input 
//               type="text" 
//               placeholder="ชื่อขั้นตอนใหม่"
//               value={newPhaseName}
//               onChange={(e) => setNewPhaseName(e.target.value)}
//               className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs w-full sm:w-48 focus:outline-none focus:border-indigo-500"
//             />
//             <button 
//               onClick={handleAddPhase}
//               className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shrink-0"
//             >
//               <Plus className="w-3.5 h-3.5" />
//               เพิ่ม
//             </button>
//           </div>
//         </div>

//         <div className="overflow-x-auto border border-slate-200 rounded-xl">
//           <table className="w-full text-left text-xs">
//             <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
//               <tr>
//                 <th className="py-3 px-2 w-10 text-center"></th>
//                 <th className="py-3 px-2 w-10 text-center">No</th>
//                 <th className="py-3 px-3 min-w-[200px]">Phase</th>
//                 <th className="py-3 px-3 w-32">Owner</th>
//                 <th className="py-3 px-3 w-28">Start</th>
//                 <th className="py-3 px-3 w-28">End</th>
//                 <th className="py-3 px-3 w-28">Status</th>
//                 <th className="py-3 px-3 w-28">Progress</th>
//                 <th className="py-3 px-2 w-12 text-center"></th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100">
//               {phases.map((phase, idx) => {
//                 const phaseProgress = calculatePhaseProgress(phase);
//                 return (
//                   <React.Fragment key={phase.id}>
//                     <tr 
//                       draggable 
//                       onDragStart={(e) => handleDragStart(e, idx)}
//                       onDragOver={(e) => e.preventDefault()}
//                       onDrop={(e) => handleDrop(e, idx)}
//                       className="hover:bg-slate-50/80 transition-colors"
//                     >
//                       <td className="py-3 px-2 text-center cursor-grab text-slate-300 hover:text-slate-600">
//                         <GripVertical className="w-4 h-4 mx-auto" />
//                       </td>
//                       <td className="py-3 px-2 text-center">
//                         <button 
//                           onClick={() => togglePhaseExpand(phase.id)}
//                           className="p-1 hover:bg-slate-200 rounded text-slate-500"
//                         >
//                           {phase.isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
//                         </button>
//                         <span className="font-bold ml-1">{idx + 1}</span>
//                       </td>
//                       <td className="py-3 px-3">
//                         <input 
//                           type="text" 
//                           value={phase.name}
//                           onChange={(e) => {
//                             const val = e.target.value;
//                             setPhases(phases.map(p => p.id === phase.id ? { ...p, name: val } : p));
//                           }}
//                           className="w-full px-2 py-1 border border-slate-200 rounded font-medium focus:outline-none focus:border-indigo-500"
//                         />
//                       </td>
//                       <td className="py-3 px-3">
//                         <input 
//                           type="text" 
//                           value={phase.owner}
//                           onChange={(e) => {
//                             const val = e.target.value;
//                             setPhases(phases.map(p => p.id === phase.id ? { ...p, owner: val } : p));
//                           }}
//                           placeholder="เช่น Pongpakorn, Somchai"
//                           className="w-full px-2 py-1 border border-slate-200 rounded focus:outline-none focus:border-indigo-500"
//                         />
//                       </td>
//                       <td className="py-3 px-3">
//                         <input 
//                           type="date" 
//                           value={phase.startDate}
//                           onChange={(e) => {
//                             const val = e.target.value;
//                             setPhases(phases.map(p => p.id === phase.id ? { ...p, startDate: val } : p));
//                           }}
//                           className="w-full px-1.5 py-1 border border-slate-200 rounded focus:outline-none"
//                         />
//                       </td>
//                       <td className="py-3 px-3">
//                         <input 
//                           type="date" 
//                           value={phase.endDate}
//                           onChange={(e) => {
//                             const val = e.target.value;
//                             setPhases(phases.map(p => p.id === phase.id ? { ...p, endDate: val } : p));
//                           }}
//                           className="w-full px-1.5 py-1 border border-slate-200 rounded focus:outline-none"
//                         />
//                       </td>
//                       <td className="py-3 px-3">
//                         <select 
//                           value={phase.status}
//                           onChange={(e) => {
//                             const val = e.target.value as Phase["status"];
//                             setPhases(phases.map(p => p.id === phase.id ? { ...p, status: val } : p));
//                           }}
//                           className="w-full px-1.5 py-1 border border-slate-200 rounded focus:outline-none bg-white font-medium"
//                         >
//                           <option value="Not Started">Not Started</option>
//                           <option value="In Progress">In Progress</option>
//                           <option value="Done">Done</option>
//                         </select>
//                       </td>
//                       <td className="py-3 px-3 font-mono font-bold">
//                         <div className="flex items-center gap-2">
//                           <div className="flex-1 bg-slate-100 rounded-full h-2 border border-slate-200 overflow-hidden">
//                             <div 
//                               className={`h-full ${phaseProgress === 100 ? "bg-indigo-500" : "bg-amber-500"}`} 
//                               style={{ width: `${phaseProgress}%` }}
//                             />
//                           </div>
//                           <span>{phaseProgress}%</span>
//                         </div>
//                       </td>
//                       <td className="py-3 px-2 text-center">
//                         <button 
//                           onClick={() => handleDeletePhase(phase.id)}
//                           className="text-rose-500 hover:text-rose-700 p-1"
//                         >
//                           <Trash2 className="w-3.5 h-3.5" />
//                         </button>
//                       </td>
//                     </tr>

//                     {phase.isExpanded && (
//                       <tr>
//                         <td colSpan={9} className="bg-slate-50/50 p-4 border-t border-b border-slate-100">
//                           <div className="pl-8 space-y-3">
//                             <h4 className="font-semibold text-slate-700 text-xs">รายละเอียดงานภายในเฟสนี้</h4>
                            
//                             {phase.items.map((task) => (
//                               <div key={task.id} className="flex items-start gap-3 bg-white p-2.5 rounded-lg border border-slate-200">
//                                 <input 
//                                   type="checkbox" 
//                                   checked={task.completed}
//                                   onChange={() => toggleTaskComplete(phase.id, task.id)}
//                                   className="mt-0.5 accent-indigo-600 rounded"
//                                 />
//                                 <div className="flex-1">
//                                   <h5 className={`font-bold text-xs ${task.completed ? "line-through text-slate-400" : "text-slate-800"}`}>
//                                     {task.title}
//                                   </h5>
//                                   {task.detail && <p className="text-[11px] text-slate-500 mt-0.5">{task.detail}</p>}
//                                 </div>
//                                 <button 
//                                   onClick={() => handleDeleteTask(phase.id, task.id)}
//                                   className="text-rose-400 hover:text-rose-600 p-1"
//                                 >
//                                   <Trash2 className="w-3 h-3" />
//                                 </button>
//                               </div>
//                             ))}

//                             <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
//                               <input 
//                                 type="text" 
//                                 placeholder="หัวข้องาน เช่น ออกแบบหน้า Login"
//                                 value={newTaskTitle[phase.id] || ""}
//                                 onChange={(e) => setNewTaskTitle({ ...newTaskTitle, [phase.id]: e.target.value })}
//                                 className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs w-full focus:outline-none focus:border-indigo-500"
//                               />
//                               <input 
//                                 type="text" 
//                                 placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"
//                                 value={newTaskDetail[phase.id] || ""}
//                                 onChange={(e) => setNewTaskDetail({ ...newTaskDetail, [phase.id]: e.target.value })}
//                                 className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs w-full focus:outline-none focus:border-indigo-500"
//                               />
//                               <button 
//                                 onClick={() => handleAddTask(phase.id)}
//                                 className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shrink-0"
//                               >
//                                 <Plus className="w-3.5 h-3.5" />
//                                 เพิ่มรายการ
//                               </button>
//                             </div>
//                           </div>
//                         </td>
//                       </tr>
//                     )}
//                   </React.Fragment>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
//         <h3 className="font-bold text-slate-800 text-sm">Stack / Library</h3>
        
//         <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
//           <div>
//             <label className="block text-xs font-medium text-slate-500 mb-1">ประเภท</label>
//             <select 
//               value={stackType}
//               onChange={(e) => setStackType(e.target.value)}
//               className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none"
//             >
//               <option value="ภาษา (Language)">ภาษา (Language)</option>
//               <option value="Framework">Framework</option>
//               <option value="Library / Package">Library / Package</option>
//               <option value="Database">Database</option>
//             </select>
//           </div>

//           <div>
//             <label className="block text-xs font-medium text-slate-500 mb-1">ชื่อ</label>
//             <SearchableSelect 
//               options={stackOptions}
//               value={stackName}
//               onChange={setStackName}
//               placeholder="พิมพ์ค้นหา เช่น Next.js"
//             />
//           </div>

//           <div>
//             <label className="block text-xs font-medium text-slate-500 mb-1">เวอร์ชัน</label>
//             <input 
//               type="text" 
//               placeholder="14.2" 
//               value={stackVersion}
//               onChange={(e) => setStackVersion(e.target.value)}
//               className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
//             />
//           </div>

//           <div className="flex gap-2">
//             <div className="flex-1">
//               <label className="block text-xs font-medium text-slate-500 mb-1">Layer *</label>
//               <select 
//                 value={stackLayer}
//                 onChange={(e) => setStackLayer(e.target.value)}
//                 className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-indigo-500"
//               >
//                 <option value="">เลือก Layer</option>
//                 <option value="Frontend">Frontend</option>
//                 <option value="Backend">Backend</option>
//                 <option value="Database">Database</option>
//                 <option value="DevOps">DevOps</option>
//               </select>
//             </div>
//             <button 
//               onClick={handleAddStack}
//               className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs self-end h-9.5 flex items-center gap-1"
//             >
//               <Plus className="w-3.5 h-3.5" />
//               เพิ่ม
//             </button>
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

//       <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
//         <h3 className="font-bold text-slate-800 text-sm">Project Timeline</h3>
        
//         <div className="overflow-x-auto">
//           <div className="min-w-175">
//             <div className="grid grid-cols-12 border-b border-slate-200 pb-2 text-[11px] font-bold text-slate-500 text-center">
//               <div className="col-span-4 text-left pl-2">Activity</div>
//               <div className="col-span-1">มิ.ย.</div>
//               <div className="col-span-1">ก.ค.</div>
//               <div className="col-span-1">ส.ค.</div>
//               <div className="col-span-1">ก.ย.</div>
//               <div className="col-span-1">ต.ค.</div>
//               <div className="col-span-1">พ.ย.</div>
//               <div className="col-span-2">ธ.ค.</div>
//             </div>

//             <div className="divide-y divide-slate-100 text-xs">
//               {phases.map((phase, idx) => (
//                 <div key={phase.id} className="grid grid-cols-12 py-2.5 items-center hover:bg-slate-50">
//                   <div className="col-span-4 pl-2 font-medium text-slate-800 truncate">
//                     {idx + 1}. {phase.name}
//                   </div>
//                   <div className="col-span-8 relative h-5 bg-slate-50 rounded border border-slate-100 flex items-center px-1">
//                     {phase.startDate && (
//                       <div 
//                         className="h-3.5 bg-indigo-600 rounded shadow-xs" 
//                         style={{
//                           marginLeft: `${(idx * 8) % 70}%`,
//                           width: `${Math.max(15, 100 - (idx * 10))}%`
//                         }} 
//                       />
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
//         <div className="flex items-center justify-between">
//           <h3 className="font-bold text-slate-800 text-sm">Present ผลงาน / หน้าจอระบบ</h3>
//           <div className="flex items-center gap-2">
//             <button 
//               onClick={() => setIsPreviewOpen(true)}
//               className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1.5"
//             >
//               <Eye className="w-3.5 h-3.5" />
//               พรีวิว
//             </button>
//             <button 
//               onClick={() => setIsAddWorkOpen(true)}
//               className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1"
//             >
//               <Plus className="w-3.5 h-3.5" />
//               เพิ่มผลงาน
//             </button>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
//           {works.map((work) => {
//             const isFlipped = flippedCards[work.id];
//             return (
//               <div key={work.id} className="group relative [perspective:1000px] h-[260px]">
//                 <div className={`relative w-full h-full duration-500 [transform-style:preserve-3d] transition-transform rounded-xl border border-slate-200 shadow-xs ${isFlipped ? "[transform:rotateY(180deg)]" : ""}`}>
                  
//                   <div className="absolute inset-0 w-full h-full bg-white rounded-xl backface-hidden p-3 flex flex-col justify-between">
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
//                       <button 
//                         onClick={() => setWorks(works.filter(w => w.id !== work.id))}
//                         className="text-slate-400 hover:text-rose-500 p-1"
//                       >
//                         <Trash2 className="w-3.5 h-3.5" />
//                       </button>
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
//                     <p className="text-[10px] text-slate-500 text-center">คลิกไอคอนหมุนเพื่อกลับไปดูรูป</p>
//                   </div>

//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       {isAddWorkOpen && (
//         <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
//           <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
//             <div className="flex items-center justify-between border-b border-slate-100 pb-3">
//               <h3 className="font-bold text-slate-900 text-sm">เพิ่มผลงานของโครงการ</h3>
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
//               <button 
//                 onClick={() => setIsAddWorkOpen(false)}
//                 className="px-4 py-2 border border-slate-200 rounded-lg font-semibold text-xs text-slate-600 hover:bg-slate-50"
//               >
//                 ยกเลิก
//               </button>
//               <button 
//                 onClick={handleSaveWork}
//                 className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs"
//               >
//                 บันทึก
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

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
//               <button 
//                 disabled={previewIndex === 0}
//                 onClick={() => setPreviewIndex(prev => prev - 1)}
//                 className="px-3 py-1 bg-slate-800 text-white rounded text-xs disabled:opacity-40"
//               >
//                 ย้อนกลับ
//               </button>
//               <span className="text-xs text-slate-400 font-mono">
//                 {previewIndex + 1} / {works.length}
//               </span>
//               <button 
//                 disabled={previewIndex === works.length - 1}
//                 onClick={() => setPreviewIndex(prev => prev + 1)}
//                 className="px-3 py-1 bg-slate-800 text-white rounded text-xs disabled:opacity-40"
//               >
//                 ถัดไป
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <TeamProjectFormModal
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
import TeamProjectFormModal from "@/components/projects/team-project-form-modal";
import TeamProjectHeader from "@/components/projects/detail/team/team-project-header";
import TeamProjectOverview from "@/components/projects/detail/team/team-project-overview";
import TeamProjectPhaseTable, {
  Phase,
} from "@/components/projects/detail/team/team-project-phase-table";
import TeamProjectStackSection, {
  StackItem,
} from "@/components/projects/detail/team/team-project-stack-section";
import TeamProjectGanttTimeline from "@/components/projects/detail/team/team-project-gantt-timeline";
import TeamProjectGallerySection, {
  WorkItem,
} from "@/components/projects/detail/team/team-project-gallery-section";
import { SoloProject } from "@/types/project";

const STANDARD_PHASES: Phase[] = [
  {
    id: "p1",
    name: "Get Requirement",
    owner: "Pongpakorn, Somchai",
    startDate: "2026-07-01",
    endDate: "2026-07-10",
    status: "Done",
    items: [
      {
        id: "t1",
        title: "1. การทำงานหน้า Store",
        detail: "Store Max Min ปรับค่า Max Min ได้ และแก้ไข Stock(Box) Stock(Pcs) ได้",
        completed: true,
      },
      {
        id: "t2",
        title: "2. เชื่อมต่อ Database",
        detail:
          "สร้าง View เพื่อให้ระบบแสดงผลที่หน้าเอาเฉพาะข้อมูลในตารางที่สร้างเป็น View มาแสดง และ Update Realtime",
        completed: true,
      },
    ],
    isExpanded: true,
  },
  {
    id: "p2",
    name: "System Analysis",
    owner: "Pongpakorn, Somchai",
    startDate: "2026-07-10",
    endDate: "2026-07-13",
    status: "Done",
    items: [],
    isExpanded: false,
  },
  {
    id: "p3",
    name: "Figma Design",
    owner: "Anan",
    startDate: "2026-08-10",
    endDate: "2026-08-13",
    status: "In Progress",
    items: [],
    isExpanded: false,
  },
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
  id: "erp-integration-hub",
  name: "ERP Integration Hub",
  description:
    "ระบบเชื่อมต่อข้อมูล ERP ระหว่างสาขา พัฒนาร่วมกับทีมเพื่อรวมข้อมูลจากหลายระบบให้เป็นศูนย์กลางเดียว ลดเวลาการกรอกข้อมูลซ้ำซ้อนระหว่างแผนก",
  projectType: "Web Application",
  department: "ระบบดิจิตอลและIT",
  owner: "Pongpakorn, Somchai",
  requester: "ฝ่ายบัญชีและการเงิน",
  priority: "สูง",
  status: "กำลังทำ",
  startDate: "01/01/2026",
  endDate: "30/06/2026",
  progress: 0,
  language: "TypeScript",
  framework: "Next.js",
  library: "Tailwind CSS",
  database: "SQL Server",
  apiService: "REST API",
  otherTech: "",
};

export default function TeamProjectDetailPage() {
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
      imageUrl:
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
      date: "13/08/2026",
    },
    {
      id: "w2",
      title: "Test2",
      description: "Test2",
      flowDescription: "การรับส่งข้อมูลผ่าน Realtime WebSocket อัปเดตสถานะอัตโนมัติ",
      imageUrl:
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
      date: "13/08/2026",
    },
  ]);

  const allTasks = phases.flatMap((p) => p.items);
  const completedTasks = allTasks.filter((t) => t.completed);
  const overallProgress =
    allTasks.length > 0 ? Math.round((completedTasks.length / allTasks.length) * 100) : 0;

  const handleUpdateProject = (updatedProject: SoloProject) => {
    setProjectInfo(updatedProject);
    setIsEditModalOpen(false);
  };

  return (
    <div className="w-full space-y-6 pb-12 text-slate-800">
      <TeamProjectHeader
        projectName={projectInfo.name}
        department={projectInfo.department}
        onEditClick={() => setIsEditModalOpen(true)}
      />

      <TeamProjectOverview projectInfo={projectInfo} overallProgress={overallProgress} />

      <TeamProjectPhaseTable
        phases={phases}
        setPhases={setPhases}
        standardPhases={STANDARD_PHASES}
      />

      <TeamProjectStackSection stacks={stacks} setStacks={setStacks} />

      <TeamProjectGanttTimeline phases={phases} />

      <TeamProjectGallerySection works={works} setWorks={setWorks} />

      <TeamProjectFormModal
        isOpen={isEditModalOpen}
        mode="edit"
        initialData={projectInfo}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateProject}
      />
    </div>
  );
}