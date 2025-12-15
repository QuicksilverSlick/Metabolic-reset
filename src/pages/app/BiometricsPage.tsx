import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import confetti from 'canvas-confetti';
import { Upload, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { useSubmitBiometrics, useUser, useWeeklyBiometrics } from '@/hooks/use-queries';
import { compressImage } from '@/lib/image-utils';
import { getChallengeProgress } from '@/lib/utils';
const biometricsSchema = z.object({
  weight: z.string().min(1, "Weight is required"),
  bodyFat: z.string().min(1, "Body Fat % is required"),
  visceralFat: z.string().min(1, "Visceral Fat is required"),
  leanMass: z.string().min(1, "Lean Mass is required"),
  metabolicAge: z.string().min(1, "Metabolic Age is required"),
});
type BiometricsForm = z.infer<typeof biometricsSchema>;
export function BiometricsPage() {
  const navigate = useNavigate();
  const { data: user, isLoading: userLoading } = useUser();
  const submitMutation = useSubmitBiometrics();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [pointsAwarded, setPointsAwarded] = useState(true); // Track if this was a new submission
  const { register, handleSubmit, formState: { errors } } = useForm<BiometricsForm>({
    resolver: zodResolver(biometricsSchema)
  });
  // Calculate current week
  const progress = user?.createdAt ? getChallengeProgress(user.createdAt) : { week: 1 };
  const currentWeek = progress.week;

  // Check if user already submitted for this week
  const { data: existingBiometrics, isLoading: biometricsLoading } = useWeeklyBiometrics(currentWeek);
  const hasExistingSubmission = !!existingBiometrics;

  // Trigger confetti celebration on success (only if points were awarded)
  // NOTE: This hook must be before any conditional returns to follow Rules of Hooks
  useEffect(() => {
    if (isSuccess && pointsAwarded) {
      // Big celebration for biometrics submission (+25 points!)
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 80, zIndex: 9999 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        const particleCount = 60 * (timeLeft / duration);

        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#F59E0B', '#FBBF24', '#FCD34D', '#10B981', '#34D399']
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#F59E0B', '#FBBF24', '#FCD34D', '#10B981', '#34D399']
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isSuccess, pointsAwarded]);

  const onSubmit = async (data: BiometricsForm) => {
    if (!file) {
      alert("Please upload a screenshot of your scale app.");
      return;
    }
    setIsProcessing(true);
    try {
      // Compress image using native utility
      // Reduced to 800px and 0.5 quality to ensure it fits in DO storage (128KB limit)
      const base64data = await compressImage(file, 800, 0.5);
      // Submit
      submitMutation.mutate({
        weekNumber: currentWeek,
        weight: parseFloat(data.weight),
        bodyFat: parseFloat(data.bodyFat),
        visceralFat: parseFloat(data.visceralFat),
        leanMass: parseFloat(data.leanMass),
        metabolicAge: parseFloat(data.metabolicAge),
        screenshotUrl: base64data
      }, {
        onSuccess: (result) => {
          setPointsAwarded(result.isNewSubmission);
          setIsSuccess(true);
          setIsProcessing(false);
        },
        onError: () => {
          setIsProcessing(false);
        }
      });
    } catch (error) {
      console.error('Compression or submission failed', error);
      setIsProcessing(false);
      alert('Failed to process image. Please try again.');
    }
  };
  if (userLoading || biometricsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-3xl font-bold text-navy-900 dark:text-white mb-4">
          {pointsAwarded ? 'Submission Received!' : 'Data Updated!'}
        </h2>
        <p className="text-slate-600 dark:text-slate-300 mb-4">
          {pointsAwarded
            ? `You have successfully logged your biometrics for Week ${currentWeek}. Come back next week to track your progress.`
            : `Your Week ${currentWeek} biometrics have been updated. You've already earned points for this week.`}
        </p>
        {pointsAwarded && (
          <p className="text-2xl font-bold text-gold-500 mb-8">+25 Points Earned!</p>
        )}
        <Button onClick={() => navigate('/app')} className="bg-navy-900 hover:bg-navy-800 dark:bg-gold-500 dark:hover:bg-gold-600 text-white">
          Return to Dashboard
        </Button>
      </div>
    );
  }
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-display font-bold text-navy-900 dark:text-white">Week {currentWeek} Weigh-In</h1>
          {hasExistingSubmission ? (
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-bold">
              Already Submitted
            </span>
          ) : (
            <span className="px-3 py-1 bg-gold-100 dark:bg-gold-900/30 text-gold-700 dark:text-gold-400 rounded-full text-sm font-bold">
              +25 Points
            </span>
          )}
        </div>
        <p className="text-slate-500 dark:text-slate-400">
          {hasExistingSubmission
            ? 'You can update your data if needed, but points have already been awarded for this week.'
            : 'Step on your smart scale, take a screenshot of the app, and enter the 5 key numbers below.'}
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card className="border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm transition-colors">
          <CardHeader>
            <CardTitle className="text-navy-900 dark:text-white">Biometric Data</CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">Enter values exactly as they appear on your scale.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="weight" className="text-navy-900 dark:text-slate-200">Weight (lbs)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="0.0"
                {...register('weight')}
                className="bg-white dark:bg-navy-950 border-slate-200 dark:border-navy-800 text-navy-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
              {errors.weight && <p className="text-red-500 text-xs">{errors.weight.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="bodyFat" className="text-navy-900 dark:text-slate-200">Body Fat (%)</Label>
              <Input
                id="bodyFat"
                type="number"
                step="0.1"
                placeholder="0.0"
                {...register('bodyFat')}
                className="bg-white dark:bg-navy-950 border-slate-200 dark:border-navy-800 text-navy-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
              {errors.bodyFat && <p className="text-red-500 text-xs">{errors.bodyFat.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="visceralFat" className="text-navy-900 dark:text-slate-200">Visceral Fat</Label>
              <Input
                id="visceralFat"
                type="number"
                step="0.5"
                placeholder="0"
                {...register('visceralFat')}
                className="bg-white dark:bg-navy-950 border-slate-200 dark:border-navy-800 text-navy-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
              {errors.visceralFat && <p className="text-red-500 text-xs">{errors.visceralFat.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="leanMass" className="text-navy-900 dark:text-slate-200">Muscle Mass (lbs)</Label>
              <Input
                id="leanMass"
                type="number"
                step="0.1"
                placeholder="0.0"
                {...register('leanMass')}
                className="bg-white dark:bg-navy-950 border-slate-200 dark:border-navy-800 text-navy-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
              {errors.leanMass && <p className="text-red-500 text-xs">{errors.leanMass.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="metabolicAge" className="text-navy-900 dark:text-slate-200">Metabolic Age</Label>
              <Input
                id="metabolicAge"
                type="number"
                placeholder="0"
                {...register('metabolicAge')}
                className="bg-white dark:bg-navy-950 border-slate-200 dark:border-navy-800 text-navy-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
              {errors.metabolicAge && <p className="text-red-500 text-xs">{errors.metabolicAge.message}</p>}
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm transition-colors">
          <CardHeader>
            <CardTitle className="text-navy-900 dark:text-white">Proof of Weigh-In</CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">Upload a screenshot from your smart scale app.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-slate-300 dark:border-navy-700 rounded-xl p-8 text-center hover:bg-slate-50 dark:hover:bg-navy-800 transition-colors cursor-pointer relative group">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-gold-50 dark:bg-navy-800 rounded-full flex items-center justify-center group-hover:bg-gold-100 dark:group-hover:bg-navy-700 transition-colors">
                  <Upload className="h-6 w-6 text-gold-500" />
                </div>
                <div>
                  <p className="font-medium text-navy-900 dark:text-white">
                    {file ? file.name : "Click to upload screenshot"}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {file ? "File selected" : "JPG or PNG up to 5MB"}
                  </p>
                </div>
              </div>
            </div>
            {!file && (
              <Alert variant="destructive" className="mt-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900 text-red-800 dark:text-red-300">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Required</AlertTitle>
                <AlertDescription>
                  You must upload a screenshot to verify your data.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isProcessing}
            className="bg-gold-500 hover:bg-gold-600 text-navy-900 px-8 py-6 text-lg rounded-full shadow-lg font-bold"
          >
            {isProcessing
              ? <><Loader2 className="animate-spin mr-2" /> Uploading...</>
              : hasExistingSubmission
                ? 'Update Data'
                : 'Submit Data (+25 Pts)'}
          </Button>
        </div>
      </form>
    </div>
  );
}