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
  sessionId?: string;
  user?: UserInfo;
}

export interface SessionCheckResponse {
  valid: boolean;
}

export const authService = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    return fetchApi<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  logout: async (userId: number, sessionId?: string | null): Promise<void> => {
    await fetchApi<{ success: boolean }>('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ userId, sessionId: sessionId ?? null }),
    });
  },

  checkSession: async (userId: number, sessionId: string): Promise<SessionCheckResponse> => {
    return fetchApi<SessionCheckResponse>(
      `/auth/session-check?userId=${userId}&sessionId=${encodeURIComponent(sessionId)}`
    );
  },
};