namespace backend.Services
{
    public interface IAuditLogService
    {
        // ActionType: "INSERT", "UPDATE", "DELETE" — บันทึกลง Core.AuditLogs พร้อม IP/ComputerName ของผู้เรียก
        Task LogAsync(int? userId, string systemId, string actionType, string? description, string? logRef);
    }
}
