using backend.DTOs;

namespace backend.Services
{
    public interface IUserManagementService
    {
        Task<List<SystemListDto>> GetSystemListAsync();
        Task<List<UserListItemDto>> GetUsersAsync();
        Task<UserListItemDto> CreateUserAsync(CreateUserRequest request, int? currentUserId);
        Task<UserListItemDto?> UpdateUserAsync(UpdateUserRequest request, int? currentUserId);
        Task<bool> DeleteUserAsync(int userId, int? currentUserId);
        Task<UserListItemDto?> ToggleSuspendAsync(int userId, int? currentUserId);
    }
}
