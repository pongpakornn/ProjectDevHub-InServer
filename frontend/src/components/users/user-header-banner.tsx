"use client";

import React from "react";
import { ShieldCheck, UserPlus, Users, KeyRound, Ban, X } from "lucide-react";

export interface UserHeaderBannerProps {
  totalUsers: number;
  activeUsers: number;
  adminCount: number;
  suspendedCount: number;
  onToggleForm: () => void;
  isFormOpen: boolean;
}

export default function UserHeaderBanner({
  totalUsers,
  activeUsers,
  adminCount,
  suspendedCount,
  onToggleForm,
  isFormOpen,
}: UserHeaderBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-[#0f172a] via-[#1e1b4b] to-[#311042] border border-slate-800/80 p-6 md:p-8 shadow-xl">
      {/* Ambient background glow elements */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Section: Header Text */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/40 border border-indigo-500/30 text-indigo-400 backdrop-blur-md">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span className="font-mono text-[11px] font-bold tracking-wider uppercase">
              SECURITY / ACCESS CONTROL
            </span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              จัดการสมาชิกและกำหนดสิทธิ์
            </h1>
            <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              USER MANAGEMENT
            </span>
          </div>

          <p className="text-xs font-medium text-slate-400">
            ระบบสมัครสมาชิกใหม่ กำหนดบทบาท และจัดการสิทธิ์การเข้าถึงเมนูฟังก์ชันต่างๆ ขององค์กร
          </p>
        </div>

        {/* Right Section: Quick Stats & Toggle Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
          <div className="bg-slate-900/60 border border-indigo-500/20 rounded-xl p-3.5 min-w-72 space-y-2.5 backdrop-blur-md shadow-lg shadow-black/20">
            <div className="grid grid-cols-3 gap-2 text-center divide-x divide-slate-800">
              <div className="px-1">
                <span className="text-[10px] text-slate-400 font-mono block">ผู้ใช้ทั้งหมด</span>
                <span className="text-indigo-400 font-mono font-extrabold text-base flex items-center justify-center gap-1 mt-0.5">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  {totalUsers}
                </span>
              </div>
              <div className="px-1">
                <span className="text-[10px] text-slate-400 font-mono block">Super Admin</span>
                <span className="text-emerald-400 font-mono font-extrabold text-base flex items-center justify-center gap-1 mt-0.5">
                  <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                  {adminCount}
                </span>
              </div>
              <div className="px-1">
                <span className="text-[10px] text-slate-400 font-mono block">ถูกระงับ</span>
                <span className="text-rose-400 font-mono font-extrabold text-base flex items-center justify-center gap-1 mt-0.5">
                  <Ban className="w-3.5 h-3.5 text-rose-400" />
                  {suspendedCount}
                </span>
              </div>
            </div>

            <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                พร้อมใช้งาน: {activeUsers} บัญชี
              </span>
              <span className="text-slate-500">Live Mock UI</span>
            </div>
          </div>

          {/* Micro-animated Toggle Form Button (Styled from button.tsx) */}
          <button
            type="button"
            onClick={onToggleForm}
            className={`group relative overflow-hidden inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-xs uppercase tracking-wider text-white transition-all duration-200 ease-in-out cursor-pointer hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 select-none ${
              isFormOpen
                ? "bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-[0_4px_16px_rgba(225,29,72,0.35)] hover:shadow-[0_6px_20px_rgba(225,29,72,0.5)] border border-rose-400/50"
                : "bg-indigo-600 hover:bg-indigo-700 shadow-[0_4px_16px_rgba(79,70,229,0.35)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.5)] border border-indigo-400/50"
            }`}
          >
            {/* Shimmer line overlay */}
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-in-out pointer-events-none" />

            {isFormOpen ? (
              <>
                <X className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90 shrink-0" />
                <span className="relative z-10">ปิดฟอร์มลงทะเบียน</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 transition-transform duration-200 group-hover:scale-110 shrink-0" />
                <span className="relative z-10">+ สมัครสมาชิกใหม่</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
