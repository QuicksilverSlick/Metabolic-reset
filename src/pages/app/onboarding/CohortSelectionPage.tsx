import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Dna, Wrench, Check, Loader2, X, Video } from 'lucide-react';
import { useMyActiveEnrollment, useUpdateCohort } from '@/hooks/use-queries';
import { CohortType } from '@shared/types';
import { cn } from '@/lib/utils';

const COHORT_VIDEOS = {
  GROUP_A: 'https://descriptusercontent.com/published/a49e4961-d965-4086-8ff1-ded1a71c8986/original.mp4',
  GROUP_B: 'https://descriptusercontent.com/published/2d0a63df-80ad-449a-8b86-03bb1843b8f8/original.mp4',
};

export default function CohortSelectionPage() {
  const navigate = useNavigate();
  const { data: enrollment, isLoading: enrollmentLoading } = useMyActiveEnrollment();
  const updateCohort = useUpdateCohort();
  const [selectedCohort, setSelectedCohort] = useState<CohortType | null>(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [activeVideoTitle, setActiveVideoTitle] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);

  const openVideoModal = (cohort: CohortType) => {
    setActiveVideoUrl(COHORT_VIDEOS[cohort]);
    setActiveVideoTitle(cohort === 'GROUP_A' ? 'The Metabolic Protocol' : 'The Control Group');
    setVideoModalOpen(true);
  };

  const closeVideoModal = () => {
    setVideoModalOpen(false);
    setActiveVideoUrl(null);
  };

  const handleVideoEnded = () => {
    closeVideoModal();
  };

  const handleSelectCohort = async (cohortId: CohortType) => {
    if (!enrollment?.projectId) return;

    setSelectedCohort(cohortId);
    try {
      await updateCohort.mutateAsync({ projectId: enrollment.projectId, cohortId });
      // Navigate to profile completion step
      navigate('/app/onboarding/profile');
    } catch (error) {
      setSelectedCohort(null);
    }
  };

  if (enrollmentLoading) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
        <Card className="bg-navy-800/50 border-navy-700 max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-slate-300">No active enrollment found. Please register first.</p>
            <Button className="mt-4 bg-gold-500 hover:bg-gold-600 text-navy-900" onClick={() => navigate('/register')}>
              Register
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-900 flex flex-col">
      {/* Background gradient effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-500/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
      </div>

      {/* Header */}
      <div className="relative text-center pt-12 pb-8 px-4">
        <div className="inline-block px-4 py-1.5 bg-gold-500/20 text-gold-400 rounded-full text-sm font-medium mb-4 border border-gold-500/30">
          Payment Confirmed
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Choose Your Path
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto">
          Select how you want to participate in the Metabolic Reset Project.
          Will you follow our proven protocol, or test your own approach?
        </p>
      </div>

      {/* Cohort Selection Cards */}
      <div className="relative flex-1 flex items-start justify-center px-4 pb-12">
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl w-full">
          {/* Group A - Protocol (Gold accent) */}
          <Card
            className={cn(
              "bg-navy-800/80 backdrop-blur-sm border-2 transition-all cursor-pointer hover:bg-navy-800",
              selectedCohort === 'GROUP_A'
                ? "border-gold-500 shadow-lg shadow-gold-500/20"
                : "border-navy-700 hover:border-gold-500/50"
            )}
            onClick={() => !updateCohort.isPending && handleSelectCohort('GROUP_A')}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-full bg-gold-500/20 border border-gold-500/30">
                  <Dna className="h-6 w-6 text-gold-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">GROUP A: THE PROTOCOL</h2>
                  <p className="text-gold-400 text-sm">"The Metabolic Group"</p>
                </div>
              </div>

              <p className="text-slate-300 mb-6">
                You are testing the clinical efficacy of a structured nutrition system.
                You agree to follow the chemistry, not your cravings.
              </p>

              <div className="space-y-3 mb-6">
                <h3 className="text-sm font-semibold text-gold-400/80 uppercase tracking-wider">
                  The Requirements:
                </h3>
                <div className="space-y-2">
                  <Requirement text="Nutrition: You agree to utilize the specific Clinical Nutrition Kit (Fuelings + EAAs)." variant="gold" />
                  <Requirement text="Schedule: You agree to the 6x Daily Dosing schedule (Every 2-3 hours)." variant="gold" />
                  <Requirement text="Data: You must log Smart Scale metrics Weekly." variant="gold" />
                  <Requirement text="Result Goal: Metabolic Repair & Optimization." variant="gold" />
                </div>
              </div>

              <Button
                className="w-full bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold py-6 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                disabled={updateCohort.isPending}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectCohort('GROUP_A');
                }}
              >
                {updateCohort.isPending && selectedCohort === 'GROUP_A' ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : null}
                I COMMIT TO THE PROTOCOL
              </Button>
              <button
                className="w-full mt-4 flex items-center justify-center gap-2 text-gold-400 hover:text-gold-300 transition-colors group"
                onClick={(e) => {
                  e.stopPropagation();
                  openVideoModal('GROUP_A');
                }}
              >
                <Video className="h-5 w-5" />
                <span className="underline underline-offset-2 group-hover:no-underline">
                  Watch: Learn more about the Metabolic Protocol
                </span>
              </button>
            </CardContent>
          </Card>

          {/* Group B - DIY (Slate/neutral accent for contrast) */}
          <Card
            className={cn(
              "bg-navy-800/80 backdrop-blur-sm border-2 transition-all cursor-pointer hover:bg-navy-800",
              selectedCohort === 'GROUP_B'
                ? "border-slate-400 shadow-lg shadow-slate-500/20"
                : "border-navy-700 hover:border-slate-500/50"
            )}
            onClick={() => !updateCohort.isPending && handleSelectCohort('GROUP_B')}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-full bg-slate-500/20 border border-slate-500/30">
                  <Wrench className="h-6 w-6 text-slate-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">GROUP B: SELF-DIRECTED</h2>
                  <p className="text-slate-400 text-sm">"The Control Group"</p>
                </div>
              </div>

              <p className="text-slate-300 mb-6">
                You are the variable. You are testing your own methods (Keto, Paleo, Macros,
                Intermittent Fasting, or Intuitive Eating) against the clinical group.
              </p>

              <div className="space-y-3 mb-6">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                  The Requirements:
                </h3>
                <div className="space-y-2">
                  <Requirement text="Nutrition: You will source your own food (Grocery Store / Meal Prep)." variant="slate" />
                  <Requirement text="Schedule: You determine your own feeding schedule." variant="slate" />
                  <Requirement text="Data: You MUST log Smart Scale metrics Weekly (Mandatory for comparison)." variant="slate" />
                  <Requirement text="Result Goal: To prove your method works against the science." variant="slate" />
                </div>
              </div>

              <Button
                className="w-full bg-slate-600 hover:bg-slate-500 text-white font-semibold py-6"
                disabled={updateCohort.isPending}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectCohort('GROUP_B');
                }}
              >
                {updateCohort.isPending && selectedCohort === 'GROUP_B' ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : null}
                I WILL DIRECT MYSELF
              </Button>
              <button
                className="w-full mt-4 flex items-center justify-center gap-2 text-slate-400 hover:text-slate-300 transition-colors group"
                onClick={(e) => {
                  e.stopPropagation();
                  openVideoModal('GROUP_B');
                }}
              >
                <Video className="h-5 w-5" />
                <span className="underline underline-offset-2 group-hover:no-underline">
                  Watch: Learn more about the Control Group
                </span>
              </button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Video Modal */}
      <Dialog open={videoModalOpen} onOpenChange={setVideoModalOpen}>
        <DialogContent className="bg-navy-900 border-navy-700 max-w-3xl p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-white text-xl">{activeVideoTitle}</DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-white hover:bg-navy-800"
                onClick={closeVideoModal}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </DialogHeader>
          <div className="p-4 pt-2">
            {activeVideoUrl && (
              <video
                ref={videoRef}
                src={activeVideoUrl}
                controls
                autoPlay
                onEnded={handleVideoEnded}
                className="w-full rounded-lg aspect-video bg-black"
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Requirement({ text, variant }: { text: string; variant: 'gold' | 'slate' }) {
  return (
    <div className="flex items-start gap-2">
      <Check className={cn(
        "h-4 w-4 mt-0.5 shrink-0",
        variant === 'gold' ? "text-gold-400" : "text-slate-400"
      )} />
      <span className="text-sm text-slate-300">{text}</span>
    </div>
  );
}
