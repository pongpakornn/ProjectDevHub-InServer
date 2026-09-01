# NoteDatabase — ProjectDevHub

เอกสารรวม Schema/Query ของฐานข้อมูล ProjectDevHub (SQL Server) ทั้งหมด ณ ปัจจุบัน รวมทั้ง Query ใหม่จากรอบงาน
"Flow auto-generate / Preview UI / DB cleanup / Dropdown master data / Reset ข้อมูล" ล่าสุด

> หมายเหตุ: ในโค้ดไม่พบไฟล์ `part1_*.sql` ถึง `part5_*.sql` หลงเหลืออยู่ในโปรเจกต์ (น่าจะรันตรงกับ DB ไปแล้วโดยไม่ได้
> เก็บไฟล์ไว้) ส่วน "Schema ปัจจุบัน" ด้านล่างจึงสร้างจากการอ่านโค้ดจริงใน `backend/Models/`, `backend/Planning/`
> และ `backend/Data/AppDbContext.cs` ล้วนๆ แทนการสรุปจากไฟล์ Part เดิม ไฟล์ SQL ที่มีอยู่จริงในโปรเจกต์ ณ ตอนนี้
> (embed เต็มไว้ด้านล่างข้อ 2) มี 6 ไฟล์: `add_flow_project_binding.sql`, `create_testing_schema.sql`,
> `update_systemlist_data.sql` (ของเดิม) และ `add_flow_steps_techstacks_project_links.sql`,
> `part6_cleanup_unused_tables.sql`, `part7_dropdown_master_tables.sql`, `reset_test_data.sql` (สร้างใหม่รอบนี้)

---

## 1. Schema ปัจจุบัน (สรุปย่อ ตาม Module)

### Core

| ตาราง | คอลัมน์หลัก | หมายเหตุ |
|---|---|---|
| `Core.Users` | UserId (PK), EmpId (unique), PasswordHash, FullName, DivisionName, DepartmentName, SectionName, UserLevel, IsSuperAdmin, IsSuspended, IsOnline, IsActive | **ห้ามลบ/Reset ตอนล้างข้อมูลทดสอบ** |
| `Core.Permissions` | PermissionId (PK), UserId → Users, SystemId → SystemList, CanView/Add/Edit/Delete/Approve/Reject | Unique (UserId, SystemId). **เก็บไว้เสมอ** |
| `Core.SystemList` | SystemId (PK, string), SystemName, Description, IsActive | Master รายชื่อโมดูล (SOLO/TEAM/FLOW) — `Permissions.SystemId` มี FK อ้างอิง จึง**เก็บไว้เสมอ** |
| `Core.AuditLogs` | LogId (PK, bigint), UserId?, SystemId, ActionType, LogDescription, LogRef, IpAddress, ComputerName, LogDate | มี Trigger `Trg_AutoCleanup_AuditLogs` |

### Project

| ตาราง | คอลัมน์หลัก | หมายเหตุ |
|---|---|---|
| `Project.Projects` | ProjectId (PK), ProjectCode (unique), ProjectName, Description, ProjectOwnerId, ProjectTypeId?, DivisionName, RequesterName, StartDate/EndDate/ActualEndDate, Status, Priority, ProgressPercent, Budget, IsActive, CreatedBy | |
| `Project.ProjectTypes` | ProjectTypeId (PK), TypeName, Description, IsActive, SortOrder | Master template (ใช้กับ `AutoGeneratePhasesAsync`) — **เก็บไว้เสมอ** |
| `Project.ProjectMembers` | ProjectMemberId (PK), ProjectId, UserId, RoleInProject (OWNER/MEMBER/APPROVER/VIEWER), JoinedDate, IsActive | Unique (ProjectId, UserId). Cascade เมื่อลบ Project. ใช้เป็นตัวคัดกรอง Solo (ไม่มีสมาชิก) vs Team (มีสมาชิก) |
| `Project.Milestones` | MilestoneId (PK), ProjectId, OwnerId?, MilestoneName, StartDate?, DueDate?, CompletedDate?, Status, SortOrder | Cascade เมื่อลบ Project |
| `Project.Tasks` | TaskId (PK), ProjectId, MilestoneId?, ParentTaskId?, TaskName, Description, Status, Priority, StartDate/DueDate/CompletedDate, ProgressPercent, EstimatedHours, CreatedBy | Trigger `Trg_UpdateProjectProgress`. Cascade เมื่อลบ Project, NoAction กับ Milestone/ParentTask |
| `Project.TaskAssignees` | TaskAssigneeId (PK), TaskId, UserId, AssignedDate | Unique (TaskId, UserId). Cascade เมื่อลบ Task |
| `Project.TechStacks` | TechStackId (PK), ProjectId, StackType, StackName, Version?, Layer (Frontend/Backend/Database/DevOps/Other), SortOrder | Cascade เมื่อลบ Project |
| `Project.ShowcaseItems` | ShowcaseItemId (PK), ProjectId, Title, Description?, FlowDescription?, ImageUrl?, SortOrder, CreatedBy | Cascade เมื่อลบ Project. คือ "ผลงาน/WorkItem" ที่ Solo/Team/Present ใช้ |
| `Project.Comments` | CommentId (PK, bigint), ProjectId?, TaskId?, UserId, CommentText | ต้องมี ProjectId หรือ TaskId อย่างน้อย 1 (CHECK). Cascade เฉพาะฝั่ง Project |
| `Project.Attachments` | AttachmentId (PK, bigint), ProjectId?, TaskId?, FileName, FilePath, FileSizeByte?, UploadedBy | ต้องมี ProjectId หรือ TaskId อย่างน้อย 1 (CHECK). Cascade เฉพาะฝั่ง Project |
| `Project.StatusHistory` | HistoryId (PK, bigint), ProjectId?, TaskId?, OldStatus?, NewStatus, ChangedBy, ChangedDate, Remark? | Audit log — เขียนทุกครั้งที่ Status เปลี่ยน (Solo/Team) แต่**ไม่มี Endpoint อ่านค่ากลับ** ปัจจุบัน ไม่ Cascade เลยเพื่อรักษาประวัติ |
| `Project.Departments` ★ใหม่ | DepartmentId (PK), DepartmentName, IsActive, SortOrder | Master dropdown "หน่วยงาน" — **เก็บไว้เสมอ** |
| `Project.TechStackCatalog` ★ใหม่ | CatalogId (PK), OptionGroup (TYPE/NAME/LAYER), OptionValue, IsActive, SortOrder | Master dropdown ประเภท/ชื่อ/Layer ของ Stack (3 Dropdown อิสระ ไม่ใช่ Combo เดียวกัน) — **เก็บไว้เสมอ** |

ตารางที่**ลบไปแล้ว**ในรอบนี้ (ดูเหตุผลในข้อ 3): `Project.TimeLogs`, `Project.Tags`, `Project.TaskTags`

### Planning

| ตาราง | คอลัมน์หลัก | หมายเหตุ |
|---|---|---|
| `Planning.Events` | EventId (PK), UserId, EventTitle, Description?, EventType, StartDateTime/EndDateTime, IsAllDay, Location?, ReminderMinutesBefore?, RecurrenceRule?, Status, LinkedProjectId?, LinkedTaskId? | CHECK EndDateTime ≥ StartDateTime. ยังไม่มี Controller ใช้งานจริง (มีแค่ Unlink ตอนลบ Project ใน ProjectSolo/TeamService) |
| `Planning.Todos` | TodoId (PK), UserId, TodoText, IsCompleted, CompletedDate?, DueDate?, Priority, SortOrder, LinkedEventId? | ยังไม่มี Controller ใช้งานจริงเช่นกัน |

### Flow

| ตาราง | คอลัมน์หลัก | หมายเหตุ |
|---|---|---|
| `Flow.FlowDefinitions` | FlowDefinitionId (PK), ProjectId? (unique — ผูก 1:1 กับ Project), FlowCode (unique), Name, Description?, Status, WorkType (SOLO/TEAM), StartDate/EndDate, ProgressPercent (auto จาก Trigger), CreatedBy | Cascade เมื่อลบ Project |
| `Flow.FlowSteps` | FlowStepId (PK), FlowDefinitionId, MilestoneId? ★ใหม่ (→ Project.Milestones, NoAction), StepNo, Title, Status (PENDING/IN_PROGRESS/DONE), ProgressPercent, StartDate/EndDate, SortOrder | Trigger `Trg_UpdateFlowProgress`. Cascade เมื่อลบ FlowDefinition |
| `Flow.FlowTechStacks` | FlowTechStackId (PK), FlowDefinitionId, TechStackId? ★ใหม่ (→ Project.TechStacks, NoAction), Layer (FRONTEND/BACKEND/DATABASE), Name, SortOrder | Cascade เมื่อลบ FlowDefinition |
| `Flow.FlowExecutions` | FlowExecutionId (PK), FlowDefinitionId, Status (RUNNING/SUCCESS/FAILED), StartedDate, FinishedDate?, TriggeredBy, Note? | Cascade เมื่อลบ FlowDefinition |
| `Flow.FlowLogs` | FlowLogId (PK, bigint), FlowExecutionId, LogLevel (INFO/WARN/ERROR), Message, LoggedDate | Cascade เมื่อลบ FlowExecution |

### Testing

| ตาราง | คอลัมน์หลัก | หมายเหตุ |
|---|---|---|
| `Testing.TestSuites` | TestSuiteId (PK), ProjectId, SuiteCode (unique), Name, CreatedBy, IsActive | Cascade เมื่อลบ Project |
| `Testing.TestRuns` | TestRunId (PK), TestSuiteId, Tool (playwright/cypress/vitest/jest/robot), Environment (DEV/SIT/UAT/PROD), RunDate, TotalCases/PassedCases/FailedCases/SkippedCases, DurationSeconds, Status (passed/failed/partial/skipped), ReportUrl?, Note?, TriggeredBy | Cascade เมื่อลบ TestSuite |

---

## 2. SQL Scripts ทั้งหมด (Full)

### 2.1 `add_flow_project_binding.sql` (เดิม — ผูก Flow 1:1 กับ Project)

```sql
-- add_flow_project_binding.sql
-- ผูก Flow.FlowDefinitions เข้ากับ Project.Projects แบบ 1:1 (Solo/Team) ตาม EF Model ใหม่
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('Flow.FlowDefinitions') AND name = 'ProjectId'
)
BEGIN
    ALTER TABLE Flow.FlowDefinitions ADD ProjectId INT NULL;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_FlowDefinitions_Project'
)
BEGIN
    ALTER TABLE Flow.FlowDefinitions
        ADD CONSTRAINT FK_FlowDefinitions_Project
        FOREIGN KEY (ProjectId) REFERENCES Project.Projects(ProjectId)
        ON DELETE CASCADE;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes WHERE name = 'UQ_FlowDefinitions_ProjectId' AND object_id = OBJECT_ID('Flow.FlowDefinitions')
)
BEGIN
    CREATE UNIQUE INDEX UQ_FlowDefinitions_ProjectId ON Flow.FlowDefinitions(ProjectId);
END
GO
```

### 2.2 `create_testing_schema.sql` (เดิม — สร้าง Schema Testing)

```sql
-- create_testing_schema.sql
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'Testing')
BEGIN
    EXEC('CREATE SCHEMA Testing');
END
GO

CREATE TABLE Testing.TestSuites (
    TestSuiteId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    ProjectId INT NOT NULL,
    SuiteCode VARCHAR(30) NOT NULL,
    Name NVARCHAR(255) NOT NULL,
    CreatedBy INT NOT NULL,
    IsActive BIT NOT NULL DEFAULT (1),
    CreatedDate DATETIMEOFFSET NOT NULL DEFAULT (SYSDATETIMEOFFSET()),
    UpdatedDate DATETIMEOFFSET NULL,
    CONSTRAINT UQ_TestSuites_SuiteCode UNIQUE (SuiteCode),
    CONSTRAINT FK_TestSuites_Project FOREIGN KEY (ProjectId) REFERENCES Project.Projects(ProjectId) ON DELETE CASCADE,
    CONSTRAINT FK_TestSuites_Creator FOREIGN KEY (CreatedBy) REFERENCES Core.Users(UserId)
);
GO

CREATE TABLE Testing.TestRuns (
    TestRunId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    TestSuiteId INT NOT NULL,
    Tool VARCHAR(20) NOT NULL DEFAULT ('playwright'),
    Environment VARCHAR(10) NOT NULL DEFAULT ('DEV'),
    RunDate DATE NOT NULL,
    TotalCases INT NOT NULL DEFAULT (0),
    PassedCases INT NOT NULL DEFAULT (0),
    FailedCases INT NOT NULL DEFAULT (0),
    SkippedCases INT NOT NULL DEFAULT (0),
    DurationSeconds INT NOT NULL DEFAULT (0),
    Status VARCHAR(10) NOT NULL DEFAULT ('passed'),
    ReportUrl NVARCHAR(500) NULL,
    Note NVARCHAR(500) NULL,
    TriggeredBy INT NOT NULL,
    CreatedDate DATETIMEOFFSET NOT NULL DEFAULT (SYSDATETIMEOFFSET()),
    CONSTRAINT FK_TestRuns_Suite FOREIGN KEY (TestSuiteId) REFERENCES Testing.TestSuites(TestSuiteId) ON DELETE CASCADE,
    CONSTRAINT FK_TestRuns_TriggeredBy FOREIGN KEY (TriggeredBy) REFERENCES Core.Users(UserId),
    CONSTRAINT CK_TestRuns_Tool CHECK (Tool IN ('playwright','cypress','vitest','jest','robot')),
    CONSTRAINT CK_TestRuns_Environment CHECK (Environment IN ('DEV','SIT','UAT','PROD')),
    CONSTRAINT CK_TestRuns_Status CHECK (Status IN ('passed','failed','partial','skipped'))
);
GO
```

### 2.3 `update_systemlist_data.sql` (เดิม — Seed Core.SystemList)

```sql
-- update_systemlist_data.sql
MERGE Core.SystemList AS target
USING (VALUES
    ('SOLO', N'Project Solo Management', N'ระบบบริหารจัดการโปรเจกต์เดี่ยว'),
    ('TEAM', N'Project Team Management', N'ระบบบริหารจัดการโปรเจกต์ทีม'),
    ('FLOW', N'Project Flow Architecture', N'ระบบออกแบบและติดตามผังการทำงานของโปรเจกต์')
) AS source (SystemId, SystemName, Description)
ON target.SystemId = source.SystemId
WHEN MATCHED THEN
    UPDATE SET target.SystemName = source.SystemName, target.Description = source.Description
WHEN NOT MATCHED BY TARGET THEN
    INSERT (SystemId, SystemName, Description, IsActive, CreatedDate)
    VALUES (source.SystemId, source.SystemName, source.Description, 1, SYSDATETIMEOFFSET());
GO
```

### 2.4 `add_flow_steps_techstacks_project_links.sql` ★ใหม่ (Flow auto-generate — ข้อ 1)

```sql
-- add_flow_steps_techstacks_project_links.sql
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Flow.FlowSteps') AND name = 'MilestoneId')
BEGIN
    ALTER TABLE Flow.FlowSteps ADD MilestoneId INT NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_FlowSteps_Milestone')
BEGIN
    ALTER TABLE Flow.FlowSteps
        ADD CONSTRAINT FK_FlowSteps_Milestone
        FOREIGN KEY (MilestoneId) REFERENCES Project.Milestones(MilestoneId)
        ON DELETE NO ACTION;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Flow.FlowTechStacks') AND name = 'TechStackId')
BEGIN
    ALTER TABLE Flow.FlowTechStacks ADD TechStackId INT NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_FlowTechStacks_TechStack')
BEGIN
    ALTER TABLE Flow.FlowTechStacks
        ADD CONSTRAINT FK_FlowTechStacks_TechStack
        FOREIGN KEY (TechStackId) REFERENCES Project.TechStacks(TechStackId)
        ON DELETE NO ACTION;
END
GO
```

### 2.5 `part6_cleanup_unused_tables.sql` ★ใหม่ (ลบตารางที่ไม่ได้ใช้ — ข้อ 4)

```sql
-- part6_cleanup_unused_tables.sql
IF OBJECT_ID('Project.TaskTags', 'U') IS NOT NULL
    DROP TABLE Project.TaskTags;
GO

IF OBJECT_ID('Project.Tags', 'U') IS NOT NULL
    DROP TABLE Project.Tags;
GO

IF OBJECT_ID('Project.TimeLogs', 'U') IS NOT NULL
    DROP TABLE Project.TimeLogs;
GO
```

### 2.6 `part7_dropdown_master_tables.sql` ★ใหม่ (Dropdown Master Data — ข้อ 5)

```sql
-- part7_dropdown_master_tables.sql
CREATE TABLE Project.Departments (
    DepartmentId INT IDENTITY(1,1) PRIMARY KEY,
    DepartmentName NVARCHAR(100) NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    SortOrder INT NOT NULL DEFAULT 0,
    CreatedDate DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
);
GO

INSERT INTO Project.Departments (DepartmentName, SortOrder) VALUES
    (N'ระบบดิจิตอลและIT', 1),
    (N'ฝ่ายซ่อมบำรุง', 2),
    (N'ฝ่ายคลังสินค้าและจัดส่ง', 3),
    (N'ฝ่ายทรัพยากรบุคคล', 4);
GO

CREATE TABLE Project.TechStackCatalog (
    CatalogId INT IDENTITY(1,1) PRIMARY KEY,
    OptionGroup NVARCHAR(20) NOT NULL, -- TYPE, NAME, LAYER
    OptionValue NVARCHAR(100) NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    SortOrder INT NOT NULL DEFAULT 0,
    CreatedDate DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
);
GO

INSERT INTO Project.TechStackCatalog (OptionGroup, OptionValue, SortOrder) VALUES
    (N'TYPE', N'ภาษา (Language)', 1), (N'TYPE', N'Framework', 2),
    (N'TYPE', N'Library / Package', 3), (N'TYPE', N'Database', 4),
    (N'NAME', N'Next.js', 1), (N'NAME', N'React', 2), (N'NAME', N'TypeScript', 3),
    (N'NAME', N'ASP.NET Core', 4), (N'NAME', N'SQL Server', 5), (N'NAME', N'Tailwind CSS', 6),
    (N'NAME', N'Zustand', 7), (N'NAME', N'Docker', 8),
    (N'LAYER', N'Frontend', 1), (N'LAYER', N'Backend', 2), (N'LAYER', N'Database', 3), (N'LAYER', N'DevOps', 4);
GO
```

### 2.7 `reset_test_data.sql` ★ใหม่ (Reset ข้อมูลทดสอบ — ข้อ 7, **รันจริงแล้ว**)

```sql
-- reset_test_data.sql
DELETE FROM Flow.FlowLogs;
DELETE FROM Flow.FlowExecutions;
DELETE FROM Flow.FlowSteps;
DELETE FROM Flow.FlowTechStacks;
DELETE FROM Flow.FlowDefinitions;

DELETE FROM Testing.TestRuns;
DELETE FROM Testing.TestSuites;

DELETE FROM Planning.Todos;
DELETE FROM Planning.Events;

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

DELETE FROM Core.AuditLogs;
GO

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
```

Schema ที่**ไม่แตะ**: `Core.Users`, `Core.Permissions`, `Core.SystemList`, `Project.ProjectTypes`,
`Project.Departments`, `Project.TechStackCatalog` (Users ตามคำสั่งเดิม ส่วนอีก 5 ตารางเป็น Master/Lookup
Data ไม่ใช่ข้อมูลทดสอบ — ถ้าล้างไปด้วยจะทำ Dropdown ในระบบว่างและ `Permissions.SystemId` จะพังเพราะมี FK
อ้างอิง `SystemList` อยู่)

---

## 3. ตารางที่ถูกลบในรอบนี้

| ตาราง | เหตุผล |
|---|---|
| `Project.TimeLogs` | ไม่มี Controller/Service/Frontend เรียกใช้เลยแม้แต่จุดเดียว (มีแค่ Model + DbSet + Fluent Config ค้างอยู่) |
| `Project.Tags` | ไม่มี Controller/Service/Frontend เรียกใช้เลยแม้แต่จุดเดียว |
| `Project.TaskTags` | ตารางเชื่อม Task↔Tag ที่ไม่มีจุดใช้งานจริงเช่นกัน (Tags เองก็ไม่ได้ใช้) |

ตารางที่**พิจารณาแล้วแต่ไม่ลบ**: `Project.StatusHistory` (มีการเขียนทุกครั้งที่ Status เปลี่ยน แม้ยังไม่มี
Endpoint อ่านค่ากลับ — เก็บไว้เผื่อทำหน้า History ในอนาคต), `Project.Comments`/`Project.Attachments`
(ใช้งานจริงในโมดูล Team), `Planning.Events`/`Planning.Todos` (ยังไม่มี Controller แต่ไม่ใช่ Dead Code — เป็นฟีเจอร์ที่ยังไม่ได้สร้าง UI ให้).

---

## 4. Team Module — DB Integration (ย้ายมาจาก backend/TEAM_DB_QUERIES.md เดิม)

สรุปสิ่งที่ตรวจพบและแก้ไขในรอบ Audit ก่อนหน้า เพื่อให้โมดูล **Team** เชื่อมต่อฐานข้อมูลจริงสมบูรณ์
เทียบเท่ากับโมดูล **Solo** ที่เชื่อมต่อ SQL Server ไปแล้ว (commit `03f24af9`)

### 4.1 สิ่งที่ตรวจพบก่อนแก้ไข (Audit)

- **Backend**: ไม่มี `ProjectTeamController` / `IProjectTeamService` / `ProjectTeamService` อยู่เลย — มีแค่ฝั่ง Solo
  (`ProjectSoloController` / `ProjectSoloService`) เท่านั้น
- **Frontend**: ทุกหน้าและทุก component ของ Team (`/dashboard/team`, `/dashboard/team/projects/[id]`
  และ component ย่อยทั้งหมดใน `components/projects/detail/team/*`) เป็น **Local State / Mock Data ล้วน**
  ไม่มีการเรียก `fetch`/API ไปที่ Backend เลยสักจุดเดียว (ไม่มี `project-team-api.ts` มาก่อน)
- จุดที่ยังใช้ `projectInfo.owner.split(",")` เพื่อแตกชื่อสมาชิกทีมจาก String เดียว —
  พบใน `team-project-form-modal.tsx` และ `team-project-overview.tsx` (ตอนนี้แก้เป็นดึงจาก
  `Project.ProjectMembers` จริงแล้ว)
- ตาราง `Project.ProjectMembers` และ `Project.TaskAssignees` มีอยู่ใน DB และผูกใน `AppDbContext`
  เรียบร้อยอยู่แล้ว แต่ไม่เคยถูกใช้งานจริงจากทั้ง Solo และ Team (Solo สร้างโปรเจกต์แล้วไม่เคยเติมแถวใน
  `ProjectMembers` เลย) — จึงใช้จุดนี้เป็นตัวคัดกรองว่าโปรเจกต์ไหนเป็น "Team" (ดูข้อ 4.2)

สิ่งที่เชื่อมต่อ DB จริงเรียบร้อยแล้วและ **คงไว้ไม่แตะ**: โมดูล Solo ทั้งหมด (`ProjectSoloController`,
`ProjectSoloService`, `project-solo-api.ts`, หน้า `/dashboard/solo/*`) และ Master Data (`ProjectTypes`,
`Users`) ที่ Team เรียกใช้ร่วมกันผ่าน re-export จาก `project-solo-api.ts`

### 4.2 Backend ที่เพิ่มใหม่ (รอบ Team)

| ไฟล์ | หน้าที่ |
|---|---|
| `backend/DTOs/ProjectTeamDtos.cs` | DTO เฉพาะ Team (`TeamProjectDto`, `ProjectMemberDto`, `TaskAssigneeDto`, ฯลฯ) — ส่วนที่ schema ตรงกับ Solo (Phase/Task/Stack/Showcase request) reuse จาก `ProjectSoloDtos.cs` ไม่สร้างซ้ำ |
| `backend/Services/IProjectTeamService.cs` / `ProjectTeamService.cs` | Business logic ทั้งหมดของ Team |
| `backend/Controllers/ProjectTeamController.cs` | REST endpoints ที่ `api/ProjectTeam` |
| `backend/Program.cs` | เพิ่ม `builder.Services.AddScoped<IProjectTeamService, ProjectTeamService>();` |

#### Endpoints ที่เพิ่ม

```
GET    /api/ProjectTeam                              รายการโปรเจกต์ทีม (มีสมาชิกใน ProjectMembers)
GET    /api/ProjectTeam/{id}                          รายละเอียดโปรเจกต์ + Phase/Task/Stack/Showcase/Members
POST   /api/ProjectTeam?userId=                       สร้างโปรเจกต์ทีม (แนบ MemberUserIds ตอนสร้าง)
PUT    /api/ProjectTeam?userId=                        แก้ไขข้อมูลหลักของโปรเจกต์
DELETE /api/ProjectTeam/{id}                           ลบโปรเจกต์ (Soft Delete)

GET    /api/ProjectTeam/{id}/members                   ดึงสมาชิกทีม (Join Core.Users)
POST   /api/ProjectTeam/{id}/members                   เพิ่มสมาชิกทีม พร้อมกำหนด RoleInProject
DELETE /api/ProjectTeam/{id}/members/{userId}          ลบสมาชิกออกจากทีม (Soft Delete)

POST   /api/ProjectTeam/{id}/tasks/{taskId}/assignees  Sync ผู้รับผิดชอบงาน (Project.TaskAssignees)

POST/PUT/DELETE /api/ProjectTeam/phases[...]            Phase (Milestone) — เหมือน Solo ทุกประการ
POST/PUT/DELETE /api/ProjectTeam/tasks[...]              TaskItem (Task) — เหมือน Solo ทุกประการ
POST   /api/ProjectTeam/{id}/phases/auto-generate       Auto-generate Phase ตาม ProjectType
POST/DELETE /api/ProjectTeam/stacks[...]                 TechStack
POST/DELETE /api/ProjectTeam/showcases[...]              ShowcaseItem
```

#### LINQ ที่ใช้อ้างอิง

**คัดกรองโปรเจกต์ทีม** (มีสมาชิกใน `ProjectMembers` จริง ต่างจาก Solo ที่ไม่มี):

```csharp
await _context.Projects
    .Where(p => p.IsActive && p.Members.Any())
    .Include(p => p.ProjectType)
    .Include(p => p.Owner)
    .Include(p => p.Members).ThenInclude(m => m.User)
    .OrderByDescending(p => p.CreatedDate)
    .ToListAsync();
```

**สร้างโปรเจกต์ทีม + เติม ProjectMembers** (Owner = role `OWNER`, ที่เหลือ = role `MEMBER`):

```csharp
_context.ProjectMembers.Add(new ProjectMembers
{
    ProjectId = project.ProjectId,
    UserId = request.ProjectOwnerId,
    RoleInProject = "OWNER"
});
foreach (var userId in request.MemberUserIds.Where(id => id != request.ProjectOwnerId).Distinct())
{
    _context.ProjectMembers.Add(new ProjectMembers
    {
        ProjectId = project.ProjectId,
        UserId = userId,
        RoleInProject = "MEMBER"
    });
}
```

**เพิ่มสมาชิกกลับเข้าทีม** (กัน Unique Constraint `(ProjectId, UserId)` — ถ้าเคยถูกลบออกมาก่อน ให้
Reactivate แถวเดิมแทนการ Insert ซ้ำ):

```csharp
var existing = await _context.ProjectMembers
    .FirstOrDefaultAsync(pm => pm.ProjectId == projectId && pm.UserId == request.UserId);
if (existing != null)
{
    existing.IsActive = true;
    existing.RoleInProject = request.RoleInProject;
    existing.JoinedDate = DateTimeOffset.UtcNow;
}
else
{
    _context.ProjectMembers.Add(new ProjectMembers { ProjectId = projectId, UserId = request.UserId, RoleInProject = request.RoleInProject });
}
```

**Sync ผู้รับผิดชอบงาน** (Replace-set — ส่ง `UserIds` ทั้งชุดมา แล้ว Backend Diff เอง):

```csharp
var current = await _context.TaskAssignees.Where(ta => ta.TaskId == taskId).ToListAsync();
var toRemove = current.Where(ta => !requestedIds.Contains(ta.UserId));
var toAdd = requestedIds.Where(id => !current.Select(ta => ta.UserId).Contains(id))
    .Select(id => new TaskAssignees { TaskId = taskId, UserId = id });
_context.TaskAssignees.RemoveRange(toRemove);
_context.TaskAssignees.AddRange(toAdd);
```

**ดึง Assignees ของทุก Task ในโปรเจกต์แบบ Batch** (กัน N+1 Query ตอนโหลดหน้า Detail):

```csharp
var assigneesByTask = await _context.TaskAssignees
    .Where(ta => taskIds.Contains(ta.TaskId))
    .Include(ta => ta.User)
    .ToListAsync();
var lookup = assigneesByTask.GroupBy(ta => ta.TaskId).ToDictionary(g => g.Key, g => g.ToList());
```

### 4.3 Frontend ที่แก้ไข/เพิ่มใหม่ (รอบ Team)

| ไฟล์ | การเปลี่ยนแปลง |
|---|---|
| `frontend/src/lib/project-team-api.ts` | **ใหม่** — เรียก `api/ProjectTeam/*` จริงทั้งหมด, re-export `getProjectTypes/getUsers/uploadShowcaseImage` จาก `project-solo-api.ts` (Master Data ใช้ร่วมกัน) |
| `frontend/src/types/project.ts` | เพิ่ม `ProjectMember`, `TeamProject`, `TeamProjectDetail` |
| `frontend/src/types/project-detail.ts` | เพิ่ม `TaskAssignee`, เพิ่ม `assignees?: TaskAssignee[]` ใน `TaskItem` (optional — Solo ไม่กระทบ) |
| `app/dashboard/team/page.tsx` | โหลด/สร้าง/แก้/ลบโปรเจกต์จริงผ่าน API (เดิมเป็น `initialTeamProjects` Mock ล้วน) |
| `app/dashboard/team/projects/[id]/page.tsx` | โหลดรายละเอียดจริงตาม `projectId` จาก URL (เดิม Hardcode `ERP Integration Hub` ไม่สนใจ `id` เลย) |
| `components/projects/team-project-form-modal.tsx` | ใช้ `getProjectTypes()/getUsers()` จริงแทน Dropdown Hardcode, เลือกสมาชิกทีมจาก User จริงแทนพิมพ์ชื่อเอง |
| `components/projects/detail/team/team-project-overview.tsx` | อ่านสมาชิกทีมจาก `projectInfo.members` (ProjectMembers จริง) แทน `owner.split(",")` |
| `components/projects/detail/team/team-project-members-panel.tsx` | **ใหม่** — แผงเพิ่ม/ลบสมาชิกทีมโดยตรง (Dropdown จาก `getUsers()`) |
| `components/projects/detail/team/team-project-phase-table.tsx` | ต่อ Create/Update/Delete Phase และ Task เข้า Backend จริง (เดิม Local State ล้วน) + เพิ่ม UI มอบหมายผู้รับผิดชอบต่อ Task (`Project.TaskAssignees`) |
| `components/projects/detail/team/team-project-stack-section.tsx` | ต่อ Create/Delete TechStack เข้า Backend จริง (รอบนี้แก้เพิ่ม — ดึง Dropdown จาก `Project.TechStackCatalog` แทน Hardcode) |
| `components/projects/detail/team/team-project-gallery-section.tsx`, `team-add-work-modal.tsx` | ต่อ Create/Delete ShowcaseItem + อัปโหลดรูปจริงผ่าน `/Upload/showcase-image` (รอบนี้แก้เพิ่ม — ปุ่ม Preview เปลี่ยนเป็น ViewButtonV2) |
| `components/projects/detail/team/team-project-gantt-timeline.tsx` | import `Phase` จาก `types/project-detail.ts` กลาง แทน import จากไฟล์ phase-table |

#### รวม Types ที่ซ้ำซ้อน

ก่อนแก้ไข ไฟล์ `team-project-phase-table.tsx`, `team-project-stack-section.tsx`,
`team-project-gallery-section.tsx` ต่างประกาศ `Phase`/`TaskItem`/`StackItem`/`WorkItem` ของตัวเอง
ซ้ำกับ `frontend/src/types/project-detail.ts` ที่ Solo ใช้อยู่แล้ว — ตอนนี้ทุกไฟล์ import จาก
`@/types/project-detail` กลางไฟล์เดียว ไม่มีการประกาศซ้ำอีกต่อไป
