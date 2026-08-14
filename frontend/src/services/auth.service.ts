import { fetchApi } from '@/lib/api-client';

export interface LoginPayload {
  empId: string;
  password: string;
}

export interface UserPermission {
  systemId: string;
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canReject: boolean;
}

export interface UserInfo {
  userId: number;
  empId: string;
  fullName: string;
  divisionName?: string;
  departmentName?: string;
  userLevel: number;
  isSuperAdmin: boolean;
  permissions: UserPermission[];
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: UserInfo;
}

export const authService = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    return fetchApi<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};