// backend/Controllers/FlowController.cs
using backend.Authorization;
using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FlowController : ControllerBase
    {
        private readonly IFlowService _flowService;
        private readonly ILogger<FlowController> _logger;

        // หมายเหตุ: ยังไม่มี JWT/Session Middleware ผูก currentUserId จาก Token (เหมือน ProjectTeamController)
        // จึงรับ userId ผ่าน Query Parameter ไปก่อน
        public FlowController(IFlowService flowService, ILogger<FlowController> logger)
        {
            _flowService = flowService;
            _logger = logger;
        }

        // ===========================================================================
        // FlowDefinitions
        // ===========================================================================
        [HttpGet]
        [RequirePermission("FLOW", PermissionAction.View)]
        public async Task<IActionResult> GetFlows([FromQuery] int userId)
        {
            try
            {
                var result = await _flowService.GetFlowsAsync(userId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการดึงรายการ Flow");
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        [HttpGet("{flowDefinitionId:int}")]
        [RequirePermission("FLOW", PermissionAction.View)]
        public async Task<IActionResult> GetFlowDetail(int flowDefinitionId, [FromQuery] int userId)
        {
            try
            {
                var result = await _flowService.GetFlowDetailAsync(flowDefinitionId, userId);
                if (result == null) return NotFound(new { message = "ไม่พบ Flow นี้" });
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการดึงรายละเอียด Flow {FlowDefinitionId}", flowDefinitionId);
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        [HttpPost]
        [RequirePermission("FLOW", PermissionAction.Add)]
        public async Task<IActionResult> CreateFlow([FromBody] CreateFlowDefinitionRequest request, [FromQuery] int userId)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var result = await _flowService.CreateFlowAsync(request, userId);
                return CreatedAtAction(nameof(GetFlowDetail), new { flowDefinitionId = result.FlowDefinitionId, userId }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการสร้าง Flow");
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        [HttpPut]
        [RequirePermission("FLOW", PermissionAction.Edit)]
        public async Task<IActionResult> UpdateFlow([FromBody] UpdateFlowDefinitionRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var result = await _flowService.UpdateFlowAsync(request);
                if (result == null) return NotFound(new { message = "ไม่พบ Flow นี้" });
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการแก้ไข Flow {FlowDefinitionId}", request.FlowDefinitionId);
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        [HttpDelete("{flowDefinitionId:int}")]
        [RequirePermission("FLOW", PermissionAction.Delete)]
        public async Task<IActionResult> DeleteFlow(int flowDefinitionId)
        {
            try
            {
                var success = await _flowService.DeleteFlowAsync(flowDefinitionId);
                if (!success) return NotFound(new { message = "ไม่พบ Flow นี้" });
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการลบ Flow {FlowDefinitionId}", flowDefinitionId);
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        // ===========================================================================
        // FlowDiagramRows — Workflow Diagram Studio (พอร์ตมาจาก AutoFlowStudio_ModulesD)
        // ===========================================================================
        [HttpGet("{flowDefinitionId:int}/diagram")]
        public async Task<IActionResult> GetDiagramData(int flowDefinitionId)
        {
            try
            {
                var result = await _flowService.GetDiagramDataAsync(flowDefinitionId);
                if (result == null) return NotFound(new { message = "ไม่พบ Flow นี้" });
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการดึงข้อมูลไดอะแกรมของ Flow {FlowDefinitionId}", flowDefinitionId);
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        [HttpPut("{flowDefinitionId:int}/diagram-rows")]
        [RequirePermission("FLOW", PermissionAction.Edit)]
        public async Task<IActionResult> SaveDiagramRows(int flowDefinitionId, [FromBody] SaveFlowDiagramRowsRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var result = await _flowService.SaveDiagramRowsAsync(flowDefinitionId, request);
                if (result == null) return NotFound(new { message = "ไม่พบ Flow นี้ หรือประเภทไดอะแกรมไม่ถูกต้อง" });
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการบันทึกตารางไดอะแกรมของ Flow {FlowDefinitionId}", flowDefinitionId);
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        [HttpPut("{flowDefinitionId:int}/meta")]
        [RequirePermission("FLOW", PermissionAction.Edit)]
        public async Task<IActionResult> UpdateFlowMeta(int flowDefinitionId, [FromBody] UpdateFlowMetaRequest request)
        {
            try
            {
                var result = await _flowService.UpdateFlowMetaAsync(flowDefinitionId, request);
                if (result == null) return NotFound(new { message = "ไม่พบ Flow นี้" });
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการอัปเดตข้อมูลโปรเจกต์ของ Flow {FlowDefinitionId}", flowDefinitionId);
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }
    }
}
