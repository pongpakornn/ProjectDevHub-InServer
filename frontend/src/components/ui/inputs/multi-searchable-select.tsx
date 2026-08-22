"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, X, UserPlus } from "lucide-react";

interface Option {
  label: string;
  value: string;
}

interface MultiSearchableSelectProps {
  label?: string;
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  /** อนุญาตให้พิมพ์ชื่อที่ไม่มีในลิสต์แล้วเพิ่มเป็นสมาชิกใหม่ได้ (default: true) */
  allowCustom?: boolean;
}

/**
 * MultiSearchableSelect
 * Dropdown ค้นหาแบบเลือกได้หลายรายการ (ใช้สำหรับ "เพิ่มสมาชิกทีม")
 * - พิมพ์ค้นหาชื่อจากลิสต์ options
 * - คลิกเพื่อเพิ่มเข้า value (array) แสดงเป็น tag/chip ด้านบน input
 * - กด X ที่ chip หรือกด Backspace ตอน input ว่างเพื่อลบสมาชิกคนล่าสุด
 * - ถ้าไม่มีชื่อนี้ใน options และ allowCustom = true จะมีปุ่ม "เพิ่มเป็นสมาชิกใหม่"
 */
export default function MultiSearchableSelect({
  label,
  options,
  value,
  onChange,
  placeholder = "ค้นหาและเลือกสมาชิก...",
  allowCustom = true,
}: MultiSearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !value.some((v) => v.toLowerCase() === opt.label.toLowerCase())
  );

  const trimmedSearch = searchTerm.trim();
  const existsInOptions = options.some(
    (opt) => opt.label.toLowerCase() === trimmedSearch.toLowerCase()
  );
  const alreadySelected = value.some(
    (v) => v.toLowerCase() === trimmedSearch.toLowerCase()
  );
  const canAddCustom = allowCustom && trimmedSearch.length > 0 && !existsInOptions && !alreadySelected;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAdd = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (value.some((v) => v.toLowerCase() === trimmed.toLowerCase())) return;
    onChange([...value, trimmed]);
    setSearchTerm("");
    inputRef.current?.focus();
  };

  const handleRemove = (name: string) => {
    onChange(value.filter((v) => v !== name));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filteredOptions.length > 0) {
        handleAdd(filteredOptions[0].label);
      } else if (canAddCustom) {
        handleAdd(trimmedSearch);
      }
    } else if (e.key === "Backspace" && searchTerm === "" && value.length > 0) {
      handleRemove(value[value.length - 1]);
    }
  };

  return (
    <div className="space-y-1 relative" ref={containerRef}>
      {label && <label className="block text-xs font-bold text-slate-700">{label}</label>}

      {/* Trigger / Chips Container */}
      <div
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
        className={`w-full flex flex-wrap items-center gap-1.5 px-2.5 py-2 bg-slate-50 border rounded-lg text-xs cursor-text transition-all ${
          isOpen ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-white" : "border-slate-200"
        }`}
      >
        {value.map((name) => (
          <span
            key={name}
            className="inline-flex items-center gap-1 pl-2 pr-1 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[11px]"
          >
            {name}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(name);
              }}
              className="p-0.5 rounded-full hover:bg-emerald-200/70 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : "เพิ่มสมาชิก..."}
          className="flex-1 min-w-[100px] bg-transparent outline-none text-xs font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-medium py-0.5"
        />

        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl p-2 space-y-1 text-xs">
          <div className="max-h-44 overflow-y-auto space-y-0.5">
            {filteredOptions.length > 0
              ? filteredOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleAdd(opt.label)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left hover:bg-slate-100 text-slate-700 font-semibold transition-colors"
                  >
                    <span>{opt.label}</span>
                    <Check className="w-3.5 h-3.5 text-slate-300" />
                  </button>
                ))
              : !canAddCustom && (
                  <div className="px-3 py-2 text-slate-400 text-center font-medium">
                    {trimmedSearch ? "ไม่พบชื่อนี้" : "พิมพ์ชื่อเพื่อค้นหา"}
                  </div>
                )}

            {canAddCustom && (
              <button
                type="button"
                onClick={() => handleAdd(trimmedSearch)}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left bg-emerald-50/60 hover:bg-emerald-50 text-emerald-700 font-bold transition-colors border border-dashed border-emerald-300"
              >
                <UserPlus className="w-3.5 h-3.5 shrink-0" />
                เพิ่ม “{trimmedSearch}” เป็นสมาชิกใหม่
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}