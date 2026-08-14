using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("AuditLogs", Schema = "Core")]
    public class AuditLog
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long LogId { get; set; }

        public int? UserId { get; set; }

        [Required]
        [StringLength(50)]
        public string SystemId { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string ActionType { get; set; } = string.Empty;

        public string? LogDescription { get; set; }

        [StringLength(100)]
        public string? LogRef { get; set; }

        [StringLength(45)]
        public string? IpAddress { get; set; }

        [StringLength(255)]
        public string? ComputerName { get; set; }

        public DateTimeOffset LogDate { get; set; } = DateTimeOffset.UtcNow;
    }
}