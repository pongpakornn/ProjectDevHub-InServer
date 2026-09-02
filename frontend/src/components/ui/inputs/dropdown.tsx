"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface DropdownOption {
  label: string;
  value: string;
}

export interface DropdownProps {
  label?: string;
  options: DropdownOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = "เลือกรายการ...",
  className = "",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string>(
    value ?? options[0]?.value ?? ""
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync state ภายในเมื่อ value จาก props เปลี่ยนแปลง
  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  const selectedOption = options.find((opt) => opt.value === selectedValue);

  // Close on Click Outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ปิด Dropdown ทันทีถ้าถูกสั่ง disabled ขณะที่เปิดค้างอยู่ (เช่น เปลี่ยน Type แล้ว Name ถูกปิดใช้งานกะทันหัน)
  useEffect(() => {
    if (disabled) setIsOpen(false);
  }, [disabled]);

  const handleSelect = (val: string) => {
    setSelectedValue(val);
    onChange?.(val);
    setIsOpen(false);
  };

  return (
    <div className={`space-y-1.5 relative select-none ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 tracking-wide">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 border rounded-xl text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/15 active:scale-[0.99] ${
          disabled
            ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-70"
            : "cursor-pointer"
        } ${
          !disabled && isOpen
            ? "bg-white border-indigo-500 ring-4 ring-indigo-500/15 shadow-sm"
            : !disabled
            ? "bg-slate-50/80 hover:bg-slate-100/70 border-slate-200 text-slate-800 shadow-2xs"
            : ""
        }`}
      >
        <span className={selectedOption ? "text-slate-900 font-semibold truncate" : "text-slate-400 font-normal"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-2 ${
            isOpen ? "rotate-180 text-indigo-600" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu List */}
      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-1.5 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-xl shadow-xl p-1.5 space-y-0.5 text-xs animate-in fade-in zoom-in-95 duration-150 origin-top">
          <div className="max-h-52 overflow-y-auto space-y-0.5 custom-scrollbar">
            {options.map((opt) => {
              const isSelected = selectedValue === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? "bg-indigo-50/80 text-indigo-600 font-semibold shadow-2xs"
                      : "hover:bg-slate-100/80 text-slate-600 hover:text-slate-900 font-medium"
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};