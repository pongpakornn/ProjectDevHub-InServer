"use client";

import React from "react";
import { usePathname } from "next/navigation";

// ห่อ children ด้วย key={pathname} เพื่อบังคับให้ React Remount ทุกครั้งที่เปลี่ยนหน้า
// (รวมถึงหน้าเดียวกันที่แค่เปลี่ยน Dynamic Param เช่น /dashboard/solo/5 -> /dashboard/solo/8)
// แล้วปล่อยให้ Animation Class เล่นใหม่ทุกครั้ง = ได้ Page Transition แบบ Fade-in นุ่มๆ ทุกหน้า
//
// หมายเหตุ: ใช้ fade-in อย่างเดียว (ไม่มี slide/zoom) โดยตั้งใจ — slide-in/zoom-in ใน tw-animate-css ขับเคลื่อนด้วย
// CSS transform ซึ่งระหว่างที่ Animation กำลังเล่นอยู่ (แม้เพียงเสี้ยววินาที) จะทำให้ Element นี้กลายเป็น Containing
// Block ใหม่สำหรับลูกหลานที่เป็น position:fixed (เช่น Modal ที่เปิดขึ้นมาในจังหวะนั้นพอดี) ทำให้ Modal เพี้ยนตำแหน่ง
// ไปยึดกับกรอบของหน้านี้แทนที่จะเป็น Viewport จริง — fade-in (เปลี่ยนแค่ opacity) ไม่มีปัญหานี้
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="animate-in fade-in duration-300 ease-out">
      {children}
    </div>
  );
}
