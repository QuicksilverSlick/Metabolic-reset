import React, { useState, useEffect } from 'react';
import { X, Play, Info, AlertTriangle, CheckCircle, Volume2, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SystemAnnouncementBannerProps {
  enabled: boolean;
  title: string;
  message: string;
  videoUrl?: string;
  type?: 'info' | 'warning' | 'success';
  storageKey?: string; // Key for localStorage to track dismissal
  onDismiss?: () => void; // Callback when banner is dismissed
  isTopBanner?: boolean; // If true, adds safe-area-inset padding (for when this is the topmost banner)
}

export function SystemAnnouncementBanner({
  enabled,
  title,
  message,
  videoUrl,
  type = 'info',
  storageKey = 'announcement_dismissed',
  onDismiss,
  isTopBanner = true, // Default to true since it's often the topmost
}: SystemAnnouncementBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    const dismissed = localStorage.getItem(storageKey);
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, [storageKey]);

  // Don't render if not enabled or dismissed
  if (!enabled || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    localStorage.setItem(storageKey, 'true');
    setIsDismissed(true);
    onDismiss?.();
  };

  // Convert Google Drive view URL to direct download/embed URL
  const getVideoEmbedUrl = (url: string) => {
    // Extract file ID from Google Drive URL
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match) {
      // Use preview URL for embedding
      return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
    return url;
  };

  // Style variants based on type
  const variants = {
    info: {
      bg: 'bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500',
      icon: Info,
      iconColor: 'text-blue-100',
      videoBtnBg: 'bg-white/20 hover:bg-white/30 border-white/40',
    },
    warning: {
      bg: 'bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500',
      icon: AlertTriangle,
      iconColor: 'text-amber-100',
      videoBtnBg: 'bg-white/20 hover:bg-white/30 border-white/40',
    },
    success: {
      bg: 'bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500',
      icon: CheckCircle,
      iconColor: 'text-emerald-100',
      videoBtnBg: 'bg-white/20 hover:bg-white/30 border-white/40',
    },
  };

  const variant = variants[type];
  const Icon = variant.icon;

  return (
    <>
      {/* Banner - NOT fixed, flows in document */}
      <div className={`${variant.bg} text-white relative overflow-hidden w-full`}>
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,white_1px,transparent_1px)] bg-[size:20px_20px]" />
        </div>

        {/* Safe area padding for PWA/mobile notches - only when this is the topmost banner */}
        {/* Uses CSS env() for safe areas, with pt-safe class as Tailwind fallback */}
        <div
          className={`relative w-full ${isTopBanner ? 'pt-safe' : ''}`}
          style={isTopBanner ? {
            paddingTop: 'env(safe-area-inset-top, 0px)',
            paddingLeft: 'env(safe-area-inset-left, 0px)',
            paddingRight: 'env(safe-area-inset-right, 0px)',
          } : undefined}
        >
          <div className="px-3 py-2.5 sm:px-4 sm:py-3 lg:px-6">
            {/* Mobile Layout - stacked */}
            <div className="flex flex-col gap-2 sm:hidden">
              {/* Top row: Title + Dismiss */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`flex-shrink-0 ${variant.iconColor}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-sm truncate">
                    System Status: {title}
                  </span>
                </div>
                <button
                  onClick={handleDismiss}
                  className="p-1.5 rounded-full hover:bg-white/20 transition-colors flex-shrink-0"
                  aria-label="Dismiss announcement"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Message row */}
              <p className="text-xs text-white/90 leading-relaxed line-clamp-3">
                {message}
              </p>

              {/* Video button row - prominent on mobile */}
              {videoUrl && (
                <button
                  onClick={() => setVideoDialogOpen(true)}
                  className={`flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg ${variant.videoBtnBg} border text-white font-semibold text-sm transition-all active:scale-[0.98]`}
                >
                  <div className="relative">
                    <Film className="h-5 w-5" />
                    <div className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full animate-pulse" />
                  </div>
                  <span>Watch Video Guide</span>
                  <Play className="h-4 w-4 fill-current" />
                </button>
              )}
            </div>

            {/* Desktop/Tablet Layout - single row */}
            <div className="hidden sm:flex items-center justify-between gap-4">
              {/* Left section: Icon + Content */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`flex-shrink-0 ${variant.iconColor}`}>
                  <Icon className="h-5 w-5 lg:h-6 lg:w-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-bold text-sm lg:text-base whitespace-nowrap">
                      System Status: {title}
                    </span>
                    <span className="text-white/80">—</span>
                    <span className="text-sm text-white/90 line-clamp-1 lg:line-clamp-none">
                      {message}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right section: Video button + Dismiss */}
              <div className="flex items-center gap-3 flex-shrink-0">
                {videoUrl && (
                  <button
                    onClick={() => setVideoDialogOpen(true)}
                    className={`flex items-center gap-2 py-2 px-4 rounded-lg ${variant.videoBtnBg} border text-white font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]`}
                  >
                    <div className="relative">
                      <Play className="h-4 w-4 fill-current" />
                      <div className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                    </div>
                    <span>Watch Video</span>
                  </button>
                )}

                <button
                  onClick={handleDismiss}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors"
                  aria-label="Dismiss announcement"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Dialog */}
      {videoUrl && (
        <Dialog open={videoDialogOpen} onOpenChange={setVideoDialogOpen}>
          <DialogContent className="bg-navy-900 border-navy-700 max-w-4xl w-[95vw] p-0 overflow-hidden">
            <DialogHeader className="p-4 pb-2">
              <DialogTitle className="text-white flex items-center gap-2">
                <Volume2 className="h-5 w-5 text-gold-500" />
                {title} - Video Guide
              </DialogTitle>
            </DialogHeader>
            <div className="aspect-video w-full">
              <iframe
                src={getVideoEmbedUrl(videoUrl)}
                className="w-full h-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
                title="Announcement Video"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

// Compact status badge for header (shows when banner is dismissed but announcement is still active)
interface SystemStatusBadgeProps {
  enabled: boolean;
  title: string;
  type?: 'info' | 'warning' | 'success';
  onClick?: () => void;
}

export function SystemStatusBadge({
  enabled,
  title,
  type = 'info',
  onClick,
}: SystemStatusBadgeProps) {
  if (!enabled) return null;

  const variants = {
    info: 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30',
    warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30',
    success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30',
  };

  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${variants[type]} transition-colors flex items-center gap-1.5`}
      title="Click to show announcement"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
      {title}
    </button>
  );
}
