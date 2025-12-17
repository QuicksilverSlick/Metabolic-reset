'use client';

// Bug report dialog - uses FloatingBugCapture for screen recording/screenshots
import React, { useState } from 'react';
import { Bug, AlertCircle, Image, Video, Loader2, Camera, X, Upload, Check } from 'lucide-react';
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
import { useAuthStore } from '@/lib/auth-store';
import { uploadApi } from '@/lib/api';
import { useBugReportStore } from '@/lib/bug-report-store';
import type { BugSeverity, BugCategory } from '@shared/types';

interface BugReportDialogProps {
  trigger?: React.ReactNode;
}

// Declare the global capture functions type
declare global {
  interface Window {
    __bugCapture?: {
      captureScreenshot: () => Promise<void>;
      startRecording: () => Promise<void>;
      stopRecording: () => void;
    };
  }
}

export function BugReportDialog({ trigger }: BugReportDialogProps) {
  const userId = useAuthStore(s => s.userId);
  const store = useBugReportStore();

  // Local upload progress state
  const [uploadProgress, setUploadProgress] = useState<{ screenshot?: boolean; video?: boolean }>({});

  const submitBug = useSubmitBugReport();

  // Handle dialog open state from store
  const handleOpenChange = (open: boolean) => {
    if (open) {
      store.setDialogOpen(true);
      store.setMinimized(false);
    } else {
      // Only truly close if not in capture mode
      if (store.captureMode === 'idle') {
        store.setDialogOpen(false);
      } else {
        // Minimize instead of close during capture
        store.setMinimized(true);
        store.setDialogOpen(false);
      }
    }
  };

  // Trigger screenshot capture via global handler
  const handleCaptureScreenshot = () => {
    store.setDialogOpen(false);
    // Small delay to let dialog close
    setTimeout(() => {
      window.__bugCapture?.captureScreenshot();
    }, 200);
  };

  // Trigger screen recording via global handler
  const handleStartRecording = () => {
    window.__bugCapture?.startRecording();
  };

  // Remove captured media
  const removeScreenshot = () => {
    if (store.media.screenshotPreview) URL.revokeObjectURL(store.media.screenshotPreview);
    store.setScreenshot(null, null);
    store.setUploadedUrl('screenshot', undefined);
  };

  const removeVideo = () => {
    if (store.media.videoPreview) URL.revokeObjectURL(store.media.videoPreview);
    store.setVideo(null, null);
    store.setUploadedUrl('video', undefined);
  };

  // Upload media to R2
  const uploadMedia = async (blob: Blob, type: 'screenshot' | 'video'): Promise<string | null> => {
    if (!userId) return null;

    try {
      setUploadProgress(prev => ({ ...prev, [type]: true }));

      const filename = type === 'screenshot' ? 'screenshot.png' : 'recording.webm';
      const contentType = type === 'screenshot' ? 'image/png' : 'video/webm';

      // Get presigned URL
      const { key } = await uploadApi.getPresignedUrl(userId, filename, contentType, blob.size);

      // Upload the file
      const result = await uploadApi.uploadFile(userId, key, blob, contentType);

      store.setUploadedUrl(type, result.publicUrl);
      return result.publicUrl;
    } catch (error) {
      console.error(`Failed to upload ${type}:`, error);
      return null;
    } finally {
      setUploadProgress(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Upload any captured media first
    let screenshotUrl = store.uploadedUrls.screenshot;
    let videoUrl = store.uploadedUrls.video;

    if (store.media.screenshot && !screenshotUrl) {
      screenshotUrl = await uploadMedia(store.media.screenshot, 'screenshot') || undefined;
    }

    if (store.media.video && !videoUrl) {
      videoUrl = await uploadMedia(store.media.video, 'video') || undefined;
    }

    await submitBug.mutateAsync({
      title: store.title,
      description: store.description,
      severity: store.severity,
      category: store.category,
      screenshotUrl: screenshotUrl || undefined,
      videoUrl: videoUrl || undefined,
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
    });

    store.reset();
  };

  const isValid = store.title.trim().length > 0 && store.description.trim().length > 0;
  const isUploading = uploadProgress.screenshot || uploadProgress.video;

  // Check if screen recording is supported
  const isScreenRecordingSupported = typeof navigator !== 'undefined' &&
    'mediaDevices' in navigator &&
    'getDisplayMedia' in navigator.mediaDevices;

  return (
    <Dialog open={store.isDialogOpen} onOpenChange={handleOpenChange}>
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
      <DialogContent className="sm:max-w-[550px] bg-navy-900 border-navy-700 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Bug className="h-5 w-5 text-gold" />
            Report a Bug
          </DialogTitle>
          <DialogDescription className="text-navy-300">
            Help us improve by reporting issues you encounter. You can capture a screenshot or record your screen.
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
              value={store.title}
              onChange={(e) => store.setTitle(e.target.value)}
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
              value={store.description}
              onChange={(e) => store.setDescription(e.target.value)}
              rows={3}
              className="bg-navy-800 border-navy-600 text-white placeholder:text-navy-400"
            />
          </div>

          {/* Severity and Category row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Severity */}
            <div className="space-y-2">
              <Label className="text-white">Severity</Label>
              <Select value={store.severity} onValueChange={(v) => store.setSeverity(v as BugSeverity)}>
                <SelectTrigger className="bg-navy-800 border-navy-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-navy-800 border-navy-600">
                  <SelectItem value="low" className="text-green-400">Low - Minor issue</SelectItem>
                  <SelectItem value="medium" className="text-yellow-400">Medium - Noticeable</SelectItem>
                  <SelectItem value="high" className="text-orange-400">High - Major issue</SelectItem>
                  <SelectItem value="critical" className="text-red-400">Critical - Broken</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label className="text-white">Category</Label>
              <Select value={store.category} onValueChange={(v) => store.setCategory(v as BugCategory)}>
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

          {/* Media Capture Section */}
          <div className="space-y-3">
            <Label className="text-white flex items-center gap-2">
              <Camera className="h-4 w-4 text-navy-400" />
              Capture Media (optional)
            </Label>

            {/* Capture Buttons */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCaptureScreenshot}
                disabled={store.isRecording}
                className="border-navy-600 text-navy-300 hover:bg-navy-800 hover:text-white flex-1"
              >
                <Image className="h-4 w-4 mr-2" />
                Take Screenshot
              </Button>

              {isScreenRecordingSupported && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleStartRecording}
                  disabled={store.isRecording}
                  className="border-navy-600 text-navy-300 hover:bg-navy-800 hover:text-white flex-1"
                >
                  <Video className="h-4 w-4 mr-2" />
                  Record Screen
                </Button>
              )}
            </div>

            <p className="text-xs text-navy-400">
              Navigate anywhere in the app while recording. Click "Stop Recording" when done.
            </p>

            {/* Screenshot Preview */}
            {store.media.screenshotPreview && (
              <div className="relative rounded-lg overflow-hidden border border-navy-600 bg-navy-800">
                <img
                  src={store.media.screenshotPreview}
                  alt="Screenshot preview"
                  className="w-full h-32 object-cover object-top"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  {store.uploadedUrls.screenshot && (
                    <div className="bg-green-600 text-white p-1 rounded-full">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="h-6 w-6"
                    onClick={removeScreenshot}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                {uploadProgress.screenshot && (
                  <div className="absolute inset-0 bg-navy-900/80 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 text-gold animate-spin" />
                  </div>
                )}
              </div>
            )}

            {/* Video Preview */}
            {store.media.videoPreview && (
              <div className="relative rounded-lg overflow-hidden border border-navy-600 bg-navy-800">
                <video
                  src={store.media.videoPreview}
                  controls
                  className="w-full h-32 object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  {store.uploadedUrls.video && (
                    <div className="bg-green-600 text-white p-1 rounded-full">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="h-6 w-6"
                    onClick={removeVideo}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                {uploadProgress.video && (
                  <div className="absolute inset-0 bg-navy-900/80 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 text-gold animate-spin" />
                  </div>
                )}
              </div>
            )}
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
              onClick={() => store.reset()}
              className="border-navy-600 text-navy-300 hover:bg-navy-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || submitBug.isPending || isUploading || store.isRecording}
              className="bg-gold hover:bg-gold-600 text-navy-900"
            >
              {submitBug.isPending || isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isUploading ? 'Uploading...' : 'Submitting...'}
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Submit Report
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
