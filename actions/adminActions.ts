'use server'

import { prisma } from '@/lib/prisma';
import { requireAdmin } from './roleActions';
import { revalidatePath } from 'next/cache';

export async function getAllUsers() {
  await requireAdmin();

  try {
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
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching users');
  }
}

export async function updateUserRole(userId: string, newRole: string) {
  await requireAdmin();

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole }
    });

    revalidatePath('/admin');
    return updatedUser;
  } catch (error) {
    console.error(error);
    throw new Error('Error updating user role');
  }
}

export async function updateUserStatus(userId: string, isActive: boolean) {
  await requireAdmin();

  try {
    return prisma.user.update({
      where: { id: userId },
      data: {
        isActive,
        ...(isActive && { loginAttempts: 0 })
      }
    });
  } catch (error) {
    console.error(error);
    throw new Error('Error updating user status');
  }
}

export async function resetUserLoginAttempts(userId: string) {
  await requireAdmin();

  try {
    return prisma.user.update({
      where: { id: userId },
      data: {
        loginAttempts: 0,
      }
    });
  } catch (error) {
    console.error(error);
    throw new Error('Error resetting user login attempts');
  }
}

export async function toggleUserActivation(userId: string) {
  await requireAdmin();

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) return null;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive }
    });

    revalidatePath('/admin');
    return updatedUser;
  } catch (error) {
    console.error(error);
    throw new Error('Error toggling user activation');
  }
}

export async function deleteUser(userId: string) {
  await requireAdmin();

  try {
    const deletedUser = await prisma.user.delete({
      where: { id: userId }
    });

    revalidatePath('/admin');
    return deletedUser;

  } catch (error) {
    console.error(error);
    throw new Error('Error deleting user');
  }
}
