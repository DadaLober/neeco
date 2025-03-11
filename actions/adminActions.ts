'use server'

import { Session } from 'next-auth';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { IdSchema, validateRole } from '@/schemas';
import { UnauthorizedResponse, User } from '@/schemas/types';

export async function getAllUsers(
  isAdmin: (session: Session | null) => Promise<boolean>,
  getAllUsers: () => Promise<User[]>
): Promise<User[] | UnauthorizedResponse> {
  const session = await auth();
  if (!(await isAdmin(session))) {
    return { message: "Unauthorized" }
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
    return { message: "Unauthorized" }
  }

  const parsedRole = validateRole(role);

  if (!parsedRole) {
    return { message: "Invalid role" };
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
    return { message: "Unauthorized" }
  }
  console.log(userId);
  const parsedId = IdSchema.safeParse(userId);

  if (!parsedId.success) {
    return { message: "Invalid user ID" };
  }

  const deletedUser = await deleteUser(userId);

  return deletedUser;
}

//Database functions
export async function setRoleInDB(userId: string, role: string): Promise<User | UnauthorizedResponse> {
  return await prisma.user.update({
    where: { id: userId },
    data: { role: role }
  });
}

export async function getAllUsersFromDB(): Promise<User[]> {
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      lastLogin: true,
      loginAttempts: true,
    },
  })
}

export async function deleteUserFromDB(userId: string): Promise<User | UnauthorizedResponse> {
  return await prisma.user.delete({
    where: { id: userId },
  });
}