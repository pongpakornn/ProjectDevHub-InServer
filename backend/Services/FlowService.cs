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
        public async Task<List<FlowDefinitionDto>> GetFlowsAsync()
        {
            await SyncFlowDefinitionsWithProjectsAsync();

            var flows = await _context.FlowDefinitions
                .Where(f => f.IsActive)
                .Include(f => f.Creator)
                .OrderByDescending(f => f.CreatedDate)
                .ToListAsync();

            return flows.Select(MapToFlowDefinitionDto).ToList();
        }

        public async Task<FlowDefinitionDetailDto?> GetFlowDetailAsync(int flowDefinitionId)
        {
            await SyncFlowDefinitionsWithProjectsAsync();

            var flow = await _context.FlowDefinitions
                .Include(f => f.Creator)
                .FirstOrDefaultAsync(f => f.FlowDefinitionId == flowDefinitionId && f.IsActive);

            if (flow == null) return null;

            var steps = await _context.FlowSteps
                .Where(s => s.FlowDefinitionId == flowDefinitionId)
                .OrderBy(s => s.SortOrder)
                .ToListAsync();

            var techStacks = await _context.FlowTechStacks
                .Where(ts => ts.FlowDefinitionId == flowDefinitionId)
                .OrderBy(ts => ts.SortOrder)
                .ToListAsync();

            return new FlowDefinitionDetailDto
            {
                Flow = MapToFlowDefinitionDto(flow),
                Steps = steps.Select(MapToFlowStepDto).ToList(),
                TechStacks = techStacks.Select(MapToFlowTechStackDto).ToList()
            };
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
        // FlowSteps
        // ===========================================================================
        public async Task<FlowStepDto?> CreateStepAsync(CreateFlowStepRequest request)
        {
            var flowExists = await _context.FlowDefinitions.AnyAsync(f => f.FlowDefinitionId == request.FlowDefinitionId);
            if (!flowExists) return null;

            var step = new FlowSteps
            {
                FlowDefinitionId = request.FlowDefinitionId,
                StepNo = request.StepNo,
                Title = request.Title,
                Status = request.Status,
                ProgressPercent = request.ProgressPercent,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                SortOrder = request.SortOrder
            };

            _context.FlowSteps.Add(step);
            await _context.SaveChangesAsync();
            return MapToFlowStepDto(step);
        }

        public async Task<FlowStepDto?> UpdateStepAsync(UpdateFlowStepRequest request)
        {
            var step = await _context.FlowSteps.FindAsync(request.FlowStepId);
            if (step == null) return null;

            step.StepNo = request.StepNo;
            step.Title = request.Title;
            step.Status = request.Status;
            step.ProgressPercent = request.ProgressPercent;
            step.StartDate = request.StartDate;
            step.EndDate = request.EndDate;
            if (request.SortOrder > 0) step.SortOrder = request.SortOrder;

            await _context.SaveChangesAsync();
            return MapToFlowStepDto(step);
        }

        public async Task<bool> DeleteStepAsync(int flowStepId)
        {
            var step = await _context.FlowSteps.FindAsync(flowStepId);
            if (step == null) return false;

            _context.FlowSteps.Remove(step);
            await _context.SaveChangesAsync();
            return true;
        }

        // ===========================================================================
        // FlowTechStacks
        // ===========================================================================
        public async Task<FlowTechStackDto?> CreateTechStackAsync(CreateFlowTechStackRequest request)
        {
            var flowExists = await _context.FlowDefinitions.AnyAsync(f => f.FlowDefinitionId == request.FlowDefinitionId);
            if (!flowExists) return null;

            var techStack = new FlowTechStacks
            {
                FlowDefinitionId = request.FlowDefinitionId,
                Layer = request.Layer,
                Name = request.Name,
                SortOrder = request.SortOrder
            };

            _context.FlowTechStacks.Add(techStack);
            await _context.SaveChangesAsync();
            return MapToFlowTechStackDto(techStack);
        }

        public async Task<bool> DeleteTechStackAsync(int flowTechStackId)
        {
            var techStack = await _context.FlowTechStacks.FindAsync(flowTechStackId);
            if (techStack == null) return false;

            _context.FlowTechStacks.Remove(techStack);
            await _context.SaveChangesAsync();
            return true;
        }

        // ===========================================================================
        // FlowExecutions
        // ===========================================================================
        public async Task<List<FlowExecutionDto>?> GetExecutionsAsync(int flowDefinitionId)
        {
            var flowExists = await _context.FlowDefinitions.AnyAsync(f => f.FlowDefinitionId == flowDefinitionId);
            if (!flowExists) return null;

            var executions = await _context.FlowExecutions
                .Where(e => e.FlowDefinitionId == flowDefinitionId)
                .Include(e => e.TriggeredByUser)
                .Include(e => e.Logs)
                .OrderByDescending(e => e.StartedDate)
                .ToListAsync();

            return executions.Select(MapToFlowExecutionDto).ToList();
        }

        public async Task<FlowExecutionDto?> CreateExecutionAsync(int flowDefinitionId, CreateFlowExecutionRequest request, int currentUserId)
        {
            var flowExists = await _context.FlowDefinitions.AnyAsync(f => f.FlowDefinitionId == flowDefinitionId);
            if (!flowExists) return null;

            var execution = new FlowExecutions
            {
                FlowDefinitionId = flowDefinitionId,
                Status = request.Status,
                FinishedDate = request.FinishedDate,
                TriggeredBy = currentUserId,
                Note = request.Note
            };

            _context.FlowExecutions.Add(execution);
            await _context.SaveChangesAsync();

            await _context.Entry(execution).Reference(e => e.TriggeredByUser).LoadAsync();
            execution.Logs = new List<FlowLogs>();
            return MapToFlowExecutionDto(execution);
        }

        public async Task<FlowExecutionDto?> UpdateExecutionAsync(int flowExecutionId, UpdateFlowExecutionRequest request)
        {
            var execution = await _context.FlowExecutions
                .Include(e => e.TriggeredByUser)
                .Include(e => e.Logs)
                .FirstOrDefaultAsync(e => e.FlowExecutionId == flowExecutionId);

            if (execution == null) return null;

            execution.Status = request.Status;
            execution.FinishedDate = request.FinishedDate;
            execution.Note = request.Note;

            await _context.SaveChangesAsync();
            return MapToFlowExecutionDto(execution);
        }

        public async Task<bool> DeleteExecutionAsync(int flowExecutionId)
        {
            var execution = await _context.FlowExecutions.FindAsync(flowExecutionId);
            if (execution == null) return false;

            _context.FlowExecutions.Remove(execution);
            await _context.SaveChangesAsync();
            return true;
        }

        // ===========================================================================
        // FlowLogs
        // ===========================================================================
        public async Task<FlowLogDto?> AddLogAsync(int flowExecutionId, CreateFlowLogRequest request)
        {
            var executionExists = await _context.FlowExecutions.AnyAsync(e => e.FlowExecutionId == flowExecutionId);
            if (!executionExists) return null;

            var log = new FlowLogs
            {
                FlowExecutionId = flowExecutionId,
                LogLevel = request.LogLevel,
                Message = request.Message
            };

            _context.FlowLogs.Add(log);
            await _context.SaveChangesAsync();
            return MapToFlowLogDto(log);
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
            ProgressPercent = f.ProgressPercent,
            CreatedBy = f.CreatedBy,
            CreatedByName = f.Creator?.FullName ?? string.Empty
        };

        private static FlowStepDto MapToFlowStepDto(FlowSteps s) => new()
        {
            FlowStepId = s.FlowStepId,
            FlowDefinitionId = s.FlowDefinitionId,
            StepNo = s.StepNo,
            Title = s.Title,
            Status = s.Status,
            ProgressPercent = s.ProgressPercent,
            StartDate = s.StartDate,
            EndDate = s.EndDate,
            SortOrder = s.SortOrder
        };

        private static FlowTechStackDto MapToFlowTechStackDto(FlowTechStacks ts) => new()
        {
            FlowTechStackId = ts.FlowTechStackId,
            FlowDefinitionId = ts.FlowDefinitionId,
            Layer = ts.Layer,
            Name = ts.Name,
            SortOrder = ts.SortOrder
        };

        private static FlowExecutionDto MapToFlowExecutionDto(FlowExecutions e) => new()
        {
            FlowExecutionId = e.FlowExecutionId,
            FlowDefinitionId = e.FlowDefinitionId,
            Status = e.Status,
            StartedDate = e.StartedDate,
            FinishedDate = e.FinishedDate,
            TriggeredBy = e.TriggeredBy,
            TriggeredByName = e.TriggeredByUser?.FullName ?? string.Empty,
            Note = e.Note,
            Logs = e.Logs?.OrderBy(l => l.LoggedDate).Select(MapToFlowLogDto).ToList() ?? new List<FlowLogDto>()
        };

        private static FlowLogDto MapToFlowLogDto(FlowLogs l) => new()
        {
            FlowLogId = l.FlowLogId,
            FlowExecutionId = l.FlowExecutionId,
            LogLevel = l.LogLevel,
            Message = l.Message,
            LoggedDate = l.LoggedDate
        };
    }
}
