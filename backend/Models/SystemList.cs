using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("SystemList", Schema = "Core")]
    public class SystemList
    {
        [Key]
        [StringLength(50)]
        public string SystemId { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string SystemName { get; set; } = string.Empty;

        [StringLength(255)]
        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;
        public DateTimeOffset CreatedDate { get; set; } = DateTimeOffset.UtcNow;

        // Navigation Properties
        public ICollection<Permission> Permissions { get; set; } = new List<Permission>();
    }
}