"use client";

import React, { useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

export interface DatePickerProps {
  onSelectRange?: (start: Date | null, end?: Date | null) => void;
  onCancel?: () => void;
}

const MONTH_NAMES = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];
const MONTH_ABBR = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
];

// 1. Component DatePicker (ปฏิทินแบบ Custom)
export const DatePicker: React.FC<DatePickerProps> = ({ onSelectRange, onCancel }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  // "days" = ตารางวันปกติ, "monthYear" = หน้าเลือกเดือน/ปีโดยตรง (กดที่ Label เดือน-ปีเพื่อเข้าโหมดนี้ —
  // เพิ่มมาเพราะเดิมเลื่อนได้ทีละเดือนอย่างเดียว บันทึกย้อนหลังหลายเดือน/ปีต้องกดปุ่ม < ซ้ำๆ ไม่สะดวก)
  const [viewMode, setViewMode] = useState<"days" | "monthYear">("days");
  const [pickerYear, setPickerYear] = useState(currentDate.getFullYear());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const dayNames = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const openMonthYearPicker = () => {
    setPickerYear(year);
    setViewMode("monthYear");
  };

  const selectMonth = (m: number) => {
    setCurrentDate(new Date(pickerYear, m, 1));
    setViewMode("days");
  };

  if (viewMode === "monthYear") {
    return (
      <div className="p-3 bg-white border border-slate-200/80 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] w-[260px] select-none font-sans">
        {/* 📅 Header เลื่อนปี */}
        <div className="flex justify-between items-center mb-4">
          <button type="button" onClick={() => setPickerYear((y) => y - 1)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-[13px] font-semibold text-slate-700">{pickerYear + 543}</span>
          <button type="button" onClick={() => setPickerYear((y) => y + 1)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 📅 ตารางเลือกเดือน */}
        <div className="grid grid-cols-3 gap-1.5">
          {MONTH_NAMES.map((name, m) => {
            const isSelected = m === month && pickerYear === year;
            return (
              <button
                key={name}
                type="button"
                onClick={() => selectMonth(m)}
                className={`py-2 text-[12px] rounded-lg transition-all font-medium ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {MONTH_ABBR[m]}
              </button>
            );
          })}
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={() => setViewMode("days")}
            className="text-[11px] text-slate-500 hover:text-slate-700 px-2 py-1 rounded-md hover:bg-slate-100 transition-colors"
          >
            กลับไปเลือกวัน
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 bg-white border border-slate-200/80 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] w-[260px] select-none font-sans">
      {/* 📅 Header เลื่อนเดือน — กด Label ตรงกลางเพื่อกระโดดไปเลือกเดือน/ปีโดยตรง */}
      <div className="flex justify-between items-center mb-4">
        <button type="button" onClick={prevMonth} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={openMonthYearPicker}
          className="text-[13px] font-semibold text-slate-700 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          title="เลือกเดือน/ปีโดยตรง"
        >
          {MONTH_NAMES[month]} {year + 543}
        </button>
        <button type="button" onClick={nextMonth} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 📅 วันในสัปดาห์ */}
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-slate-400 mb-2">
        {dayNames.map(d => <div key={d}>{d}</div>)}
      </div>

      {/* 📅 ตารางวันที่ */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {blanks.map(b => <div key={`blank-${b}`} />)}
        {days.map(d => {
          const isToday = new Date().getDate() === d && new Date().getMonth() === month && new Date().getFullYear() === year;
          return (
            <button
              key={d}
              type="button"
              onClick={() => onSelectRange?.(new Date(year, month, d))}
              className={`p-1.5 text-[12px] rounded-lg transition-all ${
                isToday
                  ? "bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-200"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {d}
            </button>
          );
        })}
      </div>

      {/* 📅 Footer Actions */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center">
        <button
          type="button"
          onClick={() => onSelectRange?.(new Date())}
          className="text-[11px] text-indigo-600 font-medium hover:text-indigo-700 px-2 py-1 rounded-md hover:bg-indigo-50 transition-colors"
        >
          เลือกวันนี้
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-[11px] text-slate-500 hover:text-slate-700 px-2 py-1 rounded-md hover:bg-slate-100 transition-colors"
          >
            ปิด
          </button>
        )}
      </div>
    </div>
  );
};

// 2. Component TableDatePickerCell (Format: DD-MM-YYYY)
interface TableDatePickerCellProps {
  value: string; // รองรับรูปแบบ "DD-MM-YYYY" หรือ "YYYY-MM-DD" ก็ได้ (จัดการแสดงผลให้อัตโนมัติ)
  onChange: (val: string) => void;
  placeholder?: string;
}

export const TableDatePickerCell: React.FC<TableDatePickerCellProps> = ({
  value,
  onChange,
  placeholder = "DD-MM-YYYY",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const cellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cellRef.current && !cellRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ฟังก์ชันแปลงรูปแบบค่าที่ส่งเข้ามาให้แสดงผลเป็น DD-MM-YYYY เสมอ
  const formatDisplayValue = (val: string) => {
    if (!val) return "";
    // ถ้าส่งมาเป็น YYYY-MM-DD ให้แปลงเป็น DD-MM-YYYY
    if (val.includes("-") && val.split("-")[0].length === 4) {
      const [y, m, d] = val.split("-");
      return `${d}-${m}-${y}`;
    }
    return val;
  };

  return (
    <div className="relative flex items-center w-full" ref={cellRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between pl-7 pr-2 py-1.5 rounded-lg text-[11px] font-mono transition-all duration-150 cursor-pointer text-left select-none ${
          isOpen
            ? "bg-white border-indigo-500 ring-2 ring-indigo-500/20 text-slate-800 font-medium shadow-sm"
            : "bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-slate-300 text-slate-700"
        }`}
      >
        <span className={value ? "text-slate-700" : "text-slate-400"}>
          {formatDisplayValue(value) || placeholder}
        </span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-indigo-600" : ""}`} />
      </button>

      <Calendar className={`w-3.5 h-3.5 absolute left-2.5 pointer-events-none transition-colors ${
        isOpen ? "text-indigo-600" : "text-slate-400"
      }`} />

      {isOpen && (
        <div className="absolute z-[999] top-full left-0 mt-1.5 animate-in fade-in zoom-in-95 duration-150 origin-top-left">
          <DatePicker
            onSelectRange={(start) => {
              if (start) {
                const day = String(start.getDate()).padStart(2, "0");
                const month = String(start.getMonth() + 1).padStart(2, "0");
                const year = start.getFullYear();
                
                // 🎯 ส่งค่ากลับในรูปแบบ DD-MM-YYYY
                onChange(`${day}-${month}-${year}`);
              }
              setIsOpen(false);
            }}
            onCancel={() => setIsOpen(false)}
          />
        </div>
      )}
    </div>
  );
};