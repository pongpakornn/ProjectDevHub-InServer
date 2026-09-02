-- =============================================================================
-- add_techstack_catalog_typeid.sql
-- Adds Project.TechStackCatalog.TypeId (self-referencing FK: NAME row -> TYPE row)
-- and backfills it for every existing NAME row. Idempotent — safe to re-run.
--
-- ⚠ Run with UTF-8 codepage explicitly (this script compares/inserts Thai text):
--   sqlcmd -S "DESKTOP-TJ7525D\SQLEXPRESS" -U sa -P 1234 -C -d ProjectDevHub -f 65001 -i add_techstack_catalog_typeid.sql
-- =============================================================================

-- 1) Schema: add the column + self-referencing FK
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Project.TechStackCatalog') AND name = 'TypeId')
BEGIN
    ALTER TABLE Project.TechStackCatalog ADD TypeId INT NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_TechStackCatalog_Type')
BEGIN
    ALTER TABLE Project.TechStackCatalog
        ADD CONSTRAINT FK_TechStackCatalog_Type FOREIGN KEY (TypeId) REFERENCES Project.TechStackCatalog(CatalogId);
END
GO

-- 2) New TYPE row for Docker (confirmed with user: no existing Type category fit it)
IF NOT EXISTS (SELECT 1 FROM Project.TechStackCatalog WHERE OptionGroup = 'TYPE' AND OptionValue = N'DevOps / Infra Tool')
BEGIN
    INSERT INTO Project.TechStackCatalog (OptionGroup, OptionValue, IsActive, SortOrder)
    VALUES ('TYPE', N'DevOps / Infra Tool', 1, 9);
END
GO

-- 3) Data migration: match every existing NAME row to its TYPE (reviewed/confirmed with user first)
DECLARE @Language  INT = (SELECT CatalogId FROM Project.TechStackCatalog WHERE OptionGroup='TYPE' AND OptionValue = N'ภาษา (Language)');
DECLARE @Framework INT = (SELECT CatalogId FROM Project.TechStackCatalog WHERE OptionGroup='TYPE' AND OptionValue = N'Framework');
DECLARE @Library   INT = (SELECT CatalogId FROM Project.TechStackCatalog WHERE OptionGroup='TYPE' AND OptionValue = N'Library / Package');
DECLARE @Database  INT = (SELECT CatalogId FROM Project.TechStackCatalog WHERE OptionGroup='TYPE' AND OptionValue = N'Database');
DECLARE @AI        INT = (SELECT CatalogId FROM Project.TechStackCatalog WHERE OptionGroup='TYPE' AND OptionValue = N'AI / LLM Tool');
DECLARE @UIUX      INT = (SELECT CatalogId FROM Project.TechStackCatalog WHERE OptionGroup='TYPE' AND OptionValue = N'UI/UX & Design Tool');
DECLARE @Testing   INT = (SELECT CatalogId FROM Project.TechStackCatalog WHERE OptionGroup='TYPE' AND OptionValue = N'Testing & QA');
DECLARE @API       INT = (SELECT CatalogId FROM Project.TechStackCatalog WHERE OptionGroup='TYPE' AND OptionValue = N'API & Communication Protocol');
DECLARE @RPA       INT = (SELECT CatalogId FROM Project.TechStackCatalog WHERE OptionGroup='TYPE' AND OptionValue = N'RPA / Automation');
DECLARE @DevOps    INT = (SELECT CatalogId FROM Project.TechStackCatalog WHERE OptionGroup='TYPE' AND OptionValue = N'DevOps / Infra Tool');

UPDATE Project.TechStackCatalog SET TypeId = @Language  WHERE OptionGroup='NAME' AND OptionValue IN (N'TypeScript', N'Python', N'HTML5', N'CSS3', N'JavaScript', N'C#', N'C++', N'C', N'Java');
UPDATE Project.TechStackCatalog SET TypeId = @Framework WHERE OptionGroup='NAME' AND OptionValue IN (N'Next.js', N'React.js', N'ASP.NET Core', N'WPF', N'Node.js', N'MVVM Architecture');
UPDATE Project.TechStackCatalog SET TypeId = @Library   WHERE OptionGroup='NAME' AND OptionValue IN (N'Tailwind CSS', N'Zustand', N'PostCSS');
UPDATE Project.TechStackCatalog SET TypeId = @Database  WHERE OptionGroup='NAME' AND OptionValue IN (N'SQL Server', N'MongoDB', N'PostgreSQL');
UPDATE Project.TechStackCatalog SET TypeId = @AI        WHERE OptionGroup='NAME' AND OptionValue IN (N'Lovable', N'v0 by Vercel', N'Gemini', N'Claude Code', N'Anti-gravity', N'ChatGPT');
UPDATE Project.TechStackCatalog SET TypeId = @UIUX      WHERE OptionGroup='NAME' AND OptionValue IN (N'Figma', N'Uiverse');
UPDATE Project.TechStackCatalog SET TypeId = @Testing   WHERE OptionGroup='NAME' AND OptionValue IN (N'Test Automation', N'ESLint');
UPDATE Project.TechStackCatalog SET TypeId = @API       WHERE OptionGroup='NAME' AND OptionValue IN (N'REST API', N'WebSocket', N'SignalR');
UPDATE Project.TechStackCatalog SET TypeId = @RPA       WHERE OptionGroup='NAME' AND OptionValue IN (N'WinActor');
UPDATE Project.TechStackCatalog SET TypeId = @DevOps    WHERE OptionGroup='NAME' AND OptionValue IN (N'Docker');
GO

-- 4) Verification: any NAME rows still unmapped? (should return 0 rows)
SELECT CatalogId, OptionValue AS UnmappedName FROM Project.TechStackCatalog WHERE OptionGroup = 'NAME' AND TypeId IS NULL;
GO
