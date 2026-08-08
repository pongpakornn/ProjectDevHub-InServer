namespace nondevhub_api.Models
{
    public class User
    {
        public int UserId { get; set; }
        public string EmpId { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? DivisionName { get; set; }
        public string? DepartmentName { get; set; }
        public string? SectionName { get; set; }
        public int UserLevel { get; set; }
        public bool IsSuperAdmin { get; set; }
        public bool IsSuspended { get; set; }
        public bool IsOnline { get; set; }
        public string? CurrentSessionId { get; set; }
        public string? ComputerName { get; set; }
        public string? IpAddress { get; set; }
        public DateTimeOffset? LastLoginDate { get; set; }
        public bool IsActive { get; set; }
        public DateTimeOffset CreatedDate { get; set; }
        public DateTimeOffset? UpdatedDate { get; set; }

        public ICollection<Permission> Permissions { get; set; } = new List<Permission>();
    }
}