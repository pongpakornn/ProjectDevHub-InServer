using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class UserManagementService : IUserManagementService
    {
        private readonly AppDbContext _context;
        private readonly IAuditLogService _auditLogService;

        public UserManagementService(AppDbContext context, IAuditLogService auditLogService)
        {
            _context = context;
            _auditLogService = auditLogService;
        }

        public async Task<List<SystemListDto>> GetSystemListAsync()
        {
            return await _context.SystemList
                .Where(s => s.IsActive)
                .OrderBy(s => s.SystemId)
                .Select(s => new SystemListDto
                {
                    SystemId = s.SystemId,
                    SystemName = s.SystemName,
                    Description = s.Description,
                    IsActive = s.IsActive,
                    CreatedDate = s.CreatedDate,
                })
                .ToListAsync();
        }

        public async Task<List<UserListItemDto>> GetUsersAsync()
        {
            var users = await _context.Users
                .Include(u => u.Permissions)
                .OrderByDescending(u => u.CreatedDate)
                .ToListAsync();

            return users.Select(MapToDto).ToList();
        }

        public async Task<UserListItemDto> CreateUserAsync(CreateUserRequest request, int? currentUserId)
        {
            bool empExists = await _context.Users.AnyAsync(u => u.EmpId == request.EmpId);
            if (empExists)
            {
                throw new InvalidOperationException($"รหัสพนักงาน '{request.EmpId}' มีอยู่ในระบบแล้ว");
            }

            var systemIds = await _context.SystemList.Select(s => s.SystemId).ToListAsync();

            var user = new User
            {
                EmpId = request.EmpId,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                FullName = request.FullName,
                DivisionName = request.DivisionName,
                DepartmentName = request.DepartmentName,
                SectionName = request.SectionName,
                UserLevel = request.UserLevel,
                IsSuperAdmin = request.IsSuperAdmin,
                IsSuspended = request.IsSuspended,
                IsActive = request.IsActive,
                CreatedDate = DateTimeOffset.UtcNow,
                Permissions = BuildPermissions(systemIds, request.Permissions),
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            await _auditLogService.LogAsync(
                currentUserId, "CORE", "USER_CREATE",
                $"สร้างสมาชิกใหม่ {user.FullName} ({user.EmpId})", user.UserId.ToString());

            return MapToDto(user);
        }

        public async Task<UserListItemDto?> UpdateUserAsync(UpdateUserRequest request, int? currentUserId)
        {
            var user = await _context.Users
                .Include(u => u.Permissions)
                .FirstOrDefaultAsync(u => u.UserId == request.UserId);

            if (user == null) return null;

            bool empTaken = await _context.Users
                .AnyAsync(u => u.EmpId == request.EmpId && u.UserId != request.UserId);
            if (empTaken)
            {
                throw new InvalidOperationException($"รหัสพนักงาน '{request.EmpId}' มีอยู่ในระบบแล้ว");
            }

            user.EmpId = request.EmpId;
            user.FullName = request.FullName;
            user.DivisionName = request.DivisionName;
            user.DepartmentName = request.DepartmentName;
            user.SectionName = request.SectionName;
            user.UserLevel = request.UserLevel;
            user.IsSuperAdmin = request.IsSuperAdmin;
            user.IsSuspended = request.IsSuspended;
            user.IsActive = request.IsActive;
            user.UpdatedDate = DateTimeOffset.UtcNow;

            if (!string.IsNullOrWhiteSpace(request.Password))
            {
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
            }

            var systemIds = await _context.SystemList.Select(s => s.SystemId).ToListAsync();

            foreach (var systemId in systemIds)
            {
                var incoming = request.Permissions.FirstOrDefault(p => p.SystemId == systemId);
                var existing = user.Permissions.FirstOrDefault(p => p.SystemId == systemId);

                if (existing == null)
                {
                    user.Permissions.Add(new Permission
                    {
                        UserId = user.UserId,
                        SystemId = systemId,
                        CanView = incoming?.CanView ?? false,
                        CanAdd = incoming?.CanAdd ?? false,
                        CanEdit = incoming?.CanEdit ?? false,
                        CanDelete = incoming?.CanDelete ?? false,
                        CanApprove = incoming?.CanApprove ?? false,
                        CanReject = incoming?.CanReject ?? false,
                    });
                }
                else
                {
                    existing.CanView = incoming?.CanView ?? false;
                    existing.CanAdd = incoming?.CanAdd ?? false;
                    existing.CanEdit = incoming?.CanEdit ?? false;
                    existing.CanDelete = incoming?.CanDelete ?? false;
                    existing.CanApprove = incoming?.CanApprove ?? false;
                    existing.CanReject = incoming?.CanReject ?? false;
                    existing.UpdatedDate = DateTimeOffset.UtcNow;
                }
            }

            await _context.SaveChangesAsync();

            await _auditLogService.LogAsync(
                currentUserId, "CORE", "USER_UPDATE",
                $"แก้ไขข้อมูลและสิทธิ์ของสมาชิก {user.FullName} ({user.EmpId})", user.UserId.ToString());

            return MapToDto(user);
        }

        public async Task<bool> DeleteUserAsync(int userId, int? currentUserId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null) return false;

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            await _auditLogService.LogAsync(
                currentUserId, "CORE", "USER_DELETE",
                $"ลบสมาชิก {user.FullName} ({user.EmpId}) ออกจากระบบ", userId.ToString());

            return true;
        }

        public async Task<UserListItemDto?> ToggleSuspendAsync(int userId, int? currentUserId)
        {
            var user = await _context.Users
                .Include(u => u.Permissions)
                .FirstOrDefaultAsync(u => u.UserId == userId);

            if (user == null) return null;

            user.IsSuspended = !user.IsSuspended;
            user.UpdatedDate = DateTimeOffset.UtcNow;
            await _context.SaveChangesAsync();

            await _auditLogService.LogAsync(
                currentUserId, "CORE", user.IsSuspended ? "USER_SUSPEND" : "USER_UNSUSPEND",
                $"{(user.IsSuspended ? "ระงับ" : "ปลดระงับ")}การใช้งานของสมาชิก {user.FullName} ({user.EmpId})",
                userId.ToString());

            return MapToDto(user);
        }

        private static List<Permission> BuildPermissions(List<string> systemIds, List<SavePermissionItem> incoming)
        {
            return systemIds.Select(systemId =>
            {
                var match = incoming.FirstOrDefault(p => p.SystemId == systemId);
                return new Permission
                {
                    SystemId = systemId,
                    CanView = match?.CanView ?? false,
                    CanAdd = match?.CanAdd ?? false,
                    CanEdit = match?.CanEdit ?? false,
                    CanDelete = match?.CanDelete ?? false,
                    CanApprove = match?.CanApprove ?? false,
                    CanReject = match?.CanReject ?? false,
                };
            }).ToList();
        }

        private static UserListItemDto MapToDto(User user)
        {
            return new UserListItemDto
            {
                UserId = user.UserId,
                EmpId = user.EmpId,
                FullName = user.FullName,
                DivisionName = user.DivisionName,
                DepartmentName = user.DepartmentName,
                SectionName = user.SectionName,
                UserLevel = user.UserLevel,
                IsSuperAdmin = user.IsSuperAdmin,
                IsSuspended = user.IsSuspended,
                IsOnline = user.IsOnline,
                ComputerName = user.ComputerName,
                IpAddress = user.IpAddress,
                LastLoginDate = user.LastLoginDate,
                IsActive = user.IsActive,
                CreatedDate = user.CreatedDate,
                UpdatedDate = user.UpdatedDate,
                Permissions = user.Permissions.Select(p => new PermissionItemDto
                {
                    SystemId = p.SystemId,
                    CanView = p.CanView,
                    CanAdd = p.CanAdd,
                    CanEdit = p.CanEdit,
                    CanDelete = p.CanDelete,
                    CanApprove = p.CanApprove,
                    CanReject = p.CanReject,
                }).ToList(),
            };
        }
    }
}
