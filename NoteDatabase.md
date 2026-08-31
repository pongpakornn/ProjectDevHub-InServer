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

---

# NoteDatabase — Flow Module SQL Server Integration (รอบถัดมา)

Database: `ProjectDevHub` (Server: `DESKTOP-TJ7525D\SQLEXPRESS`, ตรวจสอบผ่าน `sqlcmd`)

## สรุปผลตรวจสอบ

ตรวจสอบด้วยคำสั่งต่อไปนี้ ผ่าน `sqlcmd`:

```sql
SELECT s.name AS SchemaName, t.name AS TableName
FROM sys.tables t
JOIN sys.schemas s ON t.schema_id = s.schema_id
ORDER BY s.name, t.name;
```

**ผลลัพธ์: ไม่มีตารางที่เกี่ยวข้องกับ Flow อยู่ใน Database เลย** (มีเฉพาะ Schema `Core`, `Planning`,
`Project` เดิม) — ต้องสร้าง Schema และตารางใหม่ทั้งหมดสำหรับโมดูล Flow

## SQL Script ที่สร้างเพิ่มในรอบนี้

รันผ่าน `sqlcmd -S "DESKTOP-TJ7525D\SQLEXPRESS" -U sa -P 1234 -C -d ProjectDevHub -i create_flow_schema.sql`
เรียบร้อยแล้ว (ตรวจสอบผลด้วย `sys.tables`/`sys.triggers` — ครบทั้ง 5 ตาราง + 1 Trigger)

```sql
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'Flow')
BEGIN
    EXEC('CREATE SCHEMA Flow');
END
GO

-- Flow.FlowDefinitions — รายการ Flow หลัก
CREATE TABLE Flow.FlowDefinitions (
    FlowDefinitionId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    FlowCode VARCHAR(30) NOT NULL,
    Name NVARCHAR(255) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    Status VARCHAR(20) NOT NULL DEFAULT ('PLANNING'),        -- PLANNING, IN_PROGRESS, COMPLETED
    WorkType VARCHAR(10) NOT NULL DEFAULT ('SOLO'),           -- SOLO, TEAM
    StartDate DATE NULL,
    EndDate DATE NULL,
    ProgressPercent DECIMAL(5,2) NOT NULL DEFAULT (0),        -- คำนวณอัตโนมัติจาก Trigger
    CreatedBy INT NOT NULL,
    IsActive BIT NOT NULL DEFAULT (1),
    CreatedDate DATETIMEOFFSET NOT NULL DEFAULT (SYSDATETIMEOFFSET()),
    UpdatedDate DATETIMEOFFSET NULL,
    CONSTRAINT UQ_FlowDefinitions_FlowCode UNIQUE (FlowCode),
    CONSTRAINT FK_FlowDefinitions_Creator FOREIGN KEY (CreatedBy) REFERENCES Core.Users(UserId),
    CONSTRAINT CK_FlowDefinitions_Status CHECK (Status IN ('PLANNING','IN_PROGRESS','COMPLETED')),
    CONSTRAINT CK_FlowDefinitions_WorkType CHECK (WorkType IN ('SOLO','TEAM'))
);

-- Flow.FlowSteps — เฟส/สเต็ปของแต่ละ Flow (Flow Diagram + Gantt)
CREATE TABLE Flow.FlowSteps (
    FlowStepId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    FlowDefinitionId INT NOT NULL,
    StepNo VARCHAR(20) NOT NULL,
    Title NVARCHAR(255) NOT NULL,
    Status VARCHAR(20) NOT NULL DEFAULT ('PENDING'),          -- PENDING, IN_PROGRESS, DONE
    ProgressPercent INT NOT NULL DEFAULT (0),
    StartDate DATE NULL,
    EndDate DATE NULL,
    SortOrder INT NOT NULL DEFAULT (0),
    CONSTRAINT FK_FlowSteps_FlowDefinition FOREIGN KEY (FlowDefinitionId)
        REFERENCES Flow.FlowDefinitions(FlowDefinitionId) ON DELETE CASCADE,
    CONSTRAINT CK_FlowSteps_Status CHECK (Status IN ('PENDING','IN_PROGRESS','DONE')),
    CONSTRAINT CK_FlowSteps_Progress CHECK (ProgressPercent BETWEEN 0 AND 100)
);

-- Flow.FlowTechStacks — Architecture Diagram Tags (Frontend/Backend/Database)
CREATE TABLE Flow.FlowTechStacks (
    FlowTechStackId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    FlowDefinitionId INT NOT NULL,
    Layer VARCHAR(20) NOT NULL,                               -- FRONTEND, BACKEND, DATABASE
    Name NVARCHAR(100) NOT NULL,
    SortOrder INT NOT NULL DEFAULT (0),
    CONSTRAINT FK_FlowTechStacks_FlowDefinition FOREIGN KEY (FlowDefinitionId)
        REFERENCES Flow.FlowDefinitions(FlowDefinitionId) ON DELETE CASCADE,
    CONSTRAINT CK_FlowTechStacks_Layer CHECK (Layer IN ('FRONTEND','BACKEND','DATABASE'))
);

-- Flow.FlowExecutions — ประวัติการรัน Flow (Run History)
CREATE TABLE Flow.FlowExecutions (
    FlowExecutionId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    FlowDefinitionId INT NOT NULL,
    Status VARCHAR(20) NOT NULL DEFAULT ('RUNNING'),          -- RUNNING, SUCCESS, FAILED
    StartedDate DATETIMEOFFSET NOT NULL DEFAULT (SYSDATETIMEOFFSET()),
    FinishedDate DATETIMEOFFSET NULL,
    TriggeredBy INT NOT NULL,
    Note NVARCHAR(500) NULL,
    CONSTRAINT FK_FlowExecutions_FlowDefinition FOREIGN KEY (FlowDefinitionId)
        REFERENCES Flow.FlowDefinitions(FlowDefinitionId) ON DELETE CASCADE,
    CONSTRAINT FK_FlowExecutions_TriggeredBy FOREIGN KEY (TriggeredBy) REFERENCES Core.Users(UserId),
    CONSTRAINT CK_FlowExecutions_Status CHECK (Status IN ('RUNNING','SUCCESS','FAILED'))
);

-- Flow.FlowLogs — Log แต่ละบรรทัดของ Execution หนึ่งๆ
CREATE TABLE Flow.FlowLogs (
    FlowLogId BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    FlowExecutionId INT NOT NULL,
    LogLevel VARCHAR(10) NOT NULL DEFAULT ('INFO'),           -- INFO, WARN, ERROR
    Message NVARCHAR(MAX) NOT NULL,
    LoggedDate DATETIMEOFFSET NOT NULL DEFAULT (SYSDATETIMEOFFSET()),
    CONSTRAINT FK_FlowLogs_Execution FOREIGN KEY (FlowExecutionId)
        REFERENCES Flow.FlowExecutions(FlowExecutionId) ON DELETE CASCADE,
    CONSTRAINT CK_FlowLogs_Level CHECK (LogLevel IN ('INFO','WARN','ERROR'))
);

-- Trigger: คำนวณ Flow.FlowDefinitions.ProgressPercent อัตโนมัติจาก AVG(FlowSteps.ProgressPercent)
-- (รูปแบบเดียวกับ Project.Trg_UpdateProjectProgress ที่มีอยู่แล้ว แต่ครอบคลุม DELETE ด้วย)
CREATE TRIGGER Flow.Trg_UpdateFlowProgress
ON Flow.FlowSteps
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    ;WITH AffectedFlows AS (
        SELECT DISTINCT FlowDefinitionId FROM inserted
        UNION
        SELECT DISTINCT FlowDefinitionId FROM deleted
    )
    UPDATE f
    SET f.ProgressPercent = ISNULL(s.AvgProgress, 0),
        f.UpdatedDate = SYSDATETIMEOFFSET()
    FROM Flow.FlowDefinitions f
    INNER JOIN AffectedFlows af ON af.FlowDefinitionId = f.FlowDefinitionId
    OUTER APPLY (
        SELECT AVG(CAST(ProgressPercent AS DECIMAL(5,2))) AS AvgProgress
        FROM Flow.FlowSteps
        WHERE FlowDefinitionId = f.FlowDefinitionId
    ) s;
END;
```

## สิ่งที่ทำเพิ่มในรอบนี้ (Backend + Frontend)

- **Backend**: `backend/Models/Flow/*.cs` (5 Model ใหม่), เพิ่ม DbSet + OnModelCreating config ใน
  `AppDbContext.cs`, `backend/DTOs/FlowDtos.cs`, `IFlowService`/`FlowService`, `FlowController`
  (endpoint ที่ `api/Flow`), ลงทะเบียนใน `Program.cs`
- **Frontend**: เดิมหน้า `/dashboard/flow` และ `/dashboard/flow/[id]` ทั้งหมดเป็น Local Mock Array
  (`flowProjects` hardcode ในไฟล์ page.tsx) ไม่มีการเรียก API เลย — เปลี่ยนเป็นดึง/บันทึกข้อมูลจริงทั้งหมด:
  - `frontend/src/types/flow.ts`, `frontend/src/lib/flow-api.ts` — ใหม่
  - `app/dashboard/flow/page.tsx` — โหลดรายการจริง + ปุ่มสร้าง Flow ใหม่ (`flow-create-modal.tsx` ใหม่)
  - `app/dashboard/flow/[id]/page.tsx` — โหลดรายละเอียดจริงตาม `flowDefinitionId` จาก URL
  - `components/flow/flow-diagram-section.tsx` — เพิ่ม/ลบ/สลับสถานะ Step จริง (Flow.FlowSteps)
  - `components/flow/architecture-diagram-section.tsx` — เพิ่ม/ลบ Tech Stack Tag จริง (Flow.FlowTechStacks)
  - `components/flow/flow-gantt-qa-sections.tsx` — Gantt คำนวณจากวันที่ Step จริง +
    ประวัติการรัน Flow จริง (Flow.FlowExecutions/Flow.FlowLogs) แทน Placeholder เดิม

รายละเอียดไฟล์ที่แก้ไข/เพิ่มทั้งหมดของรอบนี้ ดูใน commit message ของ commit ที่ merge เข้า `main`
