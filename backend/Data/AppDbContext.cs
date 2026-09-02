// NEW CLUADE CREATE BEFORE TIMEOUT
using Microsoft.EntityFrameworkCore;
using backend.Models;
using backend.Models.Project;
using backend.Models.Planning;
using backend.Models.Flow;
using backend.Models.Testing;

namespace backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // ---------- Core ----------
        public DbSet<User> Users => Set<User>();
        public DbSet<Permission> Permissions => Set<Permission>();
        public DbSet<SystemList> SystemList => Set<SystemList>();
        public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

        // ---------- Project ----------
        public DbSet<Projects> Projects => Set<Projects>();
        public DbSet<ProjectTypes> ProjectTypes => Set<ProjectTypes>();

        public DbSet<ProjectMembers> ProjectMembers => Set<ProjectMembers>();
        public DbSet<Milestones> Milestones => Set<Milestones>();
        public DbSet<Tasks> Tasks => Set<Tasks>();
        public DbSet<TaskAssignees> TaskAssignees => Set<TaskAssignees>();
        public DbSet<Comments> Comments => Set<Comments>();
        public DbSet<Attachments> Attachments => Set<Attachments>();
        public DbSet<StatusHistory> StatusHistory => Set<StatusHistory>();
        public DbSet<TechStacks> TechStacks => Set<TechStacks>();
        public DbSet<ShowcaseItems> ShowcaseItems => Set<ShowcaseItems>();
        public DbSet<Departments> Departments => Set<Departments>();
        public DbSet<TechStackCatalog> TechStackCatalog => Set<TechStackCatalog>();

        // ---------- Planning ----------
        public DbSet<Events> Events => Set<Events>();
        public DbSet<Todos> Todos => Set<Todos>();

        // ---------- Flow ----------
        public DbSet<FlowDefinitions> FlowDefinitions => Set<FlowDefinitions>();
        public DbSet<FlowSteps> FlowSteps => Set<FlowSteps>();
        public DbSet<FlowTechStacks> FlowTechStacks => Set<FlowTechStacks>();
        public DbSet<FlowExecutions> FlowExecutions => Set<FlowExecutions>();
        public DbSet<FlowLogs> FlowLogs => Set<FlowLogs>();

        // ---------- Testing ----------
        public DbSet<TestSuites> TestSuites => Set<TestSuites>();
        public DbSet<TestRuns> TestRuns => Set<TestRuns>();


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 1. กำหนด Default Schema เป็น "Core"
            modelBuilder.HasDefaultSchema("Core");

            // 2. แจ้ง EF Core ว่าตาราง AuditLogs มี Database Trigger
            modelBuilder.Entity<AuditLog>(entity =>
            {
                entity.ToTable("AuditLogs", "Core", tb => tb.HasTrigger("Trg_AutoCleanup_AuditLogs"));
            });

            // 3. Configure Unique Constraint for EmpId
            modelBuilder.Entity<User>()
                .HasIndex(u => u.EmpId)
                .IsUnique();

            // 4. Configure Composite Unique Constraint for Permission (UserId + SystemId)
            modelBuilder.Entity<Permission>()
                .HasIndex(p => new { p.UserId, p.SystemId })
                .IsUnique();

            // ===========================================================================
            // ---------- Project Schema ----------
            // ===========================================================================

            // Projects
            modelBuilder.Entity<Projects>(entity =>
            {
                entity.HasIndex(p => p.ProjectCode).IsUnique();

                entity.HasOne(p => p.Owner)
                    .WithMany()
                    .HasForeignKey(p => p.ProjectOwnerId)
                    .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(p => p.Creator)
                    .WithMany()
                    .HasForeignKey(p => p.CreatedBy)
                    .OnDelete(DeleteBehavior.NoAction);
            });

            // ProjectMembers (UNIQUE ProjectId + UserId, Cascade เมื่อลบ Project)
            modelBuilder.Entity<ProjectMembers>(entity =>
            {
                entity.HasIndex(pm => new { pm.ProjectId, pm.UserId }).IsUnique();

                entity.HasOne(pm => pm.Project)
                    .WithMany(p => p.Members)
                    .HasForeignKey(pm => pm.ProjectId)
                    .OnDelete(DeleteBehavior.Cascade);

                // Cascade เมื่อลบ User: ProjectMembers เป็นแค่ความสัมพันธ์ "เป็นสมาชิกของ" ไม่ใช่ข้อมูลที่ User
                // เป็นเจ้าของ จึงลบตามได้อย่างปลอดภัย (ต่างจาก Projects/Tasks/Comments ที่ยัง NoAction ไว้)
                entity.HasOne(pm => pm.User)
                    .WithMany()
                    .HasForeignKey(pm => pm.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Milestones (Cascade เมื่อลบ Project, Owner ผูกกับ Core.Users จริง)
            modelBuilder.Entity<Milestones>(entity =>
            {
                entity.HasOne(m => m.Project)
                    .WithMany(p => p.Milestones)
                    .HasForeignKey(m => m.ProjectId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(m => m.Owner)
                    .WithMany()
                    .HasForeignKey(m => m.OwnerId)
                    .OnDelete(DeleteBehavior.NoAction);
            });

            // TechStacks (Cascade เมื่อลบ Project)
            modelBuilder.Entity<TechStacks>(entity =>
            {
                entity.HasOne(ts => ts.Project)
                    .WithMany()
                    .HasForeignKey(ts => ts.ProjectId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // TechStackCatalog — Self-Reference (แถว NAME ชี้กลับไปแถว TYPE ในตารางเดียวกัน)
            // NoAction กัน SQL Server Error "may cause cycles" ของ Self-Referencing FK ที่ Cascade
            modelBuilder.Entity<TechStackCatalog>(entity =>
            {
                entity.HasOne(c => c.Type)
                    .WithMany()
                    .HasForeignKey(c => c.TypeId)
                    .OnDelete(DeleteBehavior.NoAction);
            });

            // ShowcaseItems (Cascade เมื่อลบ Project)
            modelBuilder.Entity<ShowcaseItems>(entity =>
            {
                entity.HasOne(si => si.Project)
                    .WithMany()
                    .HasForeignKey(si => si.ProjectId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(si => si.Creator)
                    .WithMany()
                    .HasForeignKey(si => si.CreatedBy)
                    .OnDelete(DeleteBehavior.NoAction);
            });

            // Tasks (มี Trigger คำนวณ Progress อัตโนมัติ + Self-reference สำหรับ Subtask)
            modelBuilder.Entity<Tasks>(entity =>
            {
                entity.ToTable("Tasks", "Project", tb => tb.HasTrigger("Trg_UpdateProjectProgress"));

                entity.HasOne(t => t.Project)
                    .WithMany(p => p.Tasks)
                    .HasForeignKey(t => t.ProjectId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(t => t.Milestone)
                    .WithMany(m => m.Tasks)
                    .HasForeignKey(t => t.MilestoneId)
                    .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(t => t.ParentTask)
                    .WithMany(t => t.SubTasks)
                    .HasForeignKey(t => t.ParentTaskId)
                    .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(t => t.Creator)
                    .WithMany()
                    .HasForeignKey(t => t.CreatedBy)
                    .OnDelete(DeleteBehavior.NoAction);
            });

            // TaskAssignees (UNIQUE TaskId + UserId, Cascade เมื่อลบ Task)
            modelBuilder.Entity<TaskAssignees>(entity =>
            {
                entity.HasIndex(ta => new { ta.TaskId, ta.UserId }).IsUnique();

                entity.HasOne(ta => ta.Task)
                    .WithMany(t => t.Assignees)
                    .HasForeignKey(ta => ta.TaskId)
                    .OnDelete(DeleteBehavior.Cascade);

                // Cascade เมื่อลบ User: TaskAssignees เป็นแค่ความสัมพันธ์ "ถูกมอบหมายงาน" ไม่ใช่ข้อมูลที่ User
                // เป็นเจ้าของ จึงลบตามได้อย่างปลอดภัย (ต่างจาก Projects/Tasks/Comments ที่ยัง NoAction ไว้)
                entity.HasOne(ta => ta.User)
                    .WithMany()
                    .HasForeignKey(ta => ta.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Comments (ต้องมี ProjectId หรือ TaskId อย่างน้อย 1 อัน, Cascade เฉพาะฝั่ง Project)
            modelBuilder.Entity<Comments>(entity =>
            {
                entity.ToTable(tb => tb.HasCheckConstraint(
                    "CK_Comments_RefTarget",
                    "[ProjectId] IS NOT NULL OR [TaskId] IS NOT NULL"));

                entity.HasOne(c => c.Project)
                    .WithMany(p => p.Comments)
                    .HasForeignKey(c => c.ProjectId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(c => c.Task)
                    .WithMany(t => t.Comments)
                    .HasForeignKey(c => c.TaskId)
                    .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(c => c.User)
                    .WithMany()
                    .HasForeignKey(c => c.UserId)
                    .OnDelete(DeleteBehavior.NoAction);
            });

            // Attachments (ต้องมี ProjectId หรือ TaskId อย่างน้อย 1 อัน, Cascade เฉพาะฝั่ง Project)
            modelBuilder.Entity<Attachments>(entity =>
            {
                entity.ToTable(tb => tb.HasCheckConstraint(
                    "CK_Attachments_RefTarget",
                    "[ProjectId] IS NOT NULL OR [TaskId] IS NOT NULL"));

                entity.HasOne(a => a.Project)
                    .WithMany(p => p.Attachments)
                    .HasForeignKey(a => a.ProjectId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(a => a.Task)
                    .WithMany(t => t.Attachments)
                    .HasForeignKey(a => a.TaskId)
                    .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(a => a.Uploader)
                    .WithMany()
                    .HasForeignKey(a => a.UploadedBy)
                    .OnDelete(DeleteBehavior.NoAction);
            });

            // StatusHistory (ไม่ Cascade เลย เพื่อรักษาประวัติไว้แม้ Project/Task จะถูกลบ)
            modelBuilder.Entity<StatusHistory>(entity =>
            {
                entity.HasOne(sh => sh.Project)
                    .WithMany()
                    .HasForeignKey(sh => sh.ProjectId)
                    .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(sh => sh.Task)
                    .WithMany()
                    .HasForeignKey(sh => sh.TaskId)
                    .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(sh => sh.ChangedByUser)
                    .WithMany()
                    .HasForeignKey(sh => sh.ChangedBy)
                    .OnDelete(DeleteBehavior.NoAction);
            });

            // ===========================================================================
            // ---------- Planning Schema ----------
            // ===========================================================================

            // Events
            modelBuilder.Entity<Events>(entity =>
            {
                entity.ToTable(tb => tb.HasCheckConstraint(
                    "CK_Events_DateRange",
                    "[EndDateTime] >= [StartDateTime]"));

                entity.HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(e => e.LinkedProject)
                    .WithMany()
                    .HasForeignKey(e => e.LinkedProjectId)
                    .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(e => e.LinkedTask)
                    .WithMany()
                    .HasForeignKey(e => e.LinkedTaskId)
                    .OnDelete(DeleteBehavior.NoAction);
            });

            // Todos
            modelBuilder.Entity<Todos>(entity =>
            {
                entity.HasOne(td => td.User)
                    .WithMany()
                    .HasForeignKey(td => td.UserId)
                    .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(td => td.LinkedEvent)
                    .WithMany(e => e.Todos)
                    .HasForeignKey(td => td.LinkedEventId)
                    .OnDelete(DeleteBehavior.NoAction);
            });

            // ===========================================================================
            // ---------- Flow Schema ----------
            // ===========================================================================

            // FlowDefinitions (ผูก 1:1 กับ Project.Projects — Cascade เมื่อลบ Project ต้นทาง เพราะ Flow ไม่มีความหมายถ้าไม่มี Project แล้ว)
            modelBuilder.Entity<FlowDefinitions>(entity =>
            {
                entity.HasIndex(f => f.FlowCode).IsUnique();
                entity.HasIndex(f => f.ProjectId).IsUnique();

                entity.HasOne(f => f.Creator)
                    .WithMany()
                    .HasForeignKey(f => f.CreatedBy)
                    .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(f => f.Project)
                    .WithMany()
                    .HasForeignKey(f => f.ProjectId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // FlowSteps (มี Trigger คำนวณ FlowDefinitions.ProgressPercent อัตโนมัติ, Cascade เมื่อลบ FlowDefinition)
            modelBuilder.Entity<FlowSteps>(entity =>
            {
                entity.ToTable("FlowSteps", "Flow", tb => tb.HasTrigger("Trg_UpdateFlowProgress"));

                entity.HasOne(s => s.FlowDefinition)
                    .WithMany(f => f.Steps)
                    .HasForeignKey(s => s.FlowDefinitionId)
                    .OnDelete(DeleteBehavior.Cascade);

                // ไม่ Cascade — ลบ Milestone ต้นทางแล้ว Step ที่ Auto-Generate ไว้ยังอยู่ (แค่ตัดการอ้างอิง)
                entity.HasOne(s => s.Milestone)
                    .WithMany()
                    .HasForeignKey(s => s.MilestoneId)
                    .OnDelete(DeleteBehavior.NoAction);
            });

            // FlowTechStacks (Cascade เมื่อลบ FlowDefinition)
            modelBuilder.Entity<FlowTechStacks>(entity =>
            {
                entity.HasOne(ts => ts.FlowDefinition)
                    .WithMany(f => f.TechStacks)
                    .HasForeignKey(ts => ts.FlowDefinitionId)
                    .OnDelete(DeleteBehavior.Cascade);

                // ไม่ Cascade — ลบ TechStack ต้นทางแล้วรายการที่ Auto-Generate ไว้ยังอยู่ (แค่ตัดการอ้างอิง)
                entity.HasOne(ts => ts.TechStack)
                    .WithMany()
                    .HasForeignKey(ts => ts.TechStackId)
                    .OnDelete(DeleteBehavior.NoAction);
            });

            // FlowExecutions (Cascade เมื่อลบ FlowDefinition)
            modelBuilder.Entity<FlowExecutions>(entity =>
            {
                entity.HasOne(e => e.FlowDefinition)
                    .WithMany(f => f.Executions)
                    .HasForeignKey(e => e.FlowDefinitionId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.TriggeredByUser)
                    .WithMany()
                    .HasForeignKey(e => e.TriggeredBy)
                    .OnDelete(DeleteBehavior.NoAction);
            });

            // FlowLogs (Cascade เมื่อลบ FlowExecution)
            modelBuilder.Entity<FlowLogs>(entity =>
            {
                entity.HasOne(l => l.FlowExecution)
                    .WithMany(e => e.Logs)
                    .HasForeignKey(l => l.FlowExecutionId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // ===========================================================================
            // ---------- Testing Schema ----------
            // ===========================================================================

            // TestSuites (ผูกกับ Project.Projects — Cascade เมื่อลบ Project ต้นทาง)
            modelBuilder.Entity<TestSuites>(entity =>
            {
                entity.HasIndex(s => s.SuiteCode).IsUnique();

                entity.HasOne(s => s.Project)
                    .WithMany()
                    .HasForeignKey(s => s.ProjectId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(s => s.Creator)
                    .WithMany()
                    .HasForeignKey(s => s.CreatedBy)
                    .OnDelete(DeleteBehavior.NoAction);
            });

            // TestRuns (Cascade เมื่อลบ TestSuite)
            modelBuilder.Entity<TestRuns>(entity =>
            {
                entity.HasOne(r => r.TestSuite)
                    .WithMany(s => s.Runs)
                    .HasForeignKey(r => r.TestSuiteId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(r => r.TriggeredByUser)
                    .WithMany()
                    .HasForeignKey(r => r.TriggeredBy)
                    .OnDelete(DeleteBehavior.NoAction);
            });

        }
    }
}