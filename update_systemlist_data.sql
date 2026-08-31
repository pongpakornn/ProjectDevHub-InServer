-- update_systemlist_data.sql
-- อัปเดตข้อมูลใน Core.SystemList ให้ตรงสโคปของระบบ ProjectDevHub (SOLO / TEAM / FLOW)
-- รันผ่าน: sqlcmd -S "DESKTOP-TJ7525D\SQLEXPRESS" -U sa -P 1234 -C -d ProjectDevHub -i update_systemlist_data.sql

MERGE Core.SystemList AS target
USING (VALUES
    ('SOLO', N'Project Solo Management', N'ระบบบริหารจัดการโปรเจกต์เดี่ยว'),
    ('TEAM', N'Project Team Management', N'ระบบบริหารจัดการโปรเจกต์ทีม'),
    ('FLOW', N'Project Flow Architecture', N'ระบบออกแบบและติดตามผังการทำงานของโปรเจกต์')
) AS source (SystemId, SystemName, Description)
ON target.SystemId = source.SystemId
WHEN MATCHED THEN
    UPDATE SET
        target.SystemName = source.SystemName,
        target.Description = source.Description
WHEN NOT MATCHED BY TARGET THEN
    INSERT (SystemId, SystemName, Description, IsActive, CreatedDate)
    VALUES (source.SystemId, source.SystemName, source.Description, 1, SYSDATETIMEOFFSET());
GO

SELECT SystemId, SystemName, Description, IsActive FROM Core.SystemList WHERE SystemId IN ('SOLO', 'TEAM', 'FLOW');
GO
