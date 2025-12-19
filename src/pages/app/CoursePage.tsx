import React, { useState, useRef, useEffect } from 'react';
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
import { cn } from '@/lib/utils';
import { CourseContent, UserProgress, QuizQuestion, QuizResultResponse } from '@shared/types';

export function CoursePage() {
  const { data: overviewData, isLoading: overviewLoading } = useCourseOverview();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const { data: dayContent, isLoading: dayContentLoading } = useDayContent(selectedDay);

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

  // Auto-select current day on load
  useEffect(() => {
    if (overviewData?.overview && !selectedDay) {
      setSelectedDay(overviewData.overview.currentDay);
    }
  }, [overviewData, selectedDay]);

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

      {/* Day Selector */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedDay(Math.max(1, (selectedDay || 1) - 1))}
          disabled={selectedDay === 1}
          className="border-slate-200 dark:border-navy-600"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Prev
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500 dark:text-slate-400">Day</span>
          <div className="flex gap-1 overflow-x-auto max-w-[200px] sm:max-w-none">
            {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={cn(
                  "w-8 h-8 rounded-full text-sm font-medium transition-colors flex-shrink-0",
                  selectedDay === day
                    ? "bg-gold-500 text-navy-900"
                    : day <= overview.currentDay
                    ? "bg-slate-100 dark:bg-navy-700 text-navy-900 dark:text-white hover:bg-gold-100 dark:hover:bg-gold-900/30"
                    : "bg-slate-100 dark:bg-navy-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                )}
                disabled={day > overview.currentDay}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedDay(Math.min(28, (selectedDay || 1) + 1))}
          disabled={selectedDay === 28 || (selectedDay || 1) >= overview.currentDay}
          className="border-slate-200 dark:border-navy-600"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
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
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "p-3 rounded-lg",
                      content.contentType === 'video' && "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
                      content.contentType === 'quiz' && "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
                      content.contentType === 'resource' && "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                    )}>
                      {getTypeIcon(content.contentType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-medium text-navy-900 dark:text-white">{content.title}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            {content.description}
                          </p>
                        </div>
                        {getStatusBadge(progress?.status, dayContent.isUnlocked)}
                      </div>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="text-sm text-gold-600 dark:text-gold-400 flex items-center gap-1">
                          <Award className="h-4 w-4" />
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
        <DialogContent className="max-w-4xl p-0 bg-black overflow-hidden">
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
                style={{ maxHeight: '80vh' }}
              />
            )}
          </div>
          {activeVideo && (
            <div className="p-4 bg-navy-900 text-white">
              <h3 className="font-semibold">{activeVideo.content.title}</h3>
              <p className="text-sm text-slate-400 mt-1">{activeVideo.content.description}</p>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-navy-800">
          <DialogHeader>
            <DialogTitle className="text-navy-900 dark:text-white">
              {activeQuiz?.content.title}
            </DialogTitle>
            <DialogDescription>
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
            <div className="space-y-6">
              {activeQuiz?.content.quizData?.questions.map((question, qIdx) => (
                <div key={question.id} className="space-y-3">
                  <p className="font-medium text-navy-900 dark:text-white">
                    {qIdx + 1}. {question.question}
                  </p>
                  <div className="space-y-2">
                    {question.options.map((option, oIdx) => (
                      <button
                        key={oIdx}
                        onClick={() => setQuizAnswers({ ...quizAnswers, [question.id]: oIdx })}
                        className={cn(
                          "w-full p-3 rounded-lg border text-left transition-colors",
                          quizAnswers[question.id] === oIdx
                            ? "bg-gold-100 dark:bg-gold-900/30 border-gold-500 text-navy-900 dark:text-white"
                            : "bg-slate-50 dark:bg-navy-700 border-slate-200 dark:border-navy-600 hover:border-gold-300 dark:hover:border-gold-700"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium",
                            quizAnswers[question.id] === oIdx
                              ? "bg-gold-500 text-navy-900"
                              : "bg-slate-200 dark:bg-navy-600 text-slate-600 dark:text-slate-400"
                          )}>
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span className="text-sm">{option}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <DialogFooter>
            {quizResult ? (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setQuizModalOpen(false)}>
                  Close
                </Button>
                {!quizResult.passed && quizResult.attemptsRemaining > 0 && (
                  <Button
                    onClick={() => {
                      setQuizAnswers({});
                      setQuizResult(null);
                    }}
                    className="bg-gold-500 hover:bg-gold-600 text-navy-900"
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
                className="bg-gold-500 hover:bg-gold-600 text-navy-900"
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
