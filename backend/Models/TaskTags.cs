using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models.Project
{
    // Composite Primary Key (TaskId, TagId) - กำหนดด้วย Fluent API ใน AppDbContext.OnModelCreating
    [Table("TaskTags", Schema = "Project")]
    public class TaskTags
    {
        public int TaskId { get; set; }
        public int TagId { get; set; }

        // Navigation Properties
        [ForeignKey(nameof(TaskId))]
        public Tasks? Task { get; set; }

        [ForeignKey(nameof(TagId))]
        public Tags? Tag { get; set; }
    }
}