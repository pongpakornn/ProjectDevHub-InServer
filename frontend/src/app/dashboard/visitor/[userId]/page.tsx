// path: app/dashboard/visitor/[userId]/page.tsx
// Visitor Mode — เลือก User แล้วมาดูการ์ดโปรเจกต์ทั้งหมดของคนนั้น (อ่านอย่างเดียว)
// การ์ดเองไม่คลิกได้ — Hover แล้วจะเด้งขึ้นเป็นการพรีวิวเฉยๆ ต้องกดปุ่ม "สไลด์" หรือ "ดูรายละเอียด" เท่านั้น
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Eye, User, Users, Tv, FileSearch, GitFork, Sparkles } from "lucide-react";
import { getVisitableUsers, getUserProjectCards, VisitorUser, VisitorProjectCard } from "@/lib/visitor-api";
import { getStoredUser } from "@/lib/session";

// TODO: ยังไม่มี Auth Context ผูก User จริง — ใช้ userId ของ Admin ทดสอบไปก่อน (userId=1) ถ้ายังไม่ได้ล็อกอิน
const CURRENT_USER_ID = getStoredUser()?.userId ?? 1;

const STATUS_LABEL: Record<string, string> = {
  PLANNING: "วางแผน",
  IN_PROGRESS: "กำลังทำ",
  ON_HOLD: "พักไว้",
  COMPLETED: "เสร็จแล้ว",
  CANCELLED: "ยกเลิก",
};

const PRIORITY_LABEL: Record<string, string> = {
  LOW: "Low (ต่ำ)",
  MEDIUM: "Normal (ปกติ)",
  HIGH: "High (สูง)",
  URGENT: "Urgent (เร่งด่วน)",
};

const statusBadgeClass = (status: string) => {
  if (status === "COMPLETED") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "IN_PROGRESS") return "bg-amber-50 text-amber-700 border-amber-200";
  if (status === "CANCELLED") return "bg-rose-50 text-rose-600 border-rose-200";
  return "bg-slate-100 text-slate-600 border-slate-200";
};

const priorityBadgeClass = (priority: string) => {
  if (priority === "HIGH" || priority === "URGENT") return "bg-rose-50 text-rose-600 border-rose-200";
  return "bg-indigo-50 text-indigo-700 border-indigo-100";
};

export default function VisitorUserProjectsPage() {
  const params = useParams();
  const targetUserId = Number(params?.userId);

  const [targetUser, setTargetUser] = useState<VisitorUser | null>(null);
  const [projects, setProjects] = useState<VisitorProjectCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!targetUserId) return;
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const [users, cards] = await Promise.all([
          getVisitableUsers(CURRENT_USER_ID),
          getUserProjectCards(targetUserId, CURRENT_USER_ID),
        ]);
        if (cancelled) return;
        setTargetUser(users.find((u) => u.userId === targetUserId) || null);
        setProjects(cards);
      } catch (err) {
        console.error(err);
        if (!cancelled) setLoadError("ไม่สามารถโหลดรายการโปรเจกต์ได้ กรุณาลองใหม่อีกครั้ง");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [targetUserId]);

  return (
    <div className="w-full select-none space-y-6">
      <Link
        href="/dashboard/visitor"
        className="group inline-flex items-center gap-2 pl-2 pr-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-bold text-slate-600 hover:text-indigo-600 hover:border-indigo-300 hover:shadow-md transition-all duration-300 w-fit"
      >
        <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center transition-colors duration-300 group-hover:bg-indigo-50">
          <ArrowLeft className="w-3.5 h-3.5" />
        </span>
        กลับไปเลือกผู้ใช้
      </Link>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-[#0f172a] via-[#1e1b4b] to-[#311042] border border-slate-800/80 p-6 shadow-xl">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-base font-bold flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
            {(targetUser?.fullName || "?").charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1.5 min-w-0">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-950/40 border border-indigo-500/30 text-indigo-400 text-[10px] font-mono font-bold tracking-wider uppercase">
              <Eye className="w-3 h-3" />
              โหมดดูอย่างเดียว
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white truncate">
              {targetUser?.fullName || `UserID: ${targetUserId}`}
            </h1>
            <p className="text-xs text-slate-400">
              UserID: <span className="font-mono text-slate-300">{targetUser?.empId ?? targetUserId}</span>
              {" · "}
              ตรวจสอบผลงานได้ทั้งหมด แต่ไม่สามารถแก้ไขหรือลบข้อมูลของผู้ใช้รายนี้
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="w-full py-20 text-center text-slate-500 text-xs font-medium">กำลังโหลดรายการโปรเจกต์...</div>
      ) : loadError ? (
        <div className="w-full py-20 text-center text-red-500 text-xs font-medium">{loadError}</div>
      ) : projects.length === 0 ? (
        <div className="w-full py-20 text-center text-slate-400 text-xs font-medium">
          ผู้ใช้รายนี้ยังไม่มีโปรเจกต์ในระบบ
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {projects.map((p, index) => (
            <div
              key={`${p.workType}-${p.id}`}
              style={{ animationDelay: `${index * 50}ms` }}
              className="group relative bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:shadow-2xl hover:shadow-indigo-500/15 hover:border-indigo-300 hover:-translate-y-1.5 hover:scale-[1.03] hover:z-10 transition-all duration-300 ease-out flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 fill-mode-both cursor-default"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-800 text-slate-200">
                      {p.workType === "SOLO" ? <User className="w-2.5 h-2.5" /> : <Users className="w-2.5 h-2.5" />}
                      {p.workType === "SOLO" ? "ทำคนเดียว" : "ทำทีม"}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400">{p.projectTypeName}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm truncate">{p.name}</h3>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{p.description || "-"}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${statusBadgeClass(p.status)}`}>
                  {STATUS_LABEL[p.status] ?? p.status}
                </span>
                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${priorityBadgeClass(p.priority)}`}>
                  {PRIORITY_LABEL[p.priority] ?? p.priority}
                </span>
              </div>

              <span className="text-[10px] text-slate-400 font-mono">
                {p.startDate || "-"} → {p.endDate || "-"}
              </span>

              <div className="flex items-center gap-2.5">
                <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                  <div
                    className="bg-indigo-500 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(99,102,241,0.7)]"
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
                <span className="text-indigo-600 font-mono font-extrabold text-[11px] shrink-0 w-8 text-right">
                  {p.progress}%
                </span>
              </div>

              <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-100">
                <Link
                  href={`/dashboard/visitor/${targetUserId}/present/${p.id}?type=${p.workType.toLowerCase()}`}
                  title="สไลด์"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
                >
                  <Tv className="w-3.5 h-3.5" />
                  สไลด์
                </Link>
                <Link
                  href={`/dashboard/visitor/${targetUserId}/detail/${p.id}?type=${p.workType.toLowerCase()}`}
                  title="ดูรายละเอียด"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
                >
                  <FileSearch className="w-3.5 h-3.5" />
                  รายละเอียด
                </Link>
                <Link
                  href={`/dashboard/visitor/${targetUserId}/flow/${p.id}`}
                  title="ดู Flow Diagram"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
                >
                  <GitFork className="w-3.5 h-3.5" />
                  Flow
                </Link>
              </div>

              <span className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-indigo-400" title="พรีวิวโปรเจกต์นี้">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
