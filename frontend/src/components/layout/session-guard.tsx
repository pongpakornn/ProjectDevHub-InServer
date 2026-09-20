"use client";

import { useEffect } from "react";
import { getStoredUser, getStoredSessionId, sendOfflineBeacon } from "@/lib/session";

// Mount ครั้งเดียวใน dashboard/layout.tsx — เหลือหน้าที่เดียว: ยิง Beacon แจ้ง Backend ตั้งสถานะ Offline
// ตอนปิดแท็บ/ปิดแอป/รีเฟรช (ไม่กระทบผู้ใช้ที่กำลังทำงานอยู่)
// ถอด Heartbeat Single-Session-Kick และ Idle Timeout Auto-Logout ออก — ผู้ใช้แจ้งว่าระหว่างทำงานอยู่ดีๆ
// ถูกเด้งออกจากระบบกลางคัน (Backend Dev Server รีสตาร์ทบ่อยตอนพัฒนาก็ทำให้ Session Check เด้ง False Positive
// ได้ง่ายด้วย) ถ้าจะกลับมาทำ "จำกัด 1 Session ต่อคน" ใหม่ในอนาคต ควรทำแบบไม่กระทบ Session ที่ใช้งานจริงอยู่
export default function SessionGuard() {
  useEffect(() => {
    const user = getStoredUser();
    const sessionId = getStoredSessionId();
    if (!user || !sessionId) return;

    const handleBeforeUnload = () => {
      sendOfflineBeacon();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return null;
}
