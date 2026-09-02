"use client";

import React, { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import SessionGuard from "@/components/layout/session-guard";
import PageTransition from "@/components/layout/page-transition";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    /* 🟢 1. ใช้ h-screen + overflow-hidden เพื่อล็อคหน้าจอหลักไม่ให้เกิด Scrollbar นอก */
    <div className="flex h-screen w-full bg-white text-slate-800 font-sans overflow-hidden">
      {/* Heartbeat + Offline Sync — จำกัด Login ได้ครั้งละ 1 Session และ Sync สถานะ Online/Offline อัตโนมัติ */}
      <SessionGuard />

      {/* Sidebar — บนจอ < lg กลายเป็น Off-canvas Drawer ควบคุมด้วย isMobileMenuOpen */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-white">
        {/* Topbar */}
        <Topbar
          isCollapsed={isCollapsed}
          onToggleSidebar={toggleSidebar}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        {/* 🟢 2. main ใช้ p-3 sm:p-4 กระชับขอบ และให้ scroll อัตโนมัติเฉพาะยามจำเป็น
            overscroll-contain กัน Rubber-band Bounce ตอน Scroll ชนขอบล่างสุดหลุดไปเผยพื้นหลังนอก main */}
        <main className="flex-1 overflow-y-auto overscroll-contain bg-white p-3 sm:p-4 md:p-5">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}