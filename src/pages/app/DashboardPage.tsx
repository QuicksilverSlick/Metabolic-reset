import React from 'react';
import { motion } from 'framer-motion';
import { Droplets, Footprints, Moon, PlayCircle, Scale, ChevronRight, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useUser, useDailyScore, useSubmitScore } from '@/hooks/use-queries';
import { format } from 'date-fns';
export function DashboardPage() {
  const navigate = useNavigate();
  const { data: user, isLoading: userLoading } = useUser();
  // Date logic: Get today's date in YYYY-MM-DD
  const today = format(new Date(), 'yyyy-MM-dd');
  const { data: score, isLoading: scoreLoading } = useDailyScore(today);
  const submitScore = useSubmitScore();
  const habitItems = [
    { id: 'water', label: 'Water', icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'steps', label: 'Steps', icon: Footprints, color: 'text-orange-500', bg: 'bg-orange-50' },
    { id: 'sleep', label: 'Sleep (7h+)', icon: Moon, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { id: 'lesson', label: 'Daily Lesson', icon: PlayCircle, color: 'text-green-500', bg: 'bg-green-50' },
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
  return (
    <div className="space-y-8">
      {/* Welcome & Points Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-navy-900">
            Hello, {user?.name || 'Challenger'}
          </h1>
          <p className="text-slate-500">Let's crush your goals today.</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <div className="text-right">
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Points</div>
            <div className="text-2xl font-bold text-orange-500">{points}</div>
          </div>
          <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
            P
          </div>
        </div>
      </div>
      {/* The Study Widget (Biometrics) */}
      <Card className="border-orange-200 bg-gradient-to-br from-white to-orange-50/50 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-10 -mt-10"></div>
        <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-orange-100 flex items-center justify-center shrink-0">
              <Scale className="h-8 w-8 text-orange-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-navy-900">Weekly Biometrics</h3>
              <p className="text-slate-600 max-w-md">
                Log your weight and body composition to earn +25 points.
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/app/biometrics')}
            className="shrink-0 rounded-full px-8 py-6 text-lg bg-navy-900 hover:bg-navy-800"
          >
            Log Data
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </CardContent>
      </Card>
      {/* Daily Habits Grid */}
      <div>
        <h2 className="text-xl font-bold text-navy-900 mb-4">Daily Habits</h2>
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
                    ? 'bg-navy-900 border-navy-900 text-white shadow-lg'
                    : 'bg-white border-slate-200 hover:border-orange-200 hover:shadow-md'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDone ? 'bg-white/20' : habit.bg}`}>
                  <Icon className={`h-5 w-5 ${isDone ? 'text-white' : habit.color}`} />
                </div>
                <div>
                  <div className={`font-semibold text-lg ${isDone ? 'text-white' : 'text-navy-900'}`}>
                    {habit.label}
                  </div>
                  <div className={`text-sm mt-1 ${isDone ? 'text-slate-300' : 'text-slate-500'}`}>
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