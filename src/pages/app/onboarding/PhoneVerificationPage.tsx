import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Check,
  Loader2,
  Phone,
  Shield,
  AlertCircle,
  Lock,
  Smartphone,
} from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { otpApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { formatPhoneDisplay } from '@/lib/phone-utils';
import confetti from 'canvas-confetti';
import { useMyActiveEnrollment } from '@/hooks/use-queries';

export default function PhoneVerificationPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: enrollment, isLoading: enrollmentLoading } = useMyActiveEnrollment();

  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [devOtpCode, setDevOtpCode] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Check if phone is already verified on mount
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

  // Auto-send OTP when page loads (if not already verified)
  useEffect(() => {
    if (user?.phone && !codeSent && !isPhoneVerified) {
      handleSendOtp();
    }
  }, [user?.phone, isPhoneVerified]);

  // Focus first OTP input when code is sent
  useEffect(() => {
    if (codeSent && otpInputRefs.current[0]) {
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    }
  }, [codeSent]);

  const handleSendOtp = async () => {
    if (!user?.phone) return;

    setIsSendingOtp(true);
    setOtpError(null);

    try {
      const result = await otpApi.sendOtp({ phone: user.phone });
      if (result.success) {
        setCodeSent(true);
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

    // Clear any existing error when user types
    setOtpError(null);

    // Auto-advance to next input
    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (digit && index === 5 && newCode.every(d => d)) {
      setTimeout(() => {
        handleVerifyOtp(newCode);
      }, 100);
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
      // Clear any existing error when user pastes
      setOtpError(null);
      const nextEmpty = newCode.findIndex(d => !d);
      otpInputRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
    }
  };

  const handleVerifyOtp = async (codeOverride?: string[]) => {
    // If codeOverride is not an array (e.g., it's a click event), use otpCode
    const codeToUse = Array.isArray(codeOverride) ? codeOverride : otpCode;
    const fullCode = codeToUse.join('');
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

        // Celebrate!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#FBBF24', '#FCD34D', '#22C55E', '#10B981']
        });

        // Short delay to show success, then navigate
        // Coaches go to cart link page to set up their referral link
        // Group B goes to final video, Group A goes to kit confirmation
        setTimeout(() => {
          // Check coach status at navigation time
          const userIsCoach = user?.role === 'coach' || enrollment?.role === 'coach';
          console.log('[PhoneVerification] Navigation decision:', {
            userRole: user?.role,
            enrollmentRole: enrollment?.role,
            userIsCoach,
            cohortId: enrollment?.cohortId
          });
          if (userIsCoach) {
            navigate('/app/onboarding/cart-link');
          } else if (enrollment?.cohortId === 'GROUP_B') {
            // Group B goes to all-audience orientation video
            navigate('/app/onboarding/final-video');
          } else {
            navigate('/app/onboarding/kit');
          }
        }, 1500);
      } else {
        setOtpError(result.message || 'Invalid verification code');
      }
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  // If already verified, show success and auto-navigate
  // Coaches go to cart link page to set up their referral link
  // Group B goes to final video, Group A goes to kit confirmation
  // Wait for enrollment data to load before navigating
  useEffect(() => {
    console.log('[PhoneVerification] useEffect check:', {
      isPhoneVerified,
      isVerifying,
      enrollmentLoading,
      userRole: user?.role,
      enrollmentRole: enrollment?.role
    });
    if (isPhoneVerified && !isVerifying && !enrollmentLoading) {
      const timer = setTimeout(() => {
        // Check coach status at navigation time
        const userIsCoach = user?.role === 'coach' || enrollment?.role === 'coach';
        console.log('[PhoneVerification] useEffect navigation:', { userIsCoach });
        if (userIsCoach) {
          navigate('/app/onboarding/cart-link');
        } else if (enrollment?.cohortId === 'GROUP_B') {
          // Group B goes to all-audience orientation video
          navigate('/app/onboarding/final-video');
        } else {
          navigate('/app/onboarding/kit');
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isPhoneVerified, isVerifying, navigate, enrollment?.cohortId, enrollment?.role, user?.role, enrollmentLoading]);

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
  const formattedPhone = user.phone ? formatPhoneDisplay(user.phone) : '';

  // Already verified state
  if (isPhoneVerified) {
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
              <div className="w-8 sm:w-12 h-0.5 bg-green-500"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="h-4 w-4 text-white" />
                </div>
                <span className="ml-2 text-sm text-slate-400 hidden sm:inline">Photo</span>
              </div>
              <div className="w-8 sm:w-12 h-0.5 bg-green-500"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="h-4 w-4 text-white" />
                </div>
                <span className="ml-2 text-sm text-green-400 font-medium hidden sm:inline">Verify</span>
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

        {/* Success Content */}
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <Card className="bg-slate-800/50 border-slate-700 max-w-md w-full">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="h-10 w-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Phone Verified!</h2>
              <p className="text-slate-400 mb-6">
                Your account is now secure. Redirecting to orientation...
              </p>
              <Loader2 className="h-6 w-6 animate-spin text-gold-500 mx-auto" />
            </CardContent>
          </Card>
        </div>
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
            <div className="w-8 sm:w-12 h-0.5 bg-green-500"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="h-4 w-4 text-white" />
              </div>
              <span className="ml-2 text-sm text-slate-400 hidden sm:inline">Photo</span>
            </div>
            <div className="w-8 sm:w-12 h-0.5 bg-gold-500"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gold-500 flex items-center justify-center">
                <Phone className="h-4 w-4 text-navy-900" />
              </div>
              <span className="ml-2 text-sm text-white font-medium hidden sm:inline">Verify</span>
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
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold-500/20 flex items-center justify-center">
              <Shield className="h-8 w-8 text-gold-500" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Verify Your Phone
            </h1>
            <p className="text-slate-400">
              {codeSent
                ? `We sent a 6-digit code to ${formattedPhone}`
                : 'Secure your account with phone verification'
              }
            </p>
          </div>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6 space-y-6">
              {/* Why We Verify */}
              {!codeSent && (
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg">
                    <Lock className="h-5 w-5 text-gold-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-white text-sm font-medium">Secure Login</p>
                      <p className="text-slate-400 text-xs">Log in anytime using just your phone number</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg">
                    <Shield className="h-5 w-5 text-gold-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-white text-sm font-medium">Account Protection</p>
                      <p className="text-slate-400 text-xs">Prevents unauthorized access to your account</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg">
                    <Smartphone className="h-5 w-5 text-gold-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-white text-sm font-medium">Important Updates</p>
                      <p className="text-slate-400 text-xs">Receive challenge reminders and progress alerts</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Sending State */}
              {isSendingOtp && !codeSent && (
                <div className="text-center py-4">
                  <Loader2 className="h-8 w-8 animate-spin text-gold-500 mx-auto mb-3" />
                  <p className="text-slate-400">Sending verification code...</p>
                </div>
              )}

              {/* Dev Code Display */}
              {devOtpCode && (
                <Alert className="bg-blue-500/10 border-blue-500/30">
                  <AlertDescription className="text-blue-300 text-sm">
                    <span className="font-bold">Dev Mode:</span> Your code is{' '}
                    <span className="font-mono font-bold text-blue-200">{devOtpCode}</span>
                  </AlertDescription>
                </Alert>
              )}

              {/* Error Display - hide when all digits entered */}
              {otpError && !otpCode.every(d => d !== '') && (
                <Alert variant="destructive" className="bg-red-900/20 border-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-300">{otpError}</AlertDescription>
                </Alert>
              )}

              {/* OTP Input */}
              {codeSent && (
                <>
                  <div className="flex justify-center gap-2">
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
                          "w-12 h-14 text-center text-2xl font-bold rounded-xl",
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
                    "text-center text-sm",
                    allDigitsEntered ? "text-green-400" : "text-slate-500"
                  )}>
                    {allDigitsEntered ? (
                      <span className="flex items-center justify-center gap-1">
                        <Check className="h-4 w-4" />
                        All digits entered. Verifying...
                      </span>
                    ) : (
                      "Enter the 6-digit code from your SMS"
                    )}
                  </p>

                  {/* Verify Button */}
                  <Button
                    onClick={handleVerifyOtp}
                    disabled={isVerifying || !allDigitsEntered}
                    className="w-full bg-gold-500 hover:bg-gold-600 text-navy-900 py-6 text-lg font-bold rounded-xl"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="animate-spin mr-2 h-5 w-5" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Shield className="mr-2 h-5 w-5" />
                        Verify & Continue
                      </>
                    )}
                  </Button>

                  {/* Resend Link */}
                  <p className="text-center text-sm text-slate-500">
                    Didn't receive the code?{' '}
                    <button
                      onClick={handleSendOtp}
                      disabled={isSendingOtp}
                      className="text-gold-500 hover:text-gold-400 font-medium"
                    >
                      {isSendingOtp ? 'Sending...' : 'Resend Code'}
                    </button>
                  </p>
                </>
              )}

              {/* Initial Send Button (if auto-send fails) */}
              {!codeSent && !isSendingOtp && (
                <Button
                  onClick={handleSendOtp}
                  className="w-full bg-gold-500 hover:bg-gold-600 text-navy-900 py-6 text-lg font-bold rounded-xl"
                >
                  <Phone className="mr-2 h-5 w-5" />
                  Send Verification Code
                </Button>
              )}

              {/* Standard rates disclaimer */}
              <p className="text-center text-xs text-slate-500">
                Standard message and data rates may apply.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
