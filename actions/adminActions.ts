'use server'

import {
  deleteUserQuery,
  EditableUser,
  getAllApprovalRolesQuery,
  getAllDepartmentsQuery,
  getAllUsersQuery,
  updateUserQuery,
  UserWithRelations
} from './queries';
import { validateId, ActionResult } from '@/schemas';
import { ApprovalRole, Department } from '@prisma/client';
import { checkAdminAccess } from './roleActions';

/**
 * Retrieves all users with their relations from the database
 */
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

/**
 * Deletes a specific user by ID
 */
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

/**
 * Updates user information by ID
 */
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

/**
 * Retrieves all departments from the database
 */
export async function getAllDepartments(): Promise<ActionResult<Department[]>> {
  const adminError = await checkAdminAccess();
  if (adminError) {
    return { success: false, error: adminError };
  }

  try {
    const departments = await getAllDepartmentsQuery();
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

/**
 * Retrieves all approval roles from the database
 */
export async function getAllApprovalRoles(): Promise<ActionResult<ApprovalRole[]>> {
  const adminError = await checkAdminAccess();
  if (adminError) {
    return { success: false, error: adminError };
  }

  try {
    const approvalRoles = await getAllApprovalRolesQuery();
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