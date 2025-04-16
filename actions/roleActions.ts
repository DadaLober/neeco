'use server';

import { ServerError, UserRoleSchema } from "@/schemas";
import { User } from "@prisma/client";
import { Session } from "next-auth";
import { getUserByIDFromDB } from "./queries";
import { TransformedDocument } from "@/app/(protected)/dashboard/documents/[id]/page";
import { auth } from "@/auth";

// Check if a user has admin privileges
export async function isAdmin(session: Session | null): Promise<boolean> {
  const role = UserRoleSchema.safeParse(session?.user.role);
  return role.success && role.data === "ADMIN";
}

// Check if a user has valid role
export async function isUserOrAdmin(session: Session | null): Promise<boolean> {
  const role = UserRoleSchema.safeParse(session?.user.role);
  return role.success && role.data === "USER" || role.data === "ADMIN";
}

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

// Get self object
export async function getSelf(session: Session | null): Promise<User | null> {
  if (!session) {
    return null;
  }
  const self = await getUserByIDFromDB(session.user.id);
  return self;
}

export async function checkUserRoleAndDept(document: TransformedDocument, currentUser: { id: string, role: string, approvalRoleId: number | null }) {
  const nextApprovalStep = document.approvalSteps.find(
    step => (step.status === "pending" || step.status === "in progress")
  );

  if (!nextApprovalStep) {
    return false;
  }
  const isCorrectRole = currentUser.approvalRoleId === nextApprovalStep.role.id;

  return isCorrectRole;
}