using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Http;

namespace backend.Services
{
    // บันทึก CRUD Action ทุกครั้งลง Core.AuditLogs — ใช้ IHttpContextAccessor ดึง IP ผู้เรียก
    // (เหมือน Pattern เดิมใน AuthController) เพื่อไม่ต้องแก้ Signature ของทุก Controller Action
    public class AuditLogService : IAuditLogService
    {
        private readonly AppDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AuditLogService(AppDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task LogAsync(int? userId, string systemId, string actionType, string? description, string? logRef)
        {
            var ipAddress = _httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";

            _context.AuditLogs.Add(new AuditLog
            {
                UserId = userId,
                SystemId = systemId,
                ActionType = actionType,
                LogDescription = description,
                LogRef = logRef,
                IpAddress = ipAddress,
                ComputerName = Environment.MachineName
            });

            await _context.SaveChangesAsync();
        }
    }
}
