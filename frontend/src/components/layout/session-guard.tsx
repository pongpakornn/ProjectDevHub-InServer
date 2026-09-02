"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { getStoredUser, getStoredSessionId, clearSession, sendOfflineBeacon } from "@/lib/session";
import { useToast } from "@/lib/toast-context";

const HEARTBEAT_INTERVAL_MS = 25000;

// Mount ครั้งเดียวใน dashboard/layout.tsx — คอยสอง Job:
// 1) beforeunload: ยิง Beacon แจ้ง Backend ตั้งสถานะ Offline ตอนปิดแท็บ/ปิดแอป/รีเฟรช
// 2) Heartbeat: เช็กเป็นระยะว่า Session นี้ยังตรงกับที่ Backend เก็บไว้อยู่หรือถูก Login ใหม่จากที่อื่นเตะออกไปแล้ว
//    (รองรับ Requirement "1 User ล็อกอินพร้อมกันได้แค่ 1 Session")
// ถ้ายังไม่ได้ล็อกอิน (ไม่มี user ใน LocalStorage) จะไม่ทำอะไรเลย เพื่อไม่กระทบการเข้าถึง /dashboard/* ตรงๆ ระหว่างพัฒนา
export default function SessionGuard() {
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    const user = getStoredUser();
    const sessionId = getStoredSessionId();
    if (!user || !sessionId) return;

    const handleBeforeUnload = () => {
      sendOfflineBeacon();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    const checkSession = async () => {
      try {
        const result = await authService.checkSession(user.userId, sessionId);
        if (!result.valid) {
          clearSession();
          toast.warning(
            "เซสชันสิ้นสุดลง",
            "บัญชีของคุณถูกเข้าสู่ระบบจากอุปกรณ์หรือแท็บอื่น ระบบได้ออกจากระบบให้อัตโนมัติ"
          );
          router.push("/login");
        }
      } catch (err) {
        // เช็กไม่สำเร็จ (เช่น Backend ล่มชั่วคราว) — ปล่อยผ่านรอบนี้ ไม่ตัด Session ทิ้งเพราะเหตุผลด้าน Network
        console.error("ตรวจสอบ Session ไม่สำเร็จ", err);
      }
    };

    const intervalId = window.setInterval(checkSession, HEARTBEAT_INTERVAL_MS);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
