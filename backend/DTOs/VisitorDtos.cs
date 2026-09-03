// backend/DTOs/VisitorDtos.cs
// Visitor Mode — โหมดผู้เยี่ยมชม: ผู้บริหาร/หัวหน้างานที่มีสิทธิ์ VISITOR.CanView เข้ามาไล่ดูภาพรวมโปรเจกต์
// ของสมาชิกแต่ละคนแบบ "ดูอย่างเดียว" เท่านั้น (ไม่มี Endpoint สำหรับ Add/Edit/Delete ใดๆ ในโมดูลนี้)
namespace backend.DTOs
{
    // รายชื่อ User ที่มีโปรเจกต์เป็นของตัวเองอย่างน้อย 1 โปรเจกต์ (นับจาก ProjectOwnerId)
    public class VisitorUserDto
    {
        public int UserId { get; set; }
        public string EmpId { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public int UserLevel { get; set; }
        public string? DivisionName { get; set; }
        public string? DepartmentName { get; set; }
        public int ProjectCount { get; set; }
        public DateTimeOffset? LatestProjectDate { get; set; }
    }

    // การ์ดโปรเจกต์ของ User ที่เลือกดู (รวม Solo + Team เป็นชุดเดียวกัน)
    public class VisitorProjectCardDto
    {
        public int ProjectId { get; set; }
        public string ProjectCode { get; set; } = string.Empty;
        public string ProjectName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string ProjectTypeName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
        public decimal ProgressPercent { get; set; }
        public string WorkType { get; set; } = string.Empty; // SOLO, TEAM
        public string OwnerName { get; set; } = string.Empty;
    }
}
