"use client";

import { useEffect, useState } from "react";
import HeroBanner from "@/components/dashboard/hero-banner";
import StatCards from "@/components/dashboard/stat-cards";
import ProjectCharts from "@/components/dashboard/project-charts";
import ProjectTimeline from "@/components/dashboard/project-timeline";
import { getDashboardSummary } from "@/lib/dashboard-api";
import { DashboardSummary } from "@/types/dashboard";
import { getStoredUser } from "@/lib/session";

// TODO: ยังไม่มี Auth Context ผูก User จริง — ใช้ userId ของ Admin ทดสอบไปก่อน (userId=1) ถ้ายังไม่ได้ล็อกอิน
const CURRENT_USER_ID = getStoredUser()?.userId ?? 1;

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await getDashboardSummary(CURRENT_USER_ID);
        if (!cancelled) setSummary(data);
      } catch (err) {
        console.error(err);
        if (!cancelled) setLoadError("ไม่สามารถโหลดข้อมูลภาพรวมได้ กรุณาลองใหม่อีกครั้ง");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return <div className="w-full py-20 text-center text-slate-500 text-xs font-medium">กำลังโหลดข้อมูลภาพรวม...</div>;
  }

  if (loadError || !summary) {
    return (
      <div className="w-full py-20 text-center text-red-500 text-xs font-medium">
        {loadError || "ไม่พบข้อมูล"}
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6 w-full">
      {/* 1. Hero Banner ด้านบน */}
      <HeroBanner overallProgress={summary.overallProgress} />

      {/* 2. สรุปตัวเลข Stat Cards */}
      <StatCards summary={summary} />

      {/* 3. กราฟเปรียบเทียบ */}
      <ProjectCharts summary={summary} />

      {/* 4. Timeline ความคืบหน้า */}
      <ProjectTimeline projects={summary.projects} />
    </div>
  );
}
