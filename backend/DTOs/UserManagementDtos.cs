using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    // ===========================================================================
    // Master Data — Core.SystemList
    // ===========================================================================
    public class SystemListDto
    {
        public string SystemId { get; set; } = string.Empty;
        public string SystemName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsActive { get; set; }
        public DateTimeOffset CreatedDate { get; set; }
    }

    // ===========================================================================
    // Core.Permissions — สิทธิ์รายโมดูลของสมาชิกแต่ละคน
    // ===========================================================================
    public class PermissionItemDto
    {
        public string SystemId { get; set; } = string.Empty;
        public bool CanView { get; set; }
        public bool CanAdd { get; set; }
        public bool CanEdit { get; set; }
        public bool CanDelete { get; set; }
        public bool CanApprove { get; set; }
        public bool CanReject { get; set; }
    }

    public class SavePermissionItem
    {
        [Required, StringLength(50)]
        public string SystemId { get; set; } = string.Empty;
        public bool CanView { get; set; }
        public bool CanAdd { get; set; }
        public bool CanEdit { get; set; }
        public bool CanDelete { get; set; }
        public bool CanApprove { get; set; }
        public bool CanReject { get; set; }
    }

    // ===========================================================================
    // Core.Users — รายชื่อสมาชิกพร้อมสิทธิ์ (สำหรับหน้า User Management)
    // ===========================================================================
    public class UserListItemDto
    {
        public int UserId { get; set; }
        public string EmpId { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? DivisionName { get; set; }
        public string? DepartmentName { get; set; }
        public string? SectionName { get; set; }
        public int UserLevel { get; set; }
        public bool IsSuperAdmin { get; set; }
        public bool IsSuspended { get; set; }
        public bool IsOnline { get; set; }
        public string? ComputerName { get; set; }
        public string? IpAddress { get; set; }
        public DateTimeOffset? LastLoginDate { get; set; }
        public bool IsActive { get; set; }
        public DateTimeOffset CreatedDate { get; set; }
        public DateTimeOffset? UpdatedDate { get; set; }
        public List<PermissionItemDto> Permissions { get; set; } = new();
    }

    public class CreateUserRequest
    {
        [Required, StringLength(20)]
        public string EmpId { get; set; } = string.Empty;

        [Required, StringLength(255, MinimumLength = 4)]
        public string Password { get; set; } = string.Empty;

        [Required, StringLength(100)]
        public string FullName { get; set; } = string.Empty;

        [StringLength(100)]
        public string? DivisionName { get; set; }

        [StringLength(100)]
        public string? DepartmentName { get; set; }

        [StringLength(100)]
        public string? SectionName { get; set; }

        [Required]
        public int UserLevel { get; set; }

        public bool IsSuperAdmin { get; set; }
        public bool IsSuspended { get; set; }
        public bool IsActive { get; set; } = true;

        public List<SavePermissionItem> Permissions { get; set; } = new();
    }

    public class UpdateUserRequest
    {
        [Required]
        public int UserId { get; set; }

        [Required, StringLength(20)]
        public string EmpId { get; set; } = string.Empty;

        // ไม่บังคับ — ส่งค่ามาเฉพาะตอนต้องการเปลี่ยนรหัสผ่านเท่านั้น ปล่อยว่างไว้เพื่อคงรหัสผ่านเดิม
        [StringLength(255)]
        public string? Password { get; set; }

        [Required, StringLength(100)]
        public string FullName { get; set; } = string.Empty;

        [StringLength(100)]
        public string? DivisionName { get; set; }

        [StringLength(100)]
        public string? DepartmentName { get; set; }

        [StringLength(100)]
        public string? SectionName { get; set; }

        [Required]
        public int UserLevel { get; set; }

        public bool IsSuperAdmin { get; set; }
        public bool IsSuspended { get; set; }
        public bool IsActive { get; set; } = true;

        public List<SavePermissionItem> Permissions { get; set; } = new();
    }
}
