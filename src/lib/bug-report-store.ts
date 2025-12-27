import { create } from 'zustand';
import type { BugSeverity, BugCategory, ReportType } from '@shared/types';

export type CaptureMode = 'idle' | 'recording' | 'screenshot-pending';

interface CapturedMedia {
  screenshot: Blob | null;
  screenshotPreview: string | null;
  video: Blob | null;
  videoPreview: string | null;
}

interface BugReportState {
  // Form state
  reportType: ReportType; // 'bug' or 'support'
  title: string;
  description: string;
  severity: BugSeverity;
  category: BugCategory;

  // Capture state
  captureMode: CaptureMode;
  isRecording: boolean;
  recordingTime: number;

  // Captured media
  media: CapturedMedia;
  uploadedUrls: { screenshot?: string; video?: string };

  // Dialog state
  isDialogOpen: boolean;
  isMinimized: boolean;

  // Actions
  setReportType: (type: ReportType) => void;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setSeverity: (severity: BugSeverity) => void;
  setCategory: (category: BugCategory) => void;

  // Open dialog in a specific mode
  openAsBug: () => void;
  openAsSupport: () => void;

  setCaptureMode: (mode: CaptureMode) => void;
  setIsRecording: (isRecording: boolean) => void;
  setRecordingTime: (time: number) => void;
  incrementRecordingTime: () => void;

  setScreenshot: (blob: Blob | null, preview: string | null) => void;
  setVideo: (blob: Blob | null, preview: string | null) => void;
  setUploadedUrl: (type: 'screenshot' | 'video', url: string | undefined) => void;

  setDialogOpen: (open: boolean) => void;
  setMinimized: (minimized: boolean) => void;

  // Minimize dialog and start capture mode
  startCapture: (mode: 'recording' | 'screenshot') => void;
  // Stop capture and show dialog again
  stopCapture: () => void;

  // Reset everything
  reset: () => void;
}

const initialMedia: CapturedMedia = {
  screenshot: null,
  screenshotPreview: null,
  video: null,
  videoPreview: null,
};

export const useBugReportStore = create<BugReportState>((set) => ({
  // Initial form state
  reportType: 'bug',
  title: '',
  description: '',
  severity: 'medium',
  category: 'other',

  // Initial capture state
  captureMode: 'idle',
  isRecording: false,
  recordingTime: 0,

  // Initial media state
  media: { ...initialMedia },
  uploadedUrls: {},

  // Initial dialog state
  isDialogOpen: false,
  isMinimized: false,

  // Form actions
  setReportType: (reportType) => set({ reportType }),
  setTitle: (title) => set({ title }),
  setDescription: (description) => set({ description }),
  setSeverity: (severity) => set({ severity }),
  setCategory: (category) => set({ category }),

  // Open dialog in specific mode
  openAsBug: () => set({ reportType: 'bug', isDialogOpen: true, isMinimized: false }),
  openAsSupport: () => set({ reportType: 'support', isDialogOpen: true, isMinimized: false }),

  // Capture actions
  setCaptureMode: (captureMode) => set({ captureMode }),
  setIsRecording: (isRecording) => set({ isRecording }),
  setRecordingTime: (recordingTime) => set({ recordingTime }),
  incrementRecordingTime: () => set((state) => ({ recordingTime: state.recordingTime + 1 })),

  // Media actions
  setScreenshot: (blob, preview) => set((state) => ({
    media: { ...state.media, screenshot: blob, screenshotPreview: preview }
  })),
  setVideo: (blob, preview) => set((state) => ({
    media: { ...state.media, video: blob, videoPreview: preview }
  })),
  setUploadedUrl: (type, url) => set((state) => ({
    uploadedUrls: { ...state.uploadedUrls, [type]: url }
  })),

  // Dialog actions
  setDialogOpen: (isDialogOpen) => set({ isDialogOpen }),
  setMinimized: (isMinimized) => set({ isMinimized }),

  // Start capture - minimize dialog and set capture mode
  startCapture: (mode) => set({
    isMinimized: true,
    isDialogOpen: false,
    captureMode: mode === 'recording' ? 'recording' : 'screenshot-pending',
  }),

  // Stop capture - restore dialog
  stopCapture: () => set({
    isMinimized: false,
    isDialogOpen: true,
    captureMode: 'idle',
  }),

  // Reset everything
  reset: () => set({
    reportType: 'bug',
    title: '',
    description: '',
    severity: 'medium',
    category: 'other',
    captureMode: 'idle',
    isRecording: false,
    recordingTime: 0,
    media: { ...initialMedia },
    uploadedUrls: {},
    isDialogOpen: false,
    isMinimized: false,
  }),
}));
