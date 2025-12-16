import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, Phone, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useNavigate, Link } from 'react-router-dom';
import { MarketingLayout } from '@/components/layout/MarketingLayout';
import { PhoneInput } from '@/components/ui/phone-input';
import { otpApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { formatPhoneDisplay, toE164, isValidPhone } from '@/lib/phone-utils';

type Step = 'phone' | 'verify' | 'success';

export function OtpLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus first OTP input when entering verify step
  useEffect(() => {
    if (step === 'verify' && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [step]);

  const handleSendOtp = async () => {
    if (!isValidPhone(phone)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await otpApi.sendOtp({ phone });
      if (result.success) {
        setStep('verify');
        // In dev mode, show the code for testing
        if (result.devCode) {
          setDevCode(result.devCode);
        }
      } else {
        setError(result.message || 'Failed to send verification code');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await otpApi.verifyOtp({ phone, code: fullCode });
      if (result.success) {
        if (result.user && !result.isNewUser) {
          // Existing user - log them in
          login(result.user);
          setStep('success');
          // Navigate to app after a brief delay
          setTimeout(() => navigate('/app'), 1500);
        } else {
          // New user - redirect to registration with verified phone
          setIsNewUser(true);
          setVerifiedPhone(result.verifiedPhone || toE164(phone));
          setStep('success');
        }
      } else {
        setError(result.message || 'Invalid verification code');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);

    // Auto-advance to next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (digit && index === 5 && newCode.every(d => d)) {
      // Small delay to let state update
      setTimeout(() => {
        const fullCode = newCode.join('');
        if (fullCode.length === 6) {
          handleVerifyOtp();
        }
      }, 100);
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      const newCode = [...code];
      for (let i = 0; i < pastedData.length; i++) {
        newCode[i] = pastedData[i];
      }
      setCode(newCode);
      // Focus the next empty input or the last one
      const nextEmpty = newCode.findIndex(d => !d);
      inputRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
    }
  };

  const variants = {
    enter: { x: 20, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 },
  };

  return (
    <MarketingLayout>
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {step === 'phone' && (
              <motion.div
                key="phone"
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2 }}
              >
                <Card className="border-navy-700 bg-navy-800/80 backdrop-blur-xl shadow-2xl overflow-hidden">
                  {/* Card Header */}
                  <div className="bg-navy-900/50 px-6 py-5 border-b border-navy-700">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center">
                        <Phone className="h-5 w-5 text-gold-500" />
                      </div>
                      <div>
                        <h2 className="text-xl md:text-2xl font-bold text-white">Welcome Back</h2>
                        <p className="text-slate-400 text-sm">Enter your phone number to sign in</p>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6 md:p-8 space-y-6">
                    {error && (
                      <Alert variant="destructive" className="bg-red-900/20 border-red-800">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle className="text-red-400">Error</AlertTitle>
                        <AlertDescription className="text-red-300">{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-slate-200 flex items-center gap-2">
                        <Phone className="h-4 w-4 text-slate-400" />
                        Mobile Phone
                      </Label>
                      <PhoneInput
                        id="phone"
                        value={phone}
                        onChange={setPhone}
                        className="bg-navy-900 border-navy-600 text-white placeholder:text-slate-500 focus:border-gold-500 focus:ring-gold-500/20 h-12 text-lg rounded-xl"
                      />
                      <p className="text-xs text-slate-500">
                        We'll send you a verification code via SMS
                      </p>
                    </div>

                    <Button
                      onClick={handleSendOtp}
                      disabled={isLoading || !phone}
                      className="w-full bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold py-7 text-lg rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:-translate-y-0.5 transition-all duration-300"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="animate-spin mr-2 h-4 w-4" />
                          Sending Code...
                        </>
                      ) : (
                        'Send Verification Code'
                      )}
                    </Button>

                    <div className="text-center text-sm text-slate-400">
                      Don't have an account?{' '}
                      <Link to="/register" className="text-gold-500 hover:text-gold-400 font-medium">
                        Register here
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === 'verify' && (
              <motion.div
                key="verify"
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2 }}
              >
                <Card className="border-navy-700 bg-navy-800/80 backdrop-blur-xl shadow-2xl overflow-hidden relative">
                  {/* Back button */}
                  <button
                    onClick={() => {
                      setStep('phone');
                      setCode(['', '', '', '', '', '']);
                      setError(null);
                      setDevCode(null);
                    }}
                    className="absolute left-4 top-4 p-2 rounded-full hover:bg-navy-700 transition-colors z-10"
                  >
                    <ArrowLeft className="h-5 w-5 text-slate-400" />
                  </button>

                  {/* Card Header */}
                  <div className="bg-navy-900/50 px-6 py-5 border-b border-navy-700">
                    <div className="flex items-center gap-3 justify-center">
                      <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center">
                        <Phone className="h-5 w-5 text-gold-500" />
                      </div>
                      <div className="text-center">
                        <h2 className="text-xl md:text-2xl font-bold text-white">Enter Code</h2>
                        <p className="text-slate-400 text-sm">We sent a code to {formatPhoneDisplay(phone)}</p>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6 md:p-8 space-y-6">
                    {error && (
                      <Alert variant="destructive" className="bg-red-900/20 border-red-800">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-red-300">{error}</AlertDescription>
                      </Alert>
                    )}

                    {devCode && (
                      <Alert className="bg-blue-500/10 border-blue-500/30 rounded-xl">
                        <AlertDescription className="text-blue-300">
                          <span className="font-bold">Dev Mode:</span> Your code is <span className="font-mono font-bold text-blue-200">{devCode}</span>
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex justify-center gap-2 sm:gap-3">
                      {code.map((digit, index) => (
                        <Input
                          key={index}
                          ref={(el) => (inputRefs.current[index] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleCodeChange(index, e.target.value)}
                          onKeyDown={(e) => handleCodeKeyDown(index, e)}
                          onPaste={handleCodePaste}
                          className="w-11 h-14 sm:w-12 sm:h-16 text-center text-2xl font-bold bg-navy-900 border-navy-600 text-white focus:border-gold-500 focus:ring-gold-500/20 rounded-xl"
                        />
                      ))}
                    </div>

                    <p className="text-center text-sm text-slate-500">
                      Didn't receive the code?{' '}
                      <button
                        onClick={handleSendOtp}
                        disabled={isLoading}
                        className="text-gold-500 hover:text-gold-400 font-medium"
                      >
                        Resend
                      </button>
                    </p>

                    <Button
                      onClick={handleVerifyOtp}
                      disabled={isLoading || code.some(d => !d)}
                      className="w-full bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold py-7 text-lg rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:-translate-y-0.5 transition-all duration-300"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="animate-spin mr-2 h-4 w-4" />
                          Verifying...
                        </>
                      ) : (
                        'Verify & Sign In'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success"
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2 }}
              >
                <Card className="border-navy-700 bg-navy-800/80 backdrop-blur-xl shadow-2xl overflow-hidden">
                  <CardContent className="p-8 text-center">
                    <div className="w-20 h-20 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                      <CheckCircle className="h-10 w-10 text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {isNewUser ? 'Phone Verified!' : 'Welcome Back!'}
                    </h2>
                    <p className="text-slate-400 mb-6">
                      {isNewUser
                        ? 'Your phone has been verified. Complete your registration to get started.'
                        : 'You have been signed in successfully.'}
                    </p>
                    {isNewUser && (
                      <Button
                        onClick={() => navigate(`/register?phone=${encodeURIComponent(verifiedPhone || '')}`)}
                        className="bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold py-3 px-8 text-lg rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-all duration-300"
                      >
                        Complete Registration
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </MarketingLayout>
  );
}
