using backend.DTOs;

namespace backend.Services
{
    public interface IOrgStructureService
    {
        // สำหรับ Dropdown หน้าสมัครสมาชิก (ทรงเดียวกับ DivisionOption ฝั่ง frontend)
        Task<List<DivisionOptionDto>> GetDivisionOptionsAsync();

        // สำหรับหน้าจัดการ (Org Structure Manager)
        Task<List<OrgDivisionDto>> GetDivisionsAsync();
        Task<OrgDivisionDto> CreateDivisionAsync(SaveOrgDivisionRequest request);
        Task<OrgDivisionDto?> UpdateDivisionAsync(int divisionId, SaveOrgDivisionRequest request);
        Task<bool> DeleteDivisionAsync(int divisionId);

        Task<List<OrgDepartmentDto>> GetDepartmentsAsync(int divisionId);
        Task<OrgDepartmentDto> CreateDepartmentAsync(SaveOrgDepartmentRequest request);
        Task<OrgDepartmentDto?> UpdateDepartmentAsync(int departmentId, SaveOrgDepartmentRequest request);
        Task<bool> DeleteDepartmentAsync(int departmentId);

        Task<List<OrgSectionDto>> GetSectionsAsync(int departmentId);
        Task<OrgSectionDto> CreateSectionAsync(SaveOrgSectionRequest request);
        Task<OrgSectionDto?> UpdateSectionAsync(int sectionId, SaveOrgSectionRequest request);
        Task<bool> DeleteSectionAsync(int sectionId);
    }
}
