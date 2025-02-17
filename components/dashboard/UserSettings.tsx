'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Moon, Sun } from 'lucide-react';

export function UserSettings({
  isOpen, 
  onOpenChange
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(false);
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {/* Appearance Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Appearance</h3>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant={theme === 'light' ? 'green' : 'greenOutline'}
                onClick={() => setTheme('light')}
                className="flex items-center justify-center gap-2"
              >
                <Sun className="h-4 w-4" />
                Light Mode
              </Button>
              <Button 
                variant={theme === 'dark' ? 'green' : 'greenOutline'}
                onClick={() => setTheme('dark')}
                className="flex items-center justify-center gap-2"
              >
                <Moon className="h-4 w-4" />
                Dark Mode
              </Button>
            </div>
          </div>

          {/* Notification Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="email-notifications" className="text-sm">Email Notifications</label>
                <Switch 
                  id="email-notifications"
                  checked={emailNotificationsEnabled}
                  onCheckedChange={setEmailNotificationsEnabled}
                />
              </div>
              <div className="flex items-center justify-between">
                <label htmlFor="push-notifications" className="text-sm">Push Notifications</label>
                <Switch 
                  id="push-notifications"
                  checked={pushNotificationsEnabled}
                  onCheckedChange={setPushNotificationsEnabled}
                />
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Account</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-xs text-muted-foreground">
                    {session?.user?.email || 'No email'}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Change
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Password</p>
                  <p className="text-xs text-muted-foreground">
                    ********
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Change
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <label htmlFor="two-factor-auth" className="text-sm">Two-Factor Authentication</label>
                <Switch 
                  id="two-factor-auth"
                  checked={false}
                  onCheckedChange={() => {/* TODO: Implement 2FA toggle logic */}}
                />
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-[#008033]/10 p-4 rounded-lg border border-[#008033]/20">
            <h3 className="text-lg font-semibold text-[#008033] mb-3">Danger Zone</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#008033]">Delete Account</p>
                  <p className="text-xs text-muted-foreground">
                    Permanently delete your account and all associated data
                  </p>
                </div>
                <Button 
                  variant="green" 
                  size="sm" 
                  className="bg-[#008033] text-white hover:bg-[#008033]/90"
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
