using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.DTOs;

namespace backend.Services
{
    // Visitor Mode ใช้ข้อมูลชุดเดียวกับ Solo/Team จริง (ไม่ Mock) — ดึงรายชื่อ "เจ้าของโปรเจกต์" และการ์ด
    // สรุปโปรเจกต์ของแต่ละคนโดยตรงจาก Project.Projects ส่วนรายละเอียดเจาะลึกของแต่ละโปรเจกต์ (Phase/Stack/
    // Showcase/Members) ให้ VisitorController เรียก IProjectSoloService/IProjectTeamService เดิมต่อ โดยส่ง
    // targetUserId (เจ้าของโปรเจกต์จริง) เข้าไปแทน currentUserId เพื่อผ่านเงื่อนไข Data Isolation เดิมได้ตรงๆ
    // โดยไม่ต้องเพิ่ม Method ใหม่ในสอง Service นั้นเลย
    public class VisitorService : IVisitorService
    {
        private readonly AppDbContext _context;

        public VisitorService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<VisitorUserDto>> GetVisitableUsersAsync()
        {
            var stats = await _context.Projects
                .Where(p => p.IsActive)
                .GroupBy(p => p.ProjectOwnerId)
                .Select(g => new { UserId = g.Key, Count = g.Count(), Latest = g.Max(p => p.CreatedDate) })
                .ToListAsync();

            if (stats.Count == 0) return new List<VisitorUserDto>();

            var ownerIds = stats.Select(s => s.UserId).ToList();

            var users = await _context.Users.AsNoTracking()
                .Where(u => ownerIds.Contains(u.UserId) && u.IsActive && !u.IsSuspended)
                .ToListAsync();

            var statMap = stats.ToDictionary(s => s.UserId, s => s);

            return users
                .Select(u => new VisitorUserDto
                {
                    UserId = u.UserId,
                    EmpId = u.EmpId,
                    FullName = u.FullName,
                    UserLevel = u.UserLevel,
                    DivisionName = u.DivisionName,
                    DepartmentName = u.DepartmentName,
                    ProjectCount = statMap[u.UserId].Count,
                    LatestProjectDate = statMap[u.UserId].Latest,
                })
                .OrderByDescending(u => u.LatestProjectDate)
                .ToList();
        }

        public async Task<List<VisitorProjectCardDto>> GetUserProjectCardsAsync(int targetUserId)
        {
            var projects = await _context.Projects
                .Where(p => p.IsActive && p.ProjectOwnerId == targetUserId)
                .Include(p => p.ProjectType)
                .Include(p => p.Owner)
                .Include(p => p.Members)
                .OrderByDescending(p => p.CreatedDate)
                .ToListAsync();

            return projects.Select(p => new VisitorProjectCardDto
            {
                ProjectId = p.ProjectId,
                ProjectCode = p.ProjectCode,
                ProjectName = p.ProjectName,
                Description = p.Description,
                ProjectTypeName = p.ProjectType?.TypeName ?? string.Empty,
                Status = p.Status,
                Priority = p.Priority,
                StartDate = p.StartDate,
                EndDate = p.EndDate,
                ProgressPercent = p.ProgressPercent,
                WorkType = p.Members.Any() ? "TEAM" : "SOLO",
                OwnerName = p.Owner?.FullName ?? string.Empty,
            }).ToList();
        }
    }
}
