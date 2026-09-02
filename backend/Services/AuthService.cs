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
            // สร้าง SessionId ใหม่ทุกครั้งที่ Login สำเร็จ แล้วทับ CurrentSessionId เดิม — ผลคือ Session เก่า
            // (ถ้ามี) จะใช้ Token/SessionId เดิมต่อไม่ได้อีก เพราะ IsSessionValidAsync จะเทียบไม่ตรงอีกต่อไป
            // นี่คือกลไกจำกัด "Login ได้ครั้งละ 1 Session" แบบ Last-Login-Wins
            var sessionId = Guid.NewGuid().ToString();
            user.CurrentSessionId = sessionId;
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
                SessionId = sessionId,
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

        public async Task LogoutAsync(int userId, string? sessionId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null) return;

            // ถ้ามีการส่ง sessionId มา ต้องตรงกับ Session ปัจจุบันเท่านั้นถึงจะอนุญาตให้ตั้ง Offline —
            // ป้องกัน Tab/Session เก่าที่ถูก Session ใหม่เตะออกไปแล้ว มาเรียก Logout ทีหลังจนไปลบสถานะ
            // Online ของ Session ใหม่ที่ยัง Active อยู่จริงโดยไม่ตั้งใจ
            if (!string.IsNullOrEmpty(sessionId) && user.CurrentSessionId != sessionId)
            {
                return;
            }

            user.IsOnline = false;
            user.CurrentSessionId = null;
            await _context.SaveChangesAsync();

            _context.AuditLogs.Add(new AuditLog
            {
                UserId = user.UserId,
                SystemId = "CORE",
                ActionType = "LOGOUT",
                LogDescription = $"User {user.FullName} logged out.",
                IpAddress = "127.0.0.1",
                ComputerName = Environment.MachineName
            });
            await _context.SaveChangesAsync();
        }

        public async Task<bool> IsSessionValidAsync(int userId, string sessionId)
        {
            var user = await _context.Users
                .Where(u => u.UserId == userId)
                .Select(u => new { u.CurrentSessionId, u.IsSuspended, u.IsActive })
                .FirstOrDefaultAsync();

            if (user == null || !user.IsActive || user.IsSuspended) return false;
            return user.CurrentSessionId == sessionId;
        }
    }
}