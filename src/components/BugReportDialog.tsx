'use client';

import { useState, useRef, useCallback } from 'react';
import { Bug, AlertCircle, Image, Video, Loader2, Camera, Square, X, Upload, Check } from 'lucide-react';
import html2canvas from 'html2canvas';
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
import type { BugSeverity, BugCategory } from '@shared/types';

interface BugReportDialogProps {
  trigger?: React.ReactNode;
}

type MediaType = 'screenshot' | 'video' | null;

export function BugReportDialog({ trigger }: BugReportDialogProps) {
  const userId = useAuthStore(s => s.userId);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<BugSeverity>('medium');
  const [category, setCategory] = useState<BugCategory>('other');

  // Media capture state
  const [capturedScreenshot, setCapturedScreenshot] = useState<Blob | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [capturedVideo, setCapturedVideo] = useState<Blob | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploadProgress, setUploadProgress] = useState<{ screenshot?: boolean; video?: boolean }>({});
  const [uploadedUrls, setUploadedUrls] = useState<{ screenshot?: string; video?: string }>({});

  // Refs for recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const submitBug = useSubmitBugReport();

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSeverity('medium');
    setCategory('other');
    setCapturedScreenshot(null);
    setScreenshotPreview(null);
    setCapturedVideo(null);
    setVideoPreview(null);
    setUploadProgress({});
    setUploadedUrls({});
    setRecordingTime(0);
  };

  // Capture screenshot of the current page
  const captureScreenshot = useCallback(async () => {
    setIsCapturing(true);
    // Temporarily hide the dialog
    const dialogElement = document.querySelector('[role="dialog"]') as HTMLElement;
    if (dialogElement) {
      dialogElement.style.display = 'none';
    }

    try {
      // Wait a moment for the dialog to hide
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(document.body, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        scale: window.devicePixelRatio || 1,
        logging: false,
      });

      canvas.toBlob((blob) => {
        if (blob) {
          setCapturedScreenshot(blob);
          setScreenshotPreview(URL.createObjectURL(blob));
        }
      }, 'image/png');
    } catch (error) {
      console.error('Screenshot capture failed:', error);
    } finally {
      // Show the dialog again
      if (dialogElement) {
        dialogElement.style.display = '';
      }
      setIsCapturing(false);
    }
  }, []);

  // Start screen recording
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'browser',
        } as MediaTrackConstraints,
        audio: true,
      });

      streamRef.current = stream;
      recordedChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        setCapturedVideo(blob);
        setVideoPreview(URL.createObjectURL(blob));
        setIsRecording(false);

        // Clean up
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
        }
      };

      // Handle when user stops sharing via browser UI
      stream.getVideoTracks()[0].onended = () => {
        stopRecording();
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingTime(0);

      // Update recording time
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Screen recording failed:', error);
      setIsRecording(false);
    }
  }, []);

  // Stop screen recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
  }, []);

  // Format recording time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Remove captured media
  const removeScreenshot = () => {
    if (screenshotPreview) URL.revokeObjectURL(screenshotPreview);
    setCapturedScreenshot(null);
    setScreenshotPreview(null);
    setUploadedUrls(prev => ({ ...prev, screenshot: undefined }));
  };

  const removeVideo = () => {
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setCapturedVideo(null);
    setVideoPreview(null);
    setUploadedUrls(prev => ({ ...prev, video: undefined }));
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

      setUploadedUrls(prev => ({ ...prev, [type]: result.publicUrl }));
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
    let screenshotUrl = uploadedUrls.screenshot;
    let videoUrl = uploadedUrls.video;

    if (capturedScreenshot && !screenshotUrl) {
      screenshotUrl = await uploadMedia(capturedScreenshot, 'screenshot') || undefined;
    }

    if (capturedVideo && !videoUrl) {
      videoUrl = await uploadMedia(capturedVideo, 'video') || undefined;
    }

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
  const isUploading = uploadProgress.screenshot || uploadProgress.video;

  // Check if screen recording is supported
  const isScreenRecordingSupported = typeof navigator !== 'undefined' &&
    'mediaDevices' in navigator &&
    'getDisplayMedia' in navigator.mediaDevices;

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
              rows={3}
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
                  <SelectItem value="medium" className="text-yellow-400">Medium - Noticeable</SelectItem>
                  <SelectItem value="high" className="text-orange-400">High - Major issue</SelectItem>
                  <SelectItem value="critical" className="text-red-400">Critical - Broken</SelectItem>
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
                onClick={captureScreenshot}
                disabled={isCapturing || isRecording}
                className="border-navy-600 text-navy-300 hover:bg-navy-800 hover:text-white flex-1"
              >
                {isCapturing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Image className="h-4 w-4 mr-2" />
                )}
                {isCapturing ? 'Capturing...' : 'Screenshot'}
              </Button>

              {isScreenRecordingSupported && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`border-navy-600 flex-1 ${
                    isRecording
                      ? 'bg-red-900/50 border-red-700 text-red-400 hover:bg-red-900 hover:text-red-300'
                      : 'text-navy-300 hover:bg-navy-800 hover:text-white'
                  }`}
                >
                  {isRecording ? (
                    <>
                      <Square className="h-4 w-4 mr-2 fill-current" />
                      Stop ({formatTime(recordingTime)})
                    </>
                  ) : (
                    <>
                      <Video className="h-4 w-4 mr-2" />
                      Record Screen
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Screenshot Preview */}
            {screenshotPreview && (
              <div className="relative rounded-lg overflow-hidden border border-navy-600 bg-navy-800">
                <img
                  src={screenshotPreview}
                  alt="Screenshot preview"
                  className="w-full h-32 object-cover object-top"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  {uploadedUrls.screenshot && (
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
            {videoPreview && (
              <div className="relative rounded-lg overflow-hidden border border-navy-600 bg-navy-800">
                <video
                  src={videoPreview}
                  controls
                  className="w-full h-32 object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  {uploadedUrls.video && (
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

            <p className="text-xs text-navy-400">
              Screenshots capture the current page. Screen recording requires permission and works on desktop browsers.
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
              disabled={!isValid || submitBug.isPending || isUploading || isRecording}
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
