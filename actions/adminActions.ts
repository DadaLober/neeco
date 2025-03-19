'use server'

import { auth } from '@/auth';
import { User } from '@prisma/client';
import { IdSchema, validateRole, UnauthorizedResponse } from '@/schemas';
import { deleteUserFromDB, getAllUsersFromDB, setApprovalRoleInDB, setDepartmentInDB, setRoleInDB } from './databaseActions';
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

  const parsedRole = validateRole(role);

  if (!parsedRole) {
    return { error: "Invalid role" };
  }

  return await setRoleInDB(userId, parsedRole);
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

  if (!parsedId.success) {
    return { error: "Invalid department ID" };
  }

  return await setDepartmentInDB(userId, departmentId);
}

export async function setApprovalRole(userId: string, approvalRoleId: number): Promise<User | UnauthorizedResponse> {
  const session = await auth();
  if (!(await isAdmin(session))) {
    return { error: "Unauthorized" }
  }
  const parsedId = IdSchema.safeParse(userId);

  if (!parsedId.success) {
    return { error: "Invalid approval role ID" };
  }

  return await setApprovalRoleInDB(userId, approvalRoleId);
}