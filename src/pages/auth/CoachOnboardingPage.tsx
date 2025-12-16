import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Check,
  ArrowRight,
  Loader2,
  AlertCircle,
  Mail,
  Phone,
  UserCircle,
  Shield,
  Users,
  Link as LinkIcon,
  Copy,
  CheckCircle,
  Share2,
  Sparkles,
  Target,
  TrendingUp,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { MarketingLayout } from '@/components/layout/MarketingLayout';
import { useRegister } from '@/hooks/use-queries';
import confetti from 'canvas-confetti';

// Validation Schema
const coachInfoSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number required"),
});
type CoachInfo = z.infer<typeof coachInfoSchema>;

export function CoachOnboardingPage() {
  const navigate = useNavigate();
  const registerMutation = useRegister();

  const [step, setStep] = useState<'info' | 'success'>('info');
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<CoachInfo>({
    resolver: zodResolver(coachInfoSchema)
  });

  const onSubmit = async (data: CoachInfo) => {
    try {
      const result = await registerMutation.mutateAsync({
        ...data,
        role: 'coach',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        hasScale: true,
        // No projectId - they're not enrolling in a project yet
      });

      // Store the referral code from the response
      if (result.referralCode) {
        setReferralCode(result.referralCode);
      }

      setStep('success');

      // Celebration confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#FBBF24', '#FCD34D', '#3B82F6', '#60A5FA']
      });
    } catch (err) {
      // Error handled by mutation hook
    }
  };

  const quizLink = referralCode
    ? `${window.location.origin}/quiz?ref=${referralCode}`
    : null;

  const copyToClipboard = async () => {
    if (quizLink) {
      await navigator.clipboard.writeText(quizLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const slideVariants = {
    enter: { x: 50, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 }
  };

  return (
    <MarketingLayout>
      <div className="min-h-screen bg-navy-900 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative max-w-6xl mx-auto px-4 py-8 md:py-12">
          {/* Header */}
          <div className="text-center mb-8 md:mb-12">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-400 text-sm font-medium mb-4"
            >
              <Users className="h-4 w-4" />
              Group Leader Registration
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl font-display font-bold text-white mb-3"
            >
              Become a Group Leader
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 max-w-xl mx-auto"
            >
              Register now to get your unique referral link and start building your team.
              No payment required until you're ready to lead a challenge.
            </motion.p>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
            {/* Left Side - Form */}
            <div className="lg:col-span-3">
              <AnimatePresence mode="wait">
                {/* Registration Form */}
                {step === 'info' && (
                  <motion.div
                    key="info"
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
                          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <UserCircle className="h-5 w-5 text-blue-400" />
                          </div>
                          <div>
                            <h2 className="text-xl md:text-2xl font-bold text-white">Your Information</h2>
                            <p className="text-slate-400 text-sm">We'll create your coach account</p>
                          </div>
                        </div>
                      </div>

                      <CardContent className="p-6 md:p-8">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                          {/* Name Field */}
                          <div className="space-y-2">
                            <Label htmlFor="name" className="text-slate-200 flex items-center gap-2">
                              <UserCircle className="h-4 w-4 text-slate-400" />
                              Full Name
                            </Label>
                            <Input
                              id="name"
                              placeholder="Jane Doe"
                              {...register('name')}
                              className="bg-navy-900 border-navy-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 h-12 text-lg rounded-xl"
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
                              className="bg-navy-900 border-navy-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 h-12 text-lg rounded-xl"
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
                              className="bg-navy-900 border-navy-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 h-12 text-lg rounded-xl"
                            />
                            {errors.phone && (
                              <p className="text-red-400 text-sm flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {errors.phone.message}
                              </p>
                            )}
                          </div>

                          {/* Info Box */}
                          <Alert className="bg-blue-500/10 border-blue-500/30 rounded-xl">
                            <Shield className="h-4 w-4 text-blue-400" />
                            <AlertTitle className="text-blue-400">No Payment Required</AlertTitle>
                            <AlertDescription className="text-blue-300/80 text-sm">
                              You'll get your referral link immediately. Payment is only required when you're ready to actively lead a challenge.
                            </AlertDescription>
                          </Alert>

                          {/* Submit Button */}
                          <Button
                            type="submit"
                            disabled={registerMutation.isPending}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-7 text-lg font-bold rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:-translate-y-0.5 transition-all duration-300"
                          >
                            {registerMutation.isPending ? (
                              <>
                                <Loader2 className="animate-spin mr-2 h-5 w-5" />
                                Creating Account...
                              </>
                            ) : (
                              <>
                                Get My Referral Link
                                <ArrowRight className="ml-2 h-5 w-5" />
                              </>
                            )}
                          </Button>

                          {/* Already have an account link */}
                          <p className="text-center text-slate-500 text-sm">
                            Already registered?{' '}
                            <button
                              type="button"
                              onClick={() => navigate('/login')}
                              className="text-blue-400 hover:text-blue-300 font-medium"
                            >
                              Log in here
                            </button>
                          </p>
                        </form>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Success - Show Referral Link */}
                {step === 'success' && (
                  <motion.div
                    key="success"
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border-navy-700 bg-navy-800/80 backdrop-blur-xl shadow-2xl overflow-hidden">
                      <CardContent className="p-8 md:p-12">
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
                            <CheckCircle className="h-12 w-12 text-green-500" />
                          </motion.div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="text-center"
                        >
                          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                            You're All Set!
                          </h2>
                          <p className="text-xl text-slate-400 mb-8 max-w-md mx-auto">
                            Your Group Leader account is ready. Share your unique quiz link to start recruiting challengers.
                          </p>
                        </motion.div>

                        {/* Referral Link Box */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          className="bg-navy-900 rounded-xl p-6 mb-8 border border-navy-700"
                        >
                          <div className="flex items-center gap-2 text-blue-400 font-medium mb-4">
                            <LinkIcon className="h-5 w-5" />
                            Your Quiz Referral Link
                          </div>

                          <div className="flex items-center gap-3 mb-4">
                            <div className="flex-1 bg-navy-800 border border-navy-600 rounded-lg px-4 py-3 text-slate-300 font-mono text-sm overflow-hidden">
                              <span className="block truncate">{quizLink}</span>
                            </div>
                            <Button
                              onClick={copyToClipboard}
                              variant="outline"
                              className="shrink-0 border-navy-600 hover:bg-navy-700 text-white"
                            >
                              {copied ? (
                                <>
                                  <Check className="h-4 w-4 mr-2 text-green-400" />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Copy
                                </>
                              )}
                            </Button>
                          </div>

                          <p className="text-slate-500 text-sm">
                            When people take the quiz using this link, they'll automatically be assigned to your team when they register.
                          </p>
                        </motion.div>

                        {/* What's Next */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 }}
                          className="bg-navy-900 rounded-xl p-6 mb-8 text-left border border-navy-700"
                        >
                          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-gold-500" />
                            What's Next?
                          </h3>
                          <div className="space-y-3">
                            {[
                              "Share your quiz link on social media, email, or text",
                              "Track leads as they complete the quiz",
                              "When a challenge opens, enroll to lead your team",
                              "Earn rewards for team participation and results"
                            ].map((item, i) => (
                              <div key={i} className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                  <span className="text-blue-400 text-sm font-bold">{i + 1}</span>
                                </div>
                                <span className="text-slate-300">{item}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>

                        {/* Action Buttons */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.7 }}
                          className="flex flex-col sm:flex-row gap-4"
                        >
                          <Button
                            onClick={() => navigate('/app')}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-6 text-lg font-bold rounded-xl"
                          >
                            Go to Dashboard
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </Button>
                          <Button
                            onClick={copyToClipboard}
                            variant="outline"
                            className="flex-1 border-navy-600 hover:bg-navy-700 text-white py-6 text-lg font-bold rounded-xl"
                          >
                            <Share2 className="mr-2 h-5 w-5" />
                            Share Link
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
                      <Award className="h-5 w-5 text-blue-400" />
                      Group Leader Benefits
                    </h3>
                    <div className="space-y-4">
                      {[
                        {
                          icon: LinkIcon,
                          title: "Unique Referral Link",
                          desc: "Your personal quiz link to recruit challengers"
                        },
                        {
                          icon: Users,
                          title: "Team Dashboard",
                          desc: "Track your team's progress and biometrics"
                        },
                        {
                          icon: Target,
                          title: "Lead Tracking",
                          desc: "See who's taken your quiz before they register"
                        },
                        {
                          icon: TrendingUp,
                          title: "Referral Rewards",
                          desc: "Earn points and recognition for team growth"
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
                            <item.icon className="h-5 w-5 text-blue-400" />
                          </div>
                          <div>
                            <h4 className="text-white font-medium">{item.title}</h4>
                            <p className="text-slate-500 text-sm">{item.desc}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* How It Works */}
                    <div className="mt-8 pt-6 border-t border-navy-700">
                      <h4 className="text-white font-medium mb-4">How It Works</h4>
                      <div className="space-y-3 text-sm text-slate-400">
                        <div className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">1</span>
                          <span>Register now (free, no payment)</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">2</span>
                          <span>Share your quiz link to recruit</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">3</span>
                          <span>Pay $49 when ready to lead a challenge</span>
                        </div>
                      </div>
                    </div>

                    {/* Note */}
                    <div className="mt-6 p-4 bg-gold-500/10 border border-gold-500/30 rounded-xl">
                      <div className="flex items-center gap-2 text-gold-400 font-medium text-sm mb-1">
                        <Sparkles className="h-4 w-4" />
                        Start Building Now
                      </div>
                      <p className="text-gold-300/70 text-xs">
                        Your referrals are tracked immediately. Build your team before the next challenge opens!
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
