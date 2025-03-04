'use server'

import { prisma } from '@/lib/prisma';
import { requireAdmin } from './roleActions';
import { revalidatePath } from 'next/cache';

import { IdSchema, UserRoleSchema, UserStatusSchema } from '@/schemas';

export async function getAllUsers() {
  await requireAdmin();

  try {
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
      orderBy: { lastLogin: 'desc' }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Error fetching users');
  }
}

export async function updateUserRole(userId: string, newRole: string) {
  await requireAdmin();

  const parsedUserId = IdSchema.parse(userId);
  const parsedRole = UserRoleSchema.parse(newRole);

  try {
    const updatedUser = await prisma.user.update({
      where: { id: parsedUserId },
      data: { role: parsedRole }
    });

    revalidatePath('/admin');
    return updatedUser;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw new Error('Error updating user role');
  }
}

export async function updateUserStatus(userId: string, isActive: boolean) {
  await requireAdmin();

  const parsedUserId = IdSchema.parse(userId);
  const parsedIsActive = UserStatusSchema.parse(isActive);

  try {
    return await prisma.user.update({
      where: { id: parsedUserId },
      data: {
        isActive: parsedIsActive,
        ...(parsedIsActive && { loginAttempts: 0 })
      }
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    throw new Error('Error updating user status');
  }
}

export async function resetUserLoginAttempts(userId: string) {
  await requireAdmin();

  const parsedUserId = IdSchema.parse(userId);

  try {
    return await prisma.user.update({
      where: { id: parsedUserId },
      data: { loginAttempts: 0 }
    });
  } catch (error) {
    console.error('Error resetting user login attempts:', error);
    throw new Error('Error resetting user login attempts');
  }
}

export async function toggleUserActivation(userId: string) {
  await requireAdmin();

  const parsedUserId = IdSchema.parse(userId);

  try {
    const user = await prisma.user.findUnique({
      where: { id: parsedUserId }
    });

    if (!user) throw new Error('User not found');

    const updatedUser = await prisma.user.update({
      where: { id: parsedUserId },
      data: { isActive: !user.isActive }
    });

    revalidatePath('/admin');
    return updatedUser;
  } catch (error) {
    console.error('Error toggling user activation:', error);
    throw new Error('Error toggling user activation');
  }
}

export async function deleteUser(userId: string) {
  await requireAdmin();

  const parsedUserId = IdSchema.parse(userId);

  try {
    const deletedUser = await prisma.user.delete({
      where: { id: parsedUserId }
    });

    revalidatePath('/admin');
    return deletedUser;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new Error('Error deleting user');
  }
}
