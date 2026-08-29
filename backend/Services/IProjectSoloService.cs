// using backend.DTOs;

// namespace backend.Services
// {
//     public interface IProjectSoloService
//     {
//         // Master Data
//         Task<List<ProjectTypeDto>> GetProjectTypesAsync();

//         // Project
//         Task<List<SoloProjectDto>> GetProjectsAsync();
//         Task<SoloProjectDetailDto?> GetProjectDetailAsync(int projectId);
//         Task<SoloProjectDto> CreateProjectAsync(CreateSoloProjectRequest request, int currentUserId);
//         Task<SoloProjectDto?> UpdateProjectAsync(UpdateSoloProjectRequest request, int currentUserId);
//         Task<bool> DeleteProjectAsync(int projectId);

//         // Phase (Milestone)
//         Task<PhaseDto> CreatePhaseAsync(CreatePhaseRequest request);
//         Task<PhaseDto?> UpdatePhaseAsync(UpdatePhaseRequest request);
//         Task<bool> DeletePhaseAsync(int milestoneId);
//         // Cluade Code Mail หลัก
//         Task<List<PhaseDto>> AutoGeneratePhasesAsync(int projectId); // ★ เพิ่มใหม่

//         // TaskItem (Task)
//         Task<TaskItemDto> CreateTaskItemAsync(CreateTaskItemRequest request, int currentUserId);
//         Task<TaskItemDto?> UpdateTaskItemAsync(UpdateTaskItemRequest request);
//         Task<bool> DeleteTaskItemAsync(int taskId);

//         // StackItem (TechStack)
//         Task<StackItemDto> CreateStackItemAsync(CreateStackItemRequest request);
//         Task<bool> DeleteStackItemAsync(int techStackId);

//         // WorkItem (ShowcaseItem)
//         Task<WorkItemDto> CreateWorkItemAsync(CreateWorkItemRequest request, int currentUserId);
//         Task<bool> DeleteWorkItemAsync(int showcaseItemId);
//     }
// }

using backend.DTOs;

namespace backend.Services
{
    public interface IProjectSoloService
    {
        // Master Data
        Task<List<ProjectTypeDto>> GetProjectTypesAsync();
        Task<List<UserOptionDto>> GetUsersAsync();

        // Project
        Task<List<SoloProjectDto>> GetProjectsAsync();
        Task<SoloProjectDetailDto?> GetProjectDetailAsync(int projectId);
        Task<SoloProjectDto> CreateProjectAsync(CreateSoloProjectRequest request, int currentUserId);
        Task<SoloProjectDto?> UpdateProjectAsync(UpdateSoloProjectRequest request, int currentUserId);
        Task<bool> DeleteProjectAsync(int projectId);

        // Phase (Milestone)
        Task<PhaseDto> CreatePhaseAsync(CreatePhaseRequest request);
        Task<PhaseDto?> UpdatePhaseAsync(UpdatePhaseRequest request);
        Task<bool> DeletePhaseAsync(int milestoneId);
        Task<List<PhaseDto>> AutoGeneratePhasesAsync(int projectId);

        // TaskItem (Task)
        Task<TaskItemDto> CreateTaskItemAsync(CreateTaskItemRequest request, int currentUserId);
        Task<TaskItemDto?> UpdateTaskItemAsync(UpdateTaskItemRequest request);
        Task<bool> DeleteTaskItemAsync(int taskId);

        // StackItem (TechStack)
        Task<StackItemDto> CreateStackItemAsync(CreateStackItemRequest request);
        Task<bool> DeleteStackItemAsync(int techStackId);

        // WorkItem (ShowcaseItem)
        Task<WorkItemDto> CreateWorkItemAsync(CreateWorkItemRequest request, int currentUserId);
        Task<bool> DeleteWorkItemAsync(int showcaseItemId);
    }
}