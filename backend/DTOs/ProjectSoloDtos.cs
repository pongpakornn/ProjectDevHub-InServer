// using System.ComponentModel.DataAnnotations;

// namespace backend.DTOs
// {
//     // ===========================================================================
//     // Lookup / Master Data
//     // ===========================================================================
//     public class ProjectTypeDto
//     {
//         public int ProjectTypeId { get; set; }
//         public string TypeName { get; set; } = string.Empty;
//     }

//     public class UserOptionDto
//     {
//         public int UserId { get; set; }
//         public string EmpId { get; set; } = string.Empty;
//         public string FullName { get; set; } = string.Empty;
//     }

//     // ===========================================================================
//     // Project (Solo) — ตรงกับ SoloProject ในหน้า Solo (ตัด language/framework/... ออกแล้ว)
//     // ===========================================================================
//     public class SoloProjectDto
//     {
//         public int ProjectId { get; set; }
//         public string ProjectCode { get; set; } = string.Empty;
//         public string ProjectName { get; set; } = string.Empty;
//         public string? Description { get; set; }

//         public int ProjectTypeId { get; set; }
//         public string ProjectTypeName { get; set; } = string.Empty;

//         public string? DivisionName { get; set; }        // department
//         public string? RequesterName { get; set; }        // requester

//         public int ProjectOwnerId { get; set; }
//         public string OwnerName { get; set; } = string.Empty;

//         public string Status { get; set; } = string.Empty;      // PLANNING, IN_PROGRESS, ON_HOLD, COMPLETED, CANCELLED
//         public string Priority { get; set; } = string.Empty;    // LOW, MEDIUM, HIGH, URGENT

//         public DateOnly? StartDate { get; set; }
//         public DateOnly? EndDate { get; set; }

//         public decimal ProgressPercent { get; set; }  // คำนวณจาก Trigger ฝั่ง DB อัตโนมัติ ไม่ต้องส่งตอน Create/Update
//     }

//     public class CreateSoloProjectRequest
//     {
//         [Required, StringLength(255)]
//         public string ProjectName { get; set; } = string.Empty;

//         public string? Description { get; set; }

//         [Required]
//         public int ProjectTypeId { get; set; }

//         [StringLength(100)]
//         public string? DivisionName { get; set; }

//         [StringLength(100)]
//         public string? RequesterName { get; set; }

//         [Required]
//         public int ProjectOwnerId { get; set; }

//         [Required, StringLength(10)]
//         public string Priority { get; set; } = "MEDIUM";

//         [Required, StringLength(20)]
//         public string Status { get; set; } = "PLANNING";

//         public DateOnly? StartDate { get; set; }
//         public DateOnly? EndDate { get; set; }
//     }

//     public class UpdateSoloProjectRequest : CreateSoloProjectRequest
//     {
//         [Required]
//         public int ProjectId { get; set; }
//     }

//     // ===========================================================================
//     // Phase (Milestone) — ตรงกับ Phase ในหน้า Solo
//     // ===========================================================================
//     public class PhaseDto
//     {
//         public int MilestoneId { get; set; }
//         public int ProjectId { get; set; }

//         public string MilestoneName { get; set; } = string.Empty;

//         public int? OwnerId { get; set; }
//         public string? OwnerName { get; set; }

//         public DateOnly? DueDate { get; set; }
//         public DateOnly? CompletedDate { get; set; }

//         public string Status { get; set; } = "PENDING"; // PENDING, IN_PROGRESS, COMPLETED, DELAYED
//         public int SortOrder { get; set; }

//         public List<TaskItemDto> Items { get; set; } = new();
//     }

//     public class CreatePhaseRequest
//     {
//         [Required]
//         public int ProjectId { get; set; }

//         [Required, StringLength(255)]
//         public string MilestoneName { get; set; } = string.Empty;

//         public int? OwnerId { get; set; }
//         public DateOnly? DueDate { get; set; }

//         [Required, StringLength(20)]
//         public string Status { get; set; } = "PENDING";

//         public int SortOrder { get; set; }
//     }

//     public class UpdatePhaseRequest : CreatePhaseRequest
//     {
//         [Required]
//         public int MilestoneId { get; set; }
//     }

//     // ===========================================================================
//     // TaskItem — ตรงกับ TaskItem ภายใน Phase (title, detail, completed)
//     // ===========================================================================
//     public class TaskItemDto
//     {
//         public int TaskId { get; set; }
//         public int MilestoneId { get; set; }

//         public string Title { get; set; } = string.Empty;    // TaskName
//         public string? Detail { get; set; }                  // Description
//         public bool Completed { get; set; }                  // Status == "DONE"
//     }

//     public class CreateTaskItemRequest
//     {
//         [Required]
//         public int ProjectId { get; set; }

//         [Required]
//         public int MilestoneId { get; set; }

//         [Required, StringLength(255)]
//         public string Title { get; set; } = string.Empty;

//         public string? Detail { get; set; }
//     }

//     public class UpdateTaskItemRequest
//     {
//         [Required]
//         public int TaskId { get; set; }

//         [Required, StringLength(255)]
//         public string Title { get; set; } = string.Empty;

//         public string? Detail { get; set; }
//         public bool Completed { get; set; }
//     }

//     // ===========================================================================
//     // StackItem (TechStack) — ตรงกับ StackItem ในหน้า Solo
//     // ===========================================================================
//     public class StackItemDto
//     {
//         public int TechStackId { get; set; }
//         public int ProjectId { get; set; }

//         public string Type { get; set; } = string.Empty;   // StackType
//         public string Name { get; set; } = string.Empty;   // StackName
//         public string? Version { get; set; }
//         public string Layer { get; set; } = "Frontend";
//     }

//     public class CreateStackItemRequest
//     {
//         [Required]
//         public int ProjectId { get; set; }

//         [Required, StringLength(50)]
//         public string Type { get; set; } = string.Empty;

//         [Required, StringLength(100)]
//         public string Name { get; set; } = string.Empty;

//         [StringLength(50)]
//         public string? Version { get; set; }

//         [Required, StringLength(20)]
//         public string Layer { get; set; } = "Frontend";
//     }

//     // ===========================================================================
//     // WorkItem (ShowcaseItem) — ตรงกับ WorkItem ในส่วน Present ผลงาน
//     // ===========================================================================
//     public class WorkItemDto
//     {
//         public int ShowcaseItemId { get; set; }
//         public int ProjectId { get; set; }

//         public string Title { get; set; } = string.Empty;
//         public string? Description { get; set; }
//         public string? FlowDescription { get; set; }
//         public string? ImageUrl { get; set; }
//         public DateTimeOffset CreatedDate { get; set; }   // date
//     }

//     public class CreateWorkItemRequest
//     {
//         [Required]
//         public int ProjectId { get; set; }

//         [Required, StringLength(255)]
//         public string Title { get; set; } = string.Empty;

//         public string? Description { get; set; }
//         public string? FlowDescription { get; set; }

//         [StringLength(500)]
//         public string? ImageUrl { get; set; }
//     }

//     // ===========================================================================
//     // Solo Project Detail — รวมทุกอย่างสำหรับหน้า Detail ในครั้งเดียว (ลด Round-trip)
//     // ===========================================================================
//     public class SoloProjectDetailDto
//     {
//         public SoloProjectDto Project { get; set; } = new();
//         public List<PhaseDto> Phases { get; set; } = new();
//         public List<StackItemDto> Stacks { get; set; } = new();
//         public List<WorkItemDto> Showcases { get; set; } = new();
//     }
// }

// Cluade Code Mail Master 
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    // ===========================================================================
    // Lookup / Master Data
    // ===========================================================================
    public class ProjectTypeDto
    {
        public int ProjectTypeId { get; set; }
        public string TypeName { get; set; } = string.Empty;
    }

    public class UserOptionDto
    {
        public int UserId { get; set; }
        public string EmpId { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
    }

    public class DepartmentDto
    {
        public int DepartmentId { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
    }

    public class TechStackCatalogDto
    {
        public int CatalogId { get; set; }
        public string OptionGroup { get; set; } = string.Empty; // TYPE, NAME, LAYER
        public string OptionValue { get; set; } = string.Empty;
    }

    // ===========================================================================
    // Project (Solo) — ตรงกับ SoloProject ในหน้า Solo (ตัด language/framework/... ออกแล้ว)
    // ===========================================================================
    public class SoloProjectDto
    {
        public int ProjectId { get; set; }
        public string ProjectCode { get; set; } = string.Empty;
        public string ProjectName { get; set; } = string.Empty;
        public string? Description { get; set; }

        public int ProjectTypeId { get; set; }
        public string ProjectTypeName { get; set; } = string.Empty;

        public string? DivisionName { get; set; }        // department
        public string? RequesterName { get; set; }        // requester

        public int ProjectOwnerId { get; set; }
        public string OwnerName { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;      // PLANNING, IN_PROGRESS, ON_HOLD, COMPLETED, CANCELLED
        public string Priority { get; set; } = string.Empty;    // LOW, MEDIUM, HIGH, URGENT

        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }

        public decimal ProgressPercent { get; set; }  // คำนวณจาก Trigger ฝั่ง DB อัตโนมัติ ไม่ต้องส่งตอน Create/Update
    }

    public class CreateSoloProjectRequest
    {
        [Required, StringLength(255)]
        public string ProjectName { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        public int ProjectTypeId { get; set; }

        [StringLength(100)]
        public string? DivisionName { get; set; }

        [StringLength(100)]
        public string? RequesterName { get; set; }

        [Required]
        public int ProjectOwnerId { get; set; }

        [Required, StringLength(10)]
        public string Priority { get; set; } = "MEDIUM";

        [Required, StringLength(20)]
        public string Status { get; set; } = "PLANNING";

        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
    }

    public class UpdateSoloProjectRequest : CreateSoloProjectRequest
    {
        [Required]
        public int ProjectId { get; set; }
    }

    // ===========================================================================
    // Phase (Milestone) — ตรงกับ Phase ในหน้า Solo
    // ===========================================================================
    public class PhaseDto
    {
        public int MilestoneId { get; set; }
        public int ProjectId { get; set; }

        public string MilestoneName { get; set; } = string.Empty;

        public int? OwnerId { get; set; }
        public string? OwnerName { get; set; }

        public DateOnly? StartDate { get; set; }
        public DateOnly? DueDate { get; set; }
        public DateOnly? CompletedDate { get; set; }

        public string Status { get; set; } = "PENDING"; // PENDING, IN_PROGRESS, COMPLETED, DELAYED
        public int SortOrder { get; set; }

        public List<TaskItemDto> Items { get; set; } = new();
    }

    public class CreatePhaseRequest
    {
        [Required]
        public int ProjectId { get; set; }

        [Required, StringLength(255)]
        public string MilestoneName { get; set; } = string.Empty;

        public int? OwnerId { get; set; }
        public DateOnly? StartDate { get; set; }
        public DateOnly? DueDate { get; set; }

        [Required, StringLength(20)]
        public string Status { get; set; } = "PENDING";

        public int SortOrder { get; set; }
    }

    public class UpdatePhaseRequest : CreatePhaseRequest
    {
        [Required]
        public int MilestoneId { get; set; }
    }

    // ===========================================================================
    // TaskItem — ตรงกับ TaskItem ภายใน Phase (title, detail, completed)
    // ===========================================================================
    public class TaskItemDto
    {
        public int TaskId { get; set; }
        public int MilestoneId { get; set; }

        public string Title { get; set; } = string.Empty;    // TaskName
        public string? Detail { get; set; }                  // Description
        public bool Completed { get; set; }                  // Status == "DONE"
    }

    public class CreateTaskItemRequest
    {
        [Required]
        public int ProjectId { get; set; }

        [Required]
        public int MilestoneId { get; set; }

        [Required, StringLength(255)]
        public string Title { get; set; } = string.Empty;

        public string? Detail { get; set; }
    }

    public class UpdateTaskItemRequest
    {
        [Required]
        public int TaskId { get; set; }

        [Required, StringLength(255)]
        public string Title { get; set; } = string.Empty;

        public string? Detail { get; set; }
        public bool Completed { get; set; }
    }

    // ===========================================================================
    // StackItem (TechStack) — ตรงกับ StackItem ในหน้า Solo
    // ===========================================================================
    public class StackItemDto
    {
        public int TechStackId { get; set; }
        public int ProjectId { get; set; }

        public string Type { get; set; } = string.Empty;   // StackType
        public string Name { get; set; } = string.Empty;   // StackName
        public string? Version { get; set; }
        public string Layer { get; set; } = "Frontend";
    }

    public class CreateStackItemRequest
    {
        [Required]
        public int ProjectId { get; set; }

        [Required, StringLength(50)]
        public string Type { get; set; } = string.Empty;

        [Required, StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [StringLength(50)]
        public string? Version { get; set; }

        [Required, StringLength(20)]
        public string Layer { get; set; } = "Frontend";
    }

    // ===========================================================================
    // WorkItem (ShowcaseItem) — ตรงกับ WorkItem ในส่วน Present ผลงาน
    // ===========================================================================
    public class WorkItemDto
    {
        public int ShowcaseItemId { get; set; }
        public int ProjectId { get; set; }

        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? FlowDescription { get; set; }
        public string? ImageUrl { get; set; }
        public DateTimeOffset CreatedDate { get; set; }   // date
    }

    public class CreateWorkItemRequest
    {
        [Required]
        public int ProjectId { get; set; }

        [Required, StringLength(255)]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }
        public string? FlowDescription { get; set; }

        [StringLength(500)]
        public string? ImageUrl { get; set; }
    }

    public class UpdateWorkItemRequest : CreateWorkItemRequest
    {
        [Required]
        public int ShowcaseItemId { get; set; }
    }

    // ===========================================================================
    // Solo Project Detail — รวมทุกอย่างสำหรับหน้า Detail ในครั้งเดียว (ลด Round-trip)
    // ===========================================================================
    public class SoloProjectDetailDto
    {
        public SoloProjectDto Project { get; set; } = new();
        public List<PhaseDto> Phases { get; set; } = new();
        public List<StackItemDto> Stacks { get; set; } = new();
        public List<WorkItemDto> Showcases { get; set; } = new();
    }
}