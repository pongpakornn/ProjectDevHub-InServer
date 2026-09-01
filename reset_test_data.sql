-- reset_test_data.sql
-- ล้างข้อมูลทดสอบทั้งหมด + Reset Identity ให้เริ่มนับจาก 1 ใหม่
-- เก็บไว้ไม่แตะ: Core.Users, Core.Permissions (ผูกกับ Users), Core.SystemList (Master Data โมดูล SOLO/TEAM/FLOW —
--   Permissions.SystemId มี FK อ้างอิงอยู่), Project.ProjectTypes, Project.Departments, Project.TechStackCatalog
--   (Master/Lookup Data ที่ใช้เป็น Dropdown ในระบบ ไม่ใช่ข้อมูลทดสอบ)
-- รันผ่าน: sqlcmd -S "DESKTOP-TJ7525D\SQLEXPRESS" -U sa -P 1234 -C -d ProjectDevHub -i reset_test_data.sql

-- ===========================================================================
-- 1) DELETE ตามลำดับลูกก่อนแม่ (กัน FK Constraint)
-- ===========================================================================

-- Flow.*
DELETE FROM Flow.FlowLogs;
DELETE FROM Flow.FlowExecutions;
DELETE FROM Flow.FlowSteps;
DELETE FROM Flow.FlowTechStacks;
DELETE FROM Flow.FlowDefinitions;

-- Testing.*
DELETE FROM Testing.TestRuns;
DELETE FROM Testing.TestSuites;

-- Planning.* (Todos อ้าง FK ไปที่ Events ผ่าน LinkedEventId — ลบ Todos ก่อน)
DELETE FROM Planning.Todos;
DELETE FROM Planning.Events;

-- Project.* (ลูกของ Tasks/Projects ก่อน แล้วค่อยลบ Tasks/Milestones/Projects)
DELETE FROM Project.StatusHistory;
DELETE FROM Project.Comments;
DELETE FROM Project.Attachments;
DELETE FROM Project.TaskAssignees;
DELETE FROM Project.Tasks;
DELETE FROM Project.Milestones;
DELETE FROM Project.TechStacks;
DELETE FROM Project.ShowcaseItems;
DELETE FROM Project.ProjectMembers;
DELETE FROM Project.Projects;

-- Core.* (ยกเว้น Users / Permissions / SystemList)
DELETE FROM Core.AuditLogs;
GO

-- ===========================================================================
-- 2) Reset Identity ให้เริ่มนับจาก 1 ใหม่ สำหรับทุกตารางที่เพิ่งลบข้อมูลไป
-- ===========================================================================
DBCC CHECKIDENT ('Flow.FlowLogs', RESEED, 0);
DBCC CHECKIDENT ('Flow.FlowExecutions', RESEED, 0);
DBCC CHECKIDENT ('Flow.FlowSteps', RESEED, 0);
DBCC CHECKIDENT ('Flow.FlowTechStacks', RESEED, 0);
DBCC CHECKIDENT ('Flow.FlowDefinitions', RESEED, 0);

DBCC CHECKIDENT ('Testing.TestRuns', RESEED, 0);
DBCC CHECKIDENT ('Testing.TestSuites', RESEED, 0);

DBCC CHECKIDENT ('Planning.Todos', RESEED, 0);
DBCC CHECKIDENT ('Planning.Events', RESEED, 0);

DBCC CHECKIDENT ('Project.StatusHistory', RESEED, 0);
DBCC CHECKIDENT ('Project.Comments', RESEED, 0);
DBCC CHECKIDENT ('Project.Attachments', RESEED, 0);
DBCC CHECKIDENT ('Project.TaskAssignees', RESEED, 0);
DBCC CHECKIDENT ('Project.Tasks', RESEED, 0);
DBCC CHECKIDENT ('Project.Milestones', RESEED, 0);
DBCC CHECKIDENT ('Project.TechStacks', RESEED, 0);
DBCC CHECKIDENT ('Project.ShowcaseItems', RESEED, 0);
DBCC CHECKIDENT ('Project.ProjectMembers', RESEED, 0);
DBCC CHECKIDENT ('Project.Projects', RESEED, 0);

DBCC CHECKIDENT ('Core.AuditLogs', RESEED, 0);
GO

-- ===========================================================================
-- 3) ตรวจสอบผลลัพธ์ — ตารางที่ล้างต้องมี 0 แถว, Users/Permissions/SystemList/ProjectTypes/
--    Departments/TechStackCatalog ต้องยังอยู่ครบ
-- ===========================================================================
SELECT 'Flow.FlowDefinitions' AS TableName, COUNT(*) AS Cnt FROM Flow.FlowDefinitions
UNION ALL SELECT 'Testing.TestSuites', COUNT(*) FROM Testing.TestSuites
UNION ALL SELECT 'Planning.Events', COUNT(*) FROM Planning.Events
UNION ALL SELECT 'Project.Projects', COUNT(*) FROM Project.Projects
UNION ALL SELECT 'Core.AuditLogs', COUNT(*) FROM Core.AuditLogs
UNION ALL SELECT 'Core.Users (kept)', COUNT(*) FROM Core.Users
UNION ALL SELECT 'Core.Permissions (kept)', COUNT(*) FROM Core.Permissions
UNION ALL SELECT 'Core.SystemList (kept)', COUNT(*) FROM Core.SystemList
UNION ALL SELECT 'Project.ProjectTypes (kept)', COUNT(*) FROM Project.ProjectTypes
UNION ALL SELECT 'Project.Departments (kept)', COUNT(*) FROM Project.Departments
UNION ALL SELECT 'Project.TechStackCatalog (kept)', COUNT(*) FROM Project.TechStackCatalog;
GO
