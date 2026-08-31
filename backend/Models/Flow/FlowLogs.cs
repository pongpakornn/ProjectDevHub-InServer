using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models.Flow
{
    [Table("FlowLogs", Schema = "Flow")]
    public class FlowLogs
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long FlowLogId { get; set; }

        public int FlowExecutionId { get; set; }

        [Required]
        [StringLength(10)]
        public string LogLevel { get; set; } = "INFO"; // INFO, WARN, ERROR

        [Required]
        public string Message { get; set; } = string.Empty;

        public DateTimeOffset LoggedDate { get; set; } = DateTimeOffset.UtcNow;

        // Navigation Properties
        [ForeignKey(nameof(FlowExecutionId))]
        public FlowExecutions? FlowExecution { get; set; }
    }
}
