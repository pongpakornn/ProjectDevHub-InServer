-- ===========================================================================
-- Reporting/Read Views — ลด JOIN/Projection ซ้ำๆ ที่กระจายอยู่หลาย Service ฝั่ง C#
-- ล้วนเป็น VIEW อ่านอย่างเดียว (ไม่มี Trigger/SP ที่เปลี่ยนพฤติกรรมการเขียนข้อมูลเดิม) ปลอดภัยต่อของเดิม
-- 100% — เพิ่มใหม่ล้วนๆ ไม่ได้ไปแก้ Query เดิมใน EF Core ให้ (ยกเว้นจุดที่ระบุไว้ในโค้ด C#)
-- Idempotent: ใช้ CREATE OR ALTER ทุกตัว รันซ้ำได้ปลอดภัย
-- ===========================================================================

USE ProjectDevHub;
GO

-- ---------------------------------------------------------------------------
-- Core.vw_UserPermissionSummary — สรุปจำนวนสิทธิ์ต่อ User หนึ่งคน (ใช้แทนการนับ Client-side
-- ในหน้า User Management ได้ถ้าต้องการย้ายมาคำนวณฝั่ง DB ในอนาคต)
-- ---------------------------------------------------------------------------
CREATE OR ALTER VIEW Core.vw_UserPermissionSummary AS
SELECT
    u.UserId,
    u.EmpId,
    u.FullName,
    u.UserLevel,
    u.IsSuperAdmin,
    u.IsSuspended,
    u.IsActive,
    u.IsOnline,
    u.DivisionName,
    u.DepartmentName,
    u.LastLoginDate,
    COUNT(perm.PermissionId)                                   AS SystemsGranted,
    SUM(CASE WHEN perm.CanView    = 1 THEN 1 ELSE 0 END)       AS CanViewCount,
    SUM(CASE WHEN perm.CanAdd     = 1 THEN 1 ELSE 0 END)       AS CanAddCount,
    SUM(CASE WHEN perm.CanEdit    = 1 THEN 1 ELSE 0 END)       AS CanEditCount,
    SUM(CASE WHEN perm.CanDelete  = 1 THEN 1 ELSE 0 END)       AS CanDeleteCount,
    SUM(CASE WHEN perm.CanApprove = 1 THEN 1 ELSE 0 END)       AS CanApproveCount,
    SUM(CASE WHEN perm.CanReject  = 1 THEN 1 ELSE 0 END)       AS CanRejectCount
FROM Core.Users u
LEFT JOIN Core.Permissions perm ON perm.UserId = u.UserId
GROUP BY
    u.UserId, u.EmpId, u.FullName, u.UserLevel, u.IsSuperAdmin, u.IsSuspended, u.IsActive,
    u.IsOnline, u.DivisionName, u.DepartmentName, u.LastLoginDate;
GO

-- ---------------------------------------------------------------------------
-- Project.vw_ProjectOverview — รวม Projects + ProjectType + Owner/Creator Name + WorkType (SOLO/TEAM)
-- + จำนวนสมาชิกทีม ในแถวเดียว ตรงกับ Pattern การ Include+Select ที่ ProjectSoloService/
-- ProjectTeamService/VisitorService ทำซ้ำกันอยู่หลายจุด
-- ---------------------------------------------------------------------------
CREATE OR ALTER VIEW Project.vw_ProjectOverview AS
SELECT
    p.ProjectId,
    p.ProjectCode,
    p.ProjectName,
    p.Description,
    p.ProjectTypeId,
    pt.TypeName                                                        AS ProjectTypeName,
    p.DivisionName,
    p.RequesterName,
    p.ProjectOwnerId,
    ownerUser.FullName                                                 AS OwnerName,
    p.CreatedBy,
    creatorUser.FullName                                               AS CreatedByName,
    p.Status,
    p.Priority,
    p.StartDate,
    p.EndDate,
    p.ProgressPercent,
    p.IsActive,
    p.CreatedDate,
    p.UpdatedDate,
    (SELECT COUNT(*) FROM Project.ProjectMembers pm WHERE pm.ProjectId = p.ProjectId) AS MemberCount,
    CASE WHEN EXISTS (SELECT 1 FROM Project.ProjectMembers pm2 WHERE pm2.ProjectId = p.ProjectId)
         THEN 'TEAM' ELSE 'SOLO' END                                   AS WorkType
FROM Project.Projects p
LEFT JOIN Project.ProjectTypes pt   ON pt.ProjectTypeId = p.ProjectTypeId
LEFT JOIN Core.Users ownerUser      ON ownerUser.UserId = p.ProjectOwnerId
LEFT JOIN Core.Users creatorUser    ON creatorUser.UserId = p.CreatedBy;
GO

-- ---------------------------------------------------------------------------
-- Project.vw_ProjectOwnerStats — จำนวนโปรเจกต์ + วันที่ล่าสุดต่อเจ้าของ 1 คน
-- ตรงกับ Query ใน VisitorService.GetVisitableUsersAsync (GroupBy ProjectOwnerId) เป๊ะ
-- ---------------------------------------------------------------------------
CREATE OR ALTER VIEW Project.vw_ProjectOwnerStats AS
SELECT
    u.UserId,
    u.EmpId,
    u.FullName,
    u.UserLevel,
    u.DivisionName,
    u.DepartmentName,
    COUNT(p.ProjectId)          AS ProjectCount,
    MAX(p.CreatedDate)          AS LatestProjectDate
FROM Core.Users u
JOIN Project.Projects p ON p.ProjectOwnerId = u.UserId AND p.IsActive = 1
WHERE u.IsActive = 1 AND u.IsSuspended = 0
GROUP BY u.UserId, u.EmpId, u.FullName, u.UserLevel, u.DivisionName, u.DepartmentName;
GO

-- ---------------------------------------------------------------------------
-- Project.vw_TaskProgress — สรุปจำนวน/เปอร์เซ็นต์ Task ที่เสร็จแล้วต่อ 1 โปรเจกต์
-- (ลดการเขียน LINQ นับ Task.Status == "DONE" ซ้ำๆ ทั้งฝั่ง Solo/Team)
-- ---------------------------------------------------------------------------
CREATE OR ALTER VIEW Project.vw_TaskProgress AS
SELECT
    t.ProjectId,
    COUNT(*)                                                    AS TotalTasks,
    SUM(CASE WHEN t.Status = 'DONE' THEN 1 ELSE 0 END)          AS CompletedTasks,
    CASE WHEN COUNT(*) = 0 THEN 0
         ELSE CAST(ROUND(100.0 * SUM(CASE WHEN t.Status = 'DONE' THEN 1 ELSE 0 END) / COUNT(*), 0) AS INT)
    END                                                          AS CompletionPercent
FROM Project.Tasks t
GROUP BY t.ProjectId;
GO

-- ---------------------------------------------------------------------------
-- Flow.vw_FlowOverview — Flow + Project + Creator Name + จำนวนแถว/ประเภทไดอะแกรมที่กรอกแล้ว
-- (ใช้แทนการ Query FlowDiagramRows แยกเพื่อนับ "กี่ประเภทที่มีข้อมูลแล้ว" ต่อ Flow หนึ่งอัน)
-- ---------------------------------------------------------------------------
CREATE OR ALTER VIEW Flow.vw_FlowOverview AS
SELECT
    f.FlowDefinitionId,
    f.ProjectId,
    f.FlowCode,
    f.Name,
    f.Description,
    f.Status,
    f.WorkType,
    f.StartDate,
    f.EndDate,
    f.ProgressPercent,
    f.SystemType,
    f.ModuleList,
    f.DfdLevel,
    f.CreatedBy,
    creatorUser.FullName AS CreatedByName,
    f.IsActive,
    f.CreatedDate,
    f.UpdatedDate,
    (SELECT COUNT(*) FROM Flow.FlowDiagramRows r WHERE r.FlowDefinitionId = f.FlowDefinitionId)              AS TotalDiagramRows,
    (SELECT COUNT(DISTINCT r2.DiagramType) FROM Flow.FlowDiagramRows r2 WHERE r2.FlowDefinitionId = f.FlowDefinitionId) AS DiagramTypesFilled
FROM Flow.FlowDefinitions f
LEFT JOIN Core.Users creatorUser ON creatorUser.UserId = f.CreatedBy;
GO

-- ตรวจผลลัพธ์
SELECT
    (SELECT COUNT(*) FROM sys.views WHERE schema_id = SCHEMA_ID('Core')    AND name = 'vw_UserPermissionSummary') AS V1,
    (SELECT COUNT(*) FROM sys.views WHERE schema_id = SCHEMA_ID('Project') AND name = 'vw_ProjectOverview')      AS V2,
    (SELECT COUNT(*) FROM sys.views WHERE schema_id = SCHEMA_ID('Project') AND name = 'vw_ProjectOwnerStats')    AS V3,
    (SELECT COUNT(*) FROM sys.views WHERE schema_id = SCHEMA_ID('Project') AND name = 'vw_TaskProgress')         AS V4,
    (SELECT COUNT(*) FROM sys.views WHERE schema_id = SCHEMA_ID('Flow')    AND name = 'vw_FlowOverview')         AS V5;
GO
