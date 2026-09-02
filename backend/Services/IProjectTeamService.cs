using backend.DTOs;

namespace backend.Services
{
    public interface IProjectTeamService
    {
        // Project
        Task<List<TeamProjectDto>> GetProjectsAsync(int userId);
        Task<TeamProjectDetailDto?> GetProjectDetailAsync(int projectId, int userId);
        Task<TeamProjectDto> CreateProjectAsync(CreateTeamProjectRequest request, int currentUserId);
        Task<TeamProjectDto?> UpdateProjectAsync(UpdateTeamProjectRequest request, int currentUserId);
        Task<bool> DeleteProjectAsync(int projectId, int currentUserId);

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
        Task<WorkItemDto?> UpdateWorkItemAsync(UpdateWorkItemRequest request);
        Task<bool> DeleteWorkItemAsync(int showcaseItemId);

        // Comments
        Task<List<CommentDto>?> GetCommentsAsync(int projectId, int? taskId);
        Task<CommentDto?> AddCommentAsync(int projectId, CreateCommentRequest request, int currentUserId);
        Task<bool> DeleteCommentAsync(long commentId);

        // Attachments
        Task<List<AttachmentDto>?> GetAttachmentsAsync(int projectId, int? taskId);
        Task<AttachmentDto?> AddAttachmentAsync(int projectId, CreateAttachmentRequest request, int currentUserId);
        Task<bool> DeleteAttachmentAsync(long attachmentId);
    }
}
