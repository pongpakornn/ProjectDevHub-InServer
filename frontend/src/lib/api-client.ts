export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5209/api';
export const API_HOST = API_BASE_URL.replace(/\/api\/?$/, '');   // ★ เพิ่มบรรทัดนี้ → ได้ "http://localhost:5209"

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
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