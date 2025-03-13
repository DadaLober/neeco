'use server';

import { revalidatePath } from 'next/cache';
import { writeFile, mkdir } from 'fs/promises';
import { join, basename } from 'path';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';
import { isUserOrAdmin } from './roleActions';

const nameSchema = z.string().min(1).max(100);
const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];

export async function updateUserProfile(formData: FormData) {
  const session = await auth();

  if (!(await isUserOrAdmin(session)) || !session) {
    return { error: 'Unauthorized' };
  }

  const avatarFile = formData.get('avatar') as File | null;
  const newName = formData.get('name') as string | null;
  const parsedName = newName ? nameSchema.safeParse(newName) : null;

  if (parsedName && !parsedName.success) {
    return { error: 'Invalid name input' };
  }

  let avatarPath = null;

  try {
    if (avatarFile && avatarFile.size > 0) {
      if (!allowedImageTypes.includes(avatarFile.type)) {
        return { error: 'Invalid image format. Only JPG, PNG, and WEBP allowed.' };
      }

      const bytes = await avatarFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const filename = `${session.user.id}-${Date.now()}-${basename(
        avatarFile.name.replace(/[^a-zA-Z0-9.]/g, '_')
      )}`;
      const uploadDir = join(process.cwd(), 'public', 'avatars');

      await mkdir(uploadDir, { recursive: true }); // Ensure directory exists
      const path = join(uploadDir, filename);

      await writeFile(path, buffer);
      avatarPath = `/avatars/${filename}`;
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(newName && { name: newName }),
        ...(avatarPath && { image: avatarPath }),
      },
    });

    revalidatePath('/dashboard');

    return {
      user: updatedUser,
      message: 'Profile updated successfully',
    };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { error: 'Error updating user profile' };
  }
}
