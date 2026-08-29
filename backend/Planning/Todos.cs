using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models.Planning
{
    [Table("Todos", Schema = "Planning")]
    public class Todos
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int TodoId { get; set; }

        public int UserId { get; set; }

        [Required]
        [StringLength(500)]
        public string TodoText { get; set; } = string.Empty;

        public bool IsCompleted { get; set; } = false;
        public DateTimeOffset? CompletedDate { get; set; }

        public DateOnly? DueDate { get; set; }

        [Required]
        [StringLength(10)]
        public string Priority { get; set; } = "MEDIUM"; // LOW, MEDIUM, HIGH

        public int SortOrder { get; set; } = 0;

        public int? LinkedEventId { get; set; }

        public DateTimeOffset CreatedDate { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? UpdatedDate { get; set; }

        // Navigation Properties
        [ForeignKey(nameof(UserId))]
        public User? User { get; set; }

        [ForeignKey(nameof(LinkedEventId))]
        public Events? LinkedEvent { get; set; }
    }
}