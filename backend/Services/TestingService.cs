using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.DTOs;
using backend.Models.Testing;

namespace backend.Services
{
    public class TestingService : ITestingService
    {
        private readonly AppDbContext _context;

        public TestingService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<TestRunDto>> GetTestRunsAsync(int userId)
        {
            // ★ Data Isolation: เห็นเฉพาะผลทดสอบของโปรเจกต์ที่ตัวเองเป็นเจ้าของหรือเป็นสมาชิกทีม
            var runs = await _context.TestRuns
                .Include(r => r.TestSuite)
                    .ThenInclude(s => s!.Project)
                        .ThenInclude(p => p!.Members)
                .Where(r => r.TestSuite != null && r.TestSuite.Project != null
                    && (r.TestSuite.Project.ProjectOwnerId == userId
                        || r.TestSuite.Project.Members.Any(m => m.UserId == userId && m.IsActive)))
                .OrderByDescending(r => r.RunDate)
                .ThenByDescending(r => r.CreatedDate)
                .ToListAsync();

            return runs.Select(MapToTestRunDto).ToList();
        }

        public async Task<TestRunDto?> CreateTestRunAsync(CreateTestRunRequest request, int currentUserId)
        {
            // ★ Data Isolation: บันทึกผลทดสอบได้เฉพาะกับโปรเจกต์ที่ตัวเองเข้าถึงได้เท่านั้น
            var hasAccess = await _context.Projects.AnyAsync(p => p.ProjectId == request.ProjectId
                && (p.ProjectOwnerId == currentUserId || p.Members.Any(m => m.UserId == currentUserId && m.IsActive)));
            if (!hasAccess) return null;

            var suite = await FindOrCreateSuiteAsync(request.ProjectId, request.SuiteName, currentUserId);

            var run = new TestRuns
            {
                TestSuiteId = suite.TestSuiteId,
                Tool = request.Tool,
                Environment = request.Environment,
                RunDate = request.RunDate,
                TotalCases = request.TotalCases,
                PassedCases = request.PassedCases,
                FailedCases = request.FailedCases,
                SkippedCases = request.SkippedCases,
                DurationSeconds = request.DurationSeconds,
                Status = request.Status,
                ReportUrl = request.ReportUrl,
                Note = request.Note,
                TriggeredBy = currentUserId
            };

            _context.TestRuns.Add(run);
            await _context.SaveChangesAsync();

            await _context.Entry(run).Reference(r => r.TestSuite).LoadAsync();
            await _context.Entry(suite).Reference(s => s.Project).LoadAsync();

            return MapToTestRunDto(run);
        }

        public async Task<TestRunDto?> UpdateTestRunAsync(UpdateTestRunRequest request, int currentUserId)
        {
            var run = await _context.TestRuns
                .Include(r => r.TestSuite)
                .FirstOrDefaultAsync(r => r.TestRunId == request.TestRunId);
            if (run == null) return null;

            // ★ Data Isolation: ย้ายผลทดสอบไปผูกกับโปรเจกต์ที่ตัวเองเข้าถึงไม่ได้ไม่ได้
            var hasAccess = await _context.Projects.AnyAsync(p => p.ProjectId == request.ProjectId
                && (p.ProjectOwnerId == currentUserId || p.Members.Any(m => m.UserId == currentUserId && m.IsActive)));
            if (!hasAccess) return null;

            var suite = await FindOrCreateSuiteAsync(request.ProjectId, request.SuiteName, currentUserId);

            run.TestSuiteId = suite.TestSuiteId;
            run.Tool = request.Tool;
            run.Environment = request.Environment;
            run.RunDate = request.RunDate;
            run.TotalCases = request.TotalCases;
            run.PassedCases = request.PassedCases;
            run.FailedCases = request.FailedCases;
            run.SkippedCases = request.SkippedCases;
            run.DurationSeconds = request.DurationSeconds;
            run.Status = request.Status;
            run.ReportUrl = request.ReportUrl;
            run.Note = request.Note;

            await _context.SaveChangesAsync();

            await _context.Entry(run).Reference(r => r.TestSuite).LoadAsync();
            await _context.Entry(suite).Reference(s => s.Project).LoadAsync();

            return MapToTestRunDto(run);
        }

        public async Task<bool> DeleteTestRunAsync(int testRunId)
        {
            var run = await _context.TestRuns.FindAsync(testRunId);
            if (run == null) return false;

            _context.TestRuns.Remove(run);
            await _context.SaveChangesAsync();
            return true;
        }

        // ===========================================================================
        // Helpers
        // ===========================================================================

        // หา TestSuite เดิมของ Project นี้ที่ชื่อตรงกัน — ถ้าไม่มีให้สร้างใหม่ (ผู้ใช้กรอกแค่ชื่อ Suite
        // แบบ Free Text ที่หน้า UI ไม่ต้องเลือก Suite ที่มีอยู่ก่อน เหมือนพฤติกรรมเดิมของ Mock)
        private async Task<TestSuites> FindOrCreateSuiteAsync(int projectId, string suiteName, int currentUserId)
        {
            var suite = await _context.TestSuites
                .FirstOrDefaultAsync(s => s.ProjectId == projectId && s.Name == suiteName);

            if (suite != null) return suite;

            suite = new TestSuites
            {
                ProjectId = projectId,
                SuiteCode = await GenerateSuiteCodeAsync(),
                Name = suiteName,
                CreatedBy = currentUserId,
                IsActive = true
            };

            _context.TestSuites.Add(suite);
            await _context.SaveChangesAsync();
            return suite;
        }

        private async Task<string> GenerateSuiteCodeAsync()
        {
            var year = DateTime.UtcNow.Year;
            var prefix = $"TEST-{year}-";

            var lastCode = await _context.TestSuites
                .Where(s => s.SuiteCode.StartsWith(prefix))
                .OrderByDescending(s => s.SuiteCode)
                .Select(s => s.SuiteCode)
                .FirstOrDefaultAsync();

            var nextSeq = 1;
            if (lastCode != null && int.TryParse(lastCode.Substring(prefix.Length), out var lastSeq))
            {
                nextSeq = lastSeq + 1;
            }

            return $"{prefix}{nextSeq:D3}";
        }

        private static TestRunDto MapToTestRunDto(TestRuns r) => new()
        {
            TestRunId = r.TestRunId,
            TestSuiteId = r.TestSuiteId,
            SuiteName = r.TestSuite?.Name ?? string.Empty,
            ProjectId = r.TestSuite?.ProjectId ?? 0,
            ProjectName = r.TestSuite?.Project?.ProjectName ?? string.Empty,
            Tool = r.Tool,
            Environment = r.Environment,
            RunDate = r.RunDate,
            TotalCases = r.TotalCases,
            PassedCases = r.PassedCases,
            FailedCases = r.FailedCases,
            SkippedCases = r.SkippedCases,
            DurationSeconds = r.DurationSeconds,
            Status = r.Status,
            ReportUrl = r.ReportUrl,
            Note = r.Note
        };
    }
}
