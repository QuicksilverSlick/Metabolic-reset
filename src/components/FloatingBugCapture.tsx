'use client';

import { useRef, useCallback, useEffect } from 'react';
import { Bug, Loader2, StopCircle, Camera, Video, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/button';
import { useBugReportStore } from '@/lib/bug-report-store';

/**
 * FloatingBugCapture - A global component that handles screen recording and screenshots
 * This component lives at the app root level so it persists across navigation.
 * It shows a floating widget during capture and handles all MediaRecorder logic.
 */
export function FloatingBugCapture() {
  const store = useBugReportStore();

  // Refs for recording - these persist across the component lifecycle
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Format recording time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Capture screenshot
  const captureScreenshot = useCallback(async () => {
    store.setCaptureMode('screenshot-pending');

    // Small delay for any UI to settle
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const canvas = await html2canvas(document.body, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        scale: window.devicePixelRatio || 1,
        logging: false,
        // Ignore the floating capture widget
        ignoreElements: (element) => {
          return element.id === 'floating-bug-capture';
        }
      });

      canvas.toBlob((blob) => {
        if (blob) {
          // Revoke old preview URL if exists
          if (store.media.screenshotPreview) {
            URL.revokeObjectURL(store.media.screenshotPreview);
          }
          const preview = URL.createObjectURL(blob);
          store.setScreenshot(blob, preview);
        }
        store.setCaptureMode('idle');
        // Open dialog to show the result
        store.setDialogOpen(true);
        store.setMinimized(false);
      }, 'image/png');
    } catch (error) {
      console.error('Screenshot capture failed:', error);
      store.setCaptureMode('idle');
    }
  }, [store]);

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
        // Revoke old preview URL if exists
        if (store.media.videoPreview) {
          URL.revokeObjectURL(store.media.videoPreview);
        }
        const preview = URL.createObjectURL(blob);
        store.setVideo(blob, preview);
        store.setIsRecording(false);
        store.setCaptureMode('idle');

        // Clean up
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
        }

        // Open dialog to show the result
        store.setDialogOpen(true);
        store.setMinimized(false);
      };

      // Handle when user stops sharing via browser UI
      stream.getVideoTracks()[0].onended = () => {
        stopRecording();
      };

      // Start recording
      store.setCaptureMode('recording');
      store.setRecordingTime(0);
      store.setDialogOpen(false);
      store.setMinimized(true);

      mediaRecorder.start(1000); // Collect data every second
      store.setIsRecording(true);

      // Update recording time
      recordingIntervalRef.current = setInterval(() => {
        store.incrementRecordingTime();
      }, 1000);

    } catch (error) {
      console.error('Screen recording failed:', error);
      store.setIsRecording(false);
      store.setCaptureMode('idle');
    }
  }, [store]);

  // Stop screen recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
  }, []);

  // Cancel recording without saving
  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      // Clear chunks before stopping so nothing gets saved
      recordedChunksRef.current = [];
      mediaRecorderRef.current.stop();
    }
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    store.setIsRecording(false);
    store.setCaptureMode('idle');
    store.setMinimized(false);
  }, [store]);

  // Expose capture functions globally so BugReportDialog can trigger them
  useEffect(() => {
    (window as any).__bugCapture = {
      captureScreenshot,
      startRecording,
      stopRecording,
    };
    return () => {
      delete (window as any).__bugCapture;
    };
  }, [captureScreenshot, startRecording, stopRecording]);

  // Only show the floating widget when in capture mode
  if (store.captureMode === 'idle') {
    return null;
  }

  return (
    <div
      id="floating-bug-capture"
      className="fixed bottom-4 right-4 z-[9999] animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      <div className="bg-navy-900 border border-navy-600 rounded-2xl shadow-2xl p-3 flex items-center gap-3">
        {store.isRecording ? (
          <>
            {/* Recording indicator */}
            <div className="flex items-center gap-2 px-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-white font-mono text-sm">{formatTime(store.recordingTime)}</span>
            </div>

            {/* Stop button */}
            <Button
              onClick={stopRecording}
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white gap-2"
            >
              <StopCircle className="h-4 w-4" />
              Stop Recording
            </Button>

            {/* Cancel button */}
            <Button
              onClick={cancelRecording}
              size="sm"
              variant="ghost"
              className="text-slate-400 hover:text-white hover:bg-navy-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : store.captureMode === 'screenshot-pending' ? (
          <div className="flex items-center gap-2 px-3 py-1">
            <Loader2 className="h-4 w-4 text-gold animate-spin" />
            <span className="text-white text-sm">Capturing screenshot...</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
