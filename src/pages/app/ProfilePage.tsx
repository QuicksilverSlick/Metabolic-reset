import React, { useRef, useState } from 'react';
import { useUser, useUpdateProfile } from '@/hooks/use-queries';
import { useAuthStore } from '@/lib/auth-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, LogOut, Shield, Award, Copy, Camera, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { uploadApi } from '@/lib/api';

export function ProfilePage() {
  const { data: user, isLoading } = useUser();
  const logout = useAuthStore(s => s.logout);
  const userId = useAuthStore(s => s.userId);
  const updateProfile = useUpdateProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Get user initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Handle avatar file selection
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload an image file (PNG, JPEG, GIF, or WebP)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      // Get presigned URL for avatar upload
      const { key } = await uploadApi.getPresignedUrl(
        userId,
        file.name,
        file.type,
        file.size,
        'avatars'
      );

      // Upload the file
      const result = await uploadApi.uploadFile(userId, key, file, file.type);

      // Update user profile with new avatar URL
      await updateProfile.mutateAsync({ avatarUrl: result.publicUrl });
    } catch (error) {
      console.error('Avatar upload failed:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
      </div>
    );
  }
  if (!user) return null;
  const copyReferralCode = () => {
    navigator.clipboard.writeText(user.referralCode);
    toast.success('Referral code copied to clipboard!');
  };
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-3xl font-display font-bold text-navy-900 dark:text-white">My Profile</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Info Card */}
        <Card className="md:col-span-2 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm transition-colors">
          <CardHeader>
            <CardTitle className="text-navy-900 dark:text-white">Personal Information</CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">Your account details and contact info.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-6">
              <div className="relative group">
                <Avatar className="h-24 w-24 border-4 border-gold/20 dark:border-gold/30">
                  {user.avatarUrl ? (
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                  ) : null}
                  <AvatarFallback className="bg-gold-100 dark:bg-gold-900/50 text-gold-700 dark:text-gold-300 text-2xl font-bold">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                {/* Upload overlay */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  {isUploading ? (
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  ) : (
                    <Camera className="h-6 w-6 text-white" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/gif,image/webp"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-navy-900 dark:text-white">{user.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="mt-3 border-navy-200 dark:border-navy-700 text-navy-700 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      {user.avatarUrl ? 'Change Photo' : 'Upload Photo'}
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-navy-800">
              <div className="space-y-2">
                <Label className="text-navy-900 dark:text-slate-200">Full Name</Label>
                <Input
                  value={user.name}
                  readOnly
                  className="bg-slate-50 dark:bg-navy-950 border-slate-200 dark:border-navy-800 text-navy-900 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-navy-900 dark:text-slate-200">Email Address</Label>
                <Input
                  value={user.email}
                  readOnly
                  className="bg-slate-50 dark:bg-navy-950 border-slate-200 dark:border-navy-800 text-navy-900 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-navy-900 dark:text-slate-200">Phone Number</Label>
                <Input
                  value={user.phone}
                  readOnly
                  className="bg-slate-50 dark:bg-navy-950 border-slate-200 dark:border-navy-800 text-navy-900 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-navy-900 dark:text-slate-200">Timezone</Label>
                <Input
                  value={user.timezone}
                  readOnly
                  className="bg-slate-50 dark:bg-navy-950 border-slate-200 dark:border-navy-800 text-navy-900 dark:text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Status Card */}
        <Card className="border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm dark:shadow-[0_4px_20px_-2px_rgba(15,23,42,0.5)] transition-colors">
          <CardHeader>
            <CardTitle className="text-navy-900 dark:text-white">Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-gold-100 dark:bg-gold-900/30 p-2 rounded-lg">
                <Shield className="h-5 w-5 text-gold-600 dark:text-gold-400" />
              </div>
              <div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Role</div>
                <div className="font-bold capitalize text-navy-900 dark:text-white">{user.role}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                <Award className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Total Points</div>
                <div className="font-bold text-navy-900 dark:text-white">{user.points}</div>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-navy-800">
              <Label className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Referral Code</Label>
              <div className="mt-1 flex gap-2">
                <div className="flex-1 bg-slate-100 dark:bg-navy-950 rounded px-3 py-2 font-mono font-bold text-center text-navy-900 dark:text-white border border-slate-200 dark:border-navy-800">
                  {user.referralCode}
                </div>
                <Button variant="outline" size="icon" onClick={copyReferralCode} className="border-slate-200 dark:border-navy-700 dark:text-slate-300 dark:hover:bg-navy-800">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="destructive" className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-900 dark:hover:bg-red-800" onClick={() => logout()}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}