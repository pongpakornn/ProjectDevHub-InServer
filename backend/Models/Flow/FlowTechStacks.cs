using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models.Flow
{
    [Table("FlowTechStacks", Schema = "Flow")]
    public class FlowTechStacks
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int FlowTechStackId { get; set; }

        public int FlowDefinitionId { get; set; }

        [Required]
        [StringLength(20)]
        public string Layer { get; set; } = "FRONTEND"; // FRONTEND, BACKEND, DATABASE

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        public int SortOrder { get; set; } = 0;

        // Navigation Properties
        [ForeignKey(nameof(FlowDefinitionId))]
        public FlowDefinitions? FlowDefinition { get; set; }
    }
}
