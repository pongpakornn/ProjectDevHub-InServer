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

function daysBetween(a: Date, b: Date) {
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  return Math.round((b.getTime() - a.getTime()) / MS_PER_DAY);
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

  const datedPhases = parsedPhases.filter((p) => p.start);

  // ช่วงเดือนของตารางคำนวณจาก Phase ที่มีวันที่จริงทั้งหมด (Start เร็วสุด -> End/Start ช้าสุด) ไม่ใช่ค่า Fix
  // ไว้ตายตัวเหมือนเดิม — ถ้ายังไม่มี Phase ไหนระบุวันที่เลย ใช้เดือนปัจจุบัน ± 3 เดือนไปพลางก่อน
  const { rangeStart, months } = useMemo(() => {
    let minDate: Date | null = null;
    let maxDate: Date | null = null;

    for (const { start, end } of datedPhases) {
      const effectiveEnd = end ?? start;
      if (start && (!minDate || start < minDate)) minDate = start;
      if (effectiveEnd && (!maxDate || effectiveEnd > maxDate)) maxDate = effectiveEnd;
    }

    const today = new Date();
    const fallbackStart = addMonths(startOfMonth(today), -3);
    const fallbackEnd = addMonths(startOfMonth(today), 3);

    const rangeStartMonth = startOfMonth(minDate ?? fallbackStart);
    const rangeEndMonth = startOfMonth(maxDate ?? fallbackEnd);

    // เดิมบังคับขั้นต่ำ 4 เดือนเสมอ ทำให้โปรเจกต์ที่ Phase จริงกินเวลาแค่ไม่กี่วัน (เช่นตัวอย่างนี้ 16-22 ต.ค.)
    // ถูกยืดสัดส่วนเทียบกับช่วง 4 เดือนที่ไม่มีอยู่จริง จนหลอดเหลือแค่เศษเสี้ยว 2.5% มองไม่เห็นวันที่ — ตอนนี้
    // ใช้ช่วงเดือนที่มีข้อมูลจริงเท่านั้น (อย่างน้อย 1 เดือน) หลอดจะยาวเห็นชัดตามสัดส่วนวันที่จริง
    const monthCount = Math.max(1, daysBetween(rangeStartMonth, rangeEndMonth) / 30.44) + 1;
    const totalMonths = Math.min(36, Math.max(1, Math.round(monthCount))); // กันตารางยาวเกินไปถ้าข้อมูลผิดปกติ

    const list = Array.from({ length: totalMonths }, (_, i) => {
      const m = addMonths(rangeStartMonth, i);
      return {
        key: `${m.getFullYear()}-${m.getMonth()}`,
        label: MONTH_ABBR[m.getMonth()],
        showYear: i === 0 || m.getMonth() === 0,
        year: m.getFullYear() + 543,
      };
    });

    return { rangeStart: rangeStartMonth, months: list };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phases]);

  const rangeEndExclusive = addMonths(rangeStart, months.length);
  const totalDays = Math.max(1, daysBetween(rangeStart, rangeEndExclusive));
  const gridTemplateColumns = `48px 220px repeat(${months.length}, minmax(60px, 1fr))`;
  // ตารางกว้างขึ้นตามจำนวนเดือนจริง (เดิม Fix 850px เสมอ ทำให้ช่วงสั้นๆ ดูโล่งเกินไป / ช่วงยาวๆ ดูอัดแน่นเกินไป)
  const timelineMinWidth = Math.max(850, 268 + months.length * 90);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-0">
      <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-extrabold text-slate-900 text-base tracking-tight">Project Timeline</h3>
      </div>

      <div className="p-3 overflow-x-auto">
        <div style={{ minWidth: timelineMinWidth }}>
          <div
            className="grid bg-[#0f172a] py-3.5 text-xs font-extrabold text-white text-center items-center rounded-t-xl shadow-xs"
            style={{ gridTemplateColumns }}
          >
            <div className="text-center">#</div>
            <div className="text-left pl-3">Activity</div>
            {months.map((m) => (
              <div key={m.key} className="flex flex-col items-center leading-tight">
                <span>{m.label}</span>
                {m.showYear && <span className="text-[9px] font-normal text-slate-400">{m.year}</span>}
              </div>
            ))}
          </div>

          <div className="divide-y divide-slate-100 text-xs bg-white border-x border-b border-slate-100 rounded-b-xl">
            {parsedPhases.map(({ phase, start, end }, idx) => {
              const effectiveEnd = end ?? start;
              const hasDates = !!start;

              let leftPct = 0;
              let widthPct = 0;
              if (hasDates && start) {
                const startOffsetDays = Math.max(0, daysBetween(rangeStart, start));
                const endOffsetDays = Math.max(startOffsetDays + 1, daysBetween(rangeStart, effectiveEnd ?? start) + 1);
                leftPct = (startOffsetDays / totalDays) * 100;
                widthPct = Math.max(1.2, ((endOffsetDays - startOffsetDays) / totalDays) * 100);
                if (leftPct + widthPct > 100) widthPct = 100 - leftPct;
              }

              // แถบแคบเกินไปจนใส่ตัวอักษรวันที่ไม่พอ (เช่น Phase สั้นแค่ 1 วันในโปรเจกต์ยาวหลายเดือน) —
              // ซ่อนป้ายวันที่ในแถบไปเลยแทนที่จะปล่อยให้ถูกตัดครึ่งดูเหมือน "2..." ตามที่เจอ, ใช้ title Hover ดูแทน
              const canShowBothDates = widthPct >= 18;
              const canShowOneDate = widthPct >= 8;

              return (
                <div
                  key={phase.id}
                  className="grid py-3 items-center hover:bg-slate-50/70 transition-colors"
                  style={{ gridTemplateColumns }}
                >
                  <div className="text-center font-extrabold text-slate-900 text-xs">
                    {String(idx + 1).padStart(2, "0")}
                  </div>

                  <div className="text-left pl-3 font-bold text-slate-900 text-sm truncate">
                    {phase.name}
                  </div>

                  <div
                    className="relative h-7 bg-slate-100/60 rounded-full border border-slate-200/50"
                    style={{ gridColumn: `span ${months.length}` }}
                  >
                    {hasDates && (
                      <div
                        title={`${phase.startDate}${phase.endDate && phase.endDate !== phase.startDate ? ` → ${phase.endDate}` : ""}`}
                        className="absolute top-1 h-5 bg-indigo-600 rounded-full flex items-center justify-between px-2 shadow-xs transition-all overflow-hidden"
                        style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
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
