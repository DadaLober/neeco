'use server';

import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { prisma } from '@/lib/prisma';

export async function updateUserProfile(formData: FormData) {
  const session = await auth();
  
  if (!session?.user) {
    return { error: 'Not authenticated' };
  }

  const avatarFile = formData.get('avatar') as File | null;
  const newName = formData.get('name') as string | null;

  let avatarPath = null;
  if (avatarFile && avatarFile.size > 0) {
    const bytes = await avatarFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create unique filename
    const filename = `${session.user.id}-${Date.now()}-${avatarFile.name}`;
    const path = join(process.cwd(), 'public', 'avatars', filename);
    
    // Ensure directory exists
    await writeFile(path, buffer);
    avatarPath = `/avatars/${filename}`;
  }

  // Update user in database
  const updatedUser = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(newName && { name: newName }),
      ...(avatarPath && { image: avatarPath }),
    },
  });

  // Revalidate the current path to update the UI
  revalidatePath('/dashboard');

  return { 
    user: updatedUser, 
    message: 'Profile updated successfully' 
  };
}
