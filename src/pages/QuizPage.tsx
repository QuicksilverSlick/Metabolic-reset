import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
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

// Quiz question structure with 3-point scoring (0, 5, 10)
// NEW SCORING: Lower score = healthier (GREEN 0-15, YELLOW 16-35, ORANGE 36-65, RED 66-100)
interface QuizOption {
  id: string;
  text: string;
  points: 0 | 5 | 10;  // 3 options per question
}

interface QuizQuestion {
  id: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  question: string;
  options: QuizOption[];
  gender?: 'male' | 'female'; // For gender-specific questions
}

// Female-specific questions (Section 1B - 5 questions)
// NEW: 3 options per question (0, 5, 10 points) - Lower score = healthier
const femaleQuestions: QuizQuestion[] = [
  {
    id: 'f1',
    category: 'Hormonal Balance',
    icon: Heart,
    question: 'How would you describe your menstrual cycle (or post-menopausal experience)?',
    gender: 'female',
    options: [
      { id: 'a', text: 'Regular cycles with minimal symptoms (or stable post-menopause)', points: 0 },
      { id: 'b', text: 'Some irregularity or moderate symptoms', points: 5 },
      { id: 'c', text: 'Highly irregular with severe PMS, bloating, or mood swings', points: 10 }
    ]
  },
  {
    id: 'f2',
    category: 'Temperature Regulation',
    icon: ThermometerSun,
    question: 'How often do you experience hot flashes, night sweats, or difficulty regulating body temperature?',
    gender: 'female',
    options: [
      { id: 'a', text: 'Rarely or never', points: 0 },
      { id: 'b', text: 'Occasionally, minor inconvenience', points: 5 },
      { id: 'c', text: 'Frequently, they significantly impact my daily life', points: 10 }
    ]
  },
  {
    id: 'f3',
    category: 'Weight Distribution',
    icon: Scale,
    question: 'Where do you tend to store excess weight?',
    gender: 'female',
    options: [
      { id: 'a', text: 'Weight is well-distributed and manageable', points: 0 },
      { id: 'b', text: 'Mostly hips and thighs with some midsection', points: 5 },
      { id: 'c', text: 'Primarily around my midsection (apple shape)', points: 10 }
    ]
  },
  {
    id: 'f4',
    category: 'Energy & Mood',
    icon: Battery,
    question: 'How stable is your energy and mood throughout your menstrual cycle or day-to-day?',
    gender: 'female',
    options: [
      { id: 'a', text: 'Very stable - consistent energy and mood', points: 0 },
      { id: 'b', text: 'Some fluctuations but manageable', points: 5 },
      { id: 'c', text: 'Significant swings - energy crashes and mood changes', points: 10 }
    ]
  },
  {
    id: 'f5',
    category: 'Metabolic Symptoms',
    icon: Activity,
    question: 'Do you experience unexplained weight gain, water retention, or difficulty losing weight despite effort?',
    gender: 'female',
    options: [
      { id: 'a', text: 'No - my weight responds well to diet and exercise', points: 0 },
      { id: 'b', text: 'Sometimes - occasional plateaus or slow progress', points: 5 },
      { id: 'c', text: 'Yes - constant struggle despite consistent effort', points: 10 }
    ]
  }
];

// Male-specific questions (Section 1A - 5 questions)
// NEW: 3 options per question (0, 5, 10 points) - Lower score = healthier
const maleQuestions: QuizQuestion[] = [
  {
    id: 'm1',
    category: 'Muscle & Recovery',
    icon: Dumbbell,
    question: 'How would you describe your muscle recovery and ability to maintain or build strength?',
    gender: 'male',
    options: [
      { id: 'a', text: 'Quick recovery, easily maintain or build muscle', points: 0 },
      { id: 'b', text: 'Takes longer than it used to, harder to maintain', points: 5 },
      { id: 'c', text: 'Very slow recovery, losing muscle despite effort', points: 10 }
    ]
  },
  {
    id: 'm2',
    category: 'Energy & Drive',
    icon: Battery,
    question: 'How would you rate your overall energy, motivation, and drive throughout the day?',
    gender: 'male',
    options: [
      { id: 'a', text: 'Consistently high energy and drive all day', points: 0 },
      { id: 'b', text: 'Generally good but dips in the afternoon', points: 5 },
      { id: 'c', text: 'Consistently low energy, need stimulants to function', points: 10 }
    ]
  },
  {
    id: 'm3',
    category: 'Body Composition',
    icon: Scale,
    question: 'Where do you tend to accumulate stubborn fat?',
    gender: 'male',
    options: [
      { id: 'a', text: 'Minimal fat accumulation, well-distributed', points: 0 },
      { id: 'b', text: 'Some midsection fat but fairly proportional', points: 5 },
      { id: 'c', text: 'Significant belly fat and love handles that won\'t budge', points: 10 }
    ]
  },
  {
    id: 'm4',
    category: 'Sleep Quality',
    icon: Moon,
    question: 'How well do you sleep and how do you feel upon waking?',
    gender: 'male',
    options: [
      { id: 'a', text: 'Deep sleep, wake refreshed and energized', points: 0 },
      { id: 'b', text: 'Okay sleep, takes a while to feel alert', points: 5 },
      { id: 'c', text: 'Poor sleep, wake exhausted despite 7+ hours', points: 10 }
    ]
  },
  {
    id: 'm5',
    category: 'Stress & Focus',
    icon: Brain,
    question: 'How would you describe your mental clarity, focus, and stress levels?',
    gender: 'male',
    options: [
      { id: 'a', text: 'Sharp focus, low stress, clear thinking', points: 0 },
      { id: 'b', text: 'Sometimes foggy, moderate stress', points: 5 },
      { id: 'c', text: 'Frequent brain fog, high stress, difficulty concentrating', points: 10 }
    ]
  }
];

// Universal questions (Section 2 - 5 questions) - Same for both genders
// NEW: 3 options per question (0, 5, 10 points) - Lower score = healthier
const universalQuestions: QuizQuestion[] = [
  {
    id: 'u1',
    category: 'Energy Stability',
    icon: Zap,
    question: 'How often do you experience energy crashes or brain fog between 2-4 PM?',
    options: [
      { id: 'a', text: 'Rarely or never - my energy is stable', points: 0 },
      { id: 'b', text: 'Occasionally - 1-2 times per week', points: 5 },
      { id: 'c', text: 'Daily - I need caffeine or sugar to function', points: 10 }
    ]
  },
  {
    id: 'u2',
    category: 'Hunger & Cravings',
    icon: Flame,
    question: 'How often do you experience strong cravings for sugar, carbs, or feel "hangry"?',
    options: [
      { id: 'a', text: 'Rarely - I can go 4-5 hours between meals easily', points: 0 },
      { id: 'b', text: 'Sometimes - I get uncomfortable if I wait too long', points: 5 },
      { id: 'c', text: 'Frequently - I need to eat every 2-3 hours or I crash', points: 10 }
    ]
  },
  {
    id: 'u3',
    category: 'Weight Resistance',
    icon: Scale,
    question: 'How would you describe your ability to lose weight or maintain a healthy weight?',
    options: [
      { id: 'a', text: 'Easy - my body responds well to diet and exercise', points: 0 },
      { id: 'b', text: 'Moderate - I can lose weight but it takes consistent effort', points: 5 },
      { id: 'c', text: 'Difficult - I struggle despite trying everything', points: 10 }
    ]
  },
  {
    id: 'u4',
    category: 'Stress Impact',
    icon: Brain,
    question: 'How do stress and cortisol affect your body and weight?',
    options: [
      { id: 'a', text: 'Minimal impact - I manage stress well', points: 0 },
      { id: 'b', text: 'Some impact - I notice weight fluctuations when stressed', points: 5 },
      { id: 'c', text: 'Significant impact - chronic stress, weight gain despite effort', points: 10 }
    ]
  },
  {
    id: 'u5',
    category: 'Metabolic Awareness',
    icon: Activity,
    question: 'How aware are you of your metabolic health markers (body fat %, visceral fat, lean mass)?',
    options: [
      { id: 'a', text: 'Very aware - I track regularly with a smart scale', points: 0 },
      { id: 'b', text: 'Somewhat aware - I check occasionally', points: 5 },
      { id: 'c', text: 'Not aware - I only look at the scale number', points: 10 }
    ]
  }
];

// NEW SCORING SYSTEM: Lower score = healthier
// GREEN (0-15): Optimal metabolic health
// YELLOW (16-35): Minor areas for improvement
// ORANGE (36-65): Moderate metabolic dysfunction
// RED (66-100): Significant metabolic issues

// Determine result type based on score (NEW: lower is better)
function getResultType(score: number): QuizResultType {
  if (score <= 15) return 'green';
  if (score <= 35) return 'yellow';
  if (score <= 65) return 'orange';
  return 'red';
}

// Get color class for result type
function getResultColor(resultType: QuizResultType): string {
  switch (resultType) {
    case 'green': return 'green';
    case 'yellow': return 'yellow';
    case 'orange': return 'orange';
    case 'red': return 'red';
    // Legacy support
    case 'optimized': return 'green';
    case 'plateau': return 'yellow';
    case 'instability': return 'orange';
    case 'fatigue': return 'red';
    default: return 'orange';
  }
}

// Calculate metabolic age (LEGACY - kept for backward compatibility)
// In the new system, we primarily use totalScore but still calculate this for display
function calculateMetabolicAge(
  chronologicalAge: number,
  sex: SexType,
  quizScore: number
): number {
  // NEW: Lower score = healthier, so we invert the logic
  // Score 0-15 (GREEN) = -2 to 0 years offset
  // Score 16-35 (YELLOW) = +1 to +5 years offset
  // Score 36-65 (ORANGE) = +5 to +10 years offset
  // Score 66-100 (RED) = +10 to +15 years offset

  let baseOffset: number;
  if (quizScore <= 15) {
    // GREEN - Optimal metabolic health
    baseOffset = Math.floor((quizScore / 15) * 2) - 2; // -2 to 0
  } else if (quizScore <= 35) {
    // YELLOW - Minor areas for improvement
    baseOffset = 1 + Math.floor(((quizScore - 15) / 20) * 4); // +1 to +5
  } else if (quizScore <= 65) {
    // ORANGE - Moderate metabolic dysfunction
    baseOffset = 5 + Math.floor(((quizScore - 35) / 30) * 5); // +5 to +10
  } else {
    // RED - Significant metabolic issues
    baseOffset = 10 + Math.floor(((quizScore - 65) / 35) * 5); // +10 to +15
  }

  // Apply sex-specific adjustment
  const sexAdjustment = sex === 'female' ? -0.5 : 0;

  // Age-related scaling
  const ageScaling = chronologicalAge > 50 ? 1.1 : chronologicalAge > 40 ? 1.05 : 1;

  const metabolicAge = Math.round(chronologicalAge + (baseOffset * ageScaling) + sexAdjustment);

  // Ensure metabolic age is reasonable (minimum 18, maximum chronological + 20)
  return Math.max(18, Math.min(metabolicAge, chronologicalAge + 20));
}

// Results Data based on result type
// NEW: Using 4 universal videos (same for all result types for now)
// These can be replaced with result-specific videos later
const DEFAULT_VIDEO_URL = 'https://descriptusercontent.com/published/b932bbbd-91ac-44d6-b863-a8574d047d2a/original.mp4';

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
  scoreRange: string;
}> = {
  // NEW RESULT TYPES (lower score = healthier)
  green: {
    status: 'METABOLICALLY OPTIMIZED',
    priority: 'Excellent Metabolic Health',
    icon: Crown,
    color: 'green',
    headline: 'Your metabolic health is excellent!',
    scoreRange: '0-15',
    diagnosis: "Your responses indicate strong metabolic function. Your body efficiently processes energy, maintains stable blood sugar, and responds well to diet and exercise. You're already practicing many healthy habits.",
    clinicalData: "Join the Protocol Cohort to fine-tune your biometrics and optimize further. Even high-performers in clinical trials saw measurable improvements. Your stability makes you an ideal candidate for the leadership track.",
    cta: "JOIN THE LEADERSHIP COHORT",
    riskLevel: 'Low',
    videoUrl: DEFAULT_VIDEO_URL
  },
  yellow: {
    status: 'MINOR OPTIMIZATION NEEDED',
    priority: 'Room for Improvement',
    icon: Target,
    color: 'yellow',
    headline: 'Your metabolism has room for optimization.',
    scoreRange: '16-35',
    diagnosis: "Your metabolic health is generally good, but there are some areas that could use attention. You may experience occasional energy dips, mild cravings, or find it takes extra effort to maintain your weight.",
    clinicalData: "The Protocol can help you address these minor inefficiencies. Participants with similar profiles typically see improved energy stability and easier weight management within the first 2 weeks.",
    cta: "OPTIMIZE YOUR METABOLISM",
    riskLevel: 'Low-Moderate',
    videoUrl: DEFAULT_VIDEO_URL
  },
  orange: {
    status: 'METABOLIC DYSFUNCTION',
    priority: 'Moderate Intervention Recommended',
    icon: TrendingDown,
    color: 'orange',
    headline: 'Your metabolism needs attention.',
    scoreRange: '36-65',
    diagnosis: "Your responses indicate moderate metabolic dysfunction. You may be experiencing regular energy crashes, difficulty losing weight despite effort, and/or unstable blood sugar levels. These are signs your metabolism is under stress.",
    clinicalData: "The Arterburn Study demonstrated that participants on the Protocol lost 10x more weight than the self-directed control group. The structured approach helps stabilize insulin and cortisol to break the cycle you're in.",
    cta: "START YOUR METABOLIC RESET",
    riskLevel: 'Moderate',
    videoUrl: DEFAULT_VIDEO_URL
  },
  red: {
    status: 'METABOLIC STRESS',
    priority: 'Urgent Intervention Recommended',
    icon: AlertTriangle,
    color: 'red',
    headline: 'Your metabolism is under significant stress.',
    scoreRange: '66-100',
    diagnosis: "Your biomarkers indicate significant metabolic dysfunction. Your body may be in a cycle of energy crashes, cravings, and weight gain despite your efforts. This is often caused by hormonal imbalances, chronic stress, and insulin resistance.",
    clinicalData: "According to the Arterburn Clinical Study, a Protocol-based approach allows for significant fat loss while retaining 98% of lean muscle mass. You need this structured approach to reverse the metabolic stress and protect your metabolic engine.",
    cta: "INITIATE METABOLIC RESCUE",
    riskLevel: 'High',
    videoUrl: DEFAULT_VIDEO_URL
  },

  // LEGACY RESULT TYPES (kept for backward compatibility)
  fatigue: {
    status: 'METABOLIC FATIGUE',
    priority: 'High Priority for Protocol Intervention',
    icon: AlertTriangle,
    color: 'red',
    headline: 'Your metabolism needs urgent attention.',
    scoreRange: '0-35 (legacy)',
    diagnosis: "Your biomarkers indicate a breakdown in Muscle Protein Synthesis. Your body is likely cannibalizing its own muscle for energy, which lowers your metabolic rate. Standard \"dieting\" fails here because calorie restriction accelerates this muscle loss.",
    clinicalData: "According to the Arterburn Clinical Study (PubMed), a Protocol-based approach allows for significant fat loss while retaining 98% of lean muscle mass. You need this specific nutrition structure to reverse your fatigue and protect your metabolic engine.",
    cta: "INITIATE METABOLIC RESCUE",
    riskLevel: 'Critical',
    videoUrl: DEFAULT_VIDEO_URL
  },
  instability: {
    status: 'GLUCOSE VARIABILITY',
    priority: 'Detected: Insulin Spikes & Crashes',
    icon: TrendingDown,
    color: 'orange',
    headline: 'Your blood sugar is on a roller coaster.',
    scoreRange: '36-55 (legacy)',
    diagnosis: "Your metabolism is on a \"Roller Coaster.\" Relying on caffeine or sugar creates insulin spikes that trigger immediate fat storage. You are likely stuck in a cycle of \"Energy Crash → Craving → Storage.\"",
    clinicalData: "The Arterburn Study demonstrated that participants on the Protocol lost 10x more weight than the self-directed control group. Why? Because the Protocol flatlines insulin 6 times a day. We need to get you into the project to stabilize your blood sugar immediately.",
    cta: "STABILIZE YOUR GLUCOSE",
    riskLevel: 'Elevated',
    videoUrl: DEFAULT_VIDEO_URL
  },
  plateau: {
    status: 'CORTISOL RESISTANCE',
    priority: 'The "Stress" Plateau',
    icon: BarChart3,
    color: 'yellow',
    headline: 'You\'re doing things right, but stuck.',
    scoreRange: '56-75 (legacy)',
    diagnosis: "You are doing a lot of things \"right,\" but the scale won't move. This indicates Visceral Fat retention due to stress hormones (Cortisol). \"Eating less\" actually makes this worse by increasing stress on the body.",
    clinicalData: "You need a system proven to signal \"safety\" to your body. Data confirms the Protocol is up to 17x more effective at burning fat than unguided dieting because it nourishes the muscle while targeting visceral fat stores.",
    cta: "TARGET VISCERAL FAT",
    riskLevel: 'Moderate',
    videoUrl: DEFAULT_VIDEO_URL
  },
  optimized: {
    status: 'METABOLICALLY OPTIMIZED',
    priority: 'Candidate for Leadership Cohort',
    icon: Crown,
    color: 'green',
    headline: 'Your baseline health is strong.',
    scoreRange: '76-100 (legacy)',
    diagnosis: "Your baseline health is strong. You have good data awareness and stable energy. We need participants with your stability to serve as the \"Standard\" to compare against the Self-Directed group.",
    clinicalData: "Join the Protocol Cohort to fine-tune your biometrics. Even high-performers in the clinical trials saw an average 14% reduction in inflammatory Visceral Fat. Help us lead the data set.",
    cta: "JOIN THE LEADERSHIP COHORT",
    riskLevel: 'Low',
    videoUrl: DEFAULT_VIDEO_URL
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

  // Scroll to top when phase or question changes (mobile UX best practice)
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [phase, currentQuestion]);

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
        metabolicAge: calculatedMetabolicAge,  // Legacy field
        totalScore: totalScore  // New field for display
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
        // Trigger confetti for GREEN scores (0-15 in new system = excellent health)
        if (totalScore <= 15) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#22C55E', '#4ADE80', '#86EFAC', '#F59E0B', '#FBBF24']  // Green celebration
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
                                METABOLIC DYSFUNCTION
                              </div>
                              <p className="text-slate-400 text-xs">Moderate Intervention Recommended</p>
                            </div>

                            {/* Score Circle */}
                            <div className="relative w-28 h-28 mx-auto mb-4">
                              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="none" stroke="#1E293B" strokeWidth="8" />
                                <circle cx="50" cy="50" r="45" fill="none" stroke="#F97316" strokeWidth="8" strokeLinecap="round" strokeDasharray="283" strokeDashoffset={283 - (283 * 52 / 100)} />
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-slate-500 text-[10px] mb-0.5">Your Score</span>
                                <span className="text-3xl font-bold text-orange-400">48</span>
                                <span className="text-slate-400 text-[10px]">out of 100</span>
                              </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-2 mb-4">
                              <div className="bg-navy-900 rounded-lg p-2 text-center">
                                <div className="text-base font-bold text-orange-400">48</div>
                                <div className="text-slate-500 text-[10px]">Score</div>
                              </div>
                              <div className="bg-navy-900 rounded-lg p-2 text-center">
                                <div className="text-sm font-bold text-orange-400 uppercase">Orange</div>
                                <div className="text-slate-500 text-[10px]">Risk Zone</div>
                              </div>
                              <div className="bg-navy-900 rounded-lg p-2 text-center">
                                <div className="text-base font-bold text-orange-400">54</div>
                                <div className="text-slate-500 text-[10px]">Metabolic Age</div>
                              </div>
                            </div>

                            {/* Impact Statement */}
                            <div className="p-2 bg-navy-900/50 rounded-lg border border-navy-700">
                              <p className="text-orange-300 text-xs text-center leading-relaxed">
                                You scored <strong>48/100</strong>. You're in the <strong>ORANGE zone</strong> indicating moderate metabolic dysfunction.
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
                              METABOLIC DYSFUNCTION
                            </div>
                            <p className="text-slate-400 text-sm">Moderate Intervention Recommended</p>
                          </div>

                          {/* Score Circle */}
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
                                strokeDashoffset={283 - (283 * 52 / 100)}
                              />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-slate-500 text-xs mb-1">Your Score</span>
                              <span className="text-4xl font-bold text-orange-400">48</span>
                              <span className="text-slate-400 text-xs">out of 100</span>
                            </div>
                          </div>

                          {/* Stats Grid */}
                          <div className="grid grid-cols-3 gap-3 mb-6">
                            <div className="bg-navy-900 rounded-lg p-3 text-center">
                              <div className="text-xl font-bold text-orange-400">48</div>
                              <div className="text-slate-500 text-xs">Score</div>
                            </div>
                            <div className="bg-navy-900 rounded-lg p-3 text-center">
                              <div className="text-lg font-bold text-orange-400 uppercase">Orange</div>
                              <div className="text-slate-500 text-xs">Risk Zone</div>
                            </div>
                            <div className="bg-navy-900 rounded-lg p-3 text-center">
                              <div className="text-xl font-bold text-orange-400">54</div>
                              <div className="text-slate-500 text-xs">Metabolic Age</div>
                            </div>
                          </div>

                          {/* Impact Statement */}
                          <div className="p-3 bg-navy-900/50 rounded-lg border border-navy-700">
                            <p className="text-orange-300 text-sm text-center leading-relaxed">
                              You scored <strong>48/100</strong>. You're in the <strong>ORANGE zone</strong> indicating moderate metabolic dysfunction.
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

                {/* Score Display - Primary metric in new system */}
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
                      strokeDashoffset={283 - (283 * (100 - score) / 100)}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-slate-500 text-sm mb-1">Your Score</span>
                    <span className={`text-6xl font-bold ${
                      result.color === 'red' ? 'text-red-400' :
                      result.color === 'orange' ? 'text-orange-400' :
                      result.color === 'yellow' ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>{score}</span>
                    <span className="text-slate-400 text-sm">out of 100</span>
                  </div>
                </motion.div>

                {/* Stats Grid - Score, Zone, Metabolic Age */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="grid grid-cols-3 gap-4 max-w-lg mx-auto"
                >
                  <div className="bg-navy-800 rounded-xl p-4 border border-navy-700">
                    <div className={`text-3xl font-bold ${
                      result.color === 'red' ? 'text-red-400' :
                      result.color === 'orange' ? 'text-orange-400' :
                      result.color === 'yellow' ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {score}
                    </div>
                    <div className="text-slate-500 text-xs">Your Score</div>
                  </div>
                  <div className="bg-navy-800 rounded-xl p-4 border border-navy-700">
                    <div className={`text-2xl font-bold uppercase ${
                      result.color === 'red' ? 'text-red-400' :
                      result.color === 'orange' ? 'text-orange-400' :
                      result.color === 'yellow' ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {result.color === 'green' ? 'GREEN' :
                       result.color === 'yellow' ? 'YELLOW' :
                       result.color === 'orange' ? 'ORANGE' : 'RED'}
                    </div>
                    <div className="text-slate-500 text-xs">Risk Zone</div>
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
                    {leadData?.name.split(' ')[0]}, you scored <strong>{score}/100</strong>.{' '}
                    {score <= 15 ? (
                      <>Your metabolic health is <strong>excellent</strong> - you're in the GREEN zone!</>
                    ) : score <= 35 ? (
                      <>You're in the <strong>YELLOW zone</strong> with minor areas for improvement.</>
                    ) : score <= 65 ? (
                      <>You're in the <strong>ORANGE zone</strong> indicating moderate metabolic dysfunction.</>
                    ) : (
                      <>You're in the <strong>RED zone</strong> - your metabolism needs attention.</>
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
                        {/* Score Summary */}
                        <div className="text-center mb-6">
                          <p className="text-slate-400 text-sm mb-2">Your Score</p>
                          <div className={`text-5xl font-bold mb-1 ${
                            result.color === 'red' ? 'text-red-400' :
                            result.color === 'orange' ? 'text-orange-400' :
                            result.color === 'yellow' ? 'text-yellow-400' :
                            'text-green-400'
                          }`}>{score}</div>
                          <p className={`text-sm font-semibold uppercase ${
                            result.color === 'red' ? 'text-red-400' :
                            result.color === 'orange' ? 'text-orange-400' :
                            result.color === 'yellow' ? 'text-yellow-400' :
                            'text-green-400'
                          }`}>
                            {result.color === 'green' ? 'GREEN Zone' :
                             result.color === 'yellow' ? 'YELLOW Zone' :
                             result.color === 'orange' ? 'ORANGE Zone' : 'RED Zone'}
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
