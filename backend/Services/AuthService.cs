// backend/Services/AuthService.cs
using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace backend.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;

        public AuthService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<LoginResponse> LoginAsync(LoginRequest request, string ipAddress, string computerName)
        {
            // 1. ตรวจสอบว่ามี EmpId นี้ในระบบหรือไม่
            var user = await _context.Users
                .Include(u => u.Permissions)
                .FirstOrDefaultAsync(u => u.EmpId == request.EmpId && u.IsActive);

            if (user == null)
            {
                return new LoginResponse { Success = false, Message = "รหัสพนักงานหรือรหัสผ่านไม่ถูกต้อง" };
            }

            // 2. ตรวจสอบสถานะบัญชี
            if (user.IsSuspended)
            {
                return new LoginResponse { Success = false, Message = "บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ" };
            }

            // 3. Verify Password ด้วย BCrypt (ป้องกัน Null / Invalid Hash Format)
            bool isPasswordValid = false;
            try
            {
                if (!string.IsNullOrEmpty(user.PasswordHash))
                {
                    isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
                }
            }
            catch (Exception)
            {
                // หาก Hash ใน DB รูปแบบไม่ถูกต้อง ให้ถือว่ารหัสผ่านไม่ผ่าน
                isPasswordValid = false;
            }

            if (!isPasswordValid)
            {
                // บันทึก AuditLog เมื่อ Login ไม่สำเร็จ
                _context.AuditLogs.Add(new AuditLog
                {
                    UserId = user.UserId,
                    SystemId = "CORE",
                    ActionType = "LOGIN_FAILED",
                    LogDescription = $"Attempted login failed for EmpId: {request.EmpId}",
                    IpAddress = ipAddress,
                    ComputerName = computerName
                });
                await _context.SaveChangesAsync();

                return new LoginResponse { Success = false, Message = "รหัสพนักงานหรือรหัสผ่านไม่ถูกต้อง" };
            }

            // 4. อัปเดต Session & LastLogin Status
            user.LastLoginDate = DateTimeOffset.UtcNow;
            user.IsOnline = true;
            user.IpAddress = ipAddress;
            user.ComputerName = computerName;

            _context.AuditLogs.Add(new AuditLog
            {
                UserId = user.UserId,
                SystemId = "CORE",
                ActionType = "LOGIN_SUCCESS",
                LogDescription = $"User {user.FullName} logged in successfully.",
                IpAddress = ipAddress,
                ComputerName = computerName
            });

            await _context.SaveChangesAsync();

            // 5. คืนค่าข้อมูล User & Permissions
            return new LoginResponse
            {
                Success = true,
                Message = "เข้าสู่ระบบสำเร็จ",
                Token = "mocked-jwt-token-for-dev",
                User = new UserInfoDto
                {
                    UserId = user.UserId,
                    EmpId = user.EmpId,
                    FullName = user.FullName,
                    DivisionName = user.DivisionName,
                    DepartmentName = user.DepartmentName,
                    UserLevel = user.UserLevel,
                    IsSuperAdmin = user.IsSuperAdmin,
                    Permissions = user.Permissions.Select(p => new UserPermissionDto
                    {
                        SystemId = p.SystemId,
                        CanView = p.CanView,
                        CanAdd = p.CanAdd,
                        CanEdit = p.CanEdit,
                        CanDelete = p.CanDelete,
                        CanApprove = p.CanApprove,
                        CanReject = p.CanReject
                    }).ToList()
                }
            };
        }
    }
}