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

        // เรียกตอนกดปุ่ม Logout หรือจากปิดแท็บ/แอป (ผ่าน navigator.sendBeacon บน beforeunload)
        [HttpPost("logout")]
        public async Task<IActionResult> Logout([FromBody] LogoutRequest request)
        {
            try
            {
                await _authService.LogoutAsync(request.UserId, request.SessionId);
                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการ Logout สำหรับ UserId: {UserId}", request.UserId);
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // Heartbeat ตรวจสอบว่า Session นี้ยังใช้งานได้อยู่หรือถูก Login ใหม่จากที่อื่นเตะออกไปแล้ว
        [HttpGet("session-check")]
        public async Task<IActionResult> SessionCheck([FromQuery] int userId, [FromQuery] string sessionId)
        {
            try
            {
                var valid = await _authService.IsSessionValidAsync(userId, sessionId);
                return Ok(new SessionCheckResponse { Valid = valid });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการตรวจสอบ Session สำหรับ UserId: {UserId}", userId);
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}