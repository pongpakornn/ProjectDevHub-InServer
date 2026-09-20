"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ListChecks, Minus, Plus, Scan, X } from "lucide-react";
import { WorkItem } from "@/types/project-detail";
import Portal from "@/components/ui/portal";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";

interface PresentLightboxProps {
  isOpen: boolean;
  isVisible: boolean;
  activeItem: WorkItem | null;
  activeIndex: number;
  totalItems: number;
  slideDirection: "left" | "right";
  onClose: () => void;
  onPrev: (e: React.MouseEvent) => void;
  onNext: (e: React.MouseEvent) => void;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 5;
const clamp = (v: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v));

export function PresentLightbox({
  isOpen,
  isVisible,
  activeItem,
  activeIndex,
  totalItems,
  slideDirection,
  onClose,
  onPrev,
  onNext,
}: PresentLightboxProps) {
  useBodyScrollLock(isOpen && !!activeItem);

  const viewportRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number } | null>(null);
  const view = useRef({ zoom: 1, offset: { x: 0, y: 0 } });
  view.current = { zoom, offset };

  // รีเซ็ตซูม/ตำแหน่งทุกครั้งที่เปลี่ยนรูป (เลื่อนซ้าย/ขวา หรือเปิดใหม่)
  useEffect(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, [activeIndex, activeItem?.id]);

  const zoomAt = useCallback((factor: number, px: number, py: number) => {
    const { zoom: z, offset: o } = view.current;
    const next = clamp(z * factor);
    const k = next / z;
    setZoom(next);
    setOffset(next === 1 ? { x: 0, y: 0 } : { x: px - (px - o.x) * k, y: py - (py - o.y) * k });
  }, []);

  const zoomCenter = useCallback(
    (factor: number) => {
      const rect = viewportRef.current?.getBoundingClientRect();
      zoomAt(factor, (rect?.width ?? 0) / 2, (rect?.height ?? 0) / 2);
    },
    [zoomAt],
  );

  const resetZoom = useCallback(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  const wheelRef = useRef<(e: WheelEvent) => void>(() => {});
  wheelRef.current = (e: WheelEvent) => {
    const vp = viewportRef.current;
    if (!vp) return;
    const rect = vp.getBoundingClientRect();
    const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
    zoomAt(Math.exp(-dy * 0.0018), e.clientX - rect.left, e.clientY - rect.top);
  };

  useEffect(() => {
    const el = viewportRef.current;
    if (!el || !isOpen) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      wheelRef.current(e);
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [isOpen]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (view.current.zoom <= 1) return;
    drag.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    drag.current = { x: e.clientX, y: e.clientY };
    setOffset((o) => ({ x: o.x + dx, y: o.y + dy }));
  }, []);

  const stopDrag = useCallback(() => {
    drag.current = null;
  }, []);

  if (!isOpen || !activeItem) return null;

  // รายละเอียดระบบแบบเป็นข้อ — เก็บใน flowDescription คั่นด้วยขึ้นบรรทัดใหม่ (ไม่มีคอลัมน์แยกในฐานข้อมูล)
  const details = (activeItem.flowDescription || "")
    .split("\n")
    .map((d) => d.trim())
    .filter(Boolean);

  return (
    <Portal>
    <div
      onClick={onClose}
      className={`fixed inset-0 z-70 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-2 sm:p-6 transition-opacity duration-300 ease-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors duration-300 z-20"
      >
        <X className="w-5 h-5" />
      </button>

      {activeIndex > 0 && (
        <button
          onClick={onPrev}
          className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors duration-300 z-20"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}
      {activeIndex < totalItems - 1 && (
        <button
          onClick={onNext}
          className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors duration-300 z-20"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full h-full max-w-[96vw] max-h-[94vh] grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-3 transition-all duration-300 ease-out ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        } ${slideDirection === "right" ? "animate-slideInRight" : "animate-slideInLeft"}`}
      >
        {/* กรอบรูปภาพ — ขยายใหญ่ขึ้น พร้อมซูม/แพนด้วยล้อเมาส์และลาก */}
        <div className="relative bg-slate-900 border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
          <div
            ref={viewportRef}
            className={`w-full h-full flex items-center justify-center touch-none select-none ${
              zoom > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"
            }`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={stopDrag}
            onPointerLeave={stopDrag}
            onDoubleClick={resetZoom}
          >
            <img
              key={activeIndex}
              src={activeItem.imageUrl}
              alt={activeItem.title}
              draggable={false}
              style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${zoom})` }}
              className="max-w-full max-h-full object-contain transition-transform duration-100 ease-out will-change-transform [image-rendering:high-quality]"
            />
          </div>

          {/* แถบควบคุมซูม */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/50 backdrop-blur-md rounded-full px-1.5 py-1 border border-white/10">
            <button type="button" onClick={() => zoomCenter(1 / 1.4)} title="ซูมออก" className="p-1.5 rounded-full text-white/80 hover:bg-white/15">
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-11 text-center text-[11px] font-mono text-white/70">{Math.round(zoom * 100)}%</span>
            <button type="button" onClick={() => zoomCenter(1.4)} title="ซูมเข้า" className="p-1.5 rounded-full text-white/80 hover:bg-white/15">
              <Plus className="w-4 h-4" />
            </button>
            <button type="button" onClick={resetZoom} title="รีเซ็ตซูม" className="p-1.5 rounded-full text-white/80 hover:bg-white/15">
              <Scan className="w-4 h-4" />
            </button>
          </div>

          <p className="absolute top-3 left-3 text-indigo-300 text-[11px] font-mono font-bold tracking-wider bg-black/40 backdrop-blur-sm px-2 py-1 rounded-md">
            {String(activeIndex + 1).padStart(2, "0")} / {String(totalItems).padStart(2, "0")}
          </p>
        </div>

        {/* รายละเอียดระบบ */}
        <div className="bg-white rounded-2xl shadow-2xl shadow-black/50 p-5 sm:p-6 flex flex-col overflow-y-auto">
          <h2 className="text-slate-900 font-extrabold text-lg sm:text-xl">{activeItem.title}</h2>
          {activeItem.description && (
            <p className="text-slate-500 text-xs mt-1">{activeItem.description}</p>
          )}

          <div className="mt-4 pt-4 border-t border-slate-100 flex-1">
            <p className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              <ListChecks className="w-3.5 h-3.5" />
              รายละเอียดระบบ
            </p>
            {details.length === 0 ? (
              <p className="text-xs text-slate-400">ยังไม่มีรายละเอียดเพิ่มเติม</p>
            ) : (
              <ol className="space-y-2">
                {details.map((d, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 text-[10px] font-bold flex items-center justify-center mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{d}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </div>
    </Portal>
  );
}
