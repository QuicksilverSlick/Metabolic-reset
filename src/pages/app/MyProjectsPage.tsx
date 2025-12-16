import React from 'react';
import { useMyEnrollments, useOpenProjects } from '@/hooks/use-queries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, FolderKanban, Calendar, Trophy, Clock, CheckCircle2, PlayCircle, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CircularProgress } from '@/components/ui/circular-progress';

type ProjectStatus = 'draft' | 'upcoming' | 'active' | 'completed';

function getStatusBadge(status: ProjectStatus) {
  switch (status) {
    case 'active':
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><PlayCircle className="h-3 w-3 mr-1" />Active</Badge>;
    case 'upcoming':
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30"><Clock className="h-3 w-3 mr-1" />Upcoming</Badge>;
    case 'completed':
      return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30"><CheckCircle2 className="h-3 w-3 mr-1" />Completed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function getProgressPercentage(startDate: string, endDate: string): number {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = Date.now();

  if (now < start) return 0;
  if (now > end) return 100;

  return Math.round(((now - start) / (end - start)) * 100);
}

function getDaysRemaining(endDate: string): number {
  const end = new Date(endDate).getTime();
  const now = Date.now();
  const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export function MyProjectsPage() {
  const { data: enrollments, isLoading: enrollmentsLoading } = useMyEnrollments();
  const { data: openProjects, isLoading: openProjectsLoading } = useOpenProjects();

  if (enrollmentsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
      </div>
    );
  }

  // Filter to get projects user is NOT enrolled in
  const availableProjects = openProjects?.filter(
    p => !enrollments?.some(e => e.projectId === p.id)
  ) || [];

  // Sort enrollments: active first, then upcoming, then completed
  const sortedEnrollments = [...(enrollments || [])].sort((a, b) => {
    const statusOrder: Record<string, number> = { active: 0, upcoming: 1, completed: 2, draft: 3 };
    return (statusOrder[a.projectStatus] || 3) - (statusOrder[b.projectStatus] || 3);
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-navy-900 dark:text-white">My Projects</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Track your progress across all challenge projects
        </p>
      </div>

      {/* Current & Past Enrollments */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-navy-900 dark:text-white flex items-center gap-2">
          <FolderKanban className="h-5 w-5 text-gold-500" />
          Your Challenges
        </h2>

        {sortedEnrollments.length === 0 ? (
          <Card className="border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm transition-colors">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FolderKanban className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-slate-500 dark:text-slate-400 text-center mb-4">
                You haven't joined any challenges yet.
              </p>
              {availableProjects.length > 0 && (
                <Button asChild className="bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold">
                  <a href="#available">Browse Available Challenges</a>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {sortedEnrollments.map((enrollment) => {
              const progress = getProgressPercentage(enrollment.projectStartDate, enrollment.projectEndDate);
              const daysRemaining = getDaysRemaining(enrollment.projectEndDate);
              const isActive = enrollment.projectStatus === 'active';
              const isUpcoming = enrollment.projectStatus === 'upcoming';
              const isCompleted = enrollment.projectStatus === 'completed';

              return (
                <Card
                  key={enrollment.id}
                  className={`border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm transition-all ${
                    isActive ? 'ring-2 ring-gold-500/50' : ''
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                      {/* Progress Circle */}
                      <div className="flex-shrink-0">
                        <CircularProgress
                          value={isUpcoming ? 0 : progress}
                          size={80}
                          strokeWidth={8}
                        >
                          <span className="text-sm font-bold text-navy-900 dark:text-white">
                            {isUpcoming ? '0%' : `${progress}%`}
                          </span>
                        </CircularProgress>
                      </div>

                      {/* Project Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-navy-900 dark:text-white truncate">
                            {enrollment.projectName}
                          </h3>
                          {getStatusBadge(enrollment.projectStatus as ProjectStatus)}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(enrollment.projectStartDate).toLocaleDateString()} - {new Date(enrollment.projectEndDate).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Trophy className="h-4 w-4 text-gold-500" />
                            {enrollment.points || 0} points
                          </span>
                        </div>

                        {isActive && (
                          <div className="mt-3 flex items-center gap-2">
                            <div className="flex-1 h-2 bg-slate-100 dark:bg-navy-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gold-500 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                              {daysRemaining} days left
                            </span>
                          </div>
                        )}

                        {isUpcoming && (
                          <p className="mt-2 text-sm text-blue-500 dark:text-blue-400">
                            Starts {new Date(enrollment.projectStartDate).toLocaleDateString()}
                          </p>
                        )}

                        {isCompleted && (
                          <p className="mt-2 text-sm text-green-500 dark:text-green-400 flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" />
                            Challenge completed!
                          </p>
                        )}
                      </div>

                      {/* Action Button */}
                      {isActive && (
                        <div className="flex-shrink-0">
                          <Button asChild>
                            <Link to="/app">
                              Go to Dashboard
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Available Projects */}
      {availableProjects.length > 0 && (
        <div id="available" className="space-y-4 pt-4">
          <h2 className="text-xl font-semibold text-navy-900 dark:text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Available Challenges
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Join a new challenge to continue your transformation journey
          </p>

          <div className="grid gap-4">
            {availableProjects.map((project) => (
              <Card
                key={project.id}
                className="border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm hover:border-gold-500/50 transition-all"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-navy-900 dark:text-white">
                          {project.name}
                        </h3>
                        {getStatusBadge(project.status as ProjectStatus)}
                      </div>
                      {project.description && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                          {project.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <Calendar className="h-4 w-4" />
                        <span>Starts {new Date(project.startDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Button asChild className="bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all">
                      <Link to={`/app/enroll/${project.id}`}>
                        Join Challenge
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
