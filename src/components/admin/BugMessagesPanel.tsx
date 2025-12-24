import React, { useState, useRef, useEffect } from 'react';
import { useBugMessages, useAddBugMessage } from '@/hooks/use-queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, MessageCircle, Send, RefreshCw, CheckCircle, Clock, AlertCircle, Bug } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import type { BugMessage } from '@shared/types';

// Get initials for avatar fallback
function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

// System message component (status changes, confirmations)
function SystemMessage({ message }: { message: BugMessage }) {
  const iconMap: Record<string, React.ReactNode> = {
    submitted: <CheckCircle className="h-3.5 w-3.5 text-green-500" />,
    status_change: <Clock className="h-3.5 w-3.5 text-blue-500" />,
    assigned: <AlertCircle className="h-3.5 w-3.5 text-amber-500" />,
    resolved: <CheckCircle className="h-3.5 w-3.5 text-green-500" />,
  };
  const icon = message.systemType ? iconMap[message.systemType] : <Bug className="h-3.5 w-3.5 text-slate-400" />;

  return (
    <div className="flex items-center justify-center gap-2 py-2 my-2">
      <div className="h-px flex-1 bg-slate-200" />
      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full">
        {icon}
        <span className="text-xs text-slate-500">{message.message}</span>
        <span className="text-[10px] text-slate-400">
          {formatDistanceToNow(message.createdAt, { addSuffix: true })}
        </span>
      </div>
      <div className="h-px flex-1 bg-slate-200" />
    </div>
  );
}

// Message bubble component
function MessageBubble({ message }: { message: BugMessage }) {
  // System messages have their own component
  if (message.isSystem) {
    return <SystemMessage message={message} />;
  }

  return (
    <div className={cn('flex gap-3 mb-4', message.isAdmin ? 'flex-row-reverse' : 'flex-row')}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        {message.userAvatarUrl ? (
          <AvatarImage src={message.userAvatarUrl} alt={message.userName} />
        ) : null}
        <AvatarFallback className={cn(
          'text-xs font-bold',
          message.isAdmin ? 'bg-gold-500/20 text-gold-700' : 'bg-slate-200 text-slate-600'
        )}>
          {getInitials(message.userName)}
        </AvatarFallback>
      </Avatar>
      <div className={cn('flex-1 max-w-[80%]', message.isAdmin && 'text-right')}>
        <div className="flex items-center gap-2 mb-1" style={{ justifyContent: message.isAdmin ? 'flex-end' : 'flex-start' }}>
          <span className="text-xs font-medium text-slate-700">{message.userName}</span>
          {message.isAdmin && (
            <Badge variant="outline" className="text-[10px] px-1 py-0 text-gold-600 border-gold-300">
              Admin
            </Badge>
          )}
          <span className="text-[10px] text-slate-400">
            {formatDistanceToNow(message.createdAt, { addSuffix: true })}
          </span>
        </div>
        <div className={cn(
          'inline-block p-3 rounded-lg text-sm',
          message.isAdmin
            ? 'bg-gold-100 text-slate-800 rounded-tr-none'
            : 'bg-slate-100 text-slate-700 rounded-tl-none'
        )}>
          {message.message}
        </div>
      </div>
    </div>
  );
}

interface BugMessagesPanelProps {
  bugId: string;
  bugUserId: string;
  bugUserName: string;
}

export function BugMessagesPanel({ bugId, bugUserId, bugUserName }: BugMessagesPanelProps) {
  const { data: messages, isLoading, refetch, isRefetching } = useBugMessages(bugId);
  const addMessage = useAddBugMessage();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Messages with {bugUserName}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
          >
            <RefreshCw className={cn('h-3 w-3', isRefetching && 'animate-spin')} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Messages List */}
        <ScrollArea className="h-[200px] pr-4 scrollbar-hide">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-5 w-5 animate-spin text-gold-500" />
            </div>
          ) : (messages?.length || 0) === 0 ? (
            <div className="text-center py-6 text-slate-400 text-sm">
              <MessageCircle className="h-6 w-6 mx-auto mb-2 opacity-50" />
              <p>No messages yet</p>
              <p className="text-xs mt-1">Send a message to start a conversation</p>
            </div>
          ) : (
            <>
              {messages?.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </ScrollArea>

        {/* Message Input */}
        <div className="flex gap-2">
          <Textarea
            placeholder="Type a message to the user..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 resize-none h-10 min-h-[40px] py-2 scrollbar-hide"
            rows={1}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || addMessage.isPending}
            className="bg-gold-500 hover:bg-gold-600 text-white"
          >
            {addMessage.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-slate-400">
          The user will receive a notification when you send a message.
        </p>
      </CardContent>
    </Card>
  );
}
