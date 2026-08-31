// // Cluade Mail หลัก
// using Microsoft.EntityFrameworkCore;
// using backend.Data;
// using backend.DTOs;
// using backend.Models.Project;

// namespace backend.Services
// {
//     public class ProjectSoloService : IProjectSoloService
//     {
//         private readonly AppDbContext _context;

//         public ProjectSoloService(AppDbContext context)
//         {
//             _context = context;
//         }

//         // ===========================================================================
//         // Phase Template ตาม Project Type — ใช้กับ AutoGeneratePhasesAsync
//         // ชื่อ Key ต้องตรงกับ Project.ProjectTypes.TypeName เป๊ะๆ (seed ไว้ใน Part 4 script)
//         // ===========================================================================
//         private static readonly Dictionary<string, string[]> PhaseTemplates = new()
//         {
//             ["Web Application"] = new[]
//             {
//                 "Requirement Gathering",
//                 "UI/UX Design",
//                 "Frontend Development",
//                 "Backend Development",
//                 "API Integration",
//                 "Testing (QA)",
//                 "Deployment"
//             },
//             ["Mobile Application"] = new[]
//             {
//                 "Requirement Gathering",
//                 "UI/UX Design",
//                 "Mobile App Development",
//                 "API Integration",
//                 "Testing on Devices",
//                 "App Store / Play Store Submission",
//                 "Deployment / Release"
//             },
//             ["API / Microservice"] = new[]
//             {
//                 "Requirement & Endpoint Design",
//                 "Database Schema Design",
//                 "API Development",
//                 "Authentication & Security",
//                 "API Testing (Unit/Postman)",
//                 "Documentation",
//                 "Deployment"
//             },
//             ["Desktop Application"] = new[]
//             {
//                 "Requirement Gathering",
//                 "UI Design",
//                 "Core Development",
//                 "Database Integration",
//                 "Testing",
//                 "Packaging & Installer",
//                 "Deployment / Rollout"
//             }
//         };

//         // ===========================================================================
//         // Master Data
//         // ===========================================================================
//         public async Task<List<ProjectTypeDto>> GetProjectTypesAsync()
//         {
//             return await _context.ProjectTypes
//                 .Where(pt => pt.IsActive)
//                 .OrderBy(pt => pt.SortOrder)
//                 .Select(pt => new ProjectTypeDto { ProjectTypeId = pt.ProjectTypeId, TypeName = pt.TypeName })
//                 .ToListAsync();
//         }

//         public async Task<List<UserOptionDto>> GetUsersAsync()
//         {
//             return await _context.Users
//                 .Where(u => u.IsActive && !u.IsSuspended)
//                 .OrderBy(u => u.FullName)
//                 .Select(u => new UserOptionDto { UserId = u.UserId, EmpId = u.EmpId, FullName = u.FullName })
//                 .ToListAsync();
//         }

//         // ===========================================================================
//         // Project
//         // ===========================================================================
//         public async Task<List<SoloProjectDto>> GetProjectsAsync()
//         {
//             return await _context.Projects
//                 .Where(p => p.IsActive)
//                 .Include(p => p.ProjectType)
//                 .Include(p => p.Owner)
//                 .OrderByDescending(p => p.CreatedDate)
//                 .Select(p => MapToSoloProjectDto(p))
//                 .ToListAsync();
//         }

//         public async Task<SoloProjectDetailDto?> GetProjectDetailAsync(int projectId)
//         {
//             var project = await _context.Projects
//                 .Include(p => p.ProjectType)
//                 .Include(p => p.Owner)
//                 .FirstOrDefaultAsync(p => p.ProjectId == projectId && p.IsActive);

//             if (project == null) return null;

//             var phases = await _context.Milestones
//                 .Where(m => m.ProjectId == projectId)
//                 .Include(m => m.Owner)
//                 .Include(m => m.Tasks)
//                 .OrderBy(m => m.SortOrder)
//                 .ToListAsync();

//             var stacks = await _context.TechStacks
//                 .Where(ts => ts.ProjectId == projectId)
//                 .OrderBy(ts => ts.SortOrder)
//                 .ToListAsync();

//             var showcases = await _context.ShowcaseItems
//                 .Where(si => si.ProjectId == projectId)
//                 .OrderBy(si => si.SortOrder)
//                 .ToListAsync();

//             return new SoloProjectDetailDto
//             {
//                 Project = MapToSoloProjectDto(project),
//                 Phases = phases.Select(MapToPhaseDto).ToList(),
//                 Stacks = stacks.Select(MapToStackItemDto).ToList(),
//                 Showcases = showcases.Select(MapToWorkItemDto).ToList()
//             };
//         }

//         public async Task<SoloProjectDto> CreateProjectAsync(CreateSoloProjectRequest request, int currentUserId)
//         {
//             var project = new Projects
//             {
//                 ProjectCode = await GenerateProjectCodeAsync(),
//                 ProjectName = request.ProjectName,
//                 Description = request.Description,
//                 ProjectTypeId = request.ProjectTypeId,
//                 DivisionName = request.DivisionName,
//                 RequesterName = request.RequesterName,
//                 ProjectOwnerId = request.ProjectOwnerId,
//                 Priority = request.Priority,
//                 Status = request.Status,
//                 StartDate = request.StartDate,
//                 EndDate = request.EndDate,
//                 CreatedBy = currentUserId,
//                 IsActive = true
//             };

//             _context.Projects.Add(project);
//             await _context.SaveChangesAsync();

//             await _context.Entry(project).Reference(p => p.ProjectType).LoadAsync();
//             await _context.Entry(project).Reference(p => p.Owner).LoadAsync();

//             return MapToSoloProjectDto(project);
//         }

//         public async Task<SoloProjectDto?> UpdateProjectAsync(UpdateSoloProjectRequest request, int currentUserId)
//         {
//             var project = await _context.Projects
//                 .Include(p => p.ProjectType)
//                 .Include(p => p.Owner)
//                 .FirstOrDefaultAsync(p => p.ProjectId == request.ProjectId && p.IsActive);

//             if (project == null) return null;

//             if (project.Status != request.Status)
//             {
//                 _context.StatusHistory.Add(new StatusHistory
//                 {
//                     ProjectId = project.ProjectId,
//                     OldStatus = project.Status,
//                     NewStatus = request.Status,
//                     ChangedBy = currentUserId
//                 });
//             }

//             project.ProjectName = request.ProjectName;
//             project.Description = request.Description;
//             project.ProjectTypeId = request.ProjectTypeId;
//             project.DivisionName = request.DivisionName;
//             project.RequesterName = request.RequesterName;
//             project.ProjectOwnerId = request.ProjectOwnerId;
//             project.Priority = request.Priority;
//             project.Status = request.Status;
//             project.StartDate = request.StartDate;
//             project.EndDate = request.EndDate;
//             project.UpdatedDate = DateTimeOffset.UtcNow;

//             await _context.SaveChangesAsync();
//             return MapToSoloProjectDto(project);
//         }

//         public async Task<bool> DeleteProjectAsync(int projectId)
//         {
//             var project = await _context.Projects.FindAsync(projectId);
//             if (project == null) return false;

//             // ลบจริง (Hard Delete) ตามที่ต้องการ — ต้องเคลียร์ตารางที่ไม่ได้ตั้ง Cascade ไว้ก่อน
//             // ไม่งั้น SQL Server จะโยน FK constraint error กลับมา

//             // 1. StatusHistory อ้างอิง ProjectId แบบ NoAction (ไม่ Cascade) — ลบทิ้งเพราะเป็นแค่ Log
//             var histories = _context.StatusHistory.Where(h => h.ProjectId == projectId);
//             _context.StatusHistory.RemoveRange(histories);

//             // 2. Planning.Events อาจ Link มาที่โปรเจกต์นี้แบบ NoAction — ตัดการเชื่อมโยงแทนการลบ Event ทิ้ง
//             var linkedEvents = await _context.Events.Where(e => e.LinkedProjectId == projectId).ToListAsync();
//             foreach (var ev in linkedEvents)
//             {
//                 ev.LinkedProjectId = null;
//             }

//             // 3. ลบ Project หลัก — ตารางลูกที่เหลือ (Members/Milestones/Tasks/TechStacks/ShowcaseItems/Comments/Attachments)
//             //    ตั้ง ON DELETE CASCADE ไว้แล้วใน AppDbContext จะถูกลบตามให้อัตโนมัติ
//             _context.Projects.Remove(project);

//             await _context.SaveChangesAsync();
//             return true;
//         }

//         // ===========================================================================
//         // Phase (Milestone)
//         // ===========================================================================
//         public async Task<PhaseDto> CreatePhaseAsync(CreatePhaseRequest request)
//         {
//             var maxSort = await _context.Milestones
//                 .Where(m => m.ProjectId == request.ProjectId)
//                 .Select(m => (int?)m.SortOrder)
//                 .MaxAsync() ?? 0;

//             var milestone = new Milestones
//             {
//                 ProjectId = request.ProjectId,
//                 MilestoneName = request.MilestoneName,
//                 OwnerId = request.OwnerId,
//                 DueDate = request.DueDate,
//                 Status = request.Status,
//                 SortOrder = request.SortOrder > 0 ? request.SortOrder : maxSort + 1
//             };

//             _context.Milestones.Add(milestone);
//             await _context.SaveChangesAsync();

//             await _context.Entry(milestone).Reference(m => m.Owner).LoadAsync();
//             milestone.Tasks = new List<Tasks>();

//             return MapToPhaseDto(milestone);
//         }

//         public async Task<PhaseDto?> UpdatePhaseAsync(UpdatePhaseRequest request)
//         {
//             var milestone = await _context.Milestones
//                 .Include(m => m.Owner)
//                 .Include(m => m.Tasks)
//                 .FirstOrDefaultAsync(m => m.MilestoneId == request.MilestoneId);

//             if (milestone == null) return null;

//             milestone.MilestoneName = request.MilestoneName;
//             milestone.OwnerId = request.OwnerId;
//             milestone.DueDate = request.DueDate;
//             milestone.Status = request.Status;
//             if (request.SortOrder > 0) milestone.SortOrder = request.SortOrder;

//             if (request.Status == "COMPLETED" && milestone.CompletedDate == null)
//                 milestone.CompletedDate = DateOnly.FromDateTime(DateTime.UtcNow);

//             await _context.SaveChangesAsync();
//             return MapToPhaseDto(milestone);
//         }

//         public async Task<bool> DeletePhaseAsync(int milestoneId)
//         {
//             var milestone = await _context.Milestones.FindAsync(milestoneId);
//             if (milestone == null) return false;

//             // Cascade ลบ Task ที่อยู่ใน Phase นี้ไปด้วยตาม FK Constraint (ONDELETE ไม่ Cascade — ต้องลบเองก่อน)
//             var tasks = _context.Tasks.Where(t => t.MilestoneId == milestoneId);
//             _context.Tasks.RemoveRange(tasks);

//             _context.Milestones.Remove(milestone);
//             await _context.SaveChangesAsync();
//             return true;
//         }

//         // ===========================================================================
//         // Auto-Generate Phases — สร้างชุด Phase มาตรฐานตาม Project Type
//         // ถ้าโปรเจกต์นี้มี Phase อยู่แล้ว (กันกดซ้ำ/กันสร้างซ้อน) จะไม่สร้างใหม่
//         // แต่ส่งชุดที่มีอยู่แล้วกลับไปแทน เพื่อให้ frontend เอาไป setPhases ได้เลย
//         // ===========================================================================
//         public async Task<List<PhaseDto>> AutoGeneratePhasesAsync(int projectId)
//         {
//             var project = await _context.Projects
//                 .Include(p => p.ProjectType)
//                 .FirstOrDefaultAsync(p => p.ProjectId == projectId && p.IsActive);

//             if (project == null)
//                 throw new InvalidOperationException("ไม่พบโปรเจกต์นี้");

//             var existing = await _context.Milestones
//                 .Where(m => m.ProjectId == projectId)
//                 .Include(m => m.Owner)
//                 .Include(m => m.Tasks)
//                 .OrderBy(m => m.SortOrder)
//                 .ToListAsync();

//             if (existing.Any())
//             {
//                 return existing.Select(MapToPhaseDto).ToList();
//             }

//             var typeName = project.ProjectType?.TypeName ?? string.Empty;
//             if (!PhaseTemplates.TryGetValue(typeName, out var template))
//             {
//                 // Fallback เผื่อมี Project Type ใหม่ในอนาคตที่ยังไม่ได้กำหนด Template
//                 template = PhaseTemplates["Web Application"];
//             }

//             var milestones = template.Select((name, index) => new Milestones
//             {
//                 ProjectId = projectId,
//                 MilestoneName = name,
//                 Status = "PENDING",
//                 SortOrder = index + 1
//             }).ToList();

//             _context.Milestones.AddRange(milestones);
//             await _context.SaveChangesAsync();

//             foreach (var m in milestones)
//             {
//                 m.Tasks = new List<Tasks>();
//             }

//             return milestones.Select(MapToPhaseDto).ToList();
//         }

//         // ===========================================================================
//         // TaskItem (Task)
//         // ===========================================================================
//         public async Task<TaskItemDto> CreateTaskItemAsync(CreateTaskItemRequest request, int currentUserId)
//         {
//             var task = new Tasks
//             {
//                 ProjectId = request.ProjectId,
//                 MilestoneId = request.MilestoneId,
//                 TaskName = request.Title,
//                 Description = request.Detail,
//                 Status = "TODO",
//                 CreatedBy = currentUserId
//             };

//             _context.Tasks.Add(task);
//             await _context.SaveChangesAsync();

//             return MapToTaskItemDto(task);
//         }

//         public async Task<TaskItemDto?> UpdateTaskItemAsync(UpdateTaskItemRequest request)
//         {
//             var task = await _context.Tasks.FindAsync(request.TaskId);
//             if (task == null) return null;

//             task.TaskName = request.Title;
//             task.Description = request.Detail;

//             var wasCompleted = task.Status == "DONE";
//             if (request.Completed && !wasCompleted)
//             {
//                 task.Status = "DONE";
//                 task.CompletedDate = DateOnly.FromDateTime(DateTime.UtcNow);
//                 task.ProgressPercent = 100;
//             }
//             else if (!request.Completed && wasCompleted)
//             {
//                 task.Status = "TODO";
//                 task.CompletedDate = null;
//                 task.ProgressPercent = 0;
//             }

//             task.UpdatedDate = DateTimeOffset.UtcNow;
//             await _context.SaveChangesAsync();
//             // หมายเหตุ: Trigger Trg_UpdateProjectProgress ฝั่ง DB จะคำนวณ Projects.ProgressPercent ให้อัตโนมัติ
//             return MapToTaskItemDto(task);
//         }

//         public async Task<bool> DeleteTaskItemAsync(int taskId)
//         {
//             var task = await _context.Tasks.FindAsync(taskId);
//             if (task == null) return false;

//             _context.Tasks.Remove(task);
//             await _context.SaveChangesAsync();
//             return true;
//         }

//         // ===========================================================================
//         // StackItem (TechStack)
//         // ===========================================================================
//         public async Task<StackItemDto> CreateStackItemAsync(CreateStackItemRequest request)
//         {
//             var stack = new TechStacks
//             {
//                 ProjectId = request.ProjectId,
//                 StackType = request.Type,
//                 StackName = request.Name,
//                 Version = request.Version,
//                 Layer = request.Layer
//             };

//             _context.TechStacks.Add(stack);
//             await _context.SaveChangesAsync();
//             return MapToStackItemDto(stack);
//         }

//         public async Task<bool> DeleteStackItemAsync(int techStackId)
//         {
//             var stack = await _context.TechStacks.FindAsync(techStackId);
//             if (stack == null) return false;

//             _context.TechStacks.Remove(stack);
//             await _context.SaveChangesAsync();
//             return true;
//         }

//         // ===========================================================================
//         // WorkItem (ShowcaseItem)
//         // ===========================================================================
//         public async Task<WorkItemDto> CreateWorkItemAsync(CreateWorkItemRequest request, int currentUserId)
//         {
//             var showcase = new ShowcaseItems
//             {
//                 ProjectId = request.ProjectId,
//                 Title = request.Title,
//                 Description = request.Description,
//                 FlowDescription = request.FlowDescription,
//                 ImageUrl = request.ImageUrl,
//                 CreatedBy = currentUserId
//             };

//             _context.ShowcaseItems.Add(showcase);
//             await _context.SaveChangesAsync();
//             return MapToWorkItemDto(showcase);
//         }

//         public async Task<bool> DeleteWorkItemAsync(int showcaseItemId)
//         {
//             var showcase = await _context.ShowcaseItems.FindAsync(showcaseItemId);
//             if (showcase == null) return false;

//             _context.ShowcaseItems.Remove(showcase);
//             await _context.SaveChangesAsync();
//             return true;
//         }

//         // ===========================================================================
//         // Helpers
//         // ===========================================================================
//         private async Task<string> GenerateProjectCodeAsync()
//         {
//             var year = DateTime.UtcNow.Year;
//             var prefix = $"PRJ-{year}-";

//             var lastCode = await _context.Projects
//                 .Where(p => p.ProjectCode.StartsWith(prefix))
//                 .OrderByDescending(p => p.ProjectCode)
//                 .Select(p => p.ProjectCode)
//                 .FirstOrDefaultAsync();

//             var nextSeq = 1;
//             if (lastCode != null && int.TryParse(lastCode.Substring(prefix.Length), out var lastSeq))
//             {
//                 nextSeq = lastSeq + 1;
//             }

//             return $"{prefix}{nextSeq:D3}";
//         }

//         private static SoloProjectDto MapToSoloProjectDto(Projects p) => new()
//         {
//             ProjectId = p.ProjectId,
//             ProjectCode = p.ProjectCode,
//             ProjectName = p.ProjectName,
//             Description = p.Description,
//             ProjectTypeId = p.ProjectTypeId ?? 0,
//             ProjectTypeName = p.ProjectType?.TypeName ?? string.Empty,
//             DivisionName = p.DivisionName,
//             RequesterName = p.RequesterName,
//             ProjectOwnerId = p.ProjectOwnerId,
//             OwnerName = p.Owner?.FullName ?? string.Empty,
//             Status = p.Status,
//             Priority = p.Priority,
//             StartDate = p.StartDate,
//             EndDate = p.EndDate,
//             ProgressPercent = p.ProgressPercent
//         };

//         private static PhaseDto MapToPhaseDto(Milestones m) => new()
//         {
//             MilestoneId = m.MilestoneId,
//             ProjectId = m.ProjectId,
//             MilestoneName = m.MilestoneName,
//             OwnerId = m.OwnerId,
//             OwnerName = m.Owner?.FullName,
//             DueDate = m.DueDate,
//             CompletedDate = m.CompletedDate,
//             Status = m.Status,
//             SortOrder = m.SortOrder,
//             Items = m.Tasks?.Select(MapToTaskItemDto).ToList() ?? new List<TaskItemDto>()
//         };

//         private static TaskItemDto MapToTaskItemDto(Tasks t) => new()
//         {
//             TaskId = t.TaskId,
//             MilestoneId = t.MilestoneId ?? 0,
//             Title = t.TaskName,
//             Detail = t.Description,
//             Completed = t.Status == "DONE"
//         };

//         private static StackItemDto MapToStackItemDto(TechStacks ts) => new()
//         {
//             TechStackId = ts.TechStackId,
//             ProjectId = ts.ProjectId,
//             Type = ts.StackType,
//             Name = ts.StackName,
//             Version = ts.Version,
//             Layer = ts.Layer
//         };

//         private static WorkItemDto MapToWorkItemDto(ShowcaseItems si) => new()
//         {
//             ShowcaseItemId = si.ShowcaseItemId,
//             ProjectId = si.ProjectId,
//             Title = si.Title,
//             Description = si.Description,
//             FlowDescription = si.FlowDescription,
//             ImageUrl = si.ImageUrl,
//             CreatedDate = si.CreatedDate
//         };
//     }
// }
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.DTOs;
using backend.Models.Project;
using backend.Models.Flow;

namespace backend.Services
{
    public class ProjectSoloService : IProjectSoloService
    {
        private readonly AppDbContext _context;
        private readonly IAuditLogService _auditLogService;

        public ProjectSoloService(AppDbContext context, IAuditLogService auditLogService)
        {
            _context = context;
            _auditLogService = auditLogService;
        }

        private static readonly Dictionary<string, string[]> PhaseTemplates = new()
        {
            ["Web Application"] = new[]
            {
                "Requirement Gathering", "UI/UX Design", "Frontend Development",
                "Backend Development", "API Integration", "Testing (QA)", "Deployment"
            },
            ["Mobile Application"] = new[]
            {
                "Requirement Gathering", "UI/UX Design", "Mobile App Development",
                "API Integration", "Testing on Devices", "App Store / Play Store Submission", "Deployment / Release"
            },
            ["API / Microservice"] = new[]
            {
                "Requirement & Endpoint Design", "Database Schema Design", "API Development",
                "Authentication & Security", "API Testing (Unit/Postman)", "Documentation", "Deployment"
            },
            ["Desktop Application"] = new[]
            {
                "Requirement Gathering", "UI Design", "Core Development",
                "Database Integration", "Testing", "Packaging & Installer", "Deployment / Rollout"
            }
        };

        // ===========================================================================
        // Master Data
        // ===========================================================================
        public async Task<List<ProjectTypeDto>> GetProjectTypesAsync()
        {
            return await _context.ProjectTypes
                .Where(pt => pt.IsActive)
                .OrderBy(pt => pt.SortOrder)
                .Select(pt => new ProjectTypeDto { ProjectTypeId = pt.ProjectTypeId, TypeName = pt.TypeName })
                .ToListAsync();
        }

        // ★ เพิ่มเมธอดนี้ — ที่ทำให้ build error หายไป
        public async Task<List<UserOptionDto>> GetUsersAsync()
        {
            return await _context.Users
                .Where(u => u.IsActive && !u.IsSuspended)
                .OrderBy(u => u.FullName)
                .Select(u => new UserOptionDto { UserId = u.UserId, EmpId = u.EmpId, FullName = u.FullName })
                .ToListAsync();
        }

        // ===========================================================================
        // Project
        // ===========================================================================
        public async Task<List<SoloProjectDto>> GetProjectsAsync()
        {
            // Solo = ไม่มีสมาชิกใน ProjectMembers เลย (ตรงข้ามกับเงื่อนไข Team ใน ProjectTeamService)
            // เดิม Query นี้ไม่มีเงื่อนไขนี้ ทำให้ Project ที่มีสมาชิกทีม (Team Project) หลุดมาแสดงในหน้า Solo ด้วย
            return await _context.Projects
                .Where(p => p.IsActive && !p.Members.Any())
                .Include(p => p.ProjectType)
                .Include(p => p.Owner)
                .OrderByDescending(p => p.CreatedDate)
                .Select(p => MapToSoloProjectDto(p))
                .ToListAsync();
        }

        public async Task<SoloProjectDetailDto?> GetProjectDetailAsync(int projectId)
        {
            var project = await _context.Projects
                .Include(p => p.ProjectType)
                .Include(p => p.Owner)
                .FirstOrDefaultAsync(p => p.ProjectId == projectId && p.IsActive);

            if (project == null) return null;

            var phases = await _context.Milestones
                .Where(m => m.ProjectId == projectId)
                .Include(m => m.Owner)
                .Include(m => m.Tasks)
                .OrderBy(m => m.SortOrder)
                .ToListAsync();

            var stacks = await _context.TechStacks
                .Where(ts => ts.ProjectId == projectId)
                .OrderBy(ts => ts.SortOrder)
                .ToListAsync();

            var showcases = await _context.ShowcaseItems
                .Where(si => si.ProjectId == projectId)
                .OrderBy(si => si.SortOrder)
                .ToListAsync();

            return new SoloProjectDetailDto
            {
                Project = MapToSoloProjectDto(project),
                Phases = phases.Select(MapToPhaseDto).ToList(),
                Stacks = stacks.Select(MapToStackItemDto).ToList(),
                Showcases = showcases.Select(MapToWorkItemDto).ToList()
            };
        }

        public async Task<SoloProjectDto> CreateProjectAsync(CreateSoloProjectRequest request, int currentUserId)
        {
            var project = new Projects
            {
                ProjectCode = await GenerateProjectCodeAsync(),
                ProjectName = request.ProjectName,
                Description = request.Description,
                ProjectTypeId = request.ProjectTypeId,
                DivisionName = request.DivisionName,
                RequesterName = request.RequesterName,
                ProjectOwnerId = request.ProjectOwnerId,
                Priority = request.Priority,
                Status = request.Status,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                CreatedBy = currentUserId,
                IsActive = true
            };

            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            await _context.Entry(project).Reference(p => p.ProjectType).LoadAsync();
            await _context.Entry(project).Reference(p => p.Owner).LoadAsync();

            await EnsureFlowDefinitionAsync(project, "SOLO");
            await _auditLogService.LogAsync(currentUserId, "SOLO", "INSERT",
                $"สร้างโปรเจกต์ Solo: {project.ProjectName} ({project.ProjectCode})", project.ProjectId.ToString());

            return MapToSoloProjectDto(project);
        }

        public async Task<SoloProjectDto?> UpdateProjectAsync(UpdateSoloProjectRequest request, int currentUserId)
        {
            var project = await _context.Projects
                .Include(p => p.ProjectType)
                .Include(p => p.Owner)
                .FirstOrDefaultAsync(p => p.ProjectId == request.ProjectId && p.IsActive);

            if (project == null) return null;

            if (project.Status != request.Status)
            {
                _context.StatusHistory.Add(new StatusHistory
                {
                    ProjectId = project.ProjectId,
                    OldStatus = project.Status,
                    NewStatus = request.Status,
                    ChangedBy = currentUserId
                });
            }

            project.ProjectName = request.ProjectName;
            project.Description = request.Description;
            project.ProjectTypeId = request.ProjectTypeId;
            project.DivisionName = request.DivisionName;
            project.RequesterName = request.RequesterName;
            project.ProjectOwnerId = request.ProjectOwnerId;
            project.Priority = request.Priority;
            project.Status = request.Status;
            project.StartDate = request.StartDate;
            project.EndDate = request.EndDate;
            project.UpdatedDate = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();

            await EnsureFlowDefinitionAsync(project, "SOLO");
            await _auditLogService.LogAsync(currentUserId, "SOLO", "UPDATE",
                $"แก้ไขโปรเจกต์ Solo: {project.ProjectName} ({project.ProjectCode})", project.ProjectId.ToString());

            return MapToSoloProjectDto(project);
        }

        public async Task<bool> DeleteProjectAsync(int projectId, int currentUserId)
        {
            var project = await _context.Projects.FindAsync(projectId);
            if (project == null) return false;

            var projectName = project.ProjectName;
            var projectCode = project.ProjectCode;

            // Hard Delete: ตัดความสัมพันธ์ที่ไม่ได้ตั้ง Cascade ไว้ (รักษาประวัติ/ไม่ผูกกับ Project โดยตรง) ก่อนลบจริง
            // ส่วนตารางลูกที่ Cascade อยู่แล้ว (Members/Milestones/Tasks/TechStacks/ShowcaseItems/Comments/Attachments/FlowDefinitions)
            // จะถูกลบอัตโนมัติโดย Database เมื่อลบแถว Project
            var taskIds = await _context.Tasks
                .Where(t => t.ProjectId == projectId)
                .Select(t => t.TaskId)
                .ToListAsync();

            var histories = _context.StatusHistory
                .Where(h => h.ProjectId == projectId || (h.TaskId != null && taskIds.Contains(h.TaskId.Value)));
            _context.StatusHistory.RemoveRange(histories);

            var linkedEvents = await _context.Events
                .Where(e => e.LinkedProjectId == projectId || (e.LinkedTaskId != null && taskIds.Contains(e.LinkedTaskId.Value)))
                .ToListAsync();
            foreach (var ev in linkedEvents)
            {
                if (ev.LinkedProjectId == projectId) ev.LinkedProjectId = null;
                if (ev.LinkedTaskId != null && taskIds.Contains(ev.LinkedTaskId.Value)) ev.LinkedTaskId = null;
            }

            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();

            await _auditLogService.LogAsync(currentUserId, "SOLO", "DELETE",
                $"ลบโปรเจกต์ Solo: {projectName} ({projectCode})", projectId.ToString());

            return true;
        }

        // ===========================================================================
        // Phase (Milestone)
        // ===========================================================================
        public async Task<PhaseDto> CreatePhaseAsync(CreatePhaseRequest request)
        {
            var maxSort = await _context.Milestones
                .Where(m => m.ProjectId == request.ProjectId)
                .Select(m => (int?)m.SortOrder)
                .MaxAsync() ?? 0;

            var milestone = new Milestones
            {
                ProjectId = request.ProjectId,
                MilestoneName = request.MilestoneName,
                OwnerId = request.OwnerId,
                StartDate = request.StartDate,   // ★ เพิ่ม
                DueDate = request.DueDate,
                Status = request.Status,
                SortOrder = request.SortOrder > 0 ? request.SortOrder : maxSort + 1
            };

            _context.Milestones.Add(milestone);
            await _context.SaveChangesAsync();

            await _context.Entry(milestone).Reference(m => m.Owner).LoadAsync();
            milestone.Tasks = new List<Tasks>();

            return MapToPhaseDto(milestone);
        }

        // public async Task<PhaseDto?> UpdatePhaseAsync(UpdatePhaseRequest request)
        // {
        //     var milestone = await _context.Milestones
        //         .Include(m => m.Owner)
        //         .Include(m => m.Tasks)
        //         .FirstOrDefaultAsync(m => m.MilestoneId == request.MilestoneId);

        //     if (milestone == null) return null;

        //     milestone.MilestoneName = request.MilestoneName;
        //     milestone.OwnerId = request.OwnerId;
        //     milestone.StartDate = request.StartDate;   // ★ เพิ่ม — จุดที่ทำให้วันที่ไม่เคยถูกบันทึกมาก่อน
        //     milestone.DueDate = request.DueDate;
        //     milestone.Status = request.Status;
        //     if (request.SortOrder > 0) milestone.SortOrder = request.SortOrder;

        //     if (request.Status == "COMPLETED" && milestone.CompletedDate == null)
        //         milestone.CompletedDate = DateOnly.FromDateTime(DateTime.UtcNow);

        //     await _context.SaveChangesAsync();
        //     return MapToPhaseDto(milestone);
        // }
        public async Task<PhaseDto?> UpdatePhaseAsync(UpdatePhaseRequest request)
        {
            var milestone = await _context.Milestones
                .FirstOrDefaultAsync(m => m.MilestoneId == request.MilestoneId);

            if (milestone == null) return null;

            milestone.MilestoneName = request.MilestoneName;
            milestone.OwnerId = request.OwnerId;
            milestone.StartDate = request.StartDate;   // บันทึก StartDate ลง DB
            milestone.DueDate = request.DueDate;       // บันทึก DueDate ลง DB
            milestone.Status = request.Status;

            await _context.SaveChangesAsync();
            return MapToPhaseDto(milestone);
        }

        public async Task<bool> DeletePhaseAsync(int milestoneId)
        {
            var milestone = await _context.Milestones.FindAsync(milestoneId);
            if (milestone == null) return false;

            var tasks = _context.Tasks.Where(t => t.MilestoneId == milestoneId);
            _context.Tasks.RemoveRange(tasks);

            _context.Milestones.Remove(milestone);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<PhaseDto>> AutoGeneratePhasesAsync(int projectId)
        {
            var project = await _context.Projects
                .Include(p => p.ProjectType)
                .FirstOrDefaultAsync(p => p.ProjectId == projectId && p.IsActive);

            if (project == null)
                throw new InvalidOperationException("ไม่พบโปรเจกต์นี้");

            var existing = await _context.Milestones
                .Where(m => m.ProjectId == projectId)
                .Include(m => m.Owner)
                .Include(m => m.Tasks)
                .OrderBy(m => m.SortOrder)
                .ToListAsync();

            if (existing.Any())
            {
                return existing.Select(MapToPhaseDto).ToList();
            }

            var typeName = project.ProjectType?.TypeName ?? string.Empty;
            if (!PhaseTemplates.TryGetValue(typeName, out var template))
            {
                template = PhaseTemplates["Web Application"];
            }

            var milestones = template.Select((name, index) => new Milestones
            {
                ProjectId = projectId,
                MilestoneName = name,
                Status = "PENDING",
                SortOrder = index + 1
            }).ToList();

            _context.Milestones.AddRange(milestones);
            await _context.SaveChangesAsync();

            foreach (var m in milestones)
            {
                m.Tasks = new List<Tasks>();
            }

            return milestones.Select(MapToPhaseDto).ToList();
        }

        // ===========================================================================
        // TaskItem (Task)
        // ===========================================================================
        public async Task<TaskItemDto> CreateTaskItemAsync(CreateTaskItemRequest request, int currentUserId)
        {
            var task = new Tasks
            {
                ProjectId = request.ProjectId,
                MilestoneId = request.MilestoneId,
                TaskName = request.Title,
                Description = request.Detail,
                Status = "TODO",
                CreatedBy = currentUserId
            };

            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();

            return MapToTaskItemDto(task);
        }

        public async Task<TaskItemDto?> UpdateTaskItemAsync(UpdateTaskItemRequest request)
        {
            var task = await _context.Tasks.FindAsync(request.TaskId);
            if (task == null) return null;

            task.TaskName = request.Title;
            task.Description = request.Detail;

            var wasCompleted = task.Status == "DONE";
            if (request.Completed && !wasCompleted)
            {
                task.Status = "DONE";
                task.CompletedDate = DateOnly.FromDateTime(DateTime.UtcNow);
                task.ProgressPercent = 100;
            }
            else if (!request.Completed && wasCompleted)
            {
                task.Status = "TODO";
                task.CompletedDate = null;
                task.ProgressPercent = 0;
            }

            task.UpdatedDate = DateTimeOffset.UtcNow;
            await _context.SaveChangesAsync();
            return MapToTaskItemDto(task);
        }

        public async Task<bool> DeleteTaskItemAsync(int taskId)
        {
            var task = await _context.Tasks.FindAsync(taskId);
            if (task == null) return false;

            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();
            return true;
        }

        // ===========================================================================
        // StackItem (TechStack)
        // ===========================================================================
        public async Task<StackItemDto> CreateStackItemAsync(CreateStackItemRequest request)
        {
            var stack = new TechStacks
            {
                ProjectId = request.ProjectId,
                StackType = request.Type,
                StackName = request.Name,
                Version = request.Version,
                Layer = request.Layer
            };

            _context.TechStacks.Add(stack);
            await _context.SaveChangesAsync();
            return MapToStackItemDto(stack);
        }

        public async Task<bool> DeleteStackItemAsync(int techStackId)
        {
            var stack = await _context.TechStacks.FindAsync(techStackId);
            if (stack == null) return false;

            _context.TechStacks.Remove(stack);
            await _context.SaveChangesAsync();
            return true;
        }

        // ===========================================================================
        // WorkItem (ShowcaseItem)
        // ===========================================================================
        public async Task<WorkItemDto> CreateWorkItemAsync(CreateWorkItemRequest request, int currentUserId)
        {
            var showcase = new ShowcaseItems
            {
                ProjectId = request.ProjectId,
                Title = request.Title,
                Description = request.Description,
                FlowDescription = request.FlowDescription,
                ImageUrl = request.ImageUrl,
                CreatedBy = currentUserId
            };

            _context.ShowcaseItems.Add(showcase);
            await _context.SaveChangesAsync();
            return MapToWorkItemDto(showcase);
        }

        public async Task<WorkItemDto?> UpdateWorkItemAsync(UpdateWorkItemRequest request)
        {
            var showcase = await _context.ShowcaseItems.FindAsync(request.ShowcaseItemId);
            if (showcase == null) return null;

            showcase.Title = request.Title;
            showcase.Description = request.Description;
            showcase.FlowDescription = request.FlowDescription;
            showcase.ImageUrl = request.ImageUrl;
            showcase.UpdatedDate = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();
            return MapToWorkItemDto(showcase);
        }

        public async Task<bool> DeleteWorkItemAsync(int showcaseItemId)
        {
            var showcase = await _context.ShowcaseItems.FindAsync(showcaseItemId);
            if (showcase == null) return false;

            _context.ShowcaseItems.Remove(showcase);
            await _context.SaveChangesAsync();
            return true;
        }

        // ===========================================================================
        // Flow 1:1 Binding — สร้าง/ซิงก์ Flow.FlowDefinitions ให้ผูกกับ Project นี้เสมอ
        // (ผู้ใช้กรอกข้อมูลที่หน้า Solo/Team เท่านั้น ฝั่ง Flow จะ Auto-Generate/Sync ให้อัตโนมัติ)
        // ===========================================================================
        private async Task EnsureFlowDefinitionAsync(Projects project, string workType)
        {
            var flow = await _context.FlowDefinitions.FirstOrDefaultAsync(f => f.ProjectId == project.ProjectId);

            if (flow == null)
            {
                _context.FlowDefinitions.Add(new FlowDefinitions
                {
                    ProjectId = project.ProjectId,
                    FlowCode = await GenerateFlowCodeAsync(),
                    Name = project.ProjectName,
                    Description = project.Description,
                    Status = MapProjectStatusToFlowStatus(project.Status),
                    WorkType = workType,
                    StartDate = project.StartDate,
                    EndDate = project.EndDate,
                    CreatedBy = project.CreatedBy,
                    IsActive = true
                });
            }
            else
            {
                flow.Name = project.ProjectName;
                flow.Description = project.Description;
                flow.Status = MapProjectStatusToFlowStatus(project.Status);
                flow.WorkType = workType;
                flow.StartDate = project.StartDate;
                flow.EndDate = project.EndDate;
                flow.UpdatedDate = DateTimeOffset.UtcNow;
            }

            await _context.SaveChangesAsync();
        }

        private static string MapProjectStatusToFlowStatus(string projectStatus) => projectStatus switch
        {
            "COMPLETED" => "COMPLETED",
            "CANCELLED" => "COMPLETED",
            "PLANNING" => "PLANNING",
            _ => "IN_PROGRESS" // IN_PROGRESS, ON_HOLD
        };

        private async Task<string> GenerateFlowCodeAsync()
        {
            var year = DateTime.UtcNow.Year;
            var prefix = $"FLOW-{year}-";

            var lastCode = await _context.FlowDefinitions
                .Where(f => f.FlowCode.StartsWith(prefix))
                .OrderByDescending(f => f.FlowCode)
                .Select(f => f.FlowCode)
                .FirstOrDefaultAsync();

            var nextSeq = 1;
            if (lastCode != null && int.TryParse(lastCode.Substring(prefix.Length), out var lastSeq))
            {
                nextSeq = lastSeq + 1;
            }

            return $"{prefix}{nextSeq:D3}";
        }

        // ===========================================================================
        // Helpers
        // ===========================================================================
        private async Task<string> GenerateProjectCodeAsync()
        {
            var year = DateTime.UtcNow.Year;
            var prefix = $"PRJ-{year}-";

            var lastCode = await _context.Projects
                .Where(p => p.ProjectCode.StartsWith(prefix))
                .OrderByDescending(p => p.ProjectCode)
                .Select(p => p.ProjectCode)
                .FirstOrDefaultAsync();

            var nextSeq = 1;
            if (lastCode != null && int.TryParse(lastCode.Substring(prefix.Length), out var lastSeq))
            {
                nextSeq = lastSeq + 1;
            }

            return $"{prefix}{nextSeq:D3}";
        }

        private static SoloProjectDto MapToSoloProjectDto(Projects p) => new()
        {
            ProjectId = p.ProjectId,
            ProjectCode = p.ProjectCode,
            ProjectName = p.ProjectName,
            Description = p.Description,
            ProjectTypeId = p.ProjectTypeId ?? 0,
            ProjectTypeName = p.ProjectType?.TypeName ?? string.Empty,
            DivisionName = p.DivisionName,
            RequesterName = p.RequesterName,
            ProjectOwnerId = p.ProjectOwnerId,
            OwnerName = p.Owner?.FullName ?? string.Empty,
            Status = p.Status,
            Priority = p.Priority,
            StartDate = p.StartDate,
            EndDate = p.EndDate,
            ProgressPercent = p.ProgressPercent
        };

        private static PhaseDto MapToPhaseDto(Milestones m) => new()
        {
            MilestoneId = m.MilestoneId,
            ProjectId = m.ProjectId,
            MilestoneName = m.MilestoneName,
            OwnerId = m.OwnerId,
            OwnerName = m.Owner?.FullName,
            StartDate = m.StartDate,   // ★ เพิ่ม
            DueDate = m.DueDate,
            CompletedDate = m.CompletedDate,
            Status = m.Status,
            SortOrder = m.SortOrder,
            Items = m.Tasks?.Select(MapToTaskItemDto).ToList() ?? new List<TaskItemDto>()
        };

        private static TaskItemDto MapToTaskItemDto(Tasks t) => new()
        {
            TaskId = t.TaskId,
            MilestoneId = t.MilestoneId ?? 0,
            Title = t.TaskName,
            Detail = t.Description,
            Completed = t.Status == "DONE"
        };

        private static StackItemDto MapToStackItemDto(TechStacks ts) => new()
        {
            TechStackId = ts.TechStackId,
            ProjectId = ts.ProjectId,
            Type = ts.StackType,
            Name = ts.StackName,
            Version = ts.Version,
            Layer = ts.Layer
        };

        private static WorkItemDto MapToWorkItemDto(ShowcaseItems si) => new()
        {
            ShowcaseItemId = si.ShowcaseItemId,
            ProjectId = si.ProjectId,
            Title = si.Title,
            Description = si.Description,
            FlowDescription = si.FlowDescription,
            ImageUrl = si.ImageUrl,
            CreatedDate = si.CreatedDate
        };
    }
}