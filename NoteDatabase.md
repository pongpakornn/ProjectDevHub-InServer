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

# NoteDatabase — ProjectDevHub System Refactor: SystemList / Hard Delete + Audit / Flow 1:1 Binding (รอบนี้)

Database: `ProjectDevHub` (Server: `DESKTOP-TJ7525D\SQLEXPRESS`, ตรวจสอบและรันผ่าน `sqlcmd`)

## สรุปงานรอบนี้

รับสโคป 5 ข้อ: (1) อัปเดต Master Data `Core.SystemList`, (2) เปลี่ยน Delete ของ Projects/Solo/Team
เป็น Hard Delete พร้อม Audit Log ทุก CRUD, (3) ผูก Flow.FlowDefinitions 1:1 กับ Project.Projects
(ตัด "สร้าง Flow" แบบ Standalone ออก), (4) Present Section เพิ่ม CRUD ครบ + Flip Card แสดง
"ใครทำอะไร" + ปุ่ม ViewButtonV2 + Modal แบบ Fullscreen, (5) ตรวจ Build ทั้งสองฝั่งให้ผ่าน 100%

## SQL Script ที่รันในรอบนี้ (รันจริงแล้วผ่าน `sqlcmd -S "DESKTOP-TJ7525D\SQLEXPRESS" -U sa -P 1234 -C -d ProjectDevHub -i <ไฟล์>`)

### 1) `update_systemlist_data.sql` — อัปเดต Core.SystemList ให้ตรงสโคป

```sql
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
```

**ผลลัพธ์:** อัปเดต/สร้างครบทั้ง 3 แถว (SOLO/TEAM/FLOW) ยืนยันด้วย SELECT หลังรัน — ก่อนหน้านี้ไม่มี
Seed Data ของ SystemList ในโค้ดเลย (ไม่มี EF `HasData`, ไม่มี SQL Script เดิม) ค่าจึงต้องมาจากการรันสคริปต์นี้เท่านั้น

### 2) `add_flow_project_binding.sql` — เพิ่มคอลัมน์ ProjectId ผูก Flow.FlowDefinitions กับ Project.Projects

```sql
ALTER TABLE Flow.FlowDefinitions ADD ProjectId INT NULL;

ALTER TABLE Flow.FlowDefinitions
    ADD CONSTRAINT FK_FlowDefinitions_Project
    FOREIGN KEY (ProjectId) REFERENCES Project.Projects(ProjectId)
    ON DELETE CASCADE;

CREATE UNIQUE INDEX UQ_FlowDefinitions_ProjectId ON Flow.FlowDefinitions(ProjectId);
```

**ผลลัพธ์:** เพิ่มคอลัมน์ + FK (`ON DELETE CASCADE` — ลบ Project แล้ว Flow ที่ผูกอยู่ถูกลบตามอัตโนมัติ
ระดับ Database) + Unique Index (บังคับ 1 Project ผูกกับ Flow ได้แค่ 1 แถว, SQL Server อนุญาตให้มีหลายแถว
ที่ ProjectId เป็น NULL ได้แม้เป็น Unique Index) — ตรวจสอบผลด้วย `sys.columns`/`sys.foreign_keys` แล้ว
ทั้งสองสคริปต์ Idempotent (เช็ก `IF NOT EXISTS` ก่อนรันทุกขั้นตอน) รันซ้ำได้ปลอดภัย ไฟล์ทั้งสองอยู่ที่ root
ของ repo (`update_systemlist_data.sql`, `add_flow_project_binding.sql`)

## สิ่งที่ทำเพิ่มในรอบนี้ (Backend + Frontend)

- **Backend — SystemList**: ไม่มีการแก้ EF Model (Schema ตรงอยู่แล้ว) แก้เฉพาะข้อมูลผ่าน SQL Script ด้านบน

- **Backend — Hard Delete + AuditLog**:
  - เพิ่ม `Services/IAuditLogService.cs` + `AuditLogService.cs` (ใช้ `IHttpContextAccessor` ดึง IP ผู้เรียก
    เหมือน Pattern เดิมใน `AuthController`, `ComputerName` ใช้ `Environment.MachineName`) ลงทะเบียนใน
    `Program.cs` (`AddHttpContextAccessor()` + `AddScoped<IAuditLogService, AuditLogService>()`)
  - `ProjectSoloService`/`ProjectTeamService`: `DeleteProjectAsync` เปลี่ยน Signature เป็นรับ `currentUserId`
    ด้วย และเปลี่ยนจาก Soft Delete (`IsActive=false`) เป็น Hard Delete จริง (`_context.Projects.Remove`) —
    ก่อนลบจะ Manual Cleanup ตารางที่ไม่ได้ตั้ง Cascade ไว้ก่อน (`StatusHistory` ทั้งที่ผูก ProjectId/TaskId,
    `Events.LinkedProjectId`/`LinkedTaskId` set เป็น null) ส่วนตารางลูกที่ Cascade อยู่แล้วในเดิม
    (Members/Milestones/Tasks/TechStacks/ShowcaseItems/Comments/Attachments) และ `FlowDefinitions`
    (Cascade ใหม่จากข้อ 3) ถูกลบอัตโนมัติโดย Database
  - `CreateProjectAsync`/`UpdateProjectAsync`/`DeleteProjectAsync` ทั้ง Solo และ Team เรียก
    `_auditLogService.LogAsync(...)` บันทึก `Core.AuditLogs` ทุกครั้ง (`ActionType`: INSERT/UPDATE/DELETE,
    `SystemId`: "SOLO"/"TEAM", `LogRef`: ProjectId) — ขอบเขตบันทึกคือ CRUD ระดับ Project เท่านั้น
    (ไม่รวม Phase/Task/Stack/Showcase ย่อย เพราะ `LogRef` ออกแบบมาผูกกับ ProjectId เดียว)
  - `ProjectSoloController`/`ProjectTeamController`: Endpoint `DELETE` เพิ่ม `[FromQuery] int userId`
    (เดิมไม่มีการรับ userId ตอนลบเลย)
  - ทดสอบจริงผ่าน `sqlcmd`/`curl` กับ Database จริง: สร้าง Solo/Team Project ทดสอบ → ยืนยัน `AuditLogs`
    มีแถว INSERT → ลบผ่าน API → ยืนยัน `Projects`/`FlowDefinitions`/`ProjectMembers` เหลือ 0 แถวจริง
    (Hard Delete + Cascade ทำงานถูกต้อง) และ `AuditLogs` มีแถว DELETE เพิ่ม — ลบข้อมูลทดสอบออกหมดแล้ว

- **Backend — Flow 1:1 Binding**:
  - `Models/Flow/FlowDefinitions.cs`: เพิ่ม `ProjectId` (int?) + Navigation `Project`
  - `Data/AppDbContext.cs`: เพิ่ม FK Config `FlowDefinitions.Project` (`OnDelete(DeleteBehavior.Cascade)`)
    + Unique Index บน `ProjectId`
  - `ProjectSoloService`/`ProjectTeamService`: เพิ่ม `EnsureFlowDefinitionAsync(project, workType)` เรียก
    ทุกครั้งหลัง Create/Update Project — สร้าง Flow ใหม่ผูก ProjectId ถ้ายังไม่มี หรือ Sync
    Name/Description/Status/Dates/WorkType เข้า Flow เดิมถ้ามีอยู่แล้ว (ผู้ใช้กรอกข้อมูลที่หน้า Solo/Team
    เท่านั้น ฝั่ง Flow ไม่มีการกรอกข้อมูลระดับ Flow Definition เองอีกต่อไป)
  - `FlowService`: เพิ่ม `SyncFlowDefinitionsWithProjectsAsync()` เรียกใน `GetFlowsAsync`/`GetFlowDetailAsync`
    เป็น Fallback Backfill ให้ Project เก่าที่สร้างก่อนมีฟีเจอร์นี้ได้ Flow ผูกอัตโนมัติเมื่อเข้าหน้า Flow
    (คำนวณ Sequence ของ `FlowCode` ในหน่วยความจำระหว่าง Loop กันปัญหา `FlowCode` ซ้ำตอน Backfill หลาย
    Project พร้อมกันในรอบเดียว — เจอบั๊กนี้จริงตอนทดสอบกับข้อมูลเก่าในเครื่อง แก้แล้วและ Verify ซ้ำผ่าน)
  - `FlowController`/`FlowService`: Endpoint `POST /api/Flow` (Create แบบ Standalone) ยังอยู่ในโค้ด
    (ไม่ได้ลบ) แต่ไม่ถูกเรียกจาก UI แล้ว
  - ทดสอบจริง: สร้าง Project → ยืนยัน Flow ผูก ProjectId + WorkType ถูกต้องทันที, `GET /api/Flow`
    Backfill Flow ให้ Project เก่าที่ยังไม่มี Flow ได้ถูกต้อง, ลบ Project → Flow ที่ผูกอยู่หายไปด้วย (Cascade)

- **Backend — WorkItem (ShowcaseItem) Update**: เพิ่ม `UpdateWorkItemAsync` + `UpdateWorkItemRequest` DTO +
  Endpoint `PUT /ProjectSolo/showcases` และ `PUT /ProjectTeam/showcases` (เดิมมีแค่ Create/Delete —
  หน้า Frontend เคย "แก้ไข" ด้วยการ Delete แล้ว Create ใหม่ ตอนนี้เป็น Update จริงแล้ว) ทดสอบผ่าน `curl` แล้ว

- **Frontend — Flow**: ลบปุ่ม "สร้าง Flow ใหม่" + `flow-create-modal.tsx` (ไฟล์ถูกลบ) ออกจาก
  `app/dashboard/flow/page.tsx`, ลบ `createFlow`/`updateFlow`/Helper ที่ไม่ได้ใช้แล้วออกจาก
  `lib/flow-api.ts`, เพิ่ม `projectId` ใน `types/flow.ts`/`FlowDefinitionDto` เพื่อ Traceability

- **Frontend — Present Section (Solo/Team Detail Page)**:
  - เพิ่ม `components/projects/detail/work-item-flip-card.tsx` (ใหม่ — ดึง Flip Card ที่เคย Copy-Paste
    ซ้ำกันระหว่าง Solo/Team ออกมาเป็น Component เดียว) หน้าหลังของการ์ดเพิ่มส่วน "ใครทำอะไร (Who does
    what)" สรุปจาก Phase Owner + Task Assignees ของโปรเจกต์
  - เพิ่ม `components/projects/detail/work-item-preview-modal.tsx` (ใหม่ — Modal Preview ร่วม ขยายจาก
    `max-w-4xl`/`max-h-[70vh]` เดิมเป็น `max-w-[95vw]`/`max-h-[95vh]` แบบ Fullscreen/Max-Width)
  - `project-showcase-section.tsx` (Solo): แก้บั๊ก Delete เดิมที่ไม่เรียก Backend เลย (Mutate State
    ฝั่ง Frontend อย่างเดียว) ให้เรียก `deleteWorkItem` จริงแล้ว, ใช้ Component ร่วมด้านบนแทนโค้ดเดิม
  - `team-project-gallery-section.tsx` (Team): ปรับให้ใช้ Component ร่วมเดียวกับ Solo เช่นกัน
  - `solo/[id]/page.tsx`, `team/projects/[id]/page.tsx`: เปลี่ยน "แก้ไขผลงาน" จาก Delete-then-Create
    เป็นเรียก `updateWorkItem` ตรงๆ, ส่ง `phases` เข้า Showcase Section เพื่อคำนวณ "ใครทำอะไร", แก้บั๊ก
    Type Mismatch เดิมของ `handleUpdateProject` (Solo) ที่ทำให้ `npx tsc` ไม่ผ่านอยู่ก่อนแล้ว (ไม่เกี่ยวกับ
    งานรอบนี้โดยตรง แต่ต้องแก้เพื่อให้ Build ผ่าน 100% ตามที่ระบุไว้)
  - `solo-project-row.tsx`, `team-project-row.tsx`: เปลี่ยนปุ่ม View/Edit/Delete จาก V1
    (`components/ui/buttons/*`) เป็น V2 (`components/ui/buttons/buttonv2/*`) ทั้งหมด ให้ตรงกับที่ใช้ใน
    Showcase Section อยู่แล้ว, การ์ด Showcase เพิ่มปุ่ม `ViewButtonV2` (เปิด Preview Modal ที่รูปนั้นโดยตรง)
  - `lib/project-solo-api.ts`, `lib/project-team-api.ts`: `deleteProject` เพิ่มพารามิเตอร์ `currentUserId`
    (ผูกกับ Audit Log ฝั่ง Backend), เพิ่ม `updateWorkItem`

## การตรวจสอบ Build (ตามข้อ 5 ของสโคป)

- `dotnet build` (backend): **0 Warning(s), 0 Error(s)**
- `npx tsc --noEmit` (frontend): **ผ่าน ไม่มี Error**
- `npm run build` (frontend, Next.js production build): **Compiled successfully** ทุกหน้ารวมถึง
  `/dashboard/flow`, `/dashboard/solo/[id]`, `/dashboard/team/projects/[id]`

รายละเอียดไฟล์ที่แก้ไข/เพิ่มทั้งหมดของรอบนี้ ดูใน commit message ของ commit ที่ merge เข้า `main`
