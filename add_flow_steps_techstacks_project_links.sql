-- add_flow_steps_techstacks_project_links.sql
-- เพิ่มคอลัมน์ย้อนกลับ (Nullable FK, NO ACTION) ให้ Flow.FlowSteps/Flow.FlowTechStacks ผูกกับ
-- Project.Milestones/Project.TechStacks ต้นทาง เพื่อรองรับฟีเจอร์ Auto-Generate Flow จากข้อมูล Project จริง
-- รันผ่าน: sqlcmd -S "DESKTOP-TJ7525D\SQLEXPRESS" -U sa -P 1234 -C -d ProjectDevHub -i add_flow_steps_techstacks_project_links.sql

-- Flow.FlowSteps.MilestoneId
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('Flow.FlowSteps') AND name = 'MilestoneId'
)
BEGIN
    ALTER TABLE Flow.FlowSteps ADD MilestoneId INT NULL;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_FlowSteps_Milestone'
)
BEGIN
    ALTER TABLE Flow.FlowSteps
        ADD CONSTRAINT FK_FlowSteps_Milestone
        FOREIGN KEY (MilestoneId) REFERENCES Project.Milestones(MilestoneId)
        ON DELETE NO ACTION;
END
GO

-- Flow.FlowTechStacks.TechStackId
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('Flow.FlowTechStacks') AND name = 'TechStackId'
)
BEGIN
    ALTER TABLE Flow.FlowTechStacks ADD TechStackId INT NULL;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_FlowTechStacks_TechStack'
)
BEGIN
    ALTER TABLE Flow.FlowTechStacks
        ADD CONSTRAINT FK_FlowTechStacks_TechStack
        FOREIGN KEY (TechStackId) REFERENCES Project.TechStacks(TechStackId)
        ON DELETE NO ACTION;
END
GO

SELECT name FROM sys.columns WHERE object_id = OBJECT_ID('Flow.FlowSteps') ORDER BY column_id;
SELECT name FROM sys.columns WHERE object_id = OBJECT_ID('Flow.FlowTechStacks') ORDER BY column_id;
GO
