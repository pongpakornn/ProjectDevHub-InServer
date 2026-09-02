"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/buttons/button";
import { WorkItem } from "@/types/project-detail";
import { uploadShowcaseImage } from "@/lib/project-team-api";
import Portal from "@/components/ui/portal";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";

interface TeamAddWorkModalProps {
  isOpen: boolean;
  editingWork: WorkItem | null;
  projectId: number;
  projectName?: string;
  onClose: () => void;
  onSave: (workData: { title: string; desc: string; flow: string; image: string | null }) => void;
}

export default function TeamAddWorkModal({
  isOpen,
  editingWork,
  projectId,
  projectName,
  onClose,
  onSave,
}: TeamAddWorkModalProps) {
  const [workTitle, setWorkTitle] = useState("");
  const [workDesc, setWorkDesc] = useState("");
  const [workFlow, setWorkFlow] = useState("");
  const [workImage, setWorkImage] = useState<string | null>(null);
  const [workImageFile, setWorkImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (editingWork) {
      setWorkTitle(editingWork.title);
      setWorkDesc(editingWork.description);
      setWorkFlow(editingWork.flowDescription);
      setWorkImage(editingWork.imageUrl);
      setWorkImageFile(null);
    } else {
      setWorkTitle("");
      setWorkDesc("");
      setWorkFlow("");
      setWorkImage(null);
      setWorkImageFile(null);
    }
  }, [editingWork, isOpen]);

  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setWorkImageFile(file);
      setWorkImage(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!workTitle) return;
    let finalImageUrl = editingWork?.imageUrl || null;

    try {
      if (workImageFile) {
        setIsUploading(true);
        finalImageUrl = await uploadShowcaseImage(projectId, workImageFile, projectName, workTitle);
      }
      onSave({ title: workTitle, desc: workDesc, flow: workFlow, image: finalImageUrl });
    } catch (err) {
      console.error(err);
      alert("อัปโหลดรูปภาพไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Portal>
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900 text-sm">
            {editingWork ? "แก้ไขผลงานของโครงการ" : "เพิ่มผลงานของโครงการ"}
          </h3>
          <button
            onClick={onClose}
            type="button"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            ยกเลิก
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">ชื่อหน้า / ฟีเจอร์ *</label>
            <input
              type="text"
              placeholder="เช่น หน้า Dashboard สรุปโครงการ"
              value={workTitle}
              onChange={(e) => setWorkTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">รายละเอียด</label>
            <textarea
              placeholder="อธิบายว่าหน้านี้ทำอะไรได้บ้าง"
              value={workDesc}
              onChange={(e) => setWorkDesc(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg h-20 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">ฟังก์ชั่นการทำงาน (สำหรับสร้าง Auto Flow)</label>
            <textarea
              placeholder="เช่น หน้านี้หน้า Login Admin -> หน้าหลัก เห็นทั้งระบบ และ User -> หน้าหลัก เห็นบางเมนู"
              value={workFlow}
              onChange={(e) => setWorkFlow(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg h-20 focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">รูปภาพ</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-slate-500 text-xs" />
            {workImage && (
              <img src={workImage} alt="preview" className="mt-2 w-full h-32 object-cover rounded-lg border border-slate-200" />
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button onClick={onClose} className="w-auto! bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 normal-case text-xs font-semibold py-2 px-4">
            ยกเลิก
          </Button>
          <Button
            onClick={handleSave}
            disabled={isUploading}
            className="w-auto! bg-indigo-600 hover:bg-indigo-700 shadow-[0_4px_12px_rgba(79,70,229,0.25)] hover:shadow-[0_6px_16px_rgba(79,70,229,0.4)] normal-case text-xs font-bold py-2 px-4 disabled:opacity-50"
          >
            {isUploading ? "กำลังอัปโหลด..." : "บันทึก"}
          </Button>
        </div>
      </div>
    </div>
    </Portal>
  );
}
