# Team Module — DB Integration (เก็บตกรอบนี้)

สรุปสิ่งที่ตรวจพบและแก้ไขในรอบ Audit นี้ เพื่อให้โมดูล **Team** เชื่อมต่อฐานข้อมูลจริงสมบูรณ์
เทียบเท่ากับโมดูล **Solo** ที่เชื่อมต่อ SQL Server ไปแล้ว (commit `03f24af9`)

## 1. สิ่งที่ตรวจพบก่อนแก้ไข (Audit)

- **Backend**: ไม่มี `ProjectTeamController` / `IProjectTeamService` / `ProjectTeamService` อยู่เลย — มีแค่ฝั่ง Solo
  (`ProjectSoloController` / `ProjectSoloService`) เท่านั้น
- **Frontend**: ทุกหน้าและทุก component ของ Team (`/dashboard/team`, `/dashboard/team/projects/[id]`
  และ component ย่อยทั้งหมดใน `components/projects/detail/team/*`) เป็น **Local State / Mock Data ล้วน**
  ไม่มีการเรียก `fetch`/API ไปที่ Backend เลยสักจุดเดียว (ไม่มี `project-team-api.ts` มาก่อน)
- จุดที่ยังใช้ `projectInfo.owner.split(",")` เพื่อแตกชื่อสมาชิกทีมจาก String เดียว —
  พบใน `team-project-form-modal.tsx` และ `team-project-overview.tsx` (ตอนนี้แก้เป็นดึงจาก
  `Project.ProjectMembers` จริงแล้ว)
- ตาราง `Project.ProjectMembers` และ `Project.TaskAssignees` มีอยู่ใน DB และผูกใน `AppDbContext`
  เรียบร้อยอยู่แล้ว แต่ไม่เคยถูกใช้งานจริงจากทั้ง Solo และ Team (Solo สร้างโปรเจกต์แล้วไม่เคยเติมแถวใน
  `ProjectMembers` เลย) — จึงใช้จุดนี้เป็นตัวคัดกรองว่าโปรเจกต์ไหนเป็น "Team" (ดูข้อ 3)

สิ่งที่เชื่อมต่อ DB จริงเรียบร้อยแล้วและ **คงไว้ไม่แตะ**: โมดูล Solo ทั้งหมด (`ProjectSoloController`,
`ProjectSoloService`, `project-solo-api.ts`, หน้า `/dashboard/solo/*`) และ Master Data (`ProjectTypes`,
`Users`) ที่ Team เรียกใช้ร่วมกันผ่าน re-export จาก `project-solo-api.ts`

## 2. Backend ที่เพิ่มใหม่

| ไฟล์ | หน้าที่ |
|---|---|
| `backend/DTOs/ProjectTeamDtos.cs` | DTO เฉพาะ Team (`TeamProjectDto`, `ProjectMemberDto`, `TaskAssigneeDto`, ฯลฯ) — ส่วนที่ schema ตรงกับ Solo (Phase/Task/Stack/Showcase request) reuse จาก `ProjectSoloDtos.cs` ไม่สร้างซ้ำ |
| `backend/Services/IProjectTeamService.cs` / `ProjectTeamService.cs` | Business logic ทั้งหมดของ Team |
| `backend/Controllers/ProjectTeamController.cs` | REST endpoints ที่ `api/ProjectTeam` |
| `backend/Program.cs` | เพิ่ม `builder.Services.AddScoped<IProjectTeamService, ProjectTeamService>();` |

### Endpoints ที่เพิ่ม

```
GET    /api/ProjectTeam                              รายการโปรเจกต์ทีม (มีสมาชิกใน ProjectMembers)
GET    /api/ProjectTeam/{id}                          รายละเอียดโปรเจกต์ + Phase/Task/Stack/Showcase/Members
POST   /api/ProjectTeam?userId=                       สร้างโปรเจกต์ทีม (แนบ MemberUserIds ตอนสร้าง)
PUT    /api/ProjectTeam?userId=                        แก้ไขข้อมูลหลักของโปรเจกต์
DELETE /api/ProjectTeam/{id}                           ลบโปรเจกต์ (Soft Delete)

GET    /api/ProjectTeam/{id}/members                   ดึงสมาชิกทีม (Join Core.Users)
POST   /api/ProjectTeam/{id}/members                   เพิ่มสมาชิกทีม พร้อมกำหนด RoleInProject
DELETE /api/ProjectTeam/{id}/members/{userId}          ลบสมาชิกออกจากทีม (Soft Delete)

POST   /api/ProjectTeam/{id}/tasks/{taskId}/assignees  Sync ผู้รับผิดชอบงาน (Project.TaskAssignees)

POST/PUT/DELETE /api/ProjectTeam/phases[...]            Phase (Milestone) — เหมือน Solo ทุกประการ
POST/PUT/DELETE /api/ProjectTeam/tasks[...]              TaskItem (Task) — เหมือน Solo ทุกประการ
POST   /api/ProjectTeam/{id}/phases/auto-generate       Auto-generate Phase ตาม ProjectType
POST/DELETE /api/ProjectTeam/stacks[...]                 TechStack
POST/DELETE /api/ProjectTeam/showcases[...]              ShowcaseItem
```

### LINQ ที่ใช้อ้างอิง

**คัดกรองโปรเจกต์ทีม** (มีสมาชิกใน `ProjectMembers` จริง ต่างจาก Solo ที่ไม่มี):

```csharp
await _context.Projects
    .Where(p => p.IsActive && p.Members.Any())
    .Include(p => p.ProjectType)
    .Include(p => p.Owner)
    .Include(p => p.Members).ThenInclude(m => m.User)
    .OrderByDescending(p => p.CreatedDate)
    .ToListAsync();
```

**สร้างโปรเจกต์ทีม + เติม ProjectMembers** (Owner = role `OWNER`, ที่เหลือ = role `MEMBER`):

```csharp
_context.ProjectMembers.Add(new ProjectMembers
{
    ProjectId = project.ProjectId,
    UserId = request.ProjectOwnerId,
    RoleInProject = "OWNER"
});
foreach (var userId in request.MemberUserIds.Where(id => id != request.ProjectOwnerId).Distinct())
{
    _context.ProjectMembers.Add(new ProjectMembers
    {
        ProjectId = project.ProjectId,
        UserId = userId,
        RoleInProject = "MEMBER"
    });
}
```

**เพิ่มสมาชิกกลับเข้าทีม** (กัน Unique Constraint `(ProjectId, UserId)` — ถ้าเคยถูกลบออกมาก่อน ให้
Reactivate แถวเดิมแทนการ Insert ซ้ำ):

```csharp
var existing = await _context.ProjectMembers
    .FirstOrDefaultAsync(pm => pm.ProjectId == projectId && pm.UserId == request.UserId);
if (existing != null)
{
    existing.IsActive = true;
    existing.RoleInProject = request.RoleInProject;
    existing.JoinedDate = DateTimeOffset.UtcNow;
}
else
{
    _context.ProjectMembers.Add(new ProjectMembers { ProjectId = projectId, UserId = request.UserId, RoleInProject = request.RoleInProject });
}
```

**Sync ผู้รับผิดชอบงาน** (Replace-set — ส่ง `UserIds` ทั้งชุดมา แล้ว Backend Diff เอง):

```csharp
var current = await _context.TaskAssignees.Where(ta => ta.TaskId == taskId).ToListAsync();
var toRemove = current.Where(ta => !requestedIds.Contains(ta.UserId));
var toAdd = requestedIds.Where(id => !current.Select(ta => ta.UserId).Contains(id))
    .Select(id => new TaskAssignees { TaskId = taskId, UserId = id });
_context.TaskAssignees.RemoveRange(toRemove);
_context.TaskAssignees.AddRange(toAdd);
```

**ดึง Assignees ของทุก Task ในโปรเจกต์แบบ Batch** (กัน N+1 Query ตอนโหลดหน้า Detail):

```csharp
var assigneesByTask = await _context.TaskAssignees
    .Where(ta => taskIds.Contains(ta.TaskId))
    .Include(ta => ta.User)
    .ToListAsync();
var lookup = assigneesByTask.GroupBy(ta => ta.TaskId).ToDictionary(g => g.Key, g => g.ToList());
```

## 3. Frontend ที่แก้ไข/เพิ่มใหม่

| ไฟล์ | การเปลี่ยนแปลง |
|---|---|
| `frontend/src/lib/project-team-api.ts` | **ใหม่** — เรียก `api/ProjectTeam/*` จริงทั้งหมด, re-export `getProjectTypes/getUsers/uploadShowcaseImage` จาก `project-solo-api.ts` (Master Data ใช้ร่วมกัน) |
| `frontend/src/types/project.ts` | เพิ่ม `ProjectMember`, `TeamProject`, `TeamProjectDetail` |
| `frontend/src/types/project-detail.ts` | เพิ่ม `TaskAssignee`, เพิ่ม `assignees?: TaskAssignee[]` ใน `TaskItem` (optional — Solo ไม่กระทบ) |
| `app/dashboard/team/page.tsx` | โหลด/สร้าง/แก้/ลบโปรเจกต์จริงผ่าน API (เดิมเป็น `initialTeamProjects` Mock ล้วน) |
| `app/dashboard/team/projects/[id]/page.tsx` | โหลดรายละเอียดจริงตาม `projectId` จาก URL (เดิม Hardcode `ERP Integration Hub` ไม่สนใจ `id` เลย) |
| `components/projects/team-project-form-modal.tsx` | ใช้ `getProjectTypes()/getUsers()` จริงแทน Dropdown Hardcode, เลือกสมาชิกทีมจาก User จริงแทนพิมพ์ชื่อเอง |
| `components/projects/detail/team/team-project-overview.tsx` | อ่านสมาชิกทีมจาก `projectInfo.members` (ProjectMembers จริง) แทน `owner.split(",")` |
| `components/projects/detail/team/team-project-members-panel.tsx` | **ใหม่** — แผงเพิ่ม/ลบสมาชิกทีมโดยตรง (Dropdown จาก `getUsers()`) |
| `components/projects/detail/team/team-project-phase-table.tsx` | ต่อ Create/Update/Delete Phase และ Task เข้า Backend จริง (เดิม Local State ล้วน) + เพิ่ม UI มอบหมายผู้รับผิดชอบต่อ Task (`Project.TaskAssignees`) |
| `components/projects/detail/team/team-project-stack-section.tsx` | ต่อ Create/Delete TechStack เข้า Backend จริง |
| `components/projects/detail/team/team-project-gallery-section.tsx`, `team-add-work-modal.tsx` | ต่อ Create/Delete ShowcaseItem + อัปโหลดรูปจริงผ่าน `/Upload/showcase-image` |
| `components/projects/detail/team/team-project-gantt-timeline.tsx` | import `Phase` จาก `types/project-detail.ts` กลาง แทน import จากไฟล์ phase-table |

### รวม Types ที่ซ้ำซ้อน

ก่อนแก้ไข ไฟล์ `team-project-phase-table.tsx`, `team-project-stack-section.tsx`,
`team-project-gallery-section.tsx` ต่างประกาศ `Phase`/`TaskItem`/`StackItem`/`WorkItem` ของตัวเอง
ซ้ำกับ `frontend/src/types/project-detail.ts` ที่ Solo ใช้อยู่แล้ว — ตอนนี้ทุกไฟล์ import จาก
`@/types/project-detail` กลางไฟล์เดียว ไม่มีการประกาศซ้ำอีกต่อไป
