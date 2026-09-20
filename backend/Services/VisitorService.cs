using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.DTOs;

namespace backend.Services
{
    // Visitor Mode ใช้ข้อมูลชุดเดียวกับ Solo/Team จริง (ไม่ Mock) — สอง Query ด้านล่างอ่านตรงจาก
    // Project.vw_ProjectOwnerStats / Project.vw_ProjectOverview (ดู DatabaseBackup_ProjectDevHub.sql
    // SECTION 7) แทนการ GroupBy/Include+Select เองใน LINQ เพื่อลดโค้ด JOIN ซ้ำซ้อนฝั่ง C# — รายละเอียด
    // เจาะลึกของแต่ละโปรเจกต์ (Phase/Stack/Showcase/Members) ยังให้ VisitorController เรียก
    // IProjectSoloService/IProjectTeamService เดิมต่อ โดยส่ง targetUserId เข้าไปแทน currentUserId
    public class VisitorService : IVisitorService
    {
        private readonly AppDbContext _context;

        public VisitorService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<VisitorUserDto>> GetVisitableUsersAsync()
        {
            return await _context.Database
                .SqlQuery<VisitorUserDto>($@"
                    SELECT UserId, EmpId, FullName, UserLevel, DivisionName, DepartmentName,
                           ProjectCount, LatestProjectDate
                    FROM Project.vw_ProjectOwnerStats
                    ORDER BY LatestProjectDate DESC")
                .ToListAsync();
        }

        public async Task<List<VisitorProjectCardDto>> GetUserProjectCardsAsync(int targetUserId)
        {
            return await _context.Database
                .SqlQuery<VisitorProjectCardDto>($@"
                    SELECT ProjectId, ProjectCode, ProjectName, Description, ISNULL(ProjectTypeName, N'') AS ProjectTypeName,
                           Status, Priority, StartDate, EndDate, ProgressPercent, WorkType, ISNULL(OwnerName, N'') AS OwnerName
                    FROM Project.vw_ProjectOverview
                    WHERE ProjectOwnerId = {targetUserId} AND IsActive = 1
                    ORDER BY CreatedDate DESC")
                .ToListAsync();
        }
    }
}
