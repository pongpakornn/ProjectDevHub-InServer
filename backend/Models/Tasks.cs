using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models.Project
{
    [Table("Tasks", Schema = "Project")]
    public class Tasks
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int TaskId { get; set; }

        public int ProjectId { get; set; }
        public int? MilestoneId { get; set; }
        public int? ParentTaskId { get; set; }

        [Required]
        [StringLength(255)]
        public string TaskName { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "TODO"; // TODO, IN_PROGRESS, REVIEW, DONE, CANCELLED

        [Required]
        [StringLength(10)]
        public string Priority { get; set; } = "MEDIUM"; // LOW, MEDIUM, HIGH, URGENT

        public DateOnly? StartDate { get; set; }
        public DateOnly? DueDate { get; set; }
        public DateOnly? CompletedDate { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal ProgressPercent { get; set; } = 0;

        [Column(TypeName = "decimal(6,2)")]
        public decimal? EstimatedHours { get; set; }

        public int CreatedBy { get; set; }
        public DateTimeOffset CreatedDate { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? UpdatedDate { get; set; }

        // Navigation Properties
        [ForeignKey(nameof(ProjectId))]
        public Projects? Project { get; set; }

        [ForeignKey(nameof(MilestoneId))]
        public Milestones? Milestone { get; set; }

        [ForeignKey(nameof(ParentTaskId))]
        public Tasks? ParentTask { get; set; }

        [ForeignKey(nameof(CreatedBy))]
        public User? Creator { get; set; }

        public ICollection<Tasks> SubTasks { get; set; } = new List<Tasks>();
        public ICollection<TaskAssignees> Assignees { get; set; } = new List<TaskAssignees>();
        public ICollection<TimeLogs> TimeLogs { get; set; } = new List<TimeLogs>();
        public ICollection<Comments> Comments { get; set; } = new List<Comments>();
        public ICollection<Attachments> Attachments { get; set; } = new List<Attachments>();
        public ICollection<TaskTags> TaskTags { get; set; } = new List<TaskTags>();
    }
}