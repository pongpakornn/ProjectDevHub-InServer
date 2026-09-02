// backend/Controllers/UsersController.cs
using backend.Authorization;
using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IUserManagementService _userManagementService;
        private readonly ILogger<UsersController> _logger;

        // หมายเหตุ: ยังไม่มี JWT/Session Middleware ผูก currentUserId จาก Token
        // จึงรับ userId (ผู้กระทำ) ผ่าน Query Parameter ไปก่อน เหมือน Pattern ของ ProjectSoloController
        public UsersController(IUserManagementService userManagementService, ILogger<UsersController> logger)
        {
            _userManagementService = userManagementService;
            _logger = logger;
        }

        [HttpGet]
        [RequireAdmin]
        public async Task<IActionResult> GetUsers()
        {
            try
            {
                var result = await _userManagementService.GetUsersAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการดึงรายชื่อสมาชิก");
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        [HttpGet("system-list")]
        public async Task<IActionResult> GetSystemList()
        {
            try
            {
                var result = await _userManagementService.GetSystemListAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการดึงรายการโมดูลระบบ (SystemList)");
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        [HttpPost]
        [RequireAdmin]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request, [FromQuery] int? userId)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var result = await _userManagementService.CreateUserAsync(request, userId);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการสมัครสมาชิกใหม่ EmpId: {EmpId}", request.EmpId);
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        [HttpPut]
        [RequireAdmin]
        public async Task<IActionResult> UpdateUser([FromBody] UpdateUserRequest request, [FromQuery] int? userId)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var result = await _userManagementService.UpdateUserAsync(request, userId);
                if (result == null) return NotFound(new { message = "ไม่พบสมาชิกที่ต้องการแก้ไข" });
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการแก้ไขข้อมูลสมาชิก UserId: {UserId}", request.UserId);
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        [HttpDelete("{id}")]
        [RequireAdmin]
        public async Task<IActionResult> DeleteUser(int id, [FromQuery] int? userId)
        {
            try
            {
                var success = await _userManagementService.DeleteUserAsync(id, userId);
                if (!success) return NotFound(new { message = "ไม่พบสมาชิกที่ต้องการลบ" });
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการลบสมาชิก UserId: {UserId}", id);
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        [HttpPatch("{id}/suspend")]
        [RequireAdmin]
        public async Task<IActionResult> ToggleSuspend(int id, [FromQuery] int? userId)
        {
            try
            {
                var result = await _userManagementService.ToggleSuspendAsync(id, userId);
                if (result == null) return NotFound(new { message = "ไม่พบสมาชิกที่ต้องการเปลี่ยนสถานะ" });
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการเปลี่ยนสถานะระงับของ UserId: {UserId}", id);
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }
    }
}
