export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5209/api';
export const API_HOST = API_BASE_URL.replace(/\/api\/?$/, '');   // ★ เพิ่มบรรทัดนี้ → ได้ "http://localhost:5209"

// Phase 6 (Session Timeout): นับ API Call ทุกครั้งเป็น Activity ด้วย ไม่ใช่แค่ Mouse/Keyboard —
// เขียน localStorage ตรงๆ แทนการ import markActivity() จาก lib/session.ts เพื่อกัน Circular Import
// (session.ts เอง import API_BASE_URL จากไฟล์นี้อยู่แล้ว) คีย์นี้ต้องตรงกับ LAST_ACTIVITY_KEY ใน session.ts เสมอ
function markApiActivity(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("lastActivityAt", Date.now().toString());
}

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  markApiActivity();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  // เช็กว่าเป็น JSON Response หรือไม่ ก่อนทำ response.json()
  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    // ถ้า Backend พ่น Error 500 หรือ HTTP Status อื่นๆ ที่ไม่ใช่ JSON
    const errorMessage =
      data?.message ||
      `เซิร์ฟเวอร์เกิดข้อผิดพลาด (${response.status} ${response.statusText})`;
    throw new Error(errorMessage);
  }

  return data as T;
}