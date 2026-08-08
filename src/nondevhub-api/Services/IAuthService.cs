using nondevhub_api.Dtos;

namespace nondevhub_api.Services
{
    public interface IAuthService
    {
        Task<LoginResponse> LoginAsync(LoginRequest request, string ipAddress);
    }
}