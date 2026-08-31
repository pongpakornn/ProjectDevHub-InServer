using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Models.Project;

namespace backend.Models.Flow
{
    [Table("FlowExecutions", Schema = "Flow")]
    public class FlowExecutions
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int FlowExecutionId { get; set; }

        public int FlowDefinitionId { get; set; }

        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "RUNNING"; // RUNNING, SUCCESS, FAILED

        public DateTimeOffset StartedDate { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? FinishedDate { get; set; }

        public int TriggeredBy { get; set; }

        [StringLength(500)]
        public string? Note { get; set; }

        // Navigation Properties
        [ForeignKey(nameof(FlowDefinitionId))]
        public FlowDefinitions? FlowDefinition { get; set; }

        [ForeignKey(nameof(TriggeredBy))]
        public User? TriggeredByUser { get; set; }

        public ICollection<FlowLogs> Logs { get; set; } = new List<FlowLogs>();
    }
}
