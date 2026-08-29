using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models.Project
{
    [Table("ProjectTypes", Schema = "Project")]
    public class ProjectTypes
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ProjectTypeId { get; set; }

        [Required]
        [StringLength(100)]
        public string TypeName { get; set; } = string.Empty; // เช่น 'Web Application', 'Mobile Application'

        [StringLength(255)]
        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;
        public int SortOrder { get; set; } = 0;
        public DateTimeOffset CreatedDate { get; set; } = DateTimeOffset.UtcNow;

        // Navigation Properties
        public ICollection<Projects> Projects { get; set; } = new List<Projects>();
    }
}