import React, { useMemo, useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
  addDays,
  isToday,
  isBefore,
  isAfter
} from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Video,
  FileQuestion,
  FileText,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { CourseContent, ResetProject } from '@shared/types';

interface ContentCalendarProps {
  project: ResetProject;
  content: CourseContent[];
  onSelectContent: (content: CourseContent) => void;
  onAddContent?: (dayNumber: number) => void;
}

export function ContentCalendar({ project, content, onSelectContent, onAddContent }: ContentCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    // Start at project start date or current month
    return project.startDate ? parseISO(project.startDate) : new Date();
  });

  // Calculate content schedule based on project start date and day numbers
  const contentByDate = useMemo(() => {
    const map = new Map<string, CourseContent[]>();
    const projectStart = parseISO(project.startDate);

    content.forEach(item => {
      // Use scheduledReleaseDate if set, otherwise calculate from dayNumber
      let releaseDate: Date;
      if (item.scheduledReleaseDate) {
        releaseDate = parseISO(item.scheduledReleaseDate);
      } else {
        releaseDate = addDays(projectStart, item.dayNumber - 1);
      }

      const dateKey = format(releaseDate, 'yyyy-MM-dd');
      const existing = map.get(dateKey) || [];
      map.set(dateKey, [...existing, item]);
    });

    return map;
  }, [content, project.startDate]);

  // Generate days for current month view
  const monthDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // Calculate the starting day offset (for grid alignment)
  const startDayOffset = useMemo(() => {
    const firstDay = startOfMonth(currentMonth);
    return firstDay.getDay(); // 0 = Sunday, 6 = Saturday
  }, [currentMonth]);

  const projectStart = parseISO(project.startDate);
  const projectEnd = parseISO(project.endDate);

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-3 h-3" />;
      case 'quiz':
        return <FileQuestion className="w-3 h-3" />;
      case 'resource':
        return <FileText className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (item: CourseContent, releaseDate: Date) => {
    const now = new Date();
    const isReleased = isBefore(releaseDate, now) || isSameDay(releaseDate, now);

    if (item.publishStatus === 'draft') {
      return (
        <Badge variant="outline" className="text-[10px] px-1 py-0 bg-slate-700 text-slate-300">
          Draft
        </Badge>
      );
    }
    if (item.publishStatus === 'scheduled' || !isReleased) {
      return (
        <Badge variant="outline" className="text-[10px] px-1 py-0 bg-amber-900/50 text-amber-400 border-amber-600">
          Scheduled
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-[10px] px-1 py-0 bg-green-900/50 text-green-400 border-green-600">
        Live
      </Badge>
    );
  };

  return (
    <TooltipProvider>
    <div className="bg-slate-900 rounded-lg border border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-amber-500" />
          <h3 className="font-semibold text-white">Content Calendar</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="text-slate-400 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-white font-medium min-w-[140px] text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="text-slate-400 hover:text-white"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-blue-600" />
            <span className="text-slate-400">Video</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-amber-600" />
            <span className="text-slate-400">Quiz</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-600" />
            <span className="text-slate-400">Resource</span>
          </div>
        </div>
      </div>

      {/* Project Date Range Info */}
      <div className="px-4 py-2 bg-slate-800/50 border-b border-slate-700 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2 text-slate-400">
          <Clock className="w-4 h-4" />
          <span>Project: {format(projectStart, 'MMM d')} - {format(projectEnd, 'MMM d, yyyy')}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <span className="text-slate-500">|</span>
          <span>{content.length} content items</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-slate-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for offset */}
          {Array.from({ length: startDayOffset }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[100px] bg-slate-800/30 rounded" />
          ))}

          {/* Actual days */}
          {monthDays.map(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayContent = contentByDate.get(dateKey) || [];
            const isInProject = !isBefore(day, projectStart) && !isAfter(day, projectEnd);
            const isPast = isBefore(day, new Date()) && !isToday(day);
            const dayNumber = Math.floor((day.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;

            return (
              <div
                key={dateKey}
                className={cn(
                  "min-h-[100px] rounded border transition-colors group relative",
                  isToday(day) && "border-amber-500 bg-amber-500/10",
                  !isToday(day) && isInProject && "border-slate-600 bg-slate-800/50 hover:border-slate-500",
                  !isToday(day) && !isInProject && "border-slate-700/50 bg-slate-900/50",
                  isPast && "opacity-60",
                  isInProject && onAddContent && "cursor-pointer"
                )}
                onClick={() => {
                  // Only trigger if clicking on empty space (not on content items)
                  if (isInProject && onAddContent && dayContent.length === 0) {
                    onAddContent(dayNumber);
                  }
                }}
              >
                {/* Day header with add button */}
                <div className={cn(
                  "text-right text-xs p-1 flex items-center justify-between",
                  isToday(day) && "text-amber-400 font-bold",
                  !isToday(day) && isInProject && "text-slate-300",
                  !isInProject && "text-slate-600"
                )}>
                  {/* Add button - visible on hover for project days */}
                  {isInProject && onAddContent && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddContent(dayNumber);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-slate-600"
                      title={`Add content for Day ${dayNumber}`}
                    >
                      <Plus className="w-3 h-3 text-slate-400 hover:text-white" />
                    </button>
                  )}
                  <span className="ml-auto">
                    {format(day, 'd')}
                    {isInProject && (
                      <span className="ml-1 text-slate-500">
                        D{dayNumber}
                      </span>
                    )}
                  </span>
                </div>

                <div className="px-1 space-y-1 overflow-y-auto max-h-[70px]">
                  {dayContent.map(item => (
                    <Tooltip key={item.id}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => onSelectContent(item)}
                          className={cn(
                            "w-full text-left text-[10px] p-1 rounded flex items-center gap-1 truncate transition-colors",
                            item.contentType === 'video' && "bg-blue-600/80 hover:bg-blue-600 text-white",
                            item.contentType === 'quiz' && "bg-amber-600/80 hover:bg-amber-600 text-white",
                            item.contentType === 'resource' && "bg-green-600/80 hover:bg-green-600 text-white",
                            item.publishStatus === 'draft' && "opacity-50"
                          )}
                        >
                          {getContentIcon(item.contentType)}
                          <span className="truncate flex-1">{item.title}</span>
                          {item.publishStatus === 'draft' && (
                            <AlertCircle className="w-3 h-3 text-slate-300" />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <div className="space-y-1">
                          <div className="font-semibold flex items-center gap-2">
                            {getContentIcon(item.contentType)}
                            {item.title}
                          </div>
                          <p className="text-xs text-slate-400">{item.description || 'No description'}</p>
                          <div className="flex items-center gap-2 pt-1">
                            {getStatusBadge(item, day)}
                            <span className="text-xs text-slate-500">Day {item.dayNumber}</span>
                            <span className="text-xs text-slate-500">{item.points} pts</span>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Footer */}
      <div className="px-4 py-3 border-t border-slate-700 bg-slate-800/30">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-slate-400">
                Published: {content.filter(c => c.publishStatus === 'published' || !c.publishStatus).length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span className="text-slate-400">
                Scheduled: {content.filter(c => c.publishStatus === 'scheduled').length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-slate-500" />
              <span className="text-slate-400">
                Draft: {content.filter(c => c.publishStatus === 'draft').length}
              </span>
            </div>
          </div>
          <div className="text-slate-500 text-xs">
            Click on content to edit
          </div>
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
}
