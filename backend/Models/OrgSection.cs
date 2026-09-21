using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    // Core.Sections — "Section" ลูกของ Department หนึ่งรายการ
    [Table("Sections", Schema = "Core")]
    public class OrgSection
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int SectionId { get; set; }

        public int DepartmentId { get; set; }

        [Required]
        [StringLength(150)]
        public string SectionName { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;
        public int SortOrder { get; set; } = 0;
        public DateTimeOffset CreatedDate { get; set; } = DateTimeOffset.UtcNow;

        [ForeignKey(nameof(DepartmentId))]
        public OrgDepartment? Department { get; set; }
    }
}
