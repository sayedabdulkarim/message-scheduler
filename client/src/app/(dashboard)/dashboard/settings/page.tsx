'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { User, Mail, Lock, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/lib/api';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);

  const handlePasswordReset = async () => {
    if (!user?.email) return;

    setIsLoading(true);
    try {
      await authApi.forgotPassword(user.email);
      setForgotPasswordSent(true);
      toast.success('Password reset email sent!');
    } catch {
      toast.error('Failed to send password reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings
        </p>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Your account details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={user?.name || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="flex gap-2">
                <Input value={user?.email || ''} disabled />
                {user?.isEmailVerified && (
                  <span className="flex items-center text-xs text-green-600 bg-green-50 px-2 rounded">
                    Verified
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Password
          </CardTitle>
          <CardDescription>
            Change your password
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            To change your password, we&apos;ll send a password reset link to your email.
          </p>
          {forgotPasswordSent ? (
            <div className="p-4 bg-green-50 text-green-800 rounded-lg">
              <p className="text-sm">
                Password reset email sent to <strong>{user?.email}</strong>.
                Check your inbox and follow the instructions.
              </p>
            </div>
          ) : (
            <Button onClick={handlePasswordReset} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Password Reset Email
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Connected Platforms Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Connected Platforms
          </CardTitle>
          <CardDescription>
            Manage your connected messaging platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            You can manage your connected platforms from the Platforms page.
          </p>
          <Button variant="outline" asChild>
            <a href="/dashboard/platforms">Go to Platforms</a>
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Delete Account</h4>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => {
                toast.error('Account deletion is not implemented in this demo');
              }}
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
