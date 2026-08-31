using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Models.Project;

namespace backend.Models.Flow
{
    [Table("FlowDefinitions", Schema = "Flow")]
    public class FlowDefinitions
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int FlowDefinitionId { get; set; }

        // ผูก 1:1 กับ Project.Projects (Solo/Team) — NULL ได้เฉพาะ Flow เก่าที่สร้างแบบ Standalone ก่อนรอบนี้
        public int? ProjectId { get; set; }

        [Required]
        [StringLength(30)]
        public string FlowCode { get; set; } = string.Empty; // เช่น "FLOW-2026-001"

        [Required]
        [StringLength(255)]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "PLANNING"; // PLANNING, IN_PROGRESS, COMPLETED

        [Required]
        [StringLength(10)]
        public string WorkType { get; set; } = "SOLO"; // SOLO, TEAM

        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }

        // คำนวณอัตโนมัติจาก AVG(FlowSteps.ProgressPercent) ผ่าน Trigger Flow.Trg_UpdateFlowProgress — ห้ามแก้เอง
        public decimal ProgressPercent { get; set; } = 0;

        public int CreatedBy { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTimeOffset CreatedDate { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? UpdatedDate { get; set; }

        // Navigation Properties
        [ForeignKey(nameof(CreatedBy))]
        public User? Creator { get; set; }

        [ForeignKey(nameof(ProjectId))]
        public Projects? Project { get; set; }

        public ICollection<FlowSteps> Steps { get; set; } = new List<FlowSteps>();
        public ICollection<FlowTechStacks> TechStacks { get; set; } = new List<FlowTechStacks>();
        public ICollection<FlowExecutions> Executions { get; set; } = new List<FlowExecutions>();
    }
}
