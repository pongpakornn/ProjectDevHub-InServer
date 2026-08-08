export interface LoginPayload {
  userId: string;
  password?: string;
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

export async function loginApi(payload: LoginPayload) {
  // รองรับ Async Fetch ไปยัง ASP.NET Core API
  if (payload.userId === 'admin' && payload.password === '1234') {
    return { title: 'เข้าสู่ระบบสำเร็จ!', user: { userId: 'admin', name: 'NonDev Manager' } };
  }
  throw new Error('รหัสพนักงานหรือรหัสผ่านไม่ถูกต้อง');
}

export async function registerApi(payload: RegisterPayload) {
  return { title: 'ลงทะเบียนสำเร็จเรียบร้อย!' };
}

export async function resetPasswordApi(payload: ResetPasswordPayload) {
  return { title: 'เปลี่ยนรหัสผ่านสำเร็จเรียบร้อย!' };
}