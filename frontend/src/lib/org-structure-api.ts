import { fetchApi } from "@/lib/api-client";
import { DivisionOption } from "@/types/user-permission";

// ===========================================================================
// Core.Divisions / Core.Departments / Core.Sections — dropdown "หน่วยงาน/แผนก/Section"
// ของหน้า User Management เดิมเป็น MOCK_DIVISION_OPTIONS Hardcode ในหน้า, ตอนนี้ย้ายมาเป็นตาราง
// ในฐานข้อมูลจริง เพิ่ม/แก้ไข/ลบได้จากหน้า Org Structure Manager
// ===========================================================================

interface DivisionOptionDtoRaw {
  id: string;
  name: string;
  departments: {
    id: string;
    name: string;
    sections: string[];
  }[];
}

export function getDivisionOptions(): Promise<DivisionOption[]> {
  return fetchApi<DivisionOptionDtoRaw[]>("/OrgStructure/options");
}

export interface OrgDivision {
  divisionId: number;
  divisionName: string;
  isActive: boolean;
  sortOrder: number;
}

export interface OrgDepartment {
  departmentId: number;
  divisionId: number;
  departmentName: string;
  isActive: boolean;
  sortOrder: number;
}

export interface OrgSection {
  sectionId: number;
  departmentId: number;
  sectionName: string;
  isActive: boolean;
  sortOrder: number;
}

export function getOrgDivisions(): Promise<OrgDivision[]> {
  return fetchApi<OrgDivision[]>("/OrgStructure/divisions");
}

export function createOrgDivision(
  divisionName: string,
  currentUserId?: number
): Promise<OrgDivision> {
  const query = currentUserId ? `?userId=${currentUserId}` : "";
  return fetchApi<OrgDivision>(`/OrgStructure/divisions${query}`, {
    method: "POST",
    body: JSON.stringify({ divisionName, isActive: true, sortOrder: 0 }),
  });
}

export function updateOrgDivision(
  divisionId: number,
  divisionName: string,
  isActive: boolean,
  currentUserId?: number
): Promise<OrgDivision> {
  const query = currentUserId ? `?userId=${currentUserId}` : "";
  return fetchApi<OrgDivision>(`/OrgStructure/divisions/${divisionId}${query}`, {
    method: "PUT",
    body: JSON.stringify({ divisionName, isActive, sortOrder: 0 }),
  });
}

export function deleteOrgDivision(divisionId: number, currentUserId?: number): Promise<void> {
  const query = currentUserId ? `?userId=${currentUserId}` : "";
  return fetchApi<void>(`/OrgStructure/divisions/${divisionId}${query}`, { method: "DELETE" });
}

export function getOrgDepartments(divisionId: number): Promise<OrgDepartment[]> {
  return fetchApi<OrgDepartment[]>(`/OrgStructure/departments?divisionId=${divisionId}`);
}

export function createOrgDepartment(
  divisionId: number,
  departmentName: string,
  currentUserId?: number
): Promise<OrgDepartment> {
  const query = currentUserId ? `?userId=${currentUserId}` : "";
  return fetchApi<OrgDepartment>(`/OrgStructure/departments${query}`, {
    method: "POST",
    body: JSON.stringify({ divisionId, departmentName, isActive: true, sortOrder: 0 }),
  });
}

export function updateOrgDepartment(
  departmentId: number,
  divisionId: number,
  departmentName: string,
  isActive: boolean,
  currentUserId?: number
): Promise<OrgDepartment> {
  const query = currentUserId ? `?userId=${currentUserId}` : "";
  return fetchApi<OrgDepartment>(`/OrgStructure/departments/${departmentId}${query}`, {
    method: "PUT",
    body: JSON.stringify({ divisionId, departmentName, isActive, sortOrder: 0 }),
  });
}

export function deleteOrgDepartment(departmentId: number, currentUserId?: number): Promise<void> {
  const query = currentUserId ? `?userId=${currentUserId}` : "";
  return fetchApi<void>(`/OrgStructure/departments/${departmentId}${query}`, { method: "DELETE" });
}

export function getOrgSections(departmentId: number): Promise<OrgSection[]> {
  return fetchApi<OrgSection[]>(`/OrgStructure/sections?departmentId=${departmentId}`);
}

export function createOrgSection(
  departmentId: number,
  sectionName: string,
  currentUserId?: number
): Promise<OrgSection> {
  const query = currentUserId ? `?userId=${currentUserId}` : "";
  return fetchApi<OrgSection>(`/OrgStructure/sections${query}`, {
    method: "POST",
    body: JSON.stringify({ departmentId, sectionName, isActive: true, sortOrder: 0 }),
  });
}

export function updateOrgSection(
  sectionId: number,
  departmentId: number,
  sectionName: string,
  isActive: boolean,
  currentUserId?: number
): Promise<OrgSection> {
  const query = currentUserId ? `?userId=${currentUserId}` : "";
  return fetchApi<OrgSection>(`/OrgStructure/sections/${sectionId}${query}`, {
    method: "PUT",
    body: JSON.stringify({ departmentId, sectionName, isActive, sortOrder: 0 }),
  });
}

export function deleteOrgSection(sectionId: number, currentUserId?: number): Promise<void> {
  const query = currentUserId ? `?userId=${currentUserId}` : "";
  return fetchApi<void>(`/OrgStructure/sections/${sectionId}${query}`, { method: "DELETE" });
}
