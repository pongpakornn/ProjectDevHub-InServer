"use client";

import { useEffect } from "react";

// นับจำนวน Modal ที่เปิดอยู่พร้อมกันด้วย Module-level Counter (ไม่ใช่ Boolean เดี่ยวๆ) เพื่อรองรับกรณี
// เปิดหลาย Modal ซ้อนกัน — ปิด Modal ตัวในแล้วต้องไม่ไป Unlock Scroll ทั้งที่ยังมี Modal ตัวนอกเปิดค้างอยู่
let lockCount = 0;
let previousOverflow = "";

// Lock/Unlock Scroll ของ <body> ให้ครบทุก Entry/Exit Point เสมอ — ไม่ว่าจะปิด Modal ด้วยปุ่ม X, ปุ่มยกเลิก,
// คลิกนอกกรอบ Backdrop, หรือกด ESC เพราะทุกทางออกสุดท้ายมาจบที่ isOpen เปลี่ยนเป็น false แล้ว Effect Cleanup นี้ทำงาน
export function useBodyScrollLock(isLocked: boolean): void {
  useEffect(() => {
    if (!isLocked) return;

    if (lockCount === 0) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    lockCount += 1;

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) {
        document.body.style.overflow = previousOverflow;
      }
    };
  }, [isLocked]);
}
