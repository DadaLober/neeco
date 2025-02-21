'use client';

import { useState } from 'react';
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
import { User, Camera, Save, X, Edit, Check } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { updateUserProfile } from '@/actions/profileActions';

interface ProfileDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDialog({ isOpen, onOpenChange }: ProfileDialogProps) {
  const { data: session, update } = useSession();
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
    const formData = new FormData();
    
    // Add name if changed
    if (editedName !== name) {
      formData.append('name', editedName);
    }

    // Add avatar if exists
    if (avatarPreview) {
      const avatarFile = await fetch(avatarPreview)
        .then(r => r.blob())
        .then(blob => new File([blob], 'avatar.jpg', { type: 'image/jpeg' }));
      formData.append('avatar', avatarFile);
    }

    try {
      const result = await updateUserProfile(formData);
      
      // Update local session if server action was successful
      if (result.user) {
        await update({
          name: result.user.name || undefined,
          image: result.user.image || undefined
        });
        
        // Reset editing states
        setIsNameEditing(false);
        setAvatarPreview(null);
        
        // Close dialog
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Profile update failed:', error);
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
                  src={avatarPreview || session?.user?.image || "/avatars/user.png"} 
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
