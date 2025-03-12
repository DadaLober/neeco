'use server';

import { UserRoleSchema } from "@/schemas";
import { Session } from "next-auth";

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