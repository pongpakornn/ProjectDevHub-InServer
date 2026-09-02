export interface User {
  UserId: number;
  EmpId: string;
  PasswordHash?: string;
  FullName: string;
  DivisionName: string;
  DepartmentName: string;
  SectionName: string;
  UserLevel: "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "DEVELOPER" | "TESTER" | "VIEWER" | "USER";
  IsSuperAdmin: boolean;
  IsSuspended: boolean;
  IsOnline: boolean;
  CurrentSessionId?: string | null;
  ComputerName?: string;
  IpAddress?: string;
  LastLoginDate?: string | null;
  IsActive: boolean;
  CreatedDate: string;
  UpdatedDate: string;
}

export interface Permission {
  PermissionId: number;
  UserId: number;
  SystemId: string;
  CanView: boolean;
  CanAdd: boolean;
  CanEdit: boolean;
  CanDelete: boolean;
  CanApprove: boolean;
  CanReject: boolean;
  CreatedDate: string;
  UpdatedDate: string;
}

export interface SystemList {
  SystemId: string;
  SystemName: string;
  Description: string;
  IsActive: boolean;
  CreatedDate: string;
}

export interface UserWithPermissions extends User {
  Permissions: Permission[];
}

export interface UserFormData {
  EmpId: string;
  // สร้างใหม่: บังคับกรอก | แก้ไข: เว้นว่างไว้เพื่อคงรหัสผ่านเดิม
  Password: string;
  FullName: string;
  DivisionName: string;
  DepartmentName: string;
  SectionName: string;
  UserLevel: User["UserLevel"];
  IsSuperAdmin: boolean;
  IsSuspended: boolean;
  IsActive: boolean;
  Permissions: {
    SystemId: string;
    CanView: boolean;
    CanAdd: boolean;
    CanEdit: boolean;
    CanDelete: boolean;
    CanApprove: boolean;
    CanReject: boolean;
  }[];
}

export interface DivisionOption {
  id: string;
  name: string;
  departments: {
    id: string;
    name: string;
    sections: string[];
  }[];
}

