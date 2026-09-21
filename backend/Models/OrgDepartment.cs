using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    // Core.Departments — "แผนก (Department)" ลูกของ Division หนึ่งรายการ
    [Table("Departments", Schema = "Core")]
    public class OrgDepartment
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int DepartmentId { get; set; }

        public int DivisionId { get; set; }

        [Required]
        [StringLength(150)]
        public string DepartmentName { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;
        public int SortOrder { get; set; } = 0;
        public DateTimeOffset CreatedDate { get; set; } = DateTimeOffset.UtcNow;

        [ForeignKey(nameof(DivisionId))]
        public OrgDivision? Division { get; set; }

        public ICollection<OrgSection> Sections { get; set; } = new List<OrgSection>();
    }
}
