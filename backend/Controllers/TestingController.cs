// backend/Controllers/TestingController.cs
using backend.Authorization;
using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestingController : ControllerBase
    {
        private readonly ITestingService _testingService;
        private readonly ILogger<TestingController> _logger;

        // หมายเหตุ: ยังไม่มี JWT/Session Middleware ผูก currentUserId จาก Token (เหมือน Controller อื่น)
        // จึงรับ userId ผ่าน Query Parameter ไปก่อน
        public TestingController(ITestingService testingService, ILogger<TestingController> logger)
        {
            _testingService = testingService;
            _logger = logger;
        }

        [HttpGet("runs")]
        [RequirePermission("TESTING", PermissionAction.View)]
        public async Task<IActionResult> GetTestRuns([FromQuery] int userId)
        {
            try
            {
                var result = await _testingService.GetTestRunsAsync(userId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการดึงรายการผลทดสอบ");
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        [HttpPost("runs")]
        [RequirePermission("TESTING", PermissionAction.Add)]
        public async Task<IActionResult> CreateTestRun([FromBody] CreateTestRunRequest request, [FromQuery] int userId)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var result = await _testingService.CreateTestRunAsync(request, userId);
                if (result == null) return NotFound(new { message = "ไม่พบโปรเจกต์นี้" });
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการบันทึกผลทดสอบ");
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        [HttpPut("runs")]
        [RequirePermission("TESTING", PermissionAction.Edit)]
        public async Task<IActionResult> UpdateTestRun([FromBody] UpdateTestRunRequest request, [FromQuery] int userId)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var result = await _testingService.UpdateTestRunAsync(request, userId);
                if (result == null) return NotFound(new { message = "ไม่พบผลทดสอบหรือโปรเจกต์นี้" });
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการแก้ไขผลทดสอบ {TestRunId}", request.TestRunId);
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        [HttpDelete("runs/{testRunId:int}")]
        [RequirePermission("TESTING", PermissionAction.Delete)]
        public async Task<IActionResult> DeleteTestRun(int testRunId)
        {
            try
            {
                var success = await _testingService.DeleteTestRunAsync(testRunId);
                if (!success) return NotFound(new { message = "ไม่พบผลทดสอบนี้" });
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการลบผลทดสอบ {TestRunId}", testRunId);
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }
    }
}
