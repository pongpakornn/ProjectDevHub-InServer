using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    // ===========================================================================
    // Core.Divisions / Core.Departments / Core.Sections — dropdown master data
    // สำหรับหน้า User Management (สมัครสมาชิก) แบบลำดับชั้น Division -> Department -> Section
    // ===========================================================================

    // รูปทรงนี้ต้องตรงกับ DivisionOption ฝั่ง frontend (types/user-permission.ts) เป๊ะๆ
    // เพื่อให้แทนที่ MOCK_DIVISION_OPTIONS ได้โดยไม่ต้องแก้ Component ที่ใช้งานอยู่
    public class DivisionOptionDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public List<DepartmentOptionDto> Departments { get; set; } = new();
    }

    public class DepartmentOptionDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public List<string> Sections { get; set; } = new();
    }

    // ===========================================================================
    // Flat DTOs — ใช้กับหน้าจัดการ (Org Structure Manager: เพิ่ม/แก้ไข/ลบ)
    // ===========================================================================
    public class OrgDivisionDto
    {
        public int DivisionId { get; set; }
        public string DivisionName { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public int SortOrder { get; set; }
    }

    public class OrgDepartmentDto
    {
        public int DepartmentId { get; set; }
        public int DivisionId { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public int SortOrder { get; set; }
    }

    public class OrgSectionDto
    {
        public int SectionId { get; set; }
        public int DepartmentId { get; set; }
        public string SectionName { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public int SortOrder { get; set; }
    }

    public class SaveOrgDivisionRequest
    {
        [Required, StringLength(150)]
        public string DivisionName { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public int SortOrder { get; set; } = 0;
    }

    public class SaveOrgDepartmentRequest
    {
        [Required]
        public int DivisionId { get; set; }

        [Required, StringLength(150)]
        public string DepartmentName { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public int SortOrder { get; set; } = 0;
    }

    public class SaveOrgSectionRequest
    {
        [Required]
        public int DepartmentId { get; set; }

        [Required, StringLength(150)]
        public string SectionName { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public int SortOrder { get; set; } = 0;
    }
}
