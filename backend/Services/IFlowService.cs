using backend.DTOs;

namespace backend.Services
{
    public interface IFlowService
    {
        // FlowDefinitions
        Task<List<FlowDefinitionDto>> GetFlowsAsync();
        Task<FlowDefinitionDetailDto?> GetFlowDetailAsync(int flowDefinitionId);
        Task<FlowDefinitionDto> CreateFlowAsync(CreateFlowDefinitionRequest request, int currentUserId);
        Task<FlowDefinitionDto?> UpdateFlowAsync(UpdateFlowDefinitionRequest request);
        Task<bool> DeleteFlowAsync(int flowDefinitionId);

        // FlowSteps
        Task<FlowStepDto?> CreateStepAsync(CreateFlowStepRequest request);
        Task<FlowStepDto?> UpdateStepAsync(UpdateFlowStepRequest request);
        Task<bool> DeleteStepAsync(int flowStepId);

        // FlowTechStacks
        Task<FlowTechStackDto?> CreateTechStackAsync(CreateFlowTechStackRequest request);
        Task<bool> DeleteTechStackAsync(int flowTechStackId);

        // FlowExecutions
        Task<List<FlowExecutionDto>?> GetExecutionsAsync(int flowDefinitionId);
        Task<FlowExecutionDto?> CreateExecutionAsync(int flowDefinitionId, CreateFlowExecutionRequest request, int currentUserId);
        Task<FlowExecutionDto?> UpdateExecutionAsync(int flowExecutionId, UpdateFlowExecutionRequest request);
        Task<bool> DeleteExecutionAsync(int flowExecutionId);

        // FlowLogs
        Task<FlowLogDto?> AddLogAsync(int flowExecutionId, CreateFlowLogRequest request);
    }
}
