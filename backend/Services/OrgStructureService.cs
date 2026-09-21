using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class OrgStructureService : IOrgStructureService
    {
        private readonly AppDbContext _context;

        public OrgStructureService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<DivisionOptionDto>> GetDivisionOptionsAsync()
        {
            var divisions = await _context.Divisions
                .Where(d => d.IsActive)
                .OrderBy(d => d.SortOrder)
                .Include(d => d.Departments.Where(dep => dep.IsActive))
                    .ThenInclude(dep => dep.Sections.Where(s => s.IsActive))
                .ToListAsync();

            return divisions.Select(d => new DivisionOptionDto
            {
                Id = d.DivisionId.ToString(),
                Name = d.DivisionName,
                Departments = d.Departments
                    .OrderBy(dep => dep.SortOrder)
                    .Select(dep => new DepartmentOptionDto
                    {
                        Id = dep.DepartmentId.ToString(),
                        Name = dep.DepartmentName,
                        Sections = dep.Sections.OrderBy(s => s.SortOrder).Select(s => s.SectionName).ToList(),
                    }).ToList(),
            }).ToList();
        }

        public async Task<List<OrgDivisionDto>> GetDivisionsAsync()
        {
            return await _context.Divisions
                .OrderBy(d => d.SortOrder)
                .Select(d => MapDivision(d))
                .ToListAsync();
        }

        public async Task<OrgDivisionDto> CreateDivisionAsync(SaveOrgDivisionRequest request)
        {
            var division = new OrgDivision
            {
                DivisionName = request.DivisionName,
                IsActive = request.IsActive,
                SortOrder = request.SortOrder,
            };
            _context.Divisions.Add(division);
            await _context.SaveChangesAsync();
            return MapDivision(division);
        }

        public async Task<OrgDivisionDto?> UpdateDivisionAsync(int divisionId, SaveOrgDivisionRequest request)
        {
            var division = await _context.Divisions.FirstOrDefaultAsync(d => d.DivisionId == divisionId);
            if (division == null) return null;

            division.DivisionName = request.DivisionName;
            division.IsActive = request.IsActive;
            division.SortOrder = request.SortOrder;
            await _context.SaveChangesAsync();
            return MapDivision(division);
        }

        public async Task<bool> DeleteDivisionAsync(int divisionId)
        {
            var division = await _context.Divisions.FirstOrDefaultAsync(d => d.DivisionId == divisionId);
            if (division == null) return false;

            _context.Divisions.Remove(division); // Cascade ลบ Departments/Sections ลูกไปด้วย (FK ตั้งไว้แบบ Cascade)
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<OrgDepartmentDto>> GetDepartmentsAsync(int divisionId)
        {
            return await _context.OrgDepartments
                .Where(dep => dep.DivisionId == divisionId)
                .OrderBy(dep => dep.SortOrder)
                .Select(dep => MapDepartment(dep))
                .ToListAsync();
        }

        public async Task<OrgDepartmentDto> CreateDepartmentAsync(SaveOrgDepartmentRequest request)
        {
            var department = new OrgDepartment
            {
                DivisionId = request.DivisionId,
                DepartmentName = request.DepartmentName,
                IsActive = request.IsActive,
                SortOrder = request.SortOrder,
            };
            _context.OrgDepartments.Add(department);
            await _context.SaveChangesAsync();
            return MapDepartment(department);
        }

        public async Task<OrgDepartmentDto?> UpdateDepartmentAsync(int departmentId, SaveOrgDepartmentRequest request)
        {
            var department = await _context.OrgDepartments.FirstOrDefaultAsync(d => d.DepartmentId == departmentId);
            if (department == null) return null;

            department.DivisionId = request.DivisionId;
            department.DepartmentName = request.DepartmentName;
            department.IsActive = request.IsActive;
            department.SortOrder = request.SortOrder;
            await _context.SaveChangesAsync();
            return MapDepartment(department);
        }

        public async Task<bool> DeleteDepartmentAsync(int departmentId)
        {
            var department = await _context.OrgDepartments.FirstOrDefaultAsync(d => d.DepartmentId == departmentId);
            if (department == null) return false;

            _context.OrgDepartments.Remove(department);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<OrgSectionDto>> GetSectionsAsync(int departmentId)
        {
            return await _context.OrgSections
                .Where(s => s.DepartmentId == departmentId)
                .OrderBy(s => s.SortOrder)
                .Select(s => MapSection(s))
                .ToListAsync();
        }

        public async Task<OrgSectionDto> CreateSectionAsync(SaveOrgSectionRequest request)
        {
            var section = new OrgSection
            {
                DepartmentId = request.DepartmentId,
                SectionName = request.SectionName,
                IsActive = request.IsActive,
                SortOrder = request.SortOrder,
            };
            _context.OrgSections.Add(section);
            await _context.SaveChangesAsync();
            return MapSection(section);
        }

        public async Task<OrgSectionDto?> UpdateSectionAsync(int sectionId, SaveOrgSectionRequest request)
        {
            var section = await _context.OrgSections.FirstOrDefaultAsync(s => s.SectionId == sectionId);
            if (section == null) return null;

            section.DepartmentId = request.DepartmentId;
            section.SectionName = request.SectionName;
            section.IsActive = request.IsActive;
            section.SortOrder = request.SortOrder;
            await _context.SaveChangesAsync();
            return MapSection(section);
        }

        public async Task<bool> DeleteSectionAsync(int sectionId)
        {
            var section = await _context.OrgSections.FirstOrDefaultAsync(s => s.SectionId == sectionId);
            if (section == null) return false;

            _context.OrgSections.Remove(section);
            await _context.SaveChangesAsync();
            return true;
        }

        private static OrgDivisionDto MapDivision(OrgDivision d) => new()
        {
            DivisionId = d.DivisionId,
            DivisionName = d.DivisionName,
            IsActive = d.IsActive,
            SortOrder = d.SortOrder,
        };

        private static OrgDepartmentDto MapDepartment(OrgDepartment d) => new()
        {
            DepartmentId = d.DepartmentId,
            DivisionId = d.DivisionId,
            DepartmentName = d.DepartmentName,
            IsActive = d.IsActive,
            SortOrder = d.SortOrder,
        };

        private static OrgSectionDto MapSection(OrgSection s) => new()
        {
            SectionId = s.SectionId,
            DepartmentId = s.DepartmentId,
            SectionName = s.SectionName,
            IsActive = s.IsActive,
            SortOrder = s.SortOrder,
        };
    }
}
