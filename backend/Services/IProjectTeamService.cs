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
        Task<List<ProjectMemberDto>?> GetMembersAsync(int projectId, int userId);
        Task<ProjectMemberDto?> AddMemberAsync(int projectId, AddProjectMemberRequest request, int currentUserId);
        Task<bool> RemoveMemberAsync(int projectId, int userId, int currentUserId);

        // Phase (Milestone)
        Task<TeamPhaseDto?> CreatePhaseAsync(CreatePhaseRequest request, int currentUserId);
        Task<TeamPhaseDto?> UpdatePhaseAsync(UpdatePhaseRequest request, int currentUserId);
        Task<bool> DeletePhaseAsync(int milestoneId, int currentUserId);
        Task<List<TeamPhaseDto>> AutoGeneratePhasesAsync(int projectId, int currentUserId);

        // TaskItem (Task) + TaskAssignees
        Task<TeamTaskItemDto?> CreateTaskItemAsync(CreateTaskItemRequest request, int currentUserId);
        Task<TeamTaskItemDto?> UpdateTaskItemAsync(UpdateTaskItemRequest request, int currentUserId);
        Task<bool> DeleteTaskItemAsync(int taskId, int currentUserId);
        Task<List<TaskAssigneeDto>?> AssignTaskAssigneesAsync(int taskId, AssignTaskAssigneesRequest request, int currentUserId);

        // StackItem (TechStack)
        Task<StackItemDto?> CreateStackItemAsync(CreateStackItemRequest request, int currentUserId);
        Task<bool> DeleteStackItemAsync(int techStackId, int currentUserId);

        // WorkItem (ShowcaseItem)
        Task<WorkItemDto?> CreateWorkItemAsync(CreateWorkItemRequest request, int currentUserId);
        Task<WorkItemDto?> UpdateWorkItemAsync(UpdateWorkItemRequest request, int currentUserId);
        Task<bool> DeleteWorkItemAsync(int showcaseItemId, int currentUserId);

        // Comments
        Task<List<CommentDto>?> GetCommentsAsync(int projectId, int? taskId, int userId);
        Task<CommentDto?> AddCommentAsync(int projectId, CreateCommentRequest request, int currentUserId);
        Task<bool> DeleteCommentAsync(long commentId, int currentUserId);

        // Attachments
        Task<List<AttachmentDto>?> GetAttachmentsAsync(int projectId, int? taskId, int userId);
        Task<AttachmentDto?> AddAttachmentAsync(int projectId, CreateAttachmentRequest request, int currentUserId);
        Task<bool> DeleteAttachmentAsync(long attachmentId, int currentUserId);
    }
}
