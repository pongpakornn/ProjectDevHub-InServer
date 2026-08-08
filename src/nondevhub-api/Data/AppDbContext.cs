using Microsoft.EntityFrameworkCore;
using nondevhub_api.Models;

namespace nondevhub_api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<Permission> Permissions => Set<Permission>();
        public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 🟢 1. Mapping Table "Core.Users"
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("Users", "Core", tb => 
                {
                    tb.HasTrigger("Users_Trigger");
                    tb.UseSqlOutputClause(false); // 👈 ปิด OUTPUT clause รองรับ SQL Triggers
                });
                
                entity.HasKey(u => u.UserId);
                entity.Property(u => u.UserId).ValueGeneratedOnAdd();
            });

            // 🟢 2. Mapping Table "Core.Permissions"
            modelBuilder.Entity<Permission>(entity =>
            {
                entity.ToTable("Permissions", "Core", tb => 
                {
                    tb.HasTrigger("Permissions_Trigger");
                    tb.UseSqlOutputClause(false); // 👈 ปิด OUTPUT clause รองรับ SQL Triggers
                });
                
                entity.HasKey(p => p.PermissionId);
                entity.Property(p => p.PermissionId).ValueGeneratedOnAdd();

                entity.HasOne(p => p.User)
                      .WithMany(u => u.Permissions)
                      .HasForeignKey(p => p.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // 🟢 3. Mapping Table "Core.AuditLogs" (จุดสำคัญที่เกิด Error Trg_AutoCleanup_AuditLogs)
            modelBuilder.Entity<AuditLog>(entity =>
            {
                entity.ToTable("AuditLogs", "Core", tb => 
                {
                    tb.HasTrigger("Trg_AutoCleanup_AuditLogs"); // 👈 แมปชื่อ Trigger ให้ตรงกับ schema.sql
                    tb.UseSqlOutputClause(false); // 👈 ปิด OUTPUT clause ป้องกัน DbUpdateException 500
                });
                
                entity.HasKey(a => a.LogId);
                entity.Property(a => a.LogId).ValueGeneratedOnAdd();
            });
        }
    }
}