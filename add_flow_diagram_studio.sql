-- ===========================================================================
-- Workflow Diagram Studio — พอร์ตระบบ Flow มาจาก AutoFlowStudio_ModulesD
-- เพิ่ม Meta (SystemType/ModuleList/DfdLevel) ให้ Flow.FlowDefinitions + ตารางใหม่ Flow.FlowDiagramRows
-- Idempotent: รันซ้ำได้ปลอดภัย ไม่ลบ/แตะตาราง Flow เดิม (FlowSteps/FlowTechStacks/FlowExecutions/FlowLogs)
-- ===========================================================================

USE ProjectDevHub;
GO

-- 1) เพิ่มคอลัมน์ Meta ลง Flow.FlowDefinitions
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Flow.FlowDefinitions') AND name = 'SystemType')
BEGIN
    ALTER TABLE Flow.FlowDefinitions ADD SystemType NVARCHAR(255) NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Flow.FlowDefinitions') AND name = 'ModuleList')
BEGIN
    ALTER TABLE Flow.FlowDefinitions ADD ModuleList NVARCHAR(500) NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Flow.FlowDefinitions') AND name = 'DfdLevel')
BEGIN
    ALTER TABLE Flow.FlowDefinitions ADD DfdLevel VARCHAR(10) NOT NULL CONSTRAINT DF_FlowDefinitions_DfdLevel DEFAULT ('level0');
END
GO

-- 2) ตารางใหม่ Flow.FlowDiagramRows — แถวข้อมูลของไดอะแกรมทั้ง 6 ประเภทต่อ 1 Flow
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE schema_id = SCHEMA_ID('Flow') AND name = 'FlowDiagramRows')
BEGIN
    CREATE TABLE Flow.FlowDiagramRows (
        FlowDiagramRowId INT IDENTITY(1,1) NOT NULL,
        FlowDefinitionId INT NOT NULL,
        DiagramType VARCHAR(20) NOT NULL,  -- FLOWCHART, USECASE, DFD, SEQUENCE, ERD, STATE
        StepNo NVARCHAR(20) NULL,
        Actor NVARCHAR(200) NULL,
        Action NVARCHAR(500) NULL,
        DataField NVARCHAR(300) NULL,
        Decision NVARCHAR(300) NULL,
        NextStep NVARCHAR(100) NULL,
        OptionValue NVARCHAR(100) NULL,
        SortOrder INT NOT NULL DEFAULT (0),
        CreatedDate DATETIMEOFFSET NOT NULL DEFAULT (SYSDATETIMEOFFSET()),
        CONSTRAINT PK_FlowDiagramRows PRIMARY KEY CLUSTERED (FlowDiagramRowId),
        CONSTRAINT FK_FlowDiagramRows_FlowDefinition FOREIGN KEY (FlowDefinitionId)
            REFERENCES Flow.FlowDefinitions(FlowDefinitionId) ON DELETE CASCADE,
        CONSTRAINT CK_FlowDiagramRows_DiagramType CHECK (DiagramType IN ('FLOWCHART','USECASE','DFD','SEQUENCE','ERD','STATE'))
    );

    CREATE INDEX IX_FlowDiagramRows_Flow_Type_Sort
        ON Flow.FlowDiagramRows (FlowDefinitionId, DiagramType, SortOrder);
END
GO

-- 3) ตรวจผลลัพธ์
SELECT
    (SELECT COUNT(*) FROM sys.columns WHERE object_id = OBJECT_ID('Flow.FlowDefinitions') AND name IN ('SystemType','ModuleList','DfdLevel')) AS NewColumnsOnFlowDefinitions,
    (SELECT COUNT(*) FROM sys.tables WHERE schema_id = SCHEMA_ID('Flow') AND name = 'FlowDiagramRows') AS FlowDiagramRowsTableExists;
GO
