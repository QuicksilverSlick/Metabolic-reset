import React, { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Dynamic import for confetti - only loaded when celebration is triggered (saves ~15KB from critical path)
const loadConfetti = () => import('canvas-confetti').then(m => m.default);
import {
  Droplets,
  Footprints,
  Moon,
  Scale,
  ChevronRight,
  Loader2,
  AlertCircle,
  Copy,
  Share2,
  ArrowRight,
  Users,
  Trophy,
  Sparkles,
  ExternalLink,
  Check,
  History,
  Image,
  Calendar,
  Award,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { useUser, useDailyScore, useSubmitScore, useTeamRoster, useMyActiveEnrollment, useProject, useProjectWeek, useOpenProjects, useBiometricsHistory, useScoreHistory, useReferralHistory, useSystemSettings } from '@/hooks/use-queries';
import { toast } from 'sonner';
import { CircularProgress } from '@/components/ui/circular-progress';
import { getChallengeProgress, getTodayInTimezone } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { BugReportDialog } from '@/components/BugReportDialog';
import { KitReminderBanner } from '@/components/kit-reminder-banner';
import { ScaleReminderBanner } from '@/components/scale-reminder-banner';
import { AddToHomeScreenModal } from '@/components/AddToHomeScreenModal';
import { userApi } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
export function DashboardPage() {
  const navigate = useNavigate();
  const { data: user, isLoading: userLoading } = useUser();
  // Fetch roster if coach (will return empty if not coach or not enabled)
  const { data: roster } = useTeamRoster();
  // Date logic: Get today's date in YYYY-MM-DD based on user's timezone
  // This ensures habits reset at midnight in the user's local time
  const today = getTodayInTimezone(user?.timezone);
  const { data: score, isLoading: scoreLoading } = useDailyScore(today);
  const submitScore = useSubmitScore();

  // Fetch project context - user's active enrollment and project info
  const { data: activeEnrollment, isLoading: enrollmentLoading } = useMyActiveEnrollment();
  const { data: project, isLoading: projectLoading } = useProject(activeEnrollment?.projectId || null);
  const { data: weekInfo } = useProjectWeek(activeEnrollment?.projectId || null);

  // Fetch open projects for referral link selector
  const { data: openProjects } = useOpenProjects();

  // Fetch activity history
  const { data: biometricsHistory } = useBiometricsHistory();
  const { data: scoreHistory } = useScoreHistory(14); // Last 14 days
  const { data: referralHistory } = useReferralHistory();
  const { data: systemSettings } = useSystemSettings();

  // State for referral project selector dialog
  const [referralDialogOpen, setReferralDialogOpen] = useState(false);
  const [selectedReferralProject, setSelectedReferralProject] = useState<string | null>(null);

  // State for activity history
  const [selectedBiometric, setSelectedBiometric] = useState<{
    id: string;
    weekNumber: number;
    weight: number;
    bodyFat: number;
    visceralFat: number;
    leanMass: number;
    metabolicAge: number;
    screenshotUrl: string;
    pointsAwarded: number;
    submittedAt: number;
    cohortId?: string | null;
  } | null>(null);
  const [showAllScores, setShowAllScores] = useState(false);

  // Refs for habit card elements to trigger confetti from their position
  const habitRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // Confetti celebration function (dynamically loaded)
  const triggerConfetti = useCallback(async (element: HTMLElement | null) => {
    const confetti = await loadConfetti();
    if (!element) {
      // Fallback to center screen confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#FBBF24', '#FCD34D', '#0F172A', '#1E293B']
      });
      return;
    }

    // Get element position for targeted confetti
    const rect = element.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    // Fire confetti from the card position
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { x, y },
      colors: ['#F59E0B', '#FBBF24', '#FCD34D', '#0F172A', '#1E293B'],
      startVelocity: 30,
      gravity: 0.8,
      scalar: 1.2,
      ticks: 60
    });
  }, []);

  // PWA Install tracking callbacks
  const handlePWAPromptShown = useCallback(() => {
    if (user?.id) {
      userApi.trackPWAEvent(user.id, 'prompt_shown').catch(() => {});
    }
  }, [user?.id]);

  const handlePWADismissed = useCallback(() => {
    if (user?.id) {
      userApi.trackPWAEvent(user.id, 'prompt_dismissed').catch(() => {});
    }
  }, [user?.id]);

  const handlePWAInstalled = useCallback((source: 'android' | 'ios' | 'desktop') => {
    if (user?.id) {
      userApi.trackPWAEvent(user.id, 'installed', source).catch(() => {});
    }
  }, [user?.id]);

  // Check if all habits are completed to trigger big celebration (dynamically loaded)
  const triggerAllCompleteConfetti = useCallback(async () => {
    const confetti = await loadConfetti();
    const duration = 2000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      // Confetti from both sides
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#F59E0B', '#FBBF24', '#FCD34D', '#0F172A', '#1E293B', '#10B981']
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#F59E0B', '#FBBF24', '#FCD34D', '#0F172A', '#1E293B', '#10B981']
      });
    }, 250);
  }, []);

  // Habit items for manual tracking - lesson is auto-tracked when required videos are completed
  const habitItems = [
    { id: 'water', label: 'Water', icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { id: 'steps', label: 'Steps', icon: Footprints, color: 'text-gold-500', bg: 'bg-gold-50 dark:bg-gold-900/20' },
    { id: 'sleep', label: 'Sleep (7h+)', icon: Moon, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
  ] as const;

  const handleToggle = (habitId: string) => {
    if (!score) return;
    const currentHabits = score.habits;
    const wasCompleted = currentHabits[habitId as keyof typeof currentHabits];
    const newHabits = {
      ...currentHabits,
      [habitId]: !wasCompleted
    };

    // Trigger confetti when marking as complete (not when unchecking)
    if (!wasCompleted) {
      const element = habitRefs.current[habitId];
      triggerConfetti(element);

      // Check if all habits will be complete after this toggle
      const allComplete = Object.entries(newHabits).every(([_, value]) => value);
      if (allComplete) {
        // Delay the big celebration slightly
        setTimeout(() => {
          triggerAllCompleteConfetti();
          toast.success('All habits completed! Amazing work today!', {
            icon: '🎉',
            duration: 4000
          });
        }, 300);
      }
    }

    submitScore.mutate({
      date: today,
      habits: newHabits,
      projectId: activeEnrollment?.projectId
    });
  };
  // Generate quiz link with referral code and optional project
  const generateQuizLink = (projectId?: string | null) => {
    if (!user?.referralCode) return '';
    const params = new URLSearchParams();
    params.set('ref', user.referralCode);
    if (projectId) {
      params.set('project', projectId);
    }
    return `${window.location.origin}/quiz?${params.toString()}`;
  };

  const copyReferralLink = (projectId?: string | null) => {
    if (!user?.referralCode) return;
    const link = generateQuizLink(projectId);
    navigator.clipboard.writeText(link);
    toast.success('Quiz link copied to clipboard!');
    setReferralDialogOpen(false);
  };

  // Quick copy: use active enrollment project or no project
  const handleQuickCopy = () => {
    // If there's only one open project or user is enrolled, use that
    if (activeEnrollment?.projectId) {
      copyReferralLink(activeEnrollment.projectId);
    } else if (openProjects && openProjects.length === 1) {
      copyReferralLink(openProjects[0].id);
    } else if (openProjects && openProjects.length > 1) {
      // Multiple projects available, show selector
      setReferralDialogOpen(true);
    } else {
      // No projects, copy link without project
      copyReferralLink(null);
    }
  };
  if (userLoading || scoreLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
      </div>
    );
  }
  // Default empty state if no score yet (API returns null)
  const habits = score?.habits || { water: false, steps: false, sleep: false, lesson: false };
  const points = user?.points || 0;
  const isOrphan = !user?.captainId;
  const isCoach = user?.role === 'coach';
  const recruitCount = roster?.length || 0;
  const isQualified = recruitCount >= 10;
  // Calculate Progress - use project week info if available, fallback to user createdAt
  let day: number;
  let progressPercentage: number;

  if (weekInfo && project) {
    // Use project-based calculation
    day = weekInfo.dayOfChallenge;
    // Handle pre-start: clamp to 0 if project hasn't started
    progressPercentage = day > 0 ? (day / 28) * 100 : 0;
  } else if (user?.createdAt) {
    // Fallback to user registration date calculation
    const progress = getChallengeProgress(user.createdAt);
    day = progress.day;
    progressPercentage = progress.progressPercentage;
  } else {
    day = 1;
    progressPercentage = 0;
  }
  // Clamp values for display
  const dayDisplay = day > 28 ? 28 : (day < 1 ? 0 : day);
  const progressDisplay = Math.max(0, Math.min(100, progressPercentage));

  return (
    <div className="space-y-8">
      {/* PWA Install Prompt Modal */}
      <AddToHomeScreenModal
        onPromptShown={handlePWAPromptShown}
        onDismissed={handlePWADismissed}
        onInstalled={handlePWAInstalled}
      />

      {/* Reminder Banners */}
      <KitReminderBanner />
      <ScaleReminderBanner />

      {/* Orphan Alert */}
      {isOrphan && (
        <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertTitle className="text-red-800 dark:text-red-300 font-bold">You need a Group!</AlertTitle>
          <AlertDescription className="text-red-700 dark:text-red-400 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
            <span>You are currently not assigned to a Group Facilitator. Join a group to be eligible for awards.</span>
            <Button
              size="sm"
              variant="outline"
              className="bg-white dark:bg-red-950 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-800 shrink-0"
              onClick={() => navigate('/app/assign')}
            >
              Find a Group <ArrowRight className="ml-2 h-3 w-3" />
            </Button>
          </AlertDescription>
        </Alert>
      )}
      {/* Welcome & Stats Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-display font-bold text-navy-900 dark:text-white">
              Hello, {user?.name || 'Participant'}
            </h1>
            {project && (
              <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                {project.name}
              </Badge>
            )}
          </div>
          <p className="text-slate-500 dark:text-slate-400">
            {weekInfo && weekInfo.dayOfChallenge > 0
              ? `Week ${weekInfo.weekNumber} • Day ${weekInfo.dayOfChallenge} of 28`
              : weekInfo && weekInfo.dayOfChallenge <= 0
              ? `Challenge starts ${new Date(project?.startDate || 0).toLocaleDateString()}`
              : "Let's crush your goals today."}
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
            {/* Progress Card */}
            <div className="bg-white dark:bg-navy-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-navy-800 flex items-center gap-4 min-w-[200px] transition-colors">
                <CircularProgress value={progressDisplay} size={50} strokeWidth={5}>
                    <span className="text-[10px] font-bold text-navy-900 dark:text-white">{Math.round(progressDisplay)}%</span>
                </CircularProgress>
                <div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">
                      {dayDisplay > 0 ? `Day ${dayDisplay} of 28` : 'Starts Soon'}
                    </div>
                    <div className="text-sm font-medium text-navy-900 dark:text-white">
                      {dayDisplay > 0 ? 'Keep going!' : 'Get ready!'}
                    </div>
                </div>
            </div>
            {/* Points Card */}
            <div className="bg-white dark:bg-navy-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-navy-800 flex items-center gap-4 min-w-[180px] transition-colors">
                 <div className="h-10 w-10 rounded-full bg-gold-100 dark:bg-gold-900/30 flex items-center justify-center text-gold-600 dark:text-gold-400 font-bold shrink-0">
                    P
                 </div>
                 <div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Total Points</div>
                    <div className="text-2xl font-bold text-gold-500">{points}</div>
                 </div>
            </div>
            {/* Group Facilitator Group Summary Card */}
            {isCoach && (
              <div className="bg-white dark:bg-navy-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-navy-800 flex items-center gap-4 min-w-[180px] transition-colors cursor-pointer hover:border-gold-200 dark:hover:border-gold-500/50" onClick={() => navigate('/app/roster')}>
                 <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold shrink-0 ${isQualified ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                    {isQualified ? <Trophy className="h-5 w-5" /> : <Users className="h-5 w-5" />}
                 </div>
                 <div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Group Size</div>
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-bold text-navy-900 dark:text-white">{recruitCount}</div>
                      {isQualified && <span className="text-[10px] bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-1.5 py-0.5 rounded font-bold">QUALIFIED</span>}
                    </div>
                 </div>
              </div>
            )}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* The Study Widget (Biometrics) - Spans 2 columns on large screens */}
        <Card className="lg:col-span-2 border-gold-200 dark:border-navy-700 bg-gradient-to-br from-white to-gold-50/50 dark:from-navy-900 dark:to-navy-800 overflow-hidden relative transition-colors shadow-sm dark:shadow-[0_4px_20px_-2px_rgba(15,23,42,0.5)]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 dark:bg-gold-500/10 rounded-full -mr-10 -mt-10"></div>
          <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-6">
              <div className="h-16 w-16 rounded-2xl bg-gold-100 dark:bg-gold-900/30 flex items-center justify-center shrink-0">
                <Scale className="h-8 w-8 text-gold-600 dark:text-gold-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-navy-900 dark:text-white">Weekly Biometrics</h3>
                <p className="text-slate-600 dark:text-slate-300 max-w-md">
                  Log your weight and body composition to earn +25 points.
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate('/app/biometrics')}
              className="shrink-0 rounded-full px-8 py-6 text-lg bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all"
            >
              Log Data
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
        {/* Share & Earn Widget - Spans 1 column */}
        <Card className="border-slate-200 dark:border-navy-700 shadow-sm dark:shadow-[0_4px_20px_-2px_rgba(15,23,42,0.5)] bg-white dark:bg-navy-900 relative overflow-hidden transition-colors">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gold-500/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="flex items-center gap-2 text-navy-900 dark:text-white">
              <Share2 className="h-5 w-5 text-gold-500" />
              Share & Earn
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-300">
              Refer friends to earn points!
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10 space-y-4">
            <div className="text-sm font-medium text-gold-600 dark:text-gold-400">
              {(() => {
                const isCoach = user?.role === 'coach';
                const points = isCoach
                  ? (systemSettings?.referralPointsCoach || 1)
                  : (systemSettings?.referralPointsChallenger || 5);
                const pointText = points === 1 ? 'Point' : 'Points';
                return isCoach
                  ? `Earn ${points} ${pointText} per referral. Build your group.`
                  : `Earn ${points} ${pointText} per referral. Build your group.`;
              })()}
            </div>
            <div className="bg-slate-100 dark:bg-navy-950/50 p-3 rounded-lg border border-slate-200 dark:border-navy-700 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Sparkles className="h-4 w-4 text-gold-500 shrink-0" />
                <code className="text-xs sm:text-sm font-mono text-navy-900 dark:text-slate-300 truncate">
                  {generateQuizLink(activeEnrollment?.projectId || openProjects?.[0]?.id).replace(window.location.origin, '').substring(0, 25)}...
                </code>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-slate-500 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10 hover:text-gold-500 dark:hover:text-gold-400"
                onClick={handleQuickCopy}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Dialog open={referralDialogOpen} onOpenChange={setReferralDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={handleQuickCopy}
                  className="w-full bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-all"
                >
                  Copy Quiz Link
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-navy-900 border-navy-700">
                <DialogHeader>
                  <DialogTitle className="text-white flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-gold-500" />
                    Select a Project
                  </DialogTitle>
                  <DialogDescription className="text-slate-400">
                    Choose which project you want to refer friends to. They'll complete the metabolic quiz and can join your selected project.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 mt-4">
                  {openProjects?.map((proj) => (
                    <button
                      key={proj.id}
                      onClick={() => copyReferralLink(proj.id)}
                      className="w-full p-4 rounded-xl border-2 border-navy-700 bg-navy-800 hover:border-gold-500/50 hover:bg-navy-800/80 transition-all text-left group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-white group-hover:text-gold-400 transition-colors">
                            {proj.name}
                          </div>
                          <div className="text-sm text-slate-400">
                            Starts {new Date(proj.startDate).toLocaleDateString()}
                          </div>
                        </div>
                        <Copy className="h-5 w-5 text-slate-500 group-hover:text-gold-400 transition-colors" />
                      </div>
                    </button>
                  ))}
                  {/* Option to copy without project */}
                  <button
                    onClick={() => copyReferralLink(null)}
                    className="w-full p-4 rounded-xl border-2 border-dashed border-navy-700 bg-navy-900/50 hover:border-gold-500/30 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-400 group-hover:text-slate-300 transition-colors">
                          General Referral Link
                        </div>
                        <div className="text-sm text-slate-500">
                          Let them choose their project later
                        </div>
                      </div>
                      <Copy className="h-5 w-5 text-slate-600 group-hover:text-slate-400 transition-colors" />
                    </div>
                  </button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
      {/* Daily Habits Grid */}
      <div>
        <h2 className="text-xl font-display font-bold text-navy-900 dark:text-white mb-4">Daily Habits</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {habitItems.map((habit) => {
            const isDone = habits[habit.id as keyof typeof habits];
            const Icon = habit.icon;
            return (
              <motion.button
                key={habit.id}
                ref={(el) => { habitRefs.current[habit.id] = el; }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleToggle(habit.id)}
                disabled={submitScore.isPending}
                className={`relative p-6 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between h-40 ${
                  isDone
                    ? 'bg-gold-500/20 dark:bg-gold-500/15 backdrop-blur-xl border-gold-400/50 dark:border-gold-500/40'
                    : 'bg-white dark:bg-navy-800 border-slate-200 dark:border-navy-700 hover:border-gold-300 dark:hover:border-gold-500/50 hover:shadow-md'
                }`}
              >
                {/* Icon circle */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  isDone
                    ? 'bg-gold-500/25 dark:bg-gold-500/30 backdrop-blur-sm'
                    : habit.bg
                }`}>
                  <Icon className={`h-5 w-5 transition-colors ${
                    isDone
                      ? 'text-gold-500 dark:text-gold-400'
                      : `${habit.color} opacity-90`
                  }`} />
                </div>
                {/* Text content */}
                <div>
                  <div className={`font-bold text-lg transition-colors ${isDone ? 'text-navy-900 dark:text-white' : 'text-navy-900 dark:text-white'}`}>
                    {habit.label}
                  </div>
                  <div className={`text-sm mt-1 font-medium transition-colors ${isDone ? 'text-gold-600 dark:text-gold-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    {isDone ? '✓ Completed' : '+1 Point'}
                  </div>
                </div>
                {/* Checkmark badge */}
                {isDone && (
                  <div className="absolute top-4 right-4">
                    <div className="w-7 h-7 bg-gold-500/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Activity History Section */}
      {((biometricsHistory && biometricsHistory.length > 0) || (scoreHistory && scoreHistory.length > 0) || (referralHistory && referralHistory.length > 0)) && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <History className="h-6 w-6 text-gold-500" />
            <h2 className="text-xl font-display font-bold text-navy-900 dark:text-white">Activity History</h2>
          </div>

          {/* Referral Activity */}
          {referralHistory && referralHistory.length > 0 && (
            <Card className="border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 shadow-sm dark:shadow-[0_4px_20px_-2px_rgba(15,23,42,0.5)]">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-navy-900 dark:text-white text-lg">
                  <Users className="h-5 w-5 text-gold-500" />
                  Referral Rewards
                </CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400">
                  Points earned from your referrals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {referralHistory.map((activity) => (
                  <div
                    key={activity.id}
                    className="p-4 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {activity.referredUser?.avatarUrl ? (
                          <img
                            src={activity.referredUser.avatarUrl}
                            alt={activity.referredUser.name}
                            className="h-10 w-10 rounded-full object-cover border-2 border-green-500"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center border-2 border-green-500">
                            <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-navy-900 dark:text-white">
                            {activity.referredUser?.name || 'Referred User'}
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(activity.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600 dark:text-green-400">+{activity.points}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">points</div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Biometric Submissions History */}
            {biometricsHistory && biometricsHistory.length > 0 && (
              <Card className="border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 shadow-sm dark:shadow-[0_4px_20px_-2px_rgba(15,23,42,0.5)]">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-navy-900 dark:text-white text-lg">
                    <Scale className="h-5 w-5 text-gold-500" />
                    Biometric Submissions
                  </CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400">
                    Your weekly weigh-in history
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {biometricsHistory.map((bio) => (
                    <motion.button
                      key={bio.id}
                      onClick={() => setSelectedBiometric(bio)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full p-4 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 hover:border-gold-300 dark:hover:border-gold-500/50 hover:bg-slate-100 dark:hover:bg-navy-700 transition-all text-left group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-gold-100 dark:bg-gold-900/30 flex items-center justify-center">
                            <Image className="h-5 w-5 text-gold-600 dark:text-gold-400" />
                          </div>
                          <div>
                            <div className="font-semibold text-navy-900 dark:text-white">
                              Week {bio.weekNumber} {bio.weekNumber === 0 ? '(Initial)' : ''}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(bio.submittedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="font-bold text-gold-500">+{bio.pointsAwarded}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">points</div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-gold-500 transition-colors" />
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Daily Habits History */}
            {scoreHistory && scoreHistory.length > 0 && (
              <Card className="border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 shadow-sm dark:shadow-[0_4px_20px_-2px_rgba(15,23,42,0.5)]">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-navy-900 dark:text-white text-lg">
                    <Award className="h-5 w-5 text-gold-500" />
                    Daily Habits Log
                  </CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400">
                    Your recent daily habit completions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(showAllScores ? scoreHistory : scoreHistory.slice(0, 5)).map((score) => {
                    const completedCount = Object.values(score.habits).filter(Boolean).length;
                    const allComplete = completedCount === 4;
                    return (
                      <div
                        key={score.id}
                        className={`p-3 rounded-xl border transition-all ${
                          allComplete
                            ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                            : 'border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                              allComplete
                                ? 'bg-green-500 dark:bg-green-600'
                                : 'bg-slate-200 dark:bg-navy-700'
                            }`}>
                              {allComplete ? (
                                <Check className="h-4 w-4 text-white" />
                              ) : (
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{completedCount}/3</span>
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-navy-900 dark:text-white">
                                {new Date(score.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                {score.habits.water && <Droplets className="h-3 w-3 text-blue-500" />}
                                {score.habits.steps && <Footprints className="h-3 w-3 text-gold-500" />}
                                {score.habits.sleep && <Moon className="h-3 w-3 text-indigo-500" />}
                                {/* Lesson habit is auto-tracked via video completion */}
                              </div>
                            </div>
                          </div>
                          <div className={`font-bold ${score.totalPoints > 0 ? 'text-gold-500' : 'text-slate-400'}`}>
                            +{score.totalPoints}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {scoreHistory.length > 5 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllScores(!showAllScores)}
                      className="w-full mt-2 text-slate-600 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                    >
                      {showAllScores ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-1" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-1" />
                          Show All ({scoreHistory.length} days)
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Biometric Detail Modal */}
      <AnimatePresence>
        {selectedBiometric && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setSelectedBiometric(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-navy-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white dark:bg-navy-900 border-b border-slate-200 dark:border-navy-700 p-4 flex items-center justify-between z-10">
                <div>
                  <h3 className="text-xl font-bold text-navy-900 dark:text-white">
                    Week {selectedBiometric.weekNumber} Biometrics
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Submitted {new Date(selectedBiometric.submittedAt).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedBiometric(null)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
                >
                  <X className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Points Badge */}
                <div className="flex items-center justify-center">
                  <div className="bg-gold-100 dark:bg-gold-900/30 px-6 py-3 rounded-full flex items-center gap-2">
                    <Award className="h-5 w-5 text-gold-600 dark:text-gold-400" />
                    <span className="text-lg font-bold text-gold-600 dark:text-gold-400">
                      +{selectedBiometric.pointsAwarded} Points Earned
                    </span>
                  </div>
                </div>

                {/* Measurements Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-800 text-center">
                    <div className="text-2xl font-bold text-navy-900 dark:text-white">{selectedBiometric.weight}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Weight (lbs)</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-800 text-center">
                    <div className="text-2xl font-bold text-navy-900 dark:text-white">{selectedBiometric.bodyFat}%</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Body Fat</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-800 text-center">
                    <div className="text-2xl font-bold text-navy-900 dark:text-white">{selectedBiometric.visceralFat}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Visceral Fat</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-800 text-center">
                    <div className="text-2xl font-bold text-navy-900 dark:text-white">{selectedBiometric.leanMass}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Lean Mass (lbs)</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-800 text-center col-span-2 sm:col-span-1">
                    <div className="text-2xl font-bold text-navy-900 dark:text-white">{selectedBiometric.metabolicAge}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Metabolic Age</div>
                  </div>
                </div>

                {/* Screenshot */}
                {selectedBiometric.screenshotUrl && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-navy-900 dark:text-white uppercase tracking-wider">Proof Screenshot</h4>
                    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-navy-700">
                      <img
                        src={selectedBiometric.screenshotUrl}
                        alt="Biometrics screenshot"
                        className="w-full h-auto max-h-96 object-contain bg-slate-100 dark:bg-navy-800"
                      />
                    </div>
                  </div>
                )}

                {/* Cohort Badge */}
                {selectedBiometric.cohortId && (
                  <div className="flex items-center justify-center">
                    <Badge variant="outline" className={`${
                      selectedBiometric.cohortId === 'GROUP_A' || selectedBiometric.cohortId === 'GROUP_C'
                        ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800'
                        : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                    }`}>
                      {selectedBiometric.cohortId === 'GROUP_A' ? 'Protocol A' : selectedBiometric.cohortId === 'GROUP_C' ? 'Protocol C (Switcher)' : 'Protocol B'}
                    </Badge>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bug Report Button - Fixed position */}
      <BugReportDialog />
    </div>
  );
}