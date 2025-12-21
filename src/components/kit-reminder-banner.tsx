import { Package, ShoppingCart, Check, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMyActiveEnrollment, useUpdateOnboarding, useSystemSettings, useCoachInfo } from '@/hooks/use-queries';
import { formatPhoneDisplay } from '@/lib/phone-utils';

const FALLBACK_PHONE = '5039741671';

export function KitReminderBanner() {
  const { data: enrollment } = useMyActiveEnrollment();
  const { data: settings } = useSystemSettings();
  const updateOnboarding = useUpdateOnboarding();

  // Get coach info if user has a group leader assigned
  const { data: coachInfo } = useCoachInfo(enrollment?.groupLeaderId || null);

  // Only show for Group A users who don't have kit
  if (!enrollment || enrollment.cohortId !== 'GROUP_A' || enrollment.hasKit) {
    return null;
  }

  const handleHaveKit = async () => {
    if (!enrollment.projectId) return;
    await updateOnboarding.mutateAsync({
      projectId: enrollment.projectId,
      updates: { hasKit: true }
    });
  };

  // Determine what to show for ordering:
  // 1. Coach's cart link if available
  // 2. Coach's phone number if no cart link
  // 3. Fallback to global kit URL or fallback phone
  const hasCoachCartLink = coachInfo?.cartLink && coachInfo.cartLink.trim();
  const coachPhone = coachInfo?.phone;
  const fallbackPhone = settings?.fallbackPhone || FALLBACK_PHONE;

  const handleOrderKit = () => {
    if (hasCoachCartLink) {
      // Open coach's cart link
      window.open(coachInfo.cartLink, '_blank');
    } else if (settings?.kitOrderUrl) {
      // Fallback to global kit URL
      window.open(settings.kitOrderUrl, '_blank');
    }
  };

  const handleCallCoach = () => {
    const phoneToCall = coachPhone || fallbackPhone;
    // Format for tel: link - just digits
    const digits = phoneToCall.replace(/\D/g, '');
    window.open(`tel:+1${digits}`, '_self');
  };

  // Format phone for display
  const displayPhone = formatPhoneDisplay(coachPhone || fallbackPhone);

  return (
    <div className="bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/30 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-full bg-amber-500/20 shrink-0">
          <Package className="h-5 w-5 text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white mb-1">
            Don't Forget Your Nutrition Kit!
          </h3>
          <p className="text-sm text-slate-300 mb-3">
            As a Protocol participant, you'll need your Clinical Nutrition Kit (Fuelings + EAAs)
            to follow the structured nutrition system.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
              onClick={handleHaveKit}
              disabled={updateOnboarding.isPending}
            >
              <Check className="h-4 w-4 mr-1.5" />
              I Have It Now
            </Button>

            {/* Show cart link button if available */}
            {(hasCoachCartLink || settings?.kitOrderUrl) && (
              <Button
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 text-white"
                onClick={handleOrderKit}
              >
                <ShoppingCart className="h-4 w-4 mr-1.5" />
                Order Kit
              </Button>
            )}

            {/* Show call button if no cart link, or as secondary option */}
            {!hasCoachCartLink && (
              <Button
                size="sm"
                variant="outline"
                className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                onClick={handleCallCoach}
              >
                <Phone className="h-4 w-4 mr-1.5" />
                Call {coachInfo?.name ? coachInfo.name.split(' ')[0] : 'to Order'}: {displayPhone}
              </Button>
            )}
          </div>

          {/* Show coach name if ordering through them */}
          {coachInfo?.name && (hasCoachCartLink || coachPhone) && (
            <p className="text-xs text-slate-400 mt-2">
              Order through your coach: {coachInfo.name}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
