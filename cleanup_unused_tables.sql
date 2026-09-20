-- cleanup_unused_tables.sql
-- ลบตารางที่ไม่มีการใช้งานจริงในระบบ (ตรวจสอบแล้วว่าไม่มี Controller/หน้าจอเรียกใช้ หรือเป็นฟีเจอร์เก่าที่ถูกแทนที่แล้ว)
-- ทำ Full Backup ไว้ก่อนรันสคริปต์นี้เสมอ (db_backups/ProjectDevHub_pre_cleanup_*.bak)

-- ============================================================
-- กลุ่ม 1: Flow.FlowSteps / FlowTechStacks / FlowExecutions / FlowLogs
-- เป็นของฟีเจอร์ Flow เก่าก่อนเปลี่ยนมาใช้ Workflow Diagram Studio (Flow.FlowDiagramRows)
-- หน้าจอที่เคยเรียกใช้ (flow-diagram-section.tsx, architecture-diagram-section.tsx,
-- flow-gantt-qa-sections.tsx) ไม่ถูก render จากที่ไหนแล้ว — ทุกตารางมี 0 แถวจริงในระบบ Production
-- ============================================================
DROP TABLE IF EXISTS Flow.FlowLogs;
DROP TABLE IF EXISTS Flow.FlowExecutions;
DROP TABLE IF EXISTS Flow.FlowSteps;
DROP TABLE IF EXISTS Flow.FlowTechStacks;

-- ============================================================
-- กลุ่ม 2: Planning.Events / Planning.Todos
-- ไม่มี Controller หรือหน้าจอใดเรียกใช้เลยตั้งแต่แรก (ไม่มี PlanningController)
-- มีแค่โค้ด cleanup กันลิงก์ค้างตอน Hard Delete Project ซึ่งถูกลบออกไปพร้อมกันแล้ว
-- ============================================================
DROP TABLE IF EXISTS Planning.Todos;
DROP TABLE IF EXISTS Planning.Events;

-- ลบ Schema ที่ว่างเปล่าหลังลบตารางหมดแล้ว
DROP SCHEMA IF EXISTS Planning;
