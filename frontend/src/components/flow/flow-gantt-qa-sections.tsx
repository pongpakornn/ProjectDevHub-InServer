"use client";

import React from "react";
import Link from "next/link";
import { CalendarRange, ShieldCheck } from "lucide-react";

export default function FlowGanttQaSections() {
  return (
    <div className="space-y-6">
      {/* Gantt แผนงาน (Plan Timeline) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <CalendarRange className="w-4 h-4 text-indigo-600" />
          <h2 className="font-bold text-slate-900 text-sm">Gantt แผนงาน (Plan Timeline)</h2>
        </div>
        <div className="py-10 flex items-center justify-center text-center">
          <p className="text-xs text-slate-400 font-medium">
            ใส่วันเริ่ม/สิ้นสุดในเฟสงาน เพื่อแสดงแผนงานแบบ Gantt
          </p>
        </div>
      </div>

      {/* คุณภาพระบบล่าสุด (QA Gate) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <h2 className="font-bold text-slate-900 text-sm">คุณภาพระบบล่าสุด (QA Gate)</h2>
        </div>
        <p className="text-xs text-slate-400 font-medium">
          ยังไม่มีผลเทสของโปรเจคนี้ — บันทึกได้ที่เมนู{" "}
          <Link href="/dashboard/testing" className="text-indigo-600 font-bold hover:underline">
            Test Automation
          </Link>
        </p>
      </div>
    </div>
  );
}