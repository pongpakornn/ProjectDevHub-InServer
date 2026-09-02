using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.DTOs;

namespace backend.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly AppDbContext _context;

        public DashboardService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<DashboardSummaryDto> GetSummaryAsync(int userId)
        {
            // ★ Data Isolation: สถิติ/การ์ดบน Dashboard ต้องนับเฉพาะโปรเจกต์ที่ตัวเองเป็นเจ้าของหรือเป็นสมาชิกทีม
            var projects = await _context.Projects
                .Where(p => p.IsActive && (p.ProjectOwnerId == userId || p.Members.Any(m => m.UserId == userId && m.IsActive)))
                .Include(p => p.Members)
                .ToListAsync();

            var accessibleProjectIds = projects.Select(p => p.ProjectId).ToHashSet();

            var soloCount = projects.Count(p => !p.Members.Any());
            var teamCount = projects.Count(p => p.Members.Any());

            // สำหรับกราฟ/Gantt: ไม่รวมโปรเจกต์ที่ยกเลิก (CANCELLED) เพราะไม่เข้าพวก "กำลังทำ" หรือ "เสร็จแล้ว"
            var chartProjects = projects.Where(p => p.Status != "CANCELLED").ToList();
            var completedCount = chartProjects.Count(p => p.Status == "COMPLETED");
            var inProgressCount = chartProjects.Count(p => p.Status != "COMPLETED");

            var overallProgress = projects.Count > 0
                ? Math.Round(projects.Average(p => p.ProgressPercent), 0)
                : 0;

            // ★ Data Isolation: นับเฉพาะผลทดสอบของโปรเจกต์ที่เข้าถึงได้เท่านั้น (join ผ่าน TestSuite -> Project)
            var testRuns = await _context.TestRuns
                .Include(r => r.TestSuite)
                .Where(r => r.TestSuite != null && accessibleProjectIds.Contains(r.TestSuite.ProjectId))
                .ToListAsync();
            var totalTestCases = testRuns.Sum(r => r.TotalCases);
            var totalPassedCases = testRuns.Sum(r => r.PassedCases);
            var passRate = totalTestCases > 0
                ? Math.Round(totalPassedCases * 100m / totalTestCases, 0)
                : 0;

            return new DashboardSummaryDto
            {
                SoloCount = soloCount,
                TeamCount = teamCount,
                InProgressCount = inProgressCount,
                CompletedCount = completedCount,
                OverallProgress = overallProgress,
                TotalTestRuns = testRuns.Count,
                PassRate = passRate,
                TotalTestCases = totalTestCases,
                TotalDurationSeconds = testRuns.Sum(r => r.DurationSeconds),
                Projects = chartProjects
                    .OrderByDescending(p => p.CreatedDate)
                    .Select(p => new DashboardProjectDto
                    {
                        ProjectId = p.ProjectId,
                        Name = p.ProjectName,
                        Progress = p.ProgressPercent,
                        Status = p.Status == "COMPLETED" ? "completed" : "in_progress",
                        StartDate = p.StartDate,
                        EndDate = p.EndDate
                    })
                    .ToList()
            };
        }
    }
}
