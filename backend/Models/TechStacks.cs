// PAGE - SOLO

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models.Project
{
    [Table("TechStacks", Schema = "Project")]
    public class TechStacks
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int TechStackId { get; set; }

        public int ProjectId { get; set; }

        [Required]
        [StringLength(50)]
        public string StackType { get; set; } = string.Empty; // เช่น 'ภาษา (Language)', 'Framework', 'Library', 'Database', 'API/Service'

        [Required]
        [StringLength(100)]
        public string StackName { get; set; } = string.Empty; // เช่น 'TypeScript', 'Next.js'

        [StringLength(50)]
        public string? Version { get; set; } // เช่น '5.0', '14.2'

        [Required]
        [StringLength(20)]
        public string Layer { get; set; } = "Frontend"; // Frontend, Backend, Database, DevOps, Other

        public int SortOrder { get; set; } = 0;
        public DateTimeOffset CreatedDate { get; set; } = DateTimeOffset.UtcNow;

        // Navigation Properties
        [ForeignKey(nameof(ProjectId))]
        public Projects? Project { get; set; }
    }
}