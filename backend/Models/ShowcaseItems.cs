// PAGE - SOLO
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models.Project
{
    [Table("ShowcaseItems", Schema = "Project")]
    public class ShowcaseItems
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ShowcaseItemId { get; set; }

        public int ProjectId { get; set; }

        [Required]
        [StringLength(255)]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }
        public string? FlowDescription { get; set; } // คำอธิบาย Flow การทำงาน (แสดงตอนพลิกการ์ด)

        [StringLength(500)]
        public string? ImageUrl { get; set; }

        public int SortOrder { get; set; } = 0;
        public int CreatedBy { get; set; }
        public DateTimeOffset CreatedDate { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? UpdatedDate { get; set; }

        // Navigation Properties
        [ForeignKey(nameof(ProjectId))]
        public Projects? Project { get; set; }

        [ForeignKey(nameof(CreatedBy))]
        public User? Creator { get; set; }
    }
}