// path: app/dashboard/visitor/[userId]/detail/[projectId]/page.tsx
// Visitor Mode — หน้ารายละเอียดโปรเจกต์ของคนอื่น (อ่านอย่างเดียวล้วนๆ) หน้าตาอ้างอิงจากหน้า Solo/Team Detail
// จริง แต่ตัดทุกปุ่ม Add/Edit/Delete ออกหมด และแปะ Project ID ไว้ทั้งบนและล่างเพราะเป็นข้อมูลอ้างอิงเฉยๆ
"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, Hash, Users } from "lucide-react";

import { VisitorProjectHeader } from "@/components/visitor/visitor-project-header";
import { VisitorPhaseTable } from "@/components/visitor/visitor-phase-table";
import StackLibrarySection from "@/components/projects/detail/stack-library-section";
import { ProjectTimelineSection } from "@/components/projects/detail/project-timeline-section";
import { ProjectShowcaseSection } from "@/components/projects/detail/project-showcase-section";
import { SoloProject, TeamProject } from "@/types/project";
import { Phase, StackItem, WorkItem } from "@/types/project-detail";
import { getSoloProjectDetail, getTeamProjectDetail } from "@/lib/visitor-api";
import { getStoredUser } from "@/lib/session";

// TODO: ยังไม่มี Auth Context ผูก User จริง — ใช้ userId ของ Admin ทดสอบไปก่อน (userId=1) ถ้ายังไม่ได้ล็อกอิน
const CURRENT_USER_ID = getStoredUser()?.userId ?? 1;

export default function VisitorProjectDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const targetUserId = Number(params?.userId);
  const projectId = Number(params?.projectId);
  const routeType = searchParams.get("type") === "team" ? "team" : "solo";

  const [projectInfo, setProjectInfo] = useState<SoloProject | TeamProject | null>(null);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [stacks, setStacks] = useState<StackItem[]>([]);
  const [works, setWorks] = useState<WorkItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadDetail = useCallback(async () => {
    if (!projectId || !targetUserId) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const detail =
        routeType === "team"
          ? await getTeamProjectDetail(projectId, targetUserId, CURRENT_USER_ID)
          : await getSoloProjectDetail(projectId, targetUserId, CURRENT_USER_ID);
      setProjectInfo(detail.project);
      setPhases(detail.phases);
      setStacks(detail.stacks);
      setWorks(detail.showcases);
    } catch (err) {
      console.error(err);
      setLoadError("ไม่สามารถโหลดข้อมูลโปรเจกต์ได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  }, [projectId, targetUserId, routeType]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const allTasks = phases.flatMap((p) => p.items);
  const completedTasks = allTasks.filter((t) => t.completed);
  const overallProgress = allTasks.length > 0 ? Math.round((completedTasks.length / allTasks.length) * 100) : 0;

  const backHref = `/dashboard/visitor/${targetUserId}`;

  if (isLoading) {
    return <div className="w-full py-20 text-center text-slate-500 text-xs font-medium">กำลังโหลดข้อมูลโปรเจกต์...</div>;
  }

  if (loadError || !projectInfo) {
    return (
      <div className="w-full py-20 text-center text-red-500 text-xs font-medium">
        {loadError || "ไม่พบโปรเจกต์นี้"}
      </div>
    );
  }

  const teamMembers = routeType === "team" ? (projectInfo as TeamProject).members : [];

  return (
    <div className="w-full space-y-6 pb-6 text-slate-800">
      <VisitorProjectHeader
        projectInfo={projectInfo}
        workType={routeType === "team" ? "TEAM" : "SOLO"}
        overallProgress={overallProgress}
        backHref={backHref}
      />

      {routeType === "team" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
            <Users className="w-4 h-4 text-indigo-500" />
            สมาชิกทีม ({teamMembers.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {teamMembers.length === 0 ? (
              <p className="text-slate-400 text-xs">ยังไม่มีสมาชิกทีม</p>
            ) : (
              teamMembers.map((m) => (
                <div
                  key={m.userId}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold ${
                    m.userId === (projectInfo as TeamProject).ownerId
                      ? "bg-amber-50 border-amber-200 text-amber-700"
                      : "bg-indigo-50 border-indigo-200 text-indigo-700"
                  }`}
                >
                  {m.fullName}
                  <span className="text-[10px] font-mono font-semibold opacity-70">{m.roleInProject}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
            <span className="text-indigo-900 font-bold text-xs tracking-wide">Phase / ลำดับงาน</span>
          </div>
        </div>
        <VisitorPhaseTable phases={phases} />
      </div>

      <StackLibrarySection
        projectId={projectInfo.id}
        stacks={stacks}
        setStacks={setStacks}
        createStackItem={() => Promise.reject(new Error("Visitor Mode: ดูอย่างเดียว"))}
        deleteStackItem={() => Promise.reject(new Error("Visitor Mode: ดูอย่างเดียว"))}
        canAdd={false}
        canDelete={false}
      />

      <ProjectTimelineSection phases={phases} />

      <ProjectShowcaseSection
        works={works}
        setWorks={setWorks}
        phases={phases}
        currentUserId={CURRENT_USER_ID}
        onOpenAddModal={() => {}}
        onOpenEditModal={() => {}}
        canAdd={false}
        canEdit={false}
        canDelete={false}
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white shadow-md">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <Hash className="w-3.5 h-3.5 text-indigo-400" />
          Project ID: <span className="font-mono font-bold text-indigo-300">{projectInfo.id}</span>
          <span className="text-slate-500">·</span>
          <span className="font-mono text-slate-400">{projectInfo.projectCode}</span>
        </div>
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          กลับไปเลือกโปรเจค
        </Link>
      </div>
    </div>
  );
}
