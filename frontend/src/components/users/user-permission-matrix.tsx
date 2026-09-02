"use client";

import React from "react";
import { 
  Eye, 
  PlusCircle, 
  Pencil, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Shield 
} from "lucide-react";
import { SystemList } from "@/types/user-permission";
import MatrixCheckbox from "./matrix-checkbox";
import { PresetButtonGroup } from "./preset-action-button";

export type PermissionFlagKey = "CanView" | "CanAdd" | "CanEdit" | "CanDelete" | "CanApprove" | "CanReject";

export interface SystemPermissionItem {
  SystemId: string;
  CanView: boolean;
  CanAdd: boolean;
  CanEdit: boolean;
  CanDelete: boolean;
  CanApprove: boolean;
  CanReject: boolean;
}

export interface UserPermissionMatrixProps {
  systems: SystemList[];
  permissions: SystemPermissionItem[];
  onChange: (permissions: SystemPermissionItem[]) => void;
  disabled?: boolean;
}

const PERMISSION_COLUMNS: { 
  key: PermissionFlagKey; 
  label: string; 
  enLabel: string; 
  icon: React.ComponentType<{ className?: string }>; 
  activeHeaderBg: string;
}[] = [
  { key: "CanView", label: "ดูข้อมูล", enLabel: "CanView", icon: Eye, activeHeaderBg: "bg-blue-950/80 border-blue-500/50 text-blue-300" },
  { key: "CanAdd", label: "เพิ่มข้อมูล", enLabel: "CanAdd", icon: PlusCircle, activeHeaderBg: "bg-emerald-950/80 border-emerald-500/50 text-emerald-300" },
  { key: "CanEdit", label: "แก้ไขข้อมูล", enLabel: "CanEdit", icon: Pencil, activeHeaderBg: "bg-amber-950/80 border-amber-500/50 text-amber-300" },
  { key: "CanDelete", label: "ลบข้อมูล", enLabel: "CanDelete", icon: Trash2, activeHeaderBg: "bg-rose-950/80 border-rose-500/50 text-rose-300" },
  { key: "CanApprove", label: "อนุมัติ", enLabel: "CanApprove", icon: CheckCircle2, activeHeaderBg: "bg-teal-950/80 border-teal-500/50 text-teal-300" },
  { key: "CanReject", label: "ปฏิเสธ", enLabel: "CanReject", icon: XCircle, activeHeaderBg: "bg-purple-950/80 border-purple-500/50 text-purple-300" },
];

export default function UserPermissionMatrix({
  systems,
  permissions,
  onChange,
  disabled = false,
}: UserPermissionMatrixProps) {

  // Toggle single permission for a system
  const handleToggle = (systemId: string, key: PermissionFlagKey) => {
    if (disabled) return;
    const updated = permissions.map((p) => {
      if (p.SystemId === systemId) {
        const nextVal = !p[key];
        const newObj = { ...p, [key]: nextVal };
        
        // Auto grant view if any write/action permission is turned on
        if (nextVal && key !== "CanView") {
          newObj.CanView = true;
        }
        // Auto remove write/action if view is turned off
        if (!nextVal && key === "CanView") {
          newObj.CanAdd = false;
          newObj.CanEdit = false;
          newObj.CanDelete = false;
          newObj.CanApprove = false;
          newObj.CanReject = false;
        }

        return newObj;
      }
      return p;
    });
    onChange(updated);
  };

  // Toggle all permissions for a system row
  const handleToggleRow = (systemId: string) => {
    if (disabled) return;
    const target = permissions.find((p) => p.SystemId === systemId);
    if (!target) return;

    const allChecked =
      target.CanView &&
      target.CanAdd &&
      target.CanEdit &&
      target.CanDelete &&
      target.CanApprove &&
      target.CanReject;

    const nextState = !allChecked;
    const updated = permissions.map((p) => {
      if (p.SystemId === systemId) {
        return {
          ...p,
          CanView: nextState,
          CanAdd: nextState,
          CanEdit: nextState,
          CanDelete: nextState,
          CanApprove: nextState,
          CanReject: nextState,
        };
      }
      return p;
    });
    onChange(updated);
  };

  // Toggle an entire column across all systems
  const handleToggleColumn = (key: PermissionFlagKey) => {
    if (disabled) return;
    const allColChecked = permissions.length > 0 && permissions.every((p) => p[key]);
    const nextVal = !allColChecked;
    const updated = permissions.map((p) => {
      const newObj = { ...p, [key]: nextVal };
      if (nextVal && key !== "CanView") {
        newObj.CanView = true;
      }
      return newObj;
    });
    onChange(updated);
  };

  // Preset handlers
  const handleApplyPreset = (preset: "ALL" | "VIEWER" | "EDITOR" | "MANAGER" | "NONE") => {
    if (disabled) return;
    const updated = permissions.map((p) => {
      if (preset === "ALL") {
        return { ...p, CanView: true, CanAdd: true, CanEdit: true, CanDelete: true, CanApprove: true, CanReject: true };
      } else if (preset === "VIEWER") {
        return { ...p, CanView: true, CanAdd: false, CanEdit: false, CanDelete: false, CanApprove: false, CanReject: false };
      } else if (preset === "EDITOR") {
        return { ...p, CanView: true, CanAdd: true, CanEdit: true, CanDelete: false, CanApprove: false, CanReject: false };
      } else if (preset === "MANAGER") {
        return { ...p, CanView: true, CanAdd: true, CanEdit: true, CanDelete: false, CanApprove: true, CanReject: true };
      } else {
        return { ...p, CanView: false, CanAdd: false, CanEdit: false, CanDelete: false, CanApprove: false, CanReject: false };
      }
    });
    onChange(updated);
  };

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
  const maxPossible = systems.length * 6;

  return (
    <div className="space-y-4 transition-all duration-300 ease-in-out">
      {/* Header & Quick Action Presets */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white shadow-md">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0 shadow-inner">
            <Shield className="w-4 h-4 animate-pulse" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold tracking-tight text-slate-100 flex items-center gap-2 truncate">
              ตารางกำหนดสิทธิ์การใช้งานระบบ (Permission Matrix)
              <span className="font-mono text-[10px] text-indigo-300 bg-indigo-950/80 px-2.5 py-0.5 rounded-full border border-indigo-700/60 shadow-xs shrink-0">
                {totalGranted}/{maxPossible} สิทธิ์
              </span>
            </h4>
            <p className="text-[11px] text-slate-400 truncate">
              กำหนดสิทธิ์แยกตามโมดูล: CanView, CanAdd, CanEdit, CanDelete, CanApprove, CanReject
            </p>
          </div>
        </div>

        {/* Preset Quick Buttons with Micro-animations */}
        <PresetButtonGroup onApplyPreset={handleApplyPreset} disabled={disabled} />
      </div>

      {/* Permission Matrix Table with Stable Column Widths */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                <th className="py-3 px-3 w-12 text-center text-slate-400 shrink-0">NO</th>
                <th className="py-3 px-4 min-w-[220px]">SYSTEM MODULE / เมนูระบบ</th>

                {PERMISSION_COLUMNS.map((col) => {
                  const Icon = col.icon;
                  const allChecked = permissions.length > 0 && permissions.every((p) => p[col.key]);
                  return (
                    <th key={col.key} className="py-3 px-2 text-center w-22 shrink-0">
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => handleToggleColumn(col.key)}
                        className={`group inline-flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-xl transition-colors duration-150 text-center w-full cursor-pointer hover:bg-slate-800 disabled:cursor-not-allowed ${
                          allChecked
                            ? col.activeHeaderBg
                            : "text-slate-300 border border-transparent hover:border-slate-700"
                        }`}
                        title={`คลิกเพื่อเลือก/ยกเลิก ${col.enLabel} ทั้งหมด`}
                      >
                        <div className="flex items-center gap-1 font-mono text-[10px] font-bold">
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span>{col.enLabel}</span>
                        </div>
                        <span className="text-[9px] font-sans font-normal text-slate-400 group-hover:text-slate-200">
                          {col.label}
                        </span>
                      </button>
                    </th>
                  );
                })}

                <th className="py-3 px-3 w-18 text-center text-slate-400 shrink-0">ALL</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {systems.map((sys, idx) => {
                const perm = permissions.find((p) => p.SystemId === sys.SystemId) || {
                  SystemId: sys.SystemId,
                  CanView: false,
                  CanAdd: false,
                  CanEdit: false,
                  CanDelete: false,
                  CanApprove: false,
                  CanReject: false,
                };

                const isAllSelected =
                  perm.CanView &&
                  perm.CanAdd &&
                  perm.CanEdit &&
                  perm.CanDelete &&
                  perm.CanApprove &&
                  perm.CanReject;

                const activeCount = [
                  perm.CanView,
                  perm.CanAdd,
                  perm.CanEdit,
                  perm.CanDelete,
                  perm.CanApprove,
                  perm.CanReject,
                ].filter(Boolean).length;

                return (
                  <tr
                    key={sys.SystemId}
                    className={`h-[54px] transition-colors duration-150 ${
                      activeCount > 0 ? "bg-slate-50/50" : "hover:bg-slate-50/80"
                    }`}
                  >
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-400 text-[11px] shrink-0">
                      {String(idx + 1).padStart(2, "0")}
                    </td>

                    <td className="py-2.5 px-4 min-w-[220px]">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs truncate">
                              {sys.SystemName}
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                              {sys.SystemId}
                            </span>
                          </div>
                          <p className="text-[11px] font-normal text-slate-500 line-clamp-1 mt-0.5">
                            {sys.Description}
                          </p>
                        </div>

                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                          {activeCount}/6
                        </span>
                      </div>
                    </td>

                    {/* Matrix Checkbox v2 with Stable Sizing */}
                    {PERMISSION_COLUMNS.map((col) => {
                      const isGranted = perm[col.key];
                      return (
                        <td key={col.key} className="py-2 px-2 text-center w-22 shrink-0">
                          <div className="flex items-center justify-center w-full">
                            <MatrixCheckbox
                              checked={isGranted}
                              onChange={() => handleToggle(sys.SystemId, col.key)}
                              disabled={disabled}
                              permissionKey={col.key}
                            />
                          </div>
                        </td>
                      );
                    })}

                    {/* Row ALL / UNSET button */}
                    <td className="py-2 px-3 text-center w-18 shrink-0">
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => handleToggleRow(sys.SystemId)}
                        className={`text-[10px] font-mono font-bold px-2 py-1 rounded-lg transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed ${
                          isAllSelected
                            ? "bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-500 shadow-xs"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                        }`}
                        title={isAllSelected ? "ยกเลิกแถวนี้" : "เลือกทั้งหมดแถวนี้"}
                      >
                        {isAllSelected ? "UNSET" : "ALL"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
