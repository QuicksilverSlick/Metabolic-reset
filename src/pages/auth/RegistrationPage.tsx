import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Check,
  ChevronRight,
  CreditCard,
  User,
  Users,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Scale,
  ExternalLink,
  Mail,
  Phone,
  UserCircle,
  Shield,
  Zap,
  Target,
  TrendingDown,
  Activity,
  Sparkles,
  ArrowRight,
  Lock,
  Calendar,
  FolderKanban
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MarketingLayout } from '@/components/layout/MarketingLayout';
import { useRegister, usePaymentIntent, useProject, useActiveProject } from '@/hooks/use-queries';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import confetti from 'canvas-confetti';

// Initialize Stripe with error handling
let stripePromise: Promise<any> | null = null;
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
try {
  if (stripeKey) {
    stripePromise = loadStripe(stripeKey).catch(err => {
      console.error("Failed to load Stripe:", err);
      return null;
    });
  } else {
    console.warn("Stripe publishable key is missing. Payments will be in mock mode if backend supports it.");
  }
} catch (error) {
  console.error("Failed to initialize Stripe:", error);
}

// Validation Schemas
const personalInfoSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number required"),
});
type PersonalInfo = z.infer<typeof personalInfoSchema>;

// Step configuration for progress indicator
const steps = [
  { id: 1, label: 'Your Info', icon: UserCircle },
  { id: 2, label: 'Your Role', icon: Users },
  { id: 3, label: 'Payment', icon: CreditCard },
  { id: 4, label: 'Complete', icon: Check }
];

function PaymentForm({ onSuccess, amount }: { onSuccess: () => void; amount: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) {
      return;
    }
    setProcessing(true);
    setError(null);
    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/app',
        },
        redirect: 'if_required'
      });
      if (submitError) {
        setError(submitError.message || 'Payment failed');
        setProcessing(false);
      } else {
        onSuccess();
      }
    } catch (err) {
      console.error("Stripe confirm error:", err);
      setError("An unexpected error occurred during payment processing.");
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-navy-900/50 rounded-xl p-4 border border-navy-700">
        <PaymentElement />
      </div>
      {error && (
        <Alert variant="destructive" className="bg-red-900/20 border-red-800">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-red-400">Payment Error</AlertTitle>
          <AlertDescription className="text-red-300">{error}</AlertDescription>
        </Alert>
      )}
      <Button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-gold-500 hover:bg-gold-600 text-navy-900 py-7 text-lg font-bold rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-all duration-300"
      >
        {processing ? (
          <>
            <Loader2 className="animate-spin mr-2 h-5 w-5" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="mr-2 h-5 w-5" />
            Pay ${(amount / 100).toFixed(2)} Securely
          </>
        )}
      </Button>
      <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
        <Shield className="h-4 w-4" />
        <span>256-bit SSL encrypted payment</span>
      </div>
    </form>
  );
}

export function RegistrationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referralCodeUsed = searchParams.get('ref') || undefined;
  const projectIdFromUrl = searchParams.get('project') || undefined;

  const registerMutation = useRegister();
  const paymentIntentMutation = usePaymentIntent();

  // Fetch project info - either from URL param or get the active project
  const { data: specificProject, isLoading: specificProjectLoading } = useProject(projectIdFromUrl || null);
  const { data: activeProject, isLoading: activeProjectLoading } = useActiveProject();

  // Use specific project if provided in URL, otherwise fall back to active project
  const project = projectIdFromUrl ? specificProject : activeProject;
  const projectLoading = projectIdFromUrl ? specificProjectLoading : activeProjectLoading;

  const [step, setStep] = useState(1);
  const [role, setRole] = useState<'challenger' | 'coach'>('challenger');
  const [hasScale, setHasScale] = useState(true);
  const [formData, setFormData] = useState<PersonalInfo | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isMockPayment, setIsMockPayment] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);

  // Check for quiz results from sessionStorage
  const [quizResult, setQuizResult] = useState<any>(null);
  useEffect(() => {
    const stored = sessionStorage.getItem('quizResult');
    if (stored) {
      setQuizResult(JSON.parse(stored));
    }
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm<PersonalInfo>({
    resolver: zodResolver(personalInfoSchema)
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const onPersonalInfoSubmit = (data: PersonalInfo) => {
    setFormData(data);
    setStep(2);
  };

  const handleRoleSelection = async () => {
    setStripeError(null);
    if (!stripePromise && stripeKey) {
      setStripeError("Payment system failed to load. Please refresh the page or try again later.");
    }
    setStep(3);
    const amount = role === 'coach' ? 4900 : 2800;
    try {
      const { clientSecret, mock } = await paymentIntentMutation.mutateAsync(amount);
      if (mock) {
        setIsMockPayment(true);
      } else if (clientSecret) {
        setClientSecret(clientSecret);
      } else {
        throw new Error("Failed to initialize payment");
      }
    } catch (err) {
      console.error('Payment init failed', err);
      if (!stripeKey) {
        setIsMockPayment(true);
      } else {
        setStripeError("Could not initialize payment system. Please try again.");
      }
    }
  };

  const handlePaymentSuccess = async () => {
    if (!formData) return;
    try {
      await registerMutation.mutateAsync({
        ...formData,
        role,
        referralCodeUsed,
        hasScale,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        projectId: project?.id // Include the project ID if available
      });
      setStep(4);
      // Trigger celebration confetti
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#FBBF24', '#FCD34D', '#22C55E', '#10B981']
      });
    } catch (err) {
      // Error handled by mutation hook toast
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0
    })
  };

  const amount = role === 'coach' ? 4900 : 2800;

  return (
    <MarketingLayout>
      <div className="min-h-screen bg-navy-900 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-500/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative max-w-6xl mx-auto px-4 py-8 md:py-12">
          {/* Header with Progress */}
          <div className="mb-8 md:mb-12">
            {/* Step Indicators */}
            <div className="flex items-center justify-center gap-2 md:gap-4 mb-6">
              {steps.map((s, index) => (
                <React.Fragment key={s.id}>
                  <div className="flex flex-col items-center">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0.5 }}
                      animate={{
                        scale: step >= s.id ? 1 : 0.8,
                        opacity: step >= s.id ? 1 : 0.5
                      }}
                      className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                        step > s.id
                          ? 'bg-green-500 text-white'
                          : step === s.id
                          ? 'bg-gold-500 text-navy-900'
                          : 'bg-navy-800 text-slate-500 border border-navy-700'
                      }`}
                    >
                      {step > s.id ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <s.icon className="h-5 w-5" />
                      )}
                    </motion.div>
                    <span className={`text-xs mt-2 hidden md:block ${
                      step >= s.id ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      {s.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 md:w-16 h-0.5 transition-colors duration-300 ${
                      step > s.id ? 'bg-green-500' : 'bg-navy-700'
                    }`}></div>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="max-w-md mx-auto">
              <div className="h-1.5 bg-navy-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-gold-500 to-gold-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
            {/* Left Side - Form */}
            <div className="lg:col-span-3">
              <AnimatePresence mode="wait" custom={1}>
                {/* Step 1: Personal Info */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    custom={1}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border-navy-700 bg-navy-800/80 backdrop-blur-xl shadow-2xl overflow-hidden">
                      {/* Header */}
                      <div className="bg-navy-900/50 px-6 py-5 border-b border-navy-700">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center">
                            <UserCircle className="h-5 w-5 text-gold-500" />
                          </div>
                          <div>
                            <h2 className="text-xl md:text-2xl font-bold text-white">Let's Get Started</h2>
                            <p className="text-slate-400 text-sm">Enter your details to join the 28-Day Reset</p>
                          </div>
                        </div>
                      </div>

                      <CardContent className="p-6 md:p-8">
                        <form onSubmit={handleSubmit(onPersonalInfoSubmit)} className="space-y-6">
                          {/* Name Field */}
                          <div className="space-y-2">
                            <Label htmlFor="name" className="text-slate-200 flex items-center gap-2">
                              <User className="h-4 w-4 text-slate-400" />
                              Full Name
                            </Label>
                            <Input
                              id="name"
                              placeholder="Jane Doe"
                              {...register('name')}
                              className="bg-navy-900 border-navy-600 text-white placeholder:text-slate-500 focus:border-gold-500 focus:ring-gold-500/20 h-12 text-lg rounded-xl"
                            />
                            {errors.name && (
                              <p className="text-red-400 text-sm flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {errors.name.message}
                              </p>
                            )}
                          </div>

                          {/* Email Field */}
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-200 flex items-center gap-2">
                              <Mail className="h-4 w-4 text-slate-400" />
                              Email Address
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="jane@example.com"
                              {...register('email')}
                              className="bg-navy-900 border-navy-600 text-white placeholder:text-slate-500 focus:border-gold-500 focus:ring-gold-500/20 h-12 text-lg rounded-xl"
                            />
                            {errors.email && (
                              <p className="text-red-400 text-sm flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {errors.email.message}
                              </p>
                            )}
                          </div>

                          {/* Phone Field */}
                          <div className="space-y-2">
                            <Label htmlFor="phone" className="text-slate-200 flex items-center gap-2">
                              <Phone className="h-4 w-4 text-slate-400" />
                              Mobile Phone
                            </Label>
                            <Input
                              id="phone"
                              type="tel"
                              placeholder="(555) 123-4567"
                              {...register('phone')}
                              className="bg-navy-900 border-navy-600 text-white placeholder:text-slate-500 focus:border-gold-500 focus:ring-gold-500/20 h-12 text-lg rounded-xl"
                            />
                            {errors.phone && (
                              <p className="text-red-400 text-sm flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {errors.phone.message}
                              </p>
                            )}
                          </div>

                          {/* Referral Badge */}
                          {referralCodeUsed && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-green-900/30 border border-green-700 rounded-xl p-4 flex items-center gap-3"
                            >
                              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                <Check className="h-4 w-4 text-green-400" />
                              </div>
                              <div>
                                <p className="text-green-400 font-medium">Referral Code Applied</p>
                                <p className="text-green-300/70 text-sm">{referralCodeUsed}</p>
                              </div>
                            </motion.div>
                          )}

                          {/* Project Badge */}
                          {project && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-blue-900/30 border border-blue-700 rounded-xl p-4"
                            >
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                                  <FolderKanban className="h-4 w-4 text-blue-400" />
                                </div>
                                <div>
                                  <p className="text-blue-400 font-medium">{project.name}</p>
                                  <p className="text-blue-300/70 text-sm">{project.description || '28-Day Metabolic Reset Challenge'}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-blue-800/50 text-xs text-blue-300/70">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Starts {new Date(project.startDate).toLocaleDateString()}
                                </span>
                                {project.status === 'registration_open' && (
                                  <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full font-medium">
                                    Registration Open
                                  </span>
                                )}
                              </div>
                            </motion.div>
                          )}

                          {/* Quiz Result Badge */}
                          {quizResult && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-gold-500/10 border border-gold-500/30 rounded-xl p-4 flex items-center gap-3"
                            >
                              <div className="w-8 h-8 rounded-full bg-gold-500/20 flex items-center justify-center">
                                <Activity className="h-4 w-4 text-gold-400" />
                              </div>
                              <div>
                                <p className="text-gold-400 font-medium">Quiz Completed</p>
                                <p className="text-gold-300/70 text-sm">Your personalized protocol is ready</p>
                              </div>
                            </motion.div>
                          )}

                          {/* Submit Button */}
                          <Button
                            type="submit"
                            className="w-full bg-gold-500 hover:bg-gold-600 text-navy-900 py-7 text-lg font-bold rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:-translate-y-0.5 transition-all duration-300"
                          >
                            Continue
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Step 2: Role Selection */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    custom={1}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border-navy-700 bg-navy-800/80 backdrop-blur-xl shadow-2xl overflow-hidden">
                      {/* Header */}
                      <div className="bg-navy-900/50 px-6 py-5 border-b border-navy-700">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-10 w-10 p-0 text-slate-400 hover:text-white hover:bg-navy-700 rounded-full"
                            onClick={() => setStep(1)}
                          >
                            <ArrowLeft className="h-5 w-5" />
                          </Button>
                          <div>
                            <h2 className="text-xl md:text-2xl font-bold text-white">Choose Your Path</h2>
                            <p className="text-slate-400 text-sm">Select how you want to participate</p>
                          </div>
                        </div>
                      </div>

                      <CardContent className="p-6 md:p-8 space-y-6">
                        <RadioGroup value={role} onValueChange={(v) => setRole(v as 'challenger' | 'coach')}>
                          {/* Challenger Option */}
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setRole('challenger')}
                            className={`relative rounded-2xl border-2 p-6 cursor-pointer transition-all duration-200 ${
                              role === 'challenger'
                                ? 'border-gold-500 bg-gold-500/10 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                                : 'border-navy-600 bg-navy-900 hover:border-gold-500/50'
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                role === 'challenger' ? 'bg-gold-500 text-navy-900' : 'bg-navy-800 text-slate-400'
                              }`}>
                                <User className="h-6 w-6" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <Label className="font-bold text-white text-lg cursor-pointer">
                                    I am a Challenger
                                  </Label>
                                  <RadioGroupItem value="challenger" className="border-slate-500 text-gold-500" />
                                </div>
                                <p className="text-slate-400 mb-4">
                                  Track your health, lose weight, and improve your metabolic age with our guided protocol.
                                </p>
                                <div className="flex items-center gap-4">
                                  <span className="text-2xl font-bold text-gold-500">$28</span>
                                  <span className="text-slate-500 text-sm">One-time payment</span>
                                </div>
                              </div>
                            </div>
                            {role === 'challenger' && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute top-3 right-3"
                              >
                                <div className="w-6 h-6 rounded-full bg-gold-500 flex items-center justify-center">
                                  <Check className="h-4 w-4 text-navy-900" />
                                </div>
                              </motion.div>
                            )}
                          </motion.div>

                          {/* Coach Option */}
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setRole('coach')}
                            className={`relative rounded-2xl border-2 p-6 cursor-pointer transition-all duration-200 ${
                              role === 'coach'
                                ? 'border-gold-500 bg-gold-500/10 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                                : 'border-navy-600 bg-navy-900 hover:border-gold-500/50'
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                role === 'coach' ? 'bg-gold-500 text-navy-900' : 'bg-navy-800 text-slate-400'
                              }`}>
                                <Users className="h-6 w-6" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <Label className="font-bold text-white text-lg cursor-pointer">
                                      I am a Coach / Captain
                                    </Label>
                                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full font-medium">
                                      LEADER
                                    </span>
                                  </div>
                                  <RadioGroupItem value="coach" className="border-slate-500 text-gold-500" />
                                </div>
                                <p className="text-slate-400 mb-4">
                                  Lead a team, access roster data, track team progress, and recruit challengers.
                                </p>
                                <div className="flex items-center gap-4">
                                  <span className="text-2xl font-bold text-gold-500">$49</span>
                                  <span className="text-slate-500 text-sm">One-time payment</span>
                                </div>
                              </div>
                            </div>
                            {role === 'coach' && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute top-3 right-3"
                              >
                                <div className="w-6 h-6 rounded-full bg-gold-500 flex items-center justify-center">
                                  <Check className="h-4 w-4 text-navy-900" />
                                </div>
                              </motion.div>
                            )}
                          </motion.div>
                        </RadioGroup>

                        {/* Smart Scale Toggle */}
                        <div className="pt-6 border-t border-navy-700">
                          <div className="flex items-center justify-between p-4 bg-navy-900 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-navy-800 flex items-center justify-center">
                                <Scale className="h-5 w-5 text-slate-300" />
                              </div>
                              <div>
                                <Label htmlFor="scale-toggle" className="font-medium text-white cursor-pointer">
                                  I have a Smart Scale
                                </Label>
                                <p className="text-slate-500 text-sm">Required for biometric tracking</p>
                              </div>
                            </div>
                            <Switch
                              id="scale-toggle"
                              checked={hasScale}
                              onCheckedChange={setHasScale}
                            />
                          </div>

                          <AnimatePresence>
                            {!hasScale && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                              >
                                <Alert className="mt-4 bg-gold-500/10 border-gold-500/30 rounded-xl">
                                  <AlertCircle className="h-4 w-4 text-gold-500" />
                                  <AlertTitle className="text-gold-400">Smart Scale Required</AlertTitle>
                                  <AlertDescription className="text-gold-300/80 text-sm mt-1">
                                    You need a scale that measures Body Fat & Visceral Fat to participate.
                                    <a
                                      href="https://amazon.com"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1 font-bold underline mt-2 text-gold-400 hover:text-gold-300"
                                    >
                                      Get the recommended scale <ExternalLink className="h-3 w-3" />
                                    </a>
                                  </AlertDescription>
                                </Alert>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Continue Button */}
                        <Button
                          onClick={handleRoleSelection}
                          className="w-full bg-gold-500 hover:bg-gold-600 text-navy-900 py-7 text-lg font-bold rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:-translate-y-0.5 transition-all duration-300"
                        >
                          Continue to Payment
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Step 3: Payment */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    custom={1}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border-navy-700 bg-navy-800/80 backdrop-blur-xl shadow-2xl overflow-hidden">
                      {/* Header */}
                      <div className="bg-navy-900/50 px-6 py-5 border-b border-navy-700">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-10 w-10 p-0 text-slate-400 hover:text-white hover:bg-navy-700 rounded-full"
                            onClick={() => setStep(2)}
                          >
                            <ArrowLeft className="h-5 w-5" />
                          </Button>
                          <div>
                            <h2 className="text-xl md:text-2xl font-bold text-white">Complete Your Order</h2>
                            <p className="text-slate-400 text-sm">
                              Secure payment for your {role === 'coach' ? 'Leadership' : 'Challenger'} access
                            </p>
                          </div>
                        </div>
                      </div>

                      <CardContent className="p-6 md:p-8 space-y-6">
                        {/* Order Summary */}
                        <div className="bg-navy-900 rounded-xl p-5 border border-navy-700">
                          <h3 className="text-slate-400 text-sm font-medium mb-4 uppercase tracking-wider">Order Summary</h3>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gold-500/20 flex items-center justify-center">
                                {role === 'coach' ? (
                                  <Users className="h-5 w-5 text-gold-500" />
                                ) : (
                                  <User className="h-5 w-5 text-gold-500" />
                                )}
                              </div>
                              <div>
                                <p className="text-white font-medium">
                                  {project?.name || '28-Day Metabolic Reset'}
                                </p>
                                <p className="text-slate-500 text-sm">
                                  {role === 'coach' ? 'Coach / Captain Access' : 'Challenger Access'}
                                </p>
                              </div>
                            </div>
                            <span className="text-2xl font-bold text-gold-500">
                              ${(amount / 100).toFixed(2)}
                            </span>
                          </div>
                          {project && (
                            <div className="flex items-center gap-2 mb-4 text-xs text-slate-500">
                              <Calendar className="h-3 w-3" />
                              <span>Challenge starts {new Date(project.startDate).toLocaleDateString()}</span>
                            </div>
                          )}
                          <div className="border-t border-navy-700 pt-4 flex items-center justify-between">
                            <span className="text-slate-400">Total</span>
                            <span className="text-xl font-bold text-white">${(amount / 100).toFixed(2)}</span>
                          </div>
                        </div>

                        {stripeError && (
                          <Alert variant="destructive" className="bg-red-900/20 border-red-800">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle className="text-red-400">System Error</AlertTitle>
                            <AlertDescription className="text-red-300">{stripeError}</AlertDescription>
                          </Alert>
                        )}

                        {isMockPayment ? (
                          <div className="text-center py-8">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-20 h-20 mx-auto mb-6 rounded-full bg-gold-500/20 flex items-center justify-center"
                            >
                              <CreditCard className="h-10 w-10 text-gold-500" />
                            </motion.div>
                            <h3 className="text-xl font-bold mb-2 text-white">Demo Mode</h3>
                            <p className="text-slate-400 mb-6 max-w-sm mx-auto">
                              Payment bypassed for demo purposes. Click below to complete your registration.
                            </p>
                            <Button
                              onClick={handlePaymentSuccess}
                              disabled={registerMutation.isPending}
                              className="w-full bg-gold-500 hover:bg-gold-600 text-navy-900 py-7 text-lg font-bold rounded-xl"
                            >
                              {registerMutation.isPending ? (
                                <>
                                  <Loader2 className="animate-spin mr-2 h-5 w-5" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  Complete Registration
                                  <ArrowRight className="ml-2 h-5 w-5" />
                                </>
                              )}
                            </Button>
                          </div>
                        ) : clientSecret && stripePromise ? (
                          <Elements stripe={stripePromise} options={{ clientSecret }}>
                            <PaymentForm onSuccess={handlePaymentSuccess} amount={amount} />
                          </Elements>
                        ) : clientSecret && !stripePromise && stripeKey ? (
                          <Alert variant="destructive" className="bg-red-900/20 border-red-800">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle className="text-red-400">Configuration Error</AlertTitle>
                            <AlertDescription className="text-red-300">
                              Stripe failed to initialize. Please check your configuration.
                            </AlertDescription>
                          </Alert>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="h-10 w-10 animate-spin text-gold-500 mb-4" />
                            <p className="text-slate-400">Loading payment form...</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Step 4: Success */}
                {step === 4 && (
                  <motion.div
                    key="step4"
                    custom={1}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border-navy-700 bg-navy-800/80 backdrop-blur-xl shadow-2xl overflow-hidden">
                      <CardContent className="p-8 md:p-12 text-center">
                        {/* Success Animation */}
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", duration: 0.6 }}
                          className="w-24 h-24 mx-auto mb-8 rounded-full bg-green-500/20 flex items-center justify-center"
                        >
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                          >
                            <Check className="h-12 w-12 text-green-500" />
                          </motion.div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                            Welcome to {project?.name || 'the Reset'}!
                          </h2>
                          <p className="text-xl text-slate-400 mb-8 max-w-md mx-auto">
                            You're officially part of the {project?.name || '28-Day Metabolic Reset'}. Your transformation journey begins now.
                          </p>
                        </motion.div>

                        {/* What's Next */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          className="bg-navy-900 rounded-xl p-6 mb-8 text-left"
                        >
                          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-gold-500" />
                            What's Next?
                          </h3>
                          <div className="space-y-3">
                            {[
                              "Set up your smart scale and take your first reading",
                              "Complete your profile in the dashboard",
                              "Log your first daily habits (Water, Steps, Sleep)",
                              "Join the community and meet your team"
                            ].map((item, i) => (
                              <div key={i} className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-gold-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                  <span className="text-gold-500 text-sm font-bold">{i + 1}</span>
                                </div>
                                <span className="text-slate-300">{item}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.7 }}
                        >
                          <Button
                            onClick={() => navigate('/app')}
                            className="w-full bg-gold-500 hover:bg-gold-600 text-navy-900 py-7 text-lg font-bold rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-all duration-300"
                          >
                            Go to Your Dashboard
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </Button>
                        </motion.div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Side - Benefits Panel (Desktop Only) */}
            <div className="hidden lg:block lg:col-span-2">
              <div className="sticky top-8">
                <Card className="border-navy-700 bg-navy-800/50 backdrop-blur-xl">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                      <Zap className="h-5 w-5 text-gold-500" />
                      What You Get
                    </h3>
                    <div className="space-y-4">
                      {[
                        {
                          icon: Activity,
                          title: "Metabolic Tracking",
                          desc: "Track 5 key biomarkers weekly"
                        },
                        {
                          icon: Target,
                          title: "Daily Habit Loops",
                          desc: "Water, Steps, Sleep & Lessons"
                        },
                        {
                          icon: TrendingDown,
                          title: "Visceral Fat Focus",
                          desc: "Target the dangerous belly fat"
                        },
                        {
                          icon: Users,
                          title: "Community Support",
                          desc: "Join 2,000+ active participants"
                        }
                      ].map((item, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * i }}
                          className="flex items-start gap-3"
                        >
                          <div className="w-10 h-10 rounded-lg bg-navy-900 flex items-center justify-center shrink-0">
                            <item.icon className="h-5 w-5 text-gold-500" />
                          </div>
                          <div>
                            <h4 className="text-white font-medium">{item.title}</h4>
                            <p className="text-slate-500 text-sm">{item.desc}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Testimonial */}
                    <div className="mt-8 pt-6 border-t border-navy-700">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-navy-900 flex items-center justify-center text-white font-bold text-sm">
                          SM
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">Sarah M.</p>
                          <p className="text-slate-500 text-xs">Lost 4 years metabolic age</p>
                        </div>
                      </div>
                      <p className="text-slate-400 text-sm italic">
                        "Finally, a program that explains WHY, not just HOW. The tracking made all the difference."
                      </p>
                    </div>

                    {/* Guarantee */}
                    <div className="mt-6 p-4 bg-green-900/20 border border-green-800/30 rounded-xl">
                      <div className="flex items-center gap-2 text-green-400 font-medium text-sm mb-1">
                        <Shield className="h-4 w-4" />
                        100% Satisfaction Guarantee
                      </div>
                      <p className="text-green-300/70 text-xs">
                        If you don't see results, we'll work with you until you do.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}
