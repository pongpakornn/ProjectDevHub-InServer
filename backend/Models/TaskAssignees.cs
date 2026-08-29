using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models.Project
{
    [Table("TaskAssignees", Schema = "Project")]
    public class TaskAssignees
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int TaskAssigneeId { get; set; }

        public int TaskId { get; set; }
        public int UserId { get; set; }

        public DateTimeOffset AssignedDate { get; set; } = DateTimeOffset.UtcNow;

        // Navigation Properties
        [ForeignKey(nameof(TaskId))]
        public Tasks? Task { get; set; }

        [ForeignKey(nameof(UserId))]
        public User? User { get; set; }
    }
}