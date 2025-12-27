'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import { Loader2, StopCircle, X, Mic } from 'lucide-react';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/button';
import { useBugReportStore } from '@/lib/bug-report-store';
import { toast } from 'sonner';

/**
 * FloatingBugCapture - A global component that handles screen recording and screenshots
 * This component lives at the app root level so it persists across navigation.
 * It shows a floating widget during capture and handles all MediaRecorder logic.
 */
export function FloatingBugCapture() {
  const store = useBugReportStore();

  // Track if microphone is active for visual indicator
  const [hasMicrophone, setHasMicrophone] = useState(false);

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

  // Capture screenshot using html2canvas - responsive for all screen sizes
  const captureScreenshot = useCallback(async () => {
    store.setCaptureMode('screenshot-pending');

    // Small delay to let any dialog animations finish
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      // Get the visible viewport dimensions
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Determine optimal scale based on screen size
      // Higher resolution for smaller screens (mobile), lower for large screens
      const baseScale = window.devicePixelRatio || 1;
      const maxScale = viewportWidth <= 768 ? 2 : 1.5; // Higher quality for mobile
      const scale = Math.min(baseScale, maxScale);

      const canvas = await html2canvas(document.body, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#0a1628', // Navy background as fallback
        scale: scale,
        logging: false,
        // Capture the visible viewport area
        width: viewportWidth,
        height: viewportHeight,
        windowWidth: viewportWidth,
        windowHeight: viewportHeight,
        x: window.scrollX,
        y: window.scrollY,
        // Ignore the floating capture widget, dialogs, and other fixed elements
        ignoreElements: (element) => {
          if (element.id === 'floating-bug-capture') return true;
          if (element.getAttribute('role') === 'dialog') return true;
          // Be more selective about fixed elements - only ignore overlays
          if (element.classList.contains('fixed') &&
              (element.classList.contains('z-50') || element.classList.contains('z-[9999]'))) {
            return true;
          }
          return false;
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
          toast.success('Screenshot captured!', {
            description: 'You can review it before submitting.'
          });
        } else {
          toast.error('Failed to capture screenshot', {
            description: 'Please try again or describe the issue manually.'
          });
        }
        store.setCaptureMode('idle');
        // Open dialog to show the result
        store.setDialogOpen(true);
        store.setMinimized(false);
      }, 'image/png', 0.92); // Slightly higher quality
    } catch (error) {
      console.error('Screenshot capture failed:', error);
      toast.error('Screenshot failed', {
        description: 'Please describe your issue manually.'
      });
      store.setCaptureMode('idle');
      // Re-open dialog even on failure
      store.setDialogOpen(true);
      store.setMinimized(false);
    }
  }, [store]);

  // Start screen recording with microphone audio
  const startRecording = useCallback(async () => {
    try {
      // First, get screen share (with system audio if available)
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'browser',
        } as MediaTrackConstraints,
        audio: true, // System audio (if user permits)
      });

      // Try to get microphone audio for voice narration
      let micStream: MediaStream | null = null;
      try {
        micStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: false,
        });
        toast.success('Microphone enabled', {
          description: 'Speak to explain what you\'re showing us.',
          duration: 3000,
        });
        setHasMicrophone(true);
      } catch (micError) {
        console.log('Microphone not available, recording screen only:', micError);
        setHasMicrophone(false);
        // Continue without microphone - it's optional
      }

      // Combine video track from display + audio tracks (screen audio + mic)
      const tracks = [...displayStream.getVideoTracks()];

      // Add screen audio if available
      const screenAudioTracks = displayStream.getAudioTracks();
      if (screenAudioTracks.length > 0) {
        tracks.push(...screenAudioTracks);
      }

      // Add microphone audio if available
      if (micStream) {
        const micTracks = micStream.getAudioTracks();
        tracks.push(...micTracks);
      }

      const combinedStream = new MediaStream(tracks);
      streamRef.current = combinedStream;
      recordedChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(combinedStream, {
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
        setHasMicrophone(false); // Reset microphone state

        // Clean up
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
        }

        toast.success('Recording saved!', {
          description: 'You can review it before submitting.'
        });

        // Open dialog to show the result
        store.setDialogOpen(true);
        store.setMinimized(false);
      };

      // Handle when user stops sharing via browser UI
      displayStream.getVideoTracks()[0].onended = () => {
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
      toast.error('Screen recording failed', {
        description: 'Your browser may not support screen recording.'
      });
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
              {/* Microphone indicator */}
              {hasMicrophone && (
                <div className="flex items-center gap-1 text-green-400" title="Microphone active">
                  <Mic className="h-3.5 w-3.5" />
                </div>
              )}
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
