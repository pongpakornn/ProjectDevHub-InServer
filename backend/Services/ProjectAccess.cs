using System.Linq.Expressions;
using backend.Models.Project;

namespace backend.Services
{
    // ===========================================================================
    // Data Isolation ตาม UserID — ใช้ร่วมกันทุก Service ที่ต้อง Query ข้อมูลผูกกับ Projects
    // กติกาเดียว: เห็นเฉพาะโปรเจกต์ที่ตัวเองเป็นเจ้าของ (ProjectOwnerId) หรือถูกเพิ่มเป็นสมาชิกทีม
    // (Project.ProjectMembers) เท่านั้น — ไม่มีข้อยกเว้นอื่นนอกจากนี้ (ตาม Requirement รอบ Data Isolation)
    // ===========================================================================
    public static class ProjectAccess
    {
        public static Expression<Func<Projects, bool>> For(int userId) =>
            p => p.ProjectOwnerId == userId || p.Members.Any(m => m.UserId == userId && m.IsActive);

        public static bool IsAccessible(Projects project, int userId) =>
            project.ProjectOwnerId == userId || project.Members.Any(m => m.UserId == userId && m.IsActive);
    }
}
