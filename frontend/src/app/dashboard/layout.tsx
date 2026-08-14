"use client";

import React, { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    /* 🟢 1. ใช้ h-screen + overflow-hidden เพื่อล็อคหน้าจอหลักไม่ให้เกิด Scrollbar นอก */
    <div className="flex h-screen w-full bg-white text-slate-800 font-sans overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-white">
        {/* Topbar */}
        <Topbar 
          isCollapsed={isCollapsed} 
          onToggleSidebar={toggleSidebar} 
        />

        {/* 🟢 2. main ใช้ p-3 sm:p-4 กระชับขอบ และให้ scroll อัตโนมัติเฉพาะยามจำเป็น */}
        <main className="flex-1 overflow-y-auto bg-white p-3 sm:p-4 md:p-5">
          {children}
        </main>
      </div>
    </div>
  );
}