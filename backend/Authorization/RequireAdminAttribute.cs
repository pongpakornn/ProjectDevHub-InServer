using backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;

namespace backend.Authorization
{
    // สำหรับ User Management เท่านั้น: ไม่ผูกกับ Permission Matrix ปกติ (CanAdd/CanEdit/...) ตามที่ระบุไว้
    // เป็นข้อยกเว้น — อนุญาตเฉพาะ Admin ขึ้นไปเท่านั้น (UserLevel >= 6 หรือ IsSuperAdmin)
    // ต้องตรงกับ ADMIN_LEVEL_THRESHOLD ใน frontend/src/lib/session.ts
    [AttributeUsage(AttributeTargets.Method)]
    public class RequireAdminAttribute : Attribute, IAsyncActionFilter, IOrderedFilter
    {
        private const int AdminLevelThreshold = 6;

        // เหตุผลเดียวกับ RequirePermissionAttribute — ต้องรันก่อน ModelStateInvalidFilter ของ [ApiController]
        public int Order => int.MinValue;

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
                .Select(u => new { u.IsSuperAdmin, u.IsActive, u.IsSuspended, u.UserLevel })
                .FirstOrDefaultAsync();

            bool isAdminLevel = user != null && user.IsActive && !user.IsSuspended &&
                (user.IsSuperAdmin || user.UserLevel >= AdminLevelThreshold);

            // Super Admin ผ่านเสมอ (บายพาส Permission Matrix เหมือน RequirePermissionAttribute) ส่วน Admin
            // ระดับ UserLevel ต้องมี CORE.CanView ด้วย — โมดูล Core เป็นข้อยกเว้นที่ต้องเช็ค View permission
            // ควบคู่ไปกับระดับผู้ใช้เสมอ ตามกติกา "ต้องมี View permission ถึงจะเข้าเมนูได้เลย"
            bool isAdmin = isAdminLevel && (user!.IsSuperAdmin || await db.Permissions.AsNoTracking()
                .AnyAsync(p => p.UserId == userId && p.SystemId == "CORE" && p.CanView));

            if (!isAdmin)
            {
                context.Result = new ObjectResult(new { message = "การจัดการสมาชิกอนุญาตเฉพาะผู้ดูแลระบบ (Admin/Super Admin) เท่านั้น" })
                { StatusCode = StatusCodes.Status403Forbidden };
                return;
            }

            await next();
        }
    }
}
