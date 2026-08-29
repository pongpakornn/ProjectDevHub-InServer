using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models.Planning
{
    [Table("Events", Schema = "Planning")]
    public class Events
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int EventId { get; set; }

        public int UserId { get; set; }

        [Required]
        [StringLength(255)]
        public string EventTitle { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        [StringLength(20)]
        public string EventType { get; set; } = "APPOINTMENT"; // MEETING, APPOINTMENT, REMINDER, PERSONAL

        public DateTimeOffset StartDateTime { get; set; }
        public DateTimeOffset EndDateTime { get; set; }
        public bool IsAllDay { get; set; } = false;

        [StringLength(255)]
        public string? Location { get; set; }

        public int? ReminderMinutesBefore { get; set; }

        [StringLength(100)]
        public string? RecurrenceRule { get; set; } // เช่น 'DAILY','WEEKLY','MONTHLY'

        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "SCHEDULED"; // SCHEDULED, COMPLETED, CANCELLED

        // เชื่อมโยงกับโมดูล Project ได้ (optional)
        public int? LinkedProjectId { get; set; }
        public int? LinkedTaskId { get; set; }

        public DateTimeOffset CreatedDate { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? UpdatedDate { get; set; }

        // Navigation Properties
        [ForeignKey(nameof(UserId))]
        public User? User { get; set; }

        [ForeignKey(nameof(LinkedProjectId))]
        public backend.Models.Project.Projects? LinkedProject { get; set; }

        [ForeignKey(nameof(LinkedTaskId))]
        public backend.Models.Project.Tasks? LinkedTask { get; set; }

        public ICollection<Todos> Todos { get; set; } = new List<Todos>();
    }
}