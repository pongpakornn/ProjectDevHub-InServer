// backend/Controllers/VisitorController.cs
// Visitor Mode — ทุก Endpoint ในนี้เป็น "ดูอย่างเดียว" ล้วนๆ ไม่มี POST/PUT/DELETE ใดๆ
// gate ด้วย [RequirePermission("VISITOR", PermissionAction.View)] ตรวจสิทธิ์ของ "ผู้เยี่ยมชม" (userId ใน
// Query String) เสมอ — ส่วน targetUserId คือเจ้าของโปรเจกต์ที่กำลังถูกเปิดดู ไม่ใช่ผู้กระทำ
using backend.Authorization;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VisitorController : ControllerBase
    {
        private readonly IVisitorService _visitorService;
        private readonly IProjectSoloService _soloService;
        private readonly IProjectTeamService _teamService;
        private readonly ILogger<VisitorController> _logger;

        public VisitorController(
            IVisitorService visitorService,
            IProjectSoloService soloService,
            IProjectTeamService teamService,
            ILogger<VisitorController> logger)
        {
            _visitorService = visitorService;
            _soloService = soloService;
            _teamService = teamService;
            _logger = logger;
        }

        // GET /api/Visitor/users?userId={viewerId}
        [HttpGet("users")]
        [RequirePermission("VISITOR", PermissionAction.View)]
        public async Task<IActionResult> GetVisitableUsers()
        {
            try
            {
                var result = await _visitorService.GetVisitableUsersAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการดึงรายชื่อผู้ใช้ที่มีโปรเจกต์ (Visitor Mode)");
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        // GET /api/Visitor/projects?targetUserId={targetUserId}&userId={viewerId}
        [HttpGet("projects")]
        [RequirePermission("VISITOR", PermissionAction.View)]
        public async Task<IActionResult> GetUserProjectCards([FromQuery] int targetUserId)
        {
            try
            {
                var result = await _visitorService.GetUserProjectCardsAsync(targetUserId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการดึงรายการโปรเจกต์ของ UserId {TargetUserId} (Visitor Mode)", targetUserId);
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        // GET /api/Visitor/projects/{projectId}?targetUserId={targetUserId}&userId={viewerId}&type=solo|team
        // ส่ง targetUserId (เจ้าของโปรเจกต์จริง) เข้า Service เดิมของ Solo/Team ตรงๆ แทน viewerId เพื่อผ่าน
        // เงื่อนไข Data Isolation เดิม (ProjectOwnerId/Members ต้องตรงกับ userId ที่ส่งเข้าไป) โดยไม่ต้องแก้ Service เดิมเลย
        [HttpGet("projects/{projectId:int}")]
        [RequirePermission("VISITOR", PermissionAction.View)]
        public async Task<IActionResult> GetProjectDetail(int projectId, [FromQuery] int targetUserId, [FromQuery] string type)
        {
            try
            {
                if (string.Equals(type, "team", StringComparison.OrdinalIgnoreCase))
                {
                    var detail = await _teamService.GetProjectDetailAsync(projectId, targetUserId);
                    if (detail == null) return NotFound(new { message = "ไม่พบโปรเจกต์นี้" });
                    return Ok(detail);
                }
                else
                {
                    var detail = await _soloService.GetProjectDetailAsync(projectId, targetUserId);
                    if (detail == null) return NotFound(new { message = "ไม่พบโปรเจกต์นี้" });
                    return Ok(detail);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการดึงรายละเอียดโปรเจกต์ {ProjectId} (Visitor Mode)", projectId);
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }
    }
}
