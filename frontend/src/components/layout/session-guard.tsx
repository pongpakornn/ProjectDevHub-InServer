"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { getStoredUser, getStoredSessionId, clearSession, sendOfflineBeacon, markActivity, getLastActivity } from "@/lib/session";
import { useToast } from "@/lib/toast-context";

const HEARTBEAT_INTERVAL_MS = 25000;
const IDLE_CHECK_INTERVAL_MS = 15000;
const IDLE_TIMEOUT_MS = 10 * 60 * 1000; // Phase 6: Auto Logout เมื่อไม่มีการเคลื่อนไหวติดต่อกัน 10 นาที
const ACTIVITY_MARK_THROTTLE_MS = 5000; // กัน mousemove ยิง localStorage.setItem ถี่เกินไป

// Mount ครั้งเดียวใน dashboard/layout.tsx — คอยสาม Job:
// 1) beforeunload: ยิง Beacon แจ้ง Backend ตั้งสถานะ Offline ตอนปิดแท็บ/ปิดแอป/รีเฟรช
// 2) Heartbeat: เช็กเป็นระยะว่า Session นี้ยังตรงกับที่ Backend เก็บไว้อยู่หรือถูก Login ใหม่จากที่อื่นเตะออกไปแล้ว
//    (รองรับ Requirement "1 User ล็อกอินพร้อมกันได้แค่ 1 Session")
// 3) Idle Timeout: จับ Mouse/Keyboard เพื่อต่ออายุ Session อัตโนมัติ — ถ้าไม่มีการเคลื่อนไหวเกิน 10 นาที
//    (นับรวมทุกแท็บของ User เดียวกันผ่าน LocalStorage) จะ Logout ให้อัตโนมัติ
// ถ้ายังไม่ได้ล็อกอิน (ไม่มี user ใน LocalStorage) จะไม่ทำอะไรเลย เพื่อไม่กระทบการเข้าถึง /dashboard/* ตรงๆ ระหว่างพัฒนา
export default function SessionGuard() {
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    const user = getStoredUser();
    const sessionId = getStoredSessionId();
    if (!user || !sessionId) return;

    markActivity(); // นับการเปิด/รีเฟรชหน้าเป็น Activity ครั้งแรกของรอบนี้ด้วย

    const handleBeforeUnload = () => {
      sendOfflineBeacon();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    let lastMarkedAt = Date.now();
    const handleActivity = () => {
      const now = Date.now();
      if (now - lastMarkedAt > ACTIVITY_MARK_THROTTLE_MS) {
        lastMarkedAt = now;
        markActivity();
      }
    };
    const activityEvents: (keyof WindowEventMap)[] = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"];
    activityEvents.forEach((evt) => window.addEventListener(evt, handleActivity, { passive: true }));

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

    const checkIdleTimeout = async () => {
      if (Date.now() - getLastActivity() <= IDLE_TIMEOUT_MS) return;

      try {
        await authService.logout(user.userId, sessionId);
      } catch (err) {
        console.error("Auto Logout แจ้ง Backend ไม่สำเร็จ", err);
      } finally {
        clearSession();
        toast.warning(
          "ออกจากระบบอัตโนมัติ",
          "ไม่พบการใช้งานติดต่อกันเกิน 10 นาที ระบบได้ออกจากระบบให้เพื่อความปลอดภัย"
        );
        router.push("/login");
      }
    };

    const heartbeatId = window.setInterval(checkSession, HEARTBEAT_INTERVAL_MS);
    const idleCheckId = window.setInterval(checkIdleTimeout, IDLE_CHECK_INTERVAL_MS);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      activityEvents.forEach((evt) => window.removeEventListener(evt, handleActivity));
      window.clearInterval(heartbeatId);
      window.clearInterval(idleCheckId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
