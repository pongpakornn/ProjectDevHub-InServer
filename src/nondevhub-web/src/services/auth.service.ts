export interface LoginPayload {
  userId: string;
  password?: string;
  computerName?: string;
}

export interface RegisterPayload {
  userId: string;
  name: string;
  password?: string;
}

export interface ResetPasswordPayload {
  userId: string;
  newPassword?: string;
}

export interface UserProfileDto {
  userId: string;
  name: string;
  userLevel?: number;
  isSuperAdmin?: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5294";

export async function loginApi(payload: LoginPayload) {
  if (!payload || !payload.userId) {
    throw new Error("กรุณากรอก User ID / รหัสพนักงาน");
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      empId: payload.userId.trim(),
      password: payload.password,
      computerName: payload.computerName || (typeof window !== "undefined" ? window.navigator.userAgent : "Web-Client"),
    }),
  });

  const contentType = response.headers.get("content-type");
  let data: any = {};
  
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const rawText = await response.text();
    throw new Error(`Server Error (${response.status}): ${rawText.substring(0, 100)}...`);
  }

  if (!response.ok || !data.success) {
    throw new Error(data.message || "รหัสพนักงานหรือรหัสผ่านไม่ถูกต้อง");
  }

  // 🟢 แก้ไขจุดที่ทำให้เกิด Error: แมปจาก data.user โดยใช้ Optional Chaining (?. ) และ Fallback
  const userData = data.user || data.data || {};

  return {
    title: data.message || "เข้าสู่ระบบสำเร็จ!",
    user: {
      userId: userData.empId || payload.userId,
      name: userData.fullName || userData.name || "User",
      userLevel: userData.userLevel ?? 1,
      isSuperAdmin: userData.isSuperAdmin ?? false,
    } as UserProfileDto,
  };
}

export async function registerApi(payload: RegisterPayload) {
  if (!payload || !payload.userId) {
    throw new Error("กรุณากรอกข้อมูลให้ครบถ้วน");
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      empId: payload.userId.trim(),
      fullName: payload.name,
      password: payload.password,
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "ไม่สามารถลงทะเบียนได้");
  }

  return { title: data.message || "ลงทะเบียนสำเร็จเรียบร้อย!" };
}

export async function resetPasswordApi(payload: ResetPasswordPayload) {
  if (!payload || !payload.userId) {
    throw new Error("กรุณากรอกข้อมูลให้ครบถ้วน");
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      empId: payload.userId.trim(),
      newPassword: payload.newPassword,
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "ไม่สามารถเปลี่ยนรหัสผ่านได้");
  }

  return { title: data.message || "เปลี่ยนรหัสผ่านสำเร็จเรียบร้อย!" };
}