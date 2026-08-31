// backend/Controllers/ProjectTeamController.cs
using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProjectTeamController : ControllerBase
    {
        private readonly IProjectTeamService _projectTeamService;
        private readonly ILogger<ProjectTeamController> _logger;

        // หมายเหตุ: ยังไม่มี JWT/Session Middleware ผูก currentUserId จาก Token (เหมือน ProjectSoloController)
        // จึงรับ userId ผ่าน Query Parameter ไปก่อน — พอเชื่อม Authentication แล้วให้เปลี่ยนไปอ่านจาก
        // HttpContext.User (Claims) แทน แล้วลบ [FromQuery] userId ออกจากทุก Endpoint ด้านล่าง
        public ProjectTeamController(IProjectTeamService projectTeamService, ILogger<ProjectTeamController> logger)
        {
            _projectTeamService = projectTeamService;
            _logger = logger;
        }

        // ===========================================================================
        // Project
        // ===========================================================================
        [HttpGet]
        public async Task<IActionResult> GetProjects()
        {
            try
            {
                var result = await _projectTeamService.GetProjectsAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการดึงรายการ Team Project");
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        [HttpGet("{projectId:int}")]
        public async Task<IActionResult> GetProjectDetail(int projectId)
        {
            try
            {
                var result = await _projectTeamService.GetProjectDetailAsync(projectId);
                if (result == null) return NotFound(new { message = "ไม่พบโปรเจกต์นี้" });
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการดึงรายละเอียด Team Project {ProjectId}", projectId);
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateProject([FromBody] CreateTeamProjectRequest request, [FromQuery] int userId)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var result = await _projectTeamService.CreateProjectAsync(request, userId);
                return CreatedAtAction(nameof(GetProjectDetail), new { projectId = result.ProjectId }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการสร้าง Team Project");
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        [HttpPut]
        public async Task<IActionResult> UpdateProject([FromBody] UpdateTeamProjectRequest request, [FromQuery] int userId)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var result = await _projectTeamService.UpdateProjectAsync(request, userId);
                if (result == null) return NotFound(new { message = "ไม่พบโปรเจกต์นี้" });
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการแก้ไข Team Project {ProjectId}", request.ProjectId);
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        [HttpDelete("{projectId:int}")]
        public async Task<IActionResult> DeleteProject(int projectId, [FromQuery] int userId)
        {
            try
            {
                var success = await _projectTeamService.DeleteProjectAsync(projectId, userId);
                if (!success) return NotFound(new { message = "ไม่พบโปรเจกต์นี้" });
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการลบ Team Project {ProjectId}", projectId);
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        // ===========================================================================
        // ProjectMembers — GET/POST /api/ProjectTeam/{id}/members, DELETE .../members/{userId}
        // ===========================================================================
        [HttpGet("{id:int}/members")]
        public async Task<IActionResult> GetMembers(int id)
        {
            try
            {
                var result = await _projectTeamService.GetMembersAsync(id);
                if (result == null) return NotFound(new { message = "ไม่พบโปรเจกต์นี้" });
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการดึงสมาชิกทีมของ Project {ProjectId}", id);
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        [HttpPost("{id:int}/members")]
        public async Task<IActionResult> AddMember(int id, [FromBody] AddProjectMemberRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var result = await _projectTeamService.AddMemberAsync(id, request);
                if (result == null) return NotFound(new { message = "ไม่พบโปรเจกต์นี้" });
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการเพิ่มสมาชิกทีมของ Project {ProjectId}", id);
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        [HttpDelete("{id:int}/members/{userId:int}")]
        public async Task<IActionResult> RemoveMember(int id, int userId)
        {
            try
            {
                var success = await _projectTeamService.RemoveMemberAsync(id, userId);
                if (!success) return NotFound(new { message = "ไม่พบสมาชิกคนนี้ในโปรเจกต์" });
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการลบสมาชิกทีมของ Project {ProjectId}", id);
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
                var result = await _projectTeamService.CreatePhaseAsync(request);
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
                var result = await _projectTeamService.UpdatePhaseAsync(request);
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
                var success = await _projectTeamService.DeletePhaseAsync(milestoneId);
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
                var result = await _projectTeamService.AutoGeneratePhasesAsync(projectId);
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
        // TaskItem (Task) + TaskAssignees
        // ===========================================================================
        [HttpPost("tasks")]
        public async Task<IActionResult> CreateTaskItem([FromBody] CreateTaskItemRequest request, [FromQuery] int userId)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var result = await _projectTeamService.CreateTaskItemAsync(request, userId);
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
                var result = await _projectTeamService.UpdateTaskItemAsync(request);
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
                var success = await _projectTeamService.DeleteTaskItemAsync(taskId);
                if (!success) return NotFound(new { message = "ไม่พบ Task นี้" });
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการลบ Task {TaskId}", taskId);
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        [HttpPost("{id:int}/tasks/{taskId:int}/assignees")]
        public async Task<IActionResult> AssignTaskAssignees(int id, int taskId, [FromBody] AssignTaskAssigneesRequest request)
        {
            try
            {
                var result = await _projectTeamService.AssignTaskAssigneesAsync(taskId, request);
                if (result == null) return NotFound(new { message = "ไม่พบ Task นี้" });
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการมอบหมายผู้รับผิดชอบ Task {TaskId}", taskId);
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
                var result = await _projectTeamService.CreateStackItemAsync(request);
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
                var success = await _projectTeamService.DeleteStackItemAsync(techStackId);
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
                var result = await _projectTeamService.CreateWorkItemAsync(request, userId);
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
                var result = await _projectTeamService.UpdateWorkItemAsync(request);
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
                var success = await _projectTeamService.DeleteWorkItemAsync(showcaseItemId);
                if (!success) return NotFound(new { message = "ไม่พบ Showcase Item นี้" });
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการลบ Showcase Item {ShowcaseItemId}", showcaseItemId);
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        // ===========================================================================
        // Comments — GET/POST /api/ProjectTeam/{id}/comments, DELETE /api/ProjectTeam/comments/{commentId}
        // ===========================================================================
        [HttpGet("{id:int}/comments")]
        public async Task<IActionResult> GetComments(int id, [FromQuery] int? taskId)
        {
            try
            {
                var result = await _projectTeamService.GetCommentsAsync(id, taskId);
                if (result == null) return NotFound(new { message = "ไม่พบโปรเจกต์นี้" });
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการดึงความคิดเห็นของ Project {ProjectId}", id);
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        [HttpPost("{id:int}/comments")]
        public async Task<IActionResult> AddComment(int id, [FromBody] CreateCommentRequest request, [FromQuery] int userId)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var result = await _projectTeamService.AddCommentAsync(id, request, userId);
                if (result == null) return NotFound(new { message = "ไม่พบโปรเจกต์นี้" });
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการเพิ่มความคิดเห็นของ Project {ProjectId}", id);
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        [HttpDelete("comments/{commentId:long}")]
        public async Task<IActionResult> DeleteComment(long commentId)
        {
            try
            {
                var success = await _projectTeamService.DeleteCommentAsync(commentId);
                if (!success) return NotFound(new { message = "ไม่พบความคิดเห็นนี้" });
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการลบความคิดเห็น {CommentId}", commentId);
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        // ===========================================================================
        // Attachments — GET/POST /api/ProjectTeam/{id}/attachments, DELETE /api/ProjectTeam/attachments/{attachmentId}
        // ===========================================================================
        [HttpGet("{id:int}/attachments")]
        public async Task<IActionResult> GetAttachments(int id, [FromQuery] int? taskId)
        {
            try
            {
                var result = await _projectTeamService.GetAttachmentsAsync(id, taskId);
                if (result == null) return NotFound(new { message = "ไม่พบโปรเจกต์นี้" });
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการดึงไฟล์แนบของ Project {ProjectId}", id);
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        [HttpPost("{id:int}/attachments")]
        public async Task<IActionResult> AddAttachment(int id, [FromBody] CreateAttachmentRequest request, [FromQuery] int userId)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var result = await _projectTeamService.AddAttachmentAsync(id, request, userId);
                if (result == null) return NotFound(new { message = "ไม่พบโปรเจกต์นี้" });
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการเพิ่มไฟล์แนบของ Project {ProjectId}", id);
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        [HttpDelete("attachments/{attachmentId:long}")]
        public async Task<IActionResult> DeleteAttachment(long attachmentId)
        {
            try
            {
                var success = await _projectTeamService.DeleteAttachmentAsync(attachmentId);
                if (!success) return NotFound(new { message = "ไม่พบไฟล์แนบนี้" });
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการลบไฟล์แนบ {AttachmentId}", attachmentId);
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }
    }
}
