"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import SearchableSelect from "@/components/ui/inputs/searchable-select";
import MultiSearchableSelect from "@/components/ui/inputs/multi-searchable-select";
import { SoloProject } from "@/types/project";

interface TeamProjectFormModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  initialData?: SoloProject | null;
  onClose: () => void;
  onSubmit: (project: SoloProject) => void;
}

const projectTypes = [
  { label: "Web Application", value: "Web Application" },
  { label: "Mobile Application", value: "Mobile Application" },
  { label: "API / Microservice", value: "API / Microservice" },
  { label: "Desktop Application", value: "Desktop Application" },
];

const departments = [
  { label: "ระบบดิจิตอลและIT", value: "ระบบดิจิตอลและIT" },
  { label: "ฝ่ายซ่อมบำรุง", value: "ฝ่ายซ่อมบำรุง" },
  { label: "ฝ่ายคลังสินค้าและจัดส่ง", value: "ฝ่ายคลังสินค้าและจัดส่ง" },
  { label: "ฝ่ายทรัพยากรบุคคล", value: "ฝ่ายทรัพยากรบุคคล" },
];

const languages = [
  { label: "TypeScript / JavaScript", value: "TypeScript" },
  { label: "C# (.NET)", value: "C#" },
  { label: "Python", value: "Python" },
  { label: "Java", value: "Java" },
  { label: "PHP", value: "PHP" },
];

const frameworks = [
  { label: "Next.js / React", value: "Next.js" },
  { label: "ASP.NET Core", value: "ASP.NET Core" },
  { label: "FastAPI", value: "FastAPI" },
  { label: "Express.js", value: "Express.js" },
];

const libraries = [
  { label: "Tailwind CSS", value: "Tailwind CSS" },
  { label: "Prisma ORM", value: "Prisma" },
  { label: "Entity Framework Core", value: "EF Core" },
  { label: "Zustand", value: "Zustand" },
];

const databases = [
  { label: "SQL Server", value: "SQL Server" },
  { label: "PostgreSQL", value: "PostgreSQL" },
  { label: "MySQL", value: "MySQL" },
  { label: "MongoDB", value: "MongoDB" },
];

const apiServices = [
  { label: "REST API", value: "REST API" },
  { label: "GraphQL", value: "GraphQL" },
  { label: "SignalR / WebSocket", value: "SignalR" },
];

const teamMembersOptions = [
  { label: "Pongpakorn", value: "Pongpakorn" },
  { label: "Somchai", value: "Somchai" },
  { label: "Anan", value: "Anan" },
  { label: "Somsak", value: "Somsak" },
];

const defaultFormState: Partial<SoloProject> = {
  name: "",
  description: "",
  projectType: "Web Application",
  department: "ระบบดิจิตอลและIT",
  owner: "",
  requester: "",
  priority: "ปกติ",
  status: "กำลังทำ",
  startDate: "",
  endDate: "",
  language: "",
  framework: "",
  library: "",
  database: "",
  apiService: "",
  otherTech: "",
};

export default function TeamProjectFormModal({
  isOpen,
  mode,
  initialData,
  onClose,
  onSubmit,
}: TeamProjectFormModalProps) {
  const [formData, setFormData] = useState<Partial<SoloProject>>(defaultFormState);
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const [formError, setFormError] = useState<string>("");

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({ ...initialData });
      setTeamMembers(
        initialData.owner
          ? initialData.owner.split(",").map((name) => name.trim()).filter(Boolean)
          : []
      );
    } else {
      setFormData(defaultFormState);
      setTeamMembers([]);
    }
    setFormError("");
  }, [mode, initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    if (teamMembers.length === 0) {
      setFormError("กรุณาเพิ่มสมาชิกทีมอย่างน้อย 1 คน");
      return;
    }
    setFormError("");

    const initialProgress = formData.status === "เสร็จแล้ว" ? 100 : 0;

    const formattedProject: SoloProject = {
      id: mode === "edit" && initialData ? initialData.id : Date.now().toString(),
      name: formData.name,
      description: formData.description || "ไม่มีรายละเอียดเพิ่มเติม",
      projectType: formData.projectType || "Web Application",
      department: formData.department || "ระบบดิจิตอลและIT",
      owner: teamMembers.join(", "),
      requester: formData.requester || "-",
      priority: formData.priority || "ปกติ",
      status: formData.status || "กำลังทำ",
      startDate: formData.startDate || "-",
      endDate: formData.endDate || "-",
      progress: initialData?.progress !== undefined ? initialData.progress : initialProgress,
      phases: initialData?.phases || [],
      language: formData.language || "",
      framework: formData.framework || "",
      library: formData.library || "",
      database: formData.database || "",
      apiService: formData.apiService || "",
      otherTech: formData.otherTech || "",
    };

    onSubmit(formattedProject);
    onClose();
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
                ? "ปรับปรุงข้อมูลรายละเอียดโครงการและสมาชิกทีม"
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
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="เช่น ERP Integration Hub"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-emerald-500 focus:bg-white transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SearchableSelect
              label="Project Type"
              options={projectTypes}
              value={formData.projectType || ""}
              onChange={(val) => setFormData({ ...formData, projectType: val })}
            />
            <SearchableSelect
              label="หน่วยงาน"
              options={departments}
              value={formData.department || ""}
              onChange={(val) => setFormData({ ...formData, department: val })}
            />
          </div>

          <div>
            <MultiSearchableSelect
              label={`สมาชิกทีม (Team Members) *  —  เลือกแล้ว ${teamMembers.length} คน`}
              options={teamMembersOptions}
              value={teamMembers}
              onChange={(members) => {
                setTeamMembers(members);
                if (members.length > 0) setFormError("");
              }}
              placeholder="ค้นหาชื่อ หรือพิมพ์ชื่อใหม่แล้วกดเพิ่ม..."
            />
            {formError && (
              <p className="mt-1 text-[11px] font-bold text-rose-600">{formError}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Requester</label>
            <input
              type="text"
              value={formData.requester || ""}
              onChange={(e) => setFormData({ ...formData, requester: e.target.value })}
              placeholder="ผู้ร้องขอ / หน่วยงานที่ร้องขอ"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Priority</label>
              <select
                value={formData.priority || "ปกติ"}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as "ปกติ" | "สูง" })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
              >
                <option value="ปกติ">Medium (ปกติ)</option>
                <option value="สูง">High (สูง)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Status</label>
              <select
                value={formData.status || "กำลังทำ"}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as "เสร็จแล้ว" | "กำลังทำ" | "Planning" })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
              >
                <option value="Planning">Planning</option>
                <option value="กำลังทำ">In Progress (กำลังทำ)</option>
                <option value="เสร็จแล้ว">Completed (เสร็จแล้ว)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Start Date</label>
              <input
                type="text"
                placeholder="DD/MM/YYYY"
                value={formData.startDate || ""}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">End Date</label>
              <input
                type="text"
                placeholder="DD/MM/YYYY"
                value={formData.endDate || ""}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/60">
            <h3 className="text-xs font-bold text-slate-900 mb-3">Tech Stack ที่ใช้งาน</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SearchableSelect label="ภาษาที่ใช้ (Language)" options={languages} value={formData.language || ""} onChange={(val) => setFormData({ ...formData, language: val })} />
              <SearchableSelect label="Framework" options={frameworks} value={formData.framework || ""} onChange={(val) => setFormData({ ...formData, framework: val })} />
              <SearchableSelect label="Library / Package" options={libraries} value={formData.library || ""} onChange={(val) => setFormData({ ...formData, library: val })} />
              <SearchableSelect label="Database" options={databases} value={formData.database || ""} onChange={(val) => setFormData({ ...formData, database: val })} />
            </div>
            <div className="mt-3">
              <SearchableSelect label="API / Service" options={apiServices} value={formData.apiService || ""} onChange={(val) => setFormData({ ...formData, apiService: val })} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">อื่น ๆ (พิมพ์เพิ่มเอง)</label>
            <textarea
              rows={2}
              placeholder="เช่น Docker, Redis Cache, Nginx, CI/CD"
              value={formData.otherTech || ""}
              onChange={(e) => setFormData({ ...formData, otherTech: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-emerald-500"
            />
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