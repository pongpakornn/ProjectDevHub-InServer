using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Models.Project;

namespace backend.Models.Testing
{
    [Table("TestSuites", Schema = "Testing")]
    public class TestSuites
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int TestSuiteId { get; set; }

        public int ProjectId { get; set; } // FK -> Project.Projects (Solo/Team)

        [Required]
        [StringLength(30)]
        public string SuiteCode { get; set; } = string.Empty; // เช่น "TEST-2026-001"

        [Required]
        [StringLength(255)]
        public string Name { get; set; } = string.Empty;

        public int CreatedBy { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTimeOffset CreatedDate { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? UpdatedDate { get; set; }

        // Navigation Properties
        [ForeignKey(nameof(ProjectId))]
        public Projects? Project { get; set; }

        [ForeignKey(nameof(CreatedBy))]
        public User? Creator { get; set; }

        public ICollection<TestRuns> Runs { get; set; } = new List<TestRuns>();
    }
}
