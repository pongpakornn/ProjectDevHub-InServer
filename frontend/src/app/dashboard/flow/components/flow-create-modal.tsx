"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { FlowStatus, FlowWorkType } from "@/types/flow";

interface FlowCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description: string;
    status: FlowStatus;
    workType: FlowWorkType;
    startDate: string;
    endDate: string;
  }) => Promise<void> | void;
}

export default function FlowCreateModal({ isOpen, onClose, onSubmit }: FlowCreateModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<FlowStatus>("วางแผน");
  const [workType, setWorkType] = useState<FlowWorkType>("ทำคนเดียว");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const resetAndClose = () => {
    setName("");
    setDescription("");
    setStatus("วางแผน");
    setWorkType("ทำคนเดียว");
    setStartDate("");
    setEndDate("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSaving) return;
    setIsSaving(true);
    try {
      await onSubmit({ name: name.trim(), description, status, workType, startDate, endDate });
      resetAndClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-900">สร้าง Flow ใหม่</h2>
          <button
            onClick={resetAndClose}
            type="button"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs font-medium text-slate-700">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">ชื่อ Flow *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น CheckPallet V.2"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">รายละเอียด</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">สถานะ</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as FlowStatus)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
              >
                <option value="วางแผน">วางแผน</option>
                <option value="กำลังทำ">กำลังทำ</option>
                <option value="เสร็จแล้ว">เสร็จแล้ว</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">รูปแบบงาน</label>
              <select
                value={workType}
                onChange={(e) => setWorkType(e.target.value as FlowWorkType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
              >
                <option value="ทำคนเดียว">ทำคนเดียว</option>
                <option value="ทำกับทีม">ทำกับทีม</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">วันเริ่ม</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">วันสิ้นสุด</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={resetAndClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isSaving}
              className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md shadow-indigo-900/10"
            >
              {isSaving ? "กำลังบันทึก..." : "สร้าง Flow"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
