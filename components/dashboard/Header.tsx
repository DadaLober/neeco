'use client';

import { useState, useEffect } from 'react';
import {
  Bell,
  Settings,
  LogOut,
  User,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from 'next/image';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { UserSettings } from './UserSettings';
import { ProfileDialog } from './ProfileDialog';

export function Header() {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  const handleSettingsClick = () => {
    setIsDropdownOpen(false);
    setIsSettingsOpen(true);
  };

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    setIsProfileOpen(true);
  };

  const handleSettingsDialogChange = (open: boolean) => {
    setIsSettingsOpen(open);
    if (!open) {
      setTimeout(() => {
        setIsDropdownOpen(false);
      }, 100);
    }
  };

  const handleProfileDialogChange = (open: boolean) => {
    setIsProfileOpen(open);
    if (!open) {
      setTimeout(() => {
        setIsDropdownOpen(false);
      }, 100);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <header className="border-b bg-white dark:border-none dark:bg-[#008033]">
      <div className="flex h-16 items-center px-4 lg:px-8 justify-between">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="hidden xl:flex items-center justify-center rounded-lg">
              <Image
                src="/logo.png"
                alt="Neeco Logo"
                width={150}
                height={100}
                className="w-auto h-auto"
                priority
              />
            </div>
          </Link>
          <div className="hidden xl:flex h-6 w-px bg-gray-200 dark:bg-white/20 mx-2" />
          <h2 className="text-lg font-semibold text-[#008033] dark:text-white">
            Dashboard
          </h2>
        </div>

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

          {/* Avatar Dropdown */}
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatars/user.png" alt="User" />
                  <AvatarFallback className="bg-[#008033]/10 text-[#008033] dark:bg-white/10 dark:text-white">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {session?.user?.name || 'Guest'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session?.user?.email || 'No email'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onSelect={handleProfileClick}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleSettingsClick}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 dark:text-red-400"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile Dialog */}
          <ProfileDialog 
            isOpen={isProfileOpen} 
            onOpenChange={handleProfileDialogChange} 
          />

          {/* Settings Dialog */}
          <UserSettings 
            isOpen={isSettingsOpen} 
            onOpenChange={handleSettingsDialogChange} 
          />
        </div>
      </div>
    </header>
  );
}
