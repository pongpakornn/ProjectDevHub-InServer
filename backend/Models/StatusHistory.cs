using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models.Project
{
    [Table("StatusHistory", Schema = "Project")]
    public class StatusHistory
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long HistoryId { get; set; }

        public int? ProjectId { get; set; }
        public int? TaskId { get; set; }

        [StringLength(20)]
        public string? OldStatus { get; set; }

        [Required]
        [StringLength(20)]
        public string NewStatus { get; set; } = string.Empty;

        public int ChangedBy { get; set; }
        public DateTimeOffset ChangedDate { get; set; } = DateTimeOffset.UtcNow;

        [StringLength(500)]
        public string? Remark { get; set; }

        // Navigation Properties
        [ForeignKey(nameof(ProjectId))]
        public Projects? Project { get; set; }

        [ForeignKey(nameof(TaskId))]
        public Tasks? Task { get; set; }

        [ForeignKey(nameof(ChangedBy))]
        public User? ChangedByUser { get; set; }
    }
}