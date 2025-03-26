'use client';

// React core imports
import { useState } from 'react';

// Authentication and Theme imports
import { setup2FA, verify2FA, disable2FA } from "@/actions/twoFactorAuth";
import { useTheme } from 'next-themes';
import Image from "next/image";

// Icons
import { Moon, Sun } from 'lucide-react';

// UI Component imports
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

import { User } from "@prisma/client";

interface UserSettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    name: string;
    email: string;
    avatar: string;
    is2FAEnabled?: boolean;
  }
}

export function SettingsDialog({ isOpen, onOpenChange, user }: UserSettingsDialogProps) {
  const { setTheme } = useTheme();
  const [twoFactorAuthEnabled, setTwoFactorAuthEnabled] = useState(user?.is2FAEnabled || false);
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [showQRDialog, setShowQRDialog] = useState(false);
  // const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(false);

  async function handle2FAToggle(enabled: boolean) {
    try {
      setLoading(true);
      if (enabled) {
        const response = await setup2FA();

        if ('error' in response) {
          throw new Error(response.error);
        }
        setQrCode(response.qrCodeDataURL);
        setShowQRDialog(true);
      } else {
        await disable2FA();
        setQrCode(null);
        setTwoFactorAuthEnabled(false);
        setShowQRDialog(false);
      }
    } catch (error) {
      console.error('Failed to toggle 2FA:', error);
    }
    finally {
      setLoading(false);
    }
  }

  async function handleVerifyOTP() {
    try {
      setLoading(true);
      const response = await verify2FA(otp);

      if ('error' in response) {
        throw new Error(response.error);
      }

      setTwoFactorAuthEnabled(true);
      setQrCode(null);
    } catch (error) {
      // Use the error variable in the alert
      alert(error instanceof Error ? error.message : "Incorrect OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

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
                variant="outline"
                onClick={() => setTheme('light')}
                className="flex items-center justify-center gap-2"
              >
                <Sun className="h-4 w-4" />
                Light Mode
              </Button>
              <Button
                variant="default"
                onClick={() => setTheme('dark')}
                className="flex items-center justify-center gap-2"
              >
                <Moon className="h-4 w-4" />
                Dark Mode
              </Button>
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
                    {user?.email || 'No email'}
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
              </div>
              {/* <div className="flex items-center justify-between">
                <label htmlFor="email-notifications" className="text-sm">Email Notifications</label>
                <Switch
                  id="email-notifications"
                  checked={emailNotificationsEnabled}
                  onCheckedChange={setEmailNotificationsEnabled}
                />
              </div> */}
              <div className="flex items-center justify-between">
                <label htmlFor="two-factor-auth" className="text-sm">Two-Factor Authentication</label>
                <Switch
                  id="two-factor-auth"
                  checked={twoFactorAuthEnabled}
                  onCheckedChange={(checked) => handle2FAToggle(checked)}
                  disabled={loading}
                />
              </div>

              {/* Two-Factor Authentication QR*/}
              {qrCode && (
                <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
                  <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                      <DialogTitle className='text-center'>Two-Factor Authentication</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col items-center">
                      <p className="text-sm text-center mb-4">Scan this QR code with Google Authenticator:</p>
                      <div className="relative w-[200px] h-[200px]">
                        <Image
                          src={qrCode}
                          alt="2FA QR Code"
                          width={200}
                          height={200}
                          className="object-contain"
                        />
                      </div>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="border p-2 mt-4 w-full max-w-[200px] rounded-md"
                        placeholder="Enter OTP"
                      />
                      <Button
                        onClick={handleVerifyOTP}
                        className="mt-4 w-full max-w-[200px]"
                        variant="default"
                      >
                        Verify
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
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
                  variant="default"
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
