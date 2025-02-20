'use server'

//Get user roles
export async function getUserRoles(): Promise<string[]> {
  return ['USER', 'ADMIN', 'MODERATOR'];
}

//Check if a role is valid
export async function isValidRole(role: string): Promise<boolean> {
  const roles = await getUserRoles();
  return roles.includes(role);
}

// Validate user role
export async function validateUserRole(role: string): Promise<string> {
  const roles = await getUserRoles();
  if (!roles.includes(role)) {
    throw new Error(`Invalid user role: ${role}. Allowed roles are: ${roles.join(', ')}`);
  }
  return role;
}

// Server action to get default role
export async function getDefaultRole(): Promise<string> {
  return 'USER';
}

// Check if a user has admin privileges
export async function isAdmin(userRole?: string): Promise<boolean> {
  if (!userRole) return false;
  return userRole === 'ADMIN';
}

// Check if a user has moderator or admin privileges
export async function isAdminOrModerator(userRole?: string): Promise<boolean> {
  if (!userRole) return false;
  return ['ADMIN', 'MODERATOR'].includes(userRole);
}
