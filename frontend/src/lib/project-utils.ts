// src/lib/project-utils.ts
import { Phase } from "@/types/project";

export const calculateProjectProgress = (
  phases?: Phase[],
  defaultStatus?: string,
  manualProgress?: number
): number => {
  // หากมี Phases ให้คำนวณจาก Tasks จริงภายใน Phase
  if (phases && phases.length > 0) {
    let totalTasks = 0;
    let completedTasks = 0;

    phases.forEach((phase) => {
      if (phase.items && phase.items.length > 0) {
        totalTasks += phase.items.length;
        completedTasks += phase.items.filter((item) => item.completed).length;
      } else {
        totalTasks += 1;
        if (phase.status === "Done") completedTasks += 1;
      }
    });

    return totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  }

  // หากไม่มี Phases ให้ตรวจสอบสถานะหลักของโปรเจกต์
  if (defaultStatus === "เสร็จแล้ว") return 100;
  if (defaultStatus === "Planning") return 0;

  // กรณี "กำลังทำ" แต่ยังไม่มี Phase/Task
  return manualProgress !== undefined ? manualProgress : 0;
};