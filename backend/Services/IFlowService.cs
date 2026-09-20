using backend.DTOs;

namespace backend.Services
{
    public interface IFlowService
    {
        // FlowDefinitions
        Task<List<FlowDefinitionDto>> GetFlowsAsync(int userId);
        Task<FlowDefinitionDetailDto?> GetFlowDetailAsync(int flowDefinitionId, int userId);
        Task<FlowDefinitionDetailDto?> GetFlowDetailByProjectIdAsync(int projectId, int userId);
        Task<FlowDefinitionDto> CreateFlowAsync(CreateFlowDefinitionRequest request, int currentUserId);
        Task<FlowDefinitionDto?> UpdateFlowAsync(UpdateFlowDefinitionRequest request);
        Task<bool> DeleteFlowAsync(int flowDefinitionId);

        // FlowDiagramRows — Workflow Diagram Studio
        Task<FlowDiagramDataDto?> GetDiagramDataAsync(int flowDefinitionId);
        Task<List<FlowDiagramRowDto>?> SaveDiagramRowsAsync(int flowDefinitionId, SaveFlowDiagramRowsRequest request);
        Task<FlowDefinitionDto?> UpdateFlowMetaAsync(int flowDefinitionId, UpdateFlowMetaRequest request);
    }
}
