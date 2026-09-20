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
        // Auto-Generate — สร้าง FlowSteps/FlowTechStacks จากข้อมูลจริงของ Project ที่ผูกอยู่
        // (Pattern เดียวกับ ProjectSoloService.AutoGeneratePhasesAsync — Idempotent: มีอยู่แล้วคืนของเดิม ไม่สร้างซ้ำ)
        // ===========================================================================
        public async Task<List<FlowStepDto>> AutoGenerateStepsAsync(int flowDefinitionId)
        {
            var flow = await _context.FlowDefinitions
                .FirstOrDefaultAsync(f => f.FlowDefinitionId == flowDefinitionId && f.IsActive);

            if (flow == null)
                throw new InvalidOperationException("ไม่พบ Flow นี้");

            if (flow.ProjectId == null)
                throw new InvalidOperationException("Flow นี้ยังไม่ได้ผูกกับโปรเจกต์ ไม่สามารถ Auto-Generate ได้");

            var existing = await _context.FlowSteps
                .Where(s => s.FlowDefinitionId == flowDefinitionId)
                .OrderBy(s => s.SortOrder)
                .ToListAsync();

            if (existing.Any())
            {
                return existing.Select(MapToFlowStepDto).ToList();
            }

            var milestones = await _context.Milestones
                .Where(m => m.ProjectId == flow.ProjectId)
                .Include(m => m.Tasks)
                .OrderBy(m => m.SortOrder)
                .ToListAsync();

            if (!milestones.Any())
                throw new InvalidOperationException("โปรเจกต์นี้ยังไม่มี Phase/Milestone ให้ Generate เป็น Flow Step");

            var steps = milestones.Select((m, index) =>
            {
                var status = MapMilestoneStatusToStepStatus(m.Status);
                var title = m.MilestoneName;

                if (m.Tasks.Any())
                {
                    var taskNames = string.Join(", ", m.Tasks.OrderBy(t => t.TaskId).Select(t => t.TaskName));
                    var candidate = $"{m.MilestoneName} — {taskNames}";
                    title = candidate.Length > 255 ? candidate.Substring(0, 252) + "..." : candidate;
                }

                return new FlowSteps
                {
                    FlowDefinitionId = flowDefinitionId,
                    MilestoneId = m.MilestoneId,
                    StepNo = $"STEP {index + 1:D2}",
                    Title = title,
                    Status = status,
                    ProgressPercent = MapStepStatusToProgress(status),
                    StartDate = m.StartDate,
                    EndDate = m.DueDate,
                    SortOrder = index + 1
                };
            }).ToList();

            _context.FlowSteps.AddRange(steps);
            await _context.SaveChangesAsync();

            return steps.Select(MapToFlowStepDto).ToList();
        }

        public async Task<List<FlowTechStackDto>> AutoGenerateTechStacksAsync(int flowDefinitionId)
        {
            var flow = await _context.FlowDefinitions
                .FirstOrDefaultAsync(f => f.FlowDefinitionId == flowDefinitionId && f.IsActive);

            if (flow == null)
                throw new InvalidOperationException("ไม่พบ Flow นี้");

            if (flow.ProjectId == null)
                throw new InvalidOperationException("Flow นี้ยังไม่ได้ผูกกับโปรเจกต์ ไม่สามารถ Auto-Generate ได้");

            var existing = await _context.FlowTechStacks
                .Where(ts => ts.FlowDefinitionId == flowDefinitionId)
                .OrderBy(ts => ts.SortOrder)
                .ToListAsync();

            if (existing.Any())
            {
                return existing.Select(MapToFlowTechStackDto).ToList();
            }

            var projectStacks = await _context.TechStacks
                .Where(ts => ts.ProjectId == flow.ProjectId)
                .OrderBy(ts => ts.SortOrder)
                .ToListAsync();

            if (!projectStacks.Any())
                throw new InvalidOperationException("โปรเจกต์นี้ยังไม่มี Tech Stack ให้ Generate เป็น Architecture Diagram");

            var flowStacks = projectStacks.Select((ts, index) => new FlowTechStacks
            {
                FlowDefinitionId = flowDefinitionId,
                TechStackId = ts.TechStackId,
                Layer = MapProjectLayerToFlowLayer(ts.Layer),
                Name = ts.StackName,
                SortOrder = index + 1
            }).ToList();

            _context.FlowTechStacks.AddRange(flowStacks);
            await _context.SaveChangesAsync();

            return flowStacks.Select(MapToFlowTechStackDto).ToList();
        }

        private static string MapMilestoneStatusToStepStatus(string milestoneStatus) => milestoneStatus switch
        {
            "COMPLETED" => "DONE",
            "IN_PROGRESS" => "IN_PROGRESS",
            "DELAYED" => "IN_PROGRESS",
            _ => "PENDING" // PENDING
        };

        private static int MapStepStatusToProgress(string flowStepStatus) => flowStepStatus switch
        {
            "DONE" => 100,
            "IN_PROGRESS" => 50,
            _ => 0
        };

        private static string MapProjectLayerToFlowLayer(string projectLayer) => projectLayer.ToUpperInvariant() switch
        {
            "FRONTEND" => "FRONTEND",
            "DATABASE" => "DATABASE",
            _ => "BACKEND" // Backend, DevOps, Other → รวมเข้า BACKEND เพราะ Flow รองรับแค่ 3 Layer
        };

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

        private static FlowStepDto MapToFlowStepDto(FlowSteps s) => new()
        {
            FlowStepId = s.FlowStepId,
            FlowDefinitionId = s.FlowDefinitionId,
            MilestoneId = s.MilestoneId,
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
            TechStackId = ts.TechStackId,
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
