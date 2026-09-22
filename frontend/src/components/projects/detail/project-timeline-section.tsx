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
const RANGE_PADDING_DAYS = 2; // เผื่อหัว-ท้ายก่อน/หลังวันที่จริงของ Phase แรก/สุดท้าย 2 วัน กันดูสั้น/แน่นเกินไป

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

// ความกว้างขั้นต่ำต่อวัน (px) ที่ป้อนให้ minmax(...) — ช่วงสั้นๆ Grid จะยืดคอลัมน์ให้เต็มการ์ดเอง (ไม่ต้องคำนวณ
// Manual) ส่วนช่วงยาวมากๆ ก็ยังคุมไม่ให้แคบจนอ่านไม่ออก โดยแลกกับการ Scroll แนวนอนแทน
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

  // ช่วงวันที่ของตาราง = วันที่จริงของ Phase แรกสุด/สุดท้าย ± 2 วัน เท่านั้น (ไม่ปัดเต็มเดือนเหมือนก่อนหน้านี้
  // เพราะไม่จำเป็นต้องโชว์ทุกวันของเดือนถ้าไม่เกี่ยวข้อง) — ถ้ายังไม่มี Phase ไหนระบุวันที่เลย ใช้วันนี้ ± 15 วัน
  const { rangeStart, days, totalDays, monthGroups } = useMemo(() => {
    let minDate: Date | null = null;
    let maxDate: Date | null = null;

    for (const { start, end } of parsedPhases) {
      const effectiveEnd = end ?? start;
      if (start && (!minDate || start < minDate)) minDate = start;
      if (effectiveEnd && (!maxDate || effectiveEnd > maxDate)) maxDate = effectiveEnd;
    }

    const today = new Date();
    const rawStart = minDate ?? addDays(today, -15);
    const rawEnd = maxDate ?? addDays(today, 15);

    const gridStart = addDays(rawStart, -RANGE_PADDING_DAYS);
    const gridEndExclusive = addDays(rawEnd, RANGE_PADDING_DAYS + 1); // +1 เพราะ End Date เป็นวันที่นับรวม

    const dayCount = Math.max(1, daysBetween(gridStart, gridEndExclusive));
    const dayList = Array.from({ length: dayCount }, (_, i) => addDays(gridStart, i));

    // จัดกลุ่มวันติดกันที่อยู่เดือน/ปีเดียวกัน เป็นแถบหัวตารางเดือน (Merge Cell) — ช่วงที่ริมตารางอาจเป็นแค่
    // บางส่วนของเดือนนั้น (ไม่ใช่เต็มเดือน) ตามการตัด ± 2 วันด้านบน ซึ่งตรงตามที่ต้องการ
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
  const gridTemplateColumns = `${SIDEBAR_NO_WIDTH}px ${SIDEBAR_NAME_WIDTH}px repeat(${totalDays}, minmax(${dayWidth}px, 1fr))`;
  const today = new Date();
  const todayOffsetDays = daysBetween(rangeStart, today);
  const showTodayLine = todayOffsetDays >= 0 && todayOffsetDays < totalDays;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-0">
      <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-extrabold text-slate-900 text-base tracking-tight">Project Timeline</h3>
      </div>

      <div className="p-3 overflow-x-auto">
        {/* Header แถวที่ 1: แถบเดือน/ปี (Merge ตามจำนวนวันจริงของเดือนนั้นในช่วงที่แสดง) */}
        <div className="grid rounded-t-xl overflow-hidden" style={{ gridTemplateColumns }}>
          <div className="sticky left-0 z-20 bg-[#0f172a] flex items-center justify-center py-2.5 text-xs font-extrabold text-white border-r border-white/10">
            #
          </div>
          <div
            className="sticky z-20 bg-[#0f172a] flex items-center pl-3 py-2.5 text-xs font-extrabold text-white border-r border-white/10"
            style={{ left: SIDEBAR_NO_WIDTH }}
          >
            Activity
          </div>
          {monthGroups.map((g) => (
            <div
              key={g.key}
              className="flex flex-col items-center justify-center py-2 leading-tight text-xs font-extrabold text-white bg-[#0f172a] border-r border-white/10"
              style={{ gridColumn: `span ${g.dayCount}` }}
            >
              <span>{g.label}</span>
              <span className="text-[9px] font-normal text-slate-400">{g.year}</span>
            </div>
          ))}
        </div>

        {/* Header แถวที่ 2: เลขวันที่รายวัน */}
        <div className="grid bg-slate-50 border-b border-slate-200" style={{ gridTemplateColumns }}>
          <div className="sticky left-0 z-20 bg-slate-50 border-r border-slate-200" />
          <div className="sticky z-20 bg-slate-50 border-r border-slate-200" style={{ left: SIDEBAR_NO_WIDTH }} />
          {days.map((d, i) => (
            <div
              key={i}
              className={`flex items-center justify-center py-1 text-[10px] font-bold text-slate-500 border-r border-slate-100 ${
                sameDay(d, today) ? "bg-rose-50 text-rose-600" : ""
              }`}
            >
              {d.getDate()}
            </div>
          ))}
        </div>

        {/* แถว Phase — # / ชื่อ Sticky ไว้ทางซ้าย ส่วนหลอดวางบน Grid วันเดียวกับหัวตาราง จึงตรงกันเป๊ะเสมอ */}
        <div className="divide-y divide-slate-100 bg-white border-x border-b border-slate-100 rounded-b-xl">
          {parsedPhases.map(({ phase, start, end }, idx) => {
            const effectiveEnd = end ?? start;
            const hasDates = !!start;

            const startOffsetDays = hasDates && start ? Math.max(0, daysBetween(rangeStart, start)) : 0;
            const durationDays = hasDates && start
              ? Math.max(1, daysBetween(start, effectiveEnd ?? start) + 1)
              : 0;

            const tooltipText = hasDates
              ? `${phase.startDate}${phase.endDate && phase.endDate !== phase.startDate ? ` → ${phase.endDate}` : ""}`
              : "";
            const durationPct = hasDates ? (durationDays / totalDays) * 100 : 0;
            // แถบแคบเกินไปจนใส่ตัวอักษรวันที่ไม่พอ — ซ่อนป้ายในแถบไปเลยแทนที่จะถูกตัดครึ่งดูเหมือน "2..." แล้ว
            // ใช้ Tooltip ตอน Hover (ด้านล่าง) แทน ซึ่งมีให้ดูวันที่เต็มเสมอไม่ว่าแถบจะกว้างแค่ไหนอยู่แล้ว
            const canShowBothDates = durationPct >= 25;
            const canShowOneDate = durationPct >= 10;

            return (
              <div key={phase.id} className="grid items-center py-3 hover:bg-slate-50/70 transition-colors" style={{ gridTemplateColumns }}>
                <div className="sticky left-0 z-10 bg-white text-center font-extrabold text-slate-900 text-xs">
                  {String(idx + 1).padStart(2, "0")}
                </div>

                <div
                  className="sticky z-10 bg-white pl-3 pr-2 font-bold text-slate-900 text-sm truncate"
                  style={{ left: SIDEBAR_NO_WIDTH }}
                  title={phase.name}
                >
                  {phase.name}
                </div>

                <div className="relative h-7" style={{ gridColumn: `span ${totalDays}` }}>
                  <div className="absolute inset-0 bg-slate-100/60 rounded-full border border-slate-200/50" />
                  {showTodayLine && (
                    <div
                      className="absolute top-0 bottom-0 w-px bg-rose-400/70"
                      style={{ left: `${(todayOffsetDays / totalDays) * 100}%` }}
                    />
                  )}
                  {hasDates && (
                    // Wrapper ไม่ตั้ง overflow-hidden เอง (ต่างจาก Pill ข้างในที่ต้องตัดข้อความ) เพื่อไม่ให้
                    // บัง Tooltip ที่โผล่พ้นขอบแถบขึ้นไปด้านบนตอน Hover
                    <div
                      className="group/bar absolute top-1 h-5"
                      style={{
                        left: `${(startOffsetDays / totalDays) * 100}%`,
                        width: `${durationPct}%`,
                      }}
                    >
                      <div className="absolute inset-0 bg-indigo-600 rounded-full flex items-center justify-between px-2 shadow-xs overflow-hidden">
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

                      {/* Tooltip แสดงวันที่เริ่มต้น-จบตอน Hover เสมอ ไม่ว่าแถบจะกว้างพอให้เห็น Label ในตัวหรือไม่ */}
                      <div className="pointer-events-none absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity duration-150 whitespace-nowrap bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-lg z-30">
                        {tooltipText}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                      </div>
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
  );
};
