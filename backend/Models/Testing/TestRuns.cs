using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models.Testing
{
    [Table("TestRuns", Schema = "Testing")]
    public class TestRuns
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int TestRunId { get; set; }

        public int TestSuiteId { get; set; }

        [Required]
        [StringLength(20)]
        public string Tool { get; set; } = "playwright"; // playwright, cypress, vitest, jest, robot

        [Required]
        [StringLength(10)]
        public string Environment { get; set; } = "DEV"; // DEV, SIT, UAT, PROD

        public DateOnly RunDate { get; set; }

        public int TotalCases { get; set; } = 0;
        public int PassedCases { get; set; } = 0;
        public int FailedCases { get; set; } = 0;
        public int SkippedCases { get; set; } = 0;
        public int DurationSeconds { get; set; } = 0;

        [Required]
        [StringLength(10)]
        public string Status { get; set; } = "passed"; // passed, failed, partial, skipped

        [StringLength(500)]
        public string? ReportUrl { get; set; }

        [StringLength(500)]
        public string? Note { get; set; }

        public int TriggeredBy { get; set; }
        public DateTimeOffset CreatedDate { get; set; } = DateTimeOffset.UtcNow;

        // Navigation Properties
        [ForeignKey(nameof(TestSuiteId))]
        public TestSuites? TestSuite { get; set; }

        [ForeignKey(nameof(TriggeredBy))]
        public User? TriggeredByUser { get; set; }
    }
}
