-- part7_dropdown_master_tables.sql
-- ย้าย Dropdown ที่เคย Hardcode ไว้ในไฟล์ .tsx (departments, stackTypeOptions, stackNameOptions, stackLayerOptions)
-- มาเก็บเป็น Master Data ใน SQL Server แทน
-- รันผ่าน: sqlcmd -S "DESKTOP-TJ7525D\SQLEXPRESS" -U sa -P 1234 -C -d ProjectDevHub -i part7_dropdown_master_tables.sql

-- ===========================================================================
-- Project.Departments — เดิม Hardcode ซ้ำกันใน project-form-modal.tsx (Solo) และ team-project-form-modal.tsx (Team)
-- ===========================================================================
IF OBJECT_ID('Project.Departments', 'U') IS NULL
BEGIN
    CREATE TABLE Project.Departments (
        DepartmentId INT IDENTITY(1,1) PRIMARY KEY,
        DepartmentName NVARCHAR(100) NOT NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        SortOrder INT NOT NULL DEFAULT 0,
        CreatedDate DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM Project.Departments)
BEGIN
    INSERT INTO Project.Departments (DepartmentName, SortOrder) VALUES
        (N'ระบบดิจิตอลและIT', 1),
        (N'ฝ่ายซ่อมบำรุง', 2),
        (N'ฝ่ายคลังสินค้าและจัดส่ง', 3),
        (N'ฝ่ายทรัพยากรบุคคล', 4);
END
GO

-- ===========================================================================
-- Project.TechStackCatalog — เดิม Hardcode ซ้ำกันใน project-stack-section.tsx (Solo) และ
-- team-project-stack-section.tsx (Team) เป็น 3 Dropdown อิสระต่อกัน (ประเภท/ชื่อ/Layer)
-- จึงเก็บรวมตารางเดียวโดยแยกด้วย OptionGroup แทนการทำเป็น Combo ตายตัว
-- ===========================================================================
IF OBJECT_ID('Project.TechStackCatalog', 'U') IS NULL
BEGIN
    CREATE TABLE Project.TechStackCatalog (
        CatalogId INT IDENTITY(1,1) PRIMARY KEY,
        OptionGroup NVARCHAR(20) NOT NULL, -- TYPE, NAME, LAYER
        OptionValue NVARCHAR(100) NOT NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        SortOrder INT NOT NULL DEFAULT 0,
        CreatedDate DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM Project.TechStackCatalog)
BEGIN
    INSERT INTO Project.TechStackCatalog (OptionGroup, OptionValue, SortOrder) VALUES
        (N'TYPE', N'ภาษา (Language)', 1),
        (N'TYPE', N'Framework', 2),
        (N'TYPE', N'Library / Package', 3),
        (N'TYPE', N'Database', 4),
        (N'NAME', N'Next.js', 1),
        (N'NAME', N'React', 2),
        (N'NAME', N'TypeScript', 3),
        (N'NAME', N'ASP.NET Core', 4),
        (N'NAME', N'SQL Server', 5),
        (N'NAME', N'Tailwind CSS', 6),
        (N'NAME', N'Zustand', 7),
        (N'NAME', N'Docker', 8),
        (N'LAYER', N'Frontend', 1),
        (N'LAYER', N'Backend', 2),
        (N'LAYER', N'Database', 3),
        (N'LAYER', N'DevOps', 4);
END
GO

SELECT * FROM Project.Departments ORDER BY SortOrder;
SELECT * FROM Project.TechStackCatalog ORDER BY OptionGroup, SortOrder;
GO
