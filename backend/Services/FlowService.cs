using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.DTOs;
using backend.Models.Flow;
using backend.Models.Project;

namespace backend.Services
{
    public class FlowService : IFlowService
    {
        private readonly AppDbContext _context;

        public FlowService(AppDbContext context)
        {
            _context = context;
        }

        // ===========================================================================
        // FlowDefinitions
        // ===========================================================================
        public async Task<List<FlowDefinitionDto>> GetFlowsAsync(int userId)
        {
            await SyncFlowDefinitionsWithProjectsAsync();

            // ★ Data Isolation: เห็นเฉพาะ Flow ของโปรเจกต์ที่ตัวเองเป็นเจ้าของ/สมาชิกทีม — ส่วน Flow แบบ Standalone
            // เก่า (ProjectId เป็น NULL จากก่อนที่จะผูก 1:1 กับ Project) ให้ยึดตามผู้สร้าง (CreatedBy) แทน
            var flows = await _context.FlowDefinitions
                .Where(f => f.IsActive)
                .Include(f => f.Creator)
                .Include(f => f.Project).ThenInclude(p => p!.Members)
                .Where(f =>
                    (f.Project != null && (f.Project.ProjectOwnerId == userId || f.Project.Members.Any(m => m.UserId == userId && m.IsActive)))
                    || (f.Project == null && f.CreatedBy == userId))
                .OrderByDescending(f => f.CreatedDate)
                .ToListAsync();

            return flows.Select(MapToFlowDefinitionDto).ToList();
        }

        public async Task<FlowDefinitionDetailDto?> GetFlowDetailAsync(int flowDefinitionId, int userId)
        {
            await SyncFlowDefinitionsWithProjectsAsync();

            // ★ Data Isolation: ดูรายละเอียดได้เฉพาะ Flow ที่ตัวเองเข้าถึงโปรเจกต์ต้นทางได้ (หรือเป็นผู้สร้างถ้าเป็น Standalone)
            var flow = await _context.FlowDefinitions
                .Include(f => f.Creator)
                .Include(f => f.Project).ThenInclude(p => p!.Members)
                .FirstOrDefaultAsync(f => f.FlowDefinitionId == flowDefinitionId && f.IsActive
                    && ((f.Project != null && (f.Project.ProjectOwnerId == userId || f.Project.Members.Any(m => m.UserId == userId && m.IsActive)))
                        || (f.Project == null && f.CreatedBy == userId)));

            if (flow == null) return null;

            return new FlowDefinitionDetailDto
            {
                Flow = MapToFlowDefinitionDto(flow)
            };
        }

        // ใช้โดย Visitor Mode: การ์ดโปรเจกต์รู้แค่ ProjectId ไม่รู้ FlowDefinitionId — หา FlowDefinitionId จาก
        // ProjectId ก่อน แล้วเรียก GetFlowDetailAsync ตัวเดิมต่อ (ผ่านเงื่อนไข Data Isolation เดิมทุกอย่าง)
        public async Task<FlowDefinitionDetailDto?> GetFlowDetailByProjectIdAsync(int projectId, int userId)
        {
            var flowId = await _context.FlowDefinitions
                .Where(f => f.ProjectId == projectId && f.IsActive)
                .Select(f => f.FlowDefinitionId)
                .FirstOrDefaultAsync();

            if (flowId == 0) return null;

            return await GetFlowDetailAsync(flowId, userId);
        }

        public async Task<FlowDefinitionDto> CreateFlowAsync(CreateFlowDefinitionRequest request, int currentUserId)
        {
            var flow = new FlowDefinitions
            {
                FlowCode = await GenerateFlowCodeAsync(),
                Name = request.Name,
                Description = request.Description,
                Status = request.Status,
                WorkType = request.WorkType,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                CreatedBy = currentUserId,
                IsActive = true
            };

            _context.FlowDefinitions.Add(flow);
            await _context.SaveChangesAsync();

            await _context.Entry(flow).Reference(f => f.Creator).LoadAsync();
            return MapToFlowDefinitionDto(flow);
        }

        public async Task<FlowDefinitionDto?> UpdateFlowAsync(UpdateFlowDefinitionRequest request)
        {
            var flow = await _context.FlowDefinitions
                .Include(f => f.Creator)
                .FirstOrDefaultAsync(f => f.FlowDefinitionId == request.FlowDefinitionId && f.IsActive);

            if (flow == null) return null;

            flow.Name = request.Name;
            flow.Description = request.Description;
            flow.Status = request.Status;
            flow.WorkType = request.WorkType;
            flow.StartDate = request.StartDate;
            flow.EndDate = request.EndDate;
            flow.UpdatedDate = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();
            return MapToFlowDefinitionDto(flow);
        }

        public async Task<bool> DeleteFlowAsync(int flowDefinitionId)
        {
            var flow = await _context.FlowDefinitions.FindAsync(flowDefinitionId);
            if (flow == null) return false;

            flow.IsActive = false;
            flow.UpdatedDate = DateTimeOffset.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        // ===========================================================================
        // Flow 1:1 Binding — Backfill/Sync ให้ทุก Project (Solo/Team) ที่ Active มี FlowDefinition ผูกอยู่เสมอ
        // (ครอบคลุม Project เก่าที่สร้างก่อนมีการผูก Flow 1:1 — ProjectSoloService/ProjectTeamService
        // จะ Ensure ให้ทันทีตอน Create/Update อยู่แล้ว ส่วนนี้คือ Fallback สำหรับข้อมูลเก่า)
        // ===========================================================================
        private async Task SyncFlowDefinitionsWithProjectsAsync()
        {
            var projects = await _context.Projects
                .Where(p => p.IsActive)
                .Include(p => p.Members)
                .ToListAsync();

            if (projects.Count == 0) return;

            var projectIds = projects.Select(p => p.ProjectId).ToList();
            var existingFlows = await _context.FlowDefinitions
                .Where(f => f.ProjectId != null && projectIds.Contains(f.ProjectId.Value))
                .ToListAsync();
            var flowByProjectId = existingFlows.ToDictionary(f => f.ProjectId!.Value);

            var hasChanges = false;
            var nextFlowSeq = -1; // เติมค่าจาก DB แค่ครั้งแรกที่ต้องใช้ แล้วนับต่อในหน่วยความจำ กัน FlowCode ซ้ำในลูปเดียวกัน
            var flowCodeYear = DateTime.UtcNow.Year;

            foreach (var project in projects)
            {
                var workType = project.Members.Any() ? "TEAM" : "SOLO";
                var status = MapProjectStatusToFlowStatus(project.Status);

                if (flowByProjectId.TryGetValue(project.ProjectId, out var flow))
                {
                    if (flow.Name != project.ProjectName || flow.Description != project.Description ||
                        flow.Status != status || flow.WorkType != workType ||
                        flow.StartDate != project.StartDate || flow.EndDate != project.EndDate)
                    {
                        flow.Name = project.ProjectName;
                        flow.Description = project.Description;
                        flow.Status = status;
                        flow.WorkType = workType;
                        flow.StartDate = project.StartDate;
                        flow.EndDate = project.EndDate;
                        flow.UpdatedDate = DateTimeOffset.UtcNow;
                        hasChanges = true;
                    }
                }
                else
                {
                    if (nextFlowSeq < 0)
                    {
                        nextFlowSeq = await GetNextFlowSeqAsync(flowCodeYear);
                    }

                    _context.FlowDefinitions.Add(new FlowDefinitions
                    {
                        ProjectId = project.ProjectId,
                        FlowCode = $"FLOW-{flowCodeYear}-{nextFlowSeq++:D3}",
                        Name = project.ProjectName,
                        Description = project.Description,
                        Status = status,
                        WorkType = workType,
                        StartDate = project.StartDate,
                        EndDate = project.EndDate,
                        CreatedBy = project.CreatedBy,
                        IsActive = true
                    });
                    hasChanges = true;
                }
            }

            if (hasChanges)
            {
                await _context.SaveChangesAsync();
            }
        }

        private static string MapProjectStatusToFlowStatus(string projectStatus) => projectStatus switch
        {
            "COMPLETED" => "COMPLETED",
            "CANCELLED" => "COMPLETED",
            "PLANNING" => "PLANNING",
            _ => "IN_PROGRESS" // IN_PROGRESS, ON_HOLD
        };

        // ===========================================================================
        // Helpers
        // ===========================================================================
        private async Task<string> GenerateFlowCodeAsync()
        {
            var year = DateTime.UtcNow.Year;
            var nextSeq = await GetNextFlowSeqAsync(year);
            return $"FLOW-{year}-{nextSeq:D3}";
        }

        private async Task<int> GetNextFlowSeqAsync(int year)
        {
            var prefix = $"FLOW-{year}-";

            var lastCode = await _context.FlowDefinitions
                .Where(f => f.FlowCode.StartsWith(prefix))
                .OrderByDescending(f => f.FlowCode)
                .Select(f => f.FlowCode)
                .FirstOrDefaultAsync();

            if (lastCode != null && int.TryParse(lastCode.Substring(prefix.Length), out var lastSeq))
            {
                return lastSeq + 1;
            }

            return 1;
        }

        // ความคืบหน้าของ Flow อ้างอิงจากโปรเจกต์ต้นทางเสมอ (Project.Projects.ProgressPercent ที่ Trigger
        // Trg_UpdateProjectProgress คำนวณจาก Task จริงให้อัตโนมัติอยู่แล้ว — Pattern เดียวกับ Solo/Team)
        // FlowDefinitions.ProgressPercent เดิมมาจาก FlowSteps ซึ่งไม่ได้ใช้แล้วหลังเปลี่ยนมาใช้ Workflow
        // Diagram Studio จึงค้างอยู่ที่ 0 เสมอ ใช้ Fallback ค่านี้เฉพาะ Flow เก่าที่ไม่ได้ผูก Project (ProjectId เป็น NULL)
        private static FlowDefinitionDto MapToFlowDefinitionDto(FlowDefinitions f) => new()
        {
            FlowDefinitionId = f.FlowDefinitionId,
            ProjectId = f.ProjectId,
            FlowCode = f.FlowCode,
            Name = f.Name,
            Description = f.Description,
            Status = f.Status,
            WorkType = f.WorkType,
            StartDate = f.StartDate,
            EndDate = f.EndDate,
            ProgressPercent = f.Project?.ProgressPercent ?? f.ProgressPercent,
            SystemType = f.SystemType,
            ModuleList = f.ModuleList,
            DfdLevel = f.DfdLevel,
            CreatedBy = f.CreatedBy,
            CreatedByName = f.Creator?.FullName ?? string.Empty
        };

        // ===========================================================================
        // FlowDiagramRows — Workflow Diagram Studio (พอร์ตมาจาก AutoFlowStudio_ModulesD)
        // ===========================================================================
        private static readonly HashSet<string> ValidDiagramTypes = new(StringComparer.OrdinalIgnoreCase)
        {
            "FLOWCHART", "USECASE", "DFD", "SEQUENCE", "ERD", "STATE"
        };

        public async Task<FlowDiagramDataDto?> GetDiagramDataAsync(int flowDefinitionId)
        {
            var flow = await _context.FlowDefinitions
                .FirstOrDefaultAsync(f => f.FlowDefinitionId == flowDefinitionId && f.IsActive);
            if (flow == null) return null;

            var rows = await _context.FlowDiagramRows
                .Where(r => r.FlowDefinitionId == flowDefinitionId)
                .OrderBy(r => r.SortOrder)
                .ToListAsync();

            var byType = ValidDiagramTypes.ToDictionary(
                t => t,
                t => rows.Where(r => string.Equals(r.DiagramType, t, StringComparison.OrdinalIgnoreCase))
                    .Select(MapToFlowDiagramRowDto)
                    .ToList());

            return new FlowDiagramDataDto
            {
                SystemType = flow.SystemType,
                ModuleList = flow.ModuleList,
                DfdLevel = flow.DfdLevel,
                RowsByType = byType
            };
        }

        // Full-Replace ต่อ (FlowDefinitionId, DiagramType) ทุกครั้งที่ Save — ตรงกับพฤติกรรมต้นทางที่
        // ทั้งชุดแถวถูกแทนที่ทีเดียวจาก State ฝั่ง Client (ไม่ต้องสน Diff ทีละแถว)
        public async Task<List<FlowDiagramRowDto>?> SaveDiagramRowsAsync(int flowDefinitionId, SaveFlowDiagramRowsRequest request)
        {
            if (!ValidDiagramTypes.Contains(request.DiagramType)) return null;

            var flowExists = await _context.FlowDefinitions.AnyAsync(f => f.FlowDefinitionId == flowDefinitionId && f.IsActive);
            if (!flowExists) return null;

            var existing = _context.FlowDiagramRows
                .Where(r => r.FlowDefinitionId == flowDefinitionId
                    && r.DiagramType.ToUpper() == request.DiagramType.ToUpper());
            _context.FlowDiagramRows.RemoveRange(existing);

            var newRows = request.Rows.Select((item, index) => new FlowDiagramRows
            {
                FlowDefinitionId = flowDefinitionId,
                DiagramType = request.DiagramType.ToUpperInvariant(),
                StepNo = item.StepNo,
                Actor = item.Actor,
                Action = item.Action,
                DataField = item.DataField,
                Decision = item.Decision,
                NextStep = item.NextStep,
                OptionValue = item.OptionValue,
                SortOrder = index
            }).ToList();

            _context.FlowDiagramRows.AddRange(newRows);
            await _context.SaveChangesAsync();

            return newRows.Select(MapToFlowDiagramRowDto).ToList();
        }

        public async Task<FlowDefinitionDto?> UpdateFlowMetaAsync(int flowDefinitionId, UpdateFlowMetaRequest request)
        {
            var flow = await _context.FlowDefinitions
                .Include(f => f.Creator)
                .FirstOrDefaultAsync(f => f.FlowDefinitionId == flowDefinitionId && f.IsActive);
            if (flow == null) return null;

            flow.SystemType = request.SystemType;
            flow.ModuleList = request.ModuleList;
            if (!string.IsNullOrWhiteSpace(request.DfdLevel)) flow.DfdLevel = request.DfdLevel;
            flow.UpdatedDate = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();
            return MapToFlowDefinitionDto(flow);
        }

        private static FlowDiagramRowDto MapToFlowDiagramRowDto(FlowDiagramRows r) => new()
        {
            FlowDiagramRowId = r.FlowDiagramRowId,
            StepNo = r.StepNo ?? string.Empty,
            Actor = r.Actor ?? string.Empty,
            Action = r.Action ?? string.Empty,
            DataField = r.DataField ?? string.Empty,
            Decision = r.Decision ?? string.Empty,
            NextStep = r.NextStep ?? string.Empty,
            OptionValue = r.OptionValue
        };
    }
}
