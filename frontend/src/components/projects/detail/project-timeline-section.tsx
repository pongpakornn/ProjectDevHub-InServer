"use client";

import React, { useMemo } from "react";
import { Phase } from "@/types/project-detail";

interface ProjectTimelineSectionProps {
  phases: Phase[];
}

const MONTH_ABBR = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
];

const SIDEBAR_NO_WIDTH = 48;
const SIDEBAR_NAME_WIDTH = 220;

// รองรับทั้ง "DD-MM-YYYY" (ค่าที่ TableDatePickerCell ส่งออกมาจริง) และ "YYYY-MM-DD" (เผื่อข้อมูลเก่า/ISO)
function parsePhaseDate(value?: string | null): Date | null {
  if (!value) return null;
  const cleaned = value.split("T")[0].trim();

  const dmy = cleaned.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (dmy) {
    const [, d, m, y] = dmy;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }

  const ymd = cleaned.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (ymd) {
    const [, y, m, d] = ymd;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }

  return null;
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d: Date, count: number) {
  return new Date(d.getFullYear(), d.getMonth() + count, 1);
}

function addDays(d: Date, count: number) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + count);
}

function daysBetween(a: Date, b: Date) {
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  return Math.round((b.getTime() - a.getTime()) / MS_PER_DAY);
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// ความกว้างต่อวัน (px) — โปรเจกต์สั้นได้ช่องใหญ่อ่านง่าย ส่วนโปรเจกต์ยาวหลายเดือนก็ยังพอเลื่อนดูได้โดยไม่กว้างเกินจริง
function dayWidthFor(totalDays: number) {
  if (totalDays <= 45) return 34;
  if (totalDays <= 120) return 20;
  if (totalDays <= 300) return 12;
  return 6;
}

export const ProjectTimelineSection: React.FC<ProjectTimelineSectionProps> = ({ phases }) => {
  const parsedPhases = useMemo(
    () =>
      phases.map((phase) => ({
        phase,
        start: parsePhaseDate(phase.startDate),
        end: parsePhaseDate(phase.endDate),
      })),
    [phases]
  );

  // ช่วงวันที่ทั้งหมดของตาราง อ้างอิงจาก Phase ที่มีวันที่จริงทั้งหมด (Start เร็วสุด -> End/Start ช้าสุด) แบบ
  // รายวันตรงๆ ไม่ปัดหยาบเป็นเดือนเหมือนเดิม (ของเก่าพอ Phase จริงกินเวลาแค่ไม่กี่วัน หัวตารางเดือนที่กว้างกว่ามาก
  // ทำให้หลอดเหลือเป็นจุดเล็กๆ มองไม่เห็นวันที่) — ปัดขอบเขตให้เต็มเดือนแรก/เดือนสุดท้ายเพื่อให้แถบเดือนหัวตาราง
  // ดูสมบูรณ์ ไม่ขาดครึ่งเดือนที่ริมตาราง ถ้ายังไม่มี Phase ไหนระบุวันที่เลย ใช้เดือนปัจจุบัน ± 1 เดือนไปพลางก่อน
  const { rangeStart, days, totalDays, monthGroups } = useMemo(() => {
    let minDate: Date | null = null;
    let maxDate: Date | null = null;

    for (const { start, end } of parsedPhases) {
      const effectiveEnd = end ?? start;
      if (start && (!minDate || start < minDate)) minDate = start;
      if (effectiveEnd && (!maxDate || effectiveEnd > maxDate)) maxDate = effectiveEnd;
    }

    const today = new Date();
    const fallbackStart = startOfMonth(today);
    const fallbackEnd = addMonths(fallbackStart, 1);

    const gridStart = startOfMonth(minDate ?? fallbackStart);
    const gridEndExclusive = addMonths(startOfMonth(maxDate ?? fallbackEnd), 1);

    const dayCount = Math.max(1, daysBetween(gridStart, gridEndExclusive));
    const dayList = Array.from({ length: dayCount }, (_, i) => addDays(gridStart, i));

    // จัดกลุ่มวันติดกันที่อยู่เดือน/ปีเดียวกัน เป็นแถบหัวตารางเดือน (Merge Cell) ความกว้าง = จำนวนวันในกลุ่มนั้น
    const groups: { key: string; label: string; year: number; dayCount: number }[] = [];
    for (const d of dayList) {
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const last = groups[groups.length - 1];
      if (last && last.key === key) {
        last.dayCount += 1;
      } else {
        groups.push({ key, label: MONTH_ABBR[d.getMonth()], year: d.getFullYear() + 543, dayCount: 1 });
      }
    }

    return { rangeStart: gridStart, days: dayList, totalDays: dayCount, monthGroups: groups };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phases]);

  const dayWidth = dayWidthFor(totalDays);
  const trackWidth = totalDays * dayWidth;
  const today = new Date();
  const todayOffsetDays = daysBetween(rangeStart, today);
  const showTodayLine = todayOffsetDays >= 0 && todayOffsetDays < totalDays;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-0">
      <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-extrabold text-slate-900 text-base tracking-tight">Project Timeline</h3>
      </div>

      <div className="p-3 overflow-x-auto">
        <div style={{ width: SIDEBAR_NO_WIDTH + SIDEBAR_NAME_WIDTH + trackWidth }}>
          {/* Header แถวที่ 1: แถบเดือน/ปี (Merge ตามจำนวนวันจริงของเดือนนั้นในช่วงที่แสดง) */}
          <div className="flex bg-[#0f172a] text-xs font-extrabold text-white rounded-t-xl shadow-xs overflow-hidden">
            <div
              className="sticky left-0 z-20 bg-[#0f172a] shrink-0 flex items-center justify-center py-2.5 border-r border-white/10"
              style={{ width: SIDEBAR_NO_WIDTH }}
            >
              #
            </div>
            <div
              className="sticky z-20 bg-[#0f172a] shrink-0 flex items-center pl-3 py-2.5 border-r border-white/10"
              style={{ left: SIDEBAR_NO_WIDTH, width: SIDEBAR_NAME_WIDTH }}
            >
              Activity
            </div>
            {monthGroups.map((g) => (
              <div
                key={g.key}
                className="shrink-0 flex flex-col items-center justify-center py-2 leading-tight border-r border-white/10"
                style={{ width: g.dayCount * dayWidth }}
              >
                <span>{g.label}</span>
                <span className="text-[9px] font-normal text-slate-400">{g.year}</span>
              </div>
            ))}
          </div>

          {/* Header แถวที่ 2: เลขวันที่รายวัน */}
          <div className="flex bg-slate-50 text-[10px] font-bold text-slate-500 border-b border-slate-200">
            <div
              className="sticky left-0 z-20 bg-slate-50 shrink-0 border-r border-slate-200"
              style={{ width: SIDEBAR_NO_WIDTH }}
            />
            <div
              className="sticky z-20 bg-slate-50 shrink-0 border-r border-slate-200"
              style={{ left: SIDEBAR_NO_WIDTH, width: SIDEBAR_NAME_WIDTH }}
            />
            {days.map((d, i) => (
              <div
                key={i}
                className={`shrink-0 flex items-center justify-center py-1 border-r border-slate-100 ${
                  sameDay(d, today) ? "bg-rose-50 text-rose-600" : ""
                }`}
                style={{ width: dayWidth }}
              >
                {dayWidth >= 12 ? d.getDate() : ""}
              </div>
            ))}
          </div>

          {/* แถว Phase — # / ชื่อ Sticky ไว้ทางซ้าย ส่วนหลอดเลื่อนตามแกนเวลา */}
          <div className="divide-y divide-slate-100 text-xs bg-white border-x border-b border-slate-100 rounded-b-xl">
            {parsedPhases.map(({ phase, start, end }, idx) => {
              const effectiveEnd = end ?? start;
              const hasDates = !!start;

              let leftPx = 0;
              let widthPx = 0;
              if (hasDates && start) {
                const startOffsetDays = Math.max(0, daysBetween(rangeStart, start));
                const endOffsetDays = Math.max(startOffsetDays + 1, daysBetween(rangeStart, effectiveEnd ?? start) + 1);
                leftPx = startOffsetDays * dayWidth;
                widthPx = (endOffsetDays - startOffsetDays) * dayWidth;
              }

              // แถบแคบเกินไปจนใส่ตัวอักษรวันที่ไม่พอ — ซ่อนป้ายวันที่ในแถบไปเลยแทนที่จะปล่อยให้ถูกตัดครึ่ง
              // ดูเหมือน "2..." ตามที่เจอ, ใช้ title Hover ดูวันที่เต็มแทน
              const canShowBothDates = widthPx >= 190;
              const canShowOneDate = widthPx >= 90;

              return (
                <div key={phase.id} className="flex items-center py-3 hover:bg-slate-50/70 transition-colors">
                  <div
                    className="sticky left-0 z-10 bg-white group-hover:bg-inherit shrink-0 text-center font-extrabold text-slate-900 text-xs"
                    style={{ width: SIDEBAR_NO_WIDTH }}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </div>

                  <div
                    className="sticky z-10 bg-white shrink-0 pl-3 pr-2 font-bold text-slate-900 text-sm truncate"
                    style={{ left: SIDEBAR_NO_WIDTH, width: SIDEBAR_NAME_WIDTH }}
                    title={phase.name}
                  >
                    {phase.name}
                  </div>

                  <div className="relative shrink-0 h-7" style={{ width: trackWidth }}>
                    <div className="absolute inset-0 bg-slate-100/60 rounded-full border border-slate-200/50" />
                    {showTodayLine && (
                      <div
                        className="absolute top-0 bottom-0 w-px bg-rose-400/70"
                        style={{ left: todayOffsetDays * dayWidth }}
                      />
                    )}
                    {hasDates && (
                      <div
                        title={`${phase.startDate}${phase.endDate && phase.endDate !== phase.startDate ? ` → ${phase.endDate}` : ""}`}
                        className="absolute top-1 h-5 bg-indigo-600 rounded-full flex items-center justify-between px-2 shadow-xs transition-all overflow-hidden"
                        style={{ left: leftPx, width: Math.max(widthPx, 6) }}
                      >
                        {canShowOneDate && (
                          <span className="font-mono text-[10px] font-bold text-white tracking-tighter truncate">
                            {phase.startDate}
                          </span>
                        )}
                        {canShowBothDates && phase.endDate && phase.endDate !== phase.startDate && (
                          <span className="font-mono text-[10px] font-bold text-white tracking-tighter truncate">
                            {phase.endDate}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {parsedPhases.length === 0 && (
              <div className="py-6 text-center text-slate-400 text-xs">ยังไม่มี Phase ในโปรเจกต์นี้</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
