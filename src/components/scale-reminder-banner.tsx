import { Scale, ShoppingCart, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSystemSettings, useUpdateProfile } from '@/hooks/use-queries';
import { useAuthStore } from '@/lib/auth-store';

export function ScaleReminderBanner() {
  const { user, updateUser } = useAuthStore();
  const { data: settings } = useSystemSettings();
  const updateProfile = useUpdateProfile();

  // Only show for users who don't have a smart scale
  if (!user || user.hasScale) {
    return null;
  }

  const handleHaveScale = async () => {
    // Update user's hasScale status via the profile update mutation
    const result = await updateProfile.mutateAsync({ hasScale: true });
    // Update local auth store
    updateUser({ ...user, hasScale: true });
  };

  const handleOrderScale = () => {
    if (settings?.scaleOrderUrl) {
      window.open(settings.scaleOrderUrl, '_blank');
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-full bg-blue-500/20 shrink-0">
          <Scale className="h-5 w-5 text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white mb-1">
            Track Your Progress with a Smart Scale!
          </h3>
          <p className="text-sm text-slate-300 mb-3">
            Get accurate body composition data to see your real results. A smart scale measures
            weight, body fat %, lean mass, and more.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
              onClick={handleHaveScale}
              disabled={updateProfile.isPending}
            >
              <Check className="h-4 w-4 mr-1.5" />
              I Have One Now
            </Button>

            {settings?.scaleOrderUrl && (
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleOrderScale}
              >
                <ShoppingCart className="h-4 w-4 mr-1.5" />
                Get a Smart Scale
                <ExternalLink className="h-3 w-3 ml-1.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
