// path: app/dashboard/present/[id]/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { presentProjects } from "../page";
import { PresentItem } from "@/types/present";
import { PresentHeader } from "@/components/present/present-header";
import { PresentCarousel } from "@/components/present/present-carousel";
import { PresentGridItem } from "@/components/present/present-grid-item";
import { PresentLightbox } from "@/components/present/present-lightbox";
import { PresentItemModal } from "@/components/present/present-item-modal";

const defaultImage =
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80";

const mockItems: PresentItem[] = [
  { id: "i1", title: "Test1", subtitle: "Test1", imageUrl: defaultImage },
  { id: "i2", title: "Test2", subtitle: "Test2", imageUrl: defaultImage },
  { id: "i3", title: "Test3", subtitle: "Test3", imageUrl: defaultImage },
];

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

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxVisible, setLightboxVisible] = useState(false);
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
      setItems((prev) =>
        prev.map((it) =>
          it.id === editingId
            ? { ...it, title, subtitle: description, imageUrl: imagePreview || it.imageUrl }
            : it
        )
      );
    } else {
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
      <Link
        href="/dashboard/present"
        className="group inline-flex items-center gap-2 pl-2 pr-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-bold text-slate-600 hover:text-indigo-600 hover:border-indigo-300 hover:shadow-md transition-all duration-300 w-fit"
      >
        <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center transition-colors duration-300 group-hover:bg-indigo-50">
          <ArrowLeft className="w-3.5 h-3.5" />
        </span>
        กลับไปเลือกโปรเจค
      </Link>

      <PresentHeader
        project={project}
        itemCount={items.length}
        onOpenAddModal={() => {
          setEditingId(null);
          setTitle("");
          setDescription("");
          setImagePreview(null);
          setIsAddOpen(true);
        }}
      />

      <PresentCarousel
        items={items}
        activeIndex={activeIndex}
        slideDirection={slideDirection}
        onGoPrev={goPrev}
        onGoNext={goNext}
        onChangeActive={changeActive}
        onOpenLightbox={openLightbox}
      />

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-800">รายละเอียดทั้งหมด</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, idx) => (
            <PresentGridItem
              key={item.id}
              item={item}
              index={idx}
              onOpenLightbox={openLightbox}
              onEdit={openEditModal}
              onDelete={handleDeleteItem}
            />
          ))}
        </div>
      </div>

      <PresentLightbox
        isOpen={isLightboxOpen}
        isVisible={lightboxVisible}
        activeItem={activeItem}
        activeIndex={activeIndex}
        totalItems={items.length}
        slideDirection={slideDirection}
        onClose={closeLightbox}
        onPrev={lightboxPrev}
        onNext={lightboxNext}
      />

      <PresentItemModal
        isOpen={isAddOpen}
        editingId={editingId}
        title={title}
        description={description}
        imagePreview={imagePreview}
        setTitle={setTitle}
        setDescription={setDescription}
        onImageChange={handleImageChange}
        onClose={closeItemModal}
        onSave={handleSaveItem}
      />

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