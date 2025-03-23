'use server'

import { auth } from '@/auth';
import { ApprovalRole, Department, User } from '@prisma/client';
import { IdSchema, validateRole, UnauthorizedResponse, numberSchema } from '@/schemas';
import { deleteUserFromDB, getAllApprovalRolesFromDB, getAllDepartmentsFromDB, getAllUsersFromDB, setApprovalRoleInDB, setDepartmentInDB, setRoleInDB, updateUserInDB } from './queries';
import { isAdmin } from './roleActions';

export async function getAllUsers(): Promise<Partial<User>[] | UnauthorizedResponse> {
  const session = await auth();
  if (!(await isAdmin(session))) {
    return { error: "Unauthorized" }
  }
  return await getAllUsersFromDB()
}

export async function setRole(userId: string, role: string): Promise<User | UnauthorizedResponse> {
  const session = await auth();
  if (!(await isAdmin(session))) {
    return { error: "Unauthorized" }
  }

  const parseId = IdSchema.safeParse(userId);
  const parsedRole = validateRole(role);

  if (!parseId.success || !parsedRole) {
    return { error: "Invalid user ID or role" };
  }

  return await setRoleInDB(userId, role);
}

export async function deleteUser(userId: string): Promise<User | UnauthorizedResponse> {
  const session = await auth();
  if (!(await isAdmin(session))) {
    return { error: "Unauthorized" }
  }
  const parsedId = IdSchema.safeParse(userId);

  if (!parsedId.success) {
    return { error: "Invalid user ID" };
  }

  return await deleteUserFromDB(userId);
}

export async function setDepartment(userId: string, departmentId: number): Promise<User | UnauthorizedResponse> {
  const session = await auth();
  if (!(await isAdmin(session))) {
    return { error: "Unauthorized" }
  }
  const parsedId = IdSchema.safeParse(userId);
  const parseDepartmentId = numberSchema.safeParse(departmentId);

  if (!parsedId.success || !parseDepartmentId.success) {
    return { error: "Invalid user ID or department ID" };
  }

  return await setDepartmentInDB(userId, departmentId);
}

export async function setApprovalRole(userId: string, approvalRoleId: number): Promise<User | UnauthorizedResponse> {
  const session = await auth();
  if (!(await isAdmin(session))) {
    return { error: "Unauthorized" }
  }
  const parsedId = IdSchema.safeParse(userId);
  const parseApprovalRoleId = numberSchema.safeParse(approvalRoleId);

  if (!parsedId.success || !parseApprovalRoleId.success) {
    return { error: "Invalid user ID or approval role ID" };
  }

  return await setApprovalRoleInDB(userId, approvalRoleId);
}

export async function getAllDepartments(): Promise<Department[] | UnauthorizedResponse> {
  const session = await auth();
  if (!(await isAdmin(session))) {
    return { error: "Unauthorized" }
  }

  return await getAllDepartmentsFromDB();
}

export async function getAllApprovalRoles(): Promise<ApprovalRole[] | UnauthorizedResponse> {
  const session = await auth();
  if (!(await isAdmin(session))) {
    return { error: "Unauthorized" }
  }

  return await getAllApprovalRolesFromDB();
}

export async function updateUser(userId: string, data: Partial<User>): Promise<User | UnauthorizedResponse> {
  const session = await auth();
  if (!(await isAdmin(session))) {
    return { error: "Unauthorized" }
  }
  const parsedId = IdSchema.safeParse(userId);

  if (!parsedId.success) {
    return { error: "Invalid user ID" };
  }

  return await updateUserInDB(userId, data);
}