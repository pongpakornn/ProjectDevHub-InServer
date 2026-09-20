using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.DTOs;
using backend.Models.Project;
using backend.Models.Flow;

namespace backend.Services
{
    // หมายเหตุ: โปรเจกต์ "Team" ใช้ตาราง Project.* ชุดเดียวกับ Solo ทั้งหมด (Projects/Milestones/Tasks/
    // TechStacks/ShowcaseItems) ต่างกันแค่ Team ผูก Project.ProjectMembers ไว้จริง (Solo สร้าง Project
    // แล้วไม่เคยเติมแถวใน ProjectMembers เลย) — จึงใช้ "มีสมาชิกใน ProjectMembers" เป็นตัวคัดกรองว่า
    // เป็นโปรเจกต์ทีมหรือไม่ โดยไม่ต้องเพิ่มคอลัมน์ใหม่ในตาราง Projects
    public class ProjectTeamService : IProjectTeamService
    {
        private readonly AppDbContext _context;
        private readonly IAuditLogService _auditLogService;

        public ProjectTeamService(AppDbContext context, IAuditLogService auditLogService)
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
        // Project
        // ===========================================================================
        public async Task<List<TeamProjectDto>> GetProjectsAsync(int userId)
        {
            // ★ Data Isolation: เห็นเฉพาะโปรเจกต์ Team ที่ตัวเองเป็นเจ้าของ หรือถูกเพิ่มเป็นสมาชิกทีม (ข้อยกเว้นเดียวของกติกา Data Isolation)
            var projects = await _context.Projects
                .Where(p => p.IsActive && p.Members.Any())
                .Where(ProjectAccess.For(userId))
                .Include(p => p.ProjectType)
                .Include(p => p.Owner)
                .Include(p => p.Members).ThenInclude(m => m.User)
                .OrderByDescending(p => p.CreatedDate)
                .ToListAsync();

            return projects.Select(MapToTeamProjectDto).ToList();
        }

        public async Task<TeamProjectDetailDto?> GetProjectDetailAsync(int projectId, int userId)
        {
            // ★ Data Isolation: เจ้าของหรือสมาชิกทีมของโปรเจกต์นี้เท่านั้นถึงจะเห็นรายละเอียดได้
            var project = await _context.Projects
                .Include(p => p.ProjectType)
                .Include(p => p.Owner)
                .Include(p => p.Members).ThenInclude(m => m.User)
                .FirstOrDefaultAsync(p => p.ProjectId == projectId && p.IsActive
                    && (p.ProjectOwnerId == userId || p.Members.Any(m => m.UserId == userId && m.IsActive)));

            if (project == null) return null;

            var phases = await _context.Milestones
                .Where(m => m.ProjectId == projectId)
                .Include(m => m.Owner)
                .Include(m => m.Tasks)
                .OrderBy(m => m.SortOrder)
                .ToListAsync();

            var taskIds = phases.SelectMany(m => m.Tasks).Select(t => t.TaskId).ToList();
            var assigneesByTask = await _context.TaskAssignees
                .Where(ta => taskIds.Contains(ta.TaskId))
                .Include(ta => ta.User)
                .ToListAsync();
            var assigneesLookup = assigneesByTask
                .GroupBy(ta => ta.TaskId)
                .ToDictionary(g => g.Key, g => g.Select(MapToTaskAssigneeDto).ToList());

            var stacks = await _context.TechStacks
                .Where(ts => ts.ProjectId == projectId)
                .OrderBy(ts => ts.SortOrder)
                .ToListAsync();

            var showcases = await _context.ShowcaseItems
                .Where(si => si.ProjectId == projectId)
                .OrderBy(si => si.SortOrder)
                .ToListAsync();

            return new TeamProjectDetailDto
            {
                Project = MapToTeamProjectDto(project),
                Phases = phases.Select(m => MapToTeamPhaseDto(m, assigneesLookup)).ToList(),
                Stacks = stacks.Select(MapToStackItemDto).ToList(),
                Showcases = showcases.Select(MapToWorkItemDto).ToList()
            };
        }

        public async Task<TeamProjectDto> CreateProjectAsync(CreateTeamProjectRequest request, int currentUserId)
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

            // เพิ่ม Owner เป็นสมาชิกทีม role OWNER + สมาชิกที่เลือกมาเป็น MEMBER (กันซ้ำกับ Owner)
            var memberUserIds = request.MemberUserIds
                .Where(id => id != request.ProjectOwnerId)
                .Distinct()
                .ToList();

            _context.ProjectMembers.Add(new ProjectMembers
            {
                ProjectId = project.ProjectId,
                UserId = request.ProjectOwnerId,
                RoleInProject = "OWNER"
            });

            foreach (var userId in memberUserIds)
            {
                _context.ProjectMembers.Add(new ProjectMembers
                {
                    ProjectId = project.ProjectId,
                    UserId = userId,
                    RoleInProject = "MEMBER"
                });
            }

            await _context.SaveChangesAsync();

            await _context.Entry(project).Reference(p => p.ProjectType).LoadAsync();
            await _context.Entry(project).Reference(p => p.Owner).LoadAsync();
            await _context.Entry(project).Collection(p => p.Members).LoadAsync();
            foreach (var m in project.Members)
            {
                await _context.Entry(m).Reference(x => x.User).LoadAsync();
            }

            await EnsureFlowDefinitionAsync(project, "TEAM");
            await _auditLogService.LogAsync(currentUserId, "TEAM", "INSERT",
                $"สร้างโปรเจกต์ Team: {project.ProjectName} ({project.ProjectCode})", project.ProjectId.ToString());

            return MapToTeamProjectDto(project);
        }

        public async Task<TeamProjectDto?> UpdateProjectAsync(UpdateTeamProjectRequest request, int currentUserId)
        {
            // ★ Data Isolation: แก้ไขได้เฉพาะเจ้าของหรือสมาชิกทีมของโปรเจกต์นี้เท่านั้น
            var project = await _context.Projects
                .Include(p => p.ProjectType)
                .Include(p => p.Owner)
                .Include(p => p.Members).ThenInclude(m => m.User)
                .FirstOrDefaultAsync(p => p.ProjectId == request.ProjectId && p.IsActive
                    && (p.ProjectOwnerId == currentUserId || p.Members.Any(m => m.UserId == currentUserId && m.IsActive)));

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

            // การจัดการสมาชิกทีมหลังสร้างโครงการ ให้ใช้ Endpoint /members โดยเฉพาะ (Add/Remove ทีละคน)
            // ไม่ Sync MemberUserIds ที่นี่ เพื่อไม่ให้ทับ Role/JoinedDate ที่ตั้งไว้แล้วโดยไม่ตั้งใจ

            await _context.Entry(project).Reference(p => p.Owner).LoadAsync();

            await EnsureFlowDefinitionAsync(project, "TEAM");
            await _auditLogService.LogAsync(currentUserId, "TEAM", "UPDATE",
                $"แก้ไขโปรเจกต์ Team: {project.ProjectName} ({project.ProjectCode})", project.ProjectId.ToString());

            return MapToTeamProjectDto(project);
        }

        public async Task<bool> DeleteProjectAsync(int projectId, int currentUserId)
        {
            // ★ Data Isolation: ลบทั้งโปรเจกต์ได้เฉพาะเจ้าของเท่านั้น (สมาชิกทีมทั่วไปลบโปรเจกต์ไม่ได้)
            var project = await _context.Projects.FirstOrDefaultAsync(p => p.ProjectId == projectId);
            if (project == null || project.ProjectOwnerId != currentUserId) return false;

            var projectName = project.ProjectName;
            var projectCode = project.ProjectCode;

            // Hard Delete: ตัดความสัมพันธ์ที่ไม่ได้ตั้ง Cascade ไว้ (รักษาประวัติ/ไม่ผูกกับ Project โดยตรง) ก่อนลบจริง
            var taskIds = await _context.Tasks
                .Where(t => t.ProjectId == projectId)
                .Select(t => t.TaskId)
                .ToListAsync();

            var histories = _context.StatusHistory
                .Where(h => h.ProjectId == projectId || (h.TaskId != null && taskIds.Contains(h.TaskId.Value)));
            _context.StatusHistory.RemoveRange(histories);

            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();

            await _auditLogService.LogAsync(currentUserId, "TEAM", "DELETE",
                $"ลบโปรเจกต์ Team: {projectName} ({projectCode})", projectId.ToString());

            return true;
        }

        // ===========================================================================
        // ProjectMembers
        // ===========================================================================
        public async Task<List<ProjectMemberDto>?> GetMembersAsync(int projectId, int userId)
        {
            // ★ Data Isolation: ดูรายชื่อสมาชิกได้เฉพาะเจ้าของ/สมาชิกทีมของโปรเจกต์นี้เท่านั้น
            var project = await _context.Projects.Include(p => p.Members)
                .FirstOrDefaultAsync(p => p.ProjectId == projectId);
            if (project == null || !ProjectAccess.IsAccessible(project, userId)) return null;

            return await _context.ProjectMembers
                .Where(pm => pm.ProjectId == projectId && pm.IsActive)
                .Include(pm => pm.User)
                .OrderBy(pm => pm.JoinedDate)
                .Select(pm => MapToProjectMemberDto(pm))
                .ToListAsync();
        }

        public async Task<ProjectMemberDto?> AddMemberAsync(int projectId, AddProjectMemberRequest request, int currentUserId)
        {
            // ★ Data Isolation: เพิ่มสมาชิกได้เฉพาะเจ้าของ/สมาชิกทีมของโปรเจกต์นี้เท่านั้น (ป้องกันคนนอกยัดตัวเองเข้าโปรเจกต์)
            var project = await _context.Projects.Include(p => p.Members)
                .FirstOrDefaultAsync(p => p.ProjectId == projectId);
            if (project == null || !ProjectAccess.IsAccessible(project, currentUserId)) return null;

            var existing = await _context.ProjectMembers
                .Include(pm => pm.User)
                .FirstOrDefaultAsync(pm => pm.ProjectId == projectId && pm.UserId == request.UserId);

            if (existing != null)
            {
                // เคยเป็นสมาชิกมาก่อนแล้วถูกลบออก (Soft Delete) — เพิ่มกลับเข้าทีมแทนการสร้างแถวซ้ำ (กัน Unique Constraint)
                existing.IsActive = true;
                existing.RoleInProject = request.RoleInProject;
                existing.JoinedDate = DateTimeOffset.UtcNow;
                await _context.SaveChangesAsync();
                return MapToProjectMemberDto(existing);
            }

            var member = new ProjectMembers
            {
                ProjectId = projectId,
                UserId = request.UserId,
                RoleInProject = request.RoleInProject
            };

            _context.ProjectMembers.Add(member);
            await _context.SaveChangesAsync();

            await _context.Entry(member).Reference(m => m.User).LoadAsync();
            return MapToProjectMemberDto(member);
        }

        public async Task<bool> RemoveMemberAsync(int projectId, int userId, int currentUserId)
        {
            // ★ Data Isolation: ลบสมาชิกได้เฉพาะเจ้าของ/สมาชิกทีมของโปรเจกต์นี้เท่านั้น
            var project = await _context.Projects.Include(p => p.Members)
                .FirstOrDefaultAsync(p => p.ProjectId == projectId);
            if (project == null || !ProjectAccess.IsAccessible(project, currentUserId)) return false;

            var member = await _context.ProjectMembers
                .FirstOrDefaultAsync(pm => pm.ProjectId == projectId && pm.UserId == userId && pm.IsActive);

            if (member == null) return false;

            member.IsActive = false;
            await _context.SaveChangesAsync();
            return true;
        }

        // ★ Data Isolation (IDOR Guard): ยืนยันว่า userId เป็นเจ้าของ/สมาชิกทีมของ ProjectId นี้จริง ก่อนให้
        // Create/Update/Delete ทรัพยากรลูกใดๆ (Phase/Task/Stack/Showcase) ของโปรเจกต์นั้น
        private async Task<bool> IsTeamProjectAccessibleAsync(int projectId, int userId)
        {
            var project = await _context.Projects.Include(p => p.Members)
                .FirstOrDefaultAsync(p => p.ProjectId == projectId);
            return project != null && ProjectAccess.IsAccessible(project, userId);
        }

        // ===========================================================================
        // Phase (Milestone)
        // ===========================================================================
        public async Task<TeamPhaseDto?> CreatePhaseAsync(CreatePhaseRequest request, int currentUserId)
        {
            if (!await IsTeamProjectAccessibleAsync(request.ProjectId, currentUserId)) return null;

            var maxSort = await _context.Milestones
                .Where(m => m.ProjectId == request.ProjectId)
                .Select(m => (int?)m.SortOrder)
                .MaxAsync() ?? 0;

            var milestone = new Milestones
            {
                ProjectId = request.ProjectId,
                MilestoneName = request.MilestoneName,
                OwnerId = request.OwnerId,
                StartDate = request.StartDate,
                DueDate = request.DueDate,
                Status = request.Status,
                SortOrder = request.SortOrder > 0 ? request.SortOrder : maxSort + 1
            };

            _context.Milestones.Add(milestone);
            await _context.SaveChangesAsync();

            await _context.Entry(milestone).Reference(m => m.Owner).LoadAsync();
            milestone.Tasks = new List<Tasks>();

            return MapToTeamPhaseDto(milestone, new Dictionary<int, List<TaskAssigneeDto>>());
        }

        public async Task<TeamPhaseDto?> UpdatePhaseAsync(UpdatePhaseRequest request, int currentUserId)
        {
            var milestone = await _context.Milestones
                .Include(m => m.Owner)
                .Include(m => m.Tasks)
                .FirstOrDefaultAsync(m => m.MilestoneId == request.MilestoneId);

            if (milestone == null) return null;
            if (!await IsTeamProjectAccessibleAsync(milestone.ProjectId, currentUserId)) return null;

            milestone.MilestoneName = request.MilestoneName;
            milestone.OwnerId = request.OwnerId;
            milestone.StartDate = request.StartDate;
            milestone.DueDate = request.DueDate;
            milestone.Status = request.Status;
            if (request.SortOrder > 0) milestone.SortOrder = request.SortOrder;

            if (request.Status == "COMPLETED" && milestone.CompletedDate == null)
                milestone.CompletedDate = DateOnly.FromDateTime(DateTime.UtcNow);

            await _context.SaveChangesAsync();

            var taskIds = milestone.Tasks.Select(t => t.TaskId).ToList();
            var assigneesLookup = await LoadAssigneesLookupAsync(taskIds);

            return MapToTeamPhaseDto(milestone, assigneesLookup);
        }

        public async Task<bool> DeletePhaseAsync(int milestoneId, int currentUserId)
        {
            var milestone = await _context.Milestones.FindAsync(milestoneId);
            if (milestone == null) return false;
            if (!await IsTeamProjectAccessibleAsync(milestone.ProjectId, currentUserId)) return false;

            var tasks = _context.Tasks.Where(t => t.MilestoneId == milestoneId);
            _context.Tasks.RemoveRange(tasks);

            _context.Milestones.Remove(milestone);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<TeamPhaseDto>> AutoGeneratePhasesAsync(int projectId, int currentUserId)
        {
            var project = await _context.Projects
                .Include(p => p.ProjectType)
                .Include(p => p.Members)
                .FirstOrDefaultAsync(p => p.ProjectId == projectId && p.IsActive);

            if (project == null || !ProjectAccess.IsAccessible(project, currentUserId))
                throw new InvalidOperationException("ไม่พบโปรเจกต์นี้");

            var existing = await _context.Milestones
                .Where(m => m.ProjectId == projectId)
                .Include(m => m.Owner)
                .Include(m => m.Tasks)
                .OrderBy(m => m.SortOrder)
                .ToListAsync();

            if (existing.Any())
            {
                var existingTaskIds = existing.SelectMany(m => m.Tasks).Select(t => t.TaskId).ToList();
                var existingAssignees = await LoadAssigneesLookupAsync(existingTaskIds);
                return existing.Select(m => MapToTeamPhaseDto(m, existingAssignees)).ToList();
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

            return milestones.Select(m => MapToTeamPhaseDto(m, new Dictionary<int, List<TaskAssigneeDto>>())).ToList();
        }

        // ===========================================================================
        // TaskItem (Task) + TaskAssignees
        // ===========================================================================
        public async Task<TeamTaskItemDto?> CreateTaskItemAsync(CreateTaskItemRequest request, int currentUserId)
        {
            if (!await IsTeamProjectAccessibleAsync(request.ProjectId, currentUserId)) return null;

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

            return MapToTeamTaskItemDto(task, new List<TaskAssigneeDto>());
        }

        public async Task<TeamTaskItemDto?> UpdateTaskItemAsync(UpdateTaskItemRequest request, int currentUserId)
        {
            var task = await _context.Tasks.FindAsync(request.TaskId);
            if (task == null) return null;
            if (!await IsTeamProjectAccessibleAsync(task.ProjectId, currentUserId)) return null;

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

            var assignees = await _context.TaskAssignees
                .Where(ta => ta.TaskId == task.TaskId)
                .Include(ta => ta.User)
                .Select(ta => MapToTaskAssigneeDto(ta))
                .ToListAsync();

            return MapToTeamTaskItemDto(task, assignees);
        }

        public async Task<bool> DeleteTaskItemAsync(int taskId, int currentUserId)
        {
            var task = await _context.Tasks.FindAsync(taskId);
            if (task == null) return false;
            if (!await IsTeamProjectAccessibleAsync(task.ProjectId, currentUserId)) return false;

            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<TaskAssigneeDto>?> AssignTaskAssigneesAsync(int taskId, AssignTaskAssigneesRequest request, int currentUserId)
        {
            var task = await _context.Tasks.FindAsync(taskId);
            if (task == null) return null;
            if (!await IsTeamProjectAccessibleAsync(task.ProjectId, currentUserId)) return null;

            var current = await _context.TaskAssignees.Where(ta => ta.TaskId == taskId).ToListAsync();
            var requestedIds = request.UserIds.Distinct().ToList();

            var toRemove = current.Where(ta => !requestedIds.Contains(ta.UserId)).ToList();
            _context.TaskAssignees.RemoveRange(toRemove);

            var currentIds = current.Select(ta => ta.UserId).ToHashSet();
            var toAdd = requestedIds.Where(id => !currentIds.Contains(id))
                .Select(id => new TaskAssignees { TaskId = taskId, UserId = id });
            _context.TaskAssignees.AddRange(toAdd);

            await _context.SaveChangesAsync();

            return await _context.TaskAssignees
                .Where(ta => ta.TaskId == taskId)
                .Include(ta => ta.User)
                .Select(ta => MapToTaskAssigneeDto(ta))
                .ToListAsync();
        }

        // ===========================================================================
        // StackItem (TechStack)
        // ===========================================================================
        public async Task<StackItemDto?> CreateStackItemAsync(CreateStackItemRequest request, int currentUserId)
        {
            if (!await IsTeamProjectAccessibleAsync(request.ProjectId, currentUserId)) return null;

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

        public async Task<bool> DeleteStackItemAsync(int techStackId, int currentUserId)
        {
            var stack = await _context.TechStacks.FindAsync(techStackId);
            if (stack == null) return false;
            if (!await IsTeamProjectAccessibleAsync(stack.ProjectId, currentUserId)) return false;

            _context.TechStacks.Remove(stack);
            await _context.SaveChangesAsync();
            return true;
        }

        // ===========================================================================
        // WorkItem (ShowcaseItem)
        // ===========================================================================
        public async Task<WorkItemDto?> CreateWorkItemAsync(CreateWorkItemRequest request, int currentUserId)
        {
            if (!await IsTeamProjectAccessibleAsync(request.ProjectId, currentUserId)) return null;

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

        public async Task<WorkItemDto?> UpdateWorkItemAsync(UpdateWorkItemRequest request, int currentUserId)
        {
            var showcase = await _context.ShowcaseItems.FindAsync(request.ShowcaseItemId);
            if (showcase == null) return null;
            if (!await IsTeamProjectAccessibleAsync(showcase.ProjectId, currentUserId)) return null;

            showcase.Title = request.Title;
            showcase.Description = request.Description;
            showcase.FlowDescription = request.FlowDescription;
            showcase.ImageUrl = request.ImageUrl;
            showcase.UpdatedDate = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();
            return MapToWorkItemDto(showcase);
        }

        public async Task<bool> DeleteWorkItemAsync(int showcaseItemId, int currentUserId)
        {
            var showcase = await _context.ShowcaseItems.FindAsync(showcaseItemId);
            if (showcase == null) return false;
            if (!await IsTeamProjectAccessibleAsync(showcase.ProjectId, currentUserId)) return false;

            _context.ShowcaseItems.Remove(showcase);
            await _context.SaveChangesAsync();
            return true;
        }

        // ===========================================================================
        // Comments
        // ===========================================================================
        public async Task<List<CommentDto>?> GetCommentsAsync(int projectId, int? taskId, int userId)
        {
            // ★ Data Isolation: ดูคอมเมนต์ได้เฉพาะเจ้าของ/สมาชิกทีมของโปรเจกต์นี้เท่านั้น
            var project = await _context.Projects.Include(p => p.Members)
                .FirstOrDefaultAsync(p => p.ProjectId == projectId);
            if (project == null || !ProjectAccess.IsAccessible(project, userId)) return null;

            var comments = taskId.HasValue
                ? await _context.Comments
                    .Where(c => c.TaskId == taskId.Value)
                    .Include(c => c.User)
                    .OrderBy(c => c.CreatedDate)
                    .ToListAsync()
                : await _context.Comments
                    .Where(c => c.ProjectId == projectId && c.TaskId == null)
                    .Include(c => c.User)
                    .OrderBy(c => c.CreatedDate)
                    .ToListAsync();

            return comments.Select(MapToCommentDto).ToList();
        }

        public async Task<CommentDto?> AddCommentAsync(int projectId, CreateCommentRequest request, int currentUserId)
        {
            var project = await _context.Projects.Include(p => p.Members)
                .FirstOrDefaultAsync(p => p.ProjectId == projectId);
            if (project == null || !ProjectAccess.IsAccessible(project, currentUserId)) return null;

            var comment = new Comments
            {
                ProjectId = request.TaskId.HasValue ? null : projectId,
                TaskId = request.TaskId,
                UserId = currentUserId,
                CommentText = request.CommentText
            };

            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();

            await _context.Entry(comment).Reference(c => c.User).LoadAsync();
            return MapToCommentDto(comment);
        }

        public async Task<bool> DeleteCommentAsync(long commentId, int currentUserId)
        {
            var comment = await _context.Comments.Include(c => c.Task).FirstOrDefaultAsync(c => c.CommentId == commentId);
            if (comment == null) return false;

            var projectId = comment.ProjectId ?? comment.Task?.ProjectId;
            var project = projectId.HasValue
                ? await _context.Projects.Include(p => p.Members).FirstOrDefaultAsync(p => p.ProjectId == projectId.Value)
                : null;
            if (project == null || !ProjectAccess.IsAccessible(project, currentUserId)) return false;

            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();
            return true;
        }

        // ===========================================================================
        // Attachments
        // ===========================================================================
        public async Task<List<AttachmentDto>?> GetAttachmentsAsync(int projectId, int? taskId, int userId)
        {
            // ★ Data Isolation: ดูไฟล์แนบได้เฉพาะเจ้าของ/สมาชิกทีมของโปรเจกต์นี้เท่านั้น
            var project = await _context.Projects.Include(p => p.Members)
                .FirstOrDefaultAsync(p => p.ProjectId == projectId);
            if (project == null || !ProjectAccess.IsAccessible(project, userId)) return null;

            var attachments = taskId.HasValue
                ? await _context.Attachments
                    .Where(a => a.TaskId == taskId.Value)
                    .Include(a => a.Uploader)
                    .OrderByDescending(a => a.UploadedDate)
                    .ToListAsync()
                : await _context.Attachments
                    .Where(a => a.ProjectId == projectId && a.TaskId == null)
                    .Include(a => a.Uploader)
                    .OrderByDescending(a => a.UploadedDate)
                    .ToListAsync();

            return attachments.Select(MapToAttachmentDto).ToList();
        }

        public async Task<AttachmentDto?> AddAttachmentAsync(int projectId, CreateAttachmentRequest request, int currentUserId)
        {
            var project = await _context.Projects.Include(p => p.Members)
                .FirstOrDefaultAsync(p => p.ProjectId == projectId);
            if (project == null || !ProjectAccess.IsAccessible(project, currentUserId)) return null;

            var attachment = new Attachments
            {
                ProjectId = request.TaskId.HasValue ? null : projectId,
                TaskId = request.TaskId,
                FileName = request.FileName,
                FilePath = request.FilePath,
                FileSizeByte = request.FileSizeByte,
                UploadedBy = currentUserId
            };

            _context.Attachments.Add(attachment);
            await _context.SaveChangesAsync();

            await _context.Entry(attachment).Reference(a => a.Uploader).LoadAsync();
            return MapToAttachmentDto(attachment);
        }

        public async Task<bool> DeleteAttachmentAsync(long attachmentId, int currentUserId)
        {
            var attachment = await _context.Attachments.Include(a => a.Task).FirstOrDefaultAsync(a => a.AttachmentId == attachmentId);
            if (attachment == null) return false;

            var projectId = attachment.ProjectId ?? attachment.Task?.ProjectId;
            var project = projectId.HasValue
                ? await _context.Projects.Include(p => p.Members).FirstOrDefaultAsync(p => p.ProjectId == projectId.Value)
                : null;
            if (project == null || !ProjectAccess.IsAccessible(project, currentUserId)) return false;

            _context.Attachments.Remove(attachment);
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

        private async Task<Dictionary<int, List<TaskAssigneeDto>>> LoadAssigneesLookupAsync(List<int> taskIds)
        {
            if (taskIds.Count == 0) return new Dictionary<int, List<TaskAssigneeDto>>();

            var assignees = await _context.TaskAssignees
                .Where(ta => taskIds.Contains(ta.TaskId))
                .Include(ta => ta.User)
                .ToListAsync();

            return assignees
                .GroupBy(ta => ta.TaskId)
                .ToDictionary(g => g.Key, g => g.Select(MapToTaskAssigneeDto).ToList());
        }

        private static TeamProjectDto MapToTeamProjectDto(Projects p) => new()
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
            ProgressPercent = p.ProgressPercent,
            Members = p.Members?.Where(m => m.IsActive).Select(MapToProjectMemberDto).ToList() ?? new List<ProjectMemberDto>()
        };

        private static ProjectMemberDto MapToProjectMemberDto(ProjectMembers pm) => new()
        {
            ProjectMemberId = pm.ProjectMemberId,
            ProjectId = pm.ProjectId,
            UserId = pm.UserId,
            EmpId = pm.User?.EmpId ?? string.Empty,
            FullName = pm.User?.FullName ?? string.Empty,
            RoleInProject = pm.RoleInProject,
            JoinedDate = pm.JoinedDate
        };

        private static TaskAssigneeDto MapToTaskAssigneeDto(TaskAssignees ta) => new()
        {
            TaskAssigneeId = ta.TaskAssigneeId,
            TaskId = ta.TaskId,
            UserId = ta.UserId,
            FullName = ta.User?.FullName ?? string.Empty,
            AssignedDate = ta.AssignedDate
        };

        private static TeamPhaseDto MapToTeamPhaseDto(Milestones m, Dictionary<int, List<TaskAssigneeDto>> assigneesLookup) => new()
        {
            MilestoneId = m.MilestoneId,
            ProjectId = m.ProjectId,
            MilestoneName = m.MilestoneName,
            OwnerId = m.OwnerId,
            OwnerName = m.Owner?.FullName,
            StartDate = m.StartDate,
            DueDate = m.DueDate,
            CompletedDate = m.CompletedDate,
            Status = m.Status,
            SortOrder = m.SortOrder,
            Items = m.Tasks?
                .Select(t => MapToTeamTaskItemDto(t, assigneesLookup.TryGetValue(t.TaskId, out var list) ? list : new List<TaskAssigneeDto>()))
                .ToList() ?? new List<TeamTaskItemDto>()
        };

        private static TeamTaskItemDto MapToTeamTaskItemDto(Tasks t, List<TaskAssigneeDto> assignees) => new()
        {
            TaskId = t.TaskId,
            MilestoneId = t.MilestoneId ?? 0,
            Title = t.TaskName,
            Detail = t.Description,
            Completed = t.Status == "DONE",
            Assignees = assignees
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

        private static CommentDto MapToCommentDto(Comments c) => new()
        {
            CommentId = c.CommentId,
            ProjectId = c.ProjectId,
            TaskId = c.TaskId,
            UserId = c.UserId,
            FullName = c.User?.FullName ?? string.Empty,
            CommentText = c.CommentText,
            CreatedDate = c.CreatedDate
        };

        private static AttachmentDto MapToAttachmentDto(Attachments a) => new()
        {
            AttachmentId = a.AttachmentId,
            ProjectId = a.ProjectId,
            TaskId = a.TaskId,
            FileName = a.FileName,
            FilePath = a.FilePath,
            FileSizeByte = a.FileSizeByte,
            UploadedBy = a.UploadedBy,
            UploadedByName = a.Uploader?.FullName ?? string.Empty,
            UploadedDate = a.UploadedDate
        };
    }
}
