"use client";

import React from "react";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/buttons/button";
import Portal from "@/components/ui/portal";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";

interface PresentItemModalProps {
  isOpen: boolean;
  editingId: string | null;
  title: string;
  description: string;
  imagePreview: string | null;
  setTitle: (val: string) => void;
  setDescription: (val: string) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClose: () => void;
  onSave: () => void;
}

export function PresentItemModal({
  isOpen,
  editingId,
  title,
  description,
  imagePreview,
  setTitle,
  setDescription,
  onImageChange,
  onClose,
  onSave,
}: PresentItemModalProps) {
  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  return (
    <Portal>
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">
            {editingId ? "แก้ไขรายการนำเสนอ" : "เพิ่มรายการนำเสนอ"}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs font-medium text-slate-700">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">รูปภาพระบบ</label>
            <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl h-32 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all duration-300 overflow-hidden">
              {imagePreview ? (
                <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <>
                  <ImagePlus className="w-6 h-6 text-slate-400" />
                  <span className="text-slate-400 text-[11px]">คลิกเพื่อเลือกไฟล์รูปภาพ</span>
                </>
              )}
              <input type="file" accept="image/*" onChange={onImageChange} className="hidden" />
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">หัวข้อ</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น หน้า Login ระบบ"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">รายละเอียด</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="อธิบายว่าหน้านี้ทำอะไรได้บ้าง"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium resize-none focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              onClick={onClose}
              type="button"
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
            >
              ยกเลิก
            </button>
            <Button onClick={onSave} className="w-auto px-5">
              {editingId ? "บันทึกการแก้ไข" : "บันทึก"}
            </Button>
          </div>
        </div>
      </div>
    </div>
    </Portal>
  );
}