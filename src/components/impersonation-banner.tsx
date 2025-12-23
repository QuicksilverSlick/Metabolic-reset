import { useEffect, useState } from 'react';
import { Eye, X, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/auth-store';
import { impersonationApi } from '@/lib/api';
import { toast } from 'sonner';

// Format remaining time as "Xm Ys"
function formatRemainingTime(ms: number): string {
  if (ms <= 0) return '0m 0s';
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

export function ImpersonationBanner() {
  const { impersonation, endImpersonation, user } = useAuthStore();
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  // Auto-expire timer effect
  useEffect(() => {
    if (!impersonation.isImpersonating) {
      setRemainingTime(null);
      setShowWarning(false);
      return;
    }

    // Handle legacy sessions that don't have expiresAt (started before this feature)
    // We'll calculate expiresAt from startedAt if available, otherwise use a default 60 min from now
    let effectiveExpiresAt = impersonation.expiresAt;
    if (!effectiveExpiresAt && impersonation.startedAt) {
      effectiveExpiresAt = impersonation.startedAt + 60 * 60 * 1000;
    } else if (!effectiveExpiresAt) {
      // Fallback: if no timing info at all, set expiry to 60 min from now
      effectiveExpiresAt = Date.now() + 60 * 60 * 1000;
    }

    // Calculate initial remaining time
    const calcRemaining = () => effectiveExpiresAt! - Date.now();

    // Update every second
    const interval = setInterval(() => {
      const remaining = calcRemaining();
      setRemainingTime(remaining);

      // Show warning when 5 minutes or less remain
      if (remaining <= 5 * 60 * 1000 && remaining > 0) {
        setShowWarning(true);
      }

      // Auto-expire when time runs out
      if (remaining <= 0) {
        clearInterval(interval);
        toast.warning('Impersonation session expired (60 min limit)', {
          description: 'Returning to your admin view.',
          duration: 5000,
        });
        endImpersonation();
      }
    }, 1000);

    // Initial calculation
    const initialRemaining = calcRemaining();
    setRemainingTime(initialRemaining);
    if (initialRemaining <= 5 * 60 * 1000 && initialRemaining > 0) {
      setShowWarning(true);
    }

    return () => clearInterval(interval);
  }, [impersonation.isImpersonating, impersonation.expiresAt, endImpersonation]);

  if (!impersonation.isImpersonating || !impersonation.impersonatedUser) {
    return null;
  }

  const handleEndImpersonation = async () => {
    if (!user?.id || !impersonation.impersonationSessionId) return;

    try {
      await impersonationApi.endSession(user.id, impersonation.impersonationSessionId);
      endImpersonation();
      toast.success('Impersonation session ended');
    } catch (error) {
      console.error('Failed to end impersonation:', error);
      // End locally anyway
      endImpersonation();
    }
  };

  // Dynamic background color based on warning state
  const bannerBgClass = showWarning
    ? 'bg-orange-500 text-orange-950'
    : 'bg-amber-500 text-amber-950';

  const buttonBgClass = showWarning
    ? 'bg-orange-600 hover:bg-orange-700 border-orange-700'
    : 'bg-amber-600 hover:bg-amber-700 border-amber-700';

  return (
    <div className={`fixed top-0 left-0 right-0 z-[100] ${bannerBgClass} px-4 py-2 flex items-center justify-between shadow-lg`}>
      <div className="flex items-center gap-2">
        <Eye className="h-4 w-4" />
        <span className="font-medium">
          Viewing as: <span className="font-bold">{impersonation.impersonatedUser.name}</span>
        </span>
        <span className={`text-sm ${showWarning ? 'text-orange-800' : 'text-amber-800'}`}>
          (View-only mode)
        </span>
      </div>
      <div className="flex items-center gap-3">
        {/* Timer display */}
        {remainingTime !== null && (
          <div className={`flex items-center gap-1 text-sm font-medium ${showWarning ? 'text-orange-900 animate-pulse' : 'text-amber-800'}`}>
            {showWarning ? <AlertTriangle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
            <span>{formatRemainingTime(remainingTime)}</span>
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={handleEndImpersonation}
          className={`${buttonBgClass} text-white`}
        >
          <X className="h-4 w-4 mr-1" />
          Exit View
        </Button>
      </div>
    </div>
  );
}
