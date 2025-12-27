import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import {
  Play,
  Pause,
  Heart,
  MessageCircle,
  ChevronUp,
  ChevronDown,
  Volume2,
  VolumeX,
  X,
  Award,
  Check,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CourseContent, UserProgress } from '@shared/types';

interface VideoItem {
  content: CourseContent;
  progress: UserProgress | null;
}

interface VideoFeedProps {
  videos: VideoItem[];
  initialIndex?: number;
  currentUserId: string | null;
  onClose: () => void;
  onLikeVideo: (contentId: string) => void;
  onVideoProgress: (contentId: string, watchedPercentage: number, lastPosition: number) => void;
  onVideoComplete: (contentId: string) => void;
  onOpenComments: (content: CourseContent) => void;
  isLikeLoading?: boolean;
}

// Heart animation particles component
function HeartParticles({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {/* Main heart */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute"
          >
            <Heart className="w-24 h-24 text-red-500 fill-red-500" />
          </motion.div>

          {/* Particle hearts */}
          {[...Array(8)].map((_, i) => {
            const angle = (i / 8) * 360;
            const radian = (angle * Math.PI) / 180;
            const distance = 100;
            const x = Math.cos(radian) * distance;
            const y = Math.sin(radian) * distance;

            return (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
                animate={{
                  scale: [0, 1, 0.5],
                  opacity: [1, 1, 0],
                  x: [0, x * 0.5, x],
                  y: [0, y * 0.5 - 20, y - 40],
                }}
                transition={{
                  duration: 0.8,
                  ease: "easeOut",
                  delay: i * 0.02,
                }}
                className="absolute"
              >
                <Heart className="w-6 h-6 text-red-500 fill-red-500" />
              </motion.div>
            );
          })}
        </div>
      )}
    </AnimatePresence>
  );
}

// Up Next Preview Component
function UpNextPreview({ nextVideo, onSwipe }: { nextVideo: VideoItem | null; onSwipe: () => void }) {
  if (!nextVideo) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-24 left-4 right-4 z-10"
    >
      <button
        onClick={onSwipe}
        className="w-full bg-gradient-to-r from-amber-500/90 to-gold-500/90 backdrop-blur-sm rounded-xl p-3 flex items-center gap-3 text-left shadow-lg border border-amber-400/30"
      >
        {/* Thumbnail */}
        <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-slate-900">
          {nextVideo.content.thumbnailUrl ? (
            <img
              src={nextVideo.content.thumbnailUrl}
              alt={nextVideo.content.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Play className="w-6 h-6 text-white/50" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <ChevronUp className="w-4 h-4 text-navy-900 animate-bounce" />
            <span className="text-xs font-semibold text-navy-900 uppercase tracking-wide">Up Next</span>
          </div>
          <p className="text-sm font-medium text-navy-900 truncate">{nextVideo.content.title}</p>
        </div>

        {/* Points */}
        <div className="flex items-center gap-1 text-navy-900 flex-shrink-0">
          <Award className="w-4 h-4" />
          <span className="text-sm font-semibold">{nextVideo.content.points}</span>
        </div>
      </button>
    </motion.div>
  );
}

// Single Video Card
function VideoCard({
  item,
  isActive,
  currentUserId,
  onLike,
  onOpenComments,
  onProgress,
  onComplete,
  isLikeLoading,
}: {
  item: VideoItem;
  isActive: boolean;
  currentUserId: string | null;
  onLike: () => void;
  onOpenComments: () => void;
  onProgress: (watchedPercentage: number, lastPosition: number) => void;
  onComplete: () => void;
  isLikeLoading?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showHearts, setShowHearts] = useState(false);
  const [watchedPercentage, setWatchedPercentage] = useState(item.progress?.watchedPercentage || 0);
  const lastUpdateRef = useRef<number>(0);
  const doubleTapRef = useRef<number>(0);
  const heartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (heartTimeoutRef.current) clearTimeout(heartTimeoutRef.current);
      if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
    };
  }, []);

  const isLiked = currentUserId && item.content.likedBy?.includes(currentUserId);
  const isCompleted = item.progress?.status === 'completed';

  // Handle play/pause when active state changes
  useEffect(() => {
    if (!videoRef.current) return;

    if (isActive) {
      // Resume from last position if available
      if (item.progress?.lastPosition) {
        videoRef.current.currentTime = item.progress.lastPosition;
      }
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isActive, item.progress?.lastPosition]);

  // Handle time update for progress tracking
  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const percentage = (video.currentTime / video.duration) * 100;
    setWatchedPercentage(percentage);

    // Update progress every 5 seconds
    const now = Date.now();
    if (now - lastUpdateRef.current > 5000) {
      lastUpdateRef.current = now;
      onProgress(percentage, video.currentTime);
    }
  }, [onProgress]);

  // Handle video ended
  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    if (!isCompleted) {
      onComplete();
    }
  }, [isCompleted, onComplete]);

  // Toggle play/pause on tap
  const handleVideoTap = useCallback(() => {
    const now = Date.now();
    const timeSinceLastTap = now - doubleTapRef.current;

    // Double tap to like
    if (timeSinceLastTap < 300) {
      if (!isLiked) {
        onLike();
        setShowHearts(true);
        if (heartTimeoutRef.current) clearTimeout(heartTimeoutRef.current);
        heartTimeoutRef.current = setTimeout(() => setShowHearts(false), 1000);
      }
      doubleTapRef.current = 0;
      return;
    }

    doubleTapRef.current = now;

    // Single tap - toggle play/pause after delay to check for double tap
    if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
    tapTimeoutRef.current = setTimeout(() => {
      if (Date.now() - doubleTapRef.current >= 300) {
        if (videoRef.current) {
          if (isPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
          } else {
            videoRef.current.play().catch(() => {});
            setIsPlaying(true);
          }
        }
      }
    }, 300);
  }, [isPlaying, isLiked, onLike]);

  // Like button with animation
  const handleLikeClick = useCallback(() => {
    onLike();
    if (!isLiked) {
      setShowHearts(true);
      if (heartTimeoutRef.current) clearTimeout(heartTimeoutRef.current);
      heartTimeoutRef.current = setTimeout(() => setShowHearts(false), 1000);
    }
  }, [onLike, isLiked]);

  return (
    <div className="relative w-full h-full bg-black">
      {/* Video */}
      <video
        ref={videoRef}
        src={item.content.videoUrl}
        className="w-full h-full object-contain"
        loop={false}
        muted={isMuted}
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onClick={handleVideoTap}
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/80 to-transparent" />
      </div>

      {/* Heart particles on double tap */}
      <HeartParticles show={showHearts} />

      {/* Play/Pause indicator */}
      <AnimatePresence>
        {!isPlaying && isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="w-20 h-20 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
              <Play className="w-10 h-10 text-white ml-1" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video info - bottom left */}
      <div className="absolute bottom-20 left-4 right-16 z-10">
        <h3 className="text-white font-semibold text-lg drop-shadow-lg">{item.content.title}</h3>
        <p className="text-white/80 text-sm mt-1 line-clamp-2 drop-shadow-md">{item.content.description}</p>
        <div className="flex items-center gap-3 mt-2 text-white/70 text-sm">
          <span className="flex items-center gap-1">
            <Award className="w-4 h-4 text-gold-400" />
            {item.content.points} pts
          </span>
          {item.content.videoDuration && (
            <span>{Math.floor(item.content.videoDuration / 60)}:{(item.content.videoDuration % 60).toString().padStart(2, '0')}</span>
          )}
          {isCompleted && (
            <span className="flex items-center gap-1 text-green-400">
              <Check className="w-4 h-4" />
              Completed
            </span>
          )}
        </div>
      </div>

      {/* Action buttons - right side */}
      <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5 z-10">
        {/* Like */}
        <button
          onClick={handleLikeClick}
          disabled={isLikeLoading}
          className="flex flex-col items-center gap-1"
        >
          <motion.div
            whileTap={{ scale: 1.3 }}
            animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
          >
            <Heart
              className={cn(
                "w-8 h-8 drop-shadow-lg transition-colors",
                isLiked ? "text-red-500 fill-red-500" : "text-white"
              )}
            />
          </motion.div>
          <span className="text-white text-xs font-medium drop-shadow-md">
            {item.content.likes || 0}
          </span>
        </button>

        {/* Comments */}
        <button
          onClick={onOpenComments}
          className="flex flex-col items-center gap-1"
        >
          <MessageCircle className="w-8 h-8 text-white drop-shadow-lg" />
          <span className="text-white text-xs font-medium drop-shadow-md">
            {item.content.commentCount || 0}
          </span>
        </button>

        {/* Mute/Unmute */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="flex flex-col items-center gap-1"
        >
          {isMuted ? (
            <VolumeX className="w-7 h-7 text-white drop-shadow-lg" />
          ) : (
            <Volume2 className="w-7 h-7 text-white drop-shadow-lg" />
          )}
        </button>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
        <motion.div
          className={cn(
            "h-full",
            isCompleted ? "bg-green-500" : "bg-gold-500"
          )}
          style={{ width: `${watchedPercentage}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>
    </div>
  );
}

export function VideoFeed({
  videos,
  initialIndex = 0,
  currentUserId,
  onClose,
  onLikeVideo,
  onVideoProgress,
  onVideoComplete,
  onOpenComments,
  isLikeLoading,
}: VideoFeedProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const containerRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  const SWIPE_THRESHOLD = 100;

  const currentVideo = videos[currentIndex];
  const nextVideo = videos[currentIndex + 1] || null;
  const prevVideo = videos[currentIndex - 1] || null;

  // Handle swipe navigation
  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info;

    // Swipe up to go to next video
    if (offset.y < -SWIPE_THRESHOLD || velocity.y < -500) {
      if (currentIndex < videos.length - 1) {
        setCurrentIndex(prev => prev + 1);
      }
    }
    // Swipe down to go to previous video
    else if (offset.y > SWIPE_THRESHOLD || velocity.y > 500) {
      if (currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
    }
  }, [currentIndex, videos.length]);

  // Navigate to next video
  const goToNext = useCallback(() => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, videos.length]);

  // Navigate to previous video
  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'k') {
        goToPrev();
      } else if (e.key === 'ArrowDown' || e.key === 'j') {
        goToNext();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev, onClose]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black overflow-hidden"
    >
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-4 left-4 z-20 bg-black/50 hover:bg-black/70 text-white"
      >
        <X className="h-5 w-5" />
      </Button>

      {/* Video counter */}
      <div className="absolute top-4 right-4 z-20 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
        <span className="text-white text-sm font-medium">
          {currentIndex + 1} / {videos.length}
        </span>
      </div>

      {/* Navigation hints */}
      {currentIndex > 0 && (
        <button
          onClick={goToPrev}
          className="absolute top-16 left-1/2 -translate-x-1/2 z-20 text-white/50 hover:text-white transition-colors"
        >
          <ChevronUp className="w-8 h-8 animate-bounce" />
        </button>
      )}

      {/* Main video area with swipe */}
      <motion.div
        className="w-full h-full"
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ y }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={currentIndex}
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full h-full"
          >
            <VideoCard
              item={currentVideo}
              isActive={true}
              currentUserId={currentUserId}
              onLike={() => onLikeVideo(currentVideo.content.id)}
              onOpenComments={() => onOpenComments(currentVideo.content)}
              onProgress={(percentage, position) => onVideoProgress(currentVideo.content.id, percentage, position)}
              onComplete={() => onVideoComplete(currentVideo.content.id)}
              isLikeLoading={isLikeLoading}
            />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Up Next preview */}
      <UpNextPreview nextVideo={nextVideo} onSwipe={goToNext} />

      {/* Bottom navigation hint */}
      {currentIndex < videos.length - 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10"
        >
          <span className="text-white/40 text-xs">Swipe up for next</span>
        </motion.div>
      )}
    </div>
  );
}
