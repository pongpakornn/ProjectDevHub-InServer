-- =============================================================================
-- add_present_system.sql
-- Adds the missing Core.SystemList row for "Present Station" so the sidebar's
-- permission-based menu filtering has a SystemId to gate on (the sidebar menu
-- item /dashboard/present previously had no matching module in Core.SystemList).
-- Safe to re-run: only inserts if the row doesn't already exist.
-- =============================================================================

IF NOT EXISTS (SELECT 1 FROM Core.SystemList WHERE SystemId = 'PRESENT')
BEGIN
    INSERT INTO Core.SystemList (SystemId, SystemName, Description, IsActive)
    VALUES (
        N'PRESENT',
        N'สถานีนำเสนอผลงาน (Present Station)',
        N'ศูนย์รวม Showcase ผลงาน การสาธิตระบบ และ Media Lightbox Gallery',
        1
    );
END
GO
