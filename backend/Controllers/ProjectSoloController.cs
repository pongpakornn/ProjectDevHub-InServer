// backend/Controllers/ProjectSoloController.cs
using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProjectSoloController : ControllerBase
    {
        private readonly IProjectSoloService _projectSoloService;
        private readonly ILogger<ProjectSoloController> _logger;

        // หมายเหตุ: ตอนนี้ยังไม่มี JWT/Session Middleware ผูก currentUserId จาก Token
        // จึงรับ userId ผ่าน Query Parameter ไปก่อน — พอเชื่อม Authentication แล้วให้เปลี่ยนไปอ่านจาก
        // HttpContext.User (Claims) แทน แล้วลบ [FromQuery] userId ออกจากทุก Endpoint ด้านล่าง

        public ProjectSoloController(IProjectSoloService projectSoloService, ILogger<ProjectSoloController> logger)
        {
            _projectSoloService = projectSoloService;
            _logger = logger;
        }

        // ===========================================================================
        // Master Data
        // ===========================================================================
        [HttpGet("types")]
        public async Task<IActionResult> GetProjectTypes()
        {
            try
            {
                var result = await _projectSoloService.GetProjectTypesAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการดึงรายการ ProjectTypes");
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            try
            {
                var result = await _projectSoloService.GetUsersAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการดึงรายการ Users");
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        [HttpGet("departments")]
        public async Task<IActionResult> GetDepartments()
        {
            try
            {
                var result = await _projectSoloService.GetDepartmentsAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการดึงรายการ Departments");
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        [HttpGet("techstack-catalog")]
        public async Task<IActionResult> GetTechStackCatalog()
        {
            try
            {
                var result = await _projectSoloService.GetTechStackCatalogAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการดึงรายการ TechStackCatalog");
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        // ===========================================================================
        // Project
        // ===========================================================================
        [HttpGet]
        public async Task<IActionResult> GetProjects([FromQuery] int userId)
        {
            try
            {
                var result = await _projectSoloService.GetProjectsAsync(userId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการดึงรายการ Project");
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        [HttpGet("{projectId:int}")]
        public async Task<IActionResult> GetProjectDetail(int projectId, [FromQuery] int userId)
        {
            try
            {
                var result = await _projectSoloService.GetProjectDetailAsync(projectId, userId);
                if (result == null) return NotFound(new { message = "ไม่พบโปรเจกต์นี้" });
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการดึงรายละเอียด Project {ProjectId}", projectId);
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateProject([FromBody] CreateSoloProjectRequest request, [FromQuery] int userId)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var result = await _projectSoloService.CreateProjectAsync(request, userId);
                return CreatedAtAction(nameof(GetProjectDetail), new { projectId = result.ProjectId }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการสร้าง Project");
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        [HttpPut]
        public async Task<IActionResult> UpdateProject([FromBody] UpdateSoloProjectRequest request, [FromQuery] int userId)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var result = await _projectSoloService.UpdateProjectAsync(request, userId);
                if (result == null) return NotFound(new { message = "ไม่พบโปรเจกต์นี้" });
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการแก้ไข Project {ProjectId}", request.ProjectId);
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        [HttpDelete("{projectId:int}")]
        public async Task<IActionResult> DeleteProject(int projectId, [FromQuery] int userId)
        {
            try
            {
                var success = await _projectSoloService.DeleteProjectAsync(projectId, userId);
                if (!success) return NotFound(new { message = "ไม่พบโปรเจกต์นี้" });
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการลบ Project {ProjectId}", projectId);
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        // ===========================================================================
        // Phase (Milestone)
        // ===========================================================================
        [HttpPost("phases")]
        public async Task<IActionResult> CreatePhase([FromBody] CreatePhaseRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var result = await _projectSoloService.CreatePhaseAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการสร้าง Phase");
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        [HttpPut("phases")]
        public async Task<IActionResult> UpdatePhase([FromBody] UpdatePhaseRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var result = await _projectSoloService.UpdatePhaseAsync(request);
                if (result == null) return NotFound(new { message = "ไม่พบ Phase นี้" });
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการแก้ไข Phase {MilestoneId}", request.MilestoneId);
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        [HttpDelete("phases/{milestoneId:int}")]
        public async Task<IActionResult> DeletePhase(int milestoneId)
        {
            try
            {
                var success = await _projectSoloService.DeletePhaseAsync(milestoneId);
                if (!success) return NotFound(new { message = "ไม่พบ Phase นี้" });
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการลบ Phase {MilestoneId}", milestoneId);
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        [HttpPost("{projectId:int}/phases/auto-generate")]
        public async Task<IActionResult> AutoGeneratePhases(int projectId)
        {
            try
            {
                var result = await _projectSoloService.AutoGeneratePhasesAsync(projectId);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการ Auto-Generate Phase ของ Project {ProjectId}", projectId);
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        // ===========================================================================
        // TaskItem (Task)
        // ===========================================================================
        [HttpPost("tasks")]
        public async Task<IActionResult> CreateTaskItem([FromBody] CreateTaskItemRequest request, [FromQuery] int userId)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var result = await _projectSoloService.CreateTaskItemAsync(request, userId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการสร้าง Task");
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        [HttpPut("tasks")]
        public async Task<IActionResult> UpdateTaskItem([FromBody] UpdateTaskItemRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var result = await _projectSoloService.UpdateTaskItemAsync(request);
                if (result == null) return NotFound(new { message = "ไม่พบ Task นี้" });
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการแก้ไข Task {TaskId}", request.TaskId);
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        [HttpDelete("tasks/{taskId:int}")]
        public async Task<IActionResult> DeleteTaskItem(int taskId)
        {
            try
            {
                var success = await _projectSoloService.DeleteTaskItemAsync(taskId);
                if (!success) return NotFound(new { message = "ไม่พบ Task นี้" });
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการลบ Task {TaskId}", taskId);
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        // ===========================================================================
        // StackItem (TechStack)
        // ===========================================================================
        [HttpPost("stacks")]
        public async Task<IActionResult> CreateStackItem([FromBody] CreateStackItemRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var result = await _projectSoloService.CreateStackItemAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการสร้าง TechStack");
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        [HttpDelete("stacks/{techStackId:int}")]
        public async Task<IActionResult> DeleteStackItem(int techStackId)
        {
            try
            {
                var success = await _projectSoloService.DeleteStackItemAsync(techStackId);
                if (!success) return NotFound(new { message = "ไม่พบ Tech Stack นี้" });
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการลบ TechStack {TechStackId}", techStackId);
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        // ===========================================================================
        // WorkItem (ShowcaseItem)
        // ===========================================================================
        [HttpPost("showcases")]
        public async Task<IActionResult> CreateWorkItem([FromBody] CreateWorkItemRequest request, [FromQuery] int userId)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var result = await _projectSoloService.CreateWorkItemAsync(request, userId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการสร้าง Showcase Item");
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        [HttpPut("showcases")]
        public async Task<IActionResult> UpdateWorkItem([FromBody] UpdateWorkItemRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var result = await _projectSoloService.UpdateWorkItemAsync(request);
                if (result == null) return NotFound(new { message = "ไม่พบ Showcase Item นี้" });
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการแก้ไข Showcase Item {ShowcaseItemId}", request.ShowcaseItemId);
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        [HttpDelete("showcases/{showcaseItemId:int}")]
        public async Task<IActionResult> DeleteWorkItem(int showcaseItemId)
        {
            try
            {
                var success = await _projectSoloService.DeleteWorkItemAsync(showcaseItemId);
                if (!success) return NotFound(new { message = "ไม่พบ Showcase Item นี้" });
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการลบ Showcase Item {ShowcaseItemId}", showcaseItemId);
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }
    }
}