// path: app/dashboard/visitor/[userId]/present/[projectId]/page.tsx
// Visitor Mode — สไลด์นำเสนอผลงานของโปรเจกต์คนอื่น (อ่านอย่างเดียวล้วนๆ — ไม่มีปุ่มเพิ่ม/แก้ไข/ลบเลย)
"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, Eye } from "lucide-react";

import { WorkItem } from "@/types/project-detail";
import { PresentHeader } from "@/components/present/present-header";
import { PresentCarousel } from "@/components/present/present-carousel";
import { PresentGridItem } from "@/components/present/present-grid-item";
import { PresentLightbox } from "@/components/present/present-lightbox";
import { getSoloProjectDetail, getTeamProjectDetail } from "@/lib/visitor-api";
import { getStoredUser } from "@/lib/session";

// TODO: ยังไม่มี Auth Context ผูก User จริง — ใช้ userId ของ Admin ทดสอบไปก่อน (userId=1) ถ้ายังไม่ได้ล็อกอิน
const CURRENT_USER_ID = getStoredUser()?.userId ?? 1;

interface ProjectHeaderInfo {
  name: string;
  status: string;
  startDate?: string;
  endDate?: string;
  progress: number;
}

export default function VisitorPresentProjectPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const targetUserId = Number(params?.userId);
  const projectId = Number(params?.projectId);
  const routeType = searchParams.get("type") === "team" ? "team" : "solo";

  const [projectInfo, setProjectInfo] = useState<ProjectHeaderInfo | null>(null);
  const [items, setItems] = useState<WorkItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("right");

  const loadDetail = useCallback(async () => {
    if (!projectId || !targetUserId) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const detail =
        routeType === "team"
          ? await getTeamProjectDetail(projectId, targetUserId, CURRENT_USER_ID)
          : await getSoloProjectDetail(projectId, targetUserId, CURRENT_USER_ID);
      setProjectInfo({
        name: detail.project.name,
        status: detail.project.status,
        startDate: detail.project.startDate,
        endDate: detail.project.endDate,
        progress: detail.project.progress,
      });
      setItems(detail.showcases);
      setActiveIndex((i) => Math.min(i, Math.max(0, detail.showcases.length - 1)));
    } catch (err) {
      console.error(err);
      setLoadError("ไม่สามารถโหลดข้อมูลโปรเจกต์ได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  }, [projectId, targetUserId, routeType]);

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/dashboard/visitor/${targetUserId}`}
          className="group inline-flex items-center gap-2 pl-2 pr-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-bold text-slate-600 hover:text-indigo-600 hover:border-indigo-300 hover:shadow-md transition-all duration-300 w-fit"
        >
          <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center transition-colors duration-300 group-hover:bg-indigo-50">
            <ArrowLeft className="w-3.5 h-3.5" />
          </span>
          กลับไปเลือกโปรเจค
        </Link>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 text-[10px] font-mono font-bold tracking-wider uppercase">
          <Eye className="w-3 h-3" />
          โหมดดูอย่างเดียว (ตรวจสอบผลงาน)
        </span>
      </div>

      <PresentHeader project={projectInfo} itemCount={items.length} canAdd={false} onOpenAddModal={() => {}} />

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
              onEdit={() => {}}
              onDelete={() => {}}
              canEdit={false}
              canDelete={false}
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
