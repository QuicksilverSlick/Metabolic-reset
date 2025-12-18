import { useState } from 'react';
import { X, Package, ShoppingCart, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMyActiveEnrollment, useUpdateOnboarding, useSystemSettings } from '@/hooks/use-queries';

export function KitReminderBanner() {
  const { data: enrollment } = useMyActiveEnrollment();
  const { data: settings } = useSystemSettings();
  const updateOnboarding = useUpdateOnboarding();
  const [dismissed, setDismissed] = useState(false);

  // Only show for Group A users who don't have kit
  if (!enrollment || enrollment.cohortId !== 'GROUP_A' || enrollment.hasKit || dismissed) {
    return null;
  }

  const handleHaveKit = async () => {
    if (!enrollment.projectId) return;
    await updateOnboarding.mutateAsync({
      projectId: enrollment.projectId,
      updates: { hasKit: true }
    });
  };

  const handleOrderKit = () => {
    if (settings?.kitOrderUrl) {
      window.open(settings.kitOrderUrl, '_blank');
    }
  };

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
            <Button
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white"
              onClick={handleOrderKit}
            >
              <ShoppingCart className="h-4 w-4 mr-1.5" />
              Order Kit
            </Button>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-slate-400 hover:text-white transition-colors shrink-0"
          aria-label="Dismiss"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
