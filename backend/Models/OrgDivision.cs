using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    // Core.Divisions — "หน่วยงาน (Division)" dropdown master data สำหรับหน้า User Management
    // (แยกจาก Project.Departments ซึ่งเป็นคนละส่วน ใช้กับฟิลด์ DivisionName ของ Project เอง)
    [Table("Divisions", Schema = "Core")]
    public class OrgDivision
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int DivisionId { get; set; }

        [Required]
        [StringLength(150)]
        public string DivisionName { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;
        public int SortOrder { get; set; } = 0;
        public DateTimeOffset CreatedDate { get; set; } = DateTimeOffset.UtcNow;

        public ICollection<OrgDepartment> Departments { get; set; } = new List<OrgDepartment>();
    }
}
