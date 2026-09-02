"use client";

import React, { useState, useEffect } from "react";
import {
  UserPlus,
  UserCheck,
  Building,
  ShieldCheck,
  RotateCcw,
  BadgeCheck,
  KeyRound,
  Eye,
  EyeOff,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Dropdown } from "@/components/ui/inputs/dropdown";
import UserPermissionMatrix, { SystemPermissionItem } from "./user-permission-matrix";
import ActionCloseButton from "./action-close-button";
import { ResetRolePresetButton } from "./preset-action-button";
import StatusCheckboxCard from "./status-checkbox-card";
import { 
  UserFormData, 
  SystemList, 
  DivisionOption, 
  UserWithPermissions,
  User
} from "@/types/user-permission";

export interface UserRegistrationFormProps {
  initialData?: UserWithPermissions | null;
  mode?: "create" | "edit";
  onSubmit: (data: UserFormData) => void;
  onCancel: () => void;
  divisionOptions: DivisionOption[];
  systemList: SystemList[];
  isSaving?: boolean;
}

const USER_LEVEL_OPTIONS = [
  { label: "👑 Super Admin (สิทธิ์สูงสุด)", value: "SUPER_ADMIN" },
  { label: "🛡️ Admin (ผู้ดูแลระบบ)", value: "ADMIN" },
  { label: "👔 Manager (หัวหน้างาน)", value: "MANAGER" },
  { label: "💻 Developer (นักพัฒนา)", value: "DEVELOPER" },
  { label: "🧪 QA / Tester (ผู้ทดสอบ)", value: "TESTER" },
  { label: "👁️ Viewer (ดูอย่างเดียว)", value: "VIEWER" },
  { label: "👤 General User (ผู้ใช้ทั่วไป)", value: "USER" },
];

export default function UserRegistrationForm({
  initialData,
  mode = "create",
  onSubmit,
  onCancel,
  divisionOptions,
  systemList,
  isSaving = false,
}: UserRegistrationFormProps) {
  const isEdit = mode === "edit";

  const buildDefaultPermissions = (): SystemPermissionItem[] => {
    return systemList.map((s) => ({
      SystemId: s.SystemId,
      CanView: true,
      CanAdd: false,
      CanEdit: false,
      CanDelete: false,
      CanApprove: false,
      CanReject: false,
    }));
  };

  const [formData, setFormData] = useState<UserFormData>({
    EmpId: "",
    Password: "",
    FullName: "",
    DivisionName: divisionOptions[0]?.name || "สายงานเทคโนโลยีสารสนเทศ",
    DepartmentName: divisionOptions[0]?.departments[0]?.name || "ฝ่ายพัฒนาระบบซอฟต์แวร์",
    SectionName: divisionOptions[0]?.departments[0]?.sections[0] || "ส่วนงาน Front-End Application",
    UserLevel: "DEVELOPER",
    IsSuperAdmin: false,
    IsSuspended: false,
    IsActive: true,
    Permissions: buildDefaultPermissions(),
  });

  const [departmentList, setDepartmentList] = useState<string[]>([]);
  const [sectionList, setSectionList] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setFormError(null);
    if (isEdit && initialData) {
      setFormData({
        EmpId: initialData.EmpId,
        Password: "",
        FullName: initialData.FullName,
        DivisionName: initialData.DivisionName,
        DepartmentName: initialData.DepartmentName,
        SectionName: initialData.SectionName,
        UserLevel: initialData.UserLevel,
        IsSuperAdmin: initialData.IsSuperAdmin,
        IsSuspended: initialData.IsSuspended,
        IsActive: initialData.IsActive,
        Permissions: systemList.map((s) => {
          const matched = initialData.Permissions?.find((p) => p.SystemId === s.SystemId);
          return {
            SystemId: s.SystemId,
            CanView: matched ? matched.CanView : false,
            CanAdd: matched ? matched.CanAdd : false,
            CanEdit: matched ? matched.CanEdit : false,
            CanDelete: matched ? matched.CanDelete : false,
            CanApprove: matched ? matched.CanApprove : false,
            CanReject: matched ? matched.CanReject : false,
          };
        }),
      });
    } else {
      setFormData({
        EmpId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
        Password: "",
        FullName: "",
        DivisionName: divisionOptions[0]?.name || "สายงานเทคโนโลยีสารสนเทศ",
        DepartmentName: divisionOptions[0]?.departments[0]?.name || "ฝ่ายพัฒนาระบบซอฟต์แวร์",
        SectionName: divisionOptions[0]?.departments[0]?.sections[0] || "ส่วนงาน Front-End Application",
        UserLevel: "DEVELOPER",
        IsSuperAdmin: false,
        IsSuspended: false,
        IsActive: true,
        Permissions: buildDefaultPermissions(),
      });
    }
  }, [initialData, isEdit, divisionOptions, systemList]);

  // Sync departments when division changes
  useEffect(() => {
    const matchedDiv = divisionOptions.find((d) => d.name === formData.DivisionName);
    if (matchedDiv) {
      const depts = matchedDiv.departments.map((dep) => dep.name);
      setDepartmentList(depts);
      if (!depts.includes(formData.DepartmentName) && depts.length > 0) {
        setFormData((prev) => ({ ...prev, DepartmentName: depts[0] }));
      }
    }
  }, [formData.DivisionName, divisionOptions]);

  // Sync sections when department changes
  useEffect(() => {
    const matchedDiv = divisionOptions.find((d) => d.name === formData.DivisionName);
    if (matchedDiv) {
      const matchedDept = matchedDiv.departments.find((dep) => dep.name === formData.DepartmentName);
      if (matchedDept) {
        setSectionList(matchedDept.sections);
        if (!matchedDept.sections.includes(formData.SectionName) && matchedDept.sections.length > 0) {
          setFormData((prev) => ({ ...prev, SectionName: matchedDept.sections[0] }));
        }
      }
    }
  }, [formData.DivisionName, formData.DepartmentName, divisionOptions]);

  // Handle Preset Level Selection
  const handleLevelPresetChange = (level: User["UserLevel"]) => {
    const isSuper = level === "SUPER_ADMIN";
    const updatedPerms = formData.Permissions.map((p) => {
      if (level === "SUPER_ADMIN") {
        return { ...p, CanView: true, CanAdd: true, CanEdit: true, CanDelete: true, CanApprove: true, CanReject: true };
      } else if (level === "ADMIN") {
        return { ...p, CanView: true, CanAdd: true, CanEdit: true, CanDelete: true, CanApprove: true, CanReject: false };
      } else if (level === "MANAGER") {
        return { ...p, CanView: true, CanAdd: true, CanEdit: true, CanDelete: false, CanApprove: true, CanReject: true };
      } else if (level === "DEVELOPER") {
        return { ...p, CanView: true, CanAdd: true, CanEdit: true, CanDelete: p.SystemId === "SOLO" || p.SystemId === "TEAM", CanApprove: false, CanReject: false };
      } else if (level === "TESTER") {
        return { ...p, CanView: true, CanAdd: p.SystemId === "TEAM", CanEdit: p.SystemId === "TEAM", CanDelete: false, CanApprove: false, CanReject: false };
      } else {
        return { ...p, CanView: true, CanAdd: false, CanEdit: false, CanDelete: false, CanApprove: false, CanReject: false };
      }
    });

    setFormData((prev) => ({
      ...prev,
      UserLevel: level,
      IsSuperAdmin: isSuper,
      Permissions: updatedPerms,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.EmpId.trim()) {
      setFormError("กรุณากรอกรหัสพนักงาน (EmpId)");
      return;
    }
    if (!formData.FullName.trim()) {
      setFormError("กรุณากรอกชื่อ-นามสกุล (FullName)");
      return;
    }
    if (!isEdit && formData.Password.trim().length < 4) {
      setFormError("กรุณากำหนดรหัสผ่านอย่างน้อย 4 ตัวอักษร");
      return;
    }
    if (isEdit && formData.Password.trim().length > 0 && formData.Password.trim().length < 4) {
      setFormError("รหัสผ่านใหม่ต้องมีอย่างน้อย 4 ตัวอักษร");
      return;
    }
    setFormError(null);
    onSubmit(formData);
  };

  const divisionDropdownOptions = divisionOptions.map((d) => ({
    label: d.name,
    value: d.name,
  }));

  const departmentDropdownOptions = departmentList.map((d) => ({
    label: d,
    value: d,
  }));

  const sectionDropdownOptions = sectionList.map((s) => ({
    label: s,
    value: s,
  }));

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
      {/* Form Top Title Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20">
            {isEdit ? <UserCheck className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              {isEdit ? "แก้ไขข้อมูลและสิทธิ์สมาชิก" : "สมัครสมาชิกใหม่ พร้อมกำหนดสิทธิ์ (Single Page Registration)"}
              <span className="text-[10px] font-mono font-bold bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
                {isEdit ? "EDIT MODE" : "NEW MEMBER"}
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              กรอกข้อมูลส่วนบุคคล สังกัดสายงาน/แผนก และกำหนดระดับสิทธิ์การเข้าถึงเมนูต่างๆ ในคราวเดียว
            </p>
          </div>
        </div>

        {/* Action Close (X) Button */}
        <ActionCloseButton onClick={onCancel} title="ปิดฟอร์ม" />
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Inline Validation Error Banner (แทน alert() แบบ Native Browser) */}
        <div
          className={`grid transition-all duration-300 ease-out ${
            formError ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold animate-in fade-in slide-in-from-top-2 duration-200">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          </div>
        </div>

        {/* Section 1: User Profile & Org */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
            <Building className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
              1. ข้อมูลส่วนบุคคลและหน่วยงาน (User & Organization Information)
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* EmpId */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                รหัสพนักงาน (EmpId) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.EmpId}
                onChange={(e) => setFormData({ ...formData, EmpId: e.target.value })}
                placeholder="เช่น EMP-1049"
                className="w-full px-3.5 py-2.5 bg-slate-50/90 hover:bg-slate-100/70 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all font-mono shadow-2xs"
              />
            </div>

            {/* FullName */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                ชื่อ - นามสกุล (FullName) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.FullName}
                onChange={(e) => setFormData({ ...formData, FullName: e.target.value })}
                placeholder="เช่น นายปองปกรณ์ สถิตย์กิจ"
                className="w-full px-3.5 py-2.5 bg-slate-50/90 hover:bg-slate-100/70 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-2xs"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
                รหัสผ่าน (Password)
                {!isEdit && <span className="text-rose-500">*</span>}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required={!isEdit}
                  value={formData.Password}
                  onChange={(e) => setFormData({ ...formData, Password: e.target.value })}
                  placeholder={isEdit ? "เว้นว่างไว้เพื่อคงรหัสผ่านเดิม" : "อย่างน้อย 4 ตัวอักษร"}
                  className="w-full px-3.5 py-2.5 pr-10 bg-slate-50/90 hover:bg-slate-100/70 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                  title={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* UserLevel Dropdown */}
            <Dropdown
              label="ระดับผู้ใช้ (UserLevel / Preset)"
              options={USER_LEVEL_OPTIONS}
              value={formData.UserLevel}
              onChange={(val) => handleLevelPresetChange(val as User["UserLevel"])}
            />

            {/* DivisionName Dropdown */}
            <Dropdown
              label="สายงาน (DivisionName) *"
              options={divisionDropdownOptions}
              value={formData.DivisionName}
              onChange={(val) => setFormData({ ...formData, DivisionName: val })}
            />

            {/* DepartmentName Dropdown */}
            <Dropdown
              label="ฝ่าย / แผนก (DepartmentName) *"
              options={departmentDropdownOptions}
              value={formData.DepartmentName}
              onChange={(val) => setFormData({ ...formData, DepartmentName: val })}
            />

            {/* SectionName Dropdown */}
            <Dropdown
              label="ส่วนงาน (SectionName) *"
              options={sectionDropdownOptions}
              value={formData.SectionName}
              onChange={(val) => setFormData({ ...formData, SectionName: val })}
            />
          </div>

          {/* Status Checkbox Cards Section */}
          <div className="pt-2">
            <span className="block text-xs font-bold text-slate-800 mb-2">
              สถานะบัญชีและการอนุญาตพิเศษ (Account Status & Elevated Flags)
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* IsSuperAdmin Card */}
              <StatusCheckboxCard
                type="super_admin"
                checked={formData.IsSuperAdmin}
                onChange={(val) => setFormData({ ...formData, IsSuperAdmin: val })}
                title="IsSuperAdmin"
                subtitle="สิทธิ์ผู้ดูแลระบบระดับสูง (Full Override)"
              />

              {/* IsSuspended Card */}
              <StatusCheckboxCard
                type="suspended"
                checked={formData.IsSuspended}
                onChange={(val) => setFormData({ ...formData, IsSuspended: val })}
                title="IsSuspended"
                subtitle="ระงับการใช้งานและบล็อกการเข้าระบบ"
              />

              {/* IsActive Card */}
              <StatusCheckboxCard
                type="active"
                checked={formData.IsActive}
                onChange={(val) => setFormData({ ...formData, IsActive: val })}
                title="IsActive"
                subtitle="สถานะเปิดใช้งานบัญชีสมาชิกในระบบ"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Permission Matrix Setting */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                2. กำหนดสิทธิ์การใช้งานแต่ละโมดูล (Module-Level Access Rights)
              </h4>
            </div>
            <span className="text-[11px] text-slate-400">
              * ปรับเปลี่ยนติ๊กเลือกสิทธิ์ในตารางด้านล่างได้ทันที
            </span>
          </div>

          <UserPermissionMatrix
            systems={systemList}
            permissions={formData.Permissions}
            onChange={(perms) => setFormData({ ...formData, Permissions: perms })}
          />
        </div>

        {/* Action Buttons styled like button.tsx */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="group px-5 py-2.5 rounded-xl border border-red-300 hover:border-red-400 bg-red-50 hover:bg-red-100 text-red-700 font-bold transition-all duration-200 text-xs cursor-pointer hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 flex items-center gap-1.5 shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 transition-transform duration-300 group-hover:-rotate-90" />
            ยกเลิก
          </button>

          <div className="flex items-center gap-3">
            {/* Shimmering Reset Role Preset Button */}
            <ResetRolePresetButton
              onClick={() => handleLevelPresetChange("DEVELOPER")}
              title="คืนค่าตาม Role Preset"
            />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSaving}
              className="group relative overflow-hidden px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold transition-all duration-200 shadow-[0_4px_14px_rgba(16,185,129,0.35)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.5)] hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 text-xs flex items-center gap-2 cursor-pointer border border-emerald-400/50 uppercase tracking-wider disabled:opacity-60 disabled:pointer-events-none disabled:hover:scale-100 disabled:hover:translate-y-0"
            >
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-in-out pointer-events-none" />
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <BadgeCheck className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
              )}
              <span>
                {isSaving
                  ? "กำลังบันทึก..."
                  : isEdit
                  ? "บันทึกการแก้ไข"
                  : "บันทึกและสมัครสมาชิก"}
              </span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
