"use client";

import React from "react";
import { Layers, TestTube, CheckCircle2, XCircle } from "lucide-react";

interface TestingStatsCardsProps {
  totalRuns: number;
  totalCases: number;
  totalPassed: number;
  totalFailed: number;
}

export default function TestingStatsCards({
  totalRuns,
  totalCases,
  totalPassed,
  totalFailed,
}: TestingStatsCardsProps) {
  const statCards = [
    {
      key: "runs",
      label: "รอบการรัน",
      value: totalRuns,
      tag: "TEST RUN",
      icon: Layers,
      bar: "from-violet-400 to-purple-600",
      iconBg: "from-violet-400 to-purple-600",
      iconShadow: "shadow-violet-500/30",
      tagClass: "bg-violet-50 text-violet-700 border-violet-100",
    },
    {
      key: "cases",
      label: "เคสทั้งหมด",
      value: totalCases,
      tag: "TEST CASE",
      icon: TestTube,
      bar: "from-sky-400 to-blue-600",
      iconBg: "from-sky-400 to-blue-600",
      iconShadow: "shadow-blue-500/30",
      tagClass: "bg-sky-50 text-sky-700 border-sky-100",
    },
    {
      key: "passed",
      label: "ผ่าน (Passed)",
      value: totalPassed,
      tag: "PASSED",
      icon: CheckCircle2,
      bar: "from-emerald-400 to-emerald-600",
      iconBg: "from-emerald-400 to-emerald-600",
      iconShadow: "shadow-emerald-500/30",
      tagClass: "bg-emerald-50 text-emerald-700 border-emerald-100",
      valueClass: "text-emerald-600",
    },
    {
      key: "failed",
      label: "ไม่ผ่าน (Failed)",
      value: totalFailed,
      tag: "FAILED",
      icon: XCircle,
      bar: "from-rose-400 to-pink-600",
      iconBg: "from-rose-400 to-pink-600",
      iconShadow: "shadow-rose-500/30",
      tagClass: "bg-rose-50 text-rose-700 border-rose-100",
      valueClass: "text-rose-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.key}
            className="relative bg-white border border-slate-200/80 rounded-2xl p-4 pt-5 shadow-xs overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${card.bar}`} />

            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-500">{card.label}</p>
                <p className={`text-3xl font-black font-mono mt-1 ${card.valueClass ?? "text-slate-900"}`}>
                  {card.value}
                </p>
                <span
                  className={`inline-flex mt-3 px-2.5 py-1 rounded-full text-[10px] font-bold border ${card.tagClass}`}
                >
                  {card.tag}
                </span>
              </div>

              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.iconBg} ${card.iconShadow} shadow-lg flex items-center justify-center text-white shrink-0`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}