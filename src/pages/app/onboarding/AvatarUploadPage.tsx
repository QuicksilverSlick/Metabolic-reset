import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload, Loader2, ArrowRight, User } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { useUpdateProfile } from '@/hooks/use-queries';
import { uploadApi } from '@/lib/api';
import { toast } from 'sonner';

export default function AvatarUploadPage() {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const userId = useAuthStore(s => s.userId);
  const updateProfile = useUpdateProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.avatarUrl || null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select an image file (PNG, JPEG, GIF, or WebP)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    // Show preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    setUploading(true);
    try {
      // Get presigned URL
      const { key } = await uploadApi.getPresignedUrl(
        userId,
        file.name,
        file.type,
        file.size,
        'avatars'
      );

      // Upload file
      const result = await uploadApi.uploadFile(userId, key, file, file.type);

      // Update user profile with new avatar URL
      await updateProfile.mutateAsync({ avatarUrl: result.publicUrl });

      toast.success('Photo uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload photo');
      setPreviewUrl(user?.avatarUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const handleContinue = () => {
    navigate('/app/onboarding/final-video');
  };

  const handleSkip = () => {
    navigate('/app/onboarding/final-video');
  };

  const initials = user?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <div className="min-h-screen bg-[#0a1628] flex flex-col items-center justify-center p-4">
      <Card className="bg-slate-800/50 border-slate-700 max-w-md w-full">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">
              Add Your Profile Photo
            </h1>
            <p className="text-slate-400">
              Help your group leader and fellow participants recognize you
            </p>
          </div>

          {/* Avatar Preview */}
          <div className="flex justify-center mb-8">
            <div className="relative group">
              <Avatar className="h-32 w-32 border-4 border-slate-700">
                <AvatarImage src={previewUrl || undefined} alt={user?.name} />
                <AvatarFallback className="bg-slate-700 text-white text-3xl">
                  {previewUrl ? null : initials}
                </AvatarFallback>
              </Avatar>

              {/* Upload Overlay */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                {uploading ? (
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                ) : (
                  <Camera className="h-8 w-8 text-white" />
                )}
              </button>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Upload Button */}
          <Button
            variant="outline"
            className="w-full mb-4 border-slate-600 text-slate-300 hover:bg-slate-700"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                {previewUrl ? 'Change Photo' : 'Upload Photo'}
              </>
            )}
          </Button>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="ghost"
              className="flex-1 text-slate-400 hover:text-white"
              onClick={handleSkip}
              disabled={uploading}
            >
              Skip for now
            </Button>
            <Button
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
              onClick={handleContinue}
              disabled={uploading}
            >
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
