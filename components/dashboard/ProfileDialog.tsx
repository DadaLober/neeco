'use client';

// React core imports
import React, { useState } from 'react';

// Authentication and Session imports
import { Session } from 'next-auth';

// Icons
import { User, Camera, Save, X, Edit, Check } from 'lucide-react';

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

// Server action imports
import { updateUserProfile } from '@/actions/profileActions';

interface ProfileDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  session: Session | null;
}

export function ProfileDialog({ isOpen, onOpenChange, session }: ProfileDialogProps) {
  const [name, setName] = useState(session?.user?.name || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isNameEditing, setIsNameEditing] = useState(false);
  const [editedName, setEditedName] = useState(name);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNameEditToggle = () => {
    if (isNameEditing) {
      // Save the edited name
      setName(editedName);
      setIsNameEditing(false);
    } else {
      // Start editing
      setEditedName(name);
      setIsNameEditing(true);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedName(e.target.value);
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();

      // Add name to form data if changed
      if (name !== session?.user?.name) {
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

      if (result.error) {
        console.error('Failed to update profile', result.error);
        return;
      }

      // Close the dialog
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update profile', error);
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
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={session?.user?.image || ""}
                  alt="Profile Picture"
                />
                <AvatarFallback className="bg-[#008033]/10 text-[#008033]">
                  <User className="h-8 w-8" />
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
            onClick={() => onOpenChange(false)}
          >
            <X className="mr-2 h-4 w-4" /> Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
