'use server'

import { Session } from 'next-auth';
import { auth } from '@/auth';
import { IdSchema, validateRole } from '@/schemas';
import { UnauthorizedResponse, User } from '@/schemas/types';

export async function getAllUsers(
  isAdmin: (session: Session | null) => Promise<boolean>,
  getAllUsers: () => Promise<User[]>
): Promise<User[] | UnauthorizedResponse> {
  const session = await auth();
  if (!(await isAdmin(session))) {
    return { error: "Unauthorized" }
  }
  return getAllUsers()
}

export async function setRole(
  isAdmin: (session: Session | null) => Promise<boolean>,
  userId: string,
  role: string,
  setRole: (userId: string, role: string) => Promise<User | UnauthorizedResponse>
): Promise<User | UnauthorizedResponse> {
  const session = await auth();
  if (!(await isAdmin(session))) {
    return { error: "Unauthorized" }
  }

  const parsedRole = validateRole(role);

  if (!parsedRole) {
    return { error: "Invalid role" };
  }

  return setRole(userId, parsedRole);
}

export async function deleteUser(
  isAdmin: (session: Session | null) => Promise<boolean>,
  userId: string,
  deleteUser: (userId: string) => Promise<User | UnauthorizedResponse>
): Promise<User | UnauthorizedResponse> {
  const session = await auth();
  if (!(await isAdmin(session))) {
    return { error: "Unauthorized" }
  }
  console.log(userId);
  const parsedId = IdSchema.safeParse(userId);

  if (!parsedId.success) {
    return { error: "Invalid user ID" };
  }

  const deletedUser = await deleteUser(userId);

  return deletedUser;
}