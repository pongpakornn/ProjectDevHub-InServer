// path: app/dashboard/present/[id]/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  ImagePlus,
  Tv,
  Maximize2,
} from "lucide-react";

import { presentProjects } from "../page";
// ⚠️ ปรับ path/ชื่อ export ตรงนี้ให้ตรงกับของจริงในโปรเจค ถ้าไม่ตรง
import { Button } from "@/components/ui/buttons/button";
import EditButton from "@/components/ui/buttons/edit-button";
import DeleteButton from "@/components/ui/buttons/delete-button";

interface PresentItem {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
}

const defaultImage =
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80";

const mockItems: PresentItem[] = [
  { id: "i1", title: "Test1", subtitle: "Test1", imageUrl: defaultImage },
  { id: "i2", title: "Test2", subtitle: "Test2", imageUrl: defaultImage },
  { id: "i3", title: "Test3", subtitle: "Test3", imageUrl: defaultImage },
];

const statusBadgeClass = (status: string) => {
  if (status === "เสร็จแล้ว") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "กำลังทำ") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-slate-100 text-slate-600 border-slate-200";
};

export default function PresentProjectDetailPage() {
  const params = useParams();
  const projectId = String(params.id);
  const project = presentProjects.find((p) => p.id === projectId) || presentProjects[0];

  const [items, setItems] = useState<PresentItem[]>(mockItems);
  const [activeIndex, setActiveIndex] = useState(0);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Lightbox — พรีวิวแบบเต็มการ์ด ไม่มีกรอบ ฟีลโปรโมทหน้าตาระบบ
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxVisible, setLightboxVisible] = useState(false);

  // ทิศทางการเลื่อนสไลด์ ใช้ทำ animation ตอนเปลี่ยนรูป (ทั้ง preview หลักและ lightbox)
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("right");

  const changeActive = (nextIndex: number, dir: "left" | "right") => {
    setSlideDirection(dir);
    setActiveIndex(nextIndex);
  };

  const goPrev = () => changeActive(Math.max(0, activeIndex - 1), "left");
  const goNext = () => changeActive(Math.min(items.length - 1, activeIndex + 1), "right");

  const openLightbox = (idx: number) => {
    setActiveIndex(idx);
    setIsLightboxOpen(true);
    // เฟรมถัดไปค่อยเปิด opacity/scale เพื่อให้ transition smooth ตอนเมาท์
    requestAnimationFrame(() => requestAnimationFrame(() => setLightboxVisible(true)));
  };

  const closeLightbox = () => {
    setLightboxVisible(false);
    window.setTimeout(() => setIsLightboxOpen(false), 250);
  };

  const lightboxPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeIndex === 0) return;
    changeActive(activeIndex - 1, "left");
  };

  const lightboxNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeIndex >= items.length - 1) return;
    changeActive(activeIndex + 1, "right");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const closeItemModal = () => {
    setIsAddOpen(false);
    setEditingId(null);
    setTitle("");
    setDescription("");
    setImagePreview(null);
  };

  const openEditModal = (item: PresentItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.subtitle);
    setImagePreview(item.imageUrl);
    setIsAddOpen(true);
  };

  const handleSaveItem = () => {
    if (!title.trim()) return;

    if (editingId) {
      // แก้ไขรายการเดิม
      setItems((prev) =>
        prev.map((it) =>
          it.id === editingId
            ? { ...it, title, subtitle: description, imageUrl: imagePreview || it.imageUrl }
            : it
        )
      );
    } else {
      // เพิ่มรายการใหม่
      const newItem: PresentItem = {
        id: Date.now().toString(),
        title,
        subtitle: description,
        imageUrl: imagePreview || defaultImage,
      };
      setItems((prev) => [...prev, newItem]);
      setActiveIndex(items.length);
    }

    closeItemModal();
  };

  const handleDeleteItem = (id: string) => {
    setItems((prev) => {
      const next = prev.filter((it) => it.id !== id);
      setActiveIndex((i) => Math.min(i, Math.max(0, next.length - 1)));
      return next;
    });
  };

  const activeItem = items[activeIndex];

  return (
    <div className="w-full select-none space-y-6">
      {/* ปุ่มย้อนกลับ */}
      <Link
        href="/dashboard/present"
        className="group inline-flex items-center gap-2 pl-2 pr-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-bold text-slate-600 hover:text-indigo-600 hover:border-indigo-300 hover:shadow-md transition-all duration-300 w-fit"
      >
        <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center transition-colors duration-300 group-hover:bg-indigo-50">
          <ArrowLeft className="w-3.5 h-3.5" />
        </span>
        กลับไปเลือกโปรเจค
      </Link>

      {/* Header card — โทน indigo ให้ทางเดียวกับหน้า list */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-[#0f172a] via-[#1e1b4b] to-[#311042] border border-slate-800/80 p-6 shadow-xl">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/40 border border-indigo-500/30 text-indigo-400 text-[10px] font-mono font-bold tracking-wider uppercase">
              <Tv className="w-3 h-3" />
              PRESENT STATION
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">{project.name}</h1>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${statusBadgeClass(project.status)}`}>
                {project.status}
              </span>
              <span className="font-mono text-slate-400">{project.startDate} → {project.endDate}</span>
              <span className="text-slate-500">· {items.length} รายการนำเสนอ</span>
            </div>
          </div>

          {/* ปุ่มเพิ่มรายการนำเสนอ */}
          <div className="w-full sm:w-auto shrink-0">
            <Button
                onClick={() => {
                setEditingId(null);
                setTitle("");
                setDescription("");
                setImagePreview(null);
                setIsAddOpen(true);
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium px-4 py-2 rounded-xl transition-all shadow-md hover:shadow-indigo-500/25 cursor-pointer"
            >
                <Plus className="w-4 h-4" />
                เพิ่มรูป / รายละเอียด
            </Button>
            </div>
        </div>
      </div>

      {/* PREVIEW carousel */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Preview</h3>

        {items.length === 0 ? (
          <p className="text-center text-slate-400 text-xs py-16 border border-dashed border-slate-200 rounded-xl">
            ยังไม่มีรายการนำเสนอ — กด "เพิ่มรูป / รายละเอียด" เพื่อเริ่มต้น
          </p>
        ) : (
          <div className="relative flex items-center gap-3">
            <button
              onClick={goPrev}
              disabled={activeIndex === 0}
              className="shrink-0 w-9 h-9 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-all disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex-1 flex items-center gap-3 overflow-hidden">
              {items.map((item, idx) => {
                const isActive = idx === activeIndex;
                if (Math.abs(idx - activeIndex) > 1) return null;
                return (
                  <div
                    key={item.id}
                    className={`relative rounded-xl overflow-hidden shrink-0 transition-all duration-300 ease-out ${
                      isActive ? "w-full sm:w-2/3 h-64 sm:h-80 opacity-100" : "w-16 sm:w-24 h-64 sm:h-80 opacity-40"
                    }`}
                  >
                    {isActive ? (
                      <button
                        type="button"
                        onClick={() => openLightbox(idx)}
                        className="group relative w-full h-full block cursor-zoom-in"
                      >
                        <img
                          key={activeIndex}
                          src={item.imageUrl}
                          alt={item.title}
                          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03] ${
                            slideDirection === "right" ? "animate-slideInRight" : "animate-slideInLeft"
                          }`}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                            <Maximize2 className="w-4 h-4 text-slate-800" />
                          </span>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/70 to-transparent p-3 text-left">
                          <p className="text-[10px] text-white/70 font-mono">
                            {String(idx + 1).padStart(2, "0")}
                          </p>
                          <p className="text-white font-bold text-sm">{item.title}</p>
                          <p className="text-white/80 text-xs">{item.subtitle}</p>
                        </div>
                      </button>
                    ) : (
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={goNext}
              disabled={activeIndex === items.length - 1}
              className="shrink-0 w-9 h-9 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-all disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {items.length > 0 && (
          <div className="flex items-center justify-center gap-1.5 pt-1">
            {items.map((it, idx) => (
              <button
                key={it.id}
                onClick={() => changeActive(idx, idx > activeIndex ? "right" : "left")}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === activeIndex ? "w-6 bg-indigo-500" : "w-1.5 bg-slate-200"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      
      {/* รายละเอียดทั้งหมด — แก้ไขปัญหา Event Click ทับซ้อน */}
<div className="space-y-3">
  <h3 className="text-sm font-bold text-slate-800">รายละเอียดทั้งหมด</h3>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {items.map((item, idx) => (
      <div
        key={item.id}
        className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-300 hover:-translate-y-1 transition-all duration-300 ease-out"
      >
        <div className="relative aspect-video bg-slate-100 overflow-hidden">
          {/* 1. เลเยอร์กดดู พรีวิว (ครอบเฉพาะรูปภาพและข้อความ) */}
          <div
            onClick={() => openLightbox(idx)}
            className="w-full h-full cursor-pointer"
          >
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/5 to-transparent" />

            <span className="absolute top-2.5 left-2.5 w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold flex items-center justify-center">
              {idx + 1}
            </span>

            <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <span className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                <Maximize2 className="w-4 h-4 text-slate-800" />
              </span>
            </span>

            <div className="absolute bottom-0 left-0 right-0 p-3 pointer-events-none">
              <p className="text-white font-bold text-xs truncate">{item.title}</p>
              <p className="text-white/75 text-[11px] truncate">{item.subtitle}</p>
            </div>
          </div>

          {/* 2. เลเยอร์ปุ่มแก้ไข / ลบ (แยกออกมาอยู่นอก div พรีวิว และใส่ z-10 เพื่อลอยอยู่ด้านบน) */}
          <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
  <EditButton
    onClick={(e: React.MouseEvent) => {
      e.stopPropagation();
      openEditModal(item);
    }}
  />
  <DeleteButton
    onClick={(e: React.MouseEvent) => {
      e.stopPropagation();
      handleDeleteItem(item.id);
    }}
  />
</div>
        </div>
      </div>
    ))}
  </div>
</div>

      {/* Lightbox — พรีวิวเต็มการ์ด สมูท ไม่มีกรอบ ฟีลโปรโมทระบบ */}
      {isLightboxOpen && activeItem && (
        <div
          onClick={closeLightbox}
          className={`fixed inset-0 z-70 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 sm:p-10 transition-opacity duration-300 ease-out ${
            lightboxVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-5 right-5 sm:top-8 sm:right-8 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors duration-300"
          >
            <X className="w-5 h-5" />
          </button>

          {activeIndex > 0 && (
            <button
              onClick={lightboxPrev}
              className="absolute left-3 sm:left-8 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors duration-300"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {activeIndex < items.length - 1 && (
            <button
              onClick={lightboxNext}
              className="absolute right-3 sm:right-8 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors duration-300"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          <div
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full max-w-5xl transition-all duration-300 ease-out ${
              lightboxVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            <img
              key={activeIndex}
              src={activeItem.imageUrl}
              alt={activeItem.title}
              className={`w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl shadow-black/50 ${
                slideDirection === "right" ? "animate-slideInRight" : "animate-slideInLeft"
              }`}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 via-black/40 to-transparent rounded-b-2xl p-6 sm:p-8">
              <p className="text-indigo-300 text-[11px] font-mono font-bold tracking-wider">
                {String(activeIndex + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
              </p>
              <p className="text-white font-extrabold text-lg sm:text-xl mt-1">{activeItem.title}</p>
              <p className="text-white/70 text-sm mt-0.5">{activeItem.subtitle}</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal เพิ่ม/แก้ไขรายการนำเสนอ */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                {editingId ? "แก้ไขรายการนำเสนอ" : "เพิ่มรายการนำเสนอ"}
              </h2>
              <button onClick={closeItemModal} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
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
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
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
                  onClick={closeItemModal}
                  type="button"
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                >
                  ยกเลิก
                </button>
                <Button onClick={handleSaveItem} className="w-auto px-5">
                  {editingId ? "บันทึกการแก้ไข" : "บันทึก"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keyframes สำหรับ animation ตอนเลื่อนสไลด์ดู (preview หลัก + lightbox) */}
      <style jsx global>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(28px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-28px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        .animate-slideInRight {
          animation: slideInRight 0.4s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .animate-slideInLeft {
          animation: slideInLeft 0.4s cubic-bezier(0.22, 1, 0.36, 1);
        }
      `}</style>
    </div>
  );
}