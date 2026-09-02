using backend.DTOs;

namespace backend.Services
{
    public interface ITestingService
    {
        Task<List<TestRunDto>> GetTestRunsAsync(int userId);
        Task<TestRunDto?> CreateTestRunAsync(CreateTestRunRequest request, int currentUserId);
        Task<TestRunDto?> UpdateTestRunAsync(UpdateTestRunRequest request, int currentUserId);
        Task<bool> DeleteTestRunAsync(int testRunId);
    }
}
