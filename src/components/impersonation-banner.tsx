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
    console.log('[EndImpersonation] user:', user?.id, user?.name);
    console.log('[EndImpersonation] originalUser:', impersonation.originalUser?.id, impersonation.originalUser?.name);
    console.log('[EndImpersonation] sessionId:', impersonation.impersonationSessionId);

    // Use originalUser (the admin) for the API call, not the current user state
    const adminUserId = impersonation.originalUser?.id || user?.id;
    if (!adminUserId || !impersonation.impersonationSessionId) {
      console.log('[EndImpersonation] Missing required data, ending locally');
      endImpersonation();
      // Reload to reset all React Query cache and component state
      window.location.href = '/app/admin';
      return;
    }

    try {
      console.log('[EndImpersonation] Calling API with adminUserId:', adminUserId);
      await impersonationApi.endSession(adminUserId, impersonation.impersonationSessionId);
      endImpersonation();
      toast.success('Impersonation session ended');
      // Reload to reset all React Query cache and avoid stale impersonated data
      window.location.href = '/app/admin';
    } catch (error) {
      console.error('Failed to end impersonation:', error);
      // End locally anyway and reload
      endImpersonation();
      window.location.href = '/app/admin';
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
    <div
      className={`w-full ${bannerBgClass} shadow-lg`}
      style={{
        paddingTop: 'max(env(safe-area-inset-top, 0px), 0px)',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
      }}
    >
      <div className="px-4 py-2 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          <span className="font-medium text-sm sm:text-base">
            Viewing as: <span className="font-bold">{impersonation.impersonatedUser.name}</span>
          </span>
          <span className={`text-xs sm:text-sm hidden sm:inline ${showWarning ? 'text-orange-800' : 'text-amber-800'}`}>
            (View-only mode)
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Timer display */}
          {remainingTime !== null && (
            <div className={`flex items-center gap-1 text-xs sm:text-sm font-medium ${showWarning ? 'text-orange-900 animate-pulse' : 'text-amber-800'}`}>
              {showWarning ? <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" /> : <Clock className="h-3 w-3 sm:h-4 sm:w-4" />}
              <span>{formatRemainingTime(remainingTime)}</span>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleEndImpersonation}
            className={`${buttonBgClass} text-white text-xs sm:text-sm`}
          >
            <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <span className="hidden sm:inline">Exit View</span>
            <span className="sm:hidden">Exit</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
