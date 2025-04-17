'use client';

// React core imports
import React, { useState, useEffect } from 'react';

// Icons
import { User as UserIcon, Camera, Save, X, Edit, Check, AlertCircle } from 'lucide-react';

// UI Component imports
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Server action imports
import { updateUserProfile } from '@/actions/profileActions';

interface ProfileDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    name: string;
    email: string;
    avatar: string;
  }
}

export function ProfileDialog({ isOpen, onOpenChange, user }: ProfileDialogProps) {
  const [name, setName] = useState(user?.name || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isNameEditing, setIsNameEditing] = useState(false);
  const [editedName, setEditedName] = useState(name);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when user changes or dialog opens
  useEffect(() => {
    if (isOpen) {
      setName(user?.name || '');
      setEditedName(user?.name || '');
      setAvatarPreview(null);
      setValidationError(null);
      setIsNameEditing(false);
    }
  }, [isOpen, user]);

  const validateName = (value: string): boolean => {
    if (!value.trim()) {
      setValidationError("Name cannot be empty");
      return false;
    }

    if (value.length > 50) {
      setValidationError("Name must be less than 50 characters");
      return false;
    }

    setValidationError(null);
    return true;
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        setValidationError("Image size must be less than 2MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        setValidationError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNameEditToggle = () => {
    if (isNameEditing) {
      // Validate and save the edited name
      if (validateName(editedName)) {
        setName(editedName);
        setIsNameEditing(false);
      }
    } else {
      // Start editing
      setEditedName(name);
      setIsNameEditing(true);
      setValidationError(null);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedName(e.target.value);
    if (validationError) {
      validateName(e.target.value);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleSave = async () => {
    // Final validation before submission
    if (!validateName(name)) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // Add name to form data if changed
      if (name !== user?.name) {
        formData.append('name', name);
      }

      // Add avatar to form data if a new image is selected
      if (avatarPreview) {
        const response = await fetch(avatarPreview);
        const blob = await response.blob();
        formData.append('avatar', blob, 'avatar.jpg');
      }

      // Call server action to update profile
      const result = await updateUserProfile(formData);

      if (!result.success) {
        setValidationError(`Failed to update profile: ${result.error}`);
        return;
      }

      // Close the dialog
      onOpenChange(false);
    } catch (error) {
      setValidationError(`Failed to update profile: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile picture and name.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {validationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                {/* Show preview if available, otherwise show current image */}
                <AvatarImage
                  src={avatarPreview || user?.avatar || ""}
                  alt="Profile Picture"
                />
                <AvatarFallback className="bg-[#008033]/10 text-[#008033]">
                  <UserIcon className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-[#008033] text-white rounded-full p-2 cursor-pointer hover:bg-[#006629] transition-colors"
              >
                <Camera className="h-4 w-4" />
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>

            <div className="grid w-full max-w-sm items-center gap-1.5 relative">
              <Label htmlFor="name">Name</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="name"
                  value={isNameEditing ? editedName : name}
                  disabled={!isNameEditing}
                  onChange={handleNameChange}
                  className="flex-grow"
                  placeholder="Enter your name"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNameEditToggle}
                  className="text-[#008033] hover:bg-[#008033]/10"
                >
                  {isNameEditing ? <Check className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            <X className="mr-2 h-4 w-4" /> Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSubmitting || !!validationError}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}