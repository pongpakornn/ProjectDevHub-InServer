using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models.Flow
{
    // แถวข้อมูลของ Workflow Diagram Studio (พอร์ตมาจาก AutoFlowStudio_ModulesD) — 1 แถวต่อ 1 บรรทัดข้อมูล
    // ของไดอะแกรมประเภทใดประเภทหนึ่ง (DiagramType) ภายใต้ Flow เดียวกัน ผูก 1 Flow ได้หลายประเภท/หลายแถว
    // บันทึกแบบ Full-Replace ต่อ (FlowDefinitionId, DiagramType) ทุกครั้งที่กด Save ตาราง — ตรงกับพฤติกรรม
    // เดิมของต้นทางที่ทั้งชุดแถวของประเภทนั้นถูกแทนที่ทีเดียวจาก State ฝั่ง Client
    [Table("FlowDiagramRows", Schema = "Flow")]
    public class FlowDiagramRows
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int FlowDiagramRowId { get; set; }

        public int FlowDefinitionId { get; set; }

        [Required]
        [StringLength(20)]
        public string DiagramType { get; set; } = string.Empty; // FLOWCHART, USECASE, DFD, SEQUENCE, ERD, STATE

        [StringLength(20)]
        public string? StepNo { get; set; }

        [StringLength(200)]
        public string? Actor { get; set; }

        [StringLength(500)]
        public string? Action { get; set; }

        [StringLength(300)]
        public string? DataField { get; set; } // ชื่อคอลัมน์จริงคือ "Data" แต่เลี่ยงคำสงวน SQL ในโค้ด C#/EF

        [StringLength(300)]
        public string? Decision { get; set; }

        [StringLength(100)]
        public string? NextStep { get; set; }

        [StringLength(100)]
        public string? OptionValue { get; set; } // เช่น Cardinality ของ ERD

        public int SortOrder { get; set; } = 0;

        public DateTimeOffset CreatedDate { get; set; } = DateTimeOffset.UtcNow;

        // Navigation Properties
        [ForeignKey(nameof(FlowDefinitionId))]
        public FlowDefinitions? FlowDefinition { get; set; }
    }
}
