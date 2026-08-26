"use client";

import React from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { PresentItem } from "@/types/present";

interface PresentLightboxProps {
  isOpen: boolean;
  isVisible: boolean;
  activeItem: PresentItem | null;
  activeIndex: number;
  totalItems: number;
  slideDirection: "left" | "right";
  onClose: () => void;
  onPrev: (e: React.MouseEvent) => void;
  onNext: (e: React.MouseEvent) => void;
}

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
  if (!isOpen || !activeItem) return null;

  return (
    <div
      onClick={onClose}
      className={`fixed inset-0 z-70 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 sm:p-10 transition-opacity duration-300 ease-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 sm:top-8 sm:right-8 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors duration-300"
      >
        <X className="w-5 h-5" />
      </button>

      {activeIndex > 0 && (
        <button
          onClick={onPrev}
          className="absolute left-3 sm:left-8 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors duration-300"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}
      {activeIndex < totalItems - 1 && (
        <button
          onClick={onNext}
          className="absolute right-3 sm:right-8 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors duration-300"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-5xl transition-all duration-300 ease-out ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
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
            {String(activeIndex + 1).padStart(2, "0")} / {String(totalItems).padStart(2, "0")}
          </p>
          <p className="text-white font-extrabold text-lg sm:text-xl mt-1">{activeItem.title}</p>
          <p className="text-white/70 text-sm mt-0.5">{activeItem.subtitle}</p>
        </div>
      </div>
    </div>
  );
}