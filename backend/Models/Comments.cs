using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models.Project
{
    [Table("Comments", Schema = "Project")]
    public class Comments
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long CommentId { get; set; }

        // ต้องระบุอย่างน้อย ProjectId หรือ TaskId อย่างใดอย่างหนึ่ง (บังคับด้วย CHECK Constraint ใน DbContext)
        public int? ProjectId { get; set; }
        public int? TaskId { get; set; }

        public int UserId { get; set; }

        [Required]
        public string CommentText { get; set; } = string.Empty;

        public DateTimeOffset CreatedDate { get; set; } = DateTimeOffset.UtcNow;

        // Navigation Properties
        [ForeignKey(nameof(ProjectId))]
        public Projects? Project { get; set; }

        [ForeignKey(nameof(TaskId))]
        public Tasks? Task { get; set; }

        [ForeignKey(nameof(UserId))]
        public User? User { get; set; }
    }
}