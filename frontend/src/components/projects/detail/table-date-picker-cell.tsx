"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Calendar } from "lucide-react";
import { DatePicker } from "@/components/ui/inputs/date-picker";

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

  const displayValue = formatDateToDMY(value);

  return (
    <div className="relative flex items-center w-full" ref={cellRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
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

      {isOpen && (
        <div className="absolute z-[999] top-full left-0 mt-1.5 animate-in fade-in zoom-in-95 duration-150 origin-top-left shadow-2xl">
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
      )}
    </div>
  );
};