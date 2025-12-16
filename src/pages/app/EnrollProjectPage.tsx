import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, AlertCircle, Calendar, Users, CreditCard, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useUser, useProject, useEnrollInProject, usePaymentIntent } from '@/hooks/use-queries';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import confetti from 'canvas-confetti';

// Initialize Stripe
let stripePromise: Promise<any> | null = null;
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
try {
  if (stripeKey) {
    stripePromise = loadStripe(stripeKey);
  }
} catch (e) {
  console.warn('Failed to initialize Stripe:', e);
}

// Payment form component
function PaymentForm({
  onSuccess,
  isProcessing,
  setIsProcessing
}: {
  onSuccess: () => void;
  isProcessing: boolean;
  setIsProcessing: (v: boolean) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required'
    });

    if (submitError) {
      setError(submitError.message || 'Payment failed');
      setIsProcessing(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {error && (
        <Alert variant="destructive" className="bg-red-900/20 border-red-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold py-6"
      >
        {isProcessing ? (
          <><Loader2 className="animate-spin mr-2" /> Processing...</>
        ) : (
          'Complete Payment'
        )}
      </Button>
    </form>
  );
}

export function EnrollProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { data: user, isLoading: userLoading } = useUser();
  const { data: project, isLoading: projectLoading } = useProject(projectId || null);
  const enrollMutation = useEnrollInProject();
  const paymentIntentMutation = usePaymentIntent();

  const [step, setStep] = useState<'confirm' | 'payment' | 'success'>('confirm');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isMockPayment, setIsMockPayment] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const isCoach = user?.role === 'coach';
  const amount = isCoach ? 4900 : 2800; // $49 for coaches, $28 for challengers

  // Trigger confetti on success
  useEffect(() => {
    if (step === 'success') {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#FBBF24', '#FCD34D', '#22C55E', '#10B981']
      });
    }
  }, [step]);

  if (userLoading || projectLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
      </div>
    );
  }

  if (!project || !project.id) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-navy-900 dark:text-white mb-2">Project Not Found</h2>
        <p className="text-slate-500 mb-6">The project you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/app/projects')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to My Projects
        </Button>
      </div>
    );
  }

  if (!project.registrationOpen) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-navy-900 dark:text-white mb-2">Registration Closed</h2>
        <p className="text-slate-500 mb-6">This project is not accepting new registrations.</p>
        <Button onClick={() => navigate('/app/projects')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to My Projects
        </Button>
      </div>
    );
  }

  const handleStartEnrollment = async () => {
    setIsProcessing(true);
    try {
      const result = await paymentIntentMutation.mutateAsync(amount);
      if (result.mock) {
        setIsMockPayment(true);
        // For mock payments, complete enrollment immediately
        handlePaymentSuccess();
      } else if (result.clientSecret) {
        setClientSecret(result.clientSecret);
        setStep('payment');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Failed to create payment intent:', error);
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      await enrollMutation.mutateAsync({
        projectId: project.id
      });
      setStep('success');
    } catch (error) {
      console.error('Failed to enroll:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Success state
  if (step === 'success') {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-3xl font-bold text-navy-900 dark:text-white mb-4">
          You're Enrolled!
        </h2>
        <p className="text-slate-600 dark:text-slate-300 mb-8 max-w-md mx-auto">
          Welcome to <span className="font-semibold">{project.name}</span>!
          You're all set to start your transformation journey.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => navigate('/app')} className="bg-gold-500 hover:bg-gold-600 text-navy-900">
            Go to Dashboard
          </Button>
          <Button variant="outline" onClick={() => navigate('/app/projects')}>
            View My Projects
          </Button>
        </div>
      </div>
    );
  }

  // Payment step
  if (step === 'payment' && clientSecret && stripePromise) {
    return (
      <div className="max-w-xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => setStep('confirm')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card className="border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900">
          <CardHeader>
            <CardTitle className="text-navy-900 dark:text-white">Complete Payment</CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              Enter your payment details to enroll in {project.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 p-4 bg-slate-50 dark:bg-navy-950 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-600 dark:text-slate-400">
                  {isCoach ? 'Group Leader Access' : 'Challenger Access'}
                </span>
                <span className="font-bold text-navy-900 dark:text-white">
                  ${(amount / 100).toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {project.name}
              </p>
            </div>

            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm
                onSuccess={handlePaymentSuccess}
                isProcessing={isProcessing}
                setIsProcessing={setIsProcessing}
              />
            </Elements>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Confirmation step
  return (
    <div className="max-w-2xl mx-auto">
      <Button
        variant="ghost"
        onClick={() => navigate('/app/projects')}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to My Projects
      </Button>

      <Card className="border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900">
        <CardHeader>
          <CardTitle className="text-navy-900 dark:text-white text-2xl">
            Join {project.name}
          </CardTitle>
          {project.description && (
            <CardDescription className="text-slate-500 dark:text-slate-400">
              {project.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Project Details */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-navy-950 rounded-lg">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Start Date</p>
                <p className="font-medium text-navy-900 dark:text-white">
                  {new Date(project.startDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">End Date</p>
                <p className="font-medium text-navy-900 dark:text-white">
                  {new Date(project.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="p-6 border border-gold-500/30 bg-gold-50 dark:bg-gold-900/10 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gold-500/20 rounded-full flex items-center justify-center">
                  {isCoach ? (
                    <Users className="h-6 w-6 text-gold-600" />
                  ) : (
                    <CreditCard className="h-6 w-6 text-gold-600" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-navy-900 dark:text-white">
                    {isCoach ? 'Group Leader' : 'Challenger'} Access
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {isCoach ? 'Lead your team in this challenge' : 'Join the 28-day challenge'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gold-600">
                  ${(amount / 100).toFixed(0)}
                </p>
              </div>
            </div>

            {isCoach && (
              <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <Users className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700 dark:text-blue-300">
                  As a Group Leader, you can recruit and lead participants in this challenge.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <Button
            onClick={handleStartEnrollment}
            disabled={isProcessing}
            className="w-full bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold py-6 text-lg"
          >
            {isProcessing ? (
              <><Loader2 className="animate-spin mr-2" /> Processing...</>
            ) : (
              <>Enroll Now - ${(amount / 100).toFixed(0)}</>
            )}
          </Button>

          <p className="text-xs text-center text-slate-500 dark:text-slate-400">
            By enrolling, you agree to participate in the full 28-day challenge program.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
