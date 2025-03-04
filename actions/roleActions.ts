'use server';

import { auth } from "@/auth";
import { UserRoleSchema } from "@/schemas";

// Get user roles
export async function getUserRoles(): Promise<string[]> {
  return UserRoleSchema.options;
}

// Check if a role is valid
export async function isValidRole(role: string): Promise<boolean> {
  return UserRoleSchema.safeParse(role).success;
}

// Validate user role and return the validated role
export async function isAdmin(userRole?: string): Promise<boolean> {
  if (!userRole) return false;
  return userRole === "ADMIN";
}

// Check if a user has moderator or admin privileges
export async function isAdminOrModerator(userRole?: string): Promise<boolean> {
  if (!userRole) return false;
  return ["ADMIN", "MODERATOR"].includes(userRole);
}

// Check if a user has admin privileges
export async function requireAdmin() {
  const session = await auth();
  const userRole = session?.user?.role;
  if (!(await isAdmin(userRole))) {
    throw new Error("Unauthorized: Admin access required");
  }
}

// Check if a user has valid permissions
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized: Authentication required");
  }

  if (!(await isValidRole(session.user.role))) {
    throw new Error("Unauthorized: Insufficient permissions");
  }

  return session;
}
