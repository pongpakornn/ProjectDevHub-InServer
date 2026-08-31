// backend/DTOs/ProjectTeamDtos.cs
// DTO เฉพาะฝั่ง Team — reuse StackItemDto/WorkItemDto/CreatePhaseRequest/UpdatePhaseRequest/
// CreateTaskItemRequest/UpdateTaskItemRequest/CreateStackItemRequest/CreateWorkItemRequest
// จาก ProjectSoloDtos.cs (namespace เดียวกัน backend.DTOs) เพราะตารางที่ใช้เหมือนกันเป๊ะ
// (Milestones/Tasks/TechStacks/ShowcaseItems) ไม่ต้องสร้างซ้ำ
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    // ===========================================================================
    // ProjectMembers — สมาชิกทีม (Join Core.Users)
    // ===========================================================================
    public class ProjectMemberDto
    {
        public int ProjectMemberId { get; set; }
        public int ProjectId { get; set; }
        public int UserId { get; set; }
        public string EmpId { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string RoleInProject { get; set; } = "MEMBER"; // OWNER, MEMBER, APPROVER, VIEWER
        public DateTimeOffset JoinedDate { get; set; }
    }

    public class AddProjectMemberRequest
    {
        [Required]
        public int UserId { get; set; }

        [StringLength(20)]
        public string RoleInProject { get; set; } = "MEMBER";
    }

    // ===========================================================================
    // TaskAssignees — ผู้รับผิดชอบงาน (Join Core.Users)
    // ===========================================================================
    public class TaskAssigneeDto
    {
        public int TaskAssigneeId { get; set; }
        public int TaskId { get; set; }
        public int UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public DateTimeOffset AssignedDate { get; set; }
    }

    public class AssignTaskAssigneesRequest
    {
        // ส่งรายชื่อ UserId ทั้งชุดที่ต้องการให้เป็นผู้รับผิดชอบ — Backend จะ Sync ให้ตรงกับชุดนี้
        public List<int> UserIds { get; set; } = new();
    }

    // ===========================================================================
    // Project (Team) — เหมือน SoloProjectDto แต่แนบรายชื่อสมาชิกทีมมาด้วย
    // ===========================================================================
    public class TeamProjectDto
    {
        public int ProjectId { get; set; }
        public string ProjectCode { get; set; } = string.Empty;
        public string ProjectName { get; set; } = string.Empty;
        public string? Description { get; set; }

        public int ProjectTypeId { get; set; }
        public string ProjectTypeName { get; set; } = string.Empty;

        public string? DivisionName { get; set; }
        public string? RequesterName { get; set; }

        public int ProjectOwnerId { get; set; }
        public string OwnerName { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;

        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }

        public decimal ProgressPercent { get; set; }

        public List<ProjectMemberDto> Members { get; set; } = new();
    }

    public class CreateTeamProjectRequest
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

        // สมาชิกทีมที่เลือกตอนสร้างโครงการ (ไม่รวม Owner — Owner ถูกเพิ่มเป็น ProjectMembers อัตโนมัติ)
        public List<int> MemberUserIds { get; set; } = new();
    }

    public class UpdateTeamProjectRequest : CreateTeamProjectRequest
    {
        [Required]
        public int ProjectId { get; set; }
    }

    // ===========================================================================
    // TaskItem / Phase (Team) — เหมือนฝั่ง Solo แต่แนบ Assignees ของแต่ละ Task มาด้วย
    // ===========================================================================
    public class TeamTaskItemDto
    {
        public int TaskId { get; set; }
        public int MilestoneId { get; set; }

        public string Title { get; set; } = string.Empty;
        public string? Detail { get; set; }
        public bool Completed { get; set; }

        public List<TaskAssigneeDto> Assignees { get; set; } = new();
    }

    public class TeamPhaseDto
    {
        public int MilestoneId { get; set; }
        public int ProjectId { get; set; }

        public string MilestoneName { get; set; } = string.Empty;

        public int? OwnerId { get; set; }
        public string? OwnerName { get; set; }

        public DateOnly? StartDate { get; set; }
        public DateOnly? DueDate { get; set; }
        public DateOnly? CompletedDate { get; set; }

        public string Status { get; set; } = "PENDING";
        public int SortOrder { get; set; }

        public List<TeamTaskItemDto> Items { get; set; } = new();
    }

    // ===========================================================================
    // Team Project Detail — รวมทุกอย่างสำหรับหน้า Detail ในครั้งเดียว
    // ===========================================================================
    public class TeamProjectDetailDto
    {
        public TeamProjectDto Project { get; set; } = new();
        public List<TeamPhaseDto> Phases { get; set; } = new();
        public List<StackItemDto> Stacks { get; set; } = new();
        public List<WorkItemDto> Showcases { get; set; } = new();
    }
}
