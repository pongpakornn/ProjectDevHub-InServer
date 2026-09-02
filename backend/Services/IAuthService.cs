using backend.DTOs;

namespace backend.Services
{
    public interface IAuthService
    {
        Task<LoginResponse> LoginAsync(LoginRequest request, string ipAddress, string computerName);

        // ทำเครื่องหมาย Offline ให้ User — ทำเฉพาะเมื่อ sessionId ที่ส่งมาตรงกับ Session ปัจจุบันใน DB เท่านั้น
        // (กัน Session เก่าที่ถูกเตะออกไปแล้ว มา Logout ทับสถานะ Online ของ Session ใหม่ที่เพิ่ง Login เข้ามาแทน)
        Task LogoutAsync(int userId, string? sessionId);

        // ใช้สำหรับ Heartbeat ตรวจสอบว่า Session นี้ยังเป็น Session ล่าสุดของ User หรือถูกเตะออกไปแล้ว
        // (รองรับ Requirement "จำกัด Login ได้ครั้งละ 1 Session" — Login ใหม่ทับ Session เก่าโดยอัตโนมัติ)
        Task<bool> IsSessionValidAsync(int userId, string sessionId);
    }
}