using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Models.Project;

namespace backend.Models.Flow
{
    [Table("FlowTechStacks", Schema = "Flow")]
    public class FlowTechStacks
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int FlowTechStackId { get; set; }

        public int FlowDefinitionId { get; set; }

        // ผูกย้อนกลับไปที่ Project.TechStacks ต้นทาง เมื่อรายการนี้ถูกสร้างจาก Auto-Generate (NULL ได้สำหรับรายการที่ผู้ใช้เพิ่มเอง)
        public int? TechStackId { get; set; }

        [Required]
        [StringLength(20)]
        public string Layer { get; set; } = "FRONTEND"; // FRONTEND, BACKEND, DATABASE

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        public int SortOrder { get; set; } = 0;

        // Navigation Properties
        [ForeignKey(nameof(FlowDefinitionId))]
        public FlowDefinitions? FlowDefinition { get; set; }

        [ForeignKey(nameof(TechStackId))]
        public TechStacks? TechStack { get; set; }
    }
}
