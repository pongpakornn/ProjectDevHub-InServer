using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("Users", Schema = "Core")]
    public class User
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int UserId { get; set; }

        [Required]
        [StringLength(20)]
        public string EmpId { get; set; } = string.Empty;

        [Required]
        [StringLength(255)]
        public string PasswordHash { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string FullName { get; set; } = string.Empty;

        [StringLength(100)]
        public string? DivisionName { get; set; }

        [StringLength(100)]
        public string? DepartmentName { get; set; }

        [StringLength(100)]
        public string? SectionName { get; set; }

        public int UserLevel { get; set; } = 1;

        public bool IsSuperAdmin { get; set; } = false;
        public bool IsSuspended { get; set; } = false;
        public bool IsOnline { get; set; } = false;

        [StringLength(100)]
        public string? CurrentSessionId { get; set; }

        [StringLength(255)]
        public string? ComputerName { get; set; }

        [StringLength(45)]
        public string? IpAddress { get; set; }

        public DateTimeOffset? LastLoginDate { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTimeOffset CreatedDate { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? UpdatedDate { get; set; }

        // Navigation Properties
        public ICollection<Permission> Permissions { get; set; } = new List<Permission>();
    }
}