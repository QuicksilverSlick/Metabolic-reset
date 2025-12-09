import React from 'react';
import { motion } from 'framer-motion';
import {
  Droplets,
  Footprints,
  Moon,
  PlayCircle,
  Scale,
  ChevronRight,
  Loader2,
  AlertCircle,
  Copy,
  Share2,
  ArrowRight,
  Users,
  Trophy
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { useUser, useDailyScore, useSubmitScore, useTeamRoster } from '@/hooks/use-queries';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { CircularProgress } from '@/components/ui/circular-progress';
import { getChallengeProgress } from '@/lib/utils';
export function DashboardPage() {
  const navigate = useNavigate();
  const { data: user, isLoading: userLoading } = useUser();
  // Fetch roster if coach (will return empty if not coach or not enabled)
  const { data: roster } = useTeamRoster();
  // Date logic: Get today's date in YYYY-MM-DD
  const today = format(new Date(), 'yyyy-MM-dd');
  const { data: score, isLoading: scoreLoading } = useDailyScore(today);
  const submitScore = useSubmitScore();
  const habitItems = [
    { id: 'water', label: 'Water', icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { id: 'steps', label: 'Steps', icon: Footprints, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { id: 'sleep', label: 'Sleep (7h+)', icon: Moon, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { id: 'lesson', label: 'Daily Lesson', icon: PlayCircle, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
  ] as const;
  const handleToggle = (habitId: string) => {
    if (!score) return;
    const currentHabits = score.habits;
    const newHabits = {
      ...currentHabits,
      [habitId]: !currentHabits[habitId as keyof typeof currentHabits]
    };
    submitScore.mutate({
      date: today,
      habits: newHabits
    });
  };
  const copyReferralLink = () => {
    if (!user?.referralCode) return;
    const link = `${window.location.origin}/register?ref=${user.referralCode}`;
    navigator.clipboard.writeText(link);
    toast.success('Invite link copied to clipboard!');
  };
  if (userLoading || scoreLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
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
  // Calculate Progress using shared utility
  const { day, progressPercentage } = user?.createdAt
    ? getChallengeProgress(user.createdAt)
    : { day: 1, progressPercentage: 0 };
  const dayDisplay = day > 28 ? 28 : day;
  return (
    <div className="space-y-8">
      {/* Orphan Alert */}
      {isOrphan && (
        <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertTitle className="text-red-800 dark:text-red-300 font-bold">You need a Team!</AlertTitle>
          <AlertDescription className="text-red-700 dark:text-red-400 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
            <span>You are currently not assigned to a Captain. Join a team to be eligible for prizes.</span>
            <Button
              size="sm"
              variant="outline"
              className="bg-white dark:bg-red-950 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-800 shrink-0"
              onClick={() => navigate('/app/assign')}
            >
              Find a Team <ArrowRight className="ml-2 h-3 w-3" />
            </Button>
          </AlertDescription>
        </Alert>
      )}
      {/* Welcome & Stats Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-navy-900 dark:text-white">
            Hello, {user?.name || 'Challenger'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Let's crush your goals today.</p>
        </div>
        <div className="flex flex-wrap gap-4">
            {/* Progress Card */}
            <div className="bg-white dark:bg-navy-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-navy-800 flex items-center gap-4 min-w-[200px] transition-colors">
                <CircularProgress value={progressPercentage} size={50} strokeWidth={5}>
                    <span className="text-[10px] font-bold text-navy-900 dark:text-white">{Math.round(progressPercentage)}%</span>
                </CircularProgress>
                <div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Day {dayDisplay} of 28</div>
                    <div className="text-sm font-medium text-navy-900 dark:text-white">Keep going!</div>
                </div>
            </div>
            {/* Points Card */}
            <div className="bg-white dark:bg-navy-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-navy-800 flex items-center gap-4 min-w-[180px] transition-colors">
                 <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold shrink-0">
                    P
                 </div>
                 <div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Total Points</div>
                    <div className="text-2xl font-bold text-orange-500">{points}</div>
                 </div>
            </div>
            {/* Coach Team Summary Card */}
            {isCoach && (
              <div className="bg-white dark:bg-navy-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-navy-800 flex items-center gap-4 min-w-[180px] transition-colors cursor-pointer hover:border-orange-200 dark:hover:border-orange-500/50" onClick={() => navigate('/app/roster')}>
                 <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold shrink-0 ${isQualified ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                    {isQualified ? <Trophy className="h-5 w-5" /> : <Users className="h-5 w-5" />}
                 </div>
                 <div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Team Size</div>
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
        <Card className="lg:col-span-2 border-orange-200 dark:border-navy-700 bg-gradient-to-br from-white to-orange-50/50 dark:from-navy-900 dark:to-navy-800 overflow-hidden relative transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 dark:bg-orange-500/10 rounded-full -mr-10 -mt-10"></div>
          <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-6">
              <div className="h-16 w-16 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
                <Scale className="h-8 w-8 text-orange-600 dark:text-orange-400" />
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
              className="shrink-0 rounded-full px-8 py-6 text-lg bg-navy-900 hover:bg-navy-800 dark:bg-orange-500 dark:hover:bg-orange-600 dark:text-white"
            >
              Log Data
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
        {/* Share & Earn Widget - Spans 1 column */}
        <Card className="border-slate-200 dark:border-navy-700 shadow-sm bg-navy-900 dark:bg-navy-950 text-white relative overflow-hidden transition-colors">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="flex items-center gap-2 text-white">
              <Share2 className="h-5 w-5 text-orange-500" />
              Share & Earn
            </CardTitle>
            <CardDescription className="text-slate-300">
              Rocket up the leaderboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10 space-y-4">
            <div className="text-sm font-medium text-orange-300">
              {user?.role === 'challenger'
                ? 'Earn 10 Points for every friend you recruit!'
                : 'Earn 1 Point per recruit. Build your roster.'}
            </div>
            <div className="bg-navy-800/50 dark:bg-navy-900/50 p-3 rounded-lg border border-navy-700 flex items-center justify-between gap-2">
              <code className="text-xs sm:text-sm font-mono text-slate-300 truncate">
                {user?.referralCode}
              </code>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-white hover:bg-white/10 hover:text-orange-500"
                onClick={copyReferralLink}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button
              onClick={copyReferralLink}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold"
            >
              Copy Invite Link
            </Button>
          </CardContent>
        </Card>
      </div>
      {/* Daily Habits Grid */}
      <div>
        <h2 className="text-xl font-bold text-navy-900 dark:text-white mb-4">Daily Habits</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {habitItems.map((habit) => {
            const isDone = habits[habit.id as keyof typeof habits];
            const Icon = habit.icon;
            return (
              <motion.button
                key={habit.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleToggle(habit.id)}
                disabled={submitScore.isPending}
                className={`relative p-6 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between h-40 ${
                  isDone
                    ? 'bg-navy-900 dark:bg-orange-600 border-navy-900 dark:border-orange-600 text-white shadow-lg'
                    : 'bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 hover:border-orange-200 dark:hover:border-orange-500/50 hover:shadow-md'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDone ? 'bg-white/20' : habit.bg}`}>
                  <Icon className={`h-5 w-5 ${isDone ? 'text-white' : habit.color}`} />
                </div>
                <div>
                  <div className={`font-semibold text-lg ${isDone ? 'text-white' : 'text-navy-900 dark:text-white'}`}>
                    {habit.label}
                  </div>
                  <div className={`text-sm mt-1 ${isDone ? 'text-slate-300 dark:text-orange-100' : 'text-slate-500 dark:text-slate-400'}`}>
                    {isDone ? 'Completed' : '+1 Point'}
                  </div>
                </div>
                {isDone && (
                  <div className="absolute top-4 right-4">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
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
    </div>
  );
}