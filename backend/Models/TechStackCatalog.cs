using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models.Project
{
    // Master list ของตัวเลือก Dropdown ที่ใช้ตอนเพิ่ม Stack/Library ในหน้า Project Detail
    // (แทนที่ stackTypeOptions/stackNameOptions/stackLayerOptions ที่เคย Hardcode ไว้ในไฟล์ .tsx)
    // OptionGroup แยกว่าแถวนี้เป็นตัวเลือกของ Dropdown ไหน: TYPE, NAME, LAYER (Dropdown ทั้ง 3 ตัวเป็นอิสระต่อกัน ไม่ใช่ Combo เดียวกัน)
    [Table("TechStackCatalog", Schema = "Project")]
    public class TechStackCatalog
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CatalogId { get; set; }

        [Required]
        [StringLength(20)]
        public string OptionGroup { get; set; } = string.Empty; // TYPE, NAME, LAYER

        [Required]
        [StringLength(100)]
        public string OptionValue { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;
        public int SortOrder { get; set; } = 0;
        public DateTimeOffset CreatedDate { get; set; } = DateTimeOffset.UtcNow;
    }
}
