'use client';

import { useState, useEffect } from 'react';
import {
  Bell,
  Settings,
  LogOut,
  Moon,
  Sun,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { signOut } from 'next-auth/react';

export function Header() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  if (!mounted) {
    return null;
  }

  return (
    <header className="border-b bg-white dark:border-none dark:bg-[#008033]">
      <div className="flex h-16 items-center px-4 justify-between">
        <h2 className="text-lg font-semibold text-[#008033] dark:text-white">
          Dashboard
        </h2>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-[#008033] hover:bg-[#008033]/10 dark:text-white dark:hover:bg-white/20"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
              2
            </span>
          </Button>

          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="text-[#008033] hover:bg-[#008033]/10 dark:text-white dark:hover:bg-white/20"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* Settings Modal */}
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-[#008033] hover:bg-[#008033]/10 dark:text-white dark:hover:bg-white/20"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Settings</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <h3 className="font-medium mb-2">Preferences</h3>
                <p className="text-sm text-muted-foreground">
                  More settings options coming soon...
                </p>
              </div>
            </DialogContent>
          </Dialog>

          {/* Logout */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-[#008033] hover:bg-[#008033]/10 dark:text-white dark:hover:bg-white/20"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
