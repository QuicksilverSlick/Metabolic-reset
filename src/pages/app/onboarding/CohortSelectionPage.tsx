import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Dna, Wrench, Check, Loader2, Play, X, Video } from 'lucide-react';
import { useMyActiveEnrollment, useUpdateCohort } from '@/hooks/use-queries';
import { CohortType } from '@shared/types';
import { cn } from '@/lib/utils';

const COHORT_VIDEOS = {
  GROUP_A: 'https://descriptusercontent.com/published/1a79c071-aa7e-4193-9fc7-24a668c51d6b/original.mp4',
  GROUP_B: 'https://descriptusercontent.com/published/c4acd472-cfe1-48da-bd16-0d35e68d4baf/original.mp4',
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
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center p-4">
        <Card className="bg-slate-800/50 border-slate-700 max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-slate-300">No active enrollment found. Please register first.</p>
            <Button className="mt-4" onClick={() => navigate('/register')}>
              Register
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1628] flex flex-col">
      {/* Header */}
      <div className="text-center pt-12 pb-8 px-4">
        <div className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium mb-4">
          Payment Confirmed
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Choose Your Path
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto">
          Select how you want to participate in the Metabolic Reset Project.
          Will you follow our proven protocol, or test your own approach?
        </p>
      </div>

      {/* Cohort Selection Cards */}
      <div className="flex-1 flex items-start justify-center px-4 pb-12">
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl w-full">
          {/* Group A - Protocol */}
          <Card
            className={cn(
              "bg-slate-800/50 border-2 transition-all cursor-pointer hover:bg-slate-800/70",
              selectedCohort === 'GROUP_A'
                ? "border-emerald-500 shadow-lg shadow-emerald-500/20"
                : "border-slate-700 hover:border-emerald-500/50"
            )}
            onClick={() => !updateCohort.isPending && handleSelectCohort('GROUP_A')}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-full bg-emerald-500/20">
                  <Dna className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">GROUP A: THE PROTOCOL</h2>
                  <p className="text-emerald-400 text-sm">"The Metabolic Group"</p>
                </div>
              </div>

              <p className="text-slate-300 mb-6">
                You are testing the clinical efficacy of a structured nutrition system.
                You agree to follow the chemistry, not your cravings.
              </p>

              <div className="space-y-3 mb-6">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                  The Obligations:
                </h3>
                <div className="space-y-2">
                  <Obligation text="Nutrition: You agree to utilize the specific Clinical Nutrition Kit (Fuelings + EAAs)." />
                  <Obligation text="Schedule: You agree to the 6x Daily Dosing schedule (Every 2-3 hours)." />
                  <Obligation text="Data: You must log Smart Scale metrics Weekly." />
                  <Obligation text="Result Goal: Metabolic Repair & Optimization." />
                </div>
              </div>

              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-6"
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
                className="w-full mt-4 flex items-center justify-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors group"
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

          {/* Group B - DIY */}
          <Card
            className={cn(
              "bg-slate-800/50 border-2 transition-all cursor-pointer hover:bg-slate-800/70",
              selectedCohort === 'GROUP_B'
                ? "border-blue-500 shadow-lg shadow-blue-500/20"
                : "border-slate-700 hover:border-blue-500/50"
            )}
            onClick={() => !updateCohort.isPending && handleSelectCohort('GROUP_B')}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-full bg-blue-500/20">
                  <Wrench className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">GROUP B: SELF-DIRECTED</h2>
                  <p className="text-blue-400 text-sm">"The Control Group"</p>
                </div>
              </div>

              <p className="text-slate-300 mb-6">
                You are the variable. You are testing your own methods (Keto, Paleo, Macros,
                Intermittent Fasting, or Intuitive Eating) against the clinical group.
              </p>

              <div className="space-y-3 mb-6">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                  The Obligations:
                </h3>
                <div className="space-y-2">
                  <Obligation text="Nutrition: You will source your own food (Grocery Store / Meal Prep)." />
                  <Obligation text="Schedule: You determine your own feeding schedule." />
                  <Obligation text="Data: You MUST log Smart Scale metrics Weekly (Mandatory for comparison)." />
                  <Obligation text="Result Goal: To prove your method works against the science." />
                </div>
              </div>

              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6"
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
                className="w-full mt-4 flex items-center justify-center gap-2 text-blue-400 hover:text-blue-300 transition-colors group"
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
                className="text-slate-400 hover:text-white hover:bg-slate-800"
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

function Obligation({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2">
      <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
      <span className="text-sm text-slate-300">{text}</span>
    </div>
  );
}
