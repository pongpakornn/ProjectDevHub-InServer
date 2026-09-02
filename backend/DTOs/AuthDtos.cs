namespace backend.DTOs
{
    public class LoginRequest
    {
        public string EmpId { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class UserPermissionDto
    {
        public string SystemId { get; set; } = string.Empty;
        public bool CanView { get; set; }
        public bool CanAdd { get; set; }
        public bool CanEdit { get; set; }
        public bool CanDelete { get; set; }
        public bool CanApprove { get; set; }
        public bool CanReject { get; set; }
    }

    public class LoginResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? Token { get; set; }
        // Session ID เฉพาะตัวต่อการ Login หนึ่งครั้ง (เก็บลง Core.Users.CurrentSessionId) —
        // ใช้แยก Session นี้ออกจาก Session อื่นของ User เดียวกัน เพื่อจำกัด Login พร้อมกันได้ครั้งละ 1 Session
        public string? SessionId { get; set; }
        public UserInfoDto? User { get; set; }
    }

    public class LogoutRequest
    {
        public int UserId { get; set; }
        public string? SessionId { get; set; }
    }

    public class SessionCheckResponse
    {
        public bool Valid { get; set; }
    }

    public class UserInfoDto
    {
        public int UserId { get; set; }
        public string EmpId { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? DivisionName { get; set; }
        public string? DepartmentName { get; set; }
        public int UserLevel { get; set; }
        public bool IsSuperAdmin { get; set; }
        public List<UserPermissionDto> Permissions { get; set; } = new();
    }
}