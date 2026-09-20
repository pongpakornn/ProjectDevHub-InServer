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
    // FlowSteps — เฟส/สเต็ปของ Flow (Flow Diagram + Gantt)
    // ===========================================================================
    public class FlowStepDto
    {
        public int FlowStepId { get; set; }
        public int FlowDefinitionId { get; set; }
        public int? MilestoneId { get; set; }
        public string StepNo { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Status { get; set; } = "PENDING"; // PENDING, IN_PROGRESS, DONE
        public int ProgressPercent { get; set; }
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
        public int SortOrder { get; set; }
    }

    public class CreateFlowStepRequest
    {
        [Required]
        public int FlowDefinitionId { get; set; }

        [Required, StringLength(20)]
        public string StepNo { get; set; } = string.Empty;

        [Required, StringLength(255)]
        public string Title { get; set; } = string.Empty;

        [Required, StringLength(20)]
        public string Status { get; set; } = "PENDING";

        public int ProgressPercent { get; set; } = 0;
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
        public int SortOrder { get; set; } = 0;
    }

    public class UpdateFlowStepRequest : CreateFlowStepRequest
    {
        [Required]
        public int FlowStepId { get; set; }
    }

    // ===========================================================================
    // FlowTechStacks — Architecture Diagram Tags (Frontend/Backend/Database)
    // ===========================================================================
    public class FlowTechStackDto
    {
        public int FlowTechStackId { get; set; }
        public int FlowDefinitionId { get; set; }
        public int? TechStackId { get; set; }
        public string Layer { get; set; } = string.Empty; // FRONTEND, BACKEND, DATABASE
        public string Name { get; set; } = string.Empty;
        public int SortOrder { get; set; }
    }

    public class CreateFlowTechStackRequest
    {
        [Required]
        public int FlowDefinitionId { get; set; }

        [Required, StringLength(20)]
        public string Layer { get; set; } = string.Empty;

        [Required, StringLength(100)]
        public string Name { get; set; } = string.Empty;

        public int SortOrder { get; set; } = 0;
    }

    // ===========================================================================
    // FlowDefinition Detail — รวมทุกอย่างสำหรับหน้า Detail ในครั้งเดียว
    // ===========================================================================
    public class FlowDefinitionDetailDto
    {
        public FlowDefinitionDto Flow { get; set; } = new();
        public List<FlowStepDto> Steps { get; set; } = new();
        public List<FlowTechStackDto> TechStacks { get; set; } = new();
    }

    // ===========================================================================
    // FlowExecutions — ประวัติการรัน Flow (Run History)
    // ===========================================================================
    public class FlowExecutionDto
    {
        public int FlowExecutionId { get; set; }
        public int FlowDefinitionId { get; set; }
        public string Status { get; set; } = string.Empty; // RUNNING, SUCCESS, FAILED
        public DateTimeOffset StartedDate { get; set; }
        public DateTimeOffset? FinishedDate { get; set; }
        public int TriggeredBy { get; set; }
        public string TriggeredByName { get; set; } = string.Empty;
        public string? Note { get; set; }
        public List<FlowLogDto> Logs { get; set; } = new();
    }

    public class CreateFlowExecutionRequest
    {
        [Required, StringLength(20)]
        public string Status { get; set; } = "RUNNING";

        public DateTimeOffset? FinishedDate { get; set; }

        [StringLength(500)]
        public string? Note { get; set; }
    }

    public class UpdateFlowExecutionRequest
    {
        [Required, StringLength(20)]
        public string Status { get; set; } = "RUNNING";

        public DateTimeOffset? FinishedDate { get; set; }

        [StringLength(500)]
        public string? Note { get; set; }
    }

    // ===========================================================================
    // FlowLogs — Log แต่ละบรรทัดของ Execution หนึ่งๆ
    // ===========================================================================
    public class FlowLogDto
    {
        public long FlowLogId { get; set; }
        public int FlowExecutionId { get; set; }
        public string LogLevel { get; set; } = string.Empty; // INFO, WARN, ERROR
        public string Message { get; set; } = string.Empty;
        public DateTimeOffset LoggedDate { get; set; }
    }

    public class CreateFlowLogRequest
    {
        [Required, StringLength(10)]
        public string LogLevel { get; set; } = "INFO";

        [Required]
        public string Message { get; set; } = string.Empty;
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
