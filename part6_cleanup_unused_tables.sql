-- part6_cleanup_unused_tables.sql
-- ลบตารางที่ไม่มีการใช้งานจริงในโค้ดเลยแม้แต่จุดเดียว (ตรวจสอบแล้วไม่มี Controller/Service/Frontend อ้างอิง)
-- รันผ่าน: sqlcmd -S "DESKTOP-TJ7525D\SQLEXPRESS" -U sa -P 1234 -C -d ProjectDevHub -i part6_cleanup_unused_tables.sql

-- Project.TaskTags ต้องลบก่อน เพราะมี FK ไปทั้ง Project.Tasks และ Project.Tags
IF OBJECT_ID('Project.TaskTags', 'U') IS NOT NULL
    DROP TABLE Project.TaskTags;
GO

IF OBJECT_ID('Project.Tags', 'U') IS NOT NULL
    DROP TABLE Project.Tags;
GO

IF OBJECT_ID('Project.TimeLogs', 'U') IS NOT NULL
    DROP TABLE Project.TimeLogs;
GO

SELECT s.name AS SchemaName, t.name AS TableName
FROM sys.tables t
JOIN sys.schemas s ON t.schema_id = s.schema_id
WHERE s.name = 'Project'
ORDER BY t.name;
GO
