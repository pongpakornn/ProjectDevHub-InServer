// backend/DTOs/FlowDtos.cs
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    // ===========================================================================
    // FlowDefinitions — รายการ Flow หลัก
    // ===========================================================================
    public class FlowDefinitionDto
    {
        public int FlowDefinitionId { get; set; }
        public int? ProjectId { get; set; }
        public string FlowCode { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Status { get; set; } = string.Empty;
        public string WorkType { get; set; } = string.Empty;
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
        public decimal ProgressPercent { get; set; }
        public string? SystemType { get; set; }
        public string? ModuleList { get; set; }
        public string DfdLevel { get; set; } = "level0";
        public int CreatedBy { get; set; }
        public string CreatedByName { get; set; } = string.Empty;
    }

    public class CreateFlowDefinitionRequest
    {
        [Required, StringLength(255)]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required, StringLength(20)]
        public string Status { get; set; } = "PLANNING"; // PLANNING, IN_PROGRESS, COMPLETED

        [Required, StringLength(10)]
        public string WorkType { get; set; } = "SOLO"; // SOLO, TEAM

        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
    }

    public class UpdateFlowDefinitionRequest : CreateFlowDefinitionRequest
    {
        [Required]
        public int FlowDefinitionId { get; set; }
    }

    // ===========================================================================
    // FlowDefinition Detail — รวมทุกอย่างสำหรับหน้า Detail ในครั้งเดียว
    // ===========================================================================
    public class FlowDefinitionDetailDto
    {
        public FlowDefinitionDto Flow { get; set; } = new();
    }

    // ===========================================================================
    // Workflow Diagram Studio (พอร์ตมาจาก AutoFlowStudio_ModulesD) — FlowDiagramRows
    // 6 ประเภท: FLOWCHART, USECASE, DFD, SEQUENCE, ERD, STATE
    // ===========================================================================
    public class FlowDiagramRowDto
    {
        public int FlowDiagramRowId { get; set; }
        public string StepNo { get; set; } = string.Empty;
        public string Actor { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string DataField { get; set; } = string.Empty;
        public string Decision { get; set; } = string.Empty;
        public string NextStep { get; set; } = string.Empty;
        public string? OptionValue { get; set; }
    }

    public class SaveFlowDiagramRowItem
    {
        public string? StepNo { get; set; }
        public string? Actor { get; set; }
        public string? Action { get; set; }
        public string? DataField { get; set; }
        public string? Decision { get; set; }
        public string? NextStep { get; set; }
        public string? OptionValue { get; set; }
    }

    public class SaveFlowDiagramRowsRequest
    {
        [Required, StringLength(20)]
        public string DiagramType { get; set; } = string.Empty;

        public List<SaveFlowDiagramRowItem> Rows { get; set; } = new();
    }

    public class FlowDiagramDataDto
    {
        public string? SystemType { get; set; }
        public string? ModuleList { get; set; }
        public string DfdLevel { get; set; } = "level0";
        public Dictionary<string, List<FlowDiagramRowDto>> RowsByType { get; set; } = new();
    }

    public class UpdateFlowMetaRequest
    {
        [StringLength(255)]
        public string? SystemType { get; set; }

        [StringLength(500)]
        public string? ModuleList { get; set; }

        [StringLength(10)]
        public string? DfdLevel { get; set; }
    }
}
