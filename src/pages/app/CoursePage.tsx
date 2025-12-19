import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useCourseOverview, useDayContent, useUpdateVideoProgress, useCompleteVideo, useSubmitQuiz } from '@/hooks/use-queries';
import {
  Play,
  Pause,
  CheckCircle2,
  Lock,
  Video,
  FileQuestion,
  FileText,
  Award,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Clock,
  AlertCircle,
  X,
  Check,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import { CourseContent, UserProgress, QuizQuestion, QuizResultResponse } from '@shared/types';

// Helper to group days into weeks
const DAYS_PER_WEEK = 7;
const TOTAL_DAYS = 28;
const weeks = Array.from({ length: Math.ceil(TOTAL_DAYS / DAYS_PER_WEEK) }, (_, weekIdx) =>
  Array.from({ length: DAYS_PER_WEEK }, (_, dayIdx) => weekIdx * DAYS_PER_WEEK + dayIdx + 1)
    .filter(day => day <= TOTAL_DAYS)
);

export function CoursePage() {
  const { data: overviewData, isLoading: overviewLoading } = useCourseOverview();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const { data: dayContent, isLoading: dayContentLoading } = useDayContent(selectedDay);

  // Carousel state for day selector
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentWeek, setCurrentWeek] = useState(0);

  // Video player state
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState<{ content: CourseContent; progress: UserProgress | null } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Quiz state
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<{ content: CourseContent; progress: UserProgress | null } | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizResult, setQuizResult] = useState<QuizResultResponse | null>(null);

  // Mutations
  const updateProgressMutation = useUpdateVideoProgress();
  const completeVideoMutation = useCompleteVideo();
  const submitQuizMutation = useSubmitQuiz();

  // Carousel scroll handler
  const onCarouselSelect = useCallback(() => {
    if (!carouselApi) return;
    setCurrentWeek(carouselApi.selectedScrollSnap());
  }, [carouselApi]);

  useEffect(() => {
    if (!carouselApi) return;
    onCarouselSelect();
    carouselApi.on('select', onCarouselSelect);
    return () => {
      carouselApi.off('select', onCarouselSelect);
    };
  }, [carouselApi, onCarouselSelect]);

  // Auto-select current day on load and scroll to correct week
  useEffect(() => {
    if (overviewData?.overview && !selectedDay) {
      const currentDay = overviewData.overview.currentDay;
      setSelectedDay(currentDay);
      // Scroll carousel to the week containing current day
      const weekIndex = Math.floor((currentDay - 1) / DAYS_PER_WEEK);
      if (carouselApi) {
        carouselApi.scrollTo(weekIndex);
      }
    }
  }, [overviewData, selectedDay, carouselApi]);

  const openVideoPlayer = (content: CourseContent, progress: UserProgress | null) => {
    setActiveVideo({ content, progress });
    setVideoModalOpen(true);
  };

  const closeVideoPlayer = () => {
    // Save progress before closing
    if (videoRef.current && activeVideo) {
      const percentage = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      updateProgressMutation.mutate({
        contentId: activeVideo.content.id,
        watchedPercentage: percentage,
        lastPosition: videoRef.current.currentTime
      });
    }
    setVideoModalOpen(false);
    setActiveVideo(null);
  };

  const handleVideoTimeUpdate = () => {
    if (!videoRef.current || !activeVideo) return;

    const percentage = (videoRef.current.currentTime / videoRef.current.duration) * 100;

    // Update progress every 10 seconds or at completion
    if (percentage >= 90 || videoRef.current.currentTime % 10 < 0.5) {
      updateProgressMutation.mutate({
        contentId: activeVideo.content.id,
        watchedPercentage: percentage,
        lastPosition: videoRef.current.currentTime
      });
    }
  };

  const handleVideoEnded = () => {
    if (activeVideo) {
      completeVideoMutation.mutate(activeVideo.content.id);
    }
  };

  const openQuiz = (content: CourseContent, progress: UserProgress | null) => {
    setActiveQuiz({ content, progress });
    setQuizAnswers({});
    setQuizResult(null);
    setQuizModalOpen(true);
  };

  const handleQuizSubmit = async () => {
    if (!activeQuiz) return;

    try {
      const result = await submitQuizMutation.mutateAsync({
        contentId: activeQuiz.content.id,
        answers: quizAnswers
      });
      setQuizResult(result);
    } catch (error) {
      console.error('Quiz submission failed:', error);
    }
  };

  const getTypeIcon = (type: CourseContent['contentType']) => {
    switch (type) {
      case 'video': return <Video className="h-5 w-5" />;
      case 'quiz': return <FileQuestion className="h-5 w-5" />;
      case 'resource': return <FileText className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: UserProgress['status'] | undefined, isUnlocked: boolean) => {
    if (!isUnlocked) {
      return <Badge variant="outline" className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"><Lock className="h-3 w-3 mr-1" />Locked</Badge>;
    }
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"><CheckCircle2 className="h-3 w-3 mr-1" />Complete</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"><Clock className="h-3 w-3 mr-1" />In Progress</Badge>;
      default:
        return <Badge variant="outline" className="text-gold-600 dark:text-gold-400 border-gold-300 dark:border-gold-700">Available</Badge>;
    }
  };

  if (overviewLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
      </div>
    );
  }

  if (!overviewData?.hasEnrollment) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Card className="bg-white dark:bg-navy-800 border-slate-200 dark:border-navy-700 text-center">
          <CardContent className="py-12">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-slate-300 dark:text-navy-600" />
            <h2 className="text-xl font-semibold text-navy-900 dark:text-white mb-2">
              No Active Enrollment
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              You need to be enrolled in an active project to access course content.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const overview = overviewData.overview!;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Course Progress Overview */}
      <Card className="bg-white dark:bg-navy-800 border-slate-200 dark:border-navy-700">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-navy-900 dark:text-white">
            <Video className="h-5 w-5 text-gold-500" />
            Your Course Progress
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400">
            Day {overview.currentDay} of 28
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600 dark:text-slate-400">Overall Progress</span>
                <span className="font-medium text-navy-900 dark:text-white">
                  {overview.completedContent} / {overview.totalContent} items
                </span>
              </div>
              <Progress
                value={(overview.completedContent / overview.totalContent) * 100}
                className="h-2"
              />
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{overview.completedContent}</p>
                <p className="text-xs text-green-700 dark:text-green-500">Completed</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{overview.availableContent}</p>
                <p className="text-xs text-blue-700 dark:text-blue-500">Available</p>
              </div>
              <div className="p-3 rounded-lg bg-gold-50 dark:bg-gold-900/20">
                <p className="text-2xl font-bold text-gold-600 dark:text-gold-400">{overview.earnedPoints}</p>
                <p className="text-xs text-gold-700 dark:text-gold-500">Points Earned</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Day Selector - Week-based Carousel */}
      <div className="space-y-3">
        {/* Week Navigation Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => carouselApi?.scrollPrev()}
            disabled={currentWeek === 0}
            className="text-slate-500 hover:text-navy-900 dark:text-slate-400 dark:hover:text-white"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Prev Week</span>
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-navy-900 dark:text-white">
              Week {currentWeek + 1}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              (Days {currentWeek * DAYS_PER_WEEK + 1}-{Math.min((currentWeek + 1) * DAYS_PER_WEEK, TOTAL_DAYS)})
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => carouselApi?.scrollNext()}
            disabled={currentWeek === weeks.length - 1}
            className="text-slate-500 hover:text-navy-900 dark:text-slate-400 dark:hover:text-white"
          >
            <span className="hidden sm:inline">Next Week</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {/* Day Carousel */}
        <Carousel
          setApi={setCarouselApi}
          opts={{
            align: 'start',
            loop: false,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2">
            {weeks.map((weekDays, weekIdx) => (
              <CarouselItem key={weekIdx} className="pl-2 basis-full">
                <div className="flex justify-center gap-1 sm:gap-2 py-1">
                  {weekDays.map(day => (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      aria-label={`Day ${day}`}
                      aria-pressed={selectedDay === day}
                      className={cn(
                        "w-10 h-10 sm:w-11 sm:h-11 rounded-full text-sm sm:text-base font-medium transition-all duration-200 flex-shrink-0",
                        "focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 dark:focus:ring-offset-navy-800",
                        selectedDay === day
                          ? "bg-gold-500 text-navy-900 shadow-md scale-110"
                          : day <= overview.currentDay
                          ? "bg-slate-100 dark:bg-navy-700 text-navy-900 dark:text-white hover:bg-gold-100 dark:hover:bg-gold-900/40 hover:scale-105"
                          : "bg-slate-100 dark:bg-navy-800 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50"
                      )}
                      disabled={day > overview.currentDay}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Week Dots Indicator */}
        <div className="flex justify-center gap-1.5">
          {weeks.map((_, idx) => (
            <button
              key={idx}
              onClick={() => carouselApi?.scrollTo(idx)}
              aria-label={`Go to week ${idx + 1}`}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-200",
                currentWeek === idx
                  ? "bg-gold-500 w-4"
                  : "bg-slate-300 dark:bg-navy-600 hover:bg-gold-300 dark:hover:bg-gold-700"
              )}
            />
          ))}
        </div>
      </div>

      {/* Day Content */}
      <Card className="bg-white dark:bg-navy-800 border-slate-200 dark:border-navy-700">
        <CardHeader>
          <CardTitle className="text-navy-900 dark:text-white">
            Day {selectedDay} Content
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400">
            {dayContent?.isUnlocked
              ? 'Complete all items to earn points'
              : `Unlocks on ${dayContent?.unlockDate}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dayContentLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gold-500" />
            </div>
          ) : !dayContent?.content?.length ? (
            <p className="text-center py-8 text-slate-500 dark:text-slate-400">
              No content scheduled for this day.
            </p>
          ) : (
            <div className="space-y-3">
              {dayContent.content.map(({ content, progress, prerequisitesMet }) => (
                <div
                  key={content.id}
                  className={cn(
                    "p-4 rounded-lg border transition-all",
                    progress?.status === 'completed'
                      ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
                      : dayContent.isUnlocked
                      ? "bg-slate-50 dark:bg-navy-700/50 border-slate-200 dark:border-navy-600 hover:border-gold-300 dark:hover:border-gold-700"
                      : "bg-slate-100 dark:bg-navy-800 border-slate-200 dark:border-navy-700 opacity-60"
                  )}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className={cn(
                      "p-2 sm:p-3 rounded-lg flex-shrink-0",
                      content.contentType === 'video' && "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
                      content.contentType === 'quiz' && "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
                      content.contentType === 'resource' && "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                    )}>
                      {getTypeIcon(content.contentType)}
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-navy-900 dark:text-white truncate">{content.title}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                            {content.description}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          {getStatusBadge(progress?.status, dayContent.isUnlocked)}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3">
                        <span className="text-sm text-gold-600 dark:text-gold-400 flex items-center gap-1">
                          <Award className="h-4 w-4 flex-shrink-0" />
                          {content.points} pts
                        </span>
                        {content.contentType === 'video' && progress?.watchedPercentage && progress.watchedPercentage > 0 && progress.status !== 'completed' && (
                          <span className="text-sm text-blue-600 dark:text-blue-400">
                            {Math.round(progress.watchedPercentage)}% watched
                          </span>
                        )}
                        {content.contentType === 'quiz' && progress?.quizAttempts ? (
                          <span className="text-sm text-purple-600 dark:text-purple-400">
                            {progress.quizAttempts} attempt{progress.quizAttempts > 1 ? 's' : ''}
                            {progress.quizScore !== undefined && ` - ${progress.quizScore}%`}
                          </span>
                        ) : null}
                      </div>
                      {dayContent.isUnlocked && progress?.status !== 'completed' && (
                        <div className="mt-3">
                          {content.contentType === 'video' && (
                            <Button
                              size="sm"
                              onClick={() => openVideoPlayer(content, progress || null)}
                              className="bg-gold-500 hover:bg-gold-600 text-navy-900"
                            >
                              <Play className="h-4 w-4 mr-1" />
                              {progress?.lastPosition ? 'Resume' : 'Watch'}
                            </Button>
                          )}
                          {content.contentType === 'quiz' && (
                            <Button
                              size="sm"
                              onClick={() => openQuiz(content, progress || null)}
                              disabled={!prerequisitesMet}
                              className="bg-purple-500 hover:bg-purple-600 text-white"
                            >
                              <FileQuestion className="h-4 w-4 mr-1" />
                              {!prerequisitesMet ? 'Complete videos first' : progress?.quizAttempts ? 'Retry Quiz' : 'Take Quiz'}
                            </Button>
                          )}
                          {content.contentType === 'resource' && content.resourceUrl && (
                            <Button
                              size="sm"
                              variant="outline"
                              asChild
                            >
                              <a href={content.resourceUrl} target="_blank" rel="noopener noreferrer">
                                <FileText className="h-4 w-4 mr-1" />
                                View Resource
                              </a>
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Video Player Modal */}
      <Dialog open={videoModalOpen} onOpenChange={(open) => !open && closeVideoPlayer()}>
        <DialogContent className="w-[95vw] max-w-4xl p-0 bg-black overflow-hidden">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={closeVideoPlayer}
              className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white"
            >
              <X className="h-4 w-4" />
            </Button>
            {activeVideo && (
              <video
                ref={videoRef}
                src={activeVideo.content.videoUrl}
                controls
                autoPlay
                onTimeUpdate={handleVideoTimeUpdate}
                onEnded={handleVideoEnded}
                className="w-full aspect-video"
                style={{ maxHeight: '70vh' }}
              />
            )}
          </div>
          {activeVideo && (
            <div className="p-3 sm:p-4 bg-navy-900 text-white">
              <h3 className="font-semibold text-sm sm:text-base truncate">{activeVideo.content.title}</h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 line-clamp-2">{activeVideo.content.description}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Quiz Modal */}
      <Dialog open={quizModalOpen} onOpenChange={(open) => {
        if (!open) {
          setQuizModalOpen(false);
          setActiveQuiz(null);
          setQuizAnswers({});
          setQuizResult(null);
        }
      }}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[85vh] overflow-y-auto bg-white dark:bg-navy-800">
          <DialogHeader>
            <DialogTitle className="text-navy-900 dark:text-white text-base sm:text-lg pr-6">
              {activeQuiz?.content.title}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {quizResult
                ? (quizResult.passed ? 'Congratulations!' : 'Keep trying!')
                : `Answer all questions to complete the quiz. ${activeQuiz?.content.quizData?.passingScore || 80}% required to pass.`
              }
            </DialogDescription>
          </DialogHeader>

          {quizResult ? (
            <div className="space-y-4">
              {/* Result Summary */}
              <div className={cn(
                "p-6 rounded-lg text-center",
                quizResult.passed ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"
              )}>
                <div className={cn(
                  "w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center",
                  quizResult.passed ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"
                )}>
                  {quizResult.passed
                    ? <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                    : <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                  }
                </div>
                <p className="text-3xl font-bold mb-1" style={{
                  color: quizResult.passed ? '#16a34a' : '#dc2626'
                }}>
                  {quizResult.score}%
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {quizResult.correctCount} of {quizResult.totalQuestions} correct
                </p>
                {quizResult.passed && quizResult.pointsAwarded > 0 && (
                  <p className="mt-2 text-gold-600 dark:text-gold-400 font-medium">
                    +{quizResult.pointsAwarded} points earned!
                  </p>
                )}
                {!quizResult.passed && quizResult.attemptsRemaining > 0 && (
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {quizResult.attemptsRemaining} attempt{quizResult.attemptsRemaining > 1 ? 's' : ''} remaining
                  </p>
                )}
              </div>

              {/* Question Review */}
              <div className="space-y-3">
                <h4 className="font-medium text-navy-900 dark:text-white">Review Answers</h4>
                {quizResult.results.map((result, idx) => {
                  const question = activeQuiz?.content.quizData?.questions.find(q => q.id === result.questionId);
                  return (
                    <div key={result.questionId} className={cn(
                      "p-3 rounded-lg border",
                      result.correct
                        ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
                        : "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800"
                    )}>
                      <p className="font-medium text-navy-900 dark:text-white text-sm">
                        {idx + 1}. {question?.question}
                      </p>
                      <p className="text-sm mt-1">
                        <span className={result.correct ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                          Your answer: {question?.options[result.userAnswer] || 'No answer'}
                        </span>
                      </p>
                      {!result.correct && (
                        <p className="text-sm text-green-600 dark:text-green-400 mt-0.5">
                          Correct: {question?.options[result.correctAnswer]}
                        </p>
                      )}
                      {result.explanation && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">
                          {result.explanation}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {activeQuiz?.content.quizData?.questions.map((question, qIdx) => (
                <div key={question.id} className="space-y-2 sm:space-y-3">
                  <p className="font-medium text-navy-900 dark:text-white text-sm sm:text-base">
                    {qIdx + 1}. {question.question}
                  </p>
                  <div className="space-y-2">
                    {question.options.map((option, oIdx) => (
                      <button
                        key={oIdx}
                        onClick={() => setQuizAnswers({ ...quizAnswers, [question.id]: oIdx })}
                        className={cn(
                          "w-full p-2.5 sm:p-3 rounded-lg border text-left transition-colors",
                          quizAnswers[question.id] === oIdx
                            ? "bg-gold-100 dark:bg-gold-900/30 border-gold-500 text-navy-900 dark:text-white"
                            : "bg-slate-50 dark:bg-navy-700 border-slate-200 dark:border-navy-600 hover:border-gold-300 dark:hover:border-gold-700"
                        )}
                      >
                        <div className="flex items-start gap-2 sm:gap-3">
                          <span className={cn(
                            "w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium flex-shrink-0 mt-0.5",
                            quizAnswers[question.id] === oIdx
                              ? "bg-gold-500 text-navy-900"
                              : "bg-slate-200 dark:bg-navy-600 text-slate-600 dark:text-slate-400"
                          )}>
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span className="text-xs sm:text-sm">{option}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            {quizResult ? (
              <div className="flex flex-col-reverse sm:flex-row gap-2 w-full sm:w-auto">
                <Button variant="outline" onClick={() => setQuizModalOpen(false)} className="w-full sm:w-auto">
                  Close
                </Button>
                {!quizResult.passed && quizResult.attemptsRemaining > 0 && (
                  <Button
                    onClick={() => {
                      setQuizAnswers({});
                      setQuizResult(null);
                    }}
                    className="bg-gold-500 hover:bg-gold-600 text-navy-900 w-full sm:w-auto"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                )}
              </div>
            ) : (
              <Button
                onClick={handleQuizSubmit}
                disabled={
                  Object.keys(quizAnswers).length !== activeQuiz?.content.quizData?.questions.length ||
                  submitQuizMutation.isPending
                }
                className="bg-gold-500 hover:bg-gold-600 text-navy-900 w-full sm:w-auto"
              >
                {submitQuizMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Submit Quiz
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
