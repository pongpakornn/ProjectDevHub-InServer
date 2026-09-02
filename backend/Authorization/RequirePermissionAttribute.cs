using backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;

namespace backend.Authorization
{
    // ตรวจสิทธิ์ Core.Permissions ของ (userId จาก Query String + SystemId) ก่อนให้ Action ทำงานจริง
    // ป้องกันการยิง API ตรงเข้า Endpoint ข้าม UI (Bypass ปุ่มที่ถูกซ่อน/ปิดไว้ฝั่ง Frontend)
    // Super Admin ผ่านเสมอไม่ว่า Permission Matrix จะระบุไว้อย่างไร (กฎเดียวกับฝั่ง Frontend ใน lib/session.ts)
    [AttributeUsage(AttributeTargets.Method)]
    public class RequirePermissionAttribute : Attribute, IAsyncActionFilter, IOrderedFilter
    {
        private readonly string _systemId;
        private readonly PermissionAction _action;

        // ต้องรันก่อน ModelStateInvalidFilter ในตัวของ [ApiController] เสมอ (ซึ่งเป็น Global Filter
        // Order=0) ไม่งั้น Request ที่ Body ไม่ผ่าน Validation จะได้ 400 กลับไปก่อนที่จะเช็คสิทธิ์เลย
        // ทำให้คนไม่มีสิทธิ์รู้ว่า Endpoint ต้องการ Field อะไรบ้างได้จากข้อความ Error (Bypass Enumeration)
        public int Order => int.MinValue;

        public RequirePermissionAttribute(string systemId, PermissionAction action)
        {
            _systemId = systemId;
            _action = action;
        }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var db = context.HttpContext.RequestServices.GetRequiredService<AppDbContext>();

            if (!context.HttpContext.Request.Query.TryGetValue("userId", out var raw) ||
                !int.TryParse(raw, out var userId))
            {
                context.Result = new ObjectResult(new { message = "กรุณาระบุผู้ใช้งาน (userId) ก่อนทำรายการ" })
                { StatusCode = StatusCodes.Status401Unauthorized };
                return;
            }

            var user = await db.Users.AsNoTracking()
                .Where(u => u.UserId == userId)
                .Select(u => new { u.IsSuperAdmin, u.IsActive, u.IsSuspended })
                .FirstOrDefaultAsync();

            if (user == null || !user.IsActive || user.IsSuspended)
            {
                context.Result = new ObjectResult(new { message = "ไม่พบผู้ใช้งานนี้ หรือบัญชีถูกระงับการใช้งาน" })
                { StatusCode = StatusCodes.Status403Forbidden };
                return;
            }

            if (!user.IsSuperAdmin)
            {
                var perm = await db.Permissions.AsNoTracking()
                    .Where(p => p.UserId == userId && p.SystemId == _systemId)
                    .Select(p => new { p.CanView, p.CanAdd, p.CanEdit, p.CanDelete, p.CanApprove, p.CanReject })
                    .FirstOrDefaultAsync();

                bool allowed = _action switch
                {
                    PermissionAction.View => perm?.CanView ?? false,
                    PermissionAction.Add => perm?.CanAdd ?? false,
                    PermissionAction.Edit => perm?.CanEdit ?? false,
                    PermissionAction.Delete => perm?.CanDelete ?? false,
                    PermissionAction.Approve => perm?.CanApprove ?? false,
                    PermissionAction.Reject => perm?.CanReject ?? false,
                    _ => false,
                };

                if (!allowed)
                {
                    context.Result = new ObjectResult(new { message = $"คุณไม่มีสิทธิ์ {_action} ในระบบ {_systemId}" })
                    { StatusCode = StatusCodes.Status403Forbidden };
                    return;
                }
            }

            await next();
        }
    }
}
