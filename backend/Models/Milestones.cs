// // PAGE - SOLO
// using System.ComponentModel.DataAnnotations;
// using System.ComponentModel.DataAnnotations.Schema;

// namespace backend.Models.Project
// {
//     [Table("Milestones", Schema = "Project")]
//     public class Milestones
//     {
//         [Key]
//         [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
//         public int MilestoneId { get; set; }

//         public int ProjectId { get; set; }
//         public int? OwnerId { get; set; }                        // ผู้รับผิดชอบ Phase (FK -> Core.Users)

//         [Required]
//         [StringLength(255)]
//         public string MilestoneName { get; set; } = string.Empty;

//         public DateOnly? DueDate { get; set; }
//         public DateOnly? CompletedDate { get; set; }

//         [Required]
//         [StringLength(20)]
//         public string Status { get; set; } = "PENDING"; // PENDING, IN_PROGRESS, COMPLETED, DELAYED

//         public int SortOrder { get; set; } = 0;
//         public DateTimeOffset CreatedDate { get; set; } = DateTimeOffset.UtcNow;

//         // Navigation Properties
//         [ForeignKey(nameof(ProjectId))]
//         public Projects? Project { get; set; }

//         [ForeignKey(nameof(OwnerId))]
//         public User? Owner { get; set; }

//         public ICollection<Tasks> Tasks { get; set; } = new List<Tasks>();
//     }
// }
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models.Project
{
    [Table("Milestones", Schema = "Project")]
    public class Milestones
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int MilestoneId { get; set; }

        public int ProjectId { get; set; }
        public int? OwnerId { get; set; }                        // ผู้รับผิดชอบ Phase (FK -> Core.Users)

        [Required]
        [StringLength(255)]
        public string MilestoneName { get; set; } = string.Empty;

        public DateOnly? StartDate { get; set; }   // ★ เพิ่มบรรทัดนี้ — ที่ทำให้ error 3 จุดหายไป
        public DateOnly? DueDate { get; set; }
        public DateOnly? CompletedDate { get; set; }

        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "PENDING"; // PENDING, IN_PROGRESS, COMPLETED, DELAYED

        public int SortOrder { get; set; } = 0;
        public DateTimeOffset CreatedDate { get; set; } = DateTimeOffset.UtcNow;

        // Navigation Properties
        [ForeignKey(nameof(ProjectId))]
        public Projects? Project { get; set; }

        [ForeignKey(nameof(OwnerId))]
        public User? Owner { get; set; }

        public ICollection<Tasks> Tasks { get; set; } = new List<Tasks>();
    }
}