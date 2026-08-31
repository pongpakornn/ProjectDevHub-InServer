-- add_flow_project_binding.sql
-- ผูก Flow.FlowDefinitions เข้ากับ Project.Projects แบบ 1:1 (Solo/Team) ตาม EF Model ใหม่
-- รันผ่าน: sqlcmd -S "DESKTOP-TJ7525D\SQLEXPRESS" -U sa -P 1234 -C -d ProjectDevHub -i add_flow_project_binding.sql

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
    -- SQL Server อนุญาตให้มีหลายแถวที่ ProjectId เป็น NULL ได้แม้จะเป็น UNIQUE INDEX (NULL ไม่ถือว่าซ้ำกัน)
    CREATE UNIQUE INDEX UQ_FlowDefinitions_ProjectId ON Flow.FlowDefinitions(ProjectId);
END
GO

SELECT name FROM sys.columns WHERE object_id = OBJECT_ID('Flow.FlowDefinitions') ORDER BY column_id;
GO
