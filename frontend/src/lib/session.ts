import { UserInfo } from "@/services/auth.service";
import { API_BASE_URL } from "@/lib/api-client";

// ระดับผู้ใช้ตั้งแต่ ADMIN ขึ้นไปถือว่าเป็น "ผู้ดูแลระบบ" สำหรับเมนูที่ล็อกเฉพาะ Admin/Super Admin
// (ต้องตรงกับ USER_LEVEL_TO_INT ใน lib/users-api.ts: ADMIN = 6, SUPER_ADMIN = 7)
const ADMIN_LEVEL_THRESHOLD = 6;

const USER_STORAGE_KEY = "user";
const TOKEN_STORAGE_KEY = "token";
const SESSION_STORAGE_KEY = "sessionId";

// อ่านข้อมูลผู้ใช้ที่ล็อกอินอยู่จาก LocalStorage (คืนค่า null หากยังไม่ได้ล็อกอิน หรือ parse ไม่ได้)
export function getStoredUser(): UserInfo | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserInfo;
  } catch {
    return null;
  }
}

export function getStoredSessionId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION_STORAGE_KEY);
}

export function saveSession(user: UserInfo, token: string, sessionId?: string | null): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  if (sessionId) {
    localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

// ผู้ใช้มีสิทธิ์ "ดู" โมดูล systemId นี้หรือไม่ — Super Admin ผ่านเสมอไม่ว่า Permissions จะมีระบุไว้หรือไม่
export function hasSystemPermission(user: UserInfo | null, systemId: string): boolean {
  if (!user) return false;
  if (user.isSuperAdmin) return true;
  return user.permissions?.some((p) => p.systemId === systemId && p.canView) ?? false;
}

// เมนูที่ล็อกเฉพาะ Admin/Super Admin (ไม่ผูกกับ Permission Matrix ปกติ) เช่น 3D Model Test, User Management
export function isAdminOrAbove(user: UserInfo | null): boolean {
  if (!user) return false;
  return user.isSuperAdmin || user.userLevel >= ADMIN_LEVEL_THRESHOLD;
}

// ยิง Logout ไปฝั่ง Backend แบบไม่รอผลลัพธ์ (Fire-and-forget) โดยใช้ navigator.sendBeacon
// ซึ่งเป็นวิธีเดียวที่รับประกันว่า Request จะถูกส่งออกไปได้จริงตอน beforeunload (ปิดแท็บ/ปิดแอป/รีเฟรช)
// เพราะ fetch() ธรรมดาอาจถูก Browser ยกเลิกกลางคันตอนหน้าเว็บกำลัง Unload
export function sendOfflineBeacon(): void {
  if (typeof window === "undefined" || !navigator.sendBeacon) return;
  const user = getStoredUser();
  const sessionId = getStoredSessionId();
  if (!user) return;

  const payload = JSON.stringify({ userId: user.userId, sessionId });
  const blob = new Blob([payload], { type: "application/json" });
  navigator.sendBeacon(`${API_BASE_URL}/auth/logout`, blob);
}
