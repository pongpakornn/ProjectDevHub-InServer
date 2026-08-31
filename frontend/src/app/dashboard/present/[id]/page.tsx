// path: app/dashboard/present/[id]/page.tsx
"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { WorkItem } from "@/types/project-detail";
import { PresentHeader } from "@/components/present/present-header";
import { PresentCarousel } from "@/components/present/present-carousel";
import { PresentGridItem } from "@/components/present/present-grid-item";
import { PresentLightbox } from "@/components/present/present-lightbox";
import { PresentItemModal } from "@/components/present/present-item-modal";
import * as soloApi from "@/lib/project-solo-api";
import * as teamApi from "@/lib/project-team-api";

// TODO: ยังไม่มี Auth Context ผูก User จริง — ใช้ userId ของ Admin ทดสอบไปก่อน (userId=1)
const CURRENT_USER_ID = 1;

interface ProjectHeaderInfo {
  name: string;
  status: string;
  startDate?: string;
  endDate?: string;
}

export default function PresentProjectDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const projectId = Number(params?.id);
  const routeType = searchParams.get("type") === "team" ? "team" : "solo";
  const api = routeType === "team" ? teamApi : soloApi;

  const [projectInfo, setProjectInfo] = useState<ProjectHeaderInfo | null>(null);
  const [items, setItems] = useState<WorkItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("right");

  const loadDetail = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const detail = await api.getProjectDetail(projectId);
      setProjectInfo({
        name: detail.project.name,
        status: detail.project.status,
        startDate: detail.project.startDate,
        endDate: detail.project.endDate,
      });
      setItems(detail.showcases);
      setActiveIndex((i) => Math.min(i, Math.max(0, detail.showcases.length - 1)));
    } catch (err) {
      console.error(err);
      setLoadError("ไม่สามารถโหลดข้อมูลโปรเจกต์ได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, routeType]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

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
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const closeItemModal = () => {
    setIsAddOpen(false);
    setEditingId(null);
    setTitle("");
    setDescription("");
    setImagePreview(null);
    setImageFile(null);
  };

  const openEditModal = (item: WorkItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description);
    setImagePreview(item.imageUrl);
    setImageFile(null);
    setIsAddOpen(true);
  };

  const handleSaveItem = async () => {
    if (!title.trim() || !projectId || isSaving) return;
    setIsSaving(true);
    try {
      let finalImageUrl = imagePreview || "";
      if (imageFile) {
        finalImageUrl = await api.uploadShowcaseImage(projectId, imageFile);
      } else if (editingId) {
        const existing = items.find((it) => it.id === editingId);
        finalImageUrl = existing?.imageUrl || finalImageUrl;
      }

      if (editingId) {
        await api.updateWorkItem(Number(editingId), projectId, {
          title,
          description,
          flowDescription: items.find((it) => it.id === editingId)?.flowDescription || "",
          imageUrl: finalImageUrl,
        });
      } else {
        await api.createWorkItem(
          projectId,
          { title, description, flowDescription: "", imageUrl: finalImageUrl },
          CURRENT_USER_ID
        );
      }

      await loadDetail();
      setActiveIndex(items.length); // เผื่อรายการใหม่ ให้เลื่อนไปดูตัวล่าสุดหลังโหลดใหม่
    } catch (err) {
      console.error(err);
      alert("บันทึกรายการนำเสนอไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSaving(false);
      closeItemModal();
    }
  };

  const handleDeleteItem = async (id: string) => {
    const prevItems = items;
    setItems((prev) => {
      const next = prev.filter((it) => it.id !== id);
      setActiveIndex((i) => Math.min(i, Math.max(0, next.length - 1)));
      return next;
    });
    try {
      await api.deleteWorkItem(Number(id));
    } catch (err) {
      console.error(err);
      alert("ลบรายการนำเสนอไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      setItems(prevItems);
    }
  };

  const activeItem = items[activeIndex];

  if (isLoading) {
    return <div className="w-full py-20 text-center text-slate-500 text-xs font-medium">กำลังโหลดข้อมูลโปรเจกต์...</div>;
  }

  if (loadError || !projectInfo) {
    return (
      <div className="w-full py-20 text-center text-red-500 text-xs font-medium">
        {loadError || "ไม่พบโปรเจกต์นี้"}
      </div>
    );
  }

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
        project={projectInfo}
        itemCount={items.length}
        onOpenAddModal={() => {
          setEditingId(null);
          setTitle("");
          setDescription("");
          setImagePreview(null);
          setImageFile(null);
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
        activeItem={activeItem ?? null}
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
