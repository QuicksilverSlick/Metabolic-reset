import React, { useState, useEffect } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MarketingLayout } from '@/components/layout/MarketingLayout';
import { useNavigate, useSearchParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { leadsApi, referralApi } from '@/lib/api';

// Lead capture validation schema
const leadSchema = z.object({
  age: z.string().min(1, "Age is required").refine((val) => {
    const num = parseInt(val);
    return num >= 18 && num <= 120;
  }, "Please enter a valid age (18-120)"),
  name: z.string().min(2, "Full name is required"),
  phone: z.string().min(10, "Valid phone number required"),
});
type LeadData = z.infer<typeof leadSchema>;

// Quiz Questions Data
const quizQuestions = [
  {
    id: 1,
    category: "Energy & Glucose",
    icon: Zap,
    question: "Do you experience a significant energy 'crash' or brain fog between 2:00 PM and 4:00 PM?",
    options: [
      {
        id: 'a',
        text: "Yes, I usually need caffeine, sugar, or a nap to keep going.",
        points: 0,
        indicator: "symptom"
      },
      {
        id: 'b',
        text: "No, my energy levels are flat and consistent all day.",
        points: 10,
        indicator: "stable"
      }
    ]
  },
  {
    id: 2,
    category: "Sleep & Cortisol",
    icon: Moon,
    question: "Do you wake up feeling fully rested without the need for immediate stimulation?",
    options: [
      {
        id: 'a',
        text: "No, I feel groggy or 'tired but wired' (a sign of high cortisol).",
        points: 0,
        indicator: "symptom"
      },
      {
        id: 'b',
        text: "Yes, I wake up naturally refreshed.",
        points: 10,
        indicator: "stable"
      }
    ]
  },
  {
    id: 3,
    category: "Satiety & Hunger Hormones",
    icon: Clock,
    question: "Can you comfortably go 4 to 5 hours between meals without feeling shaky or 'hangry'?",
    options: [
      {
        id: 'a',
        text: "No, I need to graze or snack frequently to function.",
        points: 0,
        indicator: "symptom"
      },
      {
        id: 'b',
        text: "Yes, fasting between meals is easy for me.",
        points: 10,
        indicator: "stable"
      }
    ]
  },
  {
    id: 4,
    category: "Visceral Fat Awareness",
    icon: Activity,
    question: "Do you currently track your Visceral Fat Rating (the inflammatory fat stored around your organs)?",
    options: [
      {
        id: 'a',
        text: "No, I only track my total weight on a standard scale.",
        points: 0,
        indicator: "symptom"
      },
      {
        id: 'b',
        text: "Yes, I track my biometrics regularly.",
        points: 10,
        indicator: "stable"
      }
    ]
  },
  {
    id: 5,
    category: "Muscle Protein Synthesis (MPS)",
    icon: Dumbbell,
    question: "Do you consistently hit 30g of protein within 30 minutes of waking up?",
    options: [
      {
        id: 'a',
        text: "No, I usually just have coffee or a light breakfast.",
        points: 0,
        indicator: "symptom"
      },
      {
        id: 'b',
        text: "Yes, that is my standard routine to trigger MPS.",
        points: 10,
        indicator: "stable"
      }
    ]
  }
];

// Get metabolic age offset based on score
const getMetabolicAgeOffset = (score: number): number => {
  if (score <= 10) return 12;
  if (score === 20) return 8;
  if (score === 30) return 5;
  return 2;
};

// Results Data based on score ranges
const getResult = (score: number, chronologicalAge: number) => {
  const offset = getMetabolicAgeOffset(score);
  const metabolicAge = chronologicalAge + offset;

  if (score <= 10) {
    return {
      type: 'fatigue',
      status: 'METABOLIC FATIGUE',
      priority: 'High Priority for Protocol Intervention',
      icon: AlertTriangle,
      color: 'red',
      headline: 'Your metabolism needs urgent attention.',
      diagnosis: "Your biomarkers indicate a breakdown in Muscle Protein Synthesis. Your body is likely cannibalizing its own muscle for energy, which lowers your metabolic rate. Standard \"dieting\" fails here because calorie restriction accelerates this muscle loss.",
      clinicalData: "According to the Arterburn Clinical Study (PubMed), a Protocol-based approach allows for significant fat loss while retaining 98% of lean muscle mass. You need this specific nutrition structure to reverse your fatigue and protect your metabolic engine.",
      cta: "INITIATE METABOLIC RESCUE",
      metabolicAgeOffset: offset,
      metabolicAge,
      riskLevel: 'Critical'
    };
  } else if (score === 20) {
    return {
      type: 'instability',
      status: 'GLUCOSE VARIABILITY',
      priority: 'Detected: Insulin Spikes & Crashes',
      icon: TrendingDown,
      color: 'orange',
      headline: 'Your blood sugar is on a roller coaster.',
      diagnosis: "Your metabolism is on a \"Roller Coaster.\" Relying on caffeine or sugar creates insulin spikes that trigger immediate fat storage. You are likely stuck in a cycle of \"Energy Crash → Craving → Storage.\"",
      clinicalData: "The Arterburn Study demonstrated that participants on the Protocol lost 10x more weight than the self-directed control group. Why? Because the Protocol flatlines insulin 6 times a day. We need to get you into the project to stabilize your blood sugar immediately.",
      cta: "STABILIZE YOUR GLUCOSE",
      metabolicAgeOffset: offset,
      metabolicAge,
      riskLevel: 'Elevated'
    };
  } else if (score === 30) {
    return {
      type: 'plateau',
      status: 'CORTISOL RESISTANCE',
      priority: 'The "Stress" Plateau',
      icon: BarChart3,
      color: 'yellow',
      headline: 'You\'re doing things right, but stuck.',
      diagnosis: "You are doing a lot of things \"right,\" but the scale won't move. This indicates Visceral Fat retention due to stress hormones (Cortisol). \"Eating less\" actually makes this worse by increasing stress on the body.",
      clinicalData: "You need a system proven to signal \"safety\" to your body. Data confirms the Protocol is up to 17x more effective at burning fat than unguided dieting because it nourishes the muscle while targeting visceral fat stores.",
      cta: "TARGET VISCERAL FAT",
      metabolicAgeOffset: offset,
      metabolicAge,
      riskLevel: 'Moderate'
    };
  } else {
    return {
      type: 'optimized',
      status: 'OPTIMIZED (LEADER)',
      priority: 'Candidate for Leadership Cohort',
      icon: Crown,
      color: 'green',
      headline: 'Your baseline health is strong.',
      diagnosis: "Your baseline health is strong. You have good data awareness and stable energy. We need participants with your stability to serve as the \"Standard\" to compare against the Self-Directed group.",
      clinicalData: "Join the Protocol Cohort to fine-tune your biometrics. Even high-performers in the clinical trials saw an average 14% reduction in inflammatory Visceral Fat. Help us lead the data set.",
      cta: "JOIN THE LEADERSHIP COHORT",
      metabolicAgeOffset: offset,
      metabolicAge,
      riskLevel: 'Low'
    };
  }
};

export function QuizPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get referral code from URL (e.g., /quiz?ref=ABC123)
  const referralCode = searchParams.get('ref') || undefined;

  const [phase, setPhase] = useState<'landing' | 'lead-capture' | 'quiz' | 'calculating' | 'results'>('landing');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, { optionId: string; points: number }>>({});
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [leadData, setLeadData] = useState<LeadData | null>(null);
  const [referrerName, setReferrerName] = useState<string | null>(null);

  // Fetch referrer name when we have a referral code
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
  }, [referralCode]);

  const { register, handleSubmit, formState: { errors } } = useForm<LeadData>({
    resolver: zodResolver(leadSchema)
  });

  const totalQuestions = quizQuestions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  // Calculate final score when quiz is complete
  useEffect(() => {
    if (phase === 'calculating') {
      const totalScore = Object.values(answers).reduce((sum, answer) => sum + answer.points, 0);
      setScore(totalScore);

      // Calculate metabolic age for the lead
      const chronoAge = leadData ? parseInt(leadData.age) : 50;
      const offset = getMetabolicAgeOffset(totalScore);
      const metabolicAge = chronoAge + offset;

      // Submit lead to API (fire and forget - don't block the UI)
      if (leadData) {
        leadsApi.submitLead({
          name: leadData.name,
          phone: leadData.phone,
          age: chronoAge,
          referralCode: referralCode || null,
          quizScore: totalScore,
          metabolicAge
        }).then((result) => {
          // Store the lead ID in session storage for potential conversion tracking
          if (result.id) {
            sessionStorage.setItem('quizLeadId', result.id);
          }
          console.log('Lead submitted successfully:', result);
        }).catch((err) => {
          // Don't interrupt the user experience on API failure
          console.error('Failed to submit lead:', err);
        });
      }

      // Simulate calculation animation
      const timer = setTimeout(() => {
        setPhase('results');
        // Trigger confetti for good scores
        if (totalScore >= 40) {
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
  }, [phase, answers, leadData, referralCode]);

  const handleStartQuiz = () => {
    setPhase('lead-capture');
  };

  const onLeadSubmit = (data: LeadData) => {
    setLeadData(data);
    // Lead will be submitted to API after quiz completion (in calculating phase)
    // This ensures we have the quiz score and metabolic age
    setPhase('quiz');
  };

  const handleSelectOption = (optionId: string, points: number) => {
    setSelectedOption(optionId);

    // Auto-advance after selection with a short delay
    setTimeout(() => {
      setAnswers(prev => ({
        ...prev,
        [currentQuestion]: { optionId, points }
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
      setSelectedOption(answers[currentQuestion - 1]?.optionId || null);
    } else {
      setPhase('lead-capture');
    }
  };

  const handleRegister = () => {
    const chronologicalAge = leadData ? parseInt(leadData.age) : 50;
    const result = getResult(score, chronologicalAge);

    // Store quiz result with lead data for registration page
    sessionStorage.setItem('quizResult', JSON.stringify({
      score,
      resultType: result.type,
      metabolicAge: result.metabolicAge,
      chronologicalAge,
      metabolicAgeOffset: result.metabolicAgeOffset,
      completedAt: new Date().toISOString(),
      leadData: leadData,
      referralCode
    }));

    // Pre-fill registration with lead data
    if (leadData) {
      sessionStorage.setItem('registrationPrefill', JSON.stringify({
        name: leadData.name,
        phone: leadData.phone
      }));
    }

    // Navigate with referral code if present
    const registerUrl = referralCode ? `/register?ref=${referralCode}` : '/register';
    navigate(registerUrl);
  };

  const chronologicalAge = leadData ? parseInt(leadData.age) : 50;
  const result = getResult(score, chronologicalAge);

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
              {referralCode && (
                <div className="absolute top-0 left-0 right-0 bg-gold-500/20 border-b border-gold-500/30 py-2 px-4 text-center">
                  <p className="text-gold-300 text-sm">
                    <Sparkles className="inline h-4 w-4 mr-1" />
                    You've been invited by {referrerName || 'a coach'}! Complete the quiz to get personalized results.
                  </p>
                </div>
              )}

              {/* DNA Helix Animation (subtle background) */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-gold-500 rounded-full animate-pulse"></div>
                <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-gold-500 rounded-full animate-pulse delay-300"></div>
                <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-gold-500 rounded-full animate-pulse delay-500"></div>
              </div>

              <div className={`relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 ${referralCode ? 'mt-8' : ''}`}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                  {/* Left Column - Copy */}
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                  >
                    {/* Trust Badge */}
                    <div className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-300 text-sm font-bold mb-6 backdrop-blur-sm">
                      <Activity className="h-4 w-4" />
                      <span>Free 60-Second Assessment</span>
                    </div>

                    {/* Headline - StoryBrand: Lead with Problem */}
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-[1.1] mb-6 tracking-tight">
                      <span className="text-white">Discover Your</span>
                      <br />
                      <span className="text-gold-500">True Metabolic Age</span>
                    </h1>

                    {/* Subheadline - Agitate the Problem */}
                    <p className="text-xl md:text-2xl text-slate-300 mb-6 leading-relaxed max-w-xl">
                      Are you aging faster on the inside than you look on the outside?
                    </p>

                    {/* Pain Points */}
                    <div className="space-y-3 mb-8">
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
                          className="flex items-center gap-3 text-slate-400"
                        >
                          <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                            <item.icon className="h-4 w-4 text-red-400" />
                          </div>
                          <span className="text-lg">{item.text}</span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Value Proposition */}
                    <p className="text-lg text-slate-400 mb-8 max-w-lg">
                      Take this 5-question quiz to uncover your <strong className="text-white">actual metabolic age</strong> and get a personalized protocol recommendation backed by clinical research.
                    </p>

                    {/* CTA Button */}
                    <Button
                      size="lg"
                      onClick={handleStartQuiz}
                      className="bg-gold-500 hover:bg-gold-600 text-navy-900 text-lg md:text-xl px-10 py-8 rounded-full shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:shadow-[0_0_40px_rgba(245,158,11,0.5)] hover:-translate-y-1 transition-all duration-300 font-bold tracking-wide group"
                    >
                      CALCULATE MY METABOLIC AGE
                      <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                    </Button>

                    {/* Social Proof */}
                    <div className="mt-8 flex items-center gap-4 text-sm text-slate-500">
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

                  {/* Right Column - Visual */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative hidden lg:block"
                  >
                    {/* Score Preview Card */}
                    <div className="relative">
                      <div className="absolute -inset-4 bg-gradient-to-r from-gold-500/20 to-blue-500/20 rounded-3xl blur-2xl"></div>
                      <Card className="relative border-navy-700 bg-navy-800/90 backdrop-blur-xl shadow-2xl">
                        <CardContent className="p-8">
                          {/* Header */}
                          <div className="text-center mb-8">
                            <div className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-gold-500/20 text-gold-400 text-xs font-bold mb-4">
                              <Activity className="h-3 w-3" />
                              METABOLIC AGE CALCULATOR
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Your Results Preview</h3>
                            <p className="text-slate-400 text-sm">Complete the quiz to unlock your true metabolic age</p>
                          </div>

                          {/* Locked Score Visual */}
                          <div className="relative mb-8">
                            <div className="w-48 h-48 mx-auto rounded-full bg-navy-900 border-4 border-navy-700 flex items-center justify-center relative overflow-hidden">
                              {/* Animated Ring */}
                              <div className="absolute inset-2 rounded-full border-4 border-dashed border-gold-500/30 animate-spin" style={{ animationDuration: '20s' }}></div>

                              {/* Center Content */}
                              <div className="text-center z-10">
                                <div className="text-5xl font-bold text-slate-600 mb-1">??</div>
                                <div className="text-slate-500 text-sm">Years Old</div>
                              </div>

                              {/* Lock Overlay */}
                              <div className="absolute inset-0 bg-navy-900/60 backdrop-blur-sm flex items-center justify-center">
                                <Shield className="h-12 w-12 text-slate-600" />
                              </div>
                            </div>
                          </div>

                          {/* Preview Metrics */}
                          <div className="grid grid-cols-2 gap-4">
                            {[
                              { label: "Your Age", value: "??", locked: true },
                              { label: "Metabolic Age", value: "??", locked: true },
                              { label: "Age Difference", value: "??", locked: true },
                              { label: "Risk Level", value: "??", locked: true }
                            ].map((metric, i) => (
                              <div key={i} className="bg-navy-900/50 rounded-xl p-4 text-center">
                                <div className="text-2xl font-bold text-slate-600 mb-1">{metric.value}</div>
                                <div className="text-xs text-slate-500">{metric.label}</div>
                              </div>
                            ))}
                          </div>

                          {/* Unlock CTA */}
                          <div className="mt-8 text-center">
                            <Button
                              onClick={handleStartQuiz}
                              className="bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold w-full py-6"
                            >
                              Unlock Your Metabolic Age
                              <ChevronRight className="ml-2 h-5 w-5" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </motion.div>
                </div>
              </div>
            </section>

            {/* What You'll Discover Section */}
            <section className="py-16 bg-slate-50">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-display font-bold text-navy-900 mb-4">
                    What You'll Discover
                  </h2>
                  <p className="text-xl text-slate-600">
                    In just 60 seconds, our assessment reveals your true metabolic age
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    {
                      icon: Calendar,
                      title: "Your Metabolic Age",
                      desc: "Find out if you're aging faster or slower than your actual age"
                    },
                    {
                      icon: Target,
                      title: "Risk Assessment",
                      desc: "Understand your visceral fat and cortisol resistance levels"
                    },
                    {
                      icon: Zap,
                      title: "Personalized Protocol",
                      desc: "Get a science-backed recommendation for your specific type"
                    }
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 text-center"
                    >
                      <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gold-50 flex items-center justify-center">
                        <item.icon className="h-8 w-8 text-gold-500" />
                      </div>
                      <h3 className="text-xl font-bold text-navy-900 mb-3">{item.title}</h3>
                      <p className="text-slate-600">{item.desc}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="text-center mt-12">
                  <Button
                    size="lg"
                    onClick={handleStartQuiz}
                    className="bg-navy-900 hover:bg-navy-800 text-white text-lg px-10 py-6 rounded-full font-bold"
                  >
                    START THE ASSESSMENT
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
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
                          <p className="text-gold-400 font-medium">Referred by a Coach</p>
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
                  <span>5 Questions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>60 Seconds</span>
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
        {phase === 'quiz' && (
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
                        {React.createElement(quizQuestions[currentQuestion].icon, {
                          className: "h-5 w-5 text-gold-500"
                        })}
                        <span className="text-gold-400 font-medium text-sm uppercase tracking-wider">
                          {quizQuestions[currentQuestion].category}
                        </span>
                      </div>
                    </div>

                    <CardContent className="p-6 md:p-8">
                      {/* Question */}
                      <h2 className="text-xl md:text-2xl font-bold text-white mb-8 leading-relaxed">
                        {quizQuestions[currentQuestion].question}
                      </h2>

                      {/* Options */}
                      <div className="space-y-4">
                        {quizQuestions[currentQuestion].options.map((option) => (
                          <motion.button
                            key={option.id}
                            onClick={() => handleSelectOption(option.id, option.points)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 ${
                              selectedOption === option.id
                                ? 'border-gold-500 bg-gold-500/10'
                                : 'border-navy-600 bg-navy-900 hover:border-gold-500/50 hover:bg-navy-900/80'
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                selectedOption === option.id
                                  ? 'border-gold-500 bg-gold-500'
                                  : 'border-slate-500'
                              }`}>
                                {selectedOption === option.id && (
                                  <Check className="h-4 w-4 text-navy-900" />
                                )}
                              </div>
                              <span className={`text-lg leading-relaxed ${
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
                  "Evaluating glucose stability...",
                  "Checking cortisol patterns...",
                  "Analyzing metabolic markers...",
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
                      strokeDashoffset={283 - (283 * (50 - result.metabolicAgeOffset) / 50)}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-slate-500 text-sm mb-1">Your Metabolic Age</span>
                    <span className={`text-6xl font-bold ${
                      result.color === 'red' ? 'text-red-400' :
                      result.color === 'orange' ? 'text-orange-400' :
                      result.color === 'yellow' ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>{result.metabolicAge}</span>
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
                      {result.metabolicAge}
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
                      +{result.metabolicAgeOffset}
                    </div>
                    <div className="text-slate-500 text-xs">Years Added</div>
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
                    <strong>{result.metabolicAge} years old</strong> — that's{' '}
                    <strong>{result.metabolicAgeOffset} years older</strong> than your actual age of {chronologicalAge}.
                  </p>
                </motion.div>
              </div>
            </section>

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
                          onClick={handleRegister}
                          className="bg-gold-500 hover:bg-gold-600 text-navy-900 text-lg md:text-xl px-10 py-8 rounded-full shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:shadow-[0_0_40px_rgba(245,158,11,0.5)] font-bold transition-all duration-300 group"
                        >
                          {result.cta} - $28
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

                {/* Secondary CTA */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="text-center mt-8"
                >
                  <Button
                    size="lg"
                    onClick={handleRegister}
                    className="bg-white text-navy-900 hover:bg-slate-100 text-lg px-8 py-6 rounded-full font-bold shadow-lg"
                  >
                    START YOUR RESET TODAY
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </MarketingLayout>
  );
}
