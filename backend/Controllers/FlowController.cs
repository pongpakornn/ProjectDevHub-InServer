// backend/Controllers/FlowController.cs
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
        public async Task<IActionResult> GetFlows()
        {
            try
            {
                var result = await _flowService.GetFlowsAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการดึงรายการ Flow");
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        [HttpGet("{flowDefinitionId:int}")]
        public async Task<IActionResult> GetFlowDetail(int flowDefinitionId)
        {
            try
            {
                var result = await _flowService.GetFlowDetailAsync(flowDefinitionId);
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
        public async Task<IActionResult> CreateFlow([FromBody] CreateFlowDefinitionRequest request, [FromQuery] int userId)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var result = await _flowService.CreateFlowAsync(request, userId);
                return CreatedAtAction(nameof(GetFlowDetail), new { flowDefinitionId = result.FlowDefinitionId }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการสร้าง Flow");
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        [HttpPut]
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
        // FlowSteps
        // ===========================================================================
        [HttpPost("steps")]
        public async Task<IActionResult> CreateStep([FromBody] CreateFlowStepRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var result = await _flowService.CreateStepAsync(request);
                if (result == null) return NotFound(new { message = "ไม่พบ Flow นี้" });
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการสร้าง Flow Step");
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        [HttpPut("steps")]
        public async Task<IActionResult> UpdateStep([FromBody] UpdateFlowStepRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var result = await _flowService.UpdateStepAsync(request);
                if (result == null) return NotFound(new { message = "ไม่พบ Flow Step นี้" });
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการแก้ไข Flow Step {FlowStepId}", request.FlowStepId);
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        [HttpDelete("steps/{flowStepId:int}")]
        public async Task<IActionResult> DeleteStep(int flowStepId)
        {
            try
            {
                var success = await _flowService.DeleteStepAsync(flowStepId);
                if (!success) return NotFound(new { message = "ไม่พบ Flow Step นี้" });
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการลบ Flow Step {FlowStepId}", flowStepId);
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        // ===========================================================================
        // FlowTechStacks
        // ===========================================================================
        [HttpPost("techstacks")]
        public async Task<IActionResult> CreateTechStack([FromBody] CreateFlowTechStackRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var result = await _flowService.CreateTechStackAsync(request);
                if (result == null) return NotFound(new { message = "ไม่พบ Flow นี้" });
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการสร้าง Flow Tech Stack");
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        [HttpDelete("techstacks/{flowTechStackId:int}")]
        public async Task<IActionResult> DeleteTechStack(int flowTechStackId)
        {
            try
            {
                var success = await _flowService.DeleteTechStackAsync(flowTechStackId);
                if (!success) return NotFound(new { message = "ไม่พบ Tech Stack นี้" });
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการลบ Flow Tech Stack {FlowTechStackId}", flowTechStackId);
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        // ===========================================================================
        // FlowExecutions — GET/POST /api/Flow/{id}/executions, PUT/DELETE /api/Flow/executions/{executionId}
        // ===========================================================================
        [HttpGet("{flowDefinitionId:int}/executions")]
        public async Task<IActionResult> GetExecutions(int flowDefinitionId)
        {
            try
            {
                var result = await _flowService.GetExecutionsAsync(flowDefinitionId);
                if (result == null) return NotFound(new { message = "ไม่พบ Flow นี้" });
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการดึงประวัติการรัน Flow {FlowDefinitionId}", flowDefinitionId);
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        [HttpPost("{flowDefinitionId:int}/executions")]
        public async Task<IActionResult> CreateExecution(int flowDefinitionId, [FromBody] CreateFlowExecutionRequest request, [FromQuery] int userId)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var result = await _flowService.CreateExecutionAsync(flowDefinitionId, request, userId);
                if (result == null) return NotFound(new { message = "ไม่พบ Flow นี้" });
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการบันทึกการรัน Flow {FlowDefinitionId}", flowDefinitionId);
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        [HttpPut("executions/{flowExecutionId:int}")]
        public async Task<IActionResult> UpdateExecution(int flowExecutionId, [FromBody] UpdateFlowExecutionRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var result = await _flowService.UpdateExecutionAsync(flowExecutionId, request);
                if (result == null) return NotFound(new { message = "ไม่พบประวัติการรันนี้" });
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการแก้ไขประวัติการรัน {FlowExecutionId}", flowExecutionId);
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        [HttpDelete("executions/{flowExecutionId:int}")]
        public async Task<IActionResult> DeleteExecution(int flowExecutionId)
        {
            try
            {
                var success = await _flowService.DeleteExecutionAsync(flowExecutionId);
                if (!success) return NotFound(new { message = "ไม่พบประวัติการรันนี้" });
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการลบประวัติการรัน {FlowExecutionId}", flowExecutionId);
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }

        // ===========================================================================
        // FlowLogs
        // ===========================================================================
        [HttpPost("executions/{flowExecutionId:int}/logs")]
        public async Task<IActionResult> AddLog(int flowExecutionId, [FromBody] CreateFlowLogRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var result = await _flowService.AddLogAsync(flowExecutionId, request);
                if (result == null) return NotFound(new { message = "ไม่พบประวัติการรันนี้" });
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "เกิดข้อผิดพลาดในการเพิ่ม Log ให้ Execution {FlowExecutionId}", flowExecutionId);
                return StatusCode(500, new { message = $"เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: {ex.Message}" });
            }
        }
    }
}
