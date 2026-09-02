import { fetchApi } from "@/lib/api-client";
import { User, UserWithPermissions, UserFormData, SystemList, Permission } from "@/types/user-permission";

// ===========================================================================
// UserLevel: Core.Users.UserLevel เก็บเป็น INT ในฐานข้อมูล (DEFAULT 1) ไม่มี Lookup
// Table ผูกไว้ — ระดับ "1" คือค่าเริ่มต้นของผู้ใช้ทั่วไปตามที่ Schema กำหนดไว้ จึงเรียง
// ลำดับเลขจากสิทธิ์น้อยไปมากโดยเริ่มที่ 1 = USER ให้ตรงกับความหมายเดิมของ Default Value
// ส่วนบัญชีที่ IsSuperAdmin = true (เช่นข้อมูลทดสอบเก่าที่เคยตั้ง UserLevel เป็นเลขอื่น
// เช่น 99) จะถูก Override ให้แสดงเป็น SUPER_ADMIN เสมอ โดยไม่สนค่าตัวเลขดิบ
// ===========================================================================
export const USER_LEVEL_TO_INT: Record<User["UserLevel"], number> = {
  USER: 1,
  VIEWER: 2,
  TESTER: 3,
  DEVELOPER: 4,
  MANAGER: 5,
  ADMIN: 6,
  SUPER_ADMIN: 7,
};

const INT_TO_USER_LEVEL: Record<number, User["UserLevel"]> = {
  1: "USER",
  2: "VIEWER",
  3: "TESTER",
  4: "DEVELOPER",
  5: "MANAGER",
  6: "ADMIN",
  7: "SUPER_ADMIN",
};

function mapIntToUserLevel(level: number, isSuperAdmin: boolean): User["UserLevel"] {
  if (isSuperAdmin) return "SUPER_ADMIN";
  return INT_TO_USER_LEVEL[level] ?? "USER";
}

interface PermissionItemDtoRaw {
  systemId: string;
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canReject: boolean;
}

interface UserListItemDtoRaw {
  userId: number;
  empId: string;
  fullName: string;
  divisionName?: string | null;
  departmentName?: string | null;
  sectionName?: string | null;
  userLevel: number;
  isSuperAdmin: boolean;
  isSuspended: boolean;
  isOnline: boolean;
  computerName?: string | null;
  ipAddress?: string | null;
  lastLoginDate?: string | null;
  isActive: boolean;
  createdDate: string;
  updatedDate?: string | null;
  permissions: PermissionItemDtoRaw[];
}

interface SystemListDtoRaw {
  systemId: string;
  systemName: string;
  description?: string | null;
  isActive: boolean;
  createdDate: string;
}

function mapPermission(raw: PermissionItemDtoRaw, userId: number, index: number): Permission {
  return {
    PermissionId: userId * 1000 + index,
    UserId: userId,
    SystemId: raw.systemId,
    CanView: raw.canView,
    CanAdd: raw.canAdd,
    CanEdit: raw.canEdit,
    CanDelete: raw.canDelete,
    CanApprove: raw.canApprove,
    CanReject: raw.canReject,
    CreatedDate: "",
    UpdatedDate: "",
  };
}

function mapUser(raw: UserListItemDtoRaw): UserWithPermissions {
  return {
    UserId: raw.userId,
    EmpId: raw.empId,
    FullName: raw.fullName,
    DivisionName: raw.divisionName || "",
    DepartmentName: raw.departmentName || "",
    SectionName: raw.sectionName || "",
    UserLevel: mapIntToUserLevel(raw.userLevel, raw.isSuperAdmin),
    IsSuperAdmin: raw.isSuperAdmin,
    IsSuspended: raw.isSuspended,
    IsOnline: raw.isOnline,
    ComputerName: raw.computerName || undefined,
    IpAddress: raw.ipAddress || undefined,
    LastLoginDate: raw.lastLoginDate,
    IsActive: raw.isActive,
    CreatedDate: raw.createdDate,
    UpdatedDate: raw.updatedDate || raw.createdDate,
    Permissions: raw.permissions.map((p, idx) => mapPermission(p, raw.userId, idx)),
  };
}

function mapSystemList(raw: SystemListDtoRaw): SystemList {
  return {
    SystemId: raw.systemId,
    SystemName: raw.systemName,
    Description: raw.description || "",
    IsActive: raw.isActive,
    CreatedDate: raw.createdDate,
  };
}

function toSavePermissions(formData: UserFormData) {
  return formData.Permissions.map((p) => ({
    systemId: p.SystemId,
    canView: p.CanView,
    canAdd: p.CanAdd,
    canEdit: p.CanEdit,
    canDelete: p.CanDelete,
    canApprove: p.CanApprove,
    canReject: p.CanReject,
  }));
}

export async function getUsers(): Promise<UserWithPermissions[]> {
  const raw = await fetchApi<UserListItemDtoRaw[]>("/Users");
  return raw.map(mapUser);
}

export async function getSystemList(): Promise<SystemList[]> {
  const raw = await fetchApi<SystemListDtoRaw[]>("/Users/system-list");
  return raw.map(mapSystemList);
}

export async function createUser(
  formData: UserFormData,
  currentUserId?: number
): Promise<UserWithPermissions> {
  const query = currentUserId ? `?userId=${currentUserId}` : "";
  const raw = await fetchApi<UserListItemDtoRaw>(`/Users${query}`, {
    method: "POST",
    body: JSON.stringify({
      empId: formData.EmpId,
      password: formData.Password,
      fullName: formData.FullName,
      divisionName: formData.DivisionName,
      departmentName: formData.DepartmentName,
      sectionName: formData.SectionName,
      userLevel: USER_LEVEL_TO_INT[formData.UserLevel],
      isSuperAdmin: formData.IsSuperAdmin,
      isSuspended: formData.IsSuspended,
      isActive: formData.IsActive,
      permissions: toSavePermissions(formData),
    }),
  });
  return mapUser(raw);
}

export async function updateUser(
  userId: number,
  formData: UserFormData,
  currentUserId?: number
): Promise<UserWithPermissions> {
  const query = currentUserId ? `?userId=${currentUserId}` : "";
  const raw = await fetchApi<UserListItemDtoRaw>(`/Users${query}`, {
    method: "PUT",
    body: JSON.stringify({
      userId,
      empId: formData.EmpId,
      password: formData.Password.trim() ? formData.Password : null,
      fullName: formData.FullName,
      divisionName: formData.DivisionName,
      departmentName: formData.DepartmentName,
      sectionName: formData.SectionName,
      userLevel: USER_LEVEL_TO_INT[formData.UserLevel],
      isSuperAdmin: formData.IsSuperAdmin,
      isSuspended: formData.IsSuspended,
      isActive: formData.IsActive,
      permissions: toSavePermissions(formData),
    }),
  });
  return mapUser(raw);
}

export function deleteUser(userId: number, currentUserId?: number): Promise<void> {
  const query = currentUserId ? `?userId=${currentUserId}` : "";
  return fetchApi<void>(`/Users/${userId}${query}`, { method: "DELETE" });
}

export async function toggleSuspendUser(
  userId: number,
  currentUserId?: number
): Promise<UserWithPermissions> {
  const query = currentUserId ? `?userId=${currentUserId}` : "";
  const raw = await fetchApi<UserListItemDtoRaw>(`/Users/${userId}/suspend${query}`, {
    method: "PATCH",
  });
  return mapUser(raw);
}
