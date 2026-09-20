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

        // เดิมคำนวณจาก AVG(FlowSteps.ProgressPercent) ผ่าน Trigger — FlowSteps ถูกลบไปแล้ว (ไม่มีหน้าจอใช้งาน)
        // ค้างไว้เป็น Fallback สำหรับ Flow แบบ Standalone (ProjectId เป็น NULL) เท่านั้น ปกติอ่าน Project.ProgressPercent แทน
        public decimal ProgressPercent { get; set; } = 0;

        // ===== Workflow Diagram Studio (พอร์ตมาจาก AutoFlowStudio_ModulesD) — Meta ของชุดไดอะแกรม 6 ประเภท =====
        [StringLength(255)]
        public string? SystemType { get; set; }

        [StringLength(500)]
        public string? ModuleList { get; set; }

        [StringLength(10)]
        public string DfdLevel { get; set; } = "level0"; // context, level0, level1 — จำระดับ DFD ที่เลือกล่าสุด

        public int CreatedBy { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTimeOffset CreatedDate { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? UpdatedDate { get; set; }

        // Navigation Properties
        [ForeignKey(nameof(CreatedBy))]
        public User? Creator { get; set; }

        [ForeignKey(nameof(ProjectId))]
        public Projects? Project { get; set; }

        public ICollection<FlowDiagramRows> DiagramRows { get; set; } = new List<FlowDiagramRows>();
    }
}
