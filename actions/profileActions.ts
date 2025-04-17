'use server';

import { z } from 'zod';
import { join, basename } from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { ActionResult } from '@/schemas';
import { isUserOrAdmin } from './roleActions';

// Configuration
const AVATAR_UPLOAD_DIR = process.env.AVATAR_UPLOAD_DIR ?? join(process.cwd(), 'public', 'avatars');
const AVATAR_BASE_URL = process.env.AVATAR_BASE_URL ?? '/avatars';

const nameSchema = z.string().min(1).max(100);
const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Updates user profile information including name and avatar
 */
export async function updateUserProfile(
  formData: FormData
): Promise<ActionResult<{ message: string }>> {
  const session = await auth();

  // Authorization check
  if (!(await isUserOrAdmin(session)) || !session) {
    return {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Unauthorized access',
      },
    };
  }

  // Input parsing and validation
  const avatarFile = formData.get('avatar') as File | null;
  const newName = formData.get('name') as string | null;
  const parsedName = newName ? nameSchema.safeParse(newName) : null;

  if (parsedName && !parsedName.success) {
    return {
      success: false,
      error: {
        code: 'INVALID_INPUT',
        message: 'Name must be between 1 and 100 characters',
      },
    };
  }

  let avatarPath: string | null = null;

  try {
    // Handle avatar upload if present
    if (avatarFile && avatarFile.size > 0) {
      if (!allowedImageTypes.includes(avatarFile.type)) {
        return {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Invalid image format. Only JPG, PNG, and WEBP allowed.',
          },
        };
      }

      const bytes = await avatarFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const filename = `${session.user.id}-${Date.now()}-${basename(
        avatarFile.name.replace(/[^a-zA-Z0-9.]/g, '_')
      )}`;

      await mkdir(AVATAR_UPLOAD_DIR, { recursive: true });
      const filePath = join(AVATAR_UPLOAD_DIR, filename);
      await writeFile(filePath, buffer);

      avatarPath = `${AVATAR_BASE_URL}/${filename}`;
    }

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(newName && { name: newName }),
        ...(avatarPath && { image: avatarPath }),
      },
    });

    revalidatePath('/dashboard');

    return {
      success: true,
      data: {
        message: 'Profile updated successfully',
      },
    };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return {
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to update profile',
      },
    };
  }
}