"use client";

import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { ChevronDown, Calendar } from "lucide-react";
import { DatePicker } from "@/components/ui/inputs/date-picker";
import Portal from "@/components/ui/portal";

export interface TableDatePickerCellProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

const formatDateToDMY = (dateStr: string) => {
  if (!dateStr) return "";
  const cleanVal = dateStr.split("T")[0].trim();
  const isoMatch = cleanVal.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return `${d.padStart(2, "0")}-${m.padStart(2, "0")}-${y}`;
  }
  return cleanVal;
};

// ขนาดโดยประมาณของปฏิทิน (w-[260px] + Header/Footer) — ใช้คำนวณว่าเปิดแล้วจะล้นขอบจอไหม
const POPUP_WIDTH = 276;
const POPUP_HEIGHT = 360;

export const TableDatePickerCell: React.FC<TableDatePickerCellProps> = ({
  value,
  onChange,
  placeholder = "DD-MM-YYYY",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number; openUpward: boolean } | null>(null);
  const cellRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // คำนวณตำแหน่ง Popup แบบ Fixed เทียบกับ Viewport ตรงๆ (ไม่ผูกกับ Container ที่ Scroll ได้)
  // กันปัญหาเดิม: เปิดปฏิทินในตารางที่มี overflow-x-auto แล้วโดนตัดด้านล่าง ต้อง Scroll ถึงจะเห็น
  const calculatePosition = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;

    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < POPUP_HEIGHT && rect.top > spaceBelow;

    let left = rect.left;
    if (left + POPUP_WIDTH > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - POPUP_WIDTH - 8);
    }

    const top = openUpward ? rect.top - 6 : rect.bottom + 6;
    setPosition({ top, left, openUpward });
  };

  useLayoutEffect(() => {
    if (isOpen) calculatePosition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (cellRef.current?.contains(target)) return;
      // Popup render อยู่ใน Portal (นอก cellRef) จึงเช็คแยกด้วย data-attribute
      if ((target as HTMLElement).closest?.('[data-table-date-picker-popup="true"]')) return;
      setIsOpen(false);
    };
    // ปิด Popup เมื่อ Scroll/Resize แทนการไล่คำนวณตำแหน่งใหม่ตลอด — ผู้ใช้เปิดใหม่ได้ทันทีถ้ายังต้องการ
    const handleScrollOrResize = () => setIsOpen(false);

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen]);

  const displayValue = formatDateToDMY(value);

  return (
    <div className="relative flex items-center w-full" ref={cellRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className={`w-full flex items-center justify-between pl-7 pr-2 py-1.5 rounded-lg text-[12px] font-bold transition-all duration-150 cursor-pointer text-left select-none ${
          isOpen
            ? "bg-white border-indigo-500 ring-2 ring-indigo-500/20 text-slate-800 font-medium shadow-xs"
            : "bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-slate-300 text-slate-700"
        }`}
      >
        <span className={displayValue ? "text-slate-700" : "text-slate-400"}>
          {displayValue || placeholder}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-indigo-600" : ""
          }`}
        />
      </button>

      <Calendar
        className={`w-3.5 h-3.5 absolute left-2 pointer-events-none transition-colors ${
          isOpen ? "text-indigo-600" : "text-slate-400"
        }`}
      />

      {isOpen && position && (
        <Portal>
          <div
            data-table-date-picker-popup="true"
            style={{
              position: "fixed",
              top: position.openUpward ? undefined : position.top,
              bottom: position.openUpward ? window.innerHeight - position.top : undefined,
              left: position.left,
              zIndex: 999,
            }}
            className={`animate-in fade-in zoom-in-95 duration-150 shadow-2xl ${
              position.openUpward ? "origin-bottom-left" : "origin-top-left"
            }`}
          >
            <DatePicker
              onSelectRange={(start) => {
                if (start) {
                  const day = String(start.getDate()).padStart(2, "0");
                  const month = String(start.getMonth() + 1).padStart(2, "0");
                  const year = start.getFullYear();
                  onChange(`${day}-${month}-${year}`);
                }
                setIsOpen(false);
              }}
              onCancel={() => setIsOpen(false)}
            />
          </div>
        </Portal>
      )}
    </div>
  );
};
