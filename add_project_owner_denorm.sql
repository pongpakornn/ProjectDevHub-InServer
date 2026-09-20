-- add_project_owner_denorm.sql
-- เพิ่มคอลัมน์ OwnerEmpId/OwnerName บน Project.Projects แบบ Denormalize จาก Core.Users
-- เพื่อให้ตอนเปิดตาราง Project.Projects ตรวจสอบ Database ตรงๆ (ไม่ JOIN) เห็นได้ทันทีว่าโปรเจกต์นี้เป็นของใคร
-- ค่าจะถูก Sync อัตโนมัติผ่าน Trigger ทุกครั้งที่ Insert/Update ProjectOwnerId หรือเปลี่ยนชื่อ/EmpId ของ User เจ้าของ

ALTER TABLE Project.Projects ADD OwnerEmpId VARCHAR(20) NULL;
GO
ALTER TABLE Project.Projects ADD OwnerName NVARCHAR(255) NULL;
GO

-- Backfill ค่าเดิมที่มีอยู่แล้ว
UPDATE p
SET p.OwnerEmpId = u.EmpId,
    p.OwnerName = u.FullName
FROM Project.Projects p
INNER JOIN Core.Users u ON u.UserId = p.ProjectOwnerId;
GO

-- Trigger 1: เมื่อ Insert/Update Project (เปลี่ยนเจ้าของ) — Sync ค่าจาก Users ปัจจุบันทันที
CREATE TRIGGER Project.Trg_SyncProjectOwnerDenorm
ON Project.Projects
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT UPDATE(ProjectOwnerId) RETURN;

    UPDATE p
    SET p.OwnerEmpId = u.EmpId,
        p.OwnerName = u.FullName
    FROM Project.Projects p
    INNER JOIN inserted i ON i.ProjectId = p.ProjectId
    INNER JOIN Core.Users u ON u.UserId = i.ProjectOwnerId;
END;
GO

-- Trigger 2: เมื่อ User เปลี่ยนชื่อ/EmpId — Sync ไปยังทุก Project ที่ตัวเองเป็นเจ้าของ ไม่ให้ค่าค้าง
CREATE TRIGGER Core.Trg_SyncProjectOwnerDenormFromUser
ON Core.Users
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT (UPDATE(EmpId) OR UPDATE(FullName)) RETURN;

    UPDATE p
    SET p.OwnerEmpId = i.EmpId,
        p.OwnerName = i.FullName
    FROM Project.Projects p
    INNER JOIN inserted i ON i.UserId = p.ProjectOwnerId;
END;
GO
