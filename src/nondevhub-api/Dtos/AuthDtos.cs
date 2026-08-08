namespace nondevhub_api.Dtos
{
    public record LoginRequest(string EmpId, string Password, string? ComputerName);
    public record PermissionDto(string SystemId, bool CanView, bool CanAdd, bool CanEdit, bool CanDelete, bool CanApprove, bool CanReject);
    public record UserProfileDto(int UserId, string EmpId, string FullName, int UserLevel, bool IsSuperAdmin, List<PermissionDto> Permissions);
    public record LoginResponse(bool Success, string Message, UserProfileDto? UserProfile);
}