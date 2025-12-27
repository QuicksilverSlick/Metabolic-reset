import React, { useState, useRef } from 'react';
import {
  useProjects,
  useAdminProjectContent,
  useAdminCreateContent,
  useAdminUpdateContent,
  useAdminDeleteContent,
  useAdminCopyContent,
  useAdminContentAnalytics
} from '@/hooks/use-queries';
import {
  Plus,
  Video,
  FileQuestion,
  FileText,
  Pencil,
  Trash2,
  Copy,
  ChevronDown,
  ChevronRight,
  Loader2,
  Calendar,
  Award,
  BarChart3,
  GripVertical,
  X,
  Check,
  Play,
  Upload,
  Image
} from 'lucide-react';
import { uploadApi, streamApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { CourseContent, CourseContentType, QuizQuestion, QuizData, ResetProject } from '@shared/types';

export function ContentManager() {
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'analytics'>('content');
  const userId = useAuthStore(s => s.user?.id);

  // Content editing state
  const [contentDialogOpen, setContentDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<CourseContent | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<CourseContent | null>(null);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [targetProjectId, setTargetProjectId] = useState<string>('');

  // File upload state
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [isUploadingResource, setIsUploadingResource] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const resourceInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formDay, setFormDay] = useState(1);
  const [formType, setFormType] = useState<CourseContentType>('video');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formVideoDuration, setFormVideoDuration] = useState(0);
  const [formThumbnailUrl, setFormThumbnailUrl] = useState('');
  const [formResourceUrl, setFormResourceUrl] = useState('');
  const [formPoints, setFormPoints] = useState(10);
  const [formIsRequired, setFormIsRequired] = useState(true);
  const [formQuizQuestions, setFormQuizQuestions] = useState<QuizQuestion[]>([]);
  const [formQuizPassingScore, setFormQuizPassingScore] = useState(80);
  const [formQuizMaxAttempts, setFormQuizMaxAttempts] = useState(2);
  const [formQuizCooldownHours, setFormQuizCooldownHours] = useState(24);

  // Queries
  const { data: content, isLoading: contentLoading } = useAdminProjectContent(selectedProjectId);
  const { data: analytics, isLoading: analyticsLoading } = useAdminContentAnalytics(selectedProjectId);

  // Mutations
  const createMutation = useAdminCreateContent();
  const updateMutation = useAdminUpdateContent();
  const deleteMutation = useAdminDeleteContent();
  const copyMutation = useAdminCopyContent();

  const resetForm = () => {
    setFormDay(1);
    setFormType('video');
    setFormTitle('');
    setFormDescription('');
    setFormVideoUrl('');
    setFormVideoDuration(0);
    setFormThumbnailUrl('');
    setFormResourceUrl('');
    setFormPoints(10);
    setFormIsRequired(true);
    setFormQuizQuestions([]);
    setFormQuizPassingScore(80);
    setFormQuizMaxAttempts(2);
    setFormQuizCooldownHours(24);
    setEditingContent(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setContentDialogOpen(true);
  };

  const openEditDialog = (item: CourseContent) => {
    setEditingContent(item);
    setFormDay(item.dayNumber);
    setFormType(item.contentType);
    setFormTitle(item.title);
    setFormDescription(item.description);
    setFormVideoUrl(item.videoUrl || '');
    setFormVideoDuration(item.videoDuration || 0);
    setFormThumbnailUrl(item.thumbnailUrl || '');
    setFormResourceUrl(item.resourceUrl || '');
    setFormPoints(item.points);
    setFormIsRequired(item.isRequired);
    if (item.quizData) {
      setFormQuizQuestions(item.quizData.questions);
      setFormQuizPassingScore(item.quizData.passingScore);
      setFormQuizMaxAttempts(item.quizData.maxAttempts);
      setFormQuizCooldownHours(item.quizData.cooldownHours);
    }
    setContentDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedProjectId) return;

    const quizData: QuizData | undefined = formType === 'quiz' ? {
      questions: formQuizQuestions,
      passingScore: formQuizPassingScore,
      maxAttempts: formQuizMaxAttempts,
      cooldownHours: formQuizCooldownHours
    } : undefined;

    if (editingContent) {
      await updateMutation.mutateAsync({
        contentId: editingContent.id,
        updates: {
          dayNumber: formDay,
          contentType: formType,
          title: formTitle,
          description: formDescription,
          videoUrl: formVideoUrl || undefined,
          videoDuration: formVideoDuration || undefined,
          thumbnailUrl: formThumbnailUrl || undefined,
          resourceUrl: formResourceUrl || undefined,
          points: formPoints,
          isRequired: formIsRequired,
          quizData
        }
      });
    } else {
      await createMutation.mutateAsync({
        projectId: selectedProjectId,
        dayNumber: formDay,
        contentType: formType,
        title: formTitle,
        description: formDescription,
        videoUrl: formVideoUrl || undefined,
        videoDuration: formVideoDuration || undefined,
        thumbnailUrl: formThumbnailUrl || undefined,
        resourceUrl: formResourceUrl || undefined,
        points: formPoints,
        isRequired: formIsRequired,
        quizData
      });
    }

    setContentDialogOpen(false);
    resetForm();
  };

  const handleDelete = async () => {
    if (!contentToDelete || !selectedProjectId) return;
    await deleteMutation.mutateAsync({
      contentId: contentToDelete.id,
      projectId: selectedProjectId
    });
    setDeleteDialogOpen(false);
    setContentToDelete(null);
  };

  const handleCopyContent = async () => {
    if (!selectedProjectId || !targetProjectId) return;
    await copyMutation.mutateAsync({
      sourceProjectId: selectedProjectId,
      targetProjectId
    });
    setCopyDialogOpen(false);
    setTargetProjectId('');
  };

  const addQuizQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: crypto.randomUUID(),
      question: '',
      options: ['', '', '', ''],
      correctIndex: 0,
      explanation: ''
    };
    setFormQuizQuestions([...formQuizQuestions, newQuestion]);
  };

  const updateQuizQuestion = (index: number, updates: Partial<QuizQuestion>) => {
    const updated = [...formQuizQuestions];
    updated[index] = { ...updated[index], ...updates };
    setFormQuizQuestions(updated);
  };

  const removeQuizQuestion = (index: number) => {
    setFormQuizQuestions(formQuizQuestions.filter((_, i) => i !== index));
  };

  const updateQuizOption = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...formQuizQuestions];
    updated[qIndex].options[oIndex] = value;
    setFormQuizQuestions(updated);
  };

  // File upload handlers
  const handleFileUpload = async (
    file: File,
    type: 'video' | 'thumbnail' | 'resource',
    setUploading: (v: boolean) => void,
    setUrl: (url: string) => void
  ) => {
    if (!userId) {
      toast.error('You must be logged in to upload files');
      return;
    }

    // Validate file type
    const allowedTypes: Record<string, string[]> = {
      video: ['video/mp4', 'video/webm', 'video/quicktime'],
      thumbnail: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
      resource: ['application/pdf', 'image/png', 'image/jpeg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    };

    if (!allowedTypes[type].includes(file.type)) {
      toast.error(`Invalid file type for ${type}`);
      return;
    }

    // For videos, check if we need to use Stream (>95MB) or R2 (<95MB)
    const R2_SIZE_LIMIT = 95 * 1024 * 1024; // 95MB
    const MAX_STREAM_SIZE = 4 * 1024 * 1024 * 1024; // 4GB (Stream limit)

    if (type === 'video' && file.size > R2_SIZE_LIMIT) {
      // Use Cloudflare Stream for large videos
      if (file.size > MAX_STREAM_SIZE) {
        toast.error('File too large. Maximum video size is 4GB.');
        return;
      }

      setUploading(true);
      setUploadProgress(0);
      setUploadStatus('Creating upload...');

      try {
        // 1. Get TUS upload config from backend
        const { tusEndpoint, apiToken, meta } = await streamApi.createUpload(
          userId,
          { name: file.name, projectId: selectedProjectId || undefined },
          file.size
        );

        setUploadStatus('Uploading video...');

        // 2. Upload to Stream using TUS protocol (resumable)
        const uid = await streamApi.uploadToStream(
          tusEndpoint,
          apiToken,
          file,
          meta,
          (percent) => {
            setUploadProgress(percent);
          }
        );

        setUploadStatus('Processing video...');
        setUploadProgress(100);

        // 3. Wait for video to be ready (poll for status)
        const result = await streamApi.waitForReady(userId, uid, 300000, 3000);

        if (result.ready && result.playbackUrl) {
          setUrl(result.playbackUrl);
          // Also set duration if available
          if (result.duration && result.duration > 0) {
            setFormVideoDuration(Math.round(result.duration));
          }
          toast.success('Video uploaded and processed successfully via Cloudflare Stream');
        } else {
          throw new Error(result.error || 'Video processing failed');
        }
      } catch (error) {
        console.error('Stream upload failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        // Check for specific error types
        if (errorMessage.includes('not configured')) {
          toast.error('Cloudflare Stream is not configured. Please upload your video to Cloudflare Stream manually and paste the URL, or contact admin to configure streaming.');
        } else if (errorMessage.includes('Storage capacity exceeded') || errorMessage.includes('exceeded your allocated storage')) {
          toast.error('Cloudflare Stream storage quota exceeded. Please delete old videos from Cloudflare Stream or upgrade your plan.');
        } else if (errorMessage.includes('10011')) {
          toast.error('Stream storage quota exceeded. Delete videos from Cloudflare dashboard or upgrade your Stream plan.');
        } else {
          toast.error(`Failed to upload video: ${errorMessage}`);
        }
      } finally {
        setUploading(false);
        setUploadProgress(0);
        setUploadStatus('');
      }
      return;
    }

    // For smaller files or non-videos, use R2 upload
    const maxSize = type === 'video' ? R2_SIZE_LIMIT : 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`File too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB.`);
      return;
    }

    setUploading(true);
    try {
      // Get presigned URL
      const { key } = await uploadApi.getPresignedUrl(
        userId,
        file.name,
        file.type,
        file.size,
        'content'
      );

      // Upload the file
      const result = await uploadApi.uploadFile(userId, key, file, file.type);
      setUrl(result.publicUrl);
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully`);
    } catch (error) {
      console.error(`${type} upload failed:`, error);
      toast.error(`Failed to upload ${type}`);
    } finally {
      setUploading(false);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, 'video', setIsUploadingVideo, setFormVideoUrl);
    }
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, 'thumbnail', setIsUploadingThumbnail, setFormThumbnailUrl);
    }
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
  };

  const handleResourceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, 'resource', setIsUploadingResource, setFormResourceUrl);
    }
    if (resourceInputRef.current) resourceInputRef.current.value = '';
  };

  // Group content by day
  const contentByDay: Record<number, CourseContent[]> = {};
  content?.forEach(item => {
    if (!contentByDay[item.dayNumber]) {
      contentByDay[item.dayNumber] = [];
    }
    contentByDay[item.dayNumber].push(item);
  });

  const getTypeIcon = (type: CourseContentType) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'quiz': return <FileQuestion className="h-4 w-4" />;
      case 'resource': return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeBadgeColor = (type: CourseContentType) => {
    switch (type) {
      case 'video': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'quiz': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'resource': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    }
  };

  if (projectsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Selector */}
      <Card className="bg-white dark:bg-navy-800 border-slate-200 dark:border-navy-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-navy-900 dark:text-white">
            <Calendar className="h-5 w-5 text-gold-500" />
            Course Content Manager
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400">
            Manage video lessons, quizzes, and resources for each project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label className="text-navy-900 dark:text-white">Select Project</Label>
              <Select
                value={selectedProjectId || ''}
                onValueChange={(value) => setSelectedProjectId(value || null)}
              >
                <SelectTrigger className="mt-1 bg-white dark:bg-navy-700 border-slate-200 dark:border-navy-600">
                  <SelectValue placeholder="Choose a project..." />
                </SelectTrigger>
                <SelectContent>
                  {projects?.map((project: ResetProject) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name} ({project.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedProjectId && (
              <div className="flex gap-2 sm:self-end">
                <Button
                  onClick={openCreateDialog}
                  className="bg-gold-500 hover:bg-gold-600 text-navy-900"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Content
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCopyDialogOpen(true)}
                  className="border-slate-200 dark:border-navy-600"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy To...
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Content/Analytics Tabs */}
      {selectedProjectId && (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'content' | 'analytics')}>
          <TabsList className="bg-slate-100 dark:bg-navy-700">
            <TabsTrigger value="content">Content ({content?.length || 0})</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="mt-4">
            {contentLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-gold-500" />
              </div>
            ) : !content?.length ? (
              <Card className="bg-white dark:bg-navy-800 border-slate-200 dark:border-navy-700">
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-slate-300 dark:text-navy-600" />
                  <p className="text-slate-500 dark:text-slate-400">
                    No content yet. Click "Add Content" to create your first lesson.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Accordion type="multiple" defaultValue={['day-1']} className="space-y-2">
                {Array.from({ length: 28 }, (_, i) => i + 1).map(day => {
                  const dayContent = contentByDay[day] || [];
                  if (dayContent.length === 0) return null;

                  return (
                    <AccordionItem
                      key={day}
                      value={`day-${day}`}
                      className="bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-lg px-4"
                    >
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="bg-gold-100 text-gold-800 dark:bg-gold-900/30 dark:text-gold-400 border-gold-200 dark:border-gold-800">
                            Day {day}
                          </Badge>
                          <span className="text-sm text-slate-500 dark:text-slate-400">
                            {dayContent.length} item{dayContent.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pb-2">
                          {dayContent.sort((a, b) => a.order - b.order).map(item => (
                            <div
                              key={item.id}
                              className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-navy-700/50 group"
                            >
                              <GripVertical className="h-4 w-4 text-slate-400 cursor-grab" />
                              <div className={`p-2 rounded ${getTypeBadgeColor(item.contentType)}`}>
                                {getTypeIcon(item.contentType)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-navy-900 dark:text-white truncate">
                                  {item.title}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {item.contentType} • {item.points} pts
                                  {!item.isRequired && ' • Optional'}
                                </p>
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openEditDialog(item)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setContentToDelete(item);
                                    setDeleteDialogOpen(true);
                                  }}
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="mt-4">
            {analyticsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-gold-500" />
              </div>
            ) : !analytics?.length ? (
              <Card className="bg-white dark:bg-navy-800 border-slate-200 dark:border-navy-700">
                <CardContent className="py-12 text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-slate-300 dark:text-navy-600" />
                  <p className="text-slate-500 dark:text-slate-400">
                    No analytics data yet. Add content and wait for users to engage.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {analytics.map(item => (
                  <Card key={item.contentId} className="bg-white dark:bg-navy-800 border-slate-200 dark:border-navy-700">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">Day {item.dayNumber}</Badge>
                            <Badge className={getTypeBadgeColor(item.contentType as CourseContentType)}>
                              {item.contentType}
                            </Badge>
                          </div>
                          <p className="font-medium text-navy-900 dark:text-white">{item.title}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gold-500">{item.completionRate}%</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">completion</p>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500 dark:text-slate-400">Completed</p>
                          <p className="font-medium text-navy-900 dark:text-white">{item.completedCount}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 dark:text-slate-400">In Progress</p>
                          <p className="font-medium text-navy-900 dark:text-white">{item.inProgressCount}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 dark:text-slate-400">
                            {item.contentType === 'quiz' ? 'Avg Score' : 'Avg Watch'}
                          </p>
                          <p className="font-medium text-navy-900 dark:text-white">
                            {item.contentType === 'quiz'
                              ? (item.avgQuizScore !== null ? `${item.avgQuizScore}%` : '-')
                              : (item.avgWatchPercentage !== null ? `${item.avgWatchPercentage}%` : '-')
                            }
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Create/Edit Content Dialog */}
      <Dialog open={contentDialogOpen} onOpenChange={(open) => {
        setContentDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-navy-800">
          <DialogHeader>
            <DialogTitle className="text-navy-900 dark:text-white">
              {editingContent ? 'Edit Content' : 'Add New Content'}
            </DialogTitle>
            <DialogDescription>
              {editingContent ? 'Update the content details below.' : 'Fill in the details to create new content.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Day Number</Label>
                <Select value={formDay.toString()} onValueChange={(v) => setFormDay(parseInt(v))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 28 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        Day {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Content Type</Label>
                <Select value={formType} onValueChange={(v) => setFormType(v as CourseContentType)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="resource">Resource</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Title</Label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Enter content title"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Brief description of the content"
                className="mt-1"
                rows={2}
              />
            </div>

            {/* Video-specific fields */}
            {formType === 'video' && (
              <>
                <div>
                  <Label>Video File</Label>
                  <div className="mt-1 flex gap-2">
                    <Input
                      value={formVideoUrl}
                      onChange={(e) => setFormVideoUrl(e.target.value)}
                      placeholder="https://... or upload a video"
                      className="flex-1"
                      disabled={isUploadingVideo}
                    />
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      onChange={handleVideoUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => videoInputRef.current?.click()}
                      disabled={isUploadingVideo}
                    >
                      {isUploadingVideo ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {/* Upload progress indicator for large videos */}
                  {isUploadingVideo && uploadProgress > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>{uploadStatus}</span>
                        <span>{Math.round(uploadProgress)}%</span>
                      </div>
                      <div className="h-2 bg-slate-200 dark:bg-navy-600 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gold-500 transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-slate-500 mt-1">
                    Upload MP4, WebM, or MOV. Files under 95MB use R2 storage. Larger files (up to 4GB) automatically use Cloudflare Stream.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Duration (seconds)</Label>
                    <Input
                      type="number"
                      value={formVideoDuration}
                      onChange={(e) => setFormVideoDuration(parseInt(e.target.value) || 0)}
                      placeholder="300"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Thumbnail Image (optional)</Label>
                    <div className="mt-1 flex gap-2">
                      <Input
                        value={formThumbnailUrl}
                        onChange={(e) => setFormThumbnailUrl(e.target.value)}
                        placeholder="https://... or upload"
                        className="flex-1"
                      />
                      <input
                        ref={thumbnailInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/gif,image/webp"
                        onChange={handleThumbnailUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => thumbnailInputRef.current?.click()}
                        disabled={isUploadingThumbnail}
                      >
                        {isUploadingThumbnail ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Image className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
                {formThumbnailUrl && (
                  <div className="mt-2">
                    <img src={formThumbnailUrl} alt="Thumbnail preview" loading="lazy" className="h-20 w-auto rounded border" />
                  </div>
                )}
              </>
            )}

            {/* Resource-specific fields */}
            {formType === 'resource' && (
              <div>
                <Label>Resource File</Label>
                <div className="mt-1 flex gap-2">
                  <Input
                    value={formResourceUrl}
                    onChange={(e) => setFormResourceUrl(e.target.value)}
                    placeholder="https://... or upload a file"
                    className="flex-1"
                  />
                  <input
                    ref={resourceInputRef}
                    type="file"
                    accept="application/pdf,image/png,image/jpeg,.doc,.docx"
                    onChange={handleResourceUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => resourceInputRef.current?.click()}
                    disabled={isUploadingResource}
                  >
                    {isUploadingResource ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-slate-500 mt-1">Upload PDF, images, or Word docs (max 50MB)</p>
              </div>
            )}

            {/* Quiz-specific fields */}
            {formType === 'quiz' && (
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Quiz Questions</Label>
                  <Button type="button" size="sm" onClick={addQuizQuestion}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Question
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Passing Score (%)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      value={formQuizPassingScore}
                      onChange={(e) => setFormQuizPassingScore(parseInt(e.target.value) || 80)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Max Attempts</Label>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={formQuizMaxAttempts}
                      onChange={(e) => setFormQuizMaxAttempts(parseInt(e.target.value) || 2)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Cooldown (hours)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={168}
                      value={formQuizCooldownHours}
                      onChange={(e) => setFormQuizCooldownHours(parseInt(e.target.value) || 24)}
                      className="mt-1"
                    />
                  </div>
                </div>

                {formQuizQuestions.map((q, qIndex) => (
                  <Card key={q.id} className="bg-slate-50 dark:bg-navy-700">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <Label className="font-medium">Question {qIndex + 1}</Label>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => removeQuizQuestion(qIndex)}
                          className="text-red-500 h-6 w-6 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <Input
                        value={q.question}
                        onChange={(e) => updateQuizQuestion(qIndex, { question: e.target.value })}
                        placeholder="Enter your question"
                        className="mb-3"
                      />
                      <Label className="text-xs text-slate-500">Options (click to set correct answer)</Label>
                      <div className="space-y-2 mt-1">
                        {q.options.map((opt, oIndex) => (
                          <div key={oIndex} className="flex items-center gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant={q.correctIndex === oIndex ? "default" : "outline"}
                              onClick={() => updateQuizQuestion(qIndex, { correctIndex: oIndex })}
                              className={`h-8 w-8 p-0 ${q.correctIndex === oIndex ? 'bg-green-500 hover:bg-green-600' : ''}`}
                            >
                              {q.correctIndex === oIndex ? <Check className="h-4 w-4" /> : String.fromCharCode(65 + oIndex)}
                            </Button>
                            <Input
                              value={opt}
                              onChange={(e) => updateQuizOption(qIndex, oIndex, e.target.value)}
                              placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                              className="flex-1"
                            />
                          </div>
                        ))}
                      </div>
                      <div className="mt-3">
                        <Label className="text-xs text-slate-500">Explanation (shown after answering)</Label>
                        <Input
                          value={q.explanation || ''}
                          onChange={(e) => updateQuizQuestion(qIndex, { explanation: e.target.value })}
                          placeholder="Why this answer is correct..."
                          className="mt-1"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Common fields */}
            <div className="grid grid-cols-2 gap-4 border-t pt-4">
              <div>
                <Label>Points Awarded</Label>
                <Input
                  type="number"
                  min={0}
                  value={formPoints}
                  onChange={(e) => setFormPoints(parseInt(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>
              <div className="flex items-center gap-3 self-end pb-2">
                <Switch
                  checked={formIsRequired}
                  onCheckedChange={setFormIsRequired}
                />
                <Label>Required for quiz unlock</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setContentDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formTitle || createMutation.isPending || updateMutation.isPending}
              className="bg-gold-500 hover:bg-gold-600 text-navy-900"
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editingContent ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-navy-800">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Content?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{contentToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Copy Content Dialog */}
      <Dialog open={copyDialogOpen} onOpenChange={setCopyDialogOpen}>
        <DialogContent className="bg-white dark:bg-navy-800">
          <DialogHeader>
            <DialogTitle>Copy Content to Another Project</DialogTitle>
            <DialogDescription>
              This will copy all content from the current project to the selected target project.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label>Target Project</Label>
            <Select value={targetProjectId} onValueChange={setTargetProjectId}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select target project..." />
              </SelectTrigger>
              <SelectContent>
                {projects?.filter((p: ResetProject) => p.id !== selectedProjectId).map((project: ResetProject) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCopyDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCopyContent}
              disabled={!targetProjectId || copyMutation.isPending}
              className="bg-gold-500 hover:bg-gold-600 text-navy-900"
            >
              {copyMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Copy Content
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
