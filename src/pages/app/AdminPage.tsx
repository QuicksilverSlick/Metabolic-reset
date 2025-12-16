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
  useAdminRemoveUserFromProject
} from '@/hooks/use-queries';
import { Navigate } from 'react-router-dom';
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
  UserMinus
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
import { User, DailyScore, WeeklyBiometric, ResetProject, ProjectStatus, CreateProjectRequest, UpdateProjectRequest } from '@shared/types';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function AdminPage() {
  const currentUser = useAuthStore(s => s.user);
  const isAdmin = currentUser?.isAdmin;

  const { data: users, isLoading, error } = useAdminUsers();
  const updateUserMutation = useAdminUpdateUser();
  const bootstrapMutation = useBootstrapAdmin();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'name' | 'points' | 'createdAt'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [bootstrapDialogOpen, setBootstrapDialogOpen] = useState(false);
  const [bootstrapEmail, setBootstrapEmail] = useState('');
  const [bootstrapKey, setBootstrapKey] = useState('');
  const [detailUserId, setDetailUserId] = useState<string | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'projects'>('users');

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

  // Form state for edit dialog
  const [editPoints, setEditPoints] = useState(0);
  const [editIsAdmin, setEditIsAdmin] = useState(false);
  const [editIsActive, setEditIsActive] = useState(true);
  const [editRole, setEditRole] = useState<'challenger' | 'coach'>('challenger');

  // If not admin and no users loaded, show bootstrap option
  if (!isAdmin && !isLoading && (!users || users.length === 0)) {
    return (
      <div className="space-y-6">
        <Card className="border-gold-200 bg-gold-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gold-800">
              <Shield className="h-5 w-5" />
              Admin Access Required
            </CardTitle>
            <CardDescription className="text-gold-700">
              You need admin privileges to access this page.
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
                Create the first admin account. You'll need the secret bootstrap key.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="bootstrap-email">Your Email</Label>
                <Input
                  id="bootstrap-email"
                  type="email"
                  placeholder="admin@example.com"
                  value={bootstrapEmail}
                  onChange={(e) => setBootstrapEmail(e.target.value)}
                />
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
                    { email: bootstrapEmail, secretKey: bootstrapKey },
                    { onSuccess: () => setBootstrapDialogOpen(false) }
                  );
                }}
                disabled={bootstrapMutation.isPending || !bootstrapEmail || !bootstrapKey}
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

  // Redirect if not admin
  if (!isAdmin) {
    return <Navigate to="/app" replace />;
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
    setEditIsActive(user.isActive !== false);
    setEditRole(user.role || 'challenger');
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
          isActive: editIsActive,
          role: editRole,
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

  const handleToggleAdmin = (user: User) => {
    updateUserMutation.mutate({
      targetUserId: user.id,
      updates: { isAdmin: !user.isAdmin },
    });
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

  // Filter and sort users
  const filteredUsers = (users || [])
    .filter(user => {
      const search = searchTerm.toLowerCase();
      return (
        user.name?.toLowerCase().includes(search) ||
        user.email?.toLowerCase().includes(search) ||
        user.phone?.includes(search)
      );
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

  const stats = {
    totalUsers: users?.length || 0,
    totalPoints: users?.reduce((sum, u) => sum + (u.points || 0), 0) || 0,
    coaches: users?.filter(u => u.role === 'coach').length || 0,
    admins: users?.filter(u => u.isAdmin).length || 0,
    totalProjects: projects?.length || 0,
    activeProjects: projects?.filter(p => p.status === 'active').length || 0,
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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900 dark:text-white">{stats.totalUsers}</p>
                <p className="text-xs text-slate-500">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-gold-100 p-2 rounded-lg">
                <Award className="h-5 w-5 text-gold-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900 dark:text-white">{stats.totalPoints}</p>
                <p className="text-xs text-slate-500">Total Points</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Crown className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900 dark:text-white">{stats.coaches}</p>
                <p className="text-xs text-slate-500">Group Leaders</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <ShieldCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900 dark:text-white">{stats.admins}</p>
                <p className="text-xs text-slate-500">Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <FolderKanban className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900 dark:text-white">{stats.activeProjects}/{stats.totalProjects}</p>
                <p className="text-xs text-slate-500">Active Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-navy-700">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'users'
              ? 'border-gold-500 text-gold-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users className="h-4 w-4 inline mr-2" />
          Users
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'projects'
              ? 'border-gold-500 text-gold-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <FolderKanban className="h-4 w-4 inline mr-2" />
          Reset Projects
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>All Users</CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer hover:bg-slate-50 dark:hover:bg-navy-800"
                      onClick={() => handleSort('name')}
                    >
                      Name <SortIcon field="name" />
                    </TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-slate-50 dark:hover:bg-navy-800 text-right"
                      onClick={() => handleSort('points')}
                    >
                      Points <SortIcon field="points" />
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {user.name}
                          {user.isAdmin && (
                            <ShieldCheck className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-500">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'coach' ? 'default' : 'secondary'}>
                          {user.role === 'coach' ? 'Coach' : 'Challenger'}
                        </Badge>
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
                      <TableCell>
                        <Button
                          variant={user.isAdmin ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleToggleAdmin(user)}
                          disabled={updateUserMutation.isPending || user.id === currentUser?.id}
                          className={user.isAdmin
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                          }
                        >
                          {user.isAdmin ? (
                            <>
                              <ShieldCheck className="h-3 w-3 mr-1" />
                              Admin
                            </>
                          ) : (
                            <>
                              <ShieldOff className="h-3 w-3 mr-1" />
                              Make Admin
                            </>
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDetailSheet(user)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(user)}
                          >
                            Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  No users found matching your search.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Projects Tab */}
      {activeTab === 'projects' && (
        <Card>
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
                  <div className="flex justify-between">
                    <span className="text-slate-500">Phone:</span>
                    <span className="font-mono">{userDetails.user.phone}</span>
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
                  <div className="flex justify-between">
                    <span className="text-slate-500">Joined:</span>
                    <span>{userDetails.user.createdAt ? new Date(userDetails.user.createdAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Admin:</span>
                    <span>{userDetails.user.isAdmin ? 'Yes' : 'No'}</span>
                  </div>
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
          <div className="space-y-6 py-4">
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

            <div className="flex items-center justify-between border-t pt-4">
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
    </div>
  );
}
