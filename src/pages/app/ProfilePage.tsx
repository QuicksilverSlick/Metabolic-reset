import React, { useRef, useState } from 'react';
import { useUser, useUpdateProfile, useOpenProjects, useMyActiveEnrollment } from '@/hooks/use-queries';
import { useAuthStore } from '@/lib/auth-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, LogOut, Shield, Award, Copy, Camera, Upload, Sparkles, Check, Link, ShoppingCart, Save, ExternalLink, Pencil, X } from 'lucide-react';
import { toast } from 'sonner';
import { uploadApi } from '@/lib/api';
import { formatPhoneDisplay, toE164 } from '@/lib/phone-utils';

// Common US timezones
const US_TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Phoenix', label: 'Arizona (MST)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' },
];

export function ProfilePage() {
  const { data: user, isLoading } = useUser();
  const logout = useAuthStore(s => s.logout);
  const userId = useAuthStore(s => s.userId);
  const updateProfile = useUpdateProfile();
  const { data: openProjects } = useOpenProjects();
  const { data: activeEnrollment } = useMyActiveEnrollment();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [projectSelectorOpen, setProjectSelectorOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [cartLink, setCartLink] = useState(user?.cartLink || '');
  const [isSavingCartLink, setIsSavingCartLink] = useState(false);

  // Editable profile fields
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editTimezone, setEditTimezone] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

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

  // Generate quiz link with referral code and optional project
  const generateQuizLink = (projectId?: string | null) => {
    if (!user?.referralCode) return '';
    const params = new URLSearchParams();
    params.set('ref', user.referralCode);
    if (projectId) {
      params.set('project', projectId);
    }
    return `${window.location.origin}/quiz?${params.toString()}`;
  };

  const copyQuizLink = (projectId?: string | null) => {
    if (!user?.referralCode) return;
    const link = generateQuizLink(projectId);
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    toast.success('Quiz link copied to clipboard!');
    setProjectSelectorOpen(false);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Quick copy: use active enrollment project or show selector
  const handleQuickCopy = () => {
    if (activeEnrollment?.projectId) {
      copyQuizLink(activeEnrollment.projectId);
    } else if (openProjects && openProjects.length === 1) {
      copyQuizLink(openProjects[0].id);
    } else if (openProjects && openProjects.length > 1) {
      setProjectSelectorOpen(true);
    } else {
      copyQuizLink(null);
    }
  };

  // Save cart link
  const handleSaveCartLink = async () => {
    if (!cartLink.trim()) {
      toast.error('Please enter a valid cart link');
      return;
    }
    // Validate URL
    try {
      new URL(cartLink);
    } catch {
      toast.error('Please enter a valid URL (e.g., https://example.com/your-cart)');
      return;
    }

    setIsSavingCartLink(true);
    try {
      await updateProfile.mutateAsync({ cartLink: cartLink.trim() });
      toast.success('Cart link saved successfully!');
    } catch (error) {
      console.error('Failed to save cart link:', error);
      toast.error('Failed to save cart link');
    } finally {
      setIsSavingCartLink(false);
    }
  };

  // Sync cart link state when user data loads
  React.useEffect(() => {
    if (user?.cartLink) {
      setCartLink(user.cartLink);
    }
  }, [user?.cartLink]);

  // Start editing mode
  const handleStartEdit = () => {
    if (!user) return;
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPhone(formatPhoneDisplay(user.phone));
    setEditTimezone(user.timezone);
    setIsEditing(true);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditName('');
    setEditEmail('');
    setEditPhone('');
    setEditTimezone('');
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    if (!user) return;

    // Validate fields
    if (!editName.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!editEmail.trim() || !editEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (!editPhone.trim()) {
      toast.error('Phone number is required');
      return;
    }

    // Format phone to E.164
    const formattedPhone = toE164(editPhone);
    if (!formattedPhone) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setIsSavingProfile(true);
    try {
      await updateProfile.mutateAsync({
        name: editName.trim(),
        email: editEmail.trim(),
        phone: formattedPhone,
        timezone: editTimezone,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
      // Error toast is handled by the mutation
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Format timezone for display
  const getTimezoneLabel = (tz: string) => {
    const found = US_TIMEZONES.find(t => t.value === tz);
    return found ? found.label : tz;
  };
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-3xl font-display font-bold text-navy-900 dark:text-white">My Profile</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Info Card */}
        <Card className="md:col-span-2 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm transition-colors">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-navy-900 dark:text-white">Personal Information</CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400">Your account details and contact info.</CardDescription>
              </div>
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartEdit}
                  className="border-navy-200 dark:border-navy-700 text-navy-700 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800"
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEdit}
                    disabled={isSavingProfile}
                    className="border-slate-200 dark:border-navy-700"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                    className="bg-gold-500 hover:bg-gold-600 text-navy-900"
                  >
                    {isSavingProfile ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save
                  </Button>
                </div>
              )}
            </div>
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
                {isEditing ? (
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Enter your name"
                    className="bg-white dark:bg-navy-900 border-slate-300 dark:border-navy-700 text-navy-900 dark:text-white focus:border-gold-500 focus:ring-gold-500"
                  />
                ) : (
                  <Input
                    value={user.name}
                    readOnly
                    className="bg-slate-50 dark:bg-navy-950 border-slate-200 dark:border-navy-800 text-navy-900 dark:text-white"
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-navy-900 dark:text-slate-200">Email Address</Label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="bg-white dark:bg-navy-900 border-slate-300 dark:border-navy-700 text-navy-900 dark:text-white focus:border-gold-500 focus:ring-gold-500"
                  />
                ) : (
                  <Input
                    value={user.email}
                    readOnly
                    className="bg-slate-50 dark:bg-navy-950 border-slate-200 dark:border-navy-800 text-navy-900 dark:text-white"
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-navy-900 dark:text-slate-200">Phone Number</Label>
                {isEditing ? (
                  <Input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="(555) 555-5555"
                    className="bg-white dark:bg-navy-900 border-slate-300 dark:border-navy-700 text-navy-900 dark:text-white focus:border-gold-500 focus:ring-gold-500"
                  />
                ) : (
                  <Input
                    value={formatPhoneDisplay(user.phone)}
                    readOnly
                    className="bg-slate-50 dark:bg-navy-950 border-slate-200 dark:border-navy-800 text-navy-900 dark:text-white"
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-navy-900 dark:text-slate-200">Timezone</Label>
                {isEditing ? (
                  <Select value={editTimezone} onValueChange={setEditTimezone}>
                    <SelectTrigger className="bg-white dark:bg-navy-900 border-slate-300 dark:border-navy-700 text-navy-900 dark:text-white">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-700">
                      {US_TIMEZONES.map((tz) => (
                        <SelectItem
                          key={tz.value}
                          value={tz.value}
                          className="text-navy-900 dark:text-white hover:bg-slate-100 dark:hover:bg-navy-800"
                        >
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={getTimezoneLabel(user.timezone)}
                    readOnly
                    className="bg-slate-50 dark:bg-navy-950 border-slate-200 dark:border-navy-800 text-navy-900 dark:text-white"
                  />
                )}
              </div>
            </div>

            {/* Cart Link Section - Coaches Only */}
            {user.role === 'coach' && (
              <div className="pt-4 border-t border-slate-100 dark:border-navy-800">
                <div className="flex items-center gap-2 mb-3">
                  <ShoppingCart className="h-5 w-5 text-gold-600 dark:text-gold-400" />
                  <h3 className="font-semibold text-navy-900 dark:text-white">Your Cart Link</h3>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                  When your referrals need to order their Nutrition Kit, they'll be directed to your personalized cart link.
                </p>
                <div className="flex gap-2">
                  <Input
                    value={cartLink}
                    onChange={(e) => setCartLink(e.target.value)}
                    placeholder="https://www.optavia.com/your-cart-link"
                    className="flex-1 bg-slate-50 dark:bg-navy-950 border-slate-200 dark:border-navy-800 text-navy-900 dark:text-white"
                  />
                  <Button
                    onClick={handleSaveCartLink}
                    disabled={isSavingCartLink || cartLink === user.cartLink}
                    className="bg-gold-500 hover:bg-gold-600 text-navy-900"
                  >
                    {isSavingCartLink ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                  </Button>
                  {user.cartLink && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(user.cartLink, '_blank')}
                      className="border-slate-200 dark:border-navy-700"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {user.cartLink && cartLink === user.cartLink && (
                  <p className="text-xs text-green-500 dark:text-green-400 mt-2 flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Cart link saved
                  </p>
                )}
              </div>
            )}
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
            {/* Quiz Link Section */}
            <div className="pt-4 border-t border-slate-100 dark:border-navy-800">
              <Label className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Quiz Link</Label>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 mb-2">Share this link to capture leads</p>
              <Button
                onClick={handleQuickCopy}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] transition-all"
              >
                {copiedLink ? <Check className="h-4 w-4 mr-2" /> : <Link className="h-4 w-4 mr-2" />}
                {copiedLink ? 'Copied!' : 'Copy Quiz Link'}
              </Button>
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

      {/* Project Selector Dialog */}
      <Dialog open={projectSelectorOpen} onOpenChange={setProjectSelectorOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-700">
          <DialogHeader>
            <DialogTitle className="text-navy-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-gold-500" />
              Select a Project
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              Choose which project you want to refer leads to. They'll complete the metabolic quiz and can join your selected project.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {openProjects?.map((proj) => (
              <button
                key={proj.id}
                onClick={() => copyQuizLink(proj.id)}
                className="w-full p-4 rounded-xl border-2 border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:bg-slate-100 dark:hover:bg-navy-800/80 transition-all text-left group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-navy-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {proj.name}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Starts {new Date(proj.startDate).toLocaleDateString()}
                    </div>
                  </div>
                  <Copy className="h-5 w-5 text-slate-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                </div>
              </button>
            ))}
            {/* Option to copy without project */}
            <button
              onClick={() => copyQuizLink(null)}
              className="w-full p-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-navy-700 bg-slate-50/50 dark:bg-navy-900/50 hover:border-blue-500/30 transition-all text-left group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-500 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                    General Referral Link
                  </div>
                  <div className="text-sm text-slate-400 dark:text-slate-500">
                    Let them choose their project later
                  </div>
                </div>
                <Copy className="h-5 w-5 text-slate-400 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors" />
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}