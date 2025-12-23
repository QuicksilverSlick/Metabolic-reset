import React from 'react';
import {
  Sparkles,
  Brain,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Lightbulb,
  ChevronDown,
  ChevronRight,
  Play,
  Image as ImageIcon,
  Video,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useBugAIAnalysis, useAnalyzeBug } from '@/hooks/use-queries';
import type { BugAIAnalysis, BugSolution, AIAnalysisConfidence, DocReference } from '@shared/types';

interface BugAIAnalysisPanelProps {
  bugId: string;
  hasScreenshot: boolean;
  hasVideo: boolean;
}

const confidenceBadgeStyles: Record<AIAnalysisConfidence, string> = {
  low: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  high: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

const effortBadgeStyles: Record<string, string> = {
  quick: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  moderate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  significant: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

function SolutionCard({ solution, index }: { solution: BugSolution; index: number }) {
  const [isOpen, setIsOpen] = React.useState(index === 0);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="bg-slate-50 dark:bg-navy-800/50 border-slate-200 dark:border-navy-700">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="py-3 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gold-100 dark:bg-gold-900/30 text-gold-600 dark:text-gold-400 text-sm font-medium">
                  {index + 1}
                </span>
                <CardTitle className="text-sm font-medium">{solution.title}</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={effortBadgeStyles[solution.estimatedEffort] || ''}>
                  {solution.estimatedEffort}
                </Badge>
                <Badge className={confidenceBadgeStyles[solution.confidence]}>
                  {solution.confidence}
                </Badge>
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 pb-4 px-4">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              {solution.description}
            </p>
            {solution.steps.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Steps
                </p>
                <ol className="list-decimal list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300">
                  {solution.steps.map((step, i) => (
                    <li key={i} className="pl-1">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

export function BugAIAnalysisPanel({
  bugId,
  hasScreenshot,
  hasVideo,
}: BugAIAnalysisPanelProps) {
  const { data: analysisData, isLoading } = useBugAIAnalysis(bugId);
  const analyzeMutation = useAnalyzeBug();

  const analysis = analysisData?.analysis;

  // Log analysis data for debugging
  console.log('=== BugAIAnalysisPanel ===');
  console.log('Bug ID:', bugId);
  console.log('isLoading:', isLoading);
  console.log('analysisData:', analysisData);
  console.log('analysis:', analysis);
  if (analysis) {
    console.log('Analysis details:', {
      id: analysis.id,
      status: analysis.status,
      summary: analysis.summary?.slice(0, 100),
      error: analysis.error,
      confidence: analysis.confidence,
      modelUsed: analysis.modelUsed,
      processingTimeMs: analysis.processingTimeMs,
      hasSolutions: !!analysis.suggestedSolutions?.length,
      hasRelatedDocs: !!analysis.relatedDocs?.length,
    });
  }
  console.log('========================');

  const handleAnalyze = () => {
    console.log('=== Triggering AI Analysis ===');
    console.log('Bug ID:', bugId);
    console.log('Options:', { includeScreenshot: hasScreenshot, includeVideo: hasVideo });

    analyzeMutation.mutate({
      bugId,
      options: {
        includeScreenshot: hasScreenshot,
        includeVideo: hasVideo,
      },
    }, {
      onSuccess: (data) => {
        console.log('=== AI Analysis SUCCESS ===');
        console.log('Response data:', data);
        console.log('Analysis:', data?.analysis);
        if (data?.analysis) {
          console.log('Analysis details:', {
            id: data.analysis.id,
            status: data.analysis.status,
            summary: data.analysis.summary?.slice(0, 100),
            suggestedCause: data.analysis.suggestedCause?.slice(0, 100),
            error: data.analysis.error,
            confidence: data.analysis.confidence,
            modelUsed: data.analysis.modelUsed,
            processingTimeMs: data.analysis.processingTimeMs,
          });
        }
        console.log('===========================');
      },
      onError: (error) => {
        console.error('=== AI Analysis ERROR ===');
        console.error('Error:', error);
        console.error('=========================');
      },
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
        <CardContent className="py-6">
          <div className="flex items-center justify-center gap-2 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading analysis...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No analysis yet
  if (!analysis) {
    return (
      <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-gold-500" />
            <CardTitle className="text-base">AI Analysis</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Use AI to analyze this bug report and get suggested solutions. The analysis
            will examine the bug description
            {hasScreenshot && ', screenshot'}
            {hasVideo && ', and video recording'}
            {' '}to provide actionable recommendations.
          </p>
          <Button
            onClick={handleAnalyze}
            disabled={analyzeMutation.isPending}
            className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white"
          >
            {analyzeMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Analyze with AI
              </>
            )}
          </Button>
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <ImageIcon className="h-3 w-3" />
              <span>Screenshot: {hasScreenshot ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Video className="h-3 w-3" />
              <span>Video: {hasVideo ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Analysis failed
  if (analysis.status === 'failed') {
    return (
      <Card className="bg-white dark:bg-navy-900 border-red-200 dark:border-red-800">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <CardTitle className="text-base text-red-600 dark:text-red-400">
              Analysis Failed
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <p className="text-sm text-red-600 dark:text-red-400 mb-4">
            {analysis.error || 'An unknown error occurred during analysis.'}
          </p>
          <Button
            onClick={handleAnalyze}
            disabled={analyzeMutation.isPending}
            variant="outline"
            className="w-full border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            {analyzeMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Retry Analysis
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Analysis in progress
  if (analysis.status === 'processing' || analysis.status === 'pending') {
    return (
      <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
        <CardContent className="py-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="relative">
              <Brain className="h-8 w-8 text-gold-500" />
              <Loader2 className="h-4 w-4 animate-spin text-gold-600 absolute -bottom-1 -right-1" />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              AI is analyzing this bug report...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Completed analysis
  return (
    <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <CardTitle className="text-base">AI Analysis</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={confidenceBadgeStyles[analysis.confidence]}>
              {analysis.confidence} confidence
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {(analysis.processingTimeMs / 1000).toFixed(1)}s
            </Badge>
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Model: {analysis.modelUsed}
        </p>
      </CardHeader>
      <CardContent className="pt-2 space-y-4">
        {/* Summary */}
        <div>
          <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-1">
            Summary
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {analysis.summary}
          </p>
        </div>

        {/* Suggested Cause */}
        <div>
          <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-1">
            Likely Cause
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {analysis.suggestedCause}
          </p>
        </div>

        {/* Screenshot Analysis */}
        {analysis.screenshotAnalysis && (
          <div>
            <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Screenshot Analysis
            </h4>
            <div className="bg-slate-50 dark:bg-navy-800/50 rounded-lg p-3 text-sm space-y-2">
              <p className="text-slate-600 dark:text-slate-400">
                {analysis.screenshotAnalysis.description}
              </p>
              {analysis.screenshotAnalysis.visibleErrors.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-red-600 dark:text-red-400">
                    Visible Errors:
                  </span>
                  <ul className="list-disc list-inside text-red-600 dark:text-red-400">
                    {analysis.screenshotAnalysis.visibleErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
              {analysis.screenshotAnalysis.potentialIssues.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                    Potential Issues:
                  </span>
                  <ul className="list-disc list-inside text-orange-600 dark:text-orange-400">
                    {analysis.screenshotAnalysis.potentialIssues.map((issue, i) => (
                      <li key={i}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Video Analysis */}
        {analysis.videoAnalysis && (
          <div>
            <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Video className="h-4 w-4" />
              Video Analysis
            </h4>
            <div className="bg-slate-50 dark:bg-navy-800/50 rounded-lg p-3 text-sm space-y-2">
              <p className="text-slate-600 dark:text-slate-400">
                {analysis.videoAnalysis.description}
              </p>
              {analysis.videoAnalysis.reproductionSteps.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Reproduction Steps:
                  </span>
                  <ol className="list-decimal list-inside text-slate-600 dark:text-slate-400">
                    {analysis.videoAnalysis.reproductionSteps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}
              {analysis.videoAnalysis.errorMoments.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-red-600 dark:text-red-400">
                    Error Moments:
                  </span>
                  <ul className="list-disc list-inside text-red-600 dark:text-red-400">
                    {analysis.videoAnalysis.errorMoments.map((moment, i) => (
                      <li key={i}>
                        [{moment.seconds}s] {moment.description}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Suggested Solutions */}
        {analysis.suggestedSolutions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-gold-500" />
              Suggested Solutions
            </h4>
            <div className="space-y-2">
              {analysis.suggestedSolutions.map((solution, index) => (
                <SolutionCard key={index} solution={solution} index={index} />
              ))}
            </div>
          </div>
        )}

        {/* Related Documentation */}
        {analysis.relatedDocs && analysis.relatedDocs.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              Related Documentation
            </h4>
            <div className="space-y-2">
              {analysis.relatedDocs.map((doc: DocReference, index: number) => (
                <div
                  key={index}
                  className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-100 dark:border-blue-800"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                          {doc.sectionTitle}
                        </span>
                        <span className="text-blue-300 dark:text-blue-600">›</span>
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {doc.articleTitle}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {doc.relevance}
                      </p>
                      {doc.excerpt && (
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-2 italic line-clamp-2">
                          {doc.excerpt}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 h-8 px-2"
                      onClick={() => {
                        // Open docs in a new tab with section and article as URL params
                        const url = `/app/admin?tab=docs&section=${encodeURIComponent(doc.sectionId)}&article=${encodeURIComponent(doc.articleId)}`;
                        window.open(url, '_blank');
                        console.log('[BugAIAnalysisPanel] Opening doc in new tab:', doc.sectionId, doc.articleId);
                      }}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Re-analyze Button */}
        <Button
          onClick={handleAnalyze}
          disabled={analyzeMutation.isPending}
          variant="outline"
          size="sm"
          className="w-full mt-4"
        >
          {analyzeMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Re-analyzing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Re-analyze
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
