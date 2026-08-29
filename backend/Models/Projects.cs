using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models.Project
{
    [Table("Projects", Schema = "Project")]
    public class Projects
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ProjectId { get; set; }

        [Required]
        [StringLength(20)]
        public string ProjectCode { get; set; } = string.Empty;

        [Required]
        [StringLength(255)]
        public string ProjectName { get; set; } = string.Empty;

        public string? Description { get; set; }

        public int ProjectOwnerId { get; set; }
        public int? ProjectTypeId { get; set; }

        [StringLength(100)]
        public string? DivisionName { get; set; }

        [StringLength(100)]
        public string? RequesterName { get; set; } // ผู้ขอ/ผู้ร้องขอโปรเจกต์ (Free Text — รองรับคนนอกหน่วยงาน)

        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
        public DateOnly? ActualEndDate { get; set; }

        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "PLANNING";

        [Required]
        [StringLength(10)]
        public string Priority { get; set; } = "MEDIUM";

        [Column(TypeName = "decimal(5,2)")]
        public decimal ProgressPercent { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal? Budget { get; set; }

        public bool IsActive { get; set; } = true;

        public int CreatedBy { get; set; }
        public DateTimeOffset CreatedDate { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? UpdatedDate { get; set; }

        // Navigation Properties
        [ForeignKey(nameof(ProjectOwnerId))]
        public User? Owner { get; set; }

        [ForeignKey(nameof(CreatedBy))]
        public User? Creator { get; set; }

        [ForeignKey(nameof(ProjectTypeId))]
        public ProjectTypes? ProjectType { get; set; }

        public ICollection<ProjectMembers> Members { get; set; } = new List<ProjectMembers>();
        public ICollection<Milestones> Milestones { get; set; } = new List<Milestones>();
        public ICollection<Tasks> Tasks { get; set; } = new List<Tasks>();
        public ICollection<Comments> Comments { get; set; } = new List<Comments>();
        public ICollection<Attachments> Attachments { get; set; } = new List<Attachments>();
    }
}