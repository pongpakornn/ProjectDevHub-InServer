using backend.DTOs;

namespace backend.Services
{
    public interface IProjectTeamService
    {
        // Project
        Task<List<TeamProjectDto>> GetProjectsAsync();
        Task<TeamProjectDetailDto?> GetProjectDetailAsync(int projectId);
        Task<TeamProjectDto> CreateProjectAsync(CreateTeamProjectRequest request, int currentUserId);
        Task<TeamProjectDto?> UpdateProjectAsync(UpdateTeamProjectRequest request, int currentUserId);
        Task<bool> DeleteProjectAsync(int projectId);

        // ProjectMembers
        Task<List<ProjectMemberDto>?> GetMembersAsync(int projectId);
        Task<ProjectMemberDto?> AddMemberAsync(int projectId, AddProjectMemberRequest request);
        Task<bool> RemoveMemberAsync(int projectId, int userId);

        // Phase (Milestone)
        Task<TeamPhaseDto> CreatePhaseAsync(CreatePhaseRequest request);
        Task<TeamPhaseDto?> UpdatePhaseAsync(UpdatePhaseRequest request);
        Task<bool> DeletePhaseAsync(int milestoneId);
        Task<List<TeamPhaseDto>> AutoGeneratePhasesAsync(int projectId);

        // TaskItem (Task) + TaskAssignees
        Task<TeamTaskItemDto> CreateTaskItemAsync(CreateTaskItemRequest request, int currentUserId);
        Task<TeamTaskItemDto?> UpdateTaskItemAsync(UpdateTaskItemRequest request);
        Task<bool> DeleteTaskItemAsync(int taskId);
        Task<List<TaskAssigneeDto>?> AssignTaskAssigneesAsync(int taskId, AssignTaskAssigneesRequest request);

        // StackItem (TechStack)
        Task<StackItemDto> CreateStackItemAsync(CreateStackItemRequest request);
        Task<bool> DeleteStackItemAsync(int techStackId);

        // WorkItem (ShowcaseItem)
        Task<WorkItemDto> CreateWorkItemAsync(CreateWorkItemRequest request, int currentUserId);
        Task<bool> DeleteWorkItemAsync(int showcaseItemId);
    }
}
