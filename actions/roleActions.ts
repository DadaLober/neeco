'use server';

import { UserRoleSchema } from "@/schemas";
import { User } from "@prisma/client";
import { get } from "http";
import { Session } from "next-auth";
import { getUserByIDFromDB } from "./queries";

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

// Get self object
export async function getSelf(session: Session | null): Promise<User | null> {
  if (!session) {
    return null;
  }
  const self = await getUserByIDFromDB(session.user.id);
  return self;
}