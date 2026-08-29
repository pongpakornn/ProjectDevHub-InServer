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