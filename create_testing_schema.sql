-- create_testing_schema.sql
-- สร้าง Schema ใหม่สำหรับ Tester Automation Module — เก็บผลการทดสอบของแต่ละโปรเจกต์ (Solo/Team)
-- Scope ตั้งใจให้ตรงกับ Data ที่ UI ปัจจุบันเก็บจริง (Suite + Run พร้อมสรุปจำนวนเคส) ไม่สร้างตาราง
-- TestCases/TestLogs แบบ Per-Case เพิ่ม เพราะ UI ยังไม่มีจุดกรอกข้อมูลระดับนั้น
-- รันผ่าน: sqlcmd -S "DESKTOP-TJ7525D\SQLEXPRESS" -U sa -P 1234 -C -d ProjectDevHub -i create_testing_schema.sql

IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'Testing')
BEGIN
    EXEC('CREATE SCHEMA Testing');
END
GO

-- Testing.TestSuites — ชุดทดสอบของแต่ละโปรเจกต์ (Solo/Team)
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE object_id = OBJECT_ID('Testing.TestSuites'))
BEGIN
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
END
GO

-- Testing.TestRuns — ผลของแต่ละรอบการรันเทสภายใต้ Suite หนึ่งๆ
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE object_id = OBJECT_ID('Testing.TestRuns'))
BEGIN
    CREATE TABLE Testing.TestRuns (
        TestRunId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        TestSuiteId INT NOT NULL,
        Tool VARCHAR(20) NOT NULL DEFAULT ('playwright'),         -- playwright, cypress, vitest, jest, robot
        Environment VARCHAR(10) NOT NULL DEFAULT ('DEV'),         -- DEV, SIT, UAT, PROD
        RunDate DATE NOT NULL,
        TotalCases INT NOT NULL DEFAULT (0),
        PassedCases INT NOT NULL DEFAULT (0),
        FailedCases INT NOT NULL DEFAULT (0),
        SkippedCases INT NOT NULL DEFAULT (0),
        DurationSeconds INT NOT NULL DEFAULT (0),
        Status VARCHAR(10) NOT NULL DEFAULT ('passed'),           -- passed, failed, partial, skipped
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
END
GO

SELECT s.name AS SchemaName, t.name AS TableName
FROM sys.tables t JOIN sys.schemas s ON t.schema_id = s.schema_id
WHERE s.name = 'Testing' ORDER BY t.name;
GO
