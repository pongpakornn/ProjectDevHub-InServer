using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models.Project
{
    [Table("TimeLogs", Schema = "Project")]
    public class TimeLogs
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int TimeLogId { get; set; }

        public int TaskId { get; set; }
        public int UserId { get; set; }

        public DateOnly LogDate { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal HoursSpent { get; set; }

        [StringLength(500)]
        public string? Note { get; set; }

        public DateTimeOffset CreatedDate { get; set; } = DateTimeOffset.UtcNow;

        // Navigation Properties
        [ForeignKey(nameof(TaskId))]
        public Tasks? Task { get; set; }

        [ForeignKey(nameof(UserId))]
        public User? User { get; set; }
    }
}