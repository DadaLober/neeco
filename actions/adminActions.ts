'use server'

import {
  deleteUserQuery,
  EditableUser,
  getAllApprovalRolesFromDB,
  getAllDepartmentsFromDB,
  getAllUsersQuery,
  updateUserQuery,
  UserWithRelations
} from './queries';
import { validateId, ActionResult } from '@/schemas';
import { ApprovalRole, Department } from '@prisma/client';
import { checkAdminAccess } from './roleActions';

export async function getAllUsers(): Promise<ActionResult<UserWithRelations[]>> {
  const adminError = await checkAdminAccess();
  if (adminError) {
    return { success: false, error: adminError };
  }

  try {
    const users = await getAllUsersQuery();
    return { success: true, data: users };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to fetch users'
      }
    };
  }
}

export async function deleteUser(userId: string): Promise<ActionResult<null>> {
  const adminError = await checkAdminAccess();
  if (adminError) {
    return { success: false, error: adminError };
  }

  const parsedId = validateId.safeParse(userId);
  if (!parsedId.success) {
    return {
      success: false,
      error: {
        code: 'INVALID_INPUT',
        message: 'Invalid ID format'
      }
    };
  }

  try {
    const deletedUser = await deleteUserQuery(userId);
    if (!deletedUser) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found'
        }
      };
    }
    return { success: true, data: null };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to delete user'
      }
    };
  }
}

export async function updateUser(userId: string, data: EditableUser): Promise<ActionResult<EditableUser>> {
  const adminError = await checkAdminAccess();
  if (adminError) {
    return { success: false, error: adminError };
  }

  const parsedId = validateId.safeParse(userId);
  if (!parsedId.success) {
    return {
      success: false,
      error: {
        code: 'INVALID_INPUT',
        message: 'Invalid ID format'
      }
    };
  }

  try {
    const updatedUser = await updateUserQuery(userId, data);
    if (!updatedUser) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found'
        }
      };
    }
    return { success: true, data: updatedUser };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to update user'
      }
    };
  }
}

export async function getAllDepartments(): Promise<ActionResult<Department[]>> {
  const adminError = await checkAdminAccess();
  if (adminError) {
    return { success: false, error: adminError };
  }

  try {
    const departments = await getAllDepartmentsFromDB();
    return { success: true, data: departments };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to fetch departments'
      }
    };
  }
}

export async function getAllApprovalRoles(): Promise<ActionResult<ApprovalRole[]>> {
  const adminError = await checkAdminAccess();
  if (adminError) {
    return { success: false, error: adminError };
  }

  try {
    const approvalRoles = await getAllApprovalRolesFromDB();
    return { success: true, data: approvalRoles };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to fetch approval roles'
      }
    };
  }
}