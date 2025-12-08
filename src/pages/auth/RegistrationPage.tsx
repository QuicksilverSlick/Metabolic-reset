import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Check, ChevronRight, CreditCard, User, Users, ArrowLeft, Loader2, AlertCircle, Scale, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MarketingLayout } from '@/components/layout/MarketingLayout';
import { useRegister, usePaymentIntent } from '@/hooks/use-queries';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
// Initialize Stripe with error handling
let stripePromise: Promise<any> | null = null;
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
try {
  if (stripeKey) {
    stripePromise = loadStripe(stripeKey);
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
function PaymentForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
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
      <PaymentElement />
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Payment Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6 text-lg"
      >
        {processing ? <Loader2 className="animate-spin mr-2" /> : 'Pay Now'}
      </Button>
    </form>
  );
}
export function RegistrationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referralCodeUsed = searchParams.get('ref') || undefined;
  const registerMutation = useRegister();
  const paymentIntentMutation = usePaymentIntent();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<'challenger' | 'coach'>('challenger');
  const [hasScale, setHasScale] = useState(true);
  const [formData, setFormData] = useState<PersonalInfo | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isMockPayment, setIsMockPayment] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<PersonalInfo>({
    resolver: zodResolver(personalInfoSchema)
  });
  const onPersonalInfoSubmit = (data: PersonalInfo) => {
    setFormData(data);
    setStep(2);
  };
  const handleRoleSelection = async () => {
    setStep(3);
    setStripeError(null);
    // Initialize Payment Intent
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
      // Fallback to mock if API fails (dev resilience) or show error
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
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
      setStep(4);
    } catch (err) {
      // Error handled by mutation hook toast
    }
  };
  const variants = {
    enter: { x: 20, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 }
  };
  return (
    <MarketingLayout>
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-xs font-medium text-slate-500 mb-2">
              <span>Info</span>
              <span>Role</span>
              <span>Payment</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 transition-all duration-500 ease-in-out"
                style={{ width: `${(step / 4) * 100}%` }}
              ></div>
            </div>
          </div>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <Card className="border-slate-200 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl text-navy-900">Let's Get Started</CardTitle>
                    <CardDescription>Enter your details to join the study.</CardDescription>
                  </CardHeader>
                  <form onSubmit={handleSubmit(onPersonalInfoSubmit)}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" placeholder="Jane Doe" {...register('name')} />
                        {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" placeholder="jane@example.com" {...register('email')} />
                        {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Mobile Phone</Label>
                        <Input id="phone" type="tel" placeholder="(555) 123-4567" {...register('phone')} />
                        {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
                      </div>
                      {referralCodeUsed && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800 flex items-center gap-2">
                          <Check className="h-4 w-4" />
                          <span>Referral Code Applied: <strong>{referralCodeUsed}</strong></span>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button type="submit" className="w-full bg-navy-900 hover:bg-navy-800 text-white">
                        Next Step <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </motion.div>
            )}
            {step === 2 && (
              <motion.div
                key="step2"
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <Card className="border-slate-200 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Button variant="ghost" size="sm" className="-ml-2 h-8 w-8 p-0" onClick={() => setStep(1)}>
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <CardTitle className="text-2xl text-navy-900">Choose Your Role</CardTitle>
                    </div>
                    <CardDescription>Are you joining as a Challenger or a Coach?</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <RadioGroup value={role} onValueChange={(v) => setRole(v as 'challenger' | 'coach')}>
                      <div className={`relative flex items-start space-x-4 rounded-xl border p-4 cursor-pointer transition-all ${role === 'challenger' ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500' : 'border-slate-200 hover:border-orange-200'}`}>
                        <RadioGroupItem value="challenger" id="challenger" className="mt-1" />
                        <div className="flex-1" onClick={() => setRole('challenger')}>
                          <Label htmlFor="challenger" className="font-bold text-navy-900 cursor-pointer">
                            I am a Challenger
                          </Label>
                          <p className="text-sm text-slate-600 mt-1">
                            I want to track my health, lose weight, and improve my metabolic age.
                          </p>
                          <div className="mt-2 font-bold text-orange-600">$28.00</div>
                        </div>
                        <User className="h-6 w-6 text-slate-400" />
                      </div>
                      <div className={`relative flex items-start space-x-4 rounded-xl border p-4 cursor-pointer transition-all ${role === 'coach' ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500' : 'border-slate-200 hover:border-orange-200'}`}>
                        <RadioGroupItem value="coach" id="coach" className="mt-1" />
                        <div className="flex-1" onClick={() => setRole('coach')}>
                          <Label htmlFor="coach" className="font-bold text-navy-900 cursor-pointer">
                            I am a Coach / Captain
                          </Label>
                          <p className="text-sm text-slate-600 mt-1">
                            I want to lead a team, access roster data, and recruit others.
                          </p>
                          <div className="mt-2 font-bold text-orange-600">$49.00</div>
                        </div>
                        <Users className="h-6 w-6 text-slate-400" />
                      </div>
                    </RadioGroup>
                    <div className="pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Scale className="h-5 w-5 text-navy-900" />
                          <Label htmlFor="scale-toggle" className="font-medium text-navy-900">
                            Do you have a Smart Scale?
                          </Label>
                        </div>
                        <Switch
                          id="scale-toggle"
                          checked={hasScale}
                          onCheckedChange={setHasScale}
                        />
                      </div>
                      {!hasScale && (
                        <Alert className="bg-orange-50 border-orange-200">
                          <AlertCircle className="h-4 w-4 text-orange-600" />
                          <AlertTitle className="text-orange-800">Smart Scale Required</AlertTitle>
                          <AlertDescription className="text-orange-700 text-sm mt-1">
                            You need a scale that measures Body Fat & Visceral Fat to participate.
                            <a 
                              href="https://amazon.com" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 font-bold underline mt-2 hover:text-orange-900"
                            >
                              Get the recommended scale <ExternalLink className="h-3 w-3" />
                            </a>
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleRoleSelection} className="w-full bg-navy-900 hover:bg-navy-800 text-white">
                      Proceed to Payment <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )}
            {step === 3 && (
              <motion.div
                key="step3"
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <Card className="border-slate-200 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Button variant="ghost" size="sm" className="-ml-2 h-8 w-8 p-0" onClick={() => setStep(2)}>
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <CardTitle className="text-2xl text-navy-900">Secure Payment</CardTitle>
                    </div>
                    <CardDescription>
                      You are paying <span className="font-bold text-navy-900">${role === 'coach' ? '49.00' : '28.00'}</span> to join the Reset.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {stripeError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>System Error</AlertTitle>
                        <AlertDescription>{stripeError}</AlertDescription>
                      </Alert>
                    )}
                    {isMockPayment ? (
                      <div className="text-center py-8">
                        <div className="bg-orange-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                          <CreditCard className="h-8 w-8 text-orange-500" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Demo Mode</h3>
                        <p className="text-slate-500 mb-6">Stripe keys not configured. Proceeding with mock payment.</p>
                        <Button
                          onClick={handlePaymentSuccess}
                          disabled={registerMutation.isPending}
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6 text-lg"
                        >
                          {registerMutation.isPending ? <Loader2 className="animate-spin" /> : 'Complete Registration (Mock)'}
                        </Button>
                      </div>
                    ) : clientSecret && stripePromise ? (
                      <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <PaymentForm onSuccess={handlePaymentSuccess} />
                      </Elements>
                    ) : clientSecret && !stripePromise && stripeKey ? (
                       <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Configuration Error</AlertTitle>
                        <AlertDescription>Stripe failed to initialize. Please check your configuration.</AlertDescription>
                      </Alert>
                    ) : (
                      <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
            {step === 4 && (
              <motion.div
                key="step4"
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <Card className="border-slate-200 shadow-lg">
                  <CardContent className="pt-12 pb-8">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Check className="h-10 w-10 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-display font-bold text-navy-900 mb-4">You're In!</h2>
                    <p className="text-slate-600 mb-8 max-w-xs mx-auto">
                      Welcome to the Metabolic Reset. Your journey starts now.
                    </p>
                    <Button
                      onClick={() => navigate('/app')}
                      className="w-full bg-navy-900 hover:bg-navy-800 text-white py-6 text-lg"
                    >
                      Go to Dashboard
                    </Button>
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