'use server'

import { auth } from '@/auth';
import { IdSchema, validateRole } from '@/schemas';
import { UnauthorizedResponse, User } from '@/schemas/types';
import { deleteUserFromDB, getAllUsersFromDB, setRoleInDB } from './databaseActions';
import { isAdmin } from './roleActions';

export async function getAllUsers(): Promise<User[] | UnauthorizedResponse> {
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