import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Camera,
  Upload,
  Check,
  Loader2,
  ArrowRight,
  User,
  AlertCircle,
  Phone,
  X,
  Shield,
} from 'lucide-react';
import { useMyActiveEnrollment } from '@/hooks/use-queries';
import { useAuthStore } from '@/lib/auth-store';
import { otpApi, userApi, uploadApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

export default function FinalRegistrationPage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const { data: enrollment, isLoading: enrollmentLoading } = useMyActiveEnrollment();

  // Form state (email already collected at payment)
  const [profilePhoto, setProfilePhoto] = useState<string | null>(user?.avatarUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // OTP Modal state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [devOtpCode, setDevOtpCode] = useState<string | null>(null);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Check if phone is already verified
  useEffect(() => {
    if (user?.phone) {
      otpApi.checkVerified(user.phone).then((result) => {
        if (result.verified && !result.expired) {
          setIsPhoneVerified(true);
        }
      }).catch(() => {
        // Ignore errors - just means we need to verify
      });
    }
  }, [user?.phone]);

  // Focus first OTP input when modal opens
  useEffect(() => {
    if (showOtpModal && otpInputRefs.current[0]) {
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    }
  }, [showOtpModal]);

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

  const handleSendOtp = async () => {
    if (!user?.phone) return;

    setIsSendingOtp(true);
    setOtpError(null);

    try {
      const result = await otpApi.sendOtp({ phone: user.phone });
      if (result.success) {
        setShowOtpModal(true);
        if (result.devCode) {
          setDevOtpCode(result.devCode);
        }
      } else {
        setOtpError(result.message || 'Failed to send verification code');
      }
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : 'Failed to send verification code');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newCode = [...otpCode];
    newCode[index] = digit;
    setOtpCode(newCode);

    // Auto-advance to next input
    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      const newCode = [...otpCode];
      for (let i = 0; i < pastedData.length; i++) {
        newCode[i] = pastedData[i];
      }
      setOtpCode(newCode);
      const nextEmpty = newCode.findIndex(d => !d);
      otpInputRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const fullCode = otpCode.join('');
    if (fullCode.length !== 6) {
      setOtpError('Please enter the complete 6-digit code');
      return;
    }

    if (!user?.phone) return;

    setIsVerifying(true);
    setOtpError(null);

    try {
      const result = await otpApi.verifyOtp({ phone: user.phone, code: fullCode });
      if (result.success) {
        setIsPhoneVerified(true);
        setShowOtpModal(false);
        // Now save profile and continue
        await handleContinue(true);
      } else {
        setOtpError(result.message || 'Invalid verification code');
      }
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleContinue = async (skipOtpCheck = false) => {
    // Check if phone needs verification
    if (!skipOtpCheck && !isPhoneVerified) {
      // Send OTP and show modal
      handleSendOtp();
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Celebrate!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#FBBF24', '#FCD34D', '#22C55E', '#10B981']
      });

      // Navigate to all-audience orientation video
      navigate('/app/onboarding/final-video');
    } catch (err) {
      console.error('Save failed:', err);
      setError('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (enrollmentLoading) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

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

  const allDigitsEntered = otpCode.every(d => d !== '');

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
              <span className="ml-2 text-sm text-slate-400 hidden sm:inline">Cohort</span>
            </div>
            <div className="w-8 sm:w-12 h-0.5 bg-gold-500"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gold-500 flex items-center justify-center">
                <User className="h-4 w-4 text-navy-900" />
              </div>
              <span className="ml-2 text-sm text-white font-medium hidden sm:inline">Profile</span>
            </div>
            <div className="w-8 sm:w-12 h-0.5 bg-navy-700"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-navy-700 flex items-center justify-center">
                <span className="text-xs text-slate-500">3</span>
              </div>
              <span className="ml-2 text-sm text-slate-500 hidden sm:inline">Video</span>
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
              Complete Your Profile, {user.name.split(' ')[0]}
            </h1>
            <p className="text-slate-400">
              Add a profile photo and verify your phone to get started
            </p>
          </div>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6 space-y-6">
              {/* Profile Photo Upload */}
              <div className="space-y-3">
                <Label className="text-slate-200 flex items-center gap-2">
                  <Camera className="h-4 w-4 text-slate-400" />
                  Profile Photo
                </Label>
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "relative w-24 h-24 rounded-full overflow-hidden cursor-pointer group",
                      "bg-slate-700 border-2 border-dashed border-slate-600 hover:border-gold-500 transition-colors"
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
                        <User className="h-10 w-10 text-slate-500" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      {isUploading ? (
                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                      ) : (
                        <Camera className="h-6 w-6 text-white" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Photo
                        </>
                      )}
                    </Button>
                    <p className="text-slate-500 text-xs mt-1">JPG, PNG. Max 5MB.</p>
                  </div>
                </div>
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

              {/* Phone Verification Status */}
              <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      isPhoneVerified ? "bg-green-500/20" : "bg-slate-700"
                    )}>
                      <Phone className={cn(
                        "h-5 w-5",
                        isPhoneVerified ? "text-green-400" : "text-slate-400"
                      )} />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Phone Verification</p>
                      <p className="text-slate-400 text-xs">
                        {isPhoneVerified ? 'Verified' : 'Required for account security'}
                      </p>
                    </div>
                  </div>
                  {isPhoneVerified ? (
                    <div className="flex items-center gap-1 text-green-400 text-sm">
                      <Check className="h-4 w-4" />
                      Verified
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleSendOtp}
                      disabled={isSendingOtp}
                      className="border-gold-500/50 text-gold-400 hover:bg-gold-500/10"
                    >
                      {isSendingOtp ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Verify Now'
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Continue Button */}
              <Button
                onClick={() => handleContinue()}
                disabled={isSaving}
                className="w-full bg-gold-500 hover:bg-gold-600 text-navy-900 py-6 text-lg font-bold rounded-xl"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                    Saving...
                  </>
                ) : (
                  <>
                    Continue to Orientation
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>

              {/* Skip Option */}
              <div className="text-center">
                <button
                  onClick={() => navigate('/app/onboarding/final-video')}
                  className="text-slate-500 text-sm hover:text-slate-400 transition-colors"
                >
                  Skip for now
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* OTP Verification Modal */}
      <AnimatePresence>
        {showOtpModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowOtpModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6 relative">
                  {/* Close Button */}
                  <button
                    onClick={() => setShowOtpModal(false)}
                    className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-700 transition-colors"
                  >
                    <X className="h-5 w-5 text-slate-400" />
                  </button>

                  {/* Header */}
                  <div className="text-center mb-6">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gold-500/20 flex items-center justify-center">
                      <Phone className="h-7 w-7 text-gold-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">Verify Your Phone</h3>
                    <p className="text-slate-400 text-sm">
                      We sent a 6-digit code to your phone
                    </p>
                  </div>

                  {/* Dev Code Display */}
                  {devOtpCode && (
                    <Alert className="mb-4 bg-blue-500/10 border-blue-500/30">
                      <AlertDescription className="text-blue-300 text-sm">
                        <span className="font-bold">Dev Mode:</span> Your code is{' '}
                        <span className="font-mono font-bold text-blue-200">{devOtpCode}</span>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Error Display */}
                  {otpError && (
                    <Alert variant="destructive" className="mb-4 bg-red-900/20 border-red-800">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-red-300">{otpError}</AlertDescription>
                    </Alert>
                  )}

                  {/* OTP Input */}
                  <div className="flex justify-center gap-2 mb-4">
                    {otpCode.map((digit, index) => (
                      <Input
                        key={index}
                        ref={(el) => (otpInputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onPaste={handleOtpPaste}
                        className={cn(
                          "w-11 h-14 text-center text-2xl font-bold rounded-xl",
                          "bg-slate-900 text-white",
                          allDigitsEntered
                            ? "border-green-500 focus:border-green-500 focus:ring-green-500/20"
                            : "border-slate-600 focus:border-gold-500 focus:ring-gold-500/20"
                        )}
                      />
                    ))}
                  </div>

                  {/* Status Message */}
                  <p className={cn(
                    "text-center text-sm mb-4",
                    allDigitsEntered ? "text-green-400" : "text-slate-500"
                  )}>
                    {allDigitsEntered ? (
                      <span className="flex items-center justify-center gap-1">
                        <Check className="h-4 w-4" />
                        All digits entered. Click verify.
                      </span>
                    ) : (
                      "Enter the 6-digit code from your SMS"
                    )}
                  </p>

                  {/* Verify Button */}
                  <Button
                    onClick={handleVerifyOtp}
                    disabled={isVerifying || !allDigitsEntered}
                    className="w-full bg-gold-500 hover:bg-gold-600 text-navy-900 py-6 font-bold rounded-xl"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="animate-spin mr-2 h-5 w-5" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Shield className="mr-2 h-5 w-5" />
                        Verify Phone
                      </>
                    )}
                  </Button>

                  {/* Resend Link */}
                  <p className="text-center text-sm text-slate-500 mt-4">
                    Didn't receive the code?{' '}
                    <button
                      onClick={handleSendOtp}
                      disabled={isSendingOtp}
                      className="text-gold-500 hover:text-gold-400 font-medium"
                    >
                      Resend
                    </button>
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
