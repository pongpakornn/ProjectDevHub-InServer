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
  userLevel?: string;
  isSuperAdmin?: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function loginApi(payload: LoginPayload) {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      empId: payload.userId,
      password: payload.password,
      computerName: payload.computerName || (typeof window !== "undefined" ? window.navigator.userAgent : "Web-Client"),
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "รหัสพนักงานหรือรหัสผ่านไม่ถูกต้อง");
  }

  return {
    title: "เข้าสู่ระบบสำเร็จ!",
    user: {
      userId: data.data.empId,
      name: data.data.fullName,
      userLevel: data.data.userLevel,
      isSuperAdmin: data.data.isSuperAdmin,
    } as UserProfileDto,
  };
}

export async function registerApi(payload: RegisterPayload) {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      empId: payload.userId,
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
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      empId: payload.userId,
      newPassword: payload.newPassword,
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "ไม่สามารถเปลี่ยนรหัสผ่านได้");
  }

  return { title: data.message || "เปลี่ยนรหัสผ่านสำเร็จเรียบร้อย!" };
}