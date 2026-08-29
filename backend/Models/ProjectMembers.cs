using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models.Project
{
    [Table("ProjectMembers", Schema = "Project")]
    public class ProjectMembers
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ProjectMemberId { get; set; }

        public int ProjectId { get; set; }
        public int UserId { get; set; }

        [Required]
        [StringLength(20)]
        public string RoleInProject { get; set; } = "MEMBER"; // OWNER, MEMBER, APPROVER, VIEWER

        public DateTimeOffset JoinedDate { get; set; } = DateTimeOffset.UtcNow;
        public bool IsActive { get; set; } = true;

        // Navigation Properties
        [ForeignKey(nameof(ProjectId))]
        public Projects? Project { get; set; }

        [ForeignKey(nameof(UserId))]
        public User? User { get; set; }
    }
}