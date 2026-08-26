"use client";

import React from "react";
import { Maximize2 } from "lucide-react";
import EditButton from "@/components/ui/buttons/edit-button";
import DeleteButton from "@/components/ui/buttons/delete-button";
import { PresentItem } from "@/types/present";

interface PresentGridItemProps {
  item: PresentItem;
  index: number;
  onOpenLightbox: (index: number) => void;
  onEdit: (item: PresentItem) => void;
  onDelete: (id: string) => void;
}

export function PresentGridItem({
  item,
  index,
  onOpenLightbox,
  onEdit,
  onDelete,
}: PresentGridItemProps) {
  return (
    <div className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-300 hover:-translate-y-1 transition-all duration-300 ease-out">
      <div className="relative aspect-video bg-slate-100 overflow-hidden">
        <div onClick={() => onOpenLightbox(index)} className="w-full h-full cursor-pointer">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/5 to-transparent" />

          <span className="absolute top-2.5 left-2.5 w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold flex items-center justify-center">
            {index + 1}
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

        <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <EditButton
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onEdit(item);
            }}
          />
          <DeleteButton
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onDelete(item.id);
            }}
          />
        </div>
      </div>
    </div>
  );
}