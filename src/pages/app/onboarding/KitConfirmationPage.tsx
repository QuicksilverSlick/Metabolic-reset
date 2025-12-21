import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Package, ShoppingCart, Check, ExternalLink } from 'lucide-react';
import { useMyActiveEnrollment, useUpdateOnboarding, useSystemSettings } from '@/hooks/use-queries';

export default function KitConfirmationPage() {
  const navigate = useNavigate();
  const { data: enrollment, isLoading: enrollmentLoading } = useMyActiveEnrollment();
  const { data: settings, isLoading: settingsLoading } = useSystemSettings();
  const updateOnboarding = useUpdateOnboarding();
  const [completing, setCompleting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // If Group B or no enrollment, complete onboarding immediately and redirect
  useEffect(() => {
    const handleGroupB = async () => {
      if (enrollment && enrollment.cohortId === 'GROUP_B') {
        setIsRedirecting(true);
        if (!enrollment.onboardingComplete) {
          // Complete onboarding then navigate
          if (!enrollment.projectId) {
            navigate('/app/onboarding/final-video');
            return;
          }
          try {
            await updateOnboarding.mutateAsync({
              projectId: enrollment.projectId,
              updates: {
                hasKit: false,
                onboardingComplete: true
              }
            });
          } catch (error) {
            console.error('Failed to complete onboarding:', error);
          }
        }
        // Navigate to all-audience orientation video
        navigate('/app/onboarding/final-video');
      } else if (!enrollmentLoading && !enrollment) {
        // No enrollment - redirect to final video
        navigate('/app/onboarding/final-video');
      }
    };
    handleGroupB();
  }, [enrollment, enrollmentLoading]);

  const completeOnboarding = async (hasKit: boolean) => {
    if (!enrollment?.projectId) return;

    setCompleting(true);
    try {
      await updateOnboarding.mutateAsync({
        projectId: enrollment.projectId,
        updates: {
          hasKit,
          onboardingComplete: true
        }
      });
      // Navigate to all-audience orientation video
      navigate('/app/onboarding/final-video');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    } finally {
      setCompleting(false);
    }
  };

  const handleHaveKit = () => {
    completeOnboarding(true);
  };

  const handleNeedToOrder = async () => {
    if (!enrollment?.projectId) return;

    // Track that they clicked order
    try {
      await updateOnboarding.mutateAsync({
        projectId: enrollment.projectId,
        updates: {
          kitOrderClicked: true,
          onboardingComplete: true
        }
      });
    } catch (error) {
      console.error('Failed to track kit order click:', error);
    }

    // Open kit order URL in new tab
    if (settings?.kitOrderUrl) {
      window.open(settings.kitOrderUrl, '_blank');
    }

    // Navigate to all-audience orientation video
    navigate('/app/onboarding/final-video');
  };

  // Loading state or Group B redirect
  if (enrollmentLoading || settingsLoading || isRedirecting || enrollment?.cohortId === 'GROUP_B') {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500 mx-auto mb-4" />
          <p className="text-slate-400">
            {isRedirecting || enrollment?.cohortId === 'GROUP_B'
              ? 'Redirecting to your dashboard...'
              : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  // Group A - Show kit confirmation
  return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center p-4">
      <Card className="bg-slate-800/50 border-slate-700 max-w-lg w-full">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 mb-4">
              <Package className="h-8 w-8 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              One Last Thing...
            </h1>
            <p className="text-slate-400">
              Do you have your Clinical Nutrition Kit?
            </p>
          </div>

          <div className="bg-slate-900/50 rounded-lg p-4 mb-8">
            <p className="text-slate-300 text-sm">
              As a <span className="text-emerald-400 font-semibold">Group A: Protocol</span> participant,
              you'll need the Clinical Nutrition Kit (Fuelings + EAAs) to follow the structured
              nutrition system.
            </p>
          </div>

          <div className="space-y-4">
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-6"
              onClick={handleHaveKit}
              disabled={completing}
            >
              {completing ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <Check className="h-5 w-5 mr-2" />
              )}
              Yes, I Have It
            </Button>

            <Button
              variant="outline"
              className="w-full border-amber-500/50 text-amber-400 hover:bg-amber-500/10 font-semibold py-6"
              onClick={handleNeedToOrder}
              disabled={completing}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              No, I Need to Order
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </div>

          <p className="text-center text-slate-500 text-xs mt-6">
            Don't worry - you can update this later from your profile.
            <br />
            We'll remind you if you still need to order.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
