import React, { useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import {
  useAdminUsers,
  useAdminUpdateUser,
  useBootstrapAdmin,
  useAdminUserDetails,
  useProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  useProjectEnrollments,
  useAdminUserEnrollments,
  useAdminEnrollUser,
  useAdminRemoveUserFromProject,
  useAdminBugReports,
  useAdminUpdateBugReport,
  useAdminDeleteBugReport,
  useSystemSettings,
  useUpdateSystemSettings,
  useAdminGenealogyRoots,
  useAdminGenealogy,
  usePointSettings,
  useAdminUpdatePointSettings,
  useAdminAdjustPoints,
  useAdminDeletedUsers,
  useAdminDeleteUser,
  useAdminRestoreUser,
  useAdminPermanentDeleteUser,
  useAdminClearOtp,
  useAdminFindDuplicates,
  useAdminMergeUsers,
  useStartImpersonation,
  useAllCoaches,
  useReassignCaptain,
  useBulkReassignCaptain
} from '@/hooks/use-queries';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Shield,
  ShieldCheck,
  ShieldOff,
  User as UserIcon,
  Users,
  Search,
  Loader2,
  ChevronDown,
  ChevronUp,
  Award,
  Ban,
  CheckCircle,
  Crown,
  Eye,
  X,
  UserCog,
  Calendar,
  Scale,
  Droplets,
  Footprints,
  Moon,
  BookOpen,
  FolderKanban,
  Plus,
  Pencil,
  Trash2,
  PlayCircle,
  PauseCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  UserPlus,
  UserMinus,
  Bug,
  MessageSquare,
  ExternalLink,
  Video,
  Image,
  Settings,
  Link as LinkIcon,
  Save,
  Filter,
  XCircle,
  GitBranch,
  GitMerge,
  Coins,
  Undo2,
  AlertTriangle,
  MoreVertical,
  Phone,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Copy,
  Check,
  CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { User, DailyScore, WeeklyBiometric, ResetProject, ProjectStatus, CreateProjectRequest, UpdateProjectRequest, BugReport, BugStatus, BugSeverity, BugCategory, UserRole, GenealogyNode } from '@shared/types';
import { GenealogyTree, GenealogyList } from '@/components/ui/genealogy-tree';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ContentManager } from '@/components/admin/ContentManager';
import { DocsTab } from '@/components/admin/docs';
import { BugAIAnalysisPanel } from '@/components/admin/BugAIAnalysisPanel';
import { PaymentsTab } from '@/components/admin/PaymentsTab';

// Common US timezones
const US_TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Phoenix', label: 'Arizona (MST)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' },
];

export function AdminPage() {
  const currentUser = useAuthStore(s => s.user);
  const isAdmin = currentUser?.isAdmin;

  const { data: users, isLoading, error } = useAdminUsers();
  const updateUserMutation = useAdminUpdateUser();
  const bootstrapMutation = useBootstrapAdmin();
  const { data: deletedUsers, isLoading: deletedUsersLoading } = useAdminDeletedUsers();
  const deleteUserMutation = useAdminDeleteUser();
  const restoreUserMutation = useAdminRestoreUser();
  const permanentDeleteMutation = useAdminPermanentDeleteUser();
  const clearOtpMutation = useAdminClearOtp();
  const { data: duplicatesData, isLoading: duplicatesLoading, refetch: refetchDuplicates, isFetching: duplicatesFetching, error: duplicatesError } = useAdminFindDuplicates();
  const mergeUsersMutation = useAdminMergeUsers();

  // Impersonation and captain reassignment
  const startImpersonationMutation = useStartImpersonation();
  const { data: coachesData, isLoading: coachesLoading } = useAllCoaches();
  const reassignCaptainMutation = useReassignCaptain();
  const bulkReassignMutation = useBulkReassignCaptain();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Read URL params for tab and doc navigation (for opening docs in new tab)
  const urlTab = searchParams.get('tab');
  const urlSection = searchParams.get('section');
  const urlArticle = searchParams.get('article');

  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'name' | 'points' | 'createdAt'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [bootstrapDialogOpen, setBootstrapDialogOpen] = useState(false);
  const [bootstrapPhone, setBootstrapPhone] = useState('');
  const [bootstrapKey, setBootstrapKey] = useState('');
  const [detailUserId, setDetailUserId] = useState<string | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'projects' | 'content' | 'bugs' | 'payments' | 'settings' | 'genealogy' | 'deleted' | 'duplicates' | 'docs'>(
    urlTab === 'docs' ? 'docs' : 'users'
  );

  // Delete user state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [permanentDeleteDialogOpen, setPermanentDeleteDialogOpen] = useState(false);
  const [userToPermanentDelete, setUserToPermanentDelete] = useState<(User & { daysRemaining: number }) | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [deletedUsersPage, setDeletedUsersPage] = useState(1);

  // Advanced user filter state
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | 'all'>('all');
  const [captainFilter, setCaptainFilter] = useState<string>('all');
  const [pointsFilter, setPointsFilter] = useState<'all' | '0' | '1-50' | '51-100' | '100+'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Bug management state
  const [selectedBug, setSelectedBug] = useState<BugReport | null>(null);
  const [bugDetailSheetOpen, setBugDetailSheetOpen] = useState(false);
  const [bugStatusFilter, setBugStatusFilter] = useState<BugStatus | 'all'>('all');
  const [adminNotes, setAdminNotes] = useState('');

  // Genealogy state
  const [selectedGenealogyUserId, setSelectedGenealogyUserId] = useState<string | null>(null);
  const [genealogyViewMode, setGenealogyViewMode] = useState<'tree' | 'list'>('list');

  // Quiz link copy state
  const [copiedQuizLink, setCopiedQuizLink] = useState(false);

  // Captain reassignment state
  const [reassignDialogOpen, setReassignDialogOpen] = useState(false);
  const [selectedCaptainId, setSelectedCaptainId] = useState<string | null>(null);
  const [bulkSelectedUserIds, setBulkSelectedUserIds] = useState<string[]>([]);
  const [bulkReassignDialogOpen, setBulkReassignDialogOpen] = useState(false);
  const [bulkSelectedCaptainId, setBulkSelectedCaptainId] = useState<string | null>(null);

  // Project management state
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ResetProject | null>(null);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectStartDate, setProjectStartDate] = useState('');
  const [projectRegistrationOpen, setProjectRegistrationOpen] = useState(true);
  const [projectStatus, setProjectStatus] = useState<ProjectStatus>('draft');
  const [viewingProjectId, setViewingProjectId] = useState<string | null>(null);
  const [projectEnrollmentsSheetOpen, setProjectEnrollmentsSheetOpen] = useState(false);

  // Fetch user details when viewing
  const { data: userDetails, isLoading: detailsLoading } = useAdminUserDetails(detailUserId);

  // User enrollment queries
  const { data: userEnrollments, isLoading: userEnrollmentsLoading } = useAdminUserEnrollments(detailUserId);
  const enrollUserMutation = useAdminEnrollUser();
  const removeUserMutation = useAdminRemoveUserFromProject();

  // Project queries
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const createProjectMutation = useCreateProject();
  const updateProjectMutation = useUpdateProject();
  const deleteProjectMutation = useDeleteProject();
  const { data: projectEnrollments, isLoading: enrollmentsLoading } = useProjectEnrollments(viewingProjectId);

  // Bug report queries
  const { data: bugReports, isLoading: bugsLoading } = useAdminBugReports();
  const updateBugMutation = useAdminUpdateBugReport();
  const deleteBugMutation = useAdminDeleteBugReport();

  // System settings queries
  const { data: systemSettings, isLoading: settingsLoading } = useSystemSettings();
  const updateSettingsMutation = useUpdateSystemSettings();

  // Point settings queries
  const { data: pointSettings, isLoading: pointSettingsLoading } = usePointSettings();
  const updatePointSettingsMutation = useAdminUpdatePointSettings();

  // Genealogy queries
  const { data: genealogyRoots, isLoading: genealogyRootsLoading } = useAdminGenealogyRoots();
  const { data: selectedGenealogy, isLoading: selectedGenealogyLoading } = useAdminGenealogy(selectedGenealogyUserId);

  // Settings form state
  const [settingsGroupAVideo, setSettingsGroupAVideo] = useState('');
  const [settingsGroupBVideo, setSettingsGroupBVideo] = useState('');
  const [settingsKitOrderUrl, setSettingsKitOrderUrl] = useState('');
  const [settingsScaleOrderUrl, setSettingsScaleOrderUrl] = useState('');
  const [settingsFallbackPhone, setSettingsFallbackPhone] = useState('');
  const [settingsInitialized, setSettingsInitialized] = useState(false);

  // Point settings form state
  const [referralPointsCoach, setReferralPointsCoach] = useState(1);
  const [referralPointsChallenger, setReferralPointsChallenger] = useState(5);
  const [dailyHabitPoints, setDailyHabitPoints] = useState(1);
  const [biometricSubmissionPoints, setBiometricSubmissionPoints] = useState(25);
  const [pointSettingsInitialized, setPointSettingsInitialized] = useState(false);

  // Initialize settings form when data loads
  React.useEffect(() => {
    if (systemSettings && !settingsInitialized) {
      setSettingsGroupAVideo(systemSettings.groupAVideoUrl || '');
      setSettingsGroupBVideo(systemSettings.groupBVideoUrl || '');
      setSettingsKitOrderUrl(systemSettings.kitOrderUrl || '');
      setSettingsScaleOrderUrl(systemSettings.scaleOrderUrl || '');
      setSettingsFallbackPhone(systemSettings.fallbackPhone || '5039741671');
      setSettingsInitialized(true);
    }
  }, [systemSettings, settingsInitialized]);

  // Initialize point settings when data loads
  React.useEffect(() => {
    if (pointSettings && !pointSettingsInitialized) {
      setReferralPointsCoach(pointSettings.referralPointsCoach || 1);
      setReferralPointsChallenger(pointSettings.referralPointsChallenger || 5);
      setDailyHabitPoints(pointSettings.dailyHabitPoints || 1);
      setBiometricSubmissionPoints(pointSettings.biometricSubmissionPoints || 25);
      setPointSettingsInitialized(true);
    }
  }, [pointSettings, pointSettingsInitialized]);

  // State for navigating to specific docs from bug analysis
  // Initialize from URL params if present (for opening docs in new tab)
  const [targetDocSection, setTargetDocSection] = useState<string | null>(urlSection);
  const [targetDocArticle, setTargetDocArticle] = useState<string | null>(urlArticle);

  // Form state for edit dialog
  const [editPoints, setEditPoints] = useState(0);
  const [editIsAdmin, setEditIsAdmin] = useState(false);
  const [editIsTestMode, setEditIsTestMode] = useState(false);
  const [editIsActive, setEditIsActive] = useState(true);
  const [editRole, setEditRole] = useState<'challenger' | 'coach'>('challenger');
  // Profile fields for admin editing
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editTimezone, setEditTimezone] = useState('');

  // If not admin, show bootstrap option (allows first admin to be created)
  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <Card className="border-gold-200 bg-gold-50 dark:border-gold-800 dark:bg-gold-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gold-800 dark:text-gold-400">
              <Shield className="h-5 w-5" />
              Admin Access Required
            </CardTitle>
            <CardDescription className="text-gold-700 dark:text-gold-500">
              You need admin privileges to access this page. If no admin exists yet, you can bootstrap the first admin account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setBootstrapDialogOpen(true)} variant="outline">
              Bootstrap First Admin
            </Button>
          </CardContent>
        </Card>

        <Dialog open={bootstrapDialogOpen} onOpenChange={setBootstrapDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bootstrap Admin Account</DialogTitle>
              <DialogDescription>
                Create the first admin account. You'll need the secret bootstrap key and your registered phone number.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="bootstrap-phone">Your Phone Number</Label>
                <Input
                  id="bootstrap-phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={bootstrapPhone}
                  onChange={(e) => setBootstrapPhone(e.target.value)}
                />
                <p className="text-xs text-slate-500">Enter the phone number you registered with</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bootstrap-key">Secret Key</Label>
                <Input
                  id="bootstrap-key"
                  type="password"
                  placeholder="Enter bootstrap key"
                  value={bootstrapKey}
                  onChange={(e) => setBootstrapKey(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBootstrapDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  bootstrapMutation.mutate(
                    { phone: bootstrapPhone, secretKey: bootstrapKey },
                    {
                      onSuccess: () => {
                        setBootstrapDialogOpen(false);
                        // Reload to refresh user data
                        window.location.reload();
                      }
                    }
                  );
                }}
                disabled={bootstrapMutation.isPending || !bootstrapPhone || !bootstrapKey}
              >
                {bootstrapMutation.isPending ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                Create Admin
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  const handleSort = (field: 'name' | 'points' | 'createdAt') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setEditPoints(user.points || 0);
    setEditIsAdmin(user.isAdmin || false);
    setEditIsTestMode(user.isTestMode || false);
    setEditIsActive(user.isActive !== false);
    setEditRole(user.role || 'challenger');
    // Populate profile fields
    setEditName(user.name || '');
    setEditEmail(user.email || '');
    setEditPhone(user.phone || '');
    setEditTimezone(user.timezone || '');
    setEditDialogOpen(true);
  };

  const openDetailSheet = (user: User) => {
    setDetailUserId(user.id);
    setDetailSheetOpen(true);
  };

  const handleSaveUser = () => {
    if (!selectedUser) return;
    updateUserMutation.mutate(
      {
        targetUserId: selectedUser.id,
        updates: {
          points: editPoints,
          isAdmin: editIsAdmin,
          isTestMode: editIsTestMode,
          isActive: editIsActive,
          role: editRole,
          // Profile fields
          name: editName.trim() || undefined,
          email: editEmail.trim() || undefined,
          phone: editPhone.trim() || undefined,
          timezone: editTimezone || undefined,
        },
      },
      {
        onSuccess: () => {
          setEditDialogOpen(false);
          setSelectedUser(null);
        },
      }
    );
  };

  const handleToggleTestMode = (user: User) => {
    updateUserMutation.mutate({
      targetUserId: user.id,
      updates: { isTestMode: !user.isTestMode },
    });
  };

  const handleToggleAdmin = (user: User) => {
    updateUserMutation.mutate({
      targetUserId: user.id,
      updates: { isAdmin: !user.isAdmin },
    });
  };

  // Delete user functions
  const openDeleteDialog = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteUser = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setUserToDelete(null);
        }
      });
    }
  };

  const handleRestoreUser = (userId: string) => {
    restoreUserMutation.mutate(userId);
  };

  const openPermanentDeleteDialog = (user: User & { daysRemaining: number }) => {
    setUserToPermanentDelete(user);
    setPermanentDeleteDialogOpen(true);
  };

  const handlePermanentDelete = () => {
    if (userToPermanentDelete) {
      permanentDeleteMutation.mutate(userToPermanentDelete.id, {
        onSuccess: () => {
          setPermanentDeleteDialogOpen(false);
          setUserToPermanentDelete(null);
        }
      });
    }
  };

  // Helper to get user initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Project management functions
  const openCreateProjectDialog = () => {
    setEditingProject(null);
    setProjectName('');
    setProjectDescription('');
    setProjectStartDate('');
    setProjectRegistrationOpen(true);
    setProjectStatus('draft');
    setProjectDialogOpen(true);
  };

  const openEditProjectDialog = (project: ResetProject) => {
    setEditingProject(project);
    setProjectName(project.name);
    setProjectDescription(project.description || '');
    setProjectStartDate(project.startDate);
    setProjectRegistrationOpen(project.registrationOpen);
    setProjectStatus(project.status);
    setProjectDialogOpen(true);
  };

  const handleSaveProject = () => {
    if (editingProject) {
      updateProjectMutation.mutate(
        {
          projectId: editingProject.id,
          updates: {
            name: projectName,
            description: projectDescription,
            startDate: projectStartDate,
            registrationOpen: projectRegistrationOpen,
            status: projectStatus,
          },
        },
        { onSuccess: () => setProjectDialogOpen(false) }
      );
    } else {
      createProjectMutation.mutate(
        {
          name: projectName,
          description: projectDescription,
          startDate: projectStartDate,
          registrationOpen: projectRegistrationOpen,
        },
        { onSuccess: () => setProjectDialogOpen(false) }
      );
    }
  };

  const handleDeleteProject = (projectId: string) => {
    if (confirm('Are you sure you want to delete this project? This cannot be undone.')) {
      deleteProjectMutation.mutate(projectId);
    }
  };

  const viewProjectEnrollments = (projectId: string) => {
    setViewingProjectId(projectId);
    setProjectEnrollmentsSheetOpen(true);
  };

  const getStatusIcon = (status: ProjectStatus) => {
    switch (status) {
      case 'draft': return <AlertCircle className="h-4 w-4 text-slate-400" />;
      case 'upcoming': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'active': return <PlayCircle className="h-4 w-4 text-green-500" />;
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-purple-500" />;
    }
  };

  const getStatusBadge = (status: ProjectStatus) => {
    const styles: Record<ProjectStatus, string> = {
      draft: 'bg-slate-100 text-slate-600 border-slate-200',
      upcoming: 'bg-blue-50 text-blue-600 border-blue-200',
      active: 'bg-green-50 text-green-600 border-green-200',
      completed: 'bg-purple-50 text-purple-600 border-purple-200',
    };
    return (
      <Badge variant="outline" className={styles[status]}>
        {getStatusIcon(status)}
        <span className="ml-1 capitalize">{status}</span>
      </Badge>
    );
  };

  // Bug severity badge helper
  const getBugSeverityBadge = (severity: BugSeverity) => {
    const styles: Record<BugSeverity, string> = {
      low: 'bg-green-50 text-green-600 border-green-200',
      medium: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      high: 'bg-orange-50 text-orange-600 border-orange-200',
      critical: 'bg-red-50 text-red-600 border-red-200',
    };
    return (
      <Badge variant="outline" className={styles[severity]}>
        <span className="capitalize">{severity}</span>
      </Badge>
    );
  };

  // Bug status badge helper
  const getBugStatusBadge = (status: BugStatus) => {
    const styles: Record<BugStatus, string> = {
      open: 'bg-red-50 text-red-600 border-red-200',
      in_progress: 'bg-blue-50 text-blue-600 border-blue-200',
      resolved: 'bg-green-50 text-green-600 border-green-200',
      closed: 'bg-slate-50 text-slate-600 border-slate-200',
    };
    const labels: Record<BugStatus, string> = {
      open: 'Open',
      in_progress: 'In Progress',
      resolved: 'Resolved',
      closed: 'Closed',
    };
    return (
      <Badge variant="outline" className={styles[status]}>
        <span>{labels[status]}</span>
      </Badge>
    );
  };

  // Bug category label helper
  const getBugCategoryLabel = (category: BugCategory) => {
    const labels: Record<BugCategory, string> = {
      ui: 'UI / Visual',
      functionality: 'Functionality',
      performance: 'Performance',
      data: 'Data / Sync',
      other: 'Other',
    };
    return labels[category];
  };

  // Open bug detail sheet
  const openBugDetail = (bug: BugReport) => {
    setSelectedBug(bug);
    setAdminNotes(bug.adminNotes || '');
    setBugDetailSheetOpen(true);
  };

  // Handle bug status update
  const handleUpdateBugStatus = (bugId: string, status: BugStatus) => {
    updateBugMutation.mutate({ bugId, updates: { status } });
  };

  // Handle bug notes update
  const handleSaveBugNotes = () => {
    if (selectedBug) {
      updateBugMutation.mutate(
        { bugId: selectedBug.id, updates: { adminNotes } },
        { onSuccess: () => setBugDetailSheetOpen(false) }
      );
    }
  };

  // Handle bug delete
  const handleDeleteBug = (bugId: string) => {
    if (confirm('Are you sure you want to delete this bug report?')) {
      deleteBugMutation.mutate(bugId);
      setBugDetailSheetOpen(false);
    }
  };

  // Filter bug reports
  const filteredBugs = (bugReports || []).filter(bug =>
    bugStatusFilter === 'all' ? true : bug.status === bugStatusFilter
  );

  // Get unique captains (coaches) for the filter dropdown
  const captains = (users || []).filter(u => u.role === 'coach');

  // Check if any filters are active
  const hasActiveFilters = roleFilter !== 'all' || statusFilter !== 'all' || captainFilter !== 'all' || pointsFilter !== 'all';

  // Reset all filters
  const clearAllFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setStatusFilter('all');
    setCaptainFilter('all');
    setPointsFilter('all');
    setCurrentPage(1);
  };

  // Filter and sort users
  const filteredUsers = (users || [])
    .filter(user => {
      // Text search filter
      const search = searchTerm.toLowerCase();
      const matchesSearch = !search || (
        user.name?.toLowerCase().includes(search) ||
        user.email?.toLowerCase().includes(search) ||
        user.phone?.includes(search) ||
        user.referralCode?.toLowerCase().includes(search)
      );

      // Role filter
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;

      // Status filter
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && user.isActive !== false) ||
        (statusFilter === 'inactive' && user.isActive === false);

      // Captain filter - users whose captainId matches the selected captain
      const matchesCaptain = captainFilter === 'all' || user.captainId === captainFilter;

      // Points filter
      let matchesPoints = true;
      const points = user.points || 0;
      if (pointsFilter === '0') matchesPoints = points === 0;
      else if (pointsFilter === '1-50') matchesPoints = points >= 1 && points <= 50;
      else if (pointsFilter === '51-100') matchesPoints = points >= 51 && points <= 100;
      else if (pointsFilter === '100+') matchesPoints = points > 100;

      return matchesSearch && matchesRole && matchesStatus && matchesCaptain && matchesPoints;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '');
          break;
        case 'points':
          comparison = (a.points || 0) - (b.points || 0);
          break;
        case 'createdAt':
          comparison = (a.createdAt || 0) - (b.createdAt || 0);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  // Pagination calculations for users
  const totalFilteredUsers = filteredUsers.length;
  const totalPages = Math.ceil(totalFilteredUsers / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter, captainFilter, pointsFilter, pageSize]);

  // Pagination for deleted users
  const totalDeletedPages = Math.ceil((deletedUsers?.length || 0) / pageSize);
  const deletedStartIndex = (deletedUsersPage - 1) * pageSize;
  const deletedEndIndex = deletedStartIndex + pageSize;
  const paginatedDeletedUsers = deletedUsers?.slice(deletedStartIndex, deletedEndIndex) || [];

  const stats = {
    totalUsers: users?.length || 0,
    totalPoints: users?.reduce((sum, u) => sum + (u.points || 0), 0) || 0,
    coaches: users?.filter(u => u.role === 'coach').length || 0,
    admins: users?.filter(u => u.isAdmin).length || 0,
    totalProjects: projects?.length || 0,
    activeProjects: projects?.filter(p => p.status === 'active').length || 0,
    totalBugs: bugReports?.length || 0,
    openBugs: bugReports?.filter(b => b.status === 'open').length || 0,
    deletedUsers: deletedUsers?.length || 0,
    duplicateSets: duplicatesData?.totalDuplicateSets || 0,
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4 inline ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 inline ml-1" />
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-red-700">Failed to load users: {(error as Error).message}</p>
        </CardContent>
      </Card>
    );
  }

  // Get the user object for the detail sheet
  const detailUser = users?.find(u => u.id === detailUserId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-navy-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Manage users, points, and system access
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <ShieldCheck className="h-4 w-4 text-green-600" />
          Admin
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900 dark:text-white">{stats.totalUsers}</p>
                <p className="text-xs text-slate-500">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-gold-100 dark:bg-gold-900/30 p-2 rounded-lg">
                <Award className="h-5 w-5 text-gold-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900 dark:text-white">{stats.totalPoints}</p>
                <p className="text-xs text-slate-500">Total Points</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                <Crown className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900 dark:text-white">{stats.coaches}</p>
                <p className="text-xs text-slate-500">Group Leaders</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                <ShieldCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900 dark:text-white">{stats.admins}</p>
                <p className="text-xs text-slate-500">Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg">
                <FolderKanban className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900 dark:text-white">{stats.activeProjects}/{stats.totalProjects}</p>
                <p className="text-xs text-slate-500">Active Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stats.openBugs > 0 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-slate-100 dark:bg-slate-800'}`}>
                <Bug className={`h-5 w-5 ${stats.openBugs > 0 ? 'text-red-600' : 'text-slate-600'}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900 dark:text-white">{stats.openBugs}/{stats.totalBugs}</p>
                <p className="text-xs text-slate-500">Open Bugs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation - Mobile Scrollable */}
      <div className="relative border-b border-slate-200 dark:border-navy-700">
        {/* Scroll fade indicator - left */}
        <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-white dark:from-navy-900 to-transparent z-10 pointer-events-none md:hidden" />
        {/* Scroll fade indicator - right */}
        <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white dark:from-navy-900 to-transparent z-10 pointer-events-none md:hidden" />

        <div
          className="flex gap-1 overflow-x-auto scrollbar-hide px-1 -mx-1 snap-x snap-mandatory touch-pan-x"
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-shrink-0 snap-start px-3 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'users'
                ? 'border-gold-500 text-gold-600 dark:text-gold-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Users className="h-4 w-4 inline mr-1.5" />
            Users
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex-shrink-0 snap-start px-3 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'projects'
                ? 'border-gold-500 text-gold-600 dark:text-gold-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <FolderKanban className="h-4 w-4 inline mr-1.5" />
            Projects
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`flex-shrink-0 snap-start px-3 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'content'
                ? 'border-gold-500 text-gold-600 dark:text-gold-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Video className="h-4 w-4 inline mr-1.5" />
            Content
          </button>
          <button
            onClick={() => setActiveTab('bugs')}
            className={`flex-shrink-0 snap-start px-3 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'bugs'
                ? 'border-gold-500 text-gold-600 dark:text-gold-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Bug className="h-4 w-4 inline mr-1.5" />
            Bugs
            {stats.openBugs > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400 rounded-full">
                {stats.openBugs}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`flex-shrink-0 snap-start px-3 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'payments'
                ? 'border-gold-500 text-gold-600 dark:text-gold-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <CreditCard className="h-4 w-4 inline mr-1.5" />
            Payments
          </button>
          <button
            onClick={() => setActiveTab('genealogy')}
            className={`flex-shrink-0 snap-start px-3 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'genealogy'
                ? 'border-gold-500 text-gold-600 dark:text-gold-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <GitBranch className="h-4 w-4 inline mr-1.5" />
            Genealogy
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-shrink-0 snap-start px-3 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-gold-500 text-gold-600 dark:text-gold-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Settings className="h-4 w-4 inline mr-1.5" />
            Settings
          </button>
          <button
            onClick={() => setActiveTab('deleted')}
            className={`flex-shrink-0 snap-start px-3 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'deleted'
                ? 'border-gold-500 text-gold-600 dark:text-gold-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Trash2 className="h-4 w-4 inline mr-1.5" />
            Deleted
            {stats.deletedUsers > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400 rounded-full">
                {stats.deletedUsers}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('duplicates')}
            className={`flex-shrink-0 snap-start px-3 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'duplicates'
                ? 'border-gold-500 text-gold-600 dark:text-gold-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <GitMerge className="h-4 w-4 inline mr-1.5" />
            Duplicates
            {stats.duplicateSets > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400 rounded-full">
                {stats.duplicateSets}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`flex-shrink-0 snap-start px-3 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'docs'
                ? 'border-gold-500 text-gold-600 dark:text-gold-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="h-4 w-4 inline mr-1.5" />
            Docs
          </button>
        </div>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 transition-colors">
          <CardHeader>
            <div className="flex flex-col gap-4">
              {/* Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-2">
                  <CardTitle>All Users</CardTitle>
                  <Badge variant="outline" className="text-slate-500">
                    {filteredUsers.length} of {users?.length || 0}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search name, email, phone, code..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-8"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <Button
                    variant={showFilters ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className={hasActiveFilters && !showFilters ? "border-gold-500 text-gold-600" : ""}
                  >
                    <Filter className="h-4 w-4 mr-1" />
                    Filters
                    {hasActiveFilters && (
                      <span className="ml-1 px-1.5 py-0.5 text-xs bg-gold-100 text-gold-700 rounded-full">!</span>
                    )}
                  </Button>
                </div>
              </div>

              {/* Advanced Filters Row */}
              {showFilters && (
                <div className="flex flex-wrap items-center gap-3 p-4 bg-slate-50 dark:bg-navy-950 rounded-lg border border-slate-200 dark:border-navy-700">
                  {/* Role Filter */}
                  <div className="flex flex-col gap-1 min-w-[140px]">
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Role</label>
                    <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as UserRole | 'all')}>
                      <SelectTrigger className="h-9 bg-white dark:bg-navy-900">
                        <SelectValue placeholder="All Roles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="coach">Coaches</SelectItem>
                        <SelectItem value="challenger">Challengers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status Filter */}
                  <div className="flex flex-col gap-1 min-w-[140px]">
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Status</label>
                    <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'active' | 'inactive' | 'all')}>
                      <SelectTrigger className="h-9 bg-white dark:bg-navy-900">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Captain/Group Leader Filter */}
                  <div className="flex flex-col gap-1 min-w-[180px]">
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Group Leader</label>
                    <Select value={captainFilter} onValueChange={setCaptainFilter}>
                      <SelectTrigger className="h-9 bg-white dark:bg-navy-900">
                        <SelectValue placeholder="All Leaders" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Leaders</SelectItem>
                        {captains.map((captain) => (
                          <SelectItem key={captain.id} value={captain.id}>
                            {captain.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Points Filter */}
                  <div className="flex flex-col gap-1 min-w-[140px]">
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Points Range</label>
                    <Select value={pointsFilter} onValueChange={(v) => setPointsFilter(v as typeof pointsFilter)}>
                      <SelectTrigger className="h-9 bg-white dark:bg-navy-900">
                        <SelectValue placeholder="All Points" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Points</SelectItem>
                        <SelectItem value="0">0 Points</SelectItem>
                        <SelectItem value="1-50">1-50 Points</SelectItem>
                        <SelectItem value="51-100">51-100 Points</SelectItem>
                        <SelectItem value="100+">100+ Points</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Clear Filters Button */}
                  {hasActiveFilters && (
                    <div className="flex flex-col gap-1 justify-end">
                      <label className="text-xs font-medium text-transparent">Clear</label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="h-9 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Clear All
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {/* Bulk Actions Bar */}
            {bulkSelectedUserIds.length > 0 && (
              <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-between">
                <span className="text-sm font-medium">
                  {bulkSelectedUserIds.length} user{bulkSelectedUserIds.length !== 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setBulkSelectedUserIds([])}
                  >
                    Clear Selection
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setBulkReassignDialogOpen(true)}
                  >
                    <UserCog className="h-4 w-4 mr-1" />
                    Bulk Reassign Captain
                  </Button>
                </div>
              </div>
            )}

            {/* Desktop Table View - Hidden on mobile */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-gold-600 focus:ring-gold-500"
                        checked={bulkSelectedUserIds.length === paginatedUsers.filter(u => !u.isAdmin).length && paginatedUsers.filter(u => !u.isAdmin).length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setBulkSelectedUserIds(paginatedUsers.filter(u => !u.isAdmin).map(u => u.id));
                          } else {
                            setBulkSelectedUserIds([]);
                          }
                        }}
                        title="Select all on this page"
                      />
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-slate-50 dark:hover:bg-navy-800"
                      onClick={() => handleSort('name')}
                    >
                      Name <SortIcon field="name" />
                    </TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Group Leader</TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-slate-50 dark:hover:bg-navy-800 text-right"
                      onClick={() => handleSort('points')}
                    >
                      Points <SortIcon field="points" />
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        {!user.isAdmin && (
                          <input
                            type="checkbox"
                            className="rounded border-slate-300 text-gold-600 focus:ring-gold-500"
                            checked={bulkSelectedUserIds.includes(user.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setBulkSelectedUserIds([...bulkSelectedUserIds, user.id]);
                              } else {
                                setBulkSelectedUserIds(bulkSelectedUserIds.filter(id => id !== user.id));
                              }
                            }}
                          />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            {user.avatarUrl ? (
                              <AvatarImage src={user.avatarUrl} alt={user.name} />
                            ) : null}
                            <AvatarFallback className="bg-gold-100 text-gold-700 text-xs">
                              {getInitials(user.name || 'U')}
                            </AvatarFallback>
                          </Avatar>
                          <span>{user.name}</span>
                          {user.isTestMode && (
                            <Eye className="h-4 w-4 text-blue-600" title="Test Mode" />
                          )}
                          {user.isAdmin && (
                            <ShieldCheck className="h-4 w-4 text-green-600" title="Admin" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-500 text-sm">
                        <div>{user.email}</div>
                        <div className="text-xs text-slate-400">{user.phone}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'coach' ? 'default' : 'secondary'}>
                          {user.role === 'coach' ? 'Coach' : 'Challenger'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-500 text-sm">
                        {user.captainId ? (
                          user.captainId === user.id ? (
                            <span className="text-gold-600 font-medium">Self</span>
                          ) : (
                            captains.find(c => c.id === user.captainId)?.name ||
                            <span className="text-slate-400">Unknown</span>
                          )
                        ) : (
                          <span className="text-red-500">None (Orphan)</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {user.points || 0}
                      </TableCell>
                      <TableCell>
                        {user.isActive !== false ? (
                          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
                            <Ban className="h-3 w-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openDetailSheet(user)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(user)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleTestMode(user)}
                            >
                              {user.isTestMode ? (
                                <>
                                  <Eye className="h-4 w-4 mr-2 text-blue-600" />
                                  Disable Test Mode
                                </>
                              ) : (
                                <>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Enable Test Mode
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleAdmin(user)}
                              disabled={user.id === currentUser?.id}
                            >
                              {user.isAdmin ? (
                                <>
                                  <ShieldOff className="h-4 w-4 mr-2" />
                                  Remove Admin
                                </>
                              ) : (
                                <>
                                  <ShieldCheck className="h-4 w-4 mr-2" />
                                  Make Admin
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => openDeleteDialog(user)}
                              disabled={user.id === currentUser?.id}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View - Visible only on mobile */}
            <div className="md:hidden space-y-3">
              {paginatedUsers.map((user) => (
                <Card key={user.id} className="bg-slate-50 dark:bg-navy-950 border-slate-200 dark:border-navy-700">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      {/* User Info */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar className="h-12 w-12 shrink-0">
                          {user.avatarUrl ? (
                            <AvatarImage src={user.avatarUrl} alt={user.name} />
                          ) : null}
                          <AvatarFallback className="bg-gold-100 text-gold-700">
                            {getInitials(user.name || 'U')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-navy-900 dark:text-white truncate">
                              {user.name}
                            </p>
                            {user.isTestMode && (
                              <Eye className="h-4 w-4 text-blue-600 shrink-0" title="Test Mode" />
                            )}
                            {user.isAdmin && (
                              <ShieldCheck className="h-4 w-4 text-green-600 shrink-0" title="Admin" />
                            )}
                          </div>
                          <p className="text-sm text-slate-500 truncate">{user.email}</p>
                          <p className="text-xs text-slate-400">{user.phone}</p>
                        </div>
                      </div>

                      {/* Actions Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="shrink-0">
                            <MoreVertical className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openDetailSheet(user)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(user)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleTestMode(user)}
                          >
                            {user.isTestMode ? (
                              <>
                                <Eye className="h-4 w-4 mr-2 text-blue-600" />
                                Disable Test Mode
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                Enable Test Mode
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleAdmin(user)}
                            disabled={user.id === currentUser?.id}
                          >
                            {user.isAdmin ? (
                              <>
                                <ShieldOff className="h-4 w-4 mr-2" />
                                Remove Admin
                              </>
                            ) : (
                              <>
                                <ShieldCheck className="h-4 w-4 mr-2" />
                                Make Admin
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(user)}
                            disabled={user.id === currentUser?.id}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Status Row */}
                    <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-navy-700">
                      <Badge variant={user.role === 'coach' ? 'default' : 'secondary'}>
                        {user.role === 'coach' ? 'Coach' : 'Challenger'}
                      </Badge>
                      {user.isActive !== false ? (
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
                          Inactive
                        </Badge>
                      )}
                      <div className="ml-auto flex items-center gap-1 text-sm font-mono text-gold-600">
                        <Award className="h-4 w-4" />
                        {user.points || 0} pts
                      </div>
                    </div>

                    {/* Group Leader */}
                    <div className="text-xs text-slate-500 mt-2">
                      <span className="font-medium">Group Leader: </span>
                      {user.captainId ? (
                        user.captainId === user.id ? (
                          <span className="text-gold-600">Self</span>
                        ) : (
                          captains.find(c => c.id === user.captainId)?.name || 'Unknown'
                        )
                      ) : (
                        <span className="text-red-500">None (Orphan)</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination Controls */}
            {filteredUsers.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-slate-200 dark:border-navy-700">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span>
                    Showing {startIndex + 1}-{Math.min(endIndex, totalFilteredUsers)} of {totalFilteredUsers} users
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <div className="hidden sm:flex items-center gap-2">
                    <span>Per page:</span>
                    <Select
                      value={pageSize.toString()}
                      onValueChange={(value) => {
                        setPageSize(Number(value));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-[70px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-1 px-2">
                    <span className="text-sm font-medium">
                      Page {currentPage} of {totalPages || 1}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage >= totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                No users found matching your search.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Projects Tab */}
      {activeTab === 'projects' && (
        <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 transition-colors">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Reset Projects</CardTitle>
                <CardDescription>Manage 28-day challenge projects</CardDescription>
              </div>
              <Button onClick={openCreateProjectDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {projectsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
              </div>
            ) : projects && projects.length > 0 ? (
              <div className="space-y-4">
                {projects.map((project) => (
                  <Card key={project.id} className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-navy-900 dark:text-white">
                            {project.name}
                          </h3>
                          {getStatusBadge(project.status)}
                          {project.registrationOpen ? (
                            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 text-xs">
                              <ToggleRight className="h-3 w-3 mr-1" />
                              Registration Open
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-slate-400 border-slate-200 bg-slate-50 text-xs">
                              <ToggleLeft className="h-3 w-3 mr-1" />
                              Registration Closed
                            </Badge>
                          )}
                        </div>
                        {project.description && (
                          <p className="text-sm text-slate-500">{project.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {project.startDate} → {project.endDate}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewProjectEnrollments(project.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Participants
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditProjectDialog(project)}
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteProject(project.id)}
                          disabled={deleteProjectMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FolderKanban className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No projects created yet.</p>
                <Button onClick={openCreateProjectDialog} variant="outline" className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Project
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Content Tab */}
      {activeTab === 'content' && <ContentManager />}

      {/* Bugs Tab */}
      {activeTab === 'bugs' && (
        <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 transition-colors">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Bug Reports</CardTitle>
                <CardDescription>View and manage user-submitted bug reports</CardDescription>
              </div>
              <div className="flex gap-2">
                {(['all', 'open', 'in_progress', 'resolved', 'closed'] as const).map((status) => (
                  <Button
                    key={status}
                    variant={bugStatusFilter === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setBugStatusFilter(status)}
                    className="capitalize"
                  >
                    {status === 'all' ? 'All' : status === 'in_progress' ? 'In Progress' : status}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {bugsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
              </div>
            ) : filteredBugs.length > 0 ? (
              <div className="space-y-4">
                {filteredBugs.map((bug) => (
                  <Card key={bug.id} className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-navy-900 dark:text-white">
                            {bug.title}
                          </h3>
                          {getBugSeverityBadge(bug.severity)}
                          {getBugStatusBadge(bug.status)}
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-2">{bug.description}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span>From: {bug.userName} ({bug.userEmail})</span>
                          <span>Category: {getBugCategoryLabel(bug.category)}</span>
                          <span>{new Date(bug.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {bug.screenshotUrl && bug.screenshotUrl.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              <Image className="h-3 w-3 mr-1" />
                              Screenshot
                            </Badge>
                          )}
                          {bug.videoUrl && bug.videoUrl.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              <Video className="h-3 w-3 mr-1" />
                              Video
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openBugDetail(bug)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {bug.status === 'open' && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateBugStatus(bug.id, 'in_progress')}
                            disabled={updateBugMutation.isPending}
                          >
                            Start
                          </Button>
                        )}
                        {bug.status === 'in_progress' && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleUpdateBugStatus(bug.id, 'resolved')}
                            disabled={updateBugMutation.isPending}
                          >
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Bug className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">
                  {bugStatusFilter === 'all'
                    ? 'No bug reports submitted yet.'
                    : `No ${bugStatusFilter === 'in_progress' ? 'in progress' : bugStatusFilter} bugs.`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && currentUser && (
        <PaymentsTab userId={currentUser.id} users={users} />
      )}

      {/* Genealogy Tab */}
      {activeTab === 'genealogy' && (
        <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 transition-colors">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5" />
                  Referral Genealogy
                </CardTitle>
                <CardDescription>
                  View the complete referral tree for any coach or user.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={genealogyViewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setGenealogyViewMode('list')}
                >
                  <Users className="h-4 w-4 mr-1" />
                  List
                </Button>
                <Button
                  variant={genealogyViewMode === 'tree' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setGenealogyViewMode('tree')}
                >
                  <GitBranch className="h-4 w-4 mr-1" />
                  Tree
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {genealogyRootsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gold-500" />
              </div>
            ) : (
              <>
                {/* User Selector */}
                <div className="space-y-2">
                  <Label>Select User to View Tree</Label>
                  <Select
                    value={selectedGenealogyUserId || ''}
                    onValueChange={(value) => setSelectedGenealogyUserId(value || null)}
                  >
                    <SelectTrigger className="w-full sm:w-80">
                      <SelectValue placeholder="Select a user to view their tree..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(genealogyRoots) && genealogyRoots.map((root) => (
                        <SelectItem key={root.userId} value={root.userId}>
                          <div className="flex items-center gap-2">
                            <span>{root.name}</span>
                            {root.directReferrals > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {root.directReferrals} referrals
                              </Badge>
                            )}
                            <Badge variant="secondary" className="text-xs capitalize">
                              {root.role}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">
                    {Array.isArray(genealogyRoots) ? genealogyRoots.length : 0} users (sorted by referral count)
                  </p>
                </div>

                {/* Genealogy Display */}
                {selectedGenealogyUserId && (
                  <>
                    {selectedGenealogyLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-gold-500" />
                      </div>
                    ) : selectedGenealogy ? (
                      genealogyViewMode === 'tree' ? (
                        <GenealogyTree
                          data={selectedGenealogy}
                          showStats={true}
                          onNodeClick={(node) => {
                            // Could open user details or navigate
                            console.log('Clicked node:', node);
                          }}
                        />
                      ) : (
                        <GenealogyList
                          data={selectedGenealogy}
                          maxDepth={10}
                          onNodeClick={(node) => {
                            // Could open user details
                            console.log('Clicked node:', node);
                          }}
                        />
                      )
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <Users className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                        <p>No genealogy data found for this user.</p>
                      </div>
                    )}
                  </>
                )}

                {!selectedGenealogyUserId && (
                  <div className="text-center py-12 text-slate-500">
                    <GitBranch className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                    <p className="text-lg font-medium">Select a coach to view their referral tree</p>
                    <p className="text-sm mt-1">Choose from the dropdown above to explore the genealogy.</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              System Settings
            </CardTitle>
            <CardDescription>
              Configure onboarding videos and kit order link for cohort selection flow.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {settingsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gold-500" />
              </div>
            ) : (
              <>
                {/* Group A Video URL */}
                <div className="space-y-2">
                  <Label htmlFor="group-a-video" className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-emerald-500" />
                    Group A (Protocol) Video URL
                  </Label>
                  <Input
                    id="group-a-video"
                    type="url"
                    placeholder="https://..."
                    value={settingsGroupAVideo}
                    onChange={(e) => setSettingsGroupAVideo(e.target.value)}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-slate-500">
                    The orientation video shown to Protocol group participants during onboarding.
                  </p>
                </div>

                {/* Group B Video URL */}
                <div className="space-y-2">
                  <Label htmlFor="group-b-video" className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-blue-500" />
                    Group B (DIY) Video URL
                  </Label>
                  <Input
                    id="group-b-video"
                    type="url"
                    placeholder="https://..."
                    value={settingsGroupBVideo}
                    onChange={(e) => setSettingsGroupBVideo(e.target.value)}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-slate-500">
                    The orientation video shown to Self-Directed group participants during onboarding.
                  </p>
                </div>

                {/* Kit Order URL */}
                <div className="space-y-2">
                  <Label htmlFor="kit-order-url" className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-amber-500" />
                    Nutrition Kit Order URL (Fallback)
                  </Label>
                  <Input
                    id="kit-order-url"
                    type="url"
                    placeholder="https://..."
                    value={settingsKitOrderUrl}
                    onChange={(e) => setSettingsKitOrderUrl(e.target.value)}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-slate-500">
                    Fallback URL for kit orders when user has no coach or coach has no cart link.
                  </p>
                </div>

                {/* Scale Order URL */}
                <div className="space-y-2">
                  <Label htmlFor="scale-order-url" className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-blue-500" />
                    Smart Scale Order URL
                  </Label>
                  <Input
                    id="scale-order-url"
                    type="url"
                    placeholder="https://amazon.com/..."
                    value={settingsScaleOrderUrl}
                    onChange={(e) => setSettingsScaleOrderUrl(e.target.value)}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-slate-500">
                    Amazon or other link for users to purchase a smart scale.
                  </p>
                </div>

                {/* Fallback Phone */}
                <div className="space-y-2">
                  <Label htmlFor="fallback-phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-green-500" />
                    Fallback Phone Number
                  </Label>
                  <Input
                    id="fallback-phone"
                    type="tel"
                    placeholder="5039741671"
                    value={settingsFallbackPhone}
                    onChange={(e) => setSettingsFallbackPhone(e.target.value)}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-slate-500">
                    Phone number shown when user has no coach or coach has no cart link (digits only).
                  </p>
                </div>

                {/* Save Onboarding Settings Button */}
                <div className="pt-4 border-t">
                  <Button
                    onClick={() => {
                      updateSettingsMutation.mutate({
                        groupAVideoUrl: settingsGroupAVideo,
                        groupBVideoUrl: settingsGroupBVideo,
                        kitOrderUrl: settingsKitOrderUrl,
                        scaleOrderUrl: settingsScaleOrderUrl,
                        fallbackPhone: settingsFallbackPhone
                      });
                    }}
                    disabled={updateSettingsMutation.isPending}
                    className="bg-gold-500 hover:bg-gold-600 text-navy-900"
                  >
                    {updateSettingsMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Onboarding Settings
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Point Settings Card */}
      {activeTab === 'settings' && (
        <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 transition-colors mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-gold-500" />
              Point Values Configuration
            </CardTitle>
            <CardDescription>
              Configure the point values awarded for different activities in the challenge.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {pointSettingsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gold-500" />
              </div>
            ) : (
              <>
                {/* Referral Points Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Referral Points
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="referral-coach" className="text-sm">
                        Coach Referral Bonus
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="referral-coach"
                          type="number"
                          min="0"
                          value={referralPointsCoach}
                          onChange={(e) => setReferralPointsCoach(parseInt(e.target.value) || 0)}
                          className="w-24"
                        />
                        <span className="text-sm text-slate-500">points per referral</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Points a coach earns when someone joins using their referral code.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="referral-challenger" className="text-sm">
                        Challenger Referral Bonus
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="referral-challenger"
                          type="number"
                          min="0"
                          value={referralPointsChallenger}
                          onChange={(e) => setReferralPointsChallenger(parseInt(e.target.value) || 0)}
                          className="w-24"
                        />
                        <span className="text-sm text-slate-500">points per referral</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Points a challenger earns when someone joins using their referral code.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Activity Points Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Activity Points
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="daily-habit" className="text-sm">
                        Daily Habit Points
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="daily-habit"
                          type="number"
                          min="0"
                          value={dailyHabitPoints}
                          onChange={(e) => setDailyHabitPoints(parseInt(e.target.value) || 0)}
                          className="w-24"
                        />
                        <span className="text-sm text-slate-500">points per habit</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Points earned for each daily habit completed (water, steps, sleep, lesson).
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="biometric" className="text-sm">
                        Biometric Submission Points
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="biometric"
                          type="number"
                          min="0"
                          value={biometricSubmissionPoints}
                          onChange={(e) => setBiometricSubmissionPoints(parseInt(e.target.value) || 0)}
                          className="w-24"
                        />
                        <span className="text-sm text-slate-500">points per submission</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Points earned for each weekly biometric weigh-in submission.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Current Values Display */}
                <div className="bg-slate-50 dark:bg-navy-800 rounded-lg p-4">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3">Current Active Values</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-navy-900 dark:text-white">{pointSettings?.referralPointsCoach || 1}</div>
                      <div className="text-xs text-slate-500">Coach Referral</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-navy-900 dark:text-white">{pointSettings?.referralPointsChallenger || 5}</div>
                      <div className="text-xs text-slate-500">Challenger Referral</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-navy-900 dark:text-white">{pointSettings?.dailyHabitPoints || 1}</div>
                      <div className="text-xs text-slate-500">Daily Habit</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-navy-900 dark:text-white">{pointSettings?.biometricSubmissionPoints || 25}</div>
                      <div className="text-xs text-slate-500">Biometric</div>
                    </div>
                  </div>
                </div>

                {/* Save Point Settings Button */}
                <div className="pt-4 border-t">
                  <Button
                    onClick={() => {
                      updatePointSettingsMutation.mutate({
                        referralPointsCoach,
                        referralPointsChallenger,
                        dailyHabitPoints,
                        biometricSubmissionPoints
                      });
                    }}
                    disabled={updatePointSettingsMutation.isPending}
                    className="bg-gold-500 hover:bg-gold-600 text-navy-900"
                  >
                    {updatePointSettingsMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Point Settings
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Bug Detail Sheet */}
      <Sheet open={bugDetailSheetOpen} onOpenChange={setBugDetailSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5" />
              Bug Report Details
            </SheetTitle>
            <SheetDescription>
              {selectedBug?.title}
            </SheetDescription>
          </SheetHeader>

          {selectedBug && (
            <div className="mt-6 space-y-6">
              {/* Bug Info */}
              <Card>
                <CardContent className="pt-4 space-y-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getBugSeverityBadge(selectedBug.severity)}
                    {getBugStatusBadge(selectedBug.status)}
                    <Badge variant="outline">{getBugCategoryLabel(selectedBug.category)}</Badge>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">Description</Label>
                    <p className="text-sm mt-1">{selectedBug.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-xs text-slate-500">Submitted By</Label>
                      <p className="mt-1">{selectedBug.userName}</p>
                      <p className="text-xs text-slate-500">{selectedBug.userEmail}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500">Date</Label>
                      <p className="mt-1">{new Date(selectedBug.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">Page URL</Label>
                    <p className="text-xs mt-1 font-mono break-all">{selectedBug.pageUrl}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">Browser</Label>
                    <p className="text-xs mt-1 break-all text-slate-600">{selectedBug.userAgent}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Attachments */}
              {(selectedBug.screenshotUrl?.length > 0 || selectedBug.videoUrl?.length > 0) && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Attachments</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedBug.screenshotUrl && selectedBug.screenshotUrl.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Image className="h-4 w-4 text-blue-600" />
                          <span>Screenshot</span>
                          <a
                            href={selectedBug.screenshotUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-auto text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            Open in new tab <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                        <img
                          src={selectedBug.screenshotUrl}
                          alt="Bug screenshot"
                          className="w-full rounded-lg border border-slate-200 max-h-[300px] object-contain bg-slate-100"
                        />
                      </div>
                    )}
                    {selectedBug.videoUrl && selectedBug.videoUrl.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Video className="h-4 w-4 text-purple-600" />
                          <span>Screen Recording</span>
                          <a
                            href={selectedBug.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-auto text-purple-600 hover:text-purple-700 flex items-center gap-1"
                          >
                            Open in new tab <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                        <video
                          src={selectedBug.videoUrl}
                          controls
                          className="w-full rounded-lg border border-slate-200 max-h-[300px] bg-slate-900"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Status Update */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Update Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {(['open', 'in_progress', 'resolved', 'closed'] as BugStatus[]).map((status) => (
                      <Button
                        key={status}
                        variant={selectedBug.status === status ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          handleUpdateBugStatus(selectedBug.id, status);
                          setSelectedBug({ ...selectedBug, status });
                        }}
                        disabled={updateBugMutation.isPending}
                        className="capitalize"
                      >
                        {status === 'in_progress' ? 'In Progress' : status}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* AI Bug Analysis */}
              <BugAIAnalysisPanel
                bugId={selectedBug.id}
                hasScreenshot={!!selectedBug.screenshotUrl && selectedBug.screenshotUrl.length > 0}
                hasVideo={!!selectedBug.videoUrl && selectedBug.videoUrl.length > 0}
              />

              {/* Admin Notes */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Admin Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <textarea
                    className="w-full min-h-[100px] p-3 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gold-500"
                    placeholder="Add internal notes about this bug..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                  />
                  <Button
                    onClick={handleSaveBugNotes}
                    disabled={updateBugMutation.isPending}
                    className="w-full"
                  >
                    {updateBugMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Save Notes
                  </Button>
                </CardContent>
              </Card>

              {/* Delete Bug */}
              <Card className="border-red-200">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-red-700">Delete Bug Report</p>
                      <p className="text-xs text-slate-500">This action cannot be undone.</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteBug(selectedBug.id)}
                      disabled={deleteBugMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* User Detail Sheet */}
      <Sheet open={detailSheetOpen} onOpenChange={setDetailSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              User Details
            </SheetTitle>
            <SheetDescription>
              {detailUser?.name} - {detailUser?.email}
            </SheetDescription>
          </SheetHeader>

          {detailsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
            </div>
          ) : userDetails ? (
            <div className="mt-6 space-y-6">
              {/* User Info Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Phone:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">{userDetails.user.phone}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm(`Clear OTP verification for ${userDetails.user.phone}?\n\nThis will allow the user to re-verify their phone number.`)) {
                            clearOtpMutation.mutate(userDetails.user.phone);
                          }
                        }}
                        disabled={clearOtpMutation.isPending}
                        className="h-6 px-2 text-xs text-orange-400 hover:text-orange-300 hover:bg-orange-500/20 border-orange-500/50"
                      >
                        {clearOtpMutation.isPending ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <>
                            <Phone className="h-3 w-3 mr-1" />
                            Clear OTP
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Role:</span>
                    <Badge variant={userDetails.user.role === 'coach' ? 'default' : 'secondary'}>
                      {userDetails.user.role}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Points:</span>
                    <span className="font-bold text-gold-600">{userDetails.user.points || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Referral Code:</span>
                    <span className="font-mono text-xs">{userDetails.user.referralCode}</span>
                  </div>
                  {/* Quiz Referral Link with Copy */}
                  {userDetails.user.referralCode && (
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-500 text-sm">Quiz Referral Link:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded font-mono break-all">
                          {`https://28dayreset.com/quiz?ref=${userDetails.user.referralCode}${userEnrollments?.[0]?.projectId ? `&project=${userEnrollments[0].projectId}` : ''}`}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          className="shrink-0"
                          onClick={() => {
                            const link = `https://28dayreset.com/quiz?ref=${userDetails.user.referralCode}${userEnrollments?.[0]?.projectId ? `&project=${userEnrollments[0].projectId}` : ''}`;
                            navigator.clipboard.writeText(link);
                            setCopiedQuizLink(true);
                            setTimeout(() => setCopiedQuizLink(false), 2000);
                          }}
                        >
                          {copiedQuizLink ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {userEnrollments?.[0]?.projectId && (
                        <p className="text-xs text-slate-400 mt-1">
                          Includes project: {userEnrollments[0].projectId.substring(0, 8)}...
                        </p>
                      )}
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-500">Joined:</span>
                    <span>{userDetails.user.createdAt ? new Date(userDetails.user.createdAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Admin:</span>
                    <span>{userDetails.user.isAdmin ? 'Yes' : 'No'}</span>
                  </div>
                  {/* Payment Verification - Source of Truth */}
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-slate-500 font-medium">Payment Status:</span>
                      {userDetails.user.stripePaymentId ? (
                        <Badge className="bg-green-600 text-white">
                          Verified
                        </Badge>
                      ) : userDetails.user.couponCodeUsed ? (
                        <Badge className="bg-blue-600 text-white">
                          Coupon: {userDetails.user.couponCodeUsed}
                        </Badge>
                      ) : userDetails.user.role === 'coach' ? (
                        <Badge variant="secondary">
                          Coach (Free)
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                          No Payment Record
                        </Badge>
                      )}
                    </div>
                    {userDetails.user.stripePaymentId && (
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Amount:</span>
                          <span className="font-mono text-green-600">
                            ${((userDetails.user.stripePaymentAmount || 0) / 100).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Stripe ID:</span>
                          <a
                            href={`https://dashboard.stripe.com/payments/${userDetails.user.stripePaymentId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-blue-500 hover:underline"
                          >
                            {userDetails.user.stripePaymentId.slice(0, 20)}...
                          </a>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Paid:</span>
                          <span>
                            {userDetails.user.stripePaymentAt
                              ? new Date(userDetails.user.stripePaymentAt).toLocaleString()
                              : 'Unknown'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* PWA Install Status */}
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">App Installed:</span>
                      <span className={userDetails.user.pwaInstalledAt ? 'text-green-600 font-medium' : 'text-slate-400'}>
                        {userDetails.user.pwaInstalledAt ? (
                          <>Yes ({userDetails.user.pwaInstallSource || 'unknown'})</>
                        ) : userDetails.user.pwaPromptShownAt ? (
                          'Prompt shown'
                        ) : (
                          'Not yet'
                        )}
                      </span>
                    </div>
                    {userDetails.user.pwaInstalledAt && (
                      <p className="text-xs text-slate-400 text-right">
                        {new Date(userDetails.user.pwaInstalledAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* Captain Assignment */}
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Captain:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {userDetails.user.captainId
                            ? (users?.find(u => u.id === userDetails.user.captainId)?.name || 'Unknown')
                            : 'None assigned'}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCaptainId(userDetails.user.captainId || null);
                            setReassignDialogOpen(true);
                          }}
                          className="h-6 px-2 text-xs"
                        >
                          <UserCog className="h-3 w-3 mr-1" />
                          {userDetails.user.captainId ? 'Reassign' : 'Assign'}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* View As User Button */}
                  {!userDetails.user.isAdmin && (
                    <div className="pt-3 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          console.log('[Impersonation] Starting for user:', userDetails.user.id, userDetails.user.name);
                          startImpersonationMutation.mutate({
                            targetUserId: userDetails.user.id,
                            reason: 'Tech support from admin panel'
                          }, {
                            onSuccess: (data) => {
                              console.log('[Impersonation] Success:', data);
                              setDetailSheetOpen(false);
                              navigate('/app');
                            },
                            onError: (error) => {
                              console.error('[Impersonation] Error:', error);
                            }
                          });
                        }}
                        disabled={startImpersonationMutation.isPending}
                        className="w-full bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/50 text-amber-600 dark:text-amber-400"
                      >
                        {startImpersonationMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Eye className="h-4 w-4 mr-2" />
                        )}
                        View As This User
                      </Button>
                      <p className="text-xs text-slate-400 mt-1 text-center">
                        View-only mode for tech support
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Tabs defaultValue="enrollments" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="enrollments">Projects</TabsTrigger>
                  <TabsTrigger value="scores">Scores ({userDetails.scores?.length || 0})</TabsTrigger>
                  <TabsTrigger value="biometrics">Bio ({userDetails.biometrics?.length || 0})</TabsTrigger>
                </TabsList>

                <TabsContent value="enrollments" className="mt-4">
                  {/* Assign to Project Section */}
                  <Card className="mb-4">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        Assign to Project
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {projectsLoading ? (
                        <div className="flex justify-center py-4">
                          <Loader2 className="h-5 w-5 animate-spin text-gold-500" />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {projects?.filter(p =>
                            (p.status === 'active' || p.status === 'upcoming') &&
                            !userEnrollments?.some(e => e.projectId === p.id)
                          ).map((project) => (
                            <div key={project.id} className="flex items-center justify-between p-2 border rounded-lg">
                              <div>
                                <p className="font-medium text-sm">{project.name}</p>
                                <p className="text-xs text-slate-500">{project.startDate} - {getStatusBadge(project.status)}</p>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => {
                                  if (detailUserId) {
                                    enrollUserMutation.mutate({
                                      targetUserId: detailUserId,
                                      projectId: project.id
                                    });
                                  }
                                }}
                                disabled={enrollUserMutation.isPending}
                              >
                                {enrollUserMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <UserPlus className="h-4 w-4 mr-1" />
                                    Enroll
                                  </>
                                )}
                              </Button>
                            </div>
                          ))}
                          {projects?.filter(p =>
                            (p.status === 'active' || p.status === 'upcoming') &&
                            !userEnrollments?.some(e => e.projectId === p.id)
                          ).length === 0 && (
                            <p className="text-sm text-slate-500 text-center py-2">
                              No available projects to enroll user in
                            </p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Current Enrollments */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <FolderKanban className="h-4 w-4" />
                        Current Enrollments ({userEnrollments?.length || 0})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {userEnrollmentsLoading ? (
                        <div className="flex justify-center py-4">
                          <Loader2 className="h-5 w-5 animate-spin text-gold-500" />
                        </div>
                      ) : userEnrollments && userEnrollments.length > 0 ? (
                        <div className="space-y-3">
                          {userEnrollments.map((enrollment) => (
                            <div key={enrollment.id} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <p className="font-medium">{enrollment.projectName}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    {getStatusBadge(enrollment.projectStatus as ProjectStatus)}
                                    <span className="text-xs text-slate-500">
                                      Starts: {enrollment.projectStartDate}
                                    </span>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => {
                                    if (detailUserId && confirm('Remove user from this project?')) {
                                      removeUserMutation.mutate({
                                        targetUserId: detailUserId,
                                        projectId: enrollment.projectId
                                      });
                                    }
                                  }}
                                  disabled={removeUserMutation.isPending}
                                >
                                  {removeUserMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <UserMinus className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                              <div className="text-xs text-slate-500">
                                Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-slate-500">
                          <FolderKanban className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                          <p className="text-sm">Not enrolled in any projects</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="scores" className="mt-4">
                  {userDetails.scores && userDetails.scores.length > 0 ? (
                    <div className="space-y-3">
                      {userDetails.scores
                        .sort((a: DailyScore, b: DailyScore) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((score: DailyScore) => (
                          <Card key={score.id} className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-slate-400" />
                                <span className="font-medium">{score.date}</span>
                              </div>
                              <Badge variant="outline" className="font-mono">
                                +{score.totalPoints} pts
                              </Badge>
                            </div>
                            <div className="grid grid-cols-4 gap-2 text-xs">
                              <div className={`flex flex-col items-center p-2 rounded ${score.habits.water ? 'bg-blue-50 text-blue-700' : 'bg-slate-50 text-slate-400'}`}>
                                <Droplets className="h-4 w-4 mb-1" />
                                <span>Water</span>
                              </div>
                              <div className={`flex flex-col items-center p-2 rounded ${score.habits.steps ? 'bg-green-50 text-green-700' : 'bg-slate-50 text-slate-400'}`}>
                                <Footprints className="h-4 w-4 mb-1" />
                                <span>Steps</span>
                              </div>
                              <div className={`flex flex-col items-center p-2 rounded ${score.habits.sleep ? 'bg-purple-50 text-purple-700' : 'bg-slate-50 text-slate-400'}`}>
                                <Moon className="h-4 w-4 mb-1" />
                                <span>Sleep</span>
                              </div>
                              <div className={`flex flex-col items-center p-2 rounded ${score.habits.lesson ? 'bg-gold-50 text-gold-700' : 'bg-slate-50 text-slate-400'}`}>
                                <BookOpen className="h-4 w-4 mb-1" />
                                <span>Lesson</span>
                              </div>
                            </div>
                          </Card>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      No daily scores recorded yet.
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="biometrics" className="mt-4">
                  {userDetails.biometrics && userDetails.biometrics.length > 0 ? (
                    <div className="space-y-3">
                      {userDetails.biometrics
                        .sort((a: WeeklyBiometric, b: WeeklyBiometric) => b.weekNumber - a.weekNumber)
                        .map((bio: WeeklyBiometric) => (
                          <Card key={bio.id} className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Scale className="h-4 w-4 text-slate-400" />
                                <span className="font-medium">Week {bio.weekNumber}</span>
                              </div>
                              <Badge variant="outline" className="font-mono text-green-600">
                                +{bio.pointsAwarded} pts
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div className="bg-slate-50 p-2 rounded">
                                <span className="text-slate-500 text-xs">Weight</span>
                                <p className="font-semibold">{bio.weight} lbs</p>
                              </div>
                              <div className="bg-slate-50 p-2 rounded">
                                <span className="text-slate-500 text-xs">Body Fat</span>
                                <p className="font-semibold">{bio.bodyFat}%</p>
                              </div>
                              <div className="bg-slate-50 p-2 rounded">
                                <span className="text-slate-500 text-xs">Visceral Fat</span>
                                <p className="font-semibold">{bio.visceralFat}</p>
                              </div>
                              <div className="bg-slate-50 p-2 rounded">
                                <span className="text-slate-500 text-xs">Lean Mass</span>
                                <p className="font-semibold">{bio.leanMass} lbs</p>
                              </div>
                              <div className="bg-gold-50 p-2 rounded col-span-2">
                                <span className="text-gold-600 text-xs">Metabolic Age</span>
                                <p className="font-semibold text-gold-700">{bio.metabolicAge} years</p>
                              </div>
                            </div>
                            {bio.submittedAt && (
                              <p className="text-xs text-slate-400 mt-2">
                                Submitted: {new Date(bio.submittedAt).toLocaleString()}
                              </p>
                            )}
                          </Card>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      No biometric data recorded yet.
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              Failed to load user details.
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Edit User
            </DialogTitle>
            <DialogDescription>
              {selectedUser?.name} ({selectedUser?.email})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {/* Profile Information Section */}
            <div className="space-y-4 pb-4 border-b">
              <Label className="text-xs uppercase text-slate-500 font-medium">Profile Information</Label>

              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="email@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-timezone">Timezone</Label>
                <Select value={editTimezone} onValueChange={setEditTimezone}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_TIMEZONES.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Points & Role Section */}
            <div className="space-y-4 pb-4 border-b">
              <Label className="text-xs uppercase text-slate-500 font-medium">Points & Role</Label>

              <div className="space-y-2">
                <Label htmlFor="edit-points">Points</Label>
                <Input
                  id="edit-points"
                  type="number"
                  value={editPoints}
                  onChange={(e) => setEditPoints(parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={editRole === 'challenger' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setEditRole('challenger')}
                  >
                    Challenger
                  </Button>
                  <Button
                    type="button"
                    variant={editRole === 'coach' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setEditRole('coach')}
                  >
                    Coach
                  </Button>
                </div>
              </div>
            </div>

            {/* Access Controls Section */}
            <div className="space-y-4">
              <Label className="text-xs uppercase text-slate-500 font-medium">Access Controls</Label>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Active Status</Label>
                  <p className="text-xs text-slate-500">User can access the app</p>
                </div>
                <Switch
                  checked={editIsActive}
                  onCheckedChange={setEditIsActive}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-1 text-blue-700">
                    <Eye className="h-4 w-4" />
                    Test Mode
                  </Label>
                  <p className="text-xs text-slate-500">Preview all content like an admin (no admin privileges)</p>
                </div>
                <Switch
                  checked={editIsTestMode}
                  onCheckedChange={setEditIsTestMode}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-1 text-green-700">
                    <ShieldCheck className="h-4 w-4" />
                    Admin Access
                  </Label>
                  <p className="text-xs text-slate-500">Full system management access</p>
                </div>
                <Switch
                  checked={editIsAdmin}
                  onCheckedChange={setEditIsAdmin}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveUser}
              disabled={updateUserMutation.isPending}
            >
              {updateUserMutation.isPending ? (
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
              ) : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Project Dialog */}
      <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderKanban className="h-5 w-5" />
              {editingProject ? 'Edit Project' : 'Create New Project'}
            </DialogTitle>
            <DialogDescription>
              {editingProject ? 'Update the project details' : 'Set up a new 28-day Reset Project'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name *</Label>
              <Input
                id="project-name"
                placeholder="e.g., January 2025 Reset"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-desc">Description (Optional)</Label>
              <Input
                id="project-desc"
                placeholder="Brief description of the project"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-start">Start Date *</Label>
              <Input
                id="project-start"
                type="date"
                value={projectStartDate}
                onChange={(e) => setProjectStartDate(e.target.value)}
              />
              <p className="text-xs text-slate-500">End date will be 28 days after start date</p>
            </div>

            {editingProject && (
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex flex-wrap gap-2">
                  {(['draft', 'upcoming', 'active', 'completed'] as ProjectStatus[]).map((status) => (
                    <Button
                      key={status}
                      type="button"
                      variant={projectStatus === status ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setProjectStatus(status)}
                      className="capitalize"
                    >
                      {getStatusIcon(status)}
                      <span className="ml-1">{status}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <Label>Registration Open</Label>
                <p className="text-xs text-slate-500">Allow new participants to join</p>
              </div>
              <Switch
                checked={projectRegistrationOpen}
                onCheckedChange={setProjectRegistrationOpen}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProjectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveProject}
              disabled={
                !projectName ||
                !projectStartDate ||
                createProjectMutation.isPending ||
                updateProjectMutation.isPending
              }
            >
              {(createProjectMutation.isPending || updateProjectMutation.isPending) ? (
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
              ) : null}
              {editingProject ? 'Save Changes' : 'Create Project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Project Enrollments Sheet */}
      <Sheet open={projectEnrollmentsSheetOpen} onOpenChange={setProjectEnrollmentsSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Project Participants
            </SheetTitle>
            <SheetDescription>
              {projects?.find(p => p.id === viewingProjectId)?.name || 'Loading...'}
            </SheetDescription>
          </SheetHeader>

          {enrollmentsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
            </div>
          ) : projectEnrollments && projectEnrollments.length > 0 ? (
            <div className="mt-6 space-y-3">
              {projectEnrollments.map((enrollment) => (
                <Card key={enrollment.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{enrollment.userName}</p>
                      <p className="text-sm text-slate-500">{enrollment.userEmail}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={enrollment.role === 'coach' ? 'default' : 'secondary'}>
                        {enrollment.role === 'coach' ? 'Group Leader' : 'Challenger'}
                      </Badge>
                      <p className="text-sm text-gold-600 font-mono mt-1">
                        {enrollment.points} pts
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                  </p>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p>No participants enrolled yet.</p>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Deleted Users Tab */}
      {activeTab === 'deleted' && (
        <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 transition-colors">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-red-500" />
                  Deleted Users
                </CardTitle>
                <CardDescription>
                  Users deleted within the last 30 days can be restored. After 30 days, they are permanently removed.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {deletedUsersLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
              </div>
            ) : deletedUsers && deletedUsers.length > 0 ? (
              <div className="space-y-3">
                {paginatedDeletedUsers.map((user) => (
                  <Card key={user.id} className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        {/* User Info */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Avatar className="h-12 w-12 shrink-0 opacity-75">
                            {user.avatarUrl ? (
                              <AvatarImage src={user.avatarUrl} alt={user.name} />
                            ) : null}
                            <AvatarFallback className="bg-red-100 text-red-700">
                              {getInitials(user.name || 'U')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-navy-900 dark:text-white truncate">
                                {user.name}
                              </p>
                              {user.isTestMode && (
                                <Eye className="h-4 w-4 text-blue-600 shrink-0" title="Test Mode" />
                              )}
                              {user.isAdmin && (
                                <ShieldCheck className="h-4 w-4 text-green-600 shrink-0" title="Admin" />
                              )}
                            </div>
                            <p className="text-sm text-slate-500 truncate">{user.email}</p>
                            <p className="text-xs text-slate-400">{user.phone}</p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          {user.canRestore ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRestoreUser(user.id)}
                                disabled={restoreUserMutation.isPending}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-300"
                              >
                                <Undo2 className="h-4 w-4 mr-1" />
                                Restore
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openPermanentDeleteDialog(user)}
                                disabled={permanentDeleteMutation.isPending}
                                className="text-red-600 hover:text-red-700 hover:bg-red-100 text-xs"
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete Forever
                              </Button>
                            </>
                          ) : (
                            <Badge variant="outline" className="text-red-600 border-red-300">
                              Expired
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Deletion Info */}
                      <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-red-200 dark:border-red-700 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Deleted: {user.deletedAt ? new Date(user.deletedAt).toLocaleDateString() : 'Unknown'}
                        </div>
                        {user.canRestore && (
                          <div className="flex items-center gap-1 text-amber-600 font-medium">
                            <Clock className="h-3 w-3" />
                            {user.daysRemaining} day{user.daysRemaining !== 1 ? 's' : ''} to restore
                          </div>
                        )}
                        <Badge variant={user.role === 'coach' ? 'default' : 'secondary'} className="ml-auto">
                          {user.role === 'coach' ? 'Coach' : 'Challenger'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Pagination Controls for Deleted Users */}
                {deletedUsers.length > pageSize && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-red-200 dark:border-red-700">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <span>
                        Showing {deletedStartIndex + 1}-{Math.min(deletedEndIndex, deletedUsers.length)} of {deletedUsers.length} deleted users
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeletedUsersPage(1)}
                        disabled={deletedUsersPage === 1}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronsLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeletedUsersPage(p => Math.max(1, p - 1))}
                        disabled={deletedUsersPage === 1}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <div className="flex items-center gap-1 px-2">
                        <span className="text-sm font-medium">
                          Page {deletedUsersPage} of {totalDeletedPages || 1}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeletedUsersPage(p => Math.min(totalDeletedPages, p + 1))}
                        disabled={deletedUsersPage >= totalDeletedPages}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeletedUsersPage(totalDeletedPages)}
                        disabled={deletedUsersPage >= totalDeletedPages}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronsRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <Trash2 className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p>No deleted users.</p>
                <p className="text-sm text-slate-400 mt-1">
                  Users you delete will appear here for 30 days.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Duplicates Tab */}
      {activeTab === 'duplicates' && (
        <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 transition-colors">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <GitMerge className="h-5 w-5 text-orange-500" />
                  Duplicate Users
                </CardTitle>
                <CardDescription>
                  Users with matching phone or email addresses. Merge duplicates to consolidate referrals and data.
                </CardDescription>
              </div>
              <Button
                onClick={() => refetchDuplicates()}
                disabled={duplicatesFetching}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {duplicatesFetching ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Scan for Duplicates
                  </>
                )}
              </Button>
            </div>
            {duplicatesData?.stats && (
              <div className="flex gap-4 mt-2 text-sm text-slate-500">
                <span>Active users: {duplicatesData.stats.totalActiveUsers}</span>
                <span>Deleted users: {duplicatesData.stats.totalDeletedUsers}</span>
                <span>Duplicate sets found: {duplicatesData.totalDuplicateSets}</span>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {duplicatesError ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 rounded-lg p-4 mb-4">
                <p className="text-red-600 font-medium">Error loading duplicates:</p>
                <p className="text-red-500 text-sm mt-1">{String(duplicatesError)}</p>
              </div>
            ) : null}
            {duplicatesLoading || duplicatesFetching ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
                <p className="text-sm text-slate-500 mt-2">Scanning all users for duplicates...</p>
              </div>
            ) : duplicatesData?.duplicates && duplicatesData.duplicates.length > 0 ? (
              <div className="space-y-6">
                {duplicatesData.duplicates.map((duplicateSet, setIndex) => (
                  <Card key={`${duplicateSet.type}-${duplicateSet.value}-${setIndex}`} className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={duplicateSet.type === 'phone' ? 'border-blue-500 text-blue-600' : 'border-green-500 text-green-600'}>
                          {duplicateSet.type === 'phone' ? <Phone className="h-3 w-3 mr-1" /> : <UserIcon className="h-3 w-3 mr-1" />}
                          {duplicateSet.type === 'phone' ? 'Phone Match' : 'Email Match'}
                        </Badge>
                        <span className="text-sm font-mono text-slate-600 dark:text-slate-400">
                          {duplicateSet.value}
                        </span>
                        <span className="text-xs text-slate-500">
                          ({duplicateSet.users.length} users)
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid gap-3 md:grid-cols-2">
                        {duplicateSet.users.map((user, userIndex) => (
                          <Card key={user.id} className={`border ${
                            user.isDeleted
                              ? 'border-red-300 bg-red-50 dark:bg-red-900/20 opacity-75'
                              : user.isRecommendedPrimary
                                ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
                                : 'border-slate-200 dark:border-slate-700'
                          }`}>
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <Avatar className="h-10 w-10">
                                  {user.avatarUrl ? (
                                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                                  ) : null}
                                  <AvatarFallback className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs">
                                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`font-medium truncate ${user.isDeleted ? 'line-through text-slate-500' : ''}`}>{user.name}</span>
                                    {user.isDeleted && (
                                      <Badge variant="destructive" className="text-xs">Deleted</Badge>
                                    )}
                                    {user.isRecommendedPrimary && (
                                      <Badge className="bg-green-500 text-white text-xs">Recommended Primary</Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-slate-600 dark:text-slate-400 font-mono">{user.referralCode}</p>
                                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                    <span>{user.points} pts</span>
                                    <span>Created: {new Date(user.createdAt).toLocaleDateString()}</span>
                                    {user.avatarUrl && <span className="text-green-600">Has Avatar</span>}
                                  </div>
                                </div>
                              </div>

                              {/* Action buttons */}
                              {!user.isRecommendedPrimary && (
                                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
                                  {user.isDeleted ? (
                                    // For deleted users, show info about what merge would do
                                    <div className="text-xs text-slate-500 mb-2">
                                      This account is deleted. Merging will transfer any referrals/data to the primary account.
                                    </div>
                                  ) : null}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full text-orange-600 border-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/30"
                                    disabled={mergeUsersMutation.isPending}
                                    onClick={() => {
                                      const primaryUser = duplicateSet.users.find(u => u.isRecommendedPrimary);
                                      if (primaryUser) {
                                        const deleteStatus = user.isDeleted ? ' (already deleted)' : '';
                                        if (confirm(`Merge "${user.name}"${deleteStatus} into "${primaryUser.name}"?\n\nThis will:\n• Transfer all referrals from ${user.referralCode} to ${primaryUser.referralCode}\n• Combine points and enrollments\n• ${user.isDeleted ? 'Keep this profile deleted' : 'Soft-delete this profile'}\n\nBoth referral codes will continue to work.`)) {
                                          mergeUsersMutation.mutate({
                                            primaryUserId: primaryUser.id,
                                            secondaryUserId: user.id
                                          });
                                        }
                                      }
                                    }}
                                  >
                                    {mergeUsersMutation.isPending ? (
                                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                      <GitMerge className="h-4 w-4 mr-2" />
                                    )}
                                    Merge into Primary
                                  </Button>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <CheckCircle className="h-12 w-12 text-green-300 mx-auto mb-3" />
                <p>No duplicate users found.</p>
                <p className="text-sm text-slate-400 mt-1">
                  All users have unique phone numbers and emails.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Docs Tab */}
      {activeTab === 'docs' && (
        <DocsTab
          targetSection={targetDocSection}
          targetArticle={targetDocArticle}
          onClearTarget={() => {
            setTargetDocSection(null);
            setTargetDocArticle(null);
          }}
        />
      )}

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Delete User
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Are you sure you want to delete <strong>{userToDelete?.name}</strong>?
              </p>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3 text-amber-800 dark:text-amber-200 text-sm">
                <strong>This user can be restored within 30 days.</strong>
                <br />
                After 30 days, the deletion becomes permanent.
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={deleteUserMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteUserMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Permanent Delete Confirmation Dialog */}
      <AlertDialog open={permanentDeleteDialogOpen} onOpenChange={setPermanentDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Permanently Delete User
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Are you sure you want to <strong>permanently</strong> delete <strong>{userToPermanentDelete?.name}</strong>?
              </p>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3 text-red-800 dark:text-red-200 text-sm">
                <strong>This action cannot be undone.</strong>
                <br />
                All user data will be permanently removed from the system.
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePermanentDelete}
              disabled={permanentDeleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {permanentDeleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Captain Reassignment Dialog */}
      <Dialog open={reassignDialogOpen} onOpenChange={setReassignDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              {userDetails?.user?.captainId ? 'Reassign Captain' : 'Assign Captain'}
            </DialogTitle>
            <DialogDescription>
              Select a captain for {userDetails?.user?.name || 'this user'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="captain-select">Captain</Label>
            <Select
              value={selectedCaptainId || 'none'}
              onValueChange={(value) => setSelectedCaptainId(value === 'none' ? null : value)}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select a captain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <span className="text-slate-500">No captain (remove assignment)</span>
                </SelectItem>
                {coachesData?.coaches?.map((coach) => (
                  <SelectItem key={coach.id} value={coach.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{coach.name}</span>
                      <span className="text-xs text-slate-500 ml-2">
                        ({coach.teamSize} members)
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReassignDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (detailUserId) {
                  reassignCaptainMutation.mutate({
                    targetUserId: detailUserId,
                    newCaptainId: selectedCaptainId
                  }, {
                    onSuccess: () => setReassignDialogOpen(false)
                  });
                }
              }}
              disabled={reassignCaptainMutation.isPending}
            >
              {reassignCaptainMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {selectedCaptainId ? 'Assign Captain' : 'Remove Captain'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Captain Reassignment Dialog */}
      <Dialog open={bulkReassignDialogOpen} onOpenChange={setBulkReassignDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Bulk Reassign Captains
            </DialogTitle>
            <DialogDescription>
              Reassign {bulkSelectedUserIds.length} selected users to a new captain
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="bulk-captain-select">New Captain</Label>
            <Select
              value={bulkSelectedCaptainId || 'none'}
              onValueChange={(value) => setBulkSelectedCaptainId(value === 'none' ? null : value)}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select a captain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <span className="text-slate-500">No captain (remove assignment)</span>
                </SelectItem>
                {coachesData?.coaches?.map((coach) => (
                  <SelectItem key={coach.id} value={coach.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{coach.name}</span>
                      <span className="text-xs text-slate-500 ml-2">
                        ({coach.teamSize} members)
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setBulkReassignDialogOpen(false);
              setBulkSelectedUserIds([]);
            }}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                bulkReassignMutation.mutate({
                  userIds: bulkSelectedUserIds,
                  newCaptainId: bulkSelectedCaptainId
                }, {
                  onSuccess: () => {
                    setBulkReassignDialogOpen(false);
                    setBulkSelectedUserIds([]);
                  }
                });
              }}
              disabled={bulkReassignMutation.isPending}
            >
              {bulkReassignMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Reassign {bulkSelectedUserIds.length} Users
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
