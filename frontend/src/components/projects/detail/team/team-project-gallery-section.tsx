"use client";

import React, { useState } from "react";
import { Eye, Plus, RotateCw, Trash2, Workflow, X } from "lucide-react";

export interface WorkItem {
  id: string;
  title: string;
  description: string;
  flowDescription: string;
  imageUrl: string;
  date: string;
}

interface TeamProjectGallerySectionProps {
  works: WorkItem[];
  setWorks: React.Dispatch<React.SetStateAction<WorkItem[]>>;
}

export default function TeamProjectGallerySection({
  works,
  setWorks,
}: TeamProjectGallerySectionProps) {
  const [flippedCards, setFlippedCards] = useState<{ [id: string]: boolean }>({});
  const [isAddWorkOpen, setIsAddWorkOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const [workTitle, setWorkTitle] = useState("");
  const [workDesc, setWorkDesc] = useState("");
  const [workFlow, setWorkFlow] = useState("");
  const [workImage, setWorkImage] = useState<string | null>(null);

  const toggleCardFlip = (id: string) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setWorkImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveWork = () => {
    if (!workTitle) return;
    const newWork: WorkItem = {
      id: Date.now().toString(),
      title: workTitle,
      description: workDesc,
      flowDescription: workFlow,
      imageUrl:
        workImage ||
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
      date: new Date().toLocaleDateString("th-TH"),
    };
    setWorks([...works, newWork]);
    setIsAddWorkOpen(false);
    setWorkTitle("");
    setWorkDesc("");
    setWorkFlow("");
    setWorkImage(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-800 text-sm">Present ผลงาน / หน้าจอระบบ</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPreviewOpen(true)}
            className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            พรีวิว
          </button>
          <button
            onClick={() => setIsAddWorkOpen(true)}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            เพิ่มผลงาน
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {works.map((work) => {
          const isFlipped = flippedCards[work.id];
          return (
            <div key={work.id} className="group relative [perspective:1000px] h-[260px]">
              <div
                className={`relative w-full h-full duration-500 [transform-style:preserve-3d] transition-transform rounded-xl border border-slate-200 shadow-xs ${
                  isFlipped ? "[transform:rotateY(180deg)]" : ""
                }`}
              >
                <div className="absolute inset-0 w-full h-full bg-white rounded-xl backface-hidden p-3 flex flex-col justify-between">
                  <div
                    onClick={() => toggleCardFlip(work.id)}
                    className="cursor-pointer relative flex-1 bg-slate-100 rounded-lg overflow-hidden group/img"
                  >
                    <img src={work.imageUrl} alt={work.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                      <RotateCw className="w-4 h-4" />
                      คลิกเพื่อดู Flow
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{work.title}</h4>
                      <p className="text-[10px] text-slate-400">บันทึก {work.date}</p>
                    </div>
                    <button
                      onClick={() => setWorks(works.filter((w) => w.id !== work.id))}
                      className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="absolute inset-0 w-full h-full bg-slate-900 text-white rounded-xl [backface-visibility:hidden] [transform:rotateY(180deg)] p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                      <span className="text-[11px] font-bold text-indigo-400 flex items-center gap-1">
                        <Workflow className="w-3.5 h-3.5" />
                        Workflow Diagram
                      </span>
                      <button
                        onClick={() => toggleCardFlip(work.id)}
                        className="text-slate-400 hover:text-white cursor-pointer"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <h5 className="font-bold text-xs mb-1">{work.title}</h5>
                    <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                      {work.flowDescription || "ไม่มีการระบุ Workflow"}
                    </p>
                  </div>
                  <p className="text-[10px] text-slate-500 text-center">คลิกไอคอนหมุนเพื่อกลับไปดูรูป</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isAddWorkOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">เพิ่มผลงานของโครงการ</h3>
              <button
                onClick={() => setIsAddWorkOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
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
                <label className="block font-semibold text-slate-700 mb-1">
                  ฟังก์ชั่นการทำงาน (สำหรับสร้าง Auto Flow)
                </label>
                <textarea
                  placeholder="เช่น หน้านี้หน้า Login Admin -> หน้าหลัก เห็นทั้งระบบ และ User -> หน้าหลัก เห็นบางเมนู"
                  value={workFlow}
                  onChange={(e) => setWorkFlow(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg h-20 focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">รูปภาพ</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full text-slate-500 text-xs cursor-pointer"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsAddWorkOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg font-semibold text-xs text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveWork}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs cursor-pointer"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      {isPreviewOpen && works.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <button
            onClick={() => setIsPreviewOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-slate-300 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="max-w-4xl w-full flex flex-col items-center gap-4">
            <img
              src={works[previewIndex].imageUrl}
              alt={works[previewIndex].title}
              className="max-h-[70vh] object-contain rounded-xl border border-slate-800"
            />
            <div className="text-center text-white space-y-1">
              <h4 className="font-bold text-base">{works[previewIndex].title}</h4>
              <p className="text-xs text-slate-400">{works[previewIndex].description}</p>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <button
                disabled={previewIndex === 0}
                onClick={() => setPreviewIndex((prev) => prev - 1)}
                className="px-3 py-1 bg-slate-800 text-white rounded text-xs disabled:opacity-40 cursor-pointer"
              >
                ย้อนกลับ
              </button>
              <span className="text-xs text-slate-400 font-mono">
                {previewIndex + 1} / {works.length}
              </span>
              <button
                disabled={previewIndex === works.length - 1}
                onClick={() => setPreviewIndex((prev) => prev + 1)}
                className="px-3 py-1 bg-slate-800 text-white rounded text-xs disabled:opacity-40 cursor-pointer"
              >
                ถัดไป
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}