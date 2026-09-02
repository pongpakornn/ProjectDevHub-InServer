"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  UserCheck,
  UserCircle,
  ShieldX,
  Building2,
  Laptop
} from "lucide-react";
import { UserWithPermissions, DivisionOption } from "@/types/user-permission";
import ViewButton from "@/components/ui/buttons/view-button";
import EditButton from "@/components/ui/buttons/edit-button";
import DeleteButton from "@/components/ui/buttons/delete-button";
import { Dropdown } from "@/components/ui/inputs/dropdown";
import SuspendToggleButton from "./suspend-toggle-button";

export interface UserManagementTableProps {
  users: UserWithPermissions[];
  divisionOptions: DivisionOption[];
  onView: (user: UserWithPermissions) => void;
  onEdit: (user: UserWithPermissions) => void;
  onDelete: (id: number) => void;
  onToggleSuspend: (id: number) => void;
}

const LEVEL_BADGE_STYLE: Record<string, { label: string; style: string }> = {
  SUPER_ADMIN: { label: "Super Admin", style: "bg-purple-100 text-purple-700 border-purple-300" },
  ADMIN: { label: "Admin", style: "bg-indigo-100 text-indigo-700 border-indigo-300" },
  MANAGER: { label: "Manager", style: "bg-teal-100 text-teal-700 border-teal-300" },
  DEVELOPER: { label: "Developer", style: "bg-blue-100 text-blue-700 border-blue-300" },
  TESTER: { label: "QA / Tester", style: "bg-amber-100 text-amber-700 border-amber-300" },
  VIEWER: { label: "Viewer", style: "bg-slate-100 text-slate-700 border-slate-300" },
  USER: { label: "User", style: "bg-zinc-100 text-zinc-700 border-zinc-300" },
};

const SUSPEND_FILTER_OPTIONS = [
  { label: "สถานะทั้งหมด (All Status)", value: "ALL" },
  { label: "🟢 ปกติ (Active Only)", value: "ACTIVE" },
  { label: "🔴 ถูกระงับ (Suspended Only)", value: "SUSPENDED" },
];

export default function UserManagementTable({
  users,
  divisionOptions,
  onView,
  onEdit,
  onDelete,
  onToggleSuspend,
}: UserManagementTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDivision, setSelectedDivision] = useState<string>("ALL");
  const [selectedSuspendedFilter, setSelectedSuspendedFilter] = useState<string>("ALL");

  const divisionFilterOptions = [
    { label: "ทุกสายงาน (All Divisions)", value: "ALL" },
    ...divisionOptions.map((d) => ({ label: d.name, value: d.name })),
  ];

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.FullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.EmpId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.DepartmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.SectionName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchDiv = selectedDivision === "ALL" || u.DivisionName === selectedDivision;
      const matchSuspended =
        selectedSuspendedFilter === "ALL"
          ? true
          : selectedSuspendedFilter === "SUSPENDED"
          ? u.IsSuspended
          : !u.IsSuspended;

      return matchSearch && matchDiv && matchSuspended;
    });
  }, [users, searchQuery, selectedDivision, selectedSuspendedFilter]);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden p-4 sm:p-6 space-y-4">
      {/* Top Filter & Search Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 shadow-xs">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">รายชื่อสมาชิกในระบบ</h3>
            <p className="text-xs text-slate-500 font-mono">
              พบ {filteredUsers.length} จากทั้งหมด {users.length} รายการ
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box with icon and clean styling */}
          <div className="relative min-w-56 flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อ, รหัสพนักงาน, แผนก..."
              className="w-full pl-8.5 pr-3.5 py-2 bg-slate-50/90 hover:bg-slate-100/70 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-2xs"
            />
          </div>

          {/* Division Filter Dropdown */}
          <div className="min-w-44">
            <Dropdown
              options={divisionFilterOptions}
              value={selectedDivision}
              onChange={(val) => setSelectedDivision(val)}
            />
          </div>

          {/* Suspended Filter Dropdown */}
          <div className="min-w-40">
            <Dropdown
              options={SUSPEND_FILTER_OPTIONS}
              value={selectedSuspendedFilter}
              onChange={(val) => setSelectedSuspendedFilter(val)}
            />
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                <th className="py-3.5 px-3.5 w-12 text-center text-slate-400">NO</th>
                <th className="py-3.5 px-3.5 min-w-56">EMPLOYEE / สมาชิก</th>
                <th className="py-3.5 px-3.5 min-w-48">ORGANIZATION / สังกัด</th>
                <th className="py-3.5 px-3.5 w-32 text-center">LEVEL / ROLE</th>
                <th className="py-3.5 px-3.5 min-w-44">PERMISSION SUMMARY</th>
                <th className="py-3.5 px-3.5 w-40 text-center">SUSPEND STATUS</th>
                <th className="py-3.5 px-3.5 w-36 text-center">ACTIONS</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ShieldX className="w-8 h-8 text-slate-300 animate-bounce" />
                      <span className="text-xs font-semibold">ไม่พบข้อมูลสมาชิกตามเงื่อนไขการค้นหา</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, idx) => {
                  const roleConfig = LEVEL_BADGE_STYLE[user.UserLevel] || {
                    label: user.UserLevel,
                    style: "bg-slate-100 text-slate-700 border-slate-200",
                  };

                  const permissions = user.Permissions || [];
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
                  const maxPossible = (permissions.length || 1) * 6;
                  const canApproveCount = permissions.filter((p) => p.CanApprove).length;
                  const canDeleteCount = permissions.filter((p) => p.CanDelete).length;

                  return (
                    <tr 
                      key={user.UserId} 
                      className={`transition-colors duration-150 group ${
                        user.IsSuspended 
                          ? "bg-rose-50/50 hover:bg-rose-50/80" 
                          : "hover:bg-slate-50/90"
                      }`}
                    >
                      <td className="py-3.5 px-3.5 text-center font-mono font-bold text-slate-400 text-[11px]">
                        {String(idx + 1).padStart(2, "0")}
                      </td>

                      {/* Employee Info */}
                      <td className="py-3.5 px-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 shadow-xs transition-transform duration-200 group-hover:scale-105 ${
                            user.IsSuspended
                              ? "bg-gradient-to-br from-rose-900 to-red-950 text-rose-200 border-rose-700/60"
                              : "bg-gradient-to-br from-indigo-900 to-slate-900 text-indigo-300 border-indigo-700/40"
                          }`}>
                            <UserCircle className="w-5 h-5" strokeWidth={1.75} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className={`font-bold text-xs ${user.IsSuspended ? "text-rose-900 line-through decoration-rose-400" : "text-slate-900"}`}>
                                {user.FullName}
                              </h4>
                              <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                                {user.EmpId}
                              </span>
                              {user.IsSuperAdmin && (
                                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-700 border border-purple-200 shadow-2xs">
                                  👑 Super
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                              {user.ComputerName && (
                                <span className="flex items-center gap-1">
                                  <Laptop className="w-3 h-3 text-slate-400" />
                                  {user.ComputerName}
                                </span>
                              )}
                              {user.IsOnline && (
                                <span className="flex items-center gap-1 text-emerald-600 font-bold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  Online
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Organization */}
                      <td className="py-3.5 px-3.5">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs">
                            <Building2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <span className="truncate">{user.DepartmentName}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-normal truncate">
                            {user.DivisionName}
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            ส่วนงาน: {user.SectionName}
                          </span>
                        </div>
                      </td>

                      {/* Level */}
                      <td className="py-3.5 px-3.5 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${roleConfig.style} shadow-2xs`}
                        >
                          {roleConfig.label}
                        </span>
                      </td>

                      {/* Permission Summary */}
                      <td className="py-3.5 px-3.5">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  user.IsSuspended ? "bg-rose-400" : "bg-indigo-500"
                                }`}
                                style={{ width: `${Math.round((totalGranted / maxPossible) * 100)}%` }}
                              />
                            </div>
                            <span className="font-mono font-bold text-[10px] text-slate-700 shrink-0">
                              {totalGranted}/{maxPossible}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-1">
                            {canApproveCount > 0 && (
                              <span className="text-[9px] font-mono font-bold bg-teal-50 text-teal-700 border border-teal-200 px-1.5 py-0.2 rounded shadow-2xs">
                                Approve ({canApproveCount})
                              </span>
                            )}
                            {canDeleteCount > 0 && (
                              <span className="text-[9px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.2 rounded shadow-2xs">
                                Delete ({canDeleteCount})
                              </span>
                            )}
                            <span className="text-[9px] font-mono text-slate-400">
                              {Math.round((totalGranted / maxPossible) * 100)}% Access
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Suspend Status Toggle Button */}
                      <td className="py-3.5 px-3.5 text-center">
                        <SuspendToggleButton
                          isSuspended={user.IsSuspended}
                          onToggle={() => onToggleSuspend(user.UserId)}
                        />
                      </td>

                      {/* Actions with existing UI Buttons */}
                      <td className="py-3.5 px-3.5 text-center">
                        <div className="flex items-center justify-center gap-2 scale-90 sm:scale-95">
                          <ViewButton
                            title="ดูรายละเอียดสิทธิ์"
                            onClick={() => onView(user)}
                          />
                          <EditButton
                            title="แก้ไขข้อมูลและสิทธิ์"
                            onClick={() => onEdit(user)}
                          />
                          <DeleteButton
                            title="ลบสมาชิก"
                            onClick={() => onDelete(user.UserId)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
