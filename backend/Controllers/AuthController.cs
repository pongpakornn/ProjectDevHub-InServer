// backend/Controllers/AuthController.cs
using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new LoginResponse { Success = false, Message = "ข้อมูลไม่ถูกต้อง" });
            }

            try
            {
                string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
                string computerName = Environment.MachineName;

                var result = await _authService.LoginAsync(request, ipAddress, computerName);

                if (!result.Success)
                {
                    return Unauthorized(result);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการ Login สำหรับ EmpId: {EmpId}", request.EmpId);
                
                // ส่ง JSON กลับฝั่ง Client เพื่อไม่ให้เกิด JSON Syntax Error ใน Frontend
                return StatusCode(500, new LoginResponse 
                { 
                    Success = false, 
                    Message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" 
                });
            }
        }
    }
}