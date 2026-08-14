"use client";

import HeroBanner from "@/components/dashboard/hero-banner";
import StatCards from "@/components/dashboard/stat-cards";
import ProjectCharts from "@/components/dashboard/project-charts";
import ProjectTimeline from "@/components/dashboard/project-timeline";

export default function DashboardPage() {
  return (
    <div className="space-y-5 sm:space-y-6 w-full">
      {/* 1. Hero Banner ด้านบน */}
      <HeroBanner />

      {/* 2. สรุปตัวเลข Stat Cards */}
      <StatCards />

      {/* 3. กราฟเปรียบเทียบ */}
      <ProjectCharts />

      {/* 4. Timeline ความคืบหน้า */}
      <ProjectTimeline />
    </div>
  );
}