using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models.Project
{
    [Table("Departments", Schema = "Project")]
    public class Departments
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int DepartmentId { get; set; }

        [Required]
        [StringLength(100)]
        public string DepartmentName { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;
        public int SortOrder { get; set; } = 0;
        public DateTimeOffset CreatedDate { get; set; } = DateTimeOffset.UtcNow;
    }
}
