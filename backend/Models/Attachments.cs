using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models.Project
{
    [Table("Attachments", Schema = "Project")]
    public class Attachments
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long AttachmentId { get; set; }

        // ต้องระบุอย่างน้อย ProjectId หรือ TaskId อย่างใดอย่างหนึ่ง (บังคับด้วย CHECK Constraint ใน DbContext)
        public int? ProjectId { get; set; }
        public int? TaskId { get; set; }

        [Required]
        [StringLength(255)]
        public string FileName { get; set; } = string.Empty;

        [Required]
        [StringLength(500)]
        public string FilePath { get; set; } = string.Empty;

        public long? FileSizeByte { get; set; }

        public int UploadedBy { get; set; }
        public DateTimeOffset UploadedDate { get; set; } = DateTimeOffset.UtcNow;

        // Navigation Properties
        [ForeignKey(nameof(ProjectId))]
        public Projects? Project { get; set; }

        [ForeignKey(nameof(TaskId))]
        public Tasks? Task { get; set; }

        [ForeignKey(nameof(UploadedBy))]
        public User? Uploader { get; set; }
    }
}