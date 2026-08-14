using backend.DTOs;

namespace backend.Services
{
    public interface IAuthService
    {
        Task<LoginResponse> LoginAsync(LoginRequest request, string ipAddress, string computerName);
    }
}