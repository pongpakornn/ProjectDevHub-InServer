using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models.Project
{
    [Table("Tags", Schema = "Project")]
    public class Tags
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int TagId { get; set; }

        [Required]
        [StringLength(50)]
        public string TagName { get; set; } = string.Empty;

        [StringLength(10)]
        public string? ColorCode { get; set; } // เช่น '#FF5733'

        // Navigation Properties
        public ICollection<TaskTags> TaskTags { get; set; } = new List<TaskTags>();
    }
}