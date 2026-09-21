"use client";

import React, { useEffect, useState } from "react";
import { Loader2, ServerCrash, RotateCcw, ShieldAlert, Settings2 } from "lucide-react";
import UserHeaderBanner from "@/components/users/user-header-banner";
import UserRegistrationForm from "@/components/users/user-registration-form";
import UserManagementTable from "@/components/users/user-management-table";
import UserDetailModal from "@/components/users/user-detail-modal";
import OrgStructureManagerModal from "@/components/users/org-structure-manager-modal";
import ConfirmModal, { ConfirmModalVariant, ConfirmModalIconType } from "@/components/ui/confirm-modal";
import { useToast } from "@/lib/toast-context";
import {
  UserWithPermissions,
  UserFormData,
  DivisionOption,
  SystemList,
} from "@/types/user-permission";
import { getUsers, getSystemList, createUser, updateUser, deleteUser, toggleSuspendUser } from "@/lib/users-api";
import { getDivisionOptions } from "@/lib/org-structure-api";
import { getStoredUser, isAdminOrAbove } from "@/lib/session";

// TODO: ยังไม่มี Auth Context ผูก User จริง — ใช้ userId ของ Admin ทดสอบไปก่อน (userId=1) ถ้ายังไม่ได้ล็อกอิน
const CURRENT_USER_ID = getStoredUser()?.userId ?? 1;

export default function UsersPage() {
  const [users, setUsers] = useState<UserWithPermissions[]>([]);
  const [systemList, setSystemList] = useState<SystemList[]>([]);
  const [divisionOptions, setDivisionOptions] = useState<DivisionOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<UserWithPermissions | null>(null);
  const [viewingUser, setViewingUser] = useState<UserWithPermissions | null>(null);
  const [isOrgManagerOpen, setIsOrgManagerOpen] = useState(false);

  // ข้อยกเว้น: User Management มองเห็น/ใช้งานได้เฉพาะ Admin/Super Admin เท่านั้น ไม่ผูกกับ Permission
  // Matrix ปกติ (CanAdd/CanEdit/...) — ตรงกับกฎเดียวกับที่ใช้กรองเมนูฝั่ง Sidebar
  // ยังไม่มี User ใน LocalStorage (ยังไม่ Login) = อนุญาตไปก่อนกันกระทบ Flow ตอนพัฒนา (Pattern เดียวกับ Sidebar)
  const [isAdminReady, setIsAdminReady] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(true);
  useEffect(() => {
    const stored = getStoredUser();
    setIsAdminUser(!stored || isAdminOrAbove(stored));
    setIsAdminReady(true);
  }, []);

  // Toast Notifications — ใช้ Global Notification Service เดียวกันทั้งระบบ (ดู lib/toast-context.tsx)
  const toast = useToast();

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText: string;
    variant: ConfirmModalVariant;
    icon: ConfirmModalIconType;
    action: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    confirmText: "ยืนยัน",
    variant: "danger",
    icon: "alert",
    action: () => {},
  });

  const openConfirmModal = (options: {
    title: string;
    description: string;
    confirmText?: string;
    variant?: ConfirmModalVariant;
    icon?: ConfirmModalIconType;
    action: () => void;
  }) => {
    setConfirmModal({
      isOpen: true,
      title: options.title,
      description: options.description,
      confirmText: options.confirmText || "ยืนยัน",
      variant: options.variant || "danger",
      icon: options.icon || "alert",
      action: options.action,
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  };

  // ===========================================================================
  // โหลดข้อมูลจริงจาก Core.Users / Core.Permissions / Core.SystemList
  // ===========================================================================
  const loadData = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [usersData, systemsData, divisionData] = await Promise.all([
        getUsers(CURRENT_USER_ID),
        getSystemList(),
        getDivisionOptions(),
      ]);
      setUsers(usersData);
      setSystemList(systemsData);
      setDivisionOptions(divisionData);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "ไม่สามารถโหลดข้อมูลสมาชิกได้");
    } finally {
      setIsLoading(false);
    }
  };

  const reloadDivisionOptions = () => {
    getDivisionOptions()
      .then(setDivisionOptions)
      .catch(() => {
        // ไม่ต้อง Block UI ถ้าโหลดรอบใหม่ไม่สำเร็จ — Dropdown จะยังใช้ค่าชุดล่าสุดที่มีอยู่ต่อไป
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  // สถิติผู้ใช้งาน
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.IsActive && !u.IsSuspended).length;
  const adminCount = users.filter((u) => u.IsSuperAdmin || u.UserLevel === "SUPER_ADMIN" || u.UserLevel === "ADMIN").length;
  const suspendedCount = users.filter((u) => u.IsSuspended).length;

  // Toggle Function สำหรับปุ่ม "+ สมัครสมาชิกใหม่" / "ปิดฟอร์มลงทะเบียน"
  const handleToggleCreateForm = () => {
    if (isFormOpen) {
      setIsFormOpen(false);
      setEditingUser(null);
    } else {
      setEditingUser(null);
      setIsFormOpen(true);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handleOpenEdit = (user: UserWithPermissions) => {
    setEditingUser(user);
    setIsFormOpen(true);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingUser(null);
  };

  const handleSaveUser = async (formData: UserFormData) => {
    setIsSaving(true);
    try {
      if (editingUser) {
        const saved = await updateUser(editingUser.UserId, formData, CURRENT_USER_ID);
        setUsers((prev) => prev.map((u) => (u.UserId === saved.UserId ? saved : u)));
        toast.success("อัปเดตข้อมูลสำเร็จ", `บันทึกการแก้ไขข้อมูลของ ${saved.FullName} เรียบร้อยแล้ว`);
      } else {
        const saved = await createUser(formData, CURRENT_USER_ID);
        setUsers((prev) => [saved, ...prev]);
        toast.success("สมัครสมาชิกสำเร็จ", `เพิ่มสมาชิก ${saved.FullName} (${saved.EmpId}) เข้าสู่ระบบเรียบร้อย`);
      }
      handleCloseForm();
    } catch (err) {
      toast.error(
        "บันทึกข้อมูลไม่สำเร็จ",
        err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = (userId: number) => {
    const target = users.find((u) => u.UserId === userId);
    if (!target) return;

    openConfirmModal({
      title: "ยืนยันการลบสมาชิก",
      description: `คุณแน่ใจหรือไม่ว่าต้องการลบสมาชิก "${target.FullName}" (${target.EmpId}) ออกจากระบบ? การกระทำนี้ไม่สามารถเรียกคืนข้อมูลได้`,
      confirmText: "ลบสมาชิกทันที",
      variant: "danger",
      icon: "trash",
      action: async () => {
        try {
          await deleteUser(userId, CURRENT_USER_ID);
          setUsers((prev) => prev.filter((u) => u.UserId !== userId));
          toast.info("ลบข้อมูลสมาชิกสำเร็จ", `เพิกถอนสิทธิ์และลบข้อมูล "${target.FullName}" เรียบร้อยแล้ว`);
        } catch (err) {
          toast.error(
            "ลบสมาชิกไม่สำเร็จ",
            err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ"
          );
        } finally {
          closeConfirmModal();
        }
      },
    });
  };

  const handleToggleSuspend = (userId: number) => {
    const target = users.find((u) => u.UserId === userId);
    if (!target) return;

    const willSuspend = !target.IsSuspended;

    openConfirmModal({
      title: willSuspend ? "ยืนยันการระงับการใช้งาน" : "ยืนยันการปลดระงับการใช้งาน",
      description: willSuspend
        ? `คุณต้องการระงับการใช้งานของ "${target.FullName}" (${target.EmpId}) หรือไม่? บัญชีนี้จะไม่สามารถเข้าสู่ระบบหรือเข้าถึงเมนูต่างๆ ได้`
        : `คุณต้องการเปิดใช้งานบัญชี "${target.FullName}" (${target.EmpId}) อีกครั้งหรือไม่?`,
      confirmText: willSuspend ? "ระงับการใช้งาน" : "ปลดระงับ",
      variant: willSuspend ? "danger" : "primary",
      icon: willSuspend ? "ban" : "shield",
      action: async () => {
        try {
          const saved = await toggleSuspendUser(userId, CURRENT_USER_ID);
          setUsers((prev) => prev.map((u) => (u.UserId === userId ? saved : u)));

          if (viewingUser && viewingUser.UserId === userId) {
            setViewingUser(saved);
          }

          if (saved.IsSuspended) {
            toast.warning("ระงับการใช้งานเรียบร้อย", `ระงับบัญชีของ "${target.FullName}" แล้ว`);
          } else {
            toast.success("ปลดระงับการใช้งานเรียบร้อย", `บัญชีของ "${target.FullName}" กลับมาใช้งานได้ตามปกติ`);
          }
        } catch (err) {
          toast.error(
            "เปลี่ยนสถานะไม่สำเร็จ",
            err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ"
          );
        } finally {
          closeConfirmModal();
        }
      },
    });
  };

  if (isAdminReady && !isAdminUser) {
    return (
      <div className="w-full flex flex-col items-center justify-center gap-3 py-32 text-center text-slate-400">
        <ShieldAlert className="w-10 h-10 text-rose-400" />
        <p className="text-sm font-bold text-slate-800">ไม่มีสิทธิ์เข้าถึงหน้านี้</p>
        <p className="text-xs text-slate-500 font-mono">การจัดการสมาชิกอนุญาตเฉพาะผู้ดูแลระบบ (Admin/Super Admin) เท่านั้น</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center gap-3 py-32 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-xs font-mono font-semibold">กำลังโหลดข้อมูลสมาชิกจากฐานข้อมูล...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="w-full flex flex-col items-center justify-center gap-4 py-32 text-center">
        <ServerCrash className="w-10 h-10 text-rose-400" />
        <div className="space-y-1">
          <p className="text-sm font-bold text-slate-800">ไม่สามารถโหลดข้อมูลสมาชิกได้</p>
          <p className="text-xs text-slate-500 font-mono">{loadError}</p>
        </div>
        <button
          type="button"
          onClick={loadData}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          ลองใหม่อีกครั้ง
        </button>
      </div>
    );
  }

  return (
    <div className="w-full select-none space-y-6 transition-all duration-300 ease-in-out">
      {/* 1. Header Banner with interactive Toggle Form button */}
      <UserHeaderBanner
        totalUsers={totalUsers}
        activeUsers={activeUsers}
        adminCount={adminCount}
        suspendedCount={suspendedCount}
        onToggleForm={handleToggleCreateForm}
        isFormOpen={isFormOpen}
      />

      {/* 1b. ปุ่มจัดการ Dropdown หน่วยงาน/แผนก/Section (Admin เพิ่ม/แก้ไข/ลบเองได้) */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setIsOrgManagerOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-xs"
        >
          <Settings2 className="w-3.5 h-3.5 text-indigo-600" />
          จัดการ Dropdown หน่วยงาน / แผนก / Section
        </button>
      </div>

      {/* 2. Registration + Permission Matrix Form (Toggleable, ใช้ CSS Grid Trick ป้องกัน Layout Shift) */}
      <div
        className={`grid transition-all duration-500 ease-in-out ${
          isFormOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <UserRegistrationForm
            mode={editingUser ? "edit" : "create"}
            initialData={editingUser}
            onSubmit={handleSaveUser}
            onCancel={handleCloseForm}
            divisionOptions={divisionOptions}
            systemList={systemList}
            isSaving={isSaving}
          />
        </div>
      </div>

      {/* 3. User List & Permission Matrix Overview Table */}
      <UserManagementTable
        users={users}
        divisionOptions={divisionOptions}
        onView={(user) => setViewingUser(user)}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteUser}
        onToggleSuspend={handleToggleSuspend}
      />

      {/* 4. User Detail & Permission Modal */}
      <UserDetailModal
        user={viewingUser}
        systemList={systemList}
        isOpen={!!viewingUser}
        onClose={() => setViewingUser(null)}
        onEdit={(user) => {
          setViewingUser(null);
          handleOpenEdit(user);
        }}
        onToggleSuspend={handleToggleSuspend}
      />

      {/* 5. Custom Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        description={confirmModal.description}
        confirmText={confirmModal.confirmText}
        variant={confirmModal.variant}
        icon={confirmModal.icon}
        onConfirm={confirmModal.action}
        onCancel={closeConfirmModal}
      />

      {/* 6. Org Structure Manager (จัดการ Dropdown หน่วยงาน/แผนก/Section) */}
      <OrgStructureManagerModal
        isOpen={isOrgManagerOpen}
        onClose={() => setIsOrgManagerOpen(false)}
        currentUserId={CURRENT_USER_ID}
        onChanged={reloadDivisionOptions}
      />
    </div>
  );
}
