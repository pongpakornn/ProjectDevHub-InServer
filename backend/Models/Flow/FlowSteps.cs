using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models.Flow
{
    [Table("FlowSteps", Schema = "Flow")]
    public class FlowSteps
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int FlowStepId { get; set; }

        public int FlowDefinitionId { get; set; }

        [Required]
        [StringLength(20)]
        public string StepNo { get; set; } = string.Empty; // เช่น "STEP 01"

        [Required]
        [StringLength(255)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "PENDING"; // PENDING, IN_PROGRESS, DONE

        public int ProgressPercent { get; set; } = 0;

        public DateOnly? StartDate { get; set; } // ใช้ทำ Gantt
        public DateOnly? EndDate { get; set; }   // ใช้ทำ Gantt

        public int SortOrder { get; set; } = 0;

        // Navigation Properties
        [ForeignKey(nameof(FlowDefinitionId))]
        public FlowDefinitions? FlowDefinition { get; set; }
    }
}
