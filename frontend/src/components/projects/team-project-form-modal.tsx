"use client";

import React, { useState, useEffect, useMemo } from "react";
import { X } from "lucide-react";
import SearchableSelect from "@/components/ui/inputs/searchable-select";
import MultiSearchableSelect from "@/components/ui/inputs/multi-searchable-select";
import { TeamProject, CreateProjectFormData } from "@/types/project";
import { getProjectTypes, getUsers, getDepartments, ProjectType, UserOption, Department } from "@/lib/project-team-api";

interface TeamProjectFormModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  initialData?: TeamProject | null;
  onClose: () => void;
  onSubmit: (data: CreateProjectFormData, memberUserIds: number[]) => void;
}

const defaultFormState: CreateProjectFormData = {
  name: "",
  description: "",
  projectTypeId: 0,
  department: "ระบบดิจิตอลและIT",
  requester: "",
  ownerId: 0,
  priority: "MEDIUM",
  status: "PLANNING",
  startDate: "",
  endDate: "",
};

export default function TeamProjectFormModal({
  isOpen,
  mode,
  initialData,
  onClose,
  onSubmit,
}: TeamProjectFormModalProps) {
  const [formData, setFormData] = useState<CreateProjectFormData>(defaultFormState);
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [selectedMemberLabels, setSelectedMemberLabels] = useState<string[]>([]);
  const [formError, setFormError] = useState<string>("");

  useEffect(() => {
    if (!isOpen) return;
    setIsLoadingOptions(true);
    Promise.all([getProjectTypes(), getUsers(), getDepartments()])
      .then(([types, userList, departmentList]) => {
        setProjectTypes(types);
        setUsers(userList);
        setDepartments(departmentList);
      })
      .catch((err) => console.error("โหลด Master Data ไม่สำเร็จ", err))
      .finally(() => setIsLoadingOptions(false));
  }, [isOpen]);

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description || "",
        projectTypeId: initialData.projectTypeId,
        department: initialData.department || "ระบบดิจิตอลและIT",
        requester: initialData.requester || "",
        ownerId: initialData.ownerId,
        priority: initialData.priority,
        status: initialData.status,
        startDate: initialData.startDate || "",
        endDate: initialData.endDate || "",
      });
      setSelectedMemberLabels(
        (initialData.members || []).map((m) => `${m.fullName} (${m.empId})`)
      );
    } else {
      setFormData(defaultFormState);
      setSelectedMemberLabels([]);
    }
    setFormError("");
  }, [mode, initialData, isOpen]);

  const userOptions = users.map((u) => ({
    label: `${u.fullName} (${u.empId})`,
    value: String(u.userId),
  }));

  const labelToUserId = useMemo(
    () => new Map(userOptions.map((o) => [o.label, Number(o.value)])),
    [users]
  );

  if (!isOpen) return null;

  const projectTypeOptions = projectTypes.map((pt) => ({
    label: pt.typeName,
    value: String(pt.projectTypeId),
  }));

  const departmentOptions = departments.map((d) => ({
    label: d.departmentName,
    value: d.departmentName,
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    if (!formData.projectTypeId) {
      alert("กรุณาเลือก Project Type");
      return;
    }
    if (!formData.ownerId) {
      alert("กรุณาเลือกหัวหน้าโครงการ (Owner)");
      return;
    }
    if (selectedMemberLabels.length === 0) {
      setFormError("กรุณาเพิ่มสมาชิกทีมอย่างน้อย 1 คน");
      return;
    }
    setFormError("");

    const memberUserIds = selectedMemberLabels
      .map((label) => labelToUserId.get(label))
      .filter((id): id is number => id !== undefined);

    onSubmit(formData, memberUserIds);
  };

  const isEdit = mode === "edit";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isEdit ? "แก้ไขโครงการทีม" : "สร้างโครงการทีมใหม่"}
            </h2>
            <p className="text-xs font-medium text-slate-500">
              {isEdit
                ? "ปรับปรุงข้อมูลรายละเอียดโครงการ"
                : "บันทึกข้อมูลโครงการพร้อมสมาชิกที่ร่วมพัฒนา"}
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs font-medium text-slate-700">

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Project Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="เช่น ERP Integration Hub"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-emerald-500 focus:bg-white transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SearchableSelect
              label={`Project Type * ${isLoadingOptions ? "(กำลังโหลด...)" : ""}`}
              options={projectTypeOptions}
              value={formData.projectTypeId ? String(formData.projectTypeId) : ""}
              onChange={(val) => setFormData({ ...formData, projectTypeId: Number(val) })}
            />
            <SearchableSelect
              label="หน่วยงาน"
              options={departmentOptions}
              value={formData.department}
              onChange={(val) => setFormData({ ...formData, department: val })}
            />
          </div>

          <div>
            <SearchableSelect
              label={`หัวหน้าโครงการ (Owner) * ${isLoadingOptions ? "(กำลังโหลด...)" : ""}`}
              options={userOptions}
              value={formData.ownerId ? String(formData.ownerId) : ""}
              onChange={(val) => setFormData({ ...formData, ownerId: Number(val) })}
            />
          </div>

          <div>
            <MultiSearchableSelect
              label={`สมาชิกทีม (Team Members) *  —  เลือกแล้ว ${selectedMemberLabels.length} คน`}
              options={userOptions.map((o) => ({ label: o.label, value: o.label }))}
              value={selectedMemberLabels}
              onChange={(members) => {
                setSelectedMemberLabels(members);
                if (members.length > 0) setFormError("");
              }}
              placeholder="ค้นหาชื่อสมาชิกจากรายชื่อ User ในระบบ..."
              allowCustom={false}
            />
            {formError && (
              <p className="mt-1 text-[11px] font-bold text-rose-600">{formError}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Requester</label>
            <input
              type="text"
              value={formData.requester}
              onChange={(e) => setFormData({ ...formData, requester: e.target.value })}
              placeholder="ผู้ร้องขอ / หน่วยงานที่ร้องขอ"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value as CreateProjectFormData["priority"] })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
              >
                <option value="LOW">Low (ต่ำ)</option>
                <option value="MEDIUM">Medium (ปกติ)</option>
                <option value="HIGH">High (สูง)</option>
                <option value="URGENT">Urgent (เร่งด่วน)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as CreateProjectFormData["status"] })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
              >
                <option value="PLANNING">Planning (วางแผน)</option>
                <option value="IN_PROGRESS">In Progress (กำลังทำ)</option>
                <option value="ON_HOLD">On Hold (พักไว้)</option>
                <option value="COMPLETED">Completed (เสร็จแล้ว)</option>
                <option value="CANCELLED">Cancelled (ยกเลิก)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-emerald-700 text-white font-bold hover:bg-emerald-800 transition-all shadow-md shadow-emerald-900/10"
            >
              {isEdit ? "บันทึกการแก้ไข" : "บันทึก"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
