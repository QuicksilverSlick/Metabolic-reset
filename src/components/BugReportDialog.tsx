'use client';

import { useState } from 'react';
import { Bug, AlertCircle, Image, Video, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSubmitBugReport } from '@/hooks/use-queries';
import type { BugSeverity, BugCategory } from '@shared/types';

interface BugReportDialogProps {
  trigger?: React.ReactNode;
}

export function BugReportDialog({ trigger }: BugReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<BugSeverity>('medium');
  const [category, setCategory] = useState<BugCategory>('other');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  const submitBug = useSubmitBugReport();

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSeverity('medium');
    setCategory('other');
    setScreenshotUrl('');
    setVideoUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await submitBug.mutateAsync({
      title,
      description,
      severity,
      category,
      screenshotUrl: screenshotUrl || undefined,
      videoUrl: videoUrl || undefined,
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
    });

    resetForm();
    setOpen(false);
  };

  const isValid = title.trim().length > 0 && description.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            size="icon"
            className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full bg-navy-800/90 text-gold hover:bg-navy-700 hover:text-gold-400 shadow-lg border border-navy-600"
            title="Report a Bug"
          >
            <Bug className="h-5 w-5" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-navy-900 border-navy-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Bug className="h-5 w-5 text-gold" />
            Report a Bug
          </DialogTitle>
          <DialogDescription className="text-navy-300">
            Help us improve by reporting issues you encounter. Include as much detail as possible.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white">
              Title <span className="text-red-400">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Brief description of the issue"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-navy-800 border-navy-600 text-white placeholder:text-navy-400"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">
              Description <span className="text-red-400">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="What happened? What did you expect to happen? Steps to reproduce..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="bg-navy-800 border-navy-600 text-white placeholder:text-navy-400"
            />
          </div>

          {/* Severity and Category row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Severity */}
            <div className="space-y-2">
              <Label className="text-white">Severity</Label>
              <Select value={severity} onValueChange={(v) => setSeverity(v as BugSeverity)}>
                <SelectTrigger className="bg-navy-800 border-navy-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-navy-800 border-navy-600">
                  <SelectItem value="low" className="text-green-400">Low - Minor issue</SelectItem>
                  <SelectItem value="medium" className="text-yellow-400">Medium - Noticeable issue</SelectItem>
                  <SelectItem value="high" className="text-orange-400">High - Major issue</SelectItem>
                  <SelectItem value="critical" className="text-red-400">Critical - App broken</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label className="text-white">Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as BugCategory)}>
                <SelectTrigger className="bg-navy-800 border-navy-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-navy-800 border-navy-600">
                  <SelectItem value="ui">UI / Visual</SelectItem>
                  <SelectItem value="functionality">Functionality</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="data">Data / Sync</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Screenshot URL */}
          <div className="space-y-2">
            <Label htmlFor="screenshot" className="text-white flex items-center gap-2">
              <Image className="h-4 w-4 text-navy-400" />
              Screenshot URL (optional)
            </Label>
            <Input
              id="screenshot"
              placeholder="https://imgur.com/... or other image link"
              value={screenshotUrl}
              onChange={(e) => setScreenshotUrl(e.target.value)}
              className="bg-navy-800 border-navy-600 text-white placeholder:text-navy-400"
            />
            <p className="text-xs text-navy-400">
              Upload your screenshot to Imgur, Dropbox, or Google Drive and paste the link here
            </p>
          </div>

          {/* Video URL */}
          <div className="space-y-2">
            <Label htmlFor="video" className="text-white flex items-center gap-2">
              <Video className="h-4 w-4 text-navy-400" />
              Video URL (optional)
            </Label>
            <Input
              id="video"
              placeholder="https://loom.com/... or https://zoom.us/..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="bg-navy-800 border-navy-600 text-white placeholder:text-navy-400"
            />
            <p className="text-xs text-navy-400">
              Record with Loom, Zoom, or similar and paste the share link here
            </p>
          </div>

          {/* Info note */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-navy-800/50 border border-navy-700">
            <AlertCircle className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
            <p className="text-xs text-navy-300">
              Your current page URL and browser info will be automatically included to help us debug.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-navy-600 text-navy-300 hover:bg-navy-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || submitBug.isPending}
              className="bg-gold hover:bg-gold-600 text-navy-900"
            >
              {submitBug.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Report'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
