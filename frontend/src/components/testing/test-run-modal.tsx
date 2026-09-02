
"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { TestRunItem, TestTool, TestEnvironment, TestStatus } from "@/types/test-automation";
import { ProjectOption } from "@/lib/testing-api";
import Portal from "@/components/ui/portal";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";

interface TestRunModalProps {
  isOpen: boolean;
  mode?: "create" | "view" | "edit";
  initialData?: TestRunItem | null;
  projects: ProjectOption[];
  onClose: () => void;
  onSubmit: (data: TestRunItem) => void;
}

const emptyFormData = {
  projectId: 0,
  suiteName: "",
  tool: "playwright" as TestTool,
  environment: "DEV" as TestEnvironment,
  totalCases: 0,
  passedCases: 0,
  failedCases: 0,
  skippedCases: 0,
  durationSeconds: 0,
  status: "passed" as TestStatus,
  runDate: new Date().toISOString().split("T")[0],
  reportUrl: "",
  note: "",
};

export default function TestRunModal({
  isOpen,
  mode = "create",
  initialData = null,
  projects,
  onClose,
  onSubmit,
}: TestRunModalProps) {
  const [formData, setFormData] = useState(emptyFormData);

  const isViewMode = mode === "view";

  // ทุกครั้งที่เปิดโมดัล — ถ้ามี initialData (view/edit) ให้โหลดข้อมูลจริงมาใส่ฟอร์ม
  // ถ้าไม่มี (create) ให้รีเซ็ตเป็นค่าว่างเริ่มต้น (เลือกโปรเจกต์แรกในรายการจริงเป็นค่าเริ่มต้น)
  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setFormData({
        projectId: initialData.projectId,
        suiteName: initialData.suiteName,
        tool: initialData.tool,
        environment: initialData.environment,
        totalCases: initialData.totalCases,
        passedCases: initialData.passedCases,
        failedCases: initialData.failedCases,
        skippedCases: initialData.skippedCases,
        durationSeconds: initialData.durationSeconds,
        status: initialData.status,
        runDate: initialData.runDate,
        reportUrl: (initialData as any).reportUrl ?? "",
        note: (initialData as any).note ?? "",
      });
    } else {
      setFormData({ ...emptyFormData, projectId: projects[0]?.id ?? 0 });
    }
  }, [isOpen, initialData, projects]);

  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewMode) return; // กันพลาด ไม่ให้ submit ตอนเป็นโหมดดูอย่างเดียว
    if (!formData.projectId) return;

    const projectName = projects.find((p) => p.id === formData.projectId)?.name ?? "";

    const newItem: TestRunItem = {
      id: initialData?.id ?? Date.now(),
      ...formData,
      projectName,
      subText: formData.note ? formData.note.slice(0, 30) : undefined,
    };
    onSubmit(newItem);
    onClose();
  };

  const titleText =
    mode === "view"
      ? "รายละเอียดผลทดสอบอัตโนมัติ"
      : mode === "edit"
      ? "แก้ไขผลทดสอบอัตโนมัติ"
      : "บันทึกผลทดสอบอัตโนมัติ";

  const fieldClass =
    "w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors";
  const smallFieldClass =
    "w-full text-xs px-2 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors";

  return (
    <Portal>
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{titleText}</h2>
            <p className="text-xs text-slate-500">Test Automation Run — ผลลัพธ์ของแต่ละรอบการรันเทส</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* fieldset disabled + className="contents" = ปิดการแก้ไขทุกช่องข้างในทีเดียว
              โดยไม่กระทบ layout เดิม (display:contents ทำให้ fieldset โปร่งใสต่อ grid/flex) */}
          <fieldset disabled={isViewMode} className="contents">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">โปรเจกต์</label>
              <select
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: Number(e.target.value) })}
                className={`${fieldClass} font-semibold bg-slate-50`}
              >
                {projects.length === 0 && <option value={0}>ไม่มีโปรเจกต์ในระบบ</option>}
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อชุดทดสอบ (Suite)</label>
              <input
                type="text"
                required
                placeholder="เช่น Login E2E Regression"
                value={formData.suiteName}
                onChange={(e) => setFormData({ ...formData, suiteName: e.target.value })}
                className={fieldClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">เครื่องมือ</label>
                <select
                  value={formData.tool}
                  onChange={(e) => setFormData({ ...formData, tool: e.target.value as TestTool })}
                  className={`${fieldClass} font-semibold`}
                >
                  <option value="playwright">playwright</option>
                  <option value="cypress">cypress</option>
                  <option value="vitest">vitest</option>
                  <option value="jest">jest</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">สภาพแวดล้อม</label>
                <select
                  value={formData.environment}
                  onChange={(e) => setFormData({ ...formData, environment: e.target.value as TestEnvironment })}
                  className={`${fieldClass} font-semibold`}
                >
                  <option value="DEV">DEV</option>
                  <option value="SIT">SIT</option>
                  <option value="UAT">UAT</option>
                  <option value="PROD">PROD</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">ทั้งหมด</label>
                <input
                  type="number"
                  min="0"
                  value={formData.totalCases}
                  onChange={(e) => setFormData({ ...formData, totalCases: Number(e.target.value) })}
                  className={smallFieldClass}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">ผ่าน</label>
                <input
                  type="number"
                  min="0"
                  value={formData.passedCases}
                  onChange={(e) => setFormData({ ...formData, passedCases: Number(e.target.value) })}
                  className={`${smallFieldClass} text-emerald-600 font-bold`}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">ไม่ผ่าน</label>
                <input
                  type="number"
                  min="0"
                  value={formData.failedCases}
                  onChange={(e) => setFormData({ ...formData, failedCases: Number(e.target.value) })}
                  className={`${smallFieldClass} text-rose-600 font-bold`}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">ข้าม</label>
                <input
                  type="number"
                  min="0"
                  value={formData.skippedCases}
                  onChange={(e) => setFormData({ ...formData, skippedCases: Number(e.target.value) })}
                  className={`${smallFieldClass} text-slate-400`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">เวลา (วินาที)</label>
                <input
                  type="number"
                  value={formData.durationSeconds}
                  onChange={(e) => setFormData({ ...formData, durationSeconds: Number(e.target.value) })}
                  className={fieldClass}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">สถานะ</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as TestStatus })}
                  className={`${fieldClass} font-semibold`}
                >
                  <option value="passed">ผ่านทั้งหมด</option>
                  <option value="partial">ผ่านบางส่วน</option>
                  <option value="failed">ล้มเหลว</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">วันที่รัน</label>
                <input
                  type="date"
                  value={formData.runDate}
                  onChange={(e) => setFormData({ ...formData, runDate: e.target.value })}
                  className={fieldClass}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ลิงก์รายงาน (Report URL)</label>
              <input
                type="text"
                placeholder="https://..."
                value={formData.reportUrl}
                onChange={(e) => setFormData({ ...formData, reportUrl: e.target.value })}
                className={fieldClass}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">โน้ต / สาเหตุที่ล้มเหลว</label>
              <textarea
                rows={3}
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                className={`${fieldClass} p-3`}
              />
            </div>
          </fieldset>

          <div className="flex justify-end pt-2">
            {isViewMode ? (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all active:scale-95"
              >
                ปิด
              </button>
            ) : (
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all active:scale-95"
              >
                {mode === "edit" ? "บันทึกการแก้ไข" : "บันทึก"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
    </Portal>
  );
}