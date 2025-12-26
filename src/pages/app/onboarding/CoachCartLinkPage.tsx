import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Loader2,
  Link as LinkIcon,
  Check,
  ArrowRight,
  ShoppingCart,
  Users,
  AlertCircle,
  Info,
  Play,
} from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { userApi } from '@/lib/api';
import { useMyActiveEnrollment, useUpdateOnboarding, useUpdateCohort } from '@/hooks/use-queries';

export default function CoachCartLinkPage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const { data: enrollment, isLoading: enrollmentLoading } = useMyActiveEnrollment();
  const updateOnboarding = useUpdateOnboarding();
  const updateCohort = useUpdateCohort();

  const [cartLink, setCartLink] = useState(user?.cartLink || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) return true; // Empty is allowed (skip)
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSaveAndContinue = async () => {
    // Prevent double-click
    if (isSaving) return;

    if (cartLink && !validateUrl(cartLink)) {
      setError('Please enter a valid URL (e.g., https://example.com/your-cart)');
      return;
    }

    // Wait for enrollment data
    if (enrollmentLoading || !enrollment?.projectId) {
      setError('Please wait while we load your data...');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Save cart link to user profile
      if (cartLink.trim()) {
        const updatedUser = await userApi.updateProfile(user!.id, { cartLink: cartLink.trim() });
        updateUser(updatedUser);
      }

      // Auto-set cohort to GROUP_A for coaches (they're always Optavia coaches)
      if (!enrollment.cohortId) {
        await updateCohort.mutateAsync({
          projectId: enrollment.projectId,
          cohortId: 'GROUP_A'
        });
      }

      // Mark onboarding as complete (coaches already have kits)
      await updateOnboarding.mutateAsync({
        projectId: enrollment.projectId,
        updates: {
          hasKit: true, // Coaches always have kits
          onboardingComplete: true
        }
      });

      // Navigate to all-audience orientation video (no confetti - video page will do it)
      navigate('/app/onboarding/final-video');
    } catch (err) {
      console.error('Failed to save cart link:', err);
      setError('Failed to save. Please try again.');
      setIsSaving(false);
    }
  };

  const handleSkip = async () => {
    // Prevent double-click
    if (isSaving) return;

    // Wait for enrollment data
    if (enrollmentLoading || !enrollment?.projectId) {
      setError('Please wait while we load your data...');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Auto-set cohort to GROUP_A for coaches (they're always Optavia coaches)
      if (!enrollment.cohortId) {
        await updateCohort.mutateAsync({
          projectId: enrollment.projectId,
          cohortId: 'GROUP_A'
        });
      }

      // Mark onboarding as complete without saving cart link
      await updateOnboarding.mutateAsync({
        projectId: enrollment.projectId,
        updates: {
          hasKit: true,
          onboardingComplete: true
        }
      });

      // Navigate to all-audience orientation video
      navigate('/app/onboarding/final-video');
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
      setError('Failed to complete setup. Please try again.');
      setIsSaving(false);
    }
  };

  if (enrollmentLoading) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center p-4">
        <Card className="bg-slate-800/50 border-slate-700 max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-slate-300">Please log in to continue.</p>
            <Button className="mt-4" onClick={() => navigate('/login')}>
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1628] flex flex-col">
      {/* Progress Header */}
      <div className="py-6 px-4 border-b border-slate-800">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="h-4 w-4 text-white" />
              </div>
              <span className="mt-1 text-xs text-slate-400">Payment</span>
            </div>
            <div className="w-8 sm:w-12 h-0.5 bg-green-500 mb-4"></div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="h-4 w-4 text-white" />
              </div>
              <span className="mt-1 text-xs text-slate-400">Photo</span>
            </div>
            <div className="w-8 sm:w-12 h-0.5 bg-green-500 mb-4"></div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="h-4 w-4 text-white" />
              </div>
              <span className="mt-1 text-xs text-slate-400">Verify</span>
            </div>
            <div className="w-8 sm:w-12 h-0.5 bg-gold-500 mb-4"></div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-gold-500 flex items-center justify-center">
                <LinkIcon className="h-4 w-4 text-navy-900" />
              </div>
              <span className="mt-1 text-xs text-white font-medium">Cart Link</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="max-w-lg w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold-500/20 mb-4">
              <ShoppingCart className="h-8 w-8 text-gold-500" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Set Up Your Cart Link
            </h1>
            <p className="text-slate-400">
              When your referrals need to order their Nutrition Kit, they'll use your personalized cart link.
            </p>
          </div>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6 space-y-6">
              {/* Instructional Video */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-300">
                  <Play className="h-4 w-4 text-gold-500" />
                  <span className="text-sm font-medium">Watch: How to create your shareable cart link</span>
                </div>
                <div className="relative w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-700" style={{ paddingBottom: '62.5%' }}>
                  <iframe
                    src="https://www.loom.com/embed/01a9bb974522445e8d1e3830233039ba?t=0"
                    frameBorder="0"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
              </div>

              {/* Quick Reference Infographic */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-300">
                  <Info className="h-4 w-4 text-gold-500" />
                  <span className="text-sm font-medium">Quick Reference Guide</span>
                </div>
                <div className="rounded-xl overflow-hidden border border-slate-700">
                  <img
                    src="/optavia-cart-guide.jpeg"
                    alt="How to Create a Shareable Cart in Your Optavia Account"
                    className="w-full h-auto"
                  />
                </div>
              </div>

              {/* Info Box */}
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-blue-300 text-sm font-medium mb-1">
                      Why add your cart link?
                    </p>
                    <p className="text-blue-200/70 text-sm">
                      When participants you refer need to order their Clinical Nutrition Kit,
                      they'll be directed to your cart instead of a generic link. This ensures
                      you get credit for the sale.
                    </p>
                  </div>
                </div>
              </div>

              {/* Cart Link Input */}
              <div className="space-y-2">
                <Label htmlFor="cartLink" className="text-slate-200 flex items-center gap-2">
                  <LinkIcon className="h-4 w-4 text-slate-400" />
                  Your Cart Link
                </Label>
                <Input
                  id="cartLink"
                  type="url"
                  placeholder="https://www.optavia.com/your-cart-link"
                  value={cartLink}
                  onChange={(e) => {
                    setCartLink(e.target.value);
                    setError(null);
                  }}
                  className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
                />
                <p className="text-slate-500 text-xs">
                  Paste your personalized Optavia cart link here
                </p>
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg">
                  <p className="text-red-400 text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </p>
                </div>
              )}

              {/* What happens next */}
              <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Users className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">What happens next?</p>
                    <p className="text-slate-400 text-xs">
                      Your referrals who need a kit will see your cart link or phone number to order from you
                    </p>
                  </div>
                </div>
              </div>

              {/* Continue Button */}
              <Button
                onClick={handleSaveAndContinue}
                disabled={isSaving}
                className="w-full bg-gold-500 hover:bg-gold-600 text-navy-900 py-6 text-lg font-bold rounded-xl"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                    Saving...
                  </>
                ) : (
                  <>
                    {cartLink.trim() ? 'Save & Enter Dashboard' : 'Enter Dashboard'}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>

              {/* Skip Option */}
              {!cartLink.trim() && (
                <div className="text-center">
                  <button
                    onClick={handleSkip}
                    disabled={isSaving}
                    className="text-slate-500 text-sm hover:text-slate-400 transition-colors"
                  >
                    Skip for now (you can add this later in your profile)
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
