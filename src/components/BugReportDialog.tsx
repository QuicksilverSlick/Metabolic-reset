'use client';

// Bug report dialog - uses FloatingBugCapture for screen recording/screenshots
// Also supports "support" mode for general support requests
import React, { useState } from 'react';
import { Bug, AlertCircle, Image, Video, Loader2, Camera, X, Upload, Check, MessageCircle } from 'lucide-react';
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
import { useSubmitBugReport, useSubmitPublicSupport } from '@/hooks/use-queries';
import { useAuthStore } from '@/lib/auth-store';
import { uploadApi, bugApi } from '@/lib/api';
import { useBugReportStore } from '@/lib/bug-report-store';
import { toast } from 'sonner';
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
  const user = useAuthStore(s => s.user);
  const store = useBugReportStore();

  // Local upload progress state
  const [uploadProgress, setUploadProgress] = useState<{ screenshot?: boolean; video?: boolean }>({});

  const submitBug = useSubmitBugReport();
  const submitPublicSupport = useSubmitPublicSupport();

  // Check if we're in support mode
  const isSupport = store.reportType === 'support';

  // Check if user is authenticated
  const isAuthenticated = !!userId;

  // Handle dialog open state from store
  const handleOpenChange = (open: boolean) => {
    if (open) {
      store.setDialogOpen(true);
      store.setMinimized(false);
      // Pre-fill contact info from user if authenticated
      if (isAuthenticated && user) {
        store.setContactName(user.name || '');
        store.setContactEmail(user.email || '');
        store.setContactPhone(user.phone || '');
      }
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
    try {
      setUploadProgress(prev => ({ ...prev, [type]: true }));

      // Use public upload endpoint for unauthenticated users
      if (!userId) {
        const result = await uploadApi.uploadPublicSupport(blob, type);
        store.setUploadedUrl(type, result.publicUrl);
        return result.publicUrl;
      }

      // Authenticated users use the normal upload flow
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
      toast.error(`Failed to upload ${type}`, {
        description: 'Please try again or submit without media.'
      });
      return null;
    } finally {
      setUploadProgress(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Upload any pending media first (for both authenticated and unauthenticated)
    let screenshotUrl = store.uploadedUrls.screenshot;
    let videoUrl = store.uploadedUrls.video;

    if (store.media.screenshot && !screenshotUrl) {
      screenshotUrl = await uploadMedia(store.media.screenshot, 'screenshot') || undefined;
    }

    if (store.media.video && !videoUrl) {
      videoUrl = await uploadMedia(store.media.video, 'video') || undefined;
    }

    // For support mode without auth, use public endpoint
    if (isSupport && !isAuthenticated) {
      try {
        await bugApi.submitPublicSupport({
          type: 'support',
          title: store.title,
          description: store.description,
          severity: 'medium',
          category: store.category,
          screenshotUrl: screenshotUrl,
          videoUrl: videoUrl,
          pageUrl: window.location.href,
          userAgent: navigator.userAgent,
          contactName: store.contactName,
          contactEmail: store.contactEmail,
          contactPhone: store.contactPhone,
        });
        toast.success('Support request submitted!', {
          description: "We'll get back to you at " + store.contactEmail
        });
        store.reset();
      } catch (error) {
        console.error('Support submission error:', error);
        toast.error('Failed to submit support request');
      }
      return;
    }

    // For authenticated users, submit through normal flow
    await submitBug.mutateAsync({
      type: store.reportType,
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

  // Validation - for support mode, also require contact info if not authenticated
  const isValidBase = store.title.trim().length > 0 && store.description.trim().length > 0;
  const isValidContact = isAuthenticated || (
    store.contactName.trim().length > 0 &&
    store.contactEmail.trim().length > 0 &&
    store.contactEmail.includes('@')
  );
  const isValid = isValidBase && (isSupport ? isValidContact : true);
  const isUploading = uploadProgress.screenshot || uploadProgress.video;

  // Check if screen recording is supported
  const isScreenRecordingSupported = typeof navigator !== 'undefined' &&
    'mediaDevices' in navigator &&
    'getDisplayMedia' in navigator.mediaDevices;

  // Dynamic content based on mode
  const Icon = isSupport ? MessageCircle : Bug;
  const dialogTitle = isSupport ? 'Contact Support' : 'Report a Bug';
  const dialogDescription = isSupport
    ? 'Have a question or need help? Send us a message and we\'ll get back to you soon.'
    : 'Help us improve by reporting issues you encounter. You can capture a screenshot or record your screen.';
  const titlePlaceholder = isSupport ? 'What do you need help with?' : 'Brief description of the issue';
  const descriptionPlaceholder = isSupport
    ? 'Tell us more about your question or what you need help with...'
    : 'What happened? What did you expect to happen? Steps to reproduce...';
  const submitButtonText = isSupport ? 'Send Message' : 'Submit Report';

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
            <Icon className="h-5 w-5 text-gold" />
            {dialogTitle}
          </DialogTitle>
          <DialogDescription className="text-navy-300">
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Contact Info - only show for support mode */}
          {isSupport && (
            <div className="space-y-3 p-3 rounded-lg bg-navy-800/50 border border-navy-700">
              <Label className="text-white text-sm font-medium">Your Contact Information</Label>
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="contactName" className="text-xs text-navy-400">
                    Name <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="contactName"
                    placeholder="Your name"
                    value={store.contactName}
                    onChange={(e) => store.setContactName(e.target.value)}
                    className="bg-navy-800 border-navy-600 text-white placeholder:text-navy-400"
                    disabled={isAuthenticated}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="contactEmail" className="text-xs text-navy-400">
                    Email <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="your@email.com"
                    value={store.contactEmail}
                    onChange={(e) => store.setContactEmail(e.target.value)}
                    className="bg-navy-800 border-navy-600 text-white placeholder:text-navy-400"
                    disabled={isAuthenticated}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="contactPhone" className="text-xs text-navy-400">
                    Phone (optional)
                  </Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={store.contactPhone}
                    onChange={(e) => store.setContactPhone(e.target.value)}
                    className="bg-navy-800 border-navy-600 text-white placeholder:text-navy-400"
                    disabled={isAuthenticated}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white">
              {isSupport ? 'Subject' : 'Title'} <span className="text-red-400">*</span>
            </Label>
            <Input
              id="title"
              placeholder={titlePlaceholder}
              value={store.title}
              onChange={(e) => store.setTitle(e.target.value)}
              className="bg-navy-800 border-navy-600 text-white placeholder:text-navy-400"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">
              {isSupport ? 'Message' : 'Description'} <span className="text-red-400">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder={descriptionPlaceholder}
              value={store.description}
              onChange={(e) => store.setDescription(e.target.value)}
              rows={isSupport ? 4 : 3}
              className="bg-navy-800 border-navy-600 text-white placeholder:text-navy-400"
            />
          </div>

          {/* Severity and Category row - only show for bug reports */}
          {!isSupport && (
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
          )}

          {/* Category for support - simpler version */}
          {isSupport && (
            <div className="space-y-2">
              <Label className="text-white">Topic</Label>
              <Select value={store.category} onValueChange={(v) => store.setCategory(v as BugCategory)}>
                <SelectTrigger className="bg-navy-800 border-navy-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-navy-800 border-navy-600 text-white">
                  <SelectItem value="other" className="text-white hover:bg-navy-700 focus:bg-navy-700 focus:text-white">General Question</SelectItem>
                  <SelectItem value="functionality" className="text-white hover:bg-navy-700 focus:bg-navy-700 focus:text-white">Account Help</SelectItem>
                  <SelectItem value="data" className="text-white hover:bg-navy-700 focus:bg-navy-700 focus:text-white">Billing / Payment</SelectItem>
                  <SelectItem value="ui" className="text-white hover:bg-navy-700 focus:bg-navy-700 focus:text-white">App Usage</SelectItem>
                  <SelectItem value="performance" className="text-white hover:bg-navy-700 focus:bg-navy-700 focus:text-white">Technical Issue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Media Capture Section - show for all users to help demonstrate their issue */}
          <div className="space-y-3">
            <Label className="text-white flex items-center gap-2">
              <Camera className="h-4 w-4 text-navy-400" />
              {isSupport ? 'Show Us What You See (optional)' : 'Capture Media (optional)'}
            </Label>

            {/* Capture Buttons */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCaptureScreenshot}
                disabled={store.isRecording}
                className="border-navy-600 bg-navy-800/50 text-white hover:bg-navy-700 hover:text-white flex-1"
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
                  className="border-navy-600 bg-navy-800/50 text-white hover:bg-navy-700 hover:text-white flex-1"
                >
                  <Video className="h-4 w-4 mr-2" />
                  {isSupport ? 'Record Screen + Voice' : 'Record Screen'}
                </Button>
              )}
            </div>

            <p className="text-xs text-navy-400">
              {isSupport
                ? 'Record your screen while explaining the issue verbally - this helps us understand exactly what you\'re experiencing.'
                : 'Navigate anywhere in the app while recording. Click "Stop Recording" when done.'}
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
              {isSupport
                ? 'We typically respond within 24 hours. For urgent issues, please include as much detail as possible.'
                : 'Your current page URL and browser info will be automatically included to help us debug.'}
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => store.reset()}
              className="border-navy-600 bg-navy-800/50 text-white hover:bg-navy-700 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || submitBug.isPending || submitPublicSupport.isPending || isUploading || store.isRecording}
              className="bg-gold hover:bg-gold-600 text-navy-900"
            >
              {submitBug.isPending || submitPublicSupport.isPending || isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isUploading ? 'Uploading...' : 'Sending...'}
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  {submitButtonText}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
