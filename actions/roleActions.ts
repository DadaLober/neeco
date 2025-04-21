'use server';

import { ServerError, UserRoleSchema, ActionResult } from "@/schemas";
import { Session } from "next-auth";
import { getUserByIDQuery, DocumentWithRelations, UserWithRelations } from "./queries";
import { auth } from "@/auth";

/**
 * Check if a user has admin privileges
 */
export async function isAdmin(session: Session | null): Promise<boolean> {
  const role = UserRoleSchema.safeParse(session?.user.role);
  return role.success && role.data === "ADMIN";
}

/**
 * Check if a user has valid user or admin role
 */
export async function isUserOrAdmin(session: Session | null): Promise<boolean> {
  const role = UserRoleSchema.safeParse(session?.user.role);
  return role.success && (role.data === "USER" || role.data === "ADMIN");
}

/**
 * Verifies the current user has admin access
 * Returns null if authorized, or an error if unauthorized
 */
export async function checkAdminAccess(): Promise<ServerError | null> {
  const session = await auth();
  if (!(await isAdmin(session))) {
    return {
      code: 'UNAUTHORIZED',
      message: 'Admin access required',
    };
  }
  return null;
}

/**
 * Verifies the current user has user-level access
 * Returns Session  if authorized, or an error if unauthorized
 */
export async function checkUserAccess(): Promise<ActionResult<Session>> {
  const session = await auth();
  if (!(await isUserOrAdmin(session)) || !session) {
    return {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'User access required'
      }
    };
  }
  return { success: true, data: session };
}

/**
 * Retrieves the current user's full profile
 */
export async function getSelf(): Promise<ActionResult<UserWithRelations | null>> {
  const session = await auth();
  if (!session) {
    return {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'No active session'
      }
    };
  }

  try {
    const self = await getUserByIDQuery(session.user.id);
    return { success: true, data: self };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to fetch user data'
      }
    };
  }
}

/**
 * Checks if the current user has the correct role for the next approval step
 */
export async function checkUserRoleAndDept(
  document: DocumentWithRelations,
  currentUser: { id: string, role: string, approvalRoleId: number | null }
): Promise<boolean> {
  const nextApprovalStep = document.approvalSteps.find(
    step => (step.status === "pending" || step.status === "in progress")
  );

  if (!nextApprovalStep) {
    return false;
  }

  return currentUser.approvalRoleId === nextApprovalStep.role.id;
}