import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, PanInfo } from 'framer-motion';
import {
  Play,
  Heart,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  X,
  Award,
  Check,
  Loader2,
  Brain,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { CourseContent, UserProgress, QuizQuestion, QuizResultResponse } from '@shared/types';

interface ContentItem {
  content: CourseContent;
  progress: UserProgress | null;
}

interface UnifiedContentFeedProps {
  items: ContentItem[];
  initialIndex?: number;
  currentUserId: string | null;
  onClose: () => void;
  onLikeContent: (contentId: string) => void;
  onVideoProgress: (contentId: string, watchedPercentage: number, lastPosition: number) => void;
  onVideoComplete: (contentId: string) => void;
  onQuizSubmit: (contentId: string, answers: Record<string, number>) => Promise<QuizResultResponse>;
  onOpenComments: (content: CourseContent) => void;
  isLikeLoading?: boolean;
}

// Pre-calculated particle positions for performance (avoid recalculation on every render)
const PARTICLE_POSITIONS = Array.from({ length: 8 }, (_, i) => {
  const angle = (i / 8) * 360;
  const radian = (angle * Math.PI) / 180;
  const distance = 100;
  return {
    x: Math.cos(radian) * distance,
    y: Math.sin(radian) * distance,
  };
});

// Heart animation particles component - memoized to prevent unnecessary re-renders
const HeartParticles = React.memo(function HeartParticles({ show }: { show: boolean }) {
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
            style={{ willChange: 'transform, opacity' }}
          >
            <Heart className="w-24 h-24 text-red-500 fill-red-500" />
          </motion.div>

          {/* Particle hearts - using pre-calculated positions */}
          {PARTICLE_POSITIONS.map((pos, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
              animate={{
                scale: [0, 1, 0.5],
                opacity: [1, 1, 0],
                x: [0, pos.x * 0.5, pos.x],
                y: [0, pos.y * 0.5 - 20, pos.y - 40],
              }}
              transition={{
                duration: 0.8,
                ease: "easeOut",
                delay: i * 0.02,
              }}
              className="absolute"
              style={{ willChange: 'transform, opacity' }}
            >
              <Heart className="w-6 h-6 text-red-500 fill-red-500" />
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
});

// Video Card Component - memoized to prevent unnecessary re-renders
const VideoCard = React.memo(function VideoCard({
  item,
  isActive,
  currentUserId,
  onLike,
  onOpenComments,
  onProgress,
  onComplete,
  isLikeLoading,
  hasQuiz,
  onSwipeToQuiz,
}: {
  item: ContentItem;
  isActive: boolean;
  currentUserId: string | null;
  onLike: () => void;
  onOpenComments: () => void;
  onProgress: (watchedPercentage: number, lastPosition: number) => void;
  onComplete: () => void;
  isLikeLoading?: boolean;
  hasQuiz: boolean;
  onSwipeToQuiz: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showHearts, setShowHearts] = useState(false);
  const [watchedPercentage, setWatchedPercentage] = useState(item.progress?.watchedPercentage || 0);
  const [videoError, setVideoError] = useState<string | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const doubleTapRef = useRef<number>(0);
  const heartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  // Optimistic like state
  const [optimisticLiked, setOptimisticLiked] = useState<boolean | null>(null);

  // Cleanup timeouts and track mounted state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (heartTimeoutRef.current) clearTimeout(heartTimeoutRef.current);
      if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
      // Cleanup video element to free memory
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = '';
        videoRef.current.load();
      }
    };
  }, []);

  const serverLiked = currentUserId && item.content.likedBy?.includes(currentUserId);
  const isLiked = optimisticLiked !== null ? optimisticLiked : serverLiked;
  const isCompleted = item.progress?.status === 'completed';

  // Reset optimistic state when server state changes
  useEffect(() => {
    setOptimisticLiked(null);
  }, [item.content.likedBy]);

  // Handle play/pause when active
  useEffect(() => {
    if (!videoRef.current) return;

    if (isActive) {
      if (item.progress?.lastPosition) {
        videoRef.current.currentTime = item.progress.lastPosition;
      }
      videoRef.current.play().catch((err) => {
        // Only show error for non-autoplay-blocked errors
        if (err.name !== 'NotAllowedError') {
          console.error('Video playback error:', err);
          if (isMountedRef.current) {
            setVideoError('Failed to play video. Tap to retry.');
          }
        }
      });
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isActive, item.progress?.lastPosition]);

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    // Guard against division by zero or invalid duration
    if (!video.duration || isNaN(video.duration) || !isFinite(video.duration)) return;

    const percentage = (video.currentTime / video.duration) * 100;
    setWatchedPercentage(percentage);

    const now = Date.now();
    if (now - lastUpdateRef.current > 5000) {
      lastUpdateRef.current = now;
      onProgress(percentage, video.currentTime);
    }
  }, [onProgress]);

  // Handle video errors
  const handleVideoError = useCallback(() => {
    if (isMountedRef.current) {
      setVideoError('Video failed to load. Please check your connection.');
      toast.error('Video failed to load');
    }
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    if (!isCompleted) {
      onComplete();
    }
    // Show quiz toast if there's an associated quiz
    if (hasQuiz) {
      toast('Quiz Available!', {
        description: 'Swipe left to take the quiz',
        icon: <Brain className="w-5 h-5 text-purple-500" />,
        action: {
          label: 'Take Quiz',
          onClick: onSwipeToQuiz,
        },
        duration: 5000,
      });
    }
  }, [isCompleted, onComplete, hasQuiz, onSwipeToQuiz]);

  const handleVideoTap = useCallback(() => {
    // Clear any error state on tap (retry)
    if (videoError) {
      setVideoError(null);
    }

    const now = Date.now();
    const timeSinceLastTap = now - doubleTapRef.current;

    // Double tap to like
    if (timeSinceLastTap < 300) {
      if (!isLiked) {
        setOptimisticLiked(true);
        onLike();
      }
      setShowHearts(true);
      if (heartTimeoutRef.current) clearTimeout(heartTimeoutRef.current);
      heartTimeoutRef.current = setTimeout(() => setShowHearts(false), 1000);
      doubleTapRef.current = 0;
      return;
    }

    doubleTapRef.current = now;

    // Single tap - toggle play/pause
    if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
    tapTimeoutRef.current = setTimeout(() => {
      if (Date.now() - doubleTapRef.current >= 300) {
        if (videoRef.current) {
          if (isPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
          } else {
            videoRef.current.play().catch((err) => {
              if (err.name !== 'NotAllowedError' && isMountedRef.current) {
                setVideoError('Failed to play video. Tap to retry.');
              }
            });
            setIsPlaying(true);
          }
        }
      }
    }, 300);
  }, [isPlaying, isLiked, onLike, videoError]);

  const handleLikeClick = useCallback(() => {
    const newLikedState = !isLiked;
    setOptimisticLiked(newLikedState);
    onLike();
    if (newLikedState) {
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
        preload="metadata"
        poster={item.content.thumbnailUrl || undefined}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onClick={handleVideoTap}
        onError={handleVideoError}
      />

      {/* Video error state */}
      {videoError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20">
          <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
          <p className="text-white text-center px-6">{videoError}</p>
          <p className="text-white/60 text-sm mt-2">Tap to retry</p>
        </div>
      )}

      {/* Gradient overlays */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/80 to-transparent" />
      </div>

      {/* Heart particles */}
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
          {hasQuiz && (
            <span className="flex items-center gap-1 text-purple-400">
              <Brain className="w-4 h-4" />
              Quiz
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
          aria-label={isLiked ? 'Unlike video' : 'Like video'}
        >
          <motion.div whileTap={{ scale: 1.3 }} animate={isLiked ? { scale: [1, 1.3, 1] } : {}}>
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
        <button onClick={onOpenComments} className="flex flex-col items-center gap-1" aria-label="Open comments">
          <MessageCircle className="w-8 h-8 text-white drop-shadow-lg" />
          <span className="text-white text-xs font-medium drop-shadow-md">
            {item.content.commentCount || 0}
          </span>
        </button>

        {/* Quiz indicator */}
        {hasQuiz && (
          <button onClick={onSwipeToQuiz} className="flex flex-col items-center gap-1" aria-label="Take quiz">
            <motion.div
              animate={{ x: [-2, 2, -2] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <Brain className="w-8 h-8 text-purple-400 drop-shadow-lg" />
            </motion.div>
            <span className="text-white text-xs font-medium drop-shadow-md">Quiz</span>
          </button>
        )}

        {/* Mute/Unmute */}
        <button onClick={() => setIsMuted(!isMuted)} className="flex flex-col items-center gap-1" aria-label={isMuted ? 'Unmute video' : 'Mute video'}>
          {isMuted ? (
            <VolumeX className="w-7 h-7 text-white drop-shadow-lg" />
          ) : (
            <Volume2 className="w-7 h-7 text-white drop-shadow-lg" />
          )}
        </button>
      </div>

      {/* Swipe to quiz hint */}
      {hasQuiz && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3 }}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex items-center"
        >
          <div className="bg-purple-600/80 backdrop-blur-sm rounded-l-lg px-2 py-3 flex items-center gap-1">
            <ChevronLeft className="w-4 h-4 text-white animate-pulse" />
            <span className="text-white text-xs font-medium writing-vertical">Quiz</span>
          </div>
        </motion.div>
      )}

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
        <motion.div
          className={cn("h-full", isCompleted ? "bg-green-500" : "bg-gold-500")}
          style={{ width: `${watchedPercentage}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>
    </div>
  );
});

// Quiz Card Component - Single Question View - memoized
function QuizQuestionCard({
  question,
  questionIndex,
  totalQuestions,
  selectedAnswer,
  onSelectAnswer,
  isSubmitted,
  result,
}: {
  question: QuizQuestion;
  questionIndex: number;
  totalQuestions: number;
  selectedAnswer: number | undefined;
  onSelectAnswer: (optionIndex: number) => void;
  isSubmitted: boolean;
  result?: { isCorrect: boolean; correctIndex: number };
}) {
  return (
    <div className="w-full h-full bg-gradient-to-b from-purple-900 to-navy-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          <span className="text-white font-medium">Question {questionIndex + 1} of {totalQuestions}</span>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: totalQuestions }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-2 h-2 rounded-full",
                i === questionIndex ? "bg-purple-400" : "bg-white/30"
              )}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-24">
        <h2 className="text-white text-2xl font-bold text-center mb-8">
          {question.question}
        </h2>

        {/* Options */}
        <div className="w-full max-w-md space-y-3">
          {question.options.map((option, idx) => {
            const isSelected = selectedAnswer === idx;
            const showCorrect = isSubmitted && result;
            const isCorrectOption = showCorrect && idx === result.correctIndex;
            const isWrongSelection = showCorrect && isSelected && !result.isCorrect;

            return (
              <motion.button
                key={idx}
                whileTap={{ scale: 0.98 }}
                onClick={() => !isSubmitted && onSelectAnswer(idx)}
                disabled={isSubmitted}
                className={cn(
                  "w-full p-4 rounded-xl text-left transition-all flex items-center gap-3",
                  !isSubmitted && !isSelected && "bg-white/10 hover:bg-white/20 text-white",
                  !isSubmitted && isSelected && "bg-purple-500 text-white ring-2 ring-purple-300",
                  isCorrectOption && "bg-green-500/80 text-white",
                  isWrongSelection && "bg-red-500/80 text-white",
                  isSubmitted && !isCorrectOption && !isWrongSelection && "bg-white/10 text-white/50"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                  !isSubmitted && !isSelected && "bg-white/20",
                  !isSubmitted && isSelected && "bg-white text-purple-600",
                  isCorrectOption && "bg-white text-green-600",
                  isWrongSelection && "bg-white text-red-600"
                )}>
                  {isCorrectOption ? <Check className="w-5 h-5" /> :
                   isWrongSelection ? <XCircle className="w-5 h-5" /> :
                   String.fromCharCode(65 + idx)}
                </div>
                <span className="flex-1">{option}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Explanation after submission */}
        {isSubmitted && result && question.explanation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-white/10 rounded-xl max-w-md"
          >
            <p className="text-white/80 text-sm">{question.explanation}</p>
          </motion.div>
        )}
      </div>

      {/* Swipe hints */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 text-white/40 text-xs">
        <span className="flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" /> Previous
        </span>
        <span className="flex items-center gap-1">
          Next <ChevronRight className="w-4 h-4" />
        </span>
      </div>
    </div>
  );
}

// Quiz Result Card
function QuizResultCard({
  result,
  onRetry,
  onGoBack,
}: {
  result: QuizResultResponse;
  onRetry: () => void;
  onGoBack: () => void;
}) {
  return (
    <div className="w-full h-full bg-gradient-to-b from-purple-900 to-navy-900 flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center"
      >
        {/* Score circle */}
        <div className={cn(
          "w-40 h-40 rounded-full flex flex-col items-center justify-center mx-auto mb-6",
          result.passed ? "bg-green-500/20 ring-4 ring-green-500" : "bg-red-500/20 ring-4 ring-red-500"
        )}>
          <span className="text-5xl font-bold text-white">{result.score}%</span>
          <span className="text-white/70 text-sm">
            {result.correctCount}/{result.totalQuestions} correct
          </span>
        </div>

        <h2 className="text-white text-2xl font-bold mb-2">
          {result.passed ? 'Congratulations!' : 'Keep Trying!'}
        </h2>

        <p className="text-white/70 mb-6">
          {result.passed
            ? `You've passed! +${result.pointsAwarded} points earned.`
            : `You need ${result.passingScore}% to pass.`
          }
        </p>

        {!result.passed && result.attemptsRemaining > 0 && (
          <p className="text-amber-400 text-sm mb-4">
            <AlertCircle className="w-4 h-4 inline mr-1" />
            {result.attemptsRemaining} attempt{result.attemptsRemaining > 1 ? 's' : ''} remaining
          </p>
        )}

        <div className="flex gap-3 justify-center">
          <Button
            variant="outline"
            onClick={onGoBack}
            className="bg-white/10 border-white/30 text-white hover:bg-white/20"
          >
            Back to Video
          </Button>
          {!result.passed && result.attemptsRemaining > 0 && (
            <Button
              onClick={onRetry}
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              Try Again
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// Constants
const SWIPE_THRESHOLD = 100;
const AUTO_ADVANCE_DELAY = 500;

export function UnifiedContentFeed({
  items,
  initialIndex = 0,
  currentUserId,
  onClose,
  onLikeContent,
  onVideoProgress,
  onVideoComplete,
  onQuizSubmit,
  onOpenComments,
  isLikeLoading,
}: UnifiedContentFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const autoAdvanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  const [currentItemIndex, setCurrentItemIndex] = useState(() =>
    Math.min(Math.max(0, initialIndex), items.length - 1)
  );
  const [viewMode, setViewMode] = useState<'video' | 'quiz'>('video');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizResult, setQuizResult] = useState<QuizResultResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const y = useMotionValue(0);
  const x = useMotionValue(0);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
      }
    };
  }, []);

  const currentItem = items[currentItemIndex];
  const currentVideo = currentItem?.content.contentType === 'video' ? currentItem : null;

  // Find the quiz associated with the current video (same dayNumber, type=quiz)
  const associatedQuiz = items.find(
    item =>
      item.content.contentType === 'quiz' &&
      item.content.dayNumber === currentItem?.content.dayNumber &&
      item.content.id !== currentItem?.content.id
  );

  const quizQuestions = associatedQuiz?.content.quizData?.questions || [];
  const currentQuestion = quizQuestions[currentQuestionIndex];

  // Reset quiz state when changing items
  useEffect(() => {
    setViewMode('video');
    setCurrentQuestionIndex(0);
    setQuizAnswers({});
    setQuizResult(null);
  }, [currentItemIndex]);

  // Handle vertical swipe (between content items)
  const handleVerticalDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (viewMode !== 'video') return;

    const { offset, velocity } = info;

    if (offset.y < -SWIPE_THRESHOLD || velocity.y < -500) {
      // Find next video
      const nextVideoIndex = items.findIndex(
        (item, idx) => idx > currentItemIndex && item.content.contentType === 'video'
      );
      if (nextVideoIndex !== -1) {
        setCurrentItemIndex(nextVideoIndex);
      }
    } else if (offset.y > SWIPE_THRESHOLD || velocity.y > 500) {
      // Find previous video
      const prevVideoIndex = [...items].reverse().findIndex(
        (item, idx) => items.length - 1 - idx < currentItemIndex && item.content.contentType === 'video'
      );
      if (prevVideoIndex !== -1) {
        setCurrentItemIndex(items.length - 1 - prevVideoIndex);
      }
    }
  }, [currentItemIndex, items, viewMode]);

  // Handle horizontal swipe (between video and quiz, between questions)
  const handleHorizontalDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info;

    if (viewMode === 'video') {
      // Swipe left to go to quiz
      if ((offset.x < -SWIPE_THRESHOLD || velocity.x < -500) && associatedQuiz) {
        setViewMode('quiz');
        setCurrentQuestionIndex(0);
        toast('Quiz Mode', {
          description: 'Answer questions by tapping, swipe to navigate',
          icon: <Brain className="w-5 h-5 text-purple-500" />,
        });
      }
    } else if (viewMode === 'quiz') {
      // Swipe right to go back to video
      if (offset.x > SWIPE_THRESHOLD || velocity.x > 500) {
        if (currentQuestionIndex > 0) {
          setCurrentQuestionIndex(prev => prev - 1);
        } else {
          setViewMode('video');
        }
      }
      // Swipe left to go to next question
      else if (offset.x < -SWIPE_THRESHOLD || velocity.x < -500) {
        if (currentQuestionIndex < quizQuestions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
        } else if (!quizResult && Object.keys(quizAnswers).length === quizQuestions.length) {
          // All questions answered, submit quiz
          handleSubmitQuiz();
        }
      }
    }
  }, [viewMode, associatedQuiz, currentQuestionIndex, quizQuestions.length, quizResult, quizAnswers]);

  const handleSubmitQuiz = async () => {
    if (!associatedQuiz || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await onQuizSubmit(associatedQuiz.content.id, quizAnswers);
      // Only update state if still mounted
      if (isMountedRef.current) {
        setQuizResult(result);
        setCurrentQuestionIndex(quizQuestions.length); // Go to result screen
      }
    } catch (error) {
      if (isMountedRef.current) {
        toast.error('Failed to submit quiz');
      }
    } finally {
      if (isMountedRef.current) {
        setIsSubmitting(false);
      }
    }
  };

  const handleSelectAnswer = (optionIndex: number) => {
    if (!currentQuestion || quizResult) return;

    // Clear any pending auto-advance timeout
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }

    setQuizAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionIndex,
    }));

    // Auto-advance after delay with cleanup
    autoAdvanceTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current && currentQuestionIndex < quizQuestions.length - 1 && !quizResult) {
        setCurrentQuestionIndex(prev => prev + 1);
      }
      autoAdvanceTimeoutRef.current = null;
    }, AUTO_ADVANCE_DELAY);
  };

  const handleRetryQuiz = () => {
    setQuizAnswers({});
    setQuizResult(null);
    setCurrentQuestionIndex(0);
  };

  const goToQuiz = () => {
    if (associatedQuiz) {
      setViewMode('quiz');
      setCurrentQuestionIndex(0);
      toast('Quiz Mode', {
        description: 'Answer questions by tapping, swipe to navigate',
        icon: <Brain className="w-5 h-5 text-purple-500" />,
      });
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (viewMode === 'quiz') {
          setViewMode('video');
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowLeft') {
        if (viewMode === 'quiz' && currentQuestionIndex > 0) {
          setCurrentQuestionIndex(prev => prev - 1);
        } else if (viewMode === 'quiz') {
          setViewMode('video');
        }
      } else if (e.key === 'ArrowRight') {
        if (viewMode === 'video' && associatedQuiz) {
          goToQuiz();
        } else if (viewMode === 'quiz' && currentQuestionIndex < quizQuestions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, currentQuestionIndex, quizQuestions.length, associatedQuiz, onClose]);

  if (!currentItem) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black overflow-hidden"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={viewMode === 'quiz' ? () => setViewMode('video') : onClose}
        className="absolute top-4 left-4 z-20 bg-black/50 hover:bg-black/70 text-white"
      >
        {viewMode === 'quiz' ? <ChevronLeft className="h-5 w-5" /> : <X className="h-5 w-5" />}
      </Button>

      {/* Mode indicator */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <div className={cn(
          "px-3 py-1.5 rounded-full flex items-center gap-2",
          viewMode === 'video' ? "bg-black/50" : "bg-purple-600/80"
        )}>
          {viewMode === 'video' ? (
            <>
              <Play className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-medium">
                {currentItemIndex + 1} / {items.filter(i => i.content.contentType === 'video').length}
              </span>
            </>
          ) : (
            <>
              <Brain className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-medium">Quiz</span>
            </>
          )}
        </div>
      </div>

      {/* Main content area */}
      <AnimatePresence mode="wait">
        {viewMode === 'video' ? (
          <motion.div
            key="video"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            className="w-full h-full"
            drag="y"
            dragConstraints={containerRef}
            dragElastic={0.3}
            onDragEnd={handleVerticalDragEnd}
          >
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.3}
              onDragEnd={handleHorizontalDragEnd}
              className="w-full h-full"
            >
              {currentVideo && (
                <VideoCard
                  item={currentVideo}
                  isActive={true}
                  currentUserId={currentUserId}
                  onLike={() => onLikeContent(currentVideo.content.id)}
                  onOpenComments={() => onOpenComments(currentVideo.content)}
                  onProgress={(percentage, position) => onVideoProgress(currentVideo.content.id, percentage, position)}
                  onComplete={() => onVideoComplete(currentVideo.content.id)}
                  isLikeLoading={isLikeLoading}
                  hasQuiz={!!associatedQuiz}
                  onSwipeToQuiz={goToQuiz}
                />
              )}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="quiz"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            className="w-full h-full"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.3}
            onDragEnd={handleHorizontalDragEnd}
          >
            {quizResult ? (
              <QuizResultCard
                result={quizResult}
                onRetry={handleRetryQuiz}
                onGoBack={() => setViewMode('video')}
              />
            ) : currentQuestion ? (
              <QuizQuestionCard
                question={currentQuestion}
                questionIndex={currentQuestionIndex}
                totalQuestions={quizQuestions.length}
                selectedAnswer={quizAnswers[currentQuestion.id]}
                onSelectAnswer={handleSelectAnswer}
                isSubmitted={false}
                result={undefined}
              />
            ) : (
              // Submit screen when all questions answered
              <div className="w-full h-full bg-gradient-to-b from-purple-900 to-navy-900 flex flex-col items-center justify-center p-6">
                <Brain className="w-16 h-16 text-purple-400 mb-4" />
                <h2 className="text-white text-2xl font-bold mb-2">Ready to Submit?</h2>
                <p className="text-white/70 text-center mb-6">
                  You've answered all {quizQuestions.length} questions.
                </p>
                <Button
                  onClick={handleSubmitQuiz}
                  disabled={isSubmitting}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-8"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Quiz'
                  )}
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation dots for video mode */}
      {viewMode === 'video' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {items.filter(i => i.content.contentType === 'video').map((_, idx) => (
            <div
              key={idx}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                idx === items.slice(0, currentItemIndex + 1).filter(i => i.content.contentType === 'video').length - 1
                  ? "bg-white"
                  : "bg-white/30"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
