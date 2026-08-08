namespace nondevhub_api.Models
{
    public class AuditLog
    {
        public long LogId { get; set; }
        public int? UserId { get; set; }
        public string SystemId { get; set; } = string.Empty;
        public string ActionType { get; set; } = string.Empty;
        public string? LogDescription { get; set; }
        public string? LogRef { get; set; }
        public string? IpAddress { get; set; }
        public string? ComputerName { get; set; }
        public DateTimeOffset LogDate { get; set; } = DateTimeOffset.UtcNow;
    }
}