"use client";

import React, { useState } from "react";
import { Eye, Plus, RotateCw, Workflow, X } from "lucide-react";
import { Button } from "@/components/ui/buttons/button";
import EditButtonV2 from "@/components/ui/buttons/buttonv2/edit-buttonv2";
import DeleteButtonV2 from "@/components/ui/buttons/buttonv2/delete-buttonv2";
import TeamAddWorkModal from "./team-add-work-modal";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWork, setEditingWork] = useState<WorkItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const toggleCardFlip = (id: string) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDeleteWork = (id: string) => setWorks(works.filter((w) => w.id !== id));

  const openAddModal = () => {
    setEditingWork(null);
    setIsModalOpen(true);
  };

  const openEditModal = (work: WorkItem) => {
    setEditingWork(work);
    setIsModalOpen(true);
  };

  const handleSaveWork = (data: { title: string; desc: string; flow: string; image: string | null }) => {
    if (editingWork) {
      setWorks(
        works.map((w) =>
          w.id === editingWork.id
            ? { ...w, title: data.title, description: data.desc, flowDescription: data.flow, imageUrl: data.image || w.imageUrl }
            : w
        )
      );
    } else {
      const newWork: WorkItem = {
        id: Date.now().toString(),
        title: data.title,
        description: data.desc,
        flowDescription: data.flow,
        imageUrl: data.image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
        date: new Date().toLocaleDateString("th-TH"),
      };
      setWorks([...works, newWork]);
    }
    setIsModalOpen(false);
    setEditingWork(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-800 text-sm">Present ผลงาน / หน้าจอระบบ</h3>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsPreviewOpen(true)}
            className="w-auto! bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs hover:shadow-sm normal-case text-xs font-bold py-1.5 px-3 flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            พรีวิว
          </Button>
          <Button
            onClick={openAddModal}
            className="w-auto! bg-indigo-600 hover:bg-indigo-700 shadow-[0_4px_12px_rgba(79,70,229,0.25)] hover:shadow-[0_6px_16px_rgba(79,70,229,0.4)] normal-case text-xs font-bold py-1.5 px-3 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            เพิ่มผลงาน
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {works.map((work) => {
          const isFlipped = flippedCards[work.id];
          return (
            <div key={work.id} className="group relative [perspective:1000px] h-[260px]">
              <div className={`relative w-full h-full duration-500 [transform-style:preserve-3d] transition-transform rounded-xl border border-slate-200 shadow-xs ${isFlipped ? "[transform:rotateY(180deg)]" : ""}`}>
                <div className="absolute inset-0 w-full h-full bg-white rounded-xl [backface-visibility:hidden] p-3 flex flex-col justify-between">
                  <div onClick={() => toggleCardFlip(work.id)} className="cursor-pointer relative flex-1 bg-slate-100 rounded-lg overflow-hidden group/img">
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
                    <div className="flex items-center gap-2">
                      <EditButtonV2 onClick={() => openEditModal(work)} title="แก้ไขผลงาน" />
                      <DeleteButtonV2 onClick={() => handleDeleteWork(work.id)} title="ลบผลงาน" />
                    </div>
                  </div>
                </div>

                <div className="absolute inset-0 w-full h-full bg-slate-900 text-white rounded-xl [backface-visibility:hidden] [transform:rotateY(180deg)] p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                      <span className="text-[11px] font-bold text-indigo-400 flex items-center gap-1">
                        <Workflow className="w-3.5 h-3.5" />
                        Workflow Diagram
                      </span>
                      <button onClick={() => toggleCardFlip(work.id)} className="text-slate-400 hover:text-white">
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <h5 className="font-bold text-xs mb-1">{work.title}</h5>
                    <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                      {work.flowDescription || "ไม่มีการระบุ Workflow"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                    <p className="text-[10px] text-slate-500">คลิกไอคอนหมุนเพื่อกลับไปดูรูป</p>
                    <div className="flex items-center gap-2">
                      <EditButtonV2 onClick={() => openEditModal(work)} title="แก้ไขผลงาน" />
                      <DeleteButtonV2 onClick={() => handleDeleteWork(work.id)} title="ลบผลงาน" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <TeamAddWorkModal
        isOpen={isModalOpen}
        editingWork={editingWork}
        onClose={() => {
          setIsModalOpen(false);
          setEditingWork(null);
        }}
        onSave={handleSaveWork}
      />

      {isPreviewOpen && works.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <button onClick={() => setIsPreviewOpen(false)} className="absolute top-4 right-4 text-white hover:text-slate-300">
            <X className="w-6 h-6" />
          </button>

          <div className="max-w-4xl w-full flex flex-col items-center gap-4">
            <img src={works[previewIndex].imageUrl} alt={works[previewIndex].title} className="max-h-[70vh] object-contain rounded-xl border border-slate-800" />
            <div className="text-center text-white space-y-1">
              <h4 className="font-bold text-base">{works[previewIndex].title}</h4>
              <p className="text-xs text-slate-400">{works[previewIndex].description}</p>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <Button disabled={previewIndex === 0} onClick={() => setPreviewIndex((p) => p - 1)} className="w-auto! bg-slate-800 hover:bg-slate-700 text-white normal-case text-xs font-semibold py-1 px-3 disabled:opacity-40">
                ย้อนกลับ
              </Button>
              <span className="text-xs text-slate-400 font-mono">{previewIndex + 1} / {works.length}</span>
              <Button disabled={previewIndex === works.length - 1} onClick={() => setPreviewIndex((p) => p + 1)} className="w-auto! bg-slate-800 hover:bg-slate-700 text-white normal-case text-xs font-semibold py-1 px-3 disabled:opacity-40">
                ถัดไป
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}