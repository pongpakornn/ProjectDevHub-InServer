# NoteDatabase — Team Module 100% SQL Server Integration (รอบนี้)

Database: `ProjectDevHub` (Server: `DESKTOP-TJ7525D\SQLEXPRESS`, ตรวจสอบผ่าน `sqlcmd`)

## สรุปผลตรวจสอบ

ตรวจสอบตาราง `Project.Comments`, `Project.TaskAssignees`, `Project.ProjectMembers`,
`Project.Milestones`, `Project.Tasks`, `Project.Attachments` ด้วยคำสั่งต่อไปนี้ ผ่าน `sqlcmd`:

```sql
SELECT s.name AS SchemaName, t.name AS TableName
FROM sys.tables t
JOIN sys.schemas s ON t.schema_id = s.schema_id
WHERE s.name = 'Project'
ORDER BY t.name;

SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'Project' AND TABLE_NAME IN ('Comments', 'Attachments')
ORDER BY TABLE_NAME, ORDINAL_POSITION;
```

**ผลลัพธ์: ทุกตารางที่ระบุมีอยู่ครบแล้วใน Database และ Schema ตรงกับ EF Core Models
(`backend/Models/Comments.cs`, `backend/Models/Attachments.cs` ฯลฯ) ทุกคอลัมน์ — ไม่ต้องรัน
CREATE TABLE หรือ ALTER TABLE เพิ่มเติมในรอบนี้ ใช้ Schema เดิมที่มีอยู่ครบถ้วน**

## สถานะการเชื่อมต่อก่อนหน้ารอบนี้ (จาก `backend/TEAM_DB_QUERIES.md`)

เชื่อมต่อจริงแล้ว: `Project.ProjectMembers`, `Project.TaskAssignees`, `Project.Milestones`,
`Project.Tasks` (ผ่าน `ProjectTeamController`/`ProjectTeamService` ที่มีอยู่ก่อนแล้ว)

ยังไม่เชื่อมต่อ: `Project.Comments`, `Project.Attachments` — มีแค่ `DbSet` + Model Config ใน
`AppDbContext` แต่ไม่เคยมี Controller/Service/Frontend UI ใช้งานจริงเลย (ตรวจสอบด้วย
`grep -rn "Comments\|Attachments" backend/Controllers backend/Services` แล้วไม่พบ Endpoint ใดๆ)

## สิ่งที่ทำเพิ่มในรอบนี้ (Backend + Frontend — ไม่มี SQL Script)

- เพิ่ม Endpoint ใหม่ใน `ProjectTeamController` (schema เดิม ไม่ได้แก้ตาราง):
  - `GET/POST /api/ProjectTeam/{id}/comments`, `DELETE /api/ProjectTeam/comments/{commentId}`
  - `GET/POST /api/ProjectTeam/{id}/attachments`, `DELETE /api/ProjectTeam/attachments/{attachmentId}`
  - `POST /api/Upload/attachment?projectId=` (อัปโหลดไฟล์แนบทั่วไป ไม่จำกัดเฉพาะรูปภาพ)
- เพิ่ม Panel ใหม่ในหน้า Team Project Detail: `team-project-comments-panel.tsx`,
  `team-project-attachments-panel.tsx` — ดึง/บันทึกข้อมูลจริงจาก SQL Server ผ่าน Endpoint ข้างต้น

รายละเอียดไฟล์ที่แก้ไข/เพิ่มทั้งหมดของรอบนี้ ดูใน commit message ของ commit ที่ merge เข้า `main`
