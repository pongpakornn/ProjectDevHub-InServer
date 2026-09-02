"use client";

import { useEffect, useState } from "react";
import { getStoredUser } from "@/lib/session";
import { UserInfo } from "@/services/auth.service";

export interface SystemPermissionFlags {
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canReject: boolean;
}

// ยังไม่ Login (ไม่มี User ใน LocalStorage) = อนุญาตทุกอย่างไปก่อน เพื่อไม่กระทบ Flow การเข้าถึง
// /dashboard/* ตรงๆ ระหว่างพัฒนา (ยังไม่มี Auth Guard บังคับ Login) — Pattern เดียวกับ
// components/layout/sidebar.tsx ที่แสดงเมนูทั้งหมดถ้ายังไม่มี currentUser
const FALLBACK_WHEN_NOT_LOGGED_IN: SystemPermissionFlags = {
  canView: true,
  canAdd: true,
  canEdit: true,
  canDelete: true,
  canApprove: true,
  canReject: true,
};

// อ่านสิทธิ์ Add/Edit/Delete/Approve/Reject ของ User ที่ล็อกอินอยู่สำหรับ systemId ที่ระบุ เพื่อใช้
// ซ่อน/ปิดปุ่มฝั่ง UI ให้ตรงกับที่ Backend เช็คจริงผ่าน [RequirePermission] (ดู backend/Authorization)
// Super Admin ผ่านเสมอ ตรงกับกฎฝั่ง Backend
export function useSystemPermissions(systemId: string): SystemPermissionFlags & { userId: number } {
  const [user, setUser] = useState<UserInfo | null | undefined>(undefined);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  if (user === undefined) {
    // ระหว่างรอ useEffect รอบแรก (SSR/Hydration) — ใช้ค่าเดียวกับตอนไม่ได้ Login ไปก่อนกันปุ่มกระพริบ
    return { ...FALLBACK_WHEN_NOT_LOGGED_IN, userId: 1 };
  }

  if (!user) {
    return { ...FALLBACK_WHEN_NOT_LOGGED_IN, userId: 1 };
  }

  if (user.isSuperAdmin) {
    return { ...FALLBACK_WHEN_NOT_LOGGED_IN, userId: user.userId };
  }

  const perm = user.permissions?.find((p) => p.systemId === systemId);
  return {
    userId: user.userId,
    canView: perm?.canView ?? false,
    canAdd: perm?.canAdd ?? false,
    canEdit: perm?.canEdit ?? false,
    canDelete: perm?.canDelete ?? false,
    canApprove: perm?.canApprove ?? false,
    canReject: perm?.canReject ?? false,
  };
}
