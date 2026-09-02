"use client";

import React from "react";
import {
  ShieldCheck,
  Laptop,
  CheckCircle2,
  Ban,
  Pencil,
  UserCircle
} from "lucide-react";
import { UserWithPermissions, SystemList } from "@/types/user-permission";
import UserPermissionMatrix, { SystemPermissionItem } from "./user-permission-matrix";
import ActionCloseButton from "./action-close-button";
import SuspendToggleButton from "./suspend-toggle-button";
import Portal from "@/components/ui/portal";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";

export interface UserDetailModalProps {
  user: UserWithPermissions | null;
  systemList: SystemList[];
  isOpen: boolean;
  onClose: () => void;
  onEdit: (user: UserWithPermissions) => void;
  onToggleSuspend: (userId: number) => void;
}

export default function UserDetailModal({
  user,
  systemList,
  isOpen,
  onClose,
  onEdit,
  onToggleSuspend,
}: UserDetailModalProps) {
  useBodyScrollLock(isOpen && !!user);

  if (!isOpen || !user) return null;

  const permissions: SystemPermissionItem[] = systemList.map((s) => {
    const matched = user.Permissions?.find((p) => p.SystemId === s.SystemId);
    return {
      SystemId: s.SystemId,
      CanView: matched ? matched.CanView : false,
      CanAdd: matched ? matched.CanAdd : false,
      CanEdit: matched ? matched.CanEdit : false,
      CanDelete: matched ? matched.CanDelete : false,
      CanApprove: matched ? matched.CanApprove : false,
      CanReject: matched ? matched.CanReject : false,
    };
  });

  const totalGranted = permissions.reduce(
    (acc, p) =>
      acc +
      (p.CanView ? 1 : 0) +
      (p.CanAdd ? 1 : 0) +
      (p.CanEdit ? 1 : 0) +
      (p.CanDelete ? 1 : 0) +
      (p.CanApprove ? 1 : 0) +
      (p.CanReject ? 1 : 0),
    0
  );
  const maxPossible = systemList.length * 6;

  return (
    <Portal>
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-xs text-sm ${
              user.IsSuspended
                ? "bg-gradient-to-br from-rose-900 to-red-950 text-rose-200 border-rose-700/60 shadow-[0_0_12px_rgba(225,29,72,0.3)]"
                : "bg-gradient-to-br from-indigo-900 to-slate-900 text-indigo-200 border-indigo-700/50 shadow-xs"
            }`}>
              <UserCircle className="w-6 h-6" strokeWidth={1.75} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-base font-bold ${user.IsSuspended ? "text-rose-900" : "text-slate-900"}`}>{user.FullName}</h3>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 border border-indigo-200">
                  {user.EmpId}
                </span>
                {user.IsSuspended && (
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1">
                    <Ban className="w-3 h-3" />
                    ถูกระงับ (Suspended)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {user.UserLevel} • {user.DepartmentName} • {user.DivisionName}
              </p>
            </div>
          </div>

          <ActionCloseButton onClick={onClose} title="ปิดหน้าต่าง" />
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
          {/* User Info Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 block">ส่วนงาน (Section)</span>
              <span className="font-bold text-slate-800 text-xs block truncate">{user.SectionName}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 block">อุปกรณ์ที่เข้าใช้งาน</span>
              <span className="font-bold text-slate-800 text-xs flex items-center gap-1">
                <Laptop className="w-3.5 h-3.5 text-slate-500" />
                {user.ComputerName || "N/A"}
              </span>
              <span className="text-[10px] text-slate-400 font-mono block">IP: {user.IpAddress || "127.0.0.1"}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 block">สถานะการระงับ</span>
              <span className={`font-bold text-xs flex items-center gap-1 ${user.IsSuspended ? "text-rose-600" : "text-emerald-700"}`}>
                {user.IsSuspended ? <Ban className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                {user.IsSuspended ? "ถูกระงับการใช้งาน" : "พร้อมใช้งานปกติ"}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-200/80 space-y-1">
              <span className="text-[10px] font-mono text-indigo-500 block">ความครอบคลุมสิทธิ์</span>
              <span className="font-bold text-indigo-700 text-xs font-mono block">
                {totalGranted}/{maxPossible} ({Math.round((totalGranted / maxPossible) * 100)}%)
              </span>
            </div>
          </div>

          {/* Module-level Permissions */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                รายการสิทธิ์การใช้งานของสมาชิกนี้
              </h4>
            </div>

            <UserPermissionMatrix
              systems={systemList}
              permissions={permissions}
              onChange={() => {}}
              disabled={true}
            />
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/80">
          <div className="text-[11px] font-mono text-slate-400">
            สร้างเมื่อ: {user.CreatedDate} • เข้าสู่ระบบล่าสุด: {user.LastLoginDate || "ยังไม่มีข้อมูล"}
          </div>

          <div className="flex items-center gap-3">
            {/* Suspend Toggle Button in Modal */}
            <SuspendToggleButton
              isSuspended={user.IsSuspended}
              onToggle={() => onToggleSuspend(user.UserId)}
              size="md"
            />

            {/* Edit User Button */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(user);
              }}
              className="group px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold transition-all duration-200 text-xs shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 cursor-pointer flex items-center gap-1.5"
            >
              <Pencil className="w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110" />
              <span>แก้ไขข้อมูลสมาชิกนี้</span>
            </button>
          </div>
        </div>

      </div>
    </div>
    </Portal>
  );
}
