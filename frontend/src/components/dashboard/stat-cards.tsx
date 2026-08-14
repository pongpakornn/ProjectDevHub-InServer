"use client";

import { User, Users, Activity, CheckCircle2, TestTube, TrendingUp, FlaskConical, Clock } from "lucide-react";

const stats = [
  { id: "1", title: "ทำคนเดียว", value: "8", subtitle: "โปรเจค", icon: User, color: "from-emerald-500 to-teal-600", textColor: "text-emerald-800", bgBadge: "bg-emerald-100", borderAccent: "border-slate-300 hover:border-emerald-500" },
  { id: "2", title: "ทำกับทีม", value: "0", subtitle: "โปรเจค", icon: Users, color: "from-blue-500 to-indigo-600", textColor: "text-blue-800", bgBadge: "bg-blue-100", borderAccent: "border-slate-300 hover:border-blue-500" },
  { id: "3", title: "กำลังทำ", value: "2", subtitle: "อยู่ระหว่างพัฒนา", icon: Activity, color: "from-amber-500 to-orange-600", textColor: "text-amber-800", bgBadge: "bg-amber-100", borderAccent: "border-slate-300 hover:border-amber-500" },
  { id: "4", title: "เสร็จแล้ว", value: "6", subtitle: "ส่งมอบสำเร็จ", icon: CheckCircle2, color: "from-emerald-500 to-green-600", textColor: "text-emerald-800", bgBadge: "bg-emerald-100", borderAccent: "border-slate-300 hover:border-emerald-500" },
  { id: "5", title: "รอบเทสทั้งหมด", value: "1", subtitle: "TEST RUN", icon: FlaskConical, color: "from-purple-500 to-violet-600", textColor: "text-purple-800", bgBadge: "bg-purple-100", borderAccent: "border-slate-300 hover:border-purple-500" },
  { id: "6", title: "อัตราผ่าน", value: "80%", subtitle: "PASS RATE", icon: TrendingUp, color: "from-teal-500 to-emerald-600", textColor: "text-teal-800", bgBadge: "bg-teal-100", borderAccent: "border-slate-300 hover:border-teal-500" },
  { id: "7", title: "เคสทดสอบ", value: "5", subtitle: "TEST CASE", icon: TestTube, color: "from-sky-500 to-blue-600", textColor: "text-sky-800", bgBadge: "bg-sky-100", borderAccent: "border-slate-300 hover:border-sky-500" },
  { id: "8", title: "เวลารวม", value: "0m", subtitle: "นาที", icon: Clock, color: "from-rose-500 to-pink-600", textColor: "text-rose-800", bgBadge: "bg-rose-100", borderAccent: "border-slate-300 hover:border-rose-500" },
];

export default function StatCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.id}
            className={`group relative bg-white border ${item.borderAccent} rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden`}
          >
            {/* Subtle Gradient Glow at Top Right */}
            <div className={`absolute -right-6 -top-6 w-20 h-20 bg-linear-to-br ${item.color} opacity-10 rounded-full blur-xl group-hover:opacity-25 transition-opacity`} />

            {/* Top Bar Indicator */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r ${item.color}`} />

            <div className="flex items-center justify-between pt-1 relative z-10">
              <div>
                <p className="text-xs font-bold text-slate-500">{item.title}</p>
                <p className="text-2xl font-black text-slate-900 font-mono tracking-tight mt-0.5">{item.value}</p>
                <span className={`inline-block text-[10px] font-bold ${item.textColor} ${item.bgBadge} px-2.5 py-0.5 rounded-md mt-2 border border-slate-200 shadow-2xs`}>
                  {item.subtitle}
                </span>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${item.color} text-white flex items-center justify-center shadow-md shadow-slate-300/80 group-hover:scale-105 transition-transform duration-300`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}