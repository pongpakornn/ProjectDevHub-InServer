// path: app/dashboard/visitor/page.tsx
// Visitor Mode — หน้าแรก: เลือก User ที่ต้องการดูภาพรวมโปรเจกต์ (อ่านอย่างเดียวทั้งโมดูล)
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Search, FolderKanban, Building2, ArrowRight, Users2 } from "lucide-react";
import { getVisitableUsers, VisitorUser } from "@/lib/visitor-api";
import { getStoredUser } from "@/lib/session";

// TODO: ยังไม่มี Auth Context ผูก User จริง — ใช้ userId ของ Admin ทดสอบไปก่อน (userId=1) ถ้ายังไม่ได้ล็อกอิน
const CURRENT_USER_ID = getStoredUser()?.userId ?? 1;

export default function VisitorModePage() {
  const [users, setUsers] = useState<VisitorUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const result = await getVisitableUsers(CURRENT_USER_ID);
        if (!cancelled) setUsers(result);
      } catch (err) {
        console.error(err);
        if (!cancelled) setLoadError("ไม่สามารถโหลดรายชื่อผู้ใช้ได้ กรุณาลองใหม่อีกครั้ง");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) => u.fullName.toLowerCase().includes(q) || u.empId.toLowerCase().includes(q)
    );
  }, [users, search]);

  return (
    <div className="w-full select-none space-y-6">
      {/* Header Banner — โทน indigo เดียวกับ Present Station / Testing */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-[#0f172a] via-[#1e1b4b] to-[#311042] border border-slate-800/80 p-6 md:p-8 shadow-xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/40 border border-indigo-500/30 text-indigo-400 backdrop-blur-md">
              <Eye className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span className="font-mono text-[11px] font-bold tracking-wider uppercase">VISITOR MODE</span>
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">ผู้เยี่ยมชม — เลือกดูผลงาน</h1>
            </div>

            <p className="text-xs font-medium text-slate-400">
              เลือกชื่อ UserID ที่ต้องการ เพื่อดูรายละเอียดโปรเจกต์แบบ &quot;ดูอย่างเดียว&quot; (แก้ไขไม่ได้)
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
            <div className="bg-slate-900/60 border border-indigo-500/20 rounded-xl p-4 min-w-56 space-y-1.5 backdrop-blur-md shadow-lg shadow-black/20">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-200 font-semibold flex items-center gap-2">
                  <Users2 className="w-4 h-4 text-indigo-400" />
                  สมาชิกที่มีโปรเจกต์
                </span>
                <span className="text-indigo-400 font-mono font-extrabold text-base">{users.length}</span>
              </div>
              <p className="text-[10px] font-mono text-slate-500">นับเฉพาะผู้ใช้ที่เป็นเจ้าของโปรเจกต์อย่างน้อย 1 รายการ</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Box */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหาชื่อ หรือ UserID..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-xs"
        />
      </div>

      {isLoading ? (
        <div className="w-full py-20 text-center text-slate-500 text-xs font-medium">กำลังโหลดรายชื่อผู้ใช้...</div>
      ) : loadError ? (
        <div className="w-full py-20 text-center text-red-500 text-xs font-medium">{loadError}</div>
      ) : filteredUsers.length === 0 ? (
        <div className="w-full py-20 text-center text-slate-400 text-xs font-medium">
          {users.length === 0 ? "ยังไม่มีผู้ใช้ที่มีโปรเจกต์ในระบบ" : "ไม่พบผู้ใช้ที่ตรงกับคำค้นหา"}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredUsers.map((u, index) => (
            <Link
              key={u.userId}
              href={`/dashboard/visitor/${u.userId}`}
              style={{ animationDelay: `${index * 40}ms` }}
              className="group bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:shadow-lg hover:shadow-indigo-500/10 hover:border-indigo-300 hover:-translate-y-1 transition-all duration-300 ease-out flex items-center gap-3 cursor-pointer animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-300"
            >
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-sm font-bold flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
                {u.fullName.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-slate-900 text-sm truncate transition-colors duration-300 group-hover:text-indigo-600">
                  {u.fullName}
                </h3>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                  <span>UserID: {u.empId}</span>
                  <span className="text-slate-300">·</span>
                  <span className="flex items-center gap-0.5">
                    <FolderKanban className="w-3 h-3" />
                    {u.projectCount} โปรเจกต์
                  </span>
                </div>
                {u.departmentName && (
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5 truncate">
                    <Building2 className="w-3 h-3 shrink-0" />
                    <span className="truncate">{u.departmentName}</span>
                  </div>
                )}
              </div>

              <ArrowRight className="w-4 h-4 text-slate-300 shrink-0 transition-all duration-300 group-hover:text-indigo-500 group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
