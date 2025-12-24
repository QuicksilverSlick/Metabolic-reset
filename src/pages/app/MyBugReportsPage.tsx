import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMyBugReports, useBugWithMessages, useAddBugMessage, useSubmitBugSatisfaction } from '@/hooks/use-queries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Bug, MessageCircle, ChevronLeft, Send, ThumbsUp, ThumbsDown, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { BugReport, BugMessage, BugStatus, BugSeverity } from '@shared/types';

// Status badge styles
const statusConfig: Record<BugStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
  open: { label: 'Open', variant: 'destructive', icon: <AlertCircle className="h-3 w-3" /> },
  in_progress: { label: 'In Progress', variant: 'default', icon: <Clock className="h-3 w-3" /> },
  resolved: { label: 'Resolved', variant: 'secondary', icon: <CheckCircle className="h-3 w-3" /> },
  closed: { label: 'Closed', variant: 'outline', icon: <XCircle className="h-3 w-3" /> },
};

const severityColors: Record<BugSeverity, string> = {
  low: 'bg-green-500/20 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
};

// Bug list item component
function BugListItem({ bug, onClick, isSelected }: { bug: BugReport; onClick: () => void; isSelected: boolean }) {
  const status = statusConfig[bug.status];

  return (
    <div
      onClick={onClick}
      className={cn(
        'p-4 border-b border-slate-700 cursor-pointer transition-colors hover:bg-slate-800/50',
        isSelected && 'bg-slate-800 border-l-2 border-l-gold-500'
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-medium text-white text-sm line-clamp-1">{bug.title}</h3>
        <Badge variant={status.variant} className="flex-shrink-0 text-xs">
          {status.icon}
          <span className="ml-1">{status.label}</span>
        </Badge>
      </div>
      <p className="text-xs text-slate-400 line-clamp-2 mb-2">{bug.description}</p>
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Badge variant="outline" className={cn('text-[10px]', severityColors[bug.severity])}>
          {bug.severity}
        </Badge>
        <span>{formatDistanceToNow(bug.createdAt, { addSuffix: true })}</span>
      </div>
    </div>
  );
}

// System message component (status changes, confirmations)
function SystemMessage({ message }: { message: BugMessage }) {
  const iconMap: Record<string, React.ReactNode> = {
    submitted: <CheckCircle className="h-3.5 w-3.5 text-green-400" />,
    status_change: <Clock className="h-3.5 w-3.5 text-blue-400" />,
    assigned: <AlertCircle className="h-3.5 w-3.5 text-amber-400" />,
    resolved: <CheckCircle className="h-3.5 w-3.5 text-green-400" />,
  };
  const icon = message.systemType ? iconMap[message.systemType] : <Bug className="h-3.5 w-3.5 text-slate-400" />;

  return (
    <div className="flex items-center justify-center gap-2 py-3 my-2">
      <div className="h-px flex-1 bg-slate-700" />
      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/60 border border-slate-700 rounded-full">
        {icon}
        <span className="text-xs text-slate-400">{message.message}</span>
        <span className="text-[10px] text-slate-500">
          {formatDistanceToNow(message.createdAt, { addSuffix: true })}
        </span>
      </div>
      <div className="h-px flex-1 bg-slate-700" />
    </div>
  );
}

// Message bubble component
function MessageBubble({ message, isOwn }: { message: BugMessage; isOwn: boolean }) {
  // System messages have their own component
  if (message.isSystem) {
    return <SystemMessage message={message} />;
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className={cn('flex gap-3 mb-4', isOwn ? 'flex-row-reverse' : 'flex-row')}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        {message.userAvatarUrl ? (
          <AvatarImage src={message.userAvatarUrl} alt={message.userName} />
        ) : null}
        <AvatarFallback className={cn(
          'text-xs font-bold',
          message.isAdmin ? 'bg-gold-500/20 text-gold-400' : 'bg-slate-700 text-slate-300'
        )}>
          {getInitials(message.userName)}
        </AvatarFallback>
      </Avatar>
      <div className={cn('flex-1 max-w-[80%]', isOwn && 'text-right')}>
        <div className="flex items-center gap-2 mb-1" style={{ justifyContent: isOwn ? 'flex-end' : 'flex-start' }}>
          <span className="text-xs font-medium text-slate-300">{message.userName}</span>
          {message.isAdmin && (
            <Badge variant="outline" className="text-[10px] px-1 py-0 text-gold-400 border-gold-500/30">
              Admin
            </Badge>
          )}
          <span className="text-[10px] text-slate-500">
            {formatDistanceToNow(message.createdAt, { addSuffix: true })}
          </span>
        </div>
        <div className={cn(
          'inline-block p-3 rounded-lg text-sm',
          isOwn
            ? 'bg-gold-500/20 text-white rounded-tr-none'
            : 'bg-slate-700 text-slate-200 rounded-tl-none'
        )}>
          {message.message}
        </div>
      </div>
    </div>
  );
}

// Satisfaction prompt component
function SatisfactionPrompt({ bugId, onSubmit }: { bugId: string; onSubmit: () => void }) {
  const [feedback, setFeedback] = useState('');
  const submitSatisfaction = useSubmitBugSatisfaction();

  const handleSubmit = (rating: 'positive' | 'negative') => {
    submitSatisfaction.mutate({
      bugId,
      rating,
      feedback: feedback.trim() || undefined,
    }, {
      onSuccess: onSubmit,
    });
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardContent className="p-4">
        <h4 className="text-sm font-medium text-white mb-2">How was your experience?</h4>
        <p className="text-xs text-slate-400 mb-4">
          Your feedback helps us improve our support.
        </p>
        <div className="flex gap-3 mb-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSubmit('positive')}
            disabled={submitSatisfaction.isPending}
            className="flex-1 border-green-500/30 text-green-400 hover:bg-green-500/20"
          >
            <ThumbsUp className="h-4 w-4 mr-2" />
            Helpful
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSubmit('negative')}
            disabled={submitSatisfaction.isPending}
            className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/20"
          >
            <ThumbsDown className="h-4 w-4 mr-2" />
            Not Helpful
          </Button>
        </div>
        <Textarea
          placeholder="Additional feedback (optional)..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 text-sm h-16 resize-none"
        />
      </CardContent>
    </Card>
  );
}

// Bug detail view with conversation
function BugDetailView({ bugId, onBack }: { bugId: string; onBack: () => void }) {
  const { data, isLoading } = useBugWithMessages(bugId);
  const addMessage = useAddBugMessage();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showSatisfaction, setShowSatisfaction] = useState(true);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [data?.messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    addMessage.mutate({ bugId, message: newMessage.trim() }, {
      onSuccess: () => setNewMessage(''),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-gold-500" />
      </div>
    );
  }

  const { bug, messages, satisfaction } = data;
  const status = statusConfig[bug.status];
  const canMessage = bug.status !== 'closed';
  const showSatisfactionPrompt = (bug.status === 'resolved' || bug.status === 'closed') && !satisfaction && showSatisfaction;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="mb-3 -ml-2 text-slate-400 hover:text-white"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to list
        </Button>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h2 className="font-semibold text-white text-lg">{bug.title}</h2>
            <p className="text-sm text-slate-400 mt-1">{bug.description}</p>
          </div>
          <Badge variant={status.variant} className="flex-shrink-0">
            {status.icon}
            <span className="ml-1">{status.label}</span>
          </Badge>
        </div>
        <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
          <Badge variant="outline" className={cn('text-xs', severityColors[bug.severity])}>
            {bug.severity}
          </Badge>
          <span>Submitted {format(bug.createdAt, 'MMM d, yyyy')}</span>
          {bug.screenshotUrl && (
            <a
              href={bug.screenshotUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-400 hover:underline"
            >
              View Screenshot
            </a>
          )}
          {bug.videoUrl && (
            <a
              href={bug.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-400 hover:underline"
            >
              View Video
            </a>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No messages yet</p>
            <p className="text-xs mt-1">Start a conversation with the support team</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={!message.isAdmin}
            />
          ))
        )}
        <div ref={messagesEndRef} />

        {/* Satisfaction survey */}
        {showSatisfactionPrompt && (
          <div className="mt-4">
            <SatisfactionPrompt bugId={bugId} onSubmit={() => setShowSatisfaction(false)} />
          </div>
        )}

        {/* Show submitted satisfaction */}
        {satisfaction && (
          <div className="mt-4 p-3 rounded-lg bg-slate-800/50 border border-slate-700 text-center">
            <span className="text-2xl mr-2">{satisfaction.rating === 'positive' ? '👍' : '👎'}</span>
            <span className="text-sm text-slate-400">
              You rated this resolution as {satisfaction.rating}
            </span>
            {satisfaction.feedback && (
              <p className="text-xs text-slate-500 mt-1">"{satisfaction.feedback}"</p>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Message input */}
      {canMessage && (
        <div className="p-4 border-t border-slate-700 flex-shrink-0">
          <div className="flex gap-2">
            <Textarea
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 resize-none h-10 min-h-[40px] py-2"
              rows={1}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || addMessage.isPending}
              className="bg-gold-500 hover:bg-gold-600 text-navy-900"
            >
              {addMessage.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Closed status message */}
      {!canMessage && (
        <div className="p-4 border-t border-slate-700 text-center text-sm text-slate-500">
          This bug report is closed and no longer accepts messages.
        </div>
      )}
    </div>
  );
}

export function MyBugReportsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: bugs, isLoading } = useMyBugReports();
  const [selectedBugId, setSelectedBugId] = useState<string | null>(null);

  // Handle deep linking from notifications via ?bugId= query param
  useEffect(() => {
    const bugIdFromUrl = searchParams.get('bugId');
    if (bugIdFromUrl && bugs && bugs.length > 0) {
      // Verify the bug exists in the user's list
      const bugExists = bugs.some(bug => bug.id === bugIdFromUrl);
      if (bugExists) {
        setSelectedBugId(bugIdFromUrl);
        // Clear the query param after navigating to avoid confusion on refresh
        setSearchParams({}, { replace: true });
      }
    }
  }, [searchParams, bugs, setSearchParams]);

  // Handle bug selection (also clear query params if present)
  const handleSelectBug = (bugId: string) => {
    setSelectedBugId(bugId);
    // Clear any existing query params
    if (searchParams.has('bugId')) {
      setSearchParams({}, { replace: true });
    }
  };

  // Handle back navigation
  const handleBack = () => {
    setSelectedBugId(null);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
      </div>
    );
  }

  const sortedBugs = [...(bugs || [])].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader className="border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Bug className="h-6 w-6 text-gold-500" />
            <div>
              <CardTitle className="text-white">My Bug Reports</CardTitle>
              <CardDescription>
                View and manage your submitted bug reports
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {sortedBugs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <Bug className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-lg font-medium">No bug reports yet</p>
              <p className="text-sm mt-1">
                Use the bug icon in the bottom-right corner to report issues
              </p>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row min-h-[500px]">
              {/* Bug list - mobile: full width when no selection, desktop: sidebar */}
              <div className={cn(
                'md:w-80 md:border-r border-slate-800 flex-shrink-0',
                selectedBugId ? 'hidden md:block' : 'block'
              )}>
                <ScrollArea className="h-[500px]">
                  {sortedBugs.map((bug) => (
                    <BugListItem
                      key={bug.id}
                      bug={bug}
                      onClick={() => handleSelectBug(bug.id)}
                      isSelected={selectedBugId === bug.id}
                    />
                  ))}
                </ScrollArea>
              </div>

              {/* Bug detail view */}
              <div className={cn(
                'flex-1',
                !selectedBugId ? 'hidden md:flex items-center justify-center text-slate-500' : 'block'
              )}>
                {selectedBugId ? (
                  <BugDetailView
                    bugId={selectedBugId}
                    onBack={handleBack}
                  />
                ) : (
                  <div className="text-center">
                    <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Select a bug report to view details</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
