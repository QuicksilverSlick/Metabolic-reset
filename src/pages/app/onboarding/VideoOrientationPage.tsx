import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Play, CheckCircle, ArrowRight } from 'lucide-react';
import { useMyActiveEnrollment, useSystemSettings } from '@/hooks/use-queries';
import { useAuthStore } from '@/lib/auth-store';

export default function VideoOrientationPage() {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const { data: enrollment, isLoading: enrollmentLoading } = useMyActiveEnrollment();
  const { data: settings, isLoading: settingsLoading } = useSystemSettings();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [videoStarted, setVideoStarted] = useState(false);
  const [videoComplete, setVideoComplete] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(true);

  // Determine if user has a cohort-specific video to watch
  const hasEnrollmentWithCohort = enrollment && enrollment.cohortId;

  // Get the correct video URL based on cohort
  // GROUP_C (Switchers) use the GROUP_A video since they're now following Protocol A
  const videoUrl = hasEnrollmentWithCohort
    ? ((enrollment.cohortId === 'GROUP_A' || enrollment.cohortId === 'GROUP_C') ? settings?.groupAVideoUrl : settings?.groupBVideoUrl)
    : settings?.groupBVideoUrl; // Default to Group B video if no cohort

  // Handle video end
  const handleVideoEnd = () => {
    setVideoComplete(true);
  };

  // Start video playback
  const handlePlayVideo = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setVideoStarted(true);
      setShowPlayButton(false);
    }
  };

  // Handle continue after video
  const handleContinue = () => {
    // If user has an enrollment with Group A or Group C (Switchers) cohort, go to kit confirmation
    if (enrollment?.cohortId === 'GROUP_A' || enrollment?.cohortId === 'GROUP_C') {
      navigate('/app/onboarding/kit');
    } else if (enrollment?.cohortId === 'GROUP_B') {
      // Group B goes to kit page which auto-completes
      navigate('/app/onboarding/kit');
    } else {
      // No enrollment/cohort - go straight to dashboard
      navigate('/app');
    }
  };

  // Handle skip for users without video or without enrollment
  const handleSkipToDashboard = () => {
    navigate('/app');
  };

  if (enrollmentLoading || settingsLoading) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  // If no video URL is available, show a welcome message and let user proceed
  if (!videoUrl) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex flex-col items-center justify-center p-4">
        <Card className="bg-slate-800/50 border-slate-700 max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Welcome, {user?.name?.split(' ')[0] || 'Participant'}!
            </h1>
            <p className="text-slate-400 mb-6">
              You're all set up and ready to start your metabolic reset journey.
            </p>
            <Button
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-6"
              onClick={handleSkipToDashboard}
            >
              Enter Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1628] flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          {hasEnrollmentWithCohort ? 'Orientation In Progress...' : 'Welcome to the Reset Project'}
        </h1>
        <p className="text-slate-400">
          {hasEnrollmentWithCohort
            ? 'Please watch your Cohort Briefing to unlock the App.'
            : 'Watch a quick intro to get started.'
          }
        </p>
      </div>

      {/* Video Player Container */}
      <Card className="bg-slate-900/80 border-slate-700 max-w-4xl w-full overflow-hidden">
        <div className="relative aspect-video bg-black">
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-contain"
            onEnded={handleVideoEnd}
            onPlay={() => setShowPlayButton(false)}
            onPause={() => !videoComplete && setShowPlayButton(true)}
            playsInline
          />

          {/* Play Button Overlay */}
          {showPlayButton && !videoComplete && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer"
              onClick={handlePlayVideo}
            >
              <div className="p-6 rounded-full bg-amber-500/90 hover:bg-amber-500 transition-colors">
                <Play className="h-12 w-12 text-white fill-white" />
              </div>
            </div>
          )}

          {/* Video Complete Overlay */}
          {videoComplete && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
                <p className="text-white text-xl font-semibold">Video Complete!</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Continue Button */}
      <div className="mt-8 w-full max-w-md">
        <Button
          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!videoComplete}
          onClick={handleContinue}
        >
          {videoComplete ? 'ENTER THE PROJECT' : 'Watch video to continue...'}
        </Button>

        {!videoComplete && videoStarted && (
          <p className="text-center text-slate-500 text-sm mt-3">
            Please watch the full video to unlock the dashboard
          </p>
        )}

        {/* Skip option for users without enrollment - they can skip video */}
        {!hasEnrollmentWithCohort && !videoComplete && (
          <button
            onClick={handleSkipToDashboard}
            className="w-full mt-4 text-slate-500 text-sm hover:text-slate-400 transition-colors"
          >
            Skip for now
          </button>
        )}
      </div>

      {/* Cohort indicator - only show if user has a cohort */}
      {hasEnrollmentWithCohort && (
        <div className="mt-6 text-center">
          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
            enrollment.cohortId === 'GROUP_A' || enrollment.cohortId === 'GROUP_C'
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'bg-blue-500/20 text-blue-400'
          }`}>
            {enrollment.cohortId === 'GROUP_A' ? 'Protocol A' : enrollment.cohortId === 'GROUP_C' ? 'Protocol C (Switcher)' : 'Protocol B'}
          </span>
        </div>
      )}
    </div>
  );
}
