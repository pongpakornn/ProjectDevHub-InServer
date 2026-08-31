// backend/DTOs/TestingDtos.cs
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    // ===========================================================================
    // TestRun — รวม Suite + Project เข้าด้วยกันเป็น Record เดียวแบน (ตรงกับ TestRunItem ฝั่ง Frontend)
    // ===========================================================================
    public class TestRunDto
    {
        public int TestRunId { get; set; }
        public int TestSuiteId { get; set; }
        public string SuiteName { get; set; } = string.Empty;

        public int ProjectId { get; set; }
        public string ProjectName { get; set; } = string.Empty;

        public string Tool { get; set; } = string.Empty;
        public string Environment { get; set; } = string.Empty;
        public DateOnly RunDate { get; set; }

        public int TotalCases { get; set; }
        public int PassedCases { get; set; }
        public int FailedCases { get; set; }
        public int SkippedCases { get; set; }
        public int DurationSeconds { get; set; }

        public string Status { get; set; } = string.Empty;
        public string? ReportUrl { get; set; }
        public string? Note { get; set; }
    }

    public class CreateTestRunRequest
    {
        [Required]
        public int ProjectId { get; set; }

        [Required, StringLength(255)]
        public string SuiteName { get; set; } = string.Empty;

        [Required, StringLength(20)]
        public string Tool { get; set; } = "playwright";

        [Required, StringLength(10)]
        public string Environment { get; set; } = "DEV";

        public DateOnly RunDate { get; set; }

        public int TotalCases { get; set; }
        public int PassedCases { get; set; }
        public int FailedCases { get; set; }
        public int SkippedCases { get; set; }
        public int DurationSeconds { get; set; }

        [Required, StringLength(10)]
        public string Status { get; set; } = "passed";

        [StringLength(500)]
        public string? ReportUrl { get; set; }

        [StringLength(500)]
        public string? Note { get; set; }
    }

    public class UpdateTestRunRequest : CreateTestRunRequest
    {
        [Required]
        public int TestRunId { get; set; }
    }
}
