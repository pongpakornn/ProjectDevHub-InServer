using backend.DTOs;

namespace backend.Services
{
    public interface IVisitorService
    {
        // รายชื่อ User ทั้งหมดที่เป็นเจ้าของโปรเจกต์อย่างน้อย 1 โปรเจกต์ (Solo หรือ Team ก็นับ)
        Task<List<VisitorUserDto>> GetVisitableUsersAsync();

        // การ์ดโปรเจกต์ทั้งหมดของ User คนที่เลือกดู (เฉพาะโปรเจกต์ที่ targetUserId เป็นเจ้าของ)
        Task<List<VisitorProjectCardDto>> GetUserProjectCardsAsync(int targetUserId);
    }
}
