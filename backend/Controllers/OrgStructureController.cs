using backend.Authorization;
using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    // Core.Divisions / Core.Departments / Core.Sections — dropdown "หน่วยงาน/แผนก/Section" ของหน้า
    // User Management ให้ Admin เพิ่ม/แก้ไข/ลบได้เอง แทนของเดิมที่ Hardcode ไว้ฝั่ง Frontend
    [ApiController]
    [Route("api/[controller]")]
    public class OrgStructureController : ControllerBase
    {
        private readonly IOrgStructureService _orgStructureService;
        private readonly ILogger<OrgStructureController> _logger;

        public OrgStructureController(IOrgStructureService orgStructureService, ILogger<OrgStructureController> logger)
        {
            _orgStructureService = orgStructureService;
            _logger = logger;
        }

        // GET /api/OrgStructure/options — ทรงลำดับชั้นเต็ม สำหรับ Dropdown หน้าสมัครสมาชิก (Public เหมือน ProjectTypes/Departments)
        [HttpGet("options")]
        public async Task<IActionResult> GetOptions()
        {
            try
            {
                var result = await _orgStructureService.GetDivisionOptionsAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการดึงโครงสร้างหน่วยงาน/แผนก/Section");
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        // ===========================================================================
        // Divisions
        // ===========================================================================
        [HttpGet("divisions")]
        public async Task<IActionResult> GetDivisions()
        {
            var result = await _orgStructureService.GetDivisionsAsync();
            return Ok(result);
        }

        [HttpPost("divisions")]
        [RequireAdmin]
        public async Task<IActionResult> CreateDivision([FromBody] SaveOrgDivisionRequest request, [FromQuery] int? userId)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var result = await _orgStructureService.CreateDivisionAsync(request);
            return Ok(result);
        }

        [HttpPut("divisions/{id}")]
        [RequireAdmin]
        public async Task<IActionResult> UpdateDivision(int id, [FromBody] SaveOrgDivisionRequest request, [FromQuery] int? userId)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var result = await _orgStructureService.UpdateDivisionAsync(id, request);
            if (result == null) return NotFound(new { message = "ไม่พบหน่วยงานที่ต้องการแก้ไข" });
            return Ok(result);
        }

        [HttpDelete("divisions/{id}")]
        [RequireAdmin]
        public async Task<IActionResult> DeleteDivision(int id, [FromQuery] int? userId)
        {
            var success = await _orgStructureService.DeleteDivisionAsync(id);
            if (!success) return NotFound(new { message = "ไม่พบหน่วยงานที่ต้องการลบ" });
            return NoContent();
        }

        // ===========================================================================
        // Departments
        // ===========================================================================
        [HttpGet("departments")]
        public async Task<IActionResult> GetDepartments([FromQuery] int divisionId)
        {
            var result = await _orgStructureService.GetDepartmentsAsync(divisionId);
            return Ok(result);
        }

        [HttpPost("departments")]
        [RequireAdmin]
        public async Task<IActionResult> CreateDepartment([FromBody] SaveOrgDepartmentRequest request, [FromQuery] int? userId)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var result = await _orgStructureService.CreateDepartmentAsync(request);
            return Ok(result);
        }

        [HttpPut("departments/{id}")]
        [RequireAdmin]
        public async Task<IActionResult> UpdateDepartment(int id, [FromBody] SaveOrgDepartmentRequest request, [FromQuery] int? userId)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var result = await _orgStructureService.UpdateDepartmentAsync(id, request);
            if (result == null) return NotFound(new { message = "ไม่พบแผนกที่ต้องการแก้ไข" });
            return Ok(result);
        }

        [HttpDelete("departments/{id}")]
        [RequireAdmin]
        public async Task<IActionResult> DeleteDepartment(int id, [FromQuery] int? userId)
        {
            var success = await _orgStructureService.DeleteDepartmentAsync(id);
            if (!success) return NotFound(new { message = "ไม่พบแผนกที่ต้องการลบ" });
            return NoContent();
        }

        // ===========================================================================
        // Sections
        // ===========================================================================
        [HttpGet("sections")]
        public async Task<IActionResult> GetSections([FromQuery] int departmentId)
        {
            var result = await _orgStructureService.GetSectionsAsync(departmentId);
            return Ok(result);
        }

        [HttpPost("sections")]
        [RequireAdmin]
        public async Task<IActionResult> CreateSection([FromBody] SaveOrgSectionRequest request, [FromQuery] int? userId)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var result = await _orgStructureService.CreateSectionAsync(request);
            return Ok(result);
        }

        [HttpPut("sections/{id}")]
        [RequireAdmin]
        public async Task<IActionResult> UpdateSection(int id, [FromBody] SaveOrgSectionRequest request, [FromQuery] int? userId)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var result = await _orgStructureService.UpdateSectionAsync(id, request);
            if (result == null) return NotFound(new { message = "ไม่พบ Section ที่ต้องการแก้ไข" });
            return Ok(result);
        }

        [HttpDelete("sections/{id}")]
        [RequireAdmin]
        public async Task<IActionResult> DeleteSection(int id, [FromQuery] int? userId)
        {
            var success = await _orgStructureService.DeleteSectionAsync(id);
            if (!success) return NotFound(new { message = "ไม่พบ Section ที่ต้องการลบ" });
            return NoContent();
        }
    }
}
