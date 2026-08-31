"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { WorkItem } from "@/types/project-detail";

interface PresentCarouselProps {
  items: WorkItem[];
  activeIndex: number;
  slideDirection: "left" | "right";
  onGoPrev: () => void;
  onGoNext: () => void;
  onChangeActive: (index: number, dir: "left" | "right") => void;
  onOpenLightbox: (index: number) => void;
}

export function PresentCarousel({
  items,
  activeIndex,
  slideDirection,
  onGoPrev,
  onGoNext,
  onChangeActive,
  onOpenLightbox,
}: PresentCarouselProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Preview</h3>

      {items.length === 0 ? (
        <p className="text-center text-slate-400 text-xs py-16 border border-dashed border-slate-200 rounded-xl">
          ยังไม่มีรายการนำเสนอ — กด "เพิ่มรูป / รายละเอียด" เพื่อเริ่มต้น
        </p>
      ) : (
        <div className="relative flex items-center gap-3">
          <button
            onClick={onGoPrev}
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
                      onClick={() => onOpenLightbox(idx)}
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
                        <p className="text-white/80 text-xs">{item.description}</p>
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
            onClick={onGoNext}
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
              onClick={() => onChangeActive(idx, idx > activeIndex ? "right" : "left")}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === activeIndex ? "w-6 bg-indigo-500" : "w-1.5 bg-slate-200"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}