"use client";

import React, { useEffect, useState } from "react";
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

  // ล็อค Scroll ระดับ <html>/<body> ตลอดเวลาที่อยู่ใน /dashboard/* กัน Scrollbar ที่ 2 (ระดับหน้าจอจริง ทับ
  // Navbar) โผล่มาซ้อนกับ Scrollbar ของ <main> เอง — สาเหตุคือ Element ที่ Render ผ่าน Portal ตรงไปที่
  // document.body (เช่น Modal/Toast) เป็น Sibling ของ div.h-screen นี้ ไม่ได้ถูกครอบด้วย overflow-hidden
  // ของ Layout จึงทำให้ document สูงเกิน Viewport ได้แม้ main จะ Scroll ถูกต้องอยู่แล้วก็ตาม
  // ไม่กระทบหน้า /login เพราะ Layout นี้ Mount เฉพาะตอนอยู่ใน /dashboard/* เท่านั้น
  useEffect(() => {
    const html = document.documentElement;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      html.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, []);

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
            overscroll-contain กัน Rubber-band Bounce ตอน Scroll ชนขอบล่างสุดหลุดไปเผยพื้นหลังนอก main
            min-h-0 บังคับให้ flex item นี้ยึดความสูงตาม flex-1 จริงๆ แทนที่จะขยายตาม min-content ของเนื้อหา
            (ค่า Default ของ Flexbox คือ min-height: auto ซึ่งพอเนื้อหาสูงมากๆ เช่นหน้า User Management ที่มีทั้ง
            Banner + ฟอร์มลงทะเบียนที่ยุบ/ขยายได้ + ตารางสิทธิ์ยาวๆ จะดัน main ให้สูงเกิน viewport จริง หลุดผ่าน
            overflow-hidden ของ container ชั้นนอกออกไปกลายเป็น Scrollbar ที่ 2 ที่ริมขวาสุดของจอ (ระดับ body/html)
            ซ้อนกับ Scrollbar ที่ถูกต้องของ main เอง — min-h-0 คือ Fix มาตรฐานของปัญหานี้ ไม่กระทบหน้าอื่นที่เนื้อหา
            สั้นกว่า viewport อยู่แล้วเพราะ overflow-y-auto จะยังคงพฤติกรรมเดิมทุกกรณี */}
        <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain bg-white p-3 sm:p-4 md:p-5">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}