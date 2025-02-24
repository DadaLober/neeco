"use client";

// React and Next.js core imports
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Authentication and Session imports
import { signOut } from 'next-auth/react';
import { Session } from 'next-auth';

// Icons
import {
  Bell,
  Settings,
  LogOut,
  User,
} from 'lucide-react';

// UI Component imports
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

// Custom hooks and components
import { UserSettingsDialog } from './UserSettingsDialog';
import { ProfileDialog } from './ProfileDialog';
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs';

type HeaderProps = {
  session: Session | null;
};

export function Header({ session }: HeaderProps) {
  const breadcrumbs = useBreadcrumbs();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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
          <nav className="hidden xl:block" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-1 text-sm">
              {breadcrumbs.map((item, index) => (
                <li key={item.href} className="flex items-center">
                  {item.type === 'link' ? (
                    <Link
                      href={item.href}
                      className="text-gray-500 hover:text-[#008033] dark:text-gray-300 dark:hover:text-white transition-colors duration-200 flex items-center"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      className="text-[#008033] font-semibold dark:text-white"
                      aria-current="page"
                    >
                      {item.label}
                    </span>
                  )}
                  {index < breadcrumbs.length - 1 && (
                    <span className="mx-2 text-gray-400 dark:text-gray-600">/</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
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
          {session ? (
            <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={session?.user?.image || "/avatars/user.png"}
                      alt={session?.user?.name || "User"}
                    />
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
          ) : (
            <div className="text-sm text-gray-500">Not Signed In</div>
          )}

          {/* Profile Dialog */}
          {session && (
            <ProfileDialog
              isOpen={isProfileOpen}
              onOpenChange={handleProfileDialogChange}
              session={session}
            />
          )}

          {/* Settings Dialog */}
          {session && (
            <UserSettingsDialog
              isOpen={isSettingsOpen}
              onOpenChange={handleSettingsDialogChange}
              session={session}
            />
          )}
        </div>
      </div>
    </header>
  );
}
