// backend/DTOs/DashboardDtos.cs
namespace backend.DTOs
{
    // ===========================================================================
    // Dashboard Summary — รวมภาพรวม Solo/Team/Testing สำหรับหน้า Dashboard หลัก
    // ===========================================================================
    public class DashboardSummaryDto
    {
        public int SoloCount { get; set; }
        public int TeamCount { get; set; }
        public int InProgressCount { get; set; }
        public int CompletedCount { get; set; }
        public decimal OverallProgress { get; set; } // ค่าเฉลี่ย ProgressPercent ของทุก Project ที่ Active

        public int TotalTestRuns { get; set; }
        public decimal PassRate { get; set; } // % จาก PassedCases / TotalCases รวมทุก Run
        public int TotalTestCases { get; set; }
        public int TotalDurationSeconds { get; set; }

        // รายชื่อ Project (Solo+Team รวมกัน ไม่รวมที่ยกเลิก) สำหรับกราฟแท่ง/Gantt/Progress List
        public List<DashboardProjectDto> Projects { get; set; } = new();
    }

    public class DashboardProjectDto
    {
        public int ProjectId { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Progress { get; set; }
        public string Status { get; set; } = string.Empty; // "completed" | "in_progress"
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
    }
}
