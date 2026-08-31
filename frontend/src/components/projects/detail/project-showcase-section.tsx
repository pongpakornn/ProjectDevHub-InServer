"use client";

import React, { useState } from "react";
import { Eye, Plus } from "lucide-react";
import { Button } from "@/components/ui/buttons/button";
import { Phase, WorkItem } from "@/types/project-detail";
import { deleteWorkItem } from "@/lib/project-solo-api";
import WorkItemFlipCard from "@/components/projects/detail/work-item-flip-card";
import WorkItemPreviewModal from "@/components/projects/detail/work-item-preview-modal";

interface ProjectShowcaseSectionProps {
  works: WorkItem[];
  setWorks: React.Dispatch<React.SetStateAction<WorkItem[]>>;
  phases: Phase[];
  onOpenAddModal: () => void;
  onOpenEditModal: (work: WorkItem) => void;
}

export const ProjectShowcaseSection: React.FC<ProjectShowcaseSectionProps> = ({
  works,
  setWorks,
  phases,
  onOpenAddModal,
  onOpenEditModal,
}) => {
  const [flippedCards, setFlippedCards] = useState<{ [id: string]: boolean }>({});
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const toggleCardFlip = (id: string) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenPreview = (index: number) => {
    setPreviewIndex(index);
    setIsPreviewOpen(true);
  };

  const handleDeleteWork = async (id: string) => {
    const prevWorks = works;
    setWorks(works.filter((w) => w.id !== id));
    try {
      await deleteWorkItem(Number(id));
    } catch (err) {
      console.error("ลบผลงานไม่สำเร็จ", err);
      alert("ลบผลงานไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      setWorks(prevWorks);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-800 text-sm">Present ผลงาน / หน้าจอระบบ</h3>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleOpenPreview(0)}
            className="w-auto! bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs hover:shadow-sm normal-case text-xs font-bold py-1.5 px-3 flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            พรีวิว
          </Button>
          <Button
            onClick={onOpenAddModal}
            className="w-auto! bg-indigo-600 hover:bg-indigo-700 shadow-[0_4px_12px_rgba(79,70,229,0.25)] hover:shadow-[0_6px_16px_rgba(79,70,229,0.4)] normal-case text-xs font-bold py-1.5 px-3 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            เพิ่มผลงาน
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {works.map((work, index) => (
          <WorkItemFlipCard
            key={work.id}
            work={work}
            phases={phases}
            isFlipped={!!flippedCards[work.id]}
            onToggleFlip={() => toggleCardFlip(work.id)}
            onView={() => handleOpenPreview(index)}
            onEdit={() => onOpenEditModal(work)}
            onDelete={() => handleDeleteWork(work.id)}
          />
        ))}
      </div>

      {isPreviewOpen && (
        <WorkItemPreviewModal
          works={works}
          activeIndex={previewIndex}
          onClose={() => setIsPreviewOpen(false)}
          onNavigate={setPreviewIndex}
        />
      )}
    </div>
  );
};
