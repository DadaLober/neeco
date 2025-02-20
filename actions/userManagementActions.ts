'use server'

import { auth } from '@/auth';
import { isAdmin } from './roleActions';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getAllUsers() {
  const session = await auth();
  const userRole = session?.user?.role;

  if (!(await isAdmin(userRole))) {
    throw new Error('Unauthorized: Admin access required');
  }

  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      lastLogin: true,
      loginAttempts: true,
    },
    orderBy: { lastLogin: 'desc' }
  });
}

export async function updateUserRole(userId: string, newRole: string) {
  const session = await auth();
  const userRole = session?.user?.role;

  if (!(await isAdmin(userRole))) {
    throw new Error('Unauthorized: Admin access required');
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role: newRole }
  });

  revalidatePath('/admin');
  return updatedUser;
}

export async function toggleUserActivation(userId: string) {
  const session = await auth();
  const userRole = session?.user?.role;

  if (!(await isAdmin(userRole))) {
    throw new Error('Unauthorized: Admin access required');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new Error('User not found');
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { isActive: !user.isActive }
  });

  revalidatePath('/admin');
  return updatedUser;
}

export async function deleteUser(userId: string) {
  const session = await auth();
  const userRole = session?.user?.role;

  if (!(await isAdmin(userRole))) {
    throw new Error('Unauthorized: Admin access required');
  }

  const deletedUser = await prisma.user.delete({
    where: { id: userId }
  });

  revalidatePath('/admin');
  return deletedUser;
}
