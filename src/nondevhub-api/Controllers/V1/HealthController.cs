using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using nondevhub_api.Data; // อ้างอิง Namespace Data ของคุณนนท์

namespace nondevhub_api.Controllers.V1
{
    [ApiController]
    [Route("api/v1/health")]
    public class HealthController : ControllerBase
    {
        private readonly AppDbContext _context; // เปลี่ยนเป็น AppDbContext ตามรูปภาพ

        public HealthController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// ตรวจสอบความพร้อมของฐานข้อมูล SQL Server แบบ Non-blocking Async
        /// </summary>
        [HttpGet("db-check")]
        public async Task<IActionResult> CheckDbConnection(CancellationToken cancellationToken)
        {
            try
            {
                bool canConnect = await _context.Database.CanConnectAsync(cancellationToken);

                if (canConnect)
                {
                    return Ok(new { isDbConnected = true, message = "SQL Server is healthy" });
                }

                return StatusCode(503, new { isDbConnected = false, message = "SQL Server connection failed" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { isDbConnected = false, message = ex.Message });
            }
        }
    }
}