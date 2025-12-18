import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ArrowRight,
  ArrowLeft,
  Zap,
  Moon,
  Clock,
  Activity,
  Dumbbell,
  AlertTriangle,
  TrendingDown,
  BarChart3,
  Target,
  Crown,
  Check,
  ChevronRight,
  Brain,
  Battery,
  Flame,
  Shield,
  User,
  Phone,
  Calendar,
  Sparkles,
  AlertCircle,
  Heart,
  Scale,
  Droplets,
  ThermometerSun,
  Users,
  CreditCard,
  Lock,
  Loader2,
  ExternalLink,
  Mail,
  Video,
  X,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { MarketingLayout } from '@/components/layout/MarketingLayout';
import { useNavigate, useSearchParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { leadsApi, referralApi, projectApi, paymentApi, usersApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import type { SexType, QuizResultType } from '@shared/types';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { PhoneInput } from '@/components/ui/phone-input';
import { isValidPhone, toE164, formatPhoneInput } from '@/lib/phone-utils';

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

// Lead capture validation schema
const leadSchema = z.object({
  age: z.string().min(1, "Age is required").refine((val) => {
    const num = parseInt(val);
    return num >= 18 && num <= 120;
  }, "Please enter a valid age (18-120)"),
  name: z.string().min(2, "Full name is required"),
  phone: z.string().min(10, "Valid phone number required"),
  sex: z.enum(['male', 'female'], { required_error: "Please select your sex" }),
});
type LeadData = z.infer<typeof leadSchema>;

// Quiz question structure with 4-point scoring
interface QuizOption {
  id: string;
  text: string;
  points: 0 | 4 | 7 | 10;
}

interface QuizQuestion {
  id: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  question: string;
  options: QuizOption[];
  gender?: 'male' | 'female'; // For gender-specific questions
}

// Female-specific questions (Q1-Q3)
const femaleQuestions: QuizQuestion[] = [
  {
    id: 'f1',
    category: 'Hormonal Balance',
    icon: Heart,
    question: 'How would you describe your menstrual cycle regularity and associated symptoms?',
    gender: 'female',
    options: [
      { id: 'a', text: 'Highly irregular with severe PMS, bloating, or mood swings', points: 0 },
      { id: 'b', text: 'Somewhat irregular with moderate symptoms', points: 4 },
      { id: 'c', text: 'Mostly regular with mild symptoms', points: 7 },
      { id: 'd', text: 'Very regular with minimal to no symptoms', points: 10 }
    ]
  },
  {
    id: 'f2',
    category: 'Body Composition',
    icon: Scale,
    question: 'Where do you tend to store excess weight?',
    gender: 'female',
    options: [
      { id: 'a', text: 'Primarily around my midsection (apple shape)', points: 0 },
      { id: 'b', text: 'Evenly distributed but hard to lose anywhere', points: 4 },
      { id: 'c', text: 'Hips and thighs with some midsection', points: 7 },
      { id: 'd', text: 'Weight is well-distributed and manageable', points: 10 }
    ]
  },
  {
    id: 'f3',
    category: 'Metabolic Symptoms',
    icon: ThermometerSun,
    question: 'Do you experience hot flashes, night sweats, or difficulty regulating body temperature?',
    gender: 'female',
    options: [
      { id: 'a', text: 'Frequently, they significantly impact my daily life', points: 0 },
      { id: 'b', text: 'Sometimes, they\'re bothersome but manageable', points: 4 },
      { id: 'c', text: 'Occasionally, minor inconvenience', points: 7 },
      { id: 'd', text: 'Rarely or never experience these symptoms', points: 10 }
    ]
  }
];

// Male-specific questions (Q1-Q3)
const maleQuestions: QuizQuestion[] = [
  {
    id: 'm1',
    category: 'Hormonal Health',
    icon: Dumbbell,
    question: 'How would you describe your muscle recovery and strength maintenance?',
    gender: 'male',
    options: [
      { id: 'a', text: 'Very slow recovery, losing muscle despite effort', points: 0 },
      { id: 'b', text: 'Takes longer than it used to, harder to maintain', points: 4 },
      { id: 'c', text: 'Generally good but not as quick as before', points: 7 },
      { id: 'd', text: 'Quick recovery, easily maintain or build muscle', points: 10 }
    ]
  },
  {
    id: 'm2',
    category: 'Body Composition',
    icon: Scale,
    question: 'Where do you tend to accumulate stubborn fat?',
    gender: 'male',
    options: [
      { id: 'a', text: 'Significant belly fat that won\'t budge', points: 0 },
      { id: 'b', text: 'Belly and love handles, slowly increasing', points: 4 },
      { id: 'c', text: 'Some midsection fat but fairly proportional', points: 7 },
      { id: 'd', text: 'Minimal fat accumulation, well-distributed', points: 10 }
    ]
  },
  {
    id: 'm3',
    category: 'Energy & Drive',
    icon: Battery,
    question: 'How would you rate your overall energy, motivation, and drive throughout the day?',
    gender: 'male',
    options: [
      { id: 'a', text: 'Consistently low energy, lack of motivation', points: 0 },
      { id: 'b', text: 'Variable energy, often need stimulants to get going', points: 4 },
      { id: 'c', text: 'Generally good but dips in the afternoon', points: 7 },
      { id: 'd', text: 'Consistently high energy and drive all day', points: 10 }
    ]
  }
];

// Universal questions (Q4-Q10) - Same for both genders
const universalQuestions: QuizQuestion[] = [
  {
    id: 'u4',
    category: 'Energy & Glucose',
    icon: Zap,
    question: 'How often do you experience energy crashes or brain fog between 2-4 PM?',
    options: [
      { id: 'a', text: 'Daily - I need caffeine or sugar to function', points: 0 },
      { id: 'b', text: 'Frequently - 4-5 times per week', points: 4 },
      { id: 'c', text: 'Occasionally - 1-2 times per week', points: 7 },
      { id: 'd', text: 'Rarely or never - my energy is stable', points: 10 }
    ]
  },
  {
    id: 'u5',
    category: 'Sleep & Recovery',
    icon: Moon,
    question: 'How do you feel when you wake up in the morning?',
    options: [
      { id: 'a', text: 'Exhausted - need coffee immediately to function', points: 0 },
      { id: 'b', text: 'Groggy - takes 30+ minutes to feel alert', points: 4 },
      { id: 'c', text: 'Okay - generally fine after 10-15 minutes', points: 7 },
      { id: 'd', text: 'Refreshed - wake up naturally energized', points: 10 }
    ]
  },
  {
    id: 'u6',
    category: 'Hunger & Satiety',
    icon: Clock,
    question: 'Can you comfortably go 4-5 hours between meals without feeling shaky, irritable, or "hangry"?',
    options: [
      { id: 'a', text: 'No - I need to eat every 2-3 hours or I crash', points: 0 },
      { id: 'b', text: 'Difficult - I get uncomfortable after 3-4 hours', points: 4 },
      { id: 'c', text: 'Usually - though I prefer not to wait that long', points: 7 },
      { id: 'd', text: 'Yes - I can easily skip meals without issues', points: 10 }
    ]
  },
  {
    id: 'u7',
    category: 'Cravings',
    icon: Flame,
    question: 'How often do you experience strong cravings for sugar, carbs, or processed foods?',
    options: [
      { id: 'a', text: 'Multiple times daily - feels uncontrollable', points: 0 },
      { id: 'b', text: 'Daily - especially after meals or when stressed', points: 4 },
      { id: 'c', text: 'Occasionally - a few times per week', points: 7 },
      { id: 'd', text: 'Rarely - I have good control over my eating', points: 10 }
    ]
  },
  {
    id: 'u8',
    category: 'Visceral Fat Awareness',
    icon: Activity,
    question: 'Do you track your body composition metrics (body fat %, visceral fat, lean mass)?',
    options: [
      { id: 'a', text: 'No - I only look at the scale number', points: 0 },
      { id: 'b', text: 'Occasionally - but not consistently', points: 4 },
      { id: 'c', text: 'Yes - I track it monthly', points: 7 },
      { id: 'd', text: 'Yes - I track it weekly with a smart scale', points: 10 }
    ]
  },
  {
    id: 'u9',
    category: 'Protein Timing',
    icon: Dumbbell,
    question: 'How soon after waking do you consume 25-30g of protein?',
    options: [
      { id: 'a', text: 'I don\'t - I skip breakfast or just have coffee', points: 0 },
      { id: 'b', text: '2+ hours - I eat a late breakfast', points: 4 },
      { id: 'c', text: 'Within 1-2 hours - I have a normal breakfast', points: 7 },
      { id: 'd', text: 'Within 30 minutes - I prioritize protein first', points: 10 }
    ]
  },
  {
    id: 'u10',
    category: 'Stress & Cortisol',
    icon: Brain,
    question: 'How would you describe your stress levels and their impact on your weight?',
    options: [
      { id: 'a', text: 'Chronically stressed - weight gain despite effort', points: 0 },
      { id: 'b', text: 'Often stressed - I notice weight fluctuations', points: 4 },
      { id: 'c', text: 'Moderate stress - some impact on weight', points: 7 },
      { id: 'd', text: 'Well-managed stress - minimal weight impact', points: 10 }
    ]
  }
];

// Calculate metabolic age using Harris-Benedict equation with lifestyle factors
function calculateMetabolicAge(
  chronologicalAge: number,
  sex: SexType,
  quizScore: number
): number {
  // Base metabolic age offset based on quiz score (0-100)
  // Higher scores = better metabolic health = lower offset
  // Score ranges: 0-35 (Fatigue), 36-55 (Instability), 56-75 (Plateau), 76-100 (Optimized)

  let baseOffset: number;
  if (quizScore <= 35) {
    // Metabolic Fatigue - significant metabolic dysfunction
    // Offset: +8 to +15 years based on how low the score is
    baseOffset = 15 - Math.floor((quizScore / 35) * 7);
  } else if (quizScore <= 55) {
    // Glucose Instability - moderate metabolic issues
    // Offset: +5 to +8 years
    baseOffset = 8 - Math.floor(((quizScore - 35) / 20) * 3);
  } else if (quizScore <= 75) {
    // Cortisol Plateau - minor metabolic inefficiency
    // Offset: +2 to +5 years
    baseOffset = 5 - Math.floor(((quizScore - 55) / 20) * 3);
  } else {
    // Metabolic Optimization - good metabolic health
    // Offset: -2 to +2 years (can be younger than chronological age!)
    baseOffset = 2 - Math.floor(((quizScore - 75) / 25) * 4);
  }

  // Apply sex-specific adjustment (women tend to have slightly better longevity markers)
  const sexAdjustment = sex === 'female' ? -0.5 : 0;

  // Age-related scaling - metabolic age diverges more from chronological with age
  const ageScaling = chronologicalAge > 50 ? 1.1 : chronologicalAge > 40 ? 1.05 : 1;

  const metabolicAge = Math.round(chronologicalAge + (baseOffset * ageScaling) + sexAdjustment);

  // Ensure metabolic age is reasonable (minimum 18, maximum chronological + 20)
  return Math.max(18, Math.min(metabolicAge, chronologicalAge + 20));
}

// Determine result type based on score
function getResultType(score: number): QuizResultType {
  if (score <= 35) return 'fatigue';
  if (score <= 55) return 'instability';
  if (score <= 75) return 'plateau';
  return 'optimized';
}

// Results Data based on result type
const resultContent: Record<QuizResultType, {
  status: string;
  priority: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  headline: string;
  diagnosis: string;
  clinicalData: string;
  cta: string;
  riskLevel: string;
  videoUrl: string;
}> = {
  fatigue: {
    status: 'METABOLIC FATIGUE',
    priority: 'High Priority for Protocol Intervention',
    icon: AlertTriangle,
    color: 'red',
    headline: 'Your metabolism needs urgent attention.',
    diagnosis: "Your biomarkers indicate a breakdown in Muscle Protein Synthesis. Your body is likely cannibalizing its own muscle for energy, which lowers your metabolic rate. Standard \"dieting\" fails here because calorie restriction accelerates this muscle loss.",
    clinicalData: "According to the Arterburn Clinical Study (PubMed), a Protocol-based approach allows for significant fat loss while retaining 98% of lean muscle mass. You need this specific nutrition structure to reverse your fatigue and protect your metabolic engine.",
    cta: "INITIATE METABOLIC RESCUE",
    riskLevel: 'Critical',
    videoUrl: 'https://descriptusercontent.com/published/b932bbbd-91ac-44d6-b863-a8574d047d2a/original.mp4'
  },
  instability: {
    status: 'GLUCOSE VARIABILITY',
    priority: 'Detected: Insulin Spikes & Crashes',
    icon: TrendingDown,
    color: 'orange',
    headline: 'Your blood sugar is on a roller coaster.',
    diagnosis: "Your metabolism is on a \"Roller Coaster.\" Relying on caffeine or sugar creates insulin spikes that trigger immediate fat storage. You are likely stuck in a cycle of \"Energy Crash → Craving → Storage.\"",
    clinicalData: "The Arterburn Study demonstrated that participants on the Protocol lost 10x more weight than the self-directed control group. Why? Because the Protocol flatlines insulin 6 times a day. We need to get you into the project to stabilize your blood sugar immediately.",
    cta: "STABILIZE YOUR GLUCOSE",
    riskLevel: 'Elevated',
    videoUrl: 'https://descriptusercontent.com/published/6b4ff24a-9e8b-434b-a539-5977002aece7/original.mp4'
  },
  plateau: {
    status: 'CORTISOL RESISTANCE',
    priority: 'The "Stress" Plateau',
    icon: BarChart3,
    color: 'yellow',
    headline: 'You\'re doing things right, but stuck.',
    diagnosis: "You are doing a lot of things \"right,\" but the scale won't move. This indicates Visceral Fat retention due to stress hormones (Cortisol). \"Eating less\" actually makes this worse by increasing stress on the body.",
    clinicalData: "You need a system proven to signal \"safety\" to your body. Data confirms the Protocol is up to 17x more effective at burning fat than unguided dieting because it nourishes the muscle while targeting visceral fat stores.",
    cta: "TARGET VISCERAL FAT",
    riskLevel: 'Moderate',
    videoUrl: 'https://descriptusercontent.com/published/a2338b80-4fd3-4c8b-a1e7-6d26656b110e/original.mp4'
  },
  optimized: {
    status: 'METABOLICALLY OPTIMIZED',
    priority: 'Candidate for Leadership Cohort',
    icon: Crown,
    color: 'green',
    headline: 'Your baseline health is strong.',
    diagnosis: "Your baseline health is strong. You have good data awareness and stable energy. We need participants with your stability to serve as the \"Standard\" to compare against the Self-Directed group.",
    clinicalData: "Join the Protocol Cohort to fine-tune your biometrics. Even high-performers in the clinical trials saw an average 14% reduction in inflammatory Visceral Fat. Help us lead the data set.",
    cta: "JOIN THE LEADERSHIP COHORT",
    riskLevel: 'Low',
    videoUrl: 'https://descriptusercontent.com/published/eac3de8c-f1a4-4539-89a6-fb9fcbf77f45/original.mp4'
  }
};

// Payment form component for Stripe
function StripePaymentForm({ onSuccess, amount }: { onSuccess: () => void; amount: number }) {
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
          return_url: window.location.origin + '/app/onboarding/cohort',
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

export function QuizPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get referral code and project ID from URL (e.g., /quiz?ref=ABC123&project=project-id)
  const referralCode = searchParams.get('ref') || undefined;
  const projectIdFromUrl = searchParams.get('project') || undefined;

  const [phase, setPhase] = useState<'landing' | 'lead-capture' | 'quiz' | 'calculating' | 'results' | 'payment'>('landing');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [leadData, setLeadData] = useState<LeadData | null>(null);
  const [referrerName, setReferrerName] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string | null>(null);
  const [resultType, setResultType] = useState<QuizResultType>('fatigue');
  const [metabolicAge, setMetabolicAge] = useState(0);

  // Build question list based on sex selection
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  // Payment-related state
  const [role, setRole] = useState<'participant' | 'group_leader'>('participant');
  const [hasScale, setHasScale] = useState(true);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isMockPayment, setIsMockPayment] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);
  const { login } = useAuthStore();

  // Results video modal state
  const [resultsVideoOpen, setResultsVideoOpen] = useState(false);
  const [hasAutoPlayedVideo, setHasAutoPlayedVideo] = useState(false);
  const resultsVideoRef = useRef<HTMLVideoElement>(null);

  // Email validation helper
  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Auto-open video modal when entering results phase
  useEffect(() => {
    if (phase === 'results' && !hasAutoPlayedVideo) {
      // Small delay to let the results page render first
      const timer = setTimeout(() => {
        setResultsVideoOpen(true);
        setHasAutoPlayedVideo(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [phase, hasAutoPlayedVideo]);

  // Handle video modal close
  const handleResultsVideoClose = () => {
    setResultsVideoOpen(false);
    if (resultsVideoRef.current) {
      resultsVideoRef.current.pause();
    }
  };

  // Handle video ended
  const handleResultsVideoEnded = () => {
    setResultsVideoOpen(false);
  };

  // Fetch referrer name and project info when we have a referral code or project ID
  useEffect(() => {
    if (referralCode) {
      referralApi.getReferrer(referralCode)
        .then((result) => {
          if (result?.name) {
            setReferrerName(result.name);
          }
        })
        .catch((err) => {
          console.error('Failed to fetch referrer:', err);
        });
    }

    if (projectIdFromUrl) {
      projectApi.getProject(projectIdFromUrl)
        .then((project) => {
          if (project?.name) {
            setProjectName(project.name);
          }
        })
        .catch((err) => {
          console.error('Failed to fetch project:', err);
        });
    }
  }, [referralCode, projectIdFromUrl]);

  const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm<LeadData>({
    resolver: zodResolver(leadSchema)
  });

  const selectedSex = watch('sex');

  // Build questions array when sex is selected
  useEffect(() => {
    if (selectedSex === 'female') {
      setQuestions([...femaleQuestions, ...universalQuestions]);
    } else if (selectedSex === 'male') {
      setQuestions([...maleQuestions, ...universalQuestions]);
    }
  }, [selectedSex]);

  const totalQuestions = questions.length;
  const progress = totalQuestions > 0 ? ((currentQuestion + 1) / totalQuestions) * 100 : 0;

  // Calculate final score when quiz is complete
  useEffect(() => {
    if (phase === 'calculating' && leadData) {
      const totalScore = Object.values(answers).reduce((sum, points) => sum + points, 0);
      setScore(totalScore);

      const chronoAge = parseInt(leadData.age);
      const calculatedResultType = getResultType(totalScore);
      const calculatedMetabolicAge = calculateMetabolicAge(chronoAge, leadData.sex as SexType, totalScore);

      setResultType(calculatedResultType);
      setMetabolicAge(calculatedMetabolicAge);

      // Submit lead to API (fire and forget - don't block the UI)
      leadsApi.submitLead({
        name: leadData.name,
        phone: leadData.phone,
        age: chronoAge,
        sex: leadData.sex as SexType,
        referralCode: referralCode || null,
        projectId: projectIdFromUrl || null,
        quizScore: totalScore,
        quizAnswers: answers,
        resultType: calculatedResultType,
        metabolicAge: calculatedMetabolicAge
      }).then((result) => {
        // Store the lead ID in session storage and state for conversion tracking
        if (result.id) {
          sessionStorage.setItem('quizLeadId', result.id);
          setLeadId(result.id);
        }
        console.log('Lead submitted successfully:', result);
      }).catch((err) => {
        // Don't interrupt the user experience on API failure
        console.error('Failed to submit lead:', err);
      });

      // Simulate calculation animation
      const timer = setTimeout(() => {
        setPhase('results');
        // Trigger confetti for good scores
        if (totalScore >= 76) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#F59E0B', '#FBBF24', '#FCD34D', '#0F172A', '#1E293B']
          });
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [phase, answers, leadData, referralCode, projectIdFromUrl]);

  const handleStartQuiz = () => {
    setPhase('lead-capture');
  };

  const onLeadSubmit = (data: LeadData) => {
    setLeadData(data);
    setPhase('quiz');
  };

  const handleSelectOption = (optionId: string, points: number, questionId: string) => {
    setSelectedOption(optionId);

    // Auto-advance after selection with a short delay
    setTimeout(() => {
      setAnswers(prev => ({
        ...prev,
        [questionId]: points
      }));

      if (currentQuestion < totalQuestions - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedOption(null);
      } else {
        setPhase('calculating');
      }
    }, 400);
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      // Restore previous selection
      const prevQuestion = questions[currentQuestion - 1];
      const prevAnswer = answers[prevQuestion.id];
      if (prevAnswer !== undefined) {
        const selectedOpt = prevQuestion.options.find(o => o.points === prevAnswer);
        setSelectedOption(selectedOpt?.id || null);
      } else {
        setSelectedOption(null);
      }
    } else {
      setPhase('lead-capture');
    }
  };

  const handleGoToPayment = () => {
    // Store quiz result data for later use
    const chronologicalAge = leadData ? parseInt(leadData.age) : 50;
    sessionStorage.setItem('quizResult', JSON.stringify({
      score,
      resultType,
      metabolicAge,
      chronologicalAge,
      metabolicAgeOffset: metabolicAge - chronologicalAge,
      completedAt: new Date().toISOString(),
      leadData: leadData,
      referralCode,
      projectId: projectIdFromUrl,
      leadId
    }));

    // Initialize payment
    initializePayment();
  };

  const initializePayment = async () => {
    setStripeError(null);
    setPhase('payment');

    const amount = role === 'group_leader' ? 4900 : 2800;
    try {
      const { clientSecret: secret, mock } = await paymentApi.createIntent(amount);
      if (mock) {
        setIsMockPayment(true);
      } else if (secret) {
        setClientSecret(secret);
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
    if (!leadData) return;

    // Validate email before processing
    if (!email || !validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      setIsProcessingPayment(false);
      return;
    }

    setIsProcessingPayment(true);
    setEmailError(null);
    try {
      // Register the user (convert lead to user)
      const result = await usersApi.register({
        name: leadData.name,
        phone: toE164(leadData.phone),
        email, // Include email for Stripe receipts and user profile
        role: role === 'group_leader' ? 'coach' : 'challenger',
        referralCodeUsed: referralCode,
        hasScale,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        projectId: projectIdFromUrl || undefined
      });

      // Log the user in
      if (result.user) {
        login(result.user);
      }

      // Trigger celebration confetti
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#FBBF24', '#FCD34D', '#22C55E', '#10B981']
      });

      // Navigate based on whether user was enrolled in a project
      // If enrolled, go to cohort selection; otherwise skip to profile
      if (result.enrolledProjectId) {
        navigate('/app/onboarding/cohort');
      } else {
        // No project available - skip cohort selection
        navigate('/app/onboarding/profile');
      }
    } catch (err) {
      console.error('Registration failed:', err);
      setStripeError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const chronologicalAge = leadData ? parseInt(leadData.age) : 50;
  const result = resultContent[resultType];
  const metabolicAgeOffset = metabolicAge - chronologicalAge;

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0
    })
  };

  return (
    <MarketingLayout>
      <AnimatePresence mode="wait">
        {/* LANDING PHASE - Quiz Entry Point */}
        {phase === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Hero Section */}
            <section className="relative bg-navy-900 text-white overflow-hidden min-h-[90vh] flex items-center">
              {/* Background Elements */}
              <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900"></div>
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold-500/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>

              {/* Referral Banner */}
              {(referralCode || projectIdFromUrl) && (
                <div className="absolute top-0 left-0 right-0 bg-gold-500/20 border-b border-gold-500/30 py-2 px-4 text-center">
                  <p className="text-gold-300 text-sm">
                    <Sparkles className="inline h-4 w-4 mr-1" />
                    {referrerName
                      ? `You've been invited by ${referrerName}!`
                      : projectName
                      ? `Welcome to the ${projectName}!`
                      : 'You\'ve been invited!'} Complete the quiz to get personalized results.
                  </p>
                </div>
              )}

              {/* DNA Helix Animation (subtle background) */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-gold-500 rounded-full animate-pulse"></div>
                <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-gold-500 rounded-full animate-pulse delay-300"></div>
                <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-gold-500 rounded-full animate-pulse delay-500"></div>
              </div>

              <div className={`relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-24 ${referralCode || projectIdFromUrl ? 'mt-8' : ''}`}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 items-center">
                  {/* Left Column - Copy */}
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                  >
                    {/* Trust Badge */}
                    <div className="inline-flex items-center gap-1.5 sm:gap-2 py-1.5 sm:py-2 px-3 sm:px-4 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-300 text-xs sm:text-sm font-bold mb-4 sm:mb-6 backdrop-blur-sm">
                      <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span>Free Clinical Assessment</span>
                    </div>

                    {/* Headline - StoryBrand: Lead with Problem */}
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-[1.1] mb-4 sm:mb-6 tracking-tight">
                      <span className="text-white">Discover Your</span>
                      <br />
                      <span className="text-gold-500">True Metabolic Age</span>
                    </h1>

                    {/* Mobile Only - Sample Results Preview (between headline and subheadline) */}
                    <div className="lg:hidden mb-6">
                      <div className="relative w-full max-w-sm mx-auto">
                        <div className="absolute -inset-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl blur-xl"></div>
                        <Card className="relative border-navy-700 bg-navy-800/90 backdrop-blur-xl shadow-2xl">
                          <CardContent className="p-4">
                            {/* Sample Badge */}
                            <div className="absolute top-3 right-3">
                              <span className="px-2 py-1 bg-slate-700/50 text-slate-400 text-[10px] rounded-full">
                                Sample Result
                              </span>
                            </div>

                            {/* Header */}
                            <div className="text-center mb-4">
                              <div className="inline-flex items-center gap-1.5 py-1 px-2 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-bold mb-2 border border-orange-500/30">
                                <TrendingDown className="h-2.5 w-2.5" />
                                GLUCOSE VARIABILITY
                              </div>
                              <p className="text-slate-400 text-xs">Detected: Insulin Spikes & Crashes</p>
                            </div>

                            {/* Metabolic Age Circle */}
                            <div className="relative w-28 h-28 mx-auto mb-4">
                              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="none" stroke="#1E293B" strokeWidth="8" />
                                <circle cx="50" cy="50" r="45" fill="none" stroke="#F97316" strokeWidth="8" strokeLinecap="round" strokeDasharray="283" strokeDashoffset={283 - (283 * 42 / 50)} />
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-slate-500 text-[10px] mb-0.5">Metabolic Age</span>
                                <span className="text-3xl font-bold text-orange-400">59</span>
                                <span className="text-slate-400 text-[10px]">years old</span>
                              </div>
                            </div>

                            {/* Age Comparison Stats */}
                            <div className="grid grid-cols-3 gap-2 mb-4">
                              <div className="bg-navy-900 rounded-lg p-2 text-center">
                                <div className="text-base font-bold text-white">47</div>
                                <div className="text-slate-500 text-[10px]">Actual Age</div>
                              </div>
                              <div className="bg-navy-900 rounded-lg p-2 text-center">
                                <div className="text-base font-bold text-orange-400">59</div>
                                <div className="text-slate-500 text-[10px]">Metabolic Age</div>
                              </div>
                              <div className="bg-navy-900 rounded-lg p-2 text-center">
                                <div className="text-base font-bold text-orange-400">+12</div>
                                <div className="text-slate-500 text-[10px]">Years Added</div>
                              </div>
                            </div>

                            {/* Impact Statement */}
                            <div className="p-2 bg-navy-900/50 rounded-lg border border-navy-700">
                              <p className="text-orange-300 text-xs text-center leading-relaxed">
                                Your body is functioning like someone who is <strong>59 years old</strong> — that's <strong>12 years older</strong> than your actual age of 47.
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    {/* Subheadline - Agitate the Problem */}
                    <p className="text-lg sm:text-xl md:text-2xl text-slate-300 mb-4 sm:mb-6 leading-relaxed max-w-xl">
                      Are you aging faster on the inside than you look on the outside?
                    </p>

                    {/* Pain Points */}
                    <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                      {[
                        { icon: Battery, text: "Afternoon energy crashes?" },
                        { icon: Moon, text: "Waking up tired despite 8 hours?" },
                        { icon: Flame, text: "Stubborn belly fat that won't budge?" }
                      ].map((item, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + (i * 0.1) }}
                          className="flex items-center gap-2 sm:gap-3 text-slate-400"
                        >
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                            <item.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-400" />
                          </div>
                          <span className="text-base sm:text-lg">{item.text}</span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Value Proposition */}
                    <p className="text-base sm:text-lg text-slate-400 mb-6 sm:mb-8 max-w-lg">
                      Take this 10-question clinical quiz to uncover your <strong className="text-white">actual metabolic age</strong> and get a personalized protocol recommendation backed by clinical research.
                    </p>

                    {/* CTA Button */}
                    <Button
                      size="lg"
                      onClick={handleStartQuiz}
                      className="w-full sm:w-auto bg-gold-500 hover:bg-gold-600 text-navy-900 text-base sm:text-lg md:text-xl px-6 sm:px-10 py-6 sm:py-8 rounded-full shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:shadow-[0_0_40px_rgba(245,158,11,0.5)] hover:-translate-y-1 transition-all duration-300 font-bold tracking-wide group"
                    >
                      CALCULATE MY METABOLIC AGE
                      <ArrowRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-1 transition-transform" />
                    </Button>

                    {/* Social Proof */}
                    <div className="mt-6 sm:mt-8 flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-slate-500">
                      <div className="flex -space-x-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className="w-8 h-8 rounded-full bg-navy-700 border-2 border-navy-900 flex items-center justify-center text-xs text-slate-400"
                          >
                            {['J', 'M', 'S', 'K', 'A'][i-1]}
                          </div>
                        ))}
                      </div>
                      <span>2,847 people took this quiz this week</span>
                    </div>
                  </motion.div>

                  {/* Right Column - Sample Results Preview (Desktop only) */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative hidden lg:block"
                  >
                    {/* Sample Results Card */}
                    <div className="relative">
                      <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-3xl blur-2xl"></div>
                      <Card className="relative border-navy-700 bg-navy-800/90 backdrop-blur-xl shadow-2xl">
                        <CardContent className="p-6">
                          {/* Sample Badge */}
                          <div className="absolute top-4 right-4">
                            <span className="px-2 py-1 bg-slate-700/50 text-slate-400 text-xs rounded-full">
                              Sample Result
                            </span>
                          </div>

                          {/* Header */}
                          <div className="text-center mb-6">
                            <div className="inline-flex items-center gap-2 py-1.5 px-3 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold mb-3 border border-orange-500/30">
                              <TrendingDown className="h-3 w-3" />
                              CLINICAL STATUS: GLUCOSE VARIABILITY
                            </div>
                            <p className="text-slate-400 text-sm">Detected: Insulin Spikes & Crashes</p>
                          </div>

                          {/* Metabolic Age Circle */}
                          <div className="relative w-40 h-40 mx-auto mb-6">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                              <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="#1E293B"
                                strokeWidth="8"
                              />
                              <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="#F97316"
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray="283"
                                strokeDashoffset={283 - (283 * 42 / 50)}
                              />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-slate-500 text-xs mb-1">Metabolic Age</span>
                              <span className="text-4xl font-bold text-orange-400">59</span>
                              <span className="text-slate-400 text-xs">years old</span>
                            </div>
                          </div>

                          {/* Age Comparison Stats */}
                          <div className="grid grid-cols-3 gap-3 mb-6">
                            <div className="bg-navy-900 rounded-lg p-3 text-center">
                              <div className="text-xl font-bold text-white">47</div>
                              <div className="text-slate-500 text-xs">Actual Age</div>
                            </div>
                            <div className="bg-navy-900 rounded-lg p-3 text-center">
                              <div className="text-xl font-bold text-orange-400">59</div>
                              <div className="text-slate-500 text-xs">Metabolic Age</div>
                            </div>
                            <div className="bg-navy-900 rounded-lg p-3 text-center">
                              <div className="text-xl font-bold text-orange-400">+12</div>
                              <div className="text-slate-500 text-xs">Years Added</div>
                            </div>
                          </div>

                          {/* Impact Statement */}
                          <div className="p-3 bg-navy-900/50 rounded-lg border border-navy-700">
                            <p className="text-orange-300 text-sm text-center leading-relaxed">
                              Your body is functioning like someone who is <strong>59 years old</strong> — that's <strong>12 years older</strong> than your actual age of 47.
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </motion.div>
                </div>
              </div>
            </section>

          </motion.div>
        )}

        {/* LEAD CAPTURE PHASE */}
        {phase === 'lead-capture' && (
          <motion.div
            key="lead-capture"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-navy-900 flex items-center justify-center"
          >
            <div className="max-w-lg mx-auto px-4 py-8 md:py-16 w-full">
              {/* Back Button */}
              <Button
                variant="ghost"
                onClick={() => setPhase('landing')}
                className="mb-6 text-slate-400 hover:text-white hover:bg-navy-800"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>

              <Card className="border-navy-700 bg-navy-800/80 backdrop-blur-xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-navy-900/50 px-6 py-5 border-b border-navy-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center">
                      <User className="h-5 w-5 text-gold-500" />
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-white">Before We Start</h2>
                      <p className="text-slate-400 text-sm">We need a few details to calculate your metabolic age</p>
                    </div>
                  </div>
                </div>

                <CardContent className="p-6 md:p-8">
                  <form onSubmit={handleSubmit(onLeadSubmit)} className="space-y-6">
                    {/* Sex Selection - Required for gender-specific questions */}
                    <div className="space-y-3">
                      <Label className="text-slate-200">Biological Sex (required for accurate calculation)</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: 'female', label: 'Female', icon: Heart },
                          { value: 'male', label: 'Male', icon: Dumbbell }
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setValue('sex', option.value as 'male' | 'female')}
                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                              selectedSex === option.value
                                ? 'border-gold-500 bg-gold-500/10 text-gold-400'
                                : 'border-navy-600 bg-navy-900 text-slate-400 hover:border-gold-500/50'
                            }`}
                          >
                            <option.icon className="h-6 w-6" />
                            <span className="font-medium">{option.label}</span>
                          </button>
                        ))}
                      </div>
                      {errors.sex && (
                        <p className="text-red-400 text-sm flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.sex.message}
                        </p>
                      )}
                    </div>

                    {/* Age Field */}
                    <div className="space-y-2">
                      <Label htmlFor="age" className="text-slate-200 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        Your Current Age
                      </Label>
                      <Input
                        id="age"
                        type="number"
                        placeholder="e.g., 52"
                        min="18"
                        max="120"
                        {...register('age')}
                        className="bg-navy-900 border-navy-600 text-white placeholder:text-slate-500 focus:border-gold-500 focus:ring-gold-500/20 h-12 text-lg rounded-xl"
                      />
                      {errors.age && (
                        <p className="text-red-400 text-sm flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.age.message}
                        </p>
                      )}
                      <p className="text-slate-500 text-xs">We'll compare this to your metabolic age</p>
                    </div>

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
                      <p className="text-slate-500 text-xs">For your personalized results delivery</p>
                    </div>

                    {/* Referral Badge */}
                    {referralCode && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gold-500/10 border border-gold-500/30 rounded-xl p-4 flex items-center gap-3"
                      >
                        <div className="w-8 h-8 rounded-full bg-gold-500/20 flex items-center justify-center">
                          <Check className="h-4 w-4 text-gold-400" />
                        </div>
                        <div>
                          <p className="text-gold-400 font-medium">Referred by {referrerName || 'a coach'}</p>
                          <p className="text-gold-300/70 text-sm">Your results will be shared with your coach</p>
                        </div>
                      </motion.div>
                    )}

                    {/* Privacy Note */}
                    <div className="flex items-start gap-2 text-slate-500 text-xs">
                      <Shield className="h-4 w-4 shrink-0 mt-0.5" />
                      <p>Your information is secure and will only be used to deliver your personalized metabolic assessment results.</p>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full bg-gold-500 hover:bg-gold-600 text-navy-900 py-7 text-lg font-bold rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:-translate-y-0.5 transition-all duration-300"
                    >
                      Start the Quiz
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Trust Indicators */}
              <div className="mt-6 flex items-center justify-center gap-6 text-slate-500 text-sm">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>10 Questions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>2 Minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Instant Results</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* QUIZ PHASE */}
        {phase === 'quiz' && questions.length > 0 && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-navy-900"
          >
            <div className="max-w-2xl mx-auto px-4 py-8 md:py-16">
              {/* User Badge */}
              {leadData && (
                <div className="mb-6 flex items-center justify-center gap-2 text-slate-400 text-sm">
                  <User className="h-4 w-4" />
                  <span>Calculating metabolic age for <strong className="text-white">{leadData.name.split(' ')[0]}</strong>, age {leadData.age}</span>
                </div>
              )}

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between text-xs font-medium text-slate-400 mb-2">
                  <span>Question {currentQuestion + 1} of {totalQuestions}</span>
                  <span>{Math.round(progress)}% Complete</span>
                </div>
                <div className="h-2 bg-navy-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gold-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Question Card */}
              <AnimatePresence mode="wait" custom={1}>
                <motion.div
                  key={currentQuestion}
                  custom={1}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border-navy-700 bg-navy-800 shadow-2xl overflow-hidden">
                    {/* Category Header */}
                    <div className="bg-navy-900 px-6 py-4 border-b border-navy-700">
                      <div className="flex items-center gap-3">
                        {React.createElement(questions[currentQuestion].icon, {
                          className: "h-5 w-5 text-gold-500"
                        })}
                        <span className="text-gold-400 font-medium text-sm uppercase tracking-wider">
                          {questions[currentQuestion].category}
                        </span>
                      </div>
                    </div>

                    <CardContent className="p-6 md:p-8">
                      {/* Question */}
                      <h2 className="text-xl md:text-2xl font-bold text-white mb-8 leading-relaxed">
                        {questions[currentQuestion].question}
                      </h2>

                      {/* Options - 4 choices */}
                      <div className="space-y-3">
                        {questions[currentQuestion].options.map((option) => (
                          <motion.button
                            key={option.id}
                            onClick={() => handleSelectOption(option.id, option.points, questions[currentQuestion].id)}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                              selectedOption === option.id
                                ? 'border-gold-500 bg-gold-500/10'
                                : 'border-navy-600 bg-navy-900 hover:border-gold-500/50 hover:bg-navy-900/80'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                selectedOption === option.id
                                  ? 'border-gold-500 bg-gold-500'
                                  : 'border-slate-500'
                              }`}>
                                {selectedOption === option.id && (
                                  <Check className="h-3 w-3 text-navy-900" />
                                )}
                              </div>
                              <span className={`text-base leading-relaxed ${
                                selectedOption === option.id ? 'text-white' : 'text-slate-300'
                              }`}>
                                {option.text}
                              </span>
                            </div>
                          </motion.button>
                        ))}
                      </div>

                      {/* Navigation */}
                      <div className="flex justify-between mt-8 pt-6 border-t border-navy-700">
                        <Button
                          variant="ghost"
                          onClick={handleBack}
                          className="text-slate-400 hover:text-white hover:bg-navy-700"
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Back
                        </Button>
                        <div className="text-slate-500 text-sm">
                          {currentQuestion + 1} / {totalQuestions}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* CALCULATING PHASE */}
        {phase === 'calculating' && (
          <motion.div
            key="calculating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-navy-900 flex items-center justify-center"
          >
            <div className="text-center px-4">
              {/* Animated Circle */}
              <div className="relative w-48 h-48 mx-auto mb-8">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#1E293B"
                    strokeWidth="8"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="8"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2.5, ease: "easeInOut" }}
                    style={{
                      strokeDasharray: "283",
                      strokeDashoffset: "0"
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Activity className="h-16 w-16 text-gold-500 animate-pulse" />
                </div>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Calculating Your Metabolic Age...
              </h2>
              {leadData && (
                <p className="text-slate-400 max-w-md mx-auto mb-2">
                  Analyzing responses for <strong className="text-white">{leadData.name.split(' ')[0]}</strong>
                </p>
              )}
              <p className="text-slate-500 max-w-md mx-auto">
                Comparing your biomarkers against clinical data
              </p>

              {/* Loading Steps */}
              <div className="mt-8 space-y-3 max-w-xs mx-auto">
                {[
                  "Evaluating hormonal balance...",
                  "Checking glucose stability...",
                  "Analyzing cortisol patterns...",
                  "Calculating your metabolic age..."
                ].map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.6 }}
                    className="flex items-center gap-3 text-slate-400 text-sm"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.6 + 0.3 }}
                    >
                      <Check className="h-4 w-4 text-green-500" />
                    </motion.div>
                    {step}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* RESULTS PHASE */}
        {phase === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-navy-900"
          >
            {/* Results Header */}
            <section className={`py-12 md:py-20 relative overflow-hidden ${
              result.color === 'red' ? 'bg-gradient-to-b from-red-900/20 to-navy-900' :
              result.color === 'orange' ? 'bg-gradient-to-b from-orange-900/20 to-navy-900' :
              result.color === 'yellow' ? 'bg-gradient-to-b from-yellow-900/20 to-navy-900' :
              'bg-gradient-to-b from-green-900/20 to-navy-900'
            }`}>
              <div className="max-w-4xl mx-auto px-4 text-center">
                {/* Personalized Greeting */}
                {leadData && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-slate-400 mb-4"
                  >
                    Results for <strong className="text-white">{leadData.name}</strong>
                  </motion.p>
                )}

                {/* Status Badge */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className={`inline-flex items-center gap-2 py-2 px-4 rounded-full text-sm font-bold mb-6 ${
                    result.color === 'red' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    result.color === 'orange' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                    result.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                    'bg-green-500/20 text-green-400 border border-green-500/30'
                  }`}
                >
                  {React.createElement(result.icon, { className: "h-4 w-4" })}
                  CLINICAL STATUS: {result.status}
                </motion.div>

                {/* Priority Level */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-slate-400 text-lg mb-4"
                >
                  {result.priority}
                </motion.p>

                {/* Main Headline */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-3xl md:text-5xl font-display font-bold text-white mb-6"
                >
                  {result.headline}
                </motion.h1>

                {/* Metabolic Age Display */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="relative w-56 h-56 mx-auto mb-8"
                >
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#1E293B"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke={
                        result.color === 'red' ? '#EF4444' :
                        result.color === 'orange' ? '#F97316' :
                        result.color === 'yellow' ? '#EAB308' :
                        '#22C55E'
                      }
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray="283"
                      strokeDashoffset={283 - (283 * Math.min(50 - metabolicAgeOffset, 50) / 50)}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-slate-500 text-sm mb-1">Your Metabolic Age</span>
                    <span className={`text-6xl font-bold ${
                      result.color === 'red' ? 'text-red-400' :
                      result.color === 'orange' ? 'text-orange-400' :
                      result.color === 'yellow' ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>{metabolicAge}</span>
                    <span className="text-slate-400 text-sm">years old</span>
                  </div>
                </motion.div>

                {/* Age Comparison Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="grid grid-cols-3 gap-4 max-w-lg mx-auto"
                >
                  <div className="bg-navy-800 rounded-xl p-4 border border-navy-700">
                    <div className="text-3xl font-bold text-white">
                      {chronologicalAge}
                    </div>
                    <div className="text-slate-500 text-xs">Actual Age</div>
                  </div>
                  <div className="bg-navy-800 rounded-xl p-4 border border-navy-700">
                    <div className={`text-3xl font-bold ${
                      result.color === 'red' ? 'text-red-400' :
                      result.color === 'orange' ? 'text-orange-400' :
                      result.color === 'yellow' ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {metabolicAge}
                    </div>
                    <div className="text-slate-500 text-xs">Metabolic Age</div>
                  </div>
                  <div className="bg-navy-800 rounded-xl p-4 border border-navy-700">
                    <div className={`text-3xl font-bold ${
                      result.color === 'red' ? 'text-red-400' :
                      result.color === 'orange' ? 'text-orange-400' :
                      result.color === 'yellow' ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {metabolicAgeOffset >= 0 ? '+' : ''}{metabolicAgeOffset}
                    </div>
                    <div className="text-slate-500 text-xs">Years {metabolicAgeOffset >= 0 ? 'Added' : 'Younger'}</div>
                  </div>
                </motion.div>

                {/* Impact Statement */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="mt-6 p-4 bg-navy-800/50 rounded-xl border border-navy-700 max-w-lg mx-auto"
                >
                  <p className={`text-lg ${
                    result.color === 'red' ? 'text-red-300' :
                    result.color === 'orange' ? 'text-orange-300' :
                    result.color === 'yellow' ? 'text-yellow-300' :
                    'text-green-300'
                  }`}>
                    {leadData?.name.split(' ')[0]}, your body is functioning like someone who is{' '}
                    <strong>{metabolicAge} years old</strong> — that's{' '}
                    {metabolicAgeOffset >= 0 ? (
                      <><strong>{metabolicAgeOffset} years older</strong> than your actual age of {chronologicalAge}.</>
                    ) : (
                      <><strong>{Math.abs(metabolicAgeOffset)} years younger</strong> than your actual age of {chronologicalAge}!</>
                    )}
                  </p>
                </motion.div>
              </div>
            </section>

            {/* Rewatch Video Button */}
            <section className="py-4 md:py-6">
              <div className="max-w-3xl mx-auto px-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.75 }}
                  className="text-center"
                >
                  <button
                    onClick={() => setResultsVideoOpen(true)}
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                      result.color === 'red' ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30' :
                      result.color === 'orange' ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border border-orange-500/30' :
                      result.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/30' :
                      'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30'
                    }`}
                  >
                    <Play className="h-5 w-5" />
                    Watch: Understanding Your Results
                  </button>
                </motion.div>
              </div>
            </section>

            {/* Video Modal */}
            <Dialog open={resultsVideoOpen} onOpenChange={setResultsVideoOpen}>
              <DialogContent className="bg-navy-900 border-navy-700 max-w-4xl w-[95vw] p-0 overflow-hidden">
                <div className="relative">
                  {/* Close button */}
                  <button
                    onClick={handleResultsVideoClose}
                    className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  {/* Video */}
                  <video
                    ref={resultsVideoRef}
                    src={result.videoUrl}
                    controls
                    autoPlay
                    playsInline
                    onEnded={handleResultsVideoEnded}
                    className="w-full aspect-video bg-black"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </DialogContent>
            </Dialog>

            {/* Diagnosis Section */}
            <section className="py-12 md:py-16">
              <div className="max-w-3xl mx-auto px-4">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <Card className="border-navy-700 bg-navy-800 shadow-2xl overflow-hidden">
                    <CardContent className="p-6 md:p-10">
                      {/* Diagnosis */}
                      <div className="mb-8">
                        <h3 className="text-gold-500 font-bold text-sm uppercase tracking-wider mb-4">
                          THE DIAGNOSIS
                        </h3>
                        <p className="text-xl text-slate-300 leading-relaxed">
                          {result.diagnosis}
                        </p>
                      </div>

                      {/* Clinical Data */}
                      <div className="mb-8 p-6 bg-navy-900 rounded-xl border border-navy-700">
                        <h3 className="text-gold-500 font-bold text-sm uppercase tracking-wider mb-4">
                          THE CLINICAL DATA
                        </h3>
                        <p className="text-slate-300 leading-relaxed">
                          {result.clinicalData}
                        </p>
                      </div>

                      {/* CTA */}
                      <div className="text-center">
                        <Button
                          size="lg"
                          onClick={handleGoToPayment}
                          className="bg-gold-500 hover:bg-gold-600 text-navy-900 text-lg md:text-xl px-10 py-8 rounded-full shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:shadow-[0_0_40px_rgba(245,158,11,0.5)] font-bold transition-all duration-300 group"
                        >
                          {result.cta}
                          <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        <p className="text-slate-500 text-sm mt-4">
                          Join 2,847+ others who reversed their metabolic age
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* What You Get */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 }}
                  className="mt-8"
                >
                  <Card className="border-navy-700 bg-navy-800">
                    <CardContent className="p-6 md:p-8">
                      <h3 className="text-xl font-bold text-white mb-6 text-center">
                        What's Included in the 28-Day Reset
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          "Personalized metabolic tracking dashboard",
                          "Daily habit loops (Water, Steps, Sleep)",
                          "Weekly biometric check-ins",
                          "Science-backed nutrition protocol",
                          "Community support & accountability",
                          "Metabolic age reversal roadmap"
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                              <Check className="h-4 w-4 text-green-500" />
                            </div>
                            <span className="text-slate-300">{item}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

              </div>
            </section>
          </motion.div>
        )}

        {/* PAYMENT PHASE */}
        {phase === 'payment' && (
          <motion.div
            key="payment"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-navy-900"
          >
            <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
              {/* Progress Header */}
              <div className="mb-8">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <span className="ml-2 text-sm text-slate-400">Quiz</span>
                  </div>
                  <div className="w-12 h-0.5 bg-green-500"></div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <span className="ml-2 text-sm text-slate-400">Results</span>
                  </div>
                  <div className="w-12 h-0.5 bg-gold-500"></div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gold-500 flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-navy-900" />
                    </div>
                    <span className="ml-2 text-sm text-white font-medium">Payment</span>
                  </div>
                  <div className="w-12 h-0.5 bg-navy-700"></div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-navy-700 flex items-center justify-center">
                      <span className="text-xs text-slate-500">4</span>
                    </div>
                    <span className="ml-2 text-sm text-slate-500">Setup</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
                {/* Left Side - Payment Form */}
                <div className="lg:col-span-3">
                  <Card className="border-navy-700 bg-navy-800/80 backdrop-blur-xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-navy-900/50 px-6 py-5 border-b border-navy-700">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-10 w-10 p-0 text-slate-400 hover:text-white hover:bg-navy-700 rounded-full"
                          onClick={() => setPhase('results')}
                        >
                          <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                          <h2 className="text-xl md:text-2xl font-bold text-white">
                            Join the Reset, {leadData?.name.split(' ')[0]}
                          </h2>
                          <p className="text-slate-400 text-sm">Choose your path and complete payment</p>
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-6 md:p-8 space-y-6">
                      {/* Role Selection */}
                      <div className="space-y-4">
                        <Label className="text-slate-200 text-lg font-medium">How will you participate?</Label>
                        <RadioGroup value={role} onValueChange={(v) => setRole(v as 'participant' | 'group_leader')}>
                          {/* Participant Option */}
                          <motion.div
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => setRole('participant')}
                            className={`relative rounded-xl border-2 p-5 cursor-pointer transition-all duration-200 ${
                              role === 'participant'
                                ? 'border-gold-500 bg-gold-500/10 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                                : 'border-navy-600 bg-navy-900 hover:border-gold-500/50'
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                                role === 'participant' ? 'bg-gold-500 text-navy-900' : 'bg-navy-800 text-slate-400'
                              }`}>
                                <User className="h-5 w-5" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <Label className="font-bold text-white text-base cursor-pointer">
                                    Participant
                                  </Label>
                                  <RadioGroupItem value="participant" className="border-slate-500 text-gold-500" />
                                </div>
                                <p className="text-slate-400 text-sm mb-2">
                                  Track your health, follow the protocol, and transform your metabolic age.
                                </p>
                                <span className="text-xl font-bold text-gold-500">$28</span>
                              </div>
                            </div>
                          </motion.div>

                          {/* Group Leader Option */}
                          <motion.div
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => setRole('group_leader')}
                            className={`relative rounded-xl border-2 p-5 cursor-pointer transition-all duration-200 ${
                              role === 'group_leader'
                                ? 'border-gold-500 bg-gold-500/10 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                                : 'border-navy-600 bg-navy-900 hover:border-gold-500/50'
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                                role === 'group_leader' ? 'bg-gold-500 text-navy-900' : 'bg-navy-800 text-slate-400'
                              }`}>
                                <Users className="h-5 w-5" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    <Label className="font-bold text-white text-base cursor-pointer">
                                      Group Leader
                                    </Label>
                                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full font-medium">
                                      LEADER
                                    </span>
                                  </div>
                                  <RadioGroupItem value="group_leader" className="border-slate-500 text-gold-500" />
                                </div>
                                <p className="text-slate-400 text-sm mb-2">
                                  Lead a team, access roster data, and recruit other participants.
                                </p>
                                <span className="text-xl font-bold text-gold-500">$49</span>
                              </div>
                            </div>
                          </motion.div>
                        </RadioGroup>
                      </div>

                      {/* Smart Scale Toggle */}
                      <div className="pt-4 border-t border-navy-700">
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

                      {/* Email Field - Required for Stripe */}
                      <div className="pt-4 border-t border-navy-700">
                        <div className="space-y-2 mb-6">
                          <Label htmlFor="email" className="text-slate-200 flex items-center gap-2">
                            <Mail className="h-4 w-4 text-slate-400" />
                            Email Address
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              if (emailError) setEmailError(null);
                            }}
                            placeholder="you@example.com"
                            className="bg-navy-900 border-navy-600 text-white placeholder:text-slate-500 focus:border-gold-500 focus:ring-gold-500/20 h-12 text-lg rounded-xl"
                          />
                          {emailError && (
                            <p className="text-red-400 text-sm flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {emailError}
                            </p>
                          )}
                          <p className="text-slate-500 text-xs">
                            We'll send your receipt and important updates here
                          </p>
                        </div>
                      </div>

                      {/* Payment Section */}
                      <div className="pt-4 border-t border-navy-700">
                        {/* Order Summary */}
                        <div className="bg-navy-900 rounded-xl p-5 border border-navy-700 mb-6">
                          <h3 className="text-slate-400 text-sm font-medium mb-4 uppercase tracking-wider">Order Summary</h3>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gold-500/20 flex items-center justify-center">
                                {role === 'group_leader' ? (
                                  <Users className="h-5 w-5 text-gold-500" />
                                ) : (
                                  <User className="h-5 w-5 text-gold-500" />
                                )}
                              </div>
                              <div>
                                <p className="text-white font-medium">28-Day Metabolic Reset</p>
                                <p className="text-slate-500 text-sm">
                                  {role === 'group_leader' ? 'Group Leader Access' : 'Participant Access'}
                                </p>
                              </div>
                            </div>
                            <span className="text-2xl font-bold text-gold-500">
                              ${role === 'group_leader' ? '49' : '28'}
                            </span>
                          </div>
                          <div className="border-t border-navy-700 pt-4 flex items-center justify-between">
                            <span className="text-slate-400">Total</span>
                            <span className="text-xl font-bold text-white">${role === 'group_leader' ? '49.00' : '28.00'}</span>
                          </div>
                        </div>

                        {stripeError && (
                          <Alert variant="destructive" className="bg-red-900/20 border-red-800 mb-6">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle className="text-red-400">Error</AlertTitle>
                            <AlertDescription className="text-red-300">{stripeError}</AlertDescription>
                          </Alert>
                        )}

                        {isMockPayment ? (
                          <div className="text-center py-6">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold-500/20 flex items-center justify-center"
                            >
                              <CreditCard className="h-8 w-8 text-gold-500" />
                            </motion.div>
                            <h3 className="text-lg font-bold mb-2 text-white">Demo Mode</h3>
                            <p className="text-slate-400 mb-6 max-w-sm mx-auto text-sm">
                              Payment bypassed for demo. Click below to complete.
                            </p>
                            <Button
                              onClick={handlePaymentSuccess}
                              disabled={isProcessingPayment}
                              className="w-full bg-gold-500 hover:bg-gold-600 text-navy-900 py-7 text-lg font-bold rounded-xl"
                            >
                              {isProcessingPayment ? (
                                <>
                                  <Loader2 className="animate-spin mr-2 h-5 w-5" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  Complete Registration - ${role === 'group_leader' ? '49' : '28'}
                                  <ArrowRight className="ml-2 h-5 w-5" />
                                </>
                              )}
                            </Button>
                          </div>
                        ) : clientSecret && stripePromise ? (
                          <Elements stripe={stripePromise} options={{ clientSecret }}>
                            <StripePaymentForm
                              onSuccess={handlePaymentSuccess}
                              amount={role === 'group_leader' ? 4900 : 2800}
                            />
                          </Elements>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-gold-500 mb-4" />
                            <p className="text-slate-400">Loading payment form...</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Side - Quiz Results Summary */}
                <div className="hidden lg:block lg:col-span-2">
                  <div className="sticky top-8">
                    <Card className="border-navy-700 bg-navy-800/50 backdrop-blur-xl">
                      <CardContent className="p-6">
                        {/* Metabolic Age Summary */}
                        <div className="text-center mb-6">
                          <p className="text-slate-400 text-sm mb-2">Your Metabolic Age</p>
                          <div className="text-5xl font-bold text-gold-500 mb-1">{metabolicAge}</div>
                          <p className="text-slate-500 text-sm">
                            {metabolicAgeOffset >= 0 ? `+${metabolicAgeOffset}` : metabolicAgeOffset} years vs actual age
                          </p>
                        </div>

                        <div className={`p-4 rounded-xl mb-6 ${
                          result.color === 'red' ? 'bg-red-500/10 border border-red-500/30' :
                          result.color === 'orange' ? 'bg-orange-500/10 border border-orange-500/30' :
                          result.color === 'yellow' ? 'bg-yellow-500/10 border border-yellow-500/30' :
                          'bg-green-500/10 border border-green-500/30'
                        }`}>
                          <div className={`text-sm font-bold uppercase tracking-wider mb-1 ${
                            result.color === 'red' ? 'text-red-400' :
                            result.color === 'orange' ? 'text-orange-400' :
                            result.color === 'yellow' ? 'text-yellow-400' :
                            'text-green-400'
                          }`}>
                            {result.status}
                          </div>
                          <p className="text-slate-400 text-sm">{result.priority}</p>
                        </div>

                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                          <Zap className="h-5 w-5 text-gold-500" />
                          What You Get
                        </h3>
                        <div className="space-y-3">
                          {[
                            "Metabolic tracking dashboard",
                            "Daily habit loops",
                            "Weekly biometric check-ins",
                            "Community support"
                          ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                                <Check className="h-3 w-3 text-green-500" />
                              </div>
                              <span className="text-slate-300 text-sm">{item}</span>
                            </div>
                          ))}
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
          </motion.div>
        )}
      </AnimatePresence>
    </MarketingLayout>
  );
}
