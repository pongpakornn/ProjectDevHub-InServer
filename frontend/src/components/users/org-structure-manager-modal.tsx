"use client";

import React, { useEffect, useState } from "react";
import { Building2, Plus, Pencil, Trash2, Check, X as XIcon, Layers, Loader2 } from "lucide-react";
import Portal from "@/components/ui/portal";
import ActionCloseButton from "./action-close-button";
import ConfirmModal, { ConfirmModalVariant, ConfirmModalIconType } from "@/components/ui/confirm-modal";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import { useToast } from "@/lib/toast-context";
import {
  OrgDivision,
  OrgDepartment,
  OrgSection,
  getOrgDivisions,
  createOrgDivision,
  updateOrgDivision,
  deleteOrgDivision,
  getOrgDepartments,
  createOrgDepartment,
  updateOrgDepartment,
  deleteOrgDepartment,
  getOrgSections,
  createOrgSection,
  updateOrgSection,
  deleteOrgSection,
} from "@/lib/org-structure-api";

export interface OrgStructureManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: number;
  // เรียกทุกครั้งที่มีการเพิ่ม/แก้ไข/ลบ ให้หน้า User Management โหลด Dropdown Options ใหม่
  onChanged: () => void;
}

// รายการ + ปุ่มเพิ่ม/แก้ไข/ลบ ใช้โครงเดียวกันทั้ง 3 ระดับ (Division/Department/Section) จึงแยกเป็น Sub-component
interface EditableListProps {
  title: string;
  icon: React.ReactNode;
  items: { id: number; name: string }[];
  selectedId: number | null;
  onSelect?: (id: number) => void;
  emptyHint: string;
  addPlaceholder: string;
  disabled?: boolean;
  onAdd: (name: string) => Promise<void>;
  onRename: (id: number, name: string) => Promise<void>;
  onDelete: (id: number) => void;
}

function EditableList({
  title,
  icon,
  items,
  selectedId,
  onSelect,
  emptyHint,
  addPlaceholder,
  disabled,
  onAdd,
  onRename,
  onDelete,
}: EditableListProps) {
  const [newValue, setNewValue] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleAdd = async () => {
    if (!newValue.trim()) return;
    setIsSaving(true);
    try {
      await onAdd(newValue.trim());
      setNewValue("");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRenameSave = async (id: number) => {
    if (!editValue.trim()) return;
    setIsSaving(true);
    try {
      await onRename(id, editValue.trim());
      setEditingId(null);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 min-w-0 flex flex-col bg-slate-50/70 border border-slate-200 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-slate-200 bg-white">
        {icon}
        <h4 className="text-xs font-bold text-slate-800">{title}</h4>
        <span className="ml-auto text-[10px] font-mono text-slate-400">{items.length} รายการ</span>
      </div>

      <div className="flex-1 overflow-y-auto max-h-72 divide-y divide-slate-100">
        {items.length === 0 && (
          <p className="px-3.5 py-6 text-center text-[11px] text-slate-400">{emptyHint}</p>
        )}
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelect && editingId !== item.id && onSelect(item.id)}
            className={`group flex items-center gap-1.5 px-3 py-2 transition-colors ${
              onSelect ? "cursor-pointer" : ""
            } ${selectedId === item.id ? "bg-indigo-50" : "hover:bg-slate-100/70"}`}
          >
            {editingId === item.id ? (
              <>
                <input
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.key === "Enter" && handleRenameSave(item.id)}
                  className="flex-1 min-w-0 px-2 py-1 text-xs border border-indigo-400 rounded-lg focus:outline-none"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRenameSave(item.id);
                  }}
                  className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingId(null);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
                >
                  <XIcon className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <>
                <span
                  className={`flex-1 min-w-0 truncate text-xs font-semibold ${
                    selectedId === item.id ? "text-indigo-700" : "text-slate-700"
                  }`}
                  title={item.name}
                >
                  {item.name}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingId(item.id);
                    setEditValue(item.name);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="แก้ไขชื่อ"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="ลบ"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1.5 p-2 border-t border-slate-200 bg-white">
        <input
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder={disabled ? "เลือกรายการด้านซ้ายก่อน" : addPlaceholder}
          disabled={disabled}
          className="flex-1 min-w-0 px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={disabled || isSaving || !newValue.trim()}
          className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          title="เพิ่มรายการ"
        >
          {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}

export default function OrgStructureManagerModal({
  isOpen,
  onClose,
  currentUserId,
  onChanged,
}: OrgStructureManagerModalProps) {
  useBodyScrollLock(isOpen);
  const toast = useToast();

  const [divisions, setDivisions] = useState<OrgDivision[]>([]);
  const [departments, setDepartments] = useState<OrgDepartment[]>([]);
  const [sections, setSections] = useState<OrgSection[]>([]);
  const [selectedDivisionId, setSelectedDivisionId] = useState<number | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    variant: ConfirmModalVariant;
    icon: ConfirmModalIconType;
    action: () => void;
  } | null>(null);

  const loadDivisions = async () => {
    setIsLoading(true);
    try {
      const data = await getOrgDivisions();
      setDivisions(data);
    } catch (err) {
      toast.error("โหลดข้อมูลไม่สำเร็จ", err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadDivisions();
      setSelectedDivisionId(null);
      setSelectedDepartmentId(null);
      setDepartments([]);
      setSections([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedDivisionId == null) {
      setDepartments([]);
      setSelectedDepartmentId(null);
      return;
    }
    getOrgDepartments(selectedDivisionId)
      .then(setDepartments)
      .catch((err) => toast.error("โหลดแผนกไม่สำเร็จ", err instanceof Error ? err.message : "เกิดข้อผิดพลาด"));
    setSelectedDepartmentId(null);
    setSections([]);
  }, [selectedDivisionId]);

  useEffect(() => {
    if (selectedDepartmentId == null) {
      setSections([]);
      return;
    }
    getOrgSections(selectedDepartmentId)
      .then(setSections)
      .catch((err) => toast.error("โหลด Section ไม่สำเร็จ", err instanceof Error ? err.message : "เกิดข้อผิดพลาด"));
  }, [selectedDepartmentId]);

  const notifyParent = () => onChanged();

  if (!isOpen) return null;

  return (
    <Portal>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div
          className="bg-white border border-slate-200/90 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  จัดการ หน่วยงาน (Division) / แผนก (Department) / Section
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  เพิ่ม แก้ไข หรือลบรายการ Dropdown ที่ใช้ในฟอร์มสมัครสมาชิก — เลือกหน่วยงานเพื่อดูแผนก แล้วเลือกแผนกเพื่อดู Section
                </p>
              </div>
            </div>
            <ActionCloseButton onClick={onClose} title="ปิดหน้าต่าง" />
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-xs font-mono">กำลังโหลดข้อมูล...</span>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-4">
                <EditableList
                  title="หน่วยงาน (Division)"
                  icon={<Building2 className="w-3.5 h-3.5 text-indigo-600" />}
                  items={divisions.map((d) => ({ id: d.divisionId, name: d.divisionName }))}
                  selectedId={selectedDivisionId}
                  onSelect={setSelectedDivisionId}
                  emptyHint="ยังไม่มีหน่วยงาน"
                  addPlaceholder="เพิ่มหน่วยงานใหม่..."
                  onAdd={async (name) => {
                    await createOrgDivision(name, currentUserId);
                    await loadDivisions();
                    notifyParent();
                  }}
                  onRename={async (id, name) => {
                    const target = divisions.find((d) => d.divisionId === id);
                    await updateOrgDivision(id, name, target?.isActive ?? true, currentUserId);
                    await loadDivisions();
                    notifyParent();
                  }}
                  onDelete={(id) => {
                    const target = divisions.find((d) => d.divisionId === id);
                    setConfirmModal({
                      isOpen: true,
                      title: "ยืนยันการลบหน่วยงาน",
                      description: `ลบ "${target?.divisionName}" จะลบแผนกและ Section ทั้งหมดที่อยู่ภายใต้หน่วยงานนี้ไปด้วย ต้องการดำเนินการต่อหรือไม่?`,
                      variant: "danger",
                      icon: "trash",
                      action: async () => {
                        await deleteOrgDivision(id, currentUserId);
                        if (selectedDivisionId === id) setSelectedDivisionId(null);
                        await loadDivisions();
                        notifyParent();
                        setConfirmModal(null);
                      },
                    });
                  }}
                />

                <EditableList
                  title="แผนก (Department)"
                  icon={<Layers className="w-3.5 h-3.5 text-violet-600" />}
                  items={departments.map((d) => ({ id: d.departmentId, name: d.departmentName }))}
                  selectedId={selectedDepartmentId}
                  onSelect={setSelectedDepartmentId}
                  emptyHint={selectedDivisionId ? "ยังไม่มีแผนกในหน่วยงานนี้" : "เลือกหน่วยงานด้านซ้ายก่อน"}
                  addPlaceholder="เพิ่มแผนกใหม่..."
                  disabled={selectedDivisionId == null}
                  onAdd={async (name) => {
                    if (selectedDivisionId == null) return;
                    await createOrgDepartment(selectedDivisionId, name, currentUserId);
                    setDepartments(await getOrgDepartments(selectedDivisionId));
                    notifyParent();
                  }}
                  onRename={async (id, name) => {
                    const target = departments.find((d) => d.departmentId === id);
                    if (!target) return;
                    await updateOrgDepartment(id, target.divisionId, name, target.isActive, currentUserId);
                    setDepartments(await getOrgDepartments(target.divisionId));
                    notifyParent();
                  }}
                  onDelete={(id) => {
                    const target = departments.find((d) => d.departmentId === id);
                    setConfirmModal({
                      isOpen: true,
                      title: "ยืนยันการลบแผนก",
                      description: `ลบ "${target?.departmentName}" จะลบ Section ทั้งหมดที่อยู่ภายใต้แผนกนี้ไปด้วย ต้องการดำเนินการต่อหรือไม่?`,
                      variant: "danger",
                      icon: "trash",
                      action: async () => {
                        await deleteOrgDepartment(id, currentUserId);
                        if (selectedDepartmentId === id) setSelectedDepartmentId(null);
                        if (selectedDivisionId != null) setDepartments(await getOrgDepartments(selectedDivisionId));
                        notifyParent();
                        setConfirmModal(null);
                      },
                    });
                  }}
                />

                <EditableList
                  title="Section"
                  icon={<Layers className="w-3.5 h-3.5 text-emerald-600" />}
                  items={sections.map((s) => ({ id: s.sectionId, name: s.sectionName }))}
                  selectedId={null}
                  emptyHint={selectedDepartmentId ? "ยังไม่มี Section ในแผนกนี้" : "เลือกแผนกด้านซ้ายก่อน"}
                  addPlaceholder="เพิ่ม Section ใหม่..."
                  disabled={selectedDepartmentId == null}
                  onAdd={async (name) => {
                    if (selectedDepartmentId == null) return;
                    await createOrgSection(selectedDepartmentId, name, currentUserId);
                    setSections(await getOrgSections(selectedDepartmentId));
                    notifyParent();
                  }}
                  onRename={async (id, name) => {
                    const target = sections.find((s) => s.sectionId === id);
                    if (!target) return;
                    await updateOrgSection(id, target.departmentId, name, target.isActive, currentUserId);
                    setSections(await getOrgSections(target.departmentId));
                    notifyParent();
                  }}
                  onDelete={(id) => {
                    const target = sections.find((s) => s.sectionId === id);
                    setConfirmModal({
                      isOpen: true,
                      title: "ยืนยันการลบ Section",
                      description: `ลบ "${target?.sectionName}" ออกจากรายการหรือไม่?`,
                      variant: "danger",
                      icon: "trash",
                      action: async () => {
                        await deleteOrgSection(id, currentUserId);
                        if (selectedDepartmentId != null) setSections(await getOrgSections(selectedDepartmentId));
                        notifyParent();
                        setConfirmModal(null);
                      },
                    });
                  }}
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-end px-6 py-4 border-t border-slate-100 bg-slate-50/80">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold transition-all duration-200 text-xs shadow-md shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              เสร็จสิ้น
            </button>
          </div>
        </div>
      </div>

      {confirmModal && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          description={confirmModal.description}
          confirmText="ลบทันที"
          variant={confirmModal.variant}
          icon={confirmModal.icon}
          onConfirm={confirmModal.action}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </Portal>
  );
}
