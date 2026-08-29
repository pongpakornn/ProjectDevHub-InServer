import { Phase } from "@/types/project-detail";

// หมายเหตุ: ตอนนี้ Backend คำนวณ Project.progress ให้อัตโนมัติผ่าน Trigger แล้ว
// (ดู Trg_UpdateProjectProgress ในฐานข้อมูล) ฟังก์ชันนี้เก็บไว้เผื่อยังมีที่อื่นเรียกใช้อยู่
// (เช่น Team module ที่ยังไม่ได้ต่อ Backend) แต่หน้า Solo ไม่ได้เรียกใช้แล้ว — ใช้ project.progress ตรงๆ แทน
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

  // หากไม่มี Phases ให้ตรวจสอบสถานะหลักของโปรเจกต์ (Enum อังกฤษตาม DB)
  if (defaultStatus === "COMPLETED") return 100;
  if (defaultStatus === "PLANNING") return 0;

  // กรณี "IN_PROGRESS" แต่ยังไม่มี Phase/Task
  return manualProgress !== undefined ? manualProgress : 0;
};