import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Camera,
  Upload,
  Check,
  Loader2,
  ArrowRight,
  User,
  AlertCircle,
  Phone,
  Shield,
} from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { userApi, uploadApi } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function ProfilePhotoPage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();

  const [profilePhoto, setProfilePhoto] = useState<string | null>(user?.avatarUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Upload to R2
      const key = `avatars/${user.id}/${Date.now()}-${file.name}`;
      const result = await uploadApi.uploadFile(user.id, key, file, file.type);

      // Update user profile with new avatar URL
      const updatedUser = await userApi.updateProfile(user.id, { avatarUrl: result.publicUrl });
      setProfilePhoto(result.publicUrl);
      updateUser(updatedUser);
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Failed to upload photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [user, updateUser]);

  const handleContinue = () => {
    // Go to phone verification step
    navigate('/app/onboarding/verify');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center p-4">
        <Card className="bg-slate-800/50 border-slate-700 max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-slate-300">Please log in to continue.</p>
            <Button className="mt-4" onClick={() => navigate('/login')}>
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1628] flex flex-col">
      {/* Progress Header */}
      <div className="py-6 px-4 border-b border-slate-800">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="h-4 w-4 text-white" />
              </div>
              <span className="ml-2 text-sm text-slate-400 hidden sm:inline">Payment</span>
            </div>
            <div className="w-8 sm:w-12 h-0.5 bg-gold-500"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gold-500 flex items-center justify-center">
                <Camera className="h-4 w-4 text-navy-900" />
              </div>
              <span className="ml-2 text-sm text-white font-medium hidden sm:inline">Photo</span>
            </div>
            <div className="w-8 sm:w-12 h-0.5 bg-navy-700"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-navy-700 flex items-center justify-center">
                <Phone className="h-4 w-4 text-slate-500" />
              </div>
              <span className="ml-2 text-sm text-slate-500 hidden sm:inline">Verify</span>
            </div>
            <div className="w-8 sm:w-12 h-0.5 bg-navy-700"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-navy-700 flex items-center justify-center">
                <span className="text-xs text-slate-500">4</span>
              </div>
              <span className="ml-2 text-sm text-slate-500 hidden sm:inline">Start</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="max-w-lg w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Add Your Profile Photo
            </h1>
            <p className="text-slate-400">
              Help your group leader and fellow participants recognize you
            </p>
          </div>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6 space-y-6">
              {/* Profile Photo Upload */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "relative w-32 h-32 rounded-full overflow-hidden cursor-pointer group mb-4",
                    "bg-slate-700 border-4 border-dashed border-slate-600 hover:border-gold-500 transition-colors"
                  )}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {profilePhoto ? (
                    <img
                      src={profilePhoto}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="h-14 w-14 text-slate-500" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {isUploading ? (
                      <Loader2 className="h-8 w-8 text-white animate-spin" />
                    ) : (
                      <Camera className="h-8 w-8 text-white" />
                    )}
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="border-gold-500/50 text-gold-400 hover:bg-gold-500/10 hover:border-gold-500 hover:text-gold-300 transition-all duration-200"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      {profilePhoto ? 'Change Photo' : 'Upload Photo'}
                    </>
                  )}
                </Button>
                <p className="text-slate-500 text-xs mt-2">JPG, PNG, or GIF. Max 5MB.</p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg">
                  <p className="text-red-400 text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </p>
                </div>
              )}

              {/* Next Step Preview */}
              <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-gold-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">Next: Secure Your Account</p>
                    <p className="text-slate-400 text-xs">
                      We'll verify your phone so you can log in securely
                    </p>
                  </div>
                </div>
              </div>

              {/* Continue Button */}
              <Button
                onClick={handleContinue}
                disabled={isUploading}
                className="w-full bg-gold-500 hover:bg-gold-600 text-navy-900 py-6 text-lg font-bold rounded-xl"
              >
                Continue
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              {/* Skip Option - only skips photo, not verification */}
              {!profilePhoto && (
                <div className="text-center">
                  <button
                    onClick={handleContinue}
                    className="text-slate-500 text-sm hover:text-slate-400 transition-colors"
                  >
                    Skip photo for now
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
