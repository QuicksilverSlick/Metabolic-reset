import React, { useState } from 'react';
import { useTeamRoster, useUser, useCaptainLeads, useTeamMemberBiometrics, useOpenProjects, useMyActiveEnrollment, useMyGenealogy } from '@/hooks/use-queries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Users, AlertCircle, Trophy, CheckCircle2, Star, Target, Phone, Calendar, Activity, Copy, Check, Link, ChevronRight, Scale, Heart, X, TrendingDown, TrendingUp, Image, Sparkles, Brain, Moon, Clock, Flame, Dumbbell, Zap, ThermometerSun, GitBranch } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { QuizLead } from '@shared/types';
import { GenealogyTree, GenealogyList } from '@/components/ui/genealogy-tree';
// Quiz questions for displaying answers
const quizQuestions: Record<string, { question: string; category: string; icon: React.ComponentType<{ className?: string }> }> = {
  f1: { question: 'How would you describe your menstrual cycle regularity and associated symptoms?', category: 'Hormonal Balance', icon: Heart },
  f2: { question: 'Where do you tend to store excess weight?', category: 'Body Composition', icon: Scale },
  f3: { question: 'Do you experience hot flashes, night sweats, or difficulty regulating body temperature?', category: 'Metabolic Symptoms', icon: ThermometerSun },
  m1: { question: 'How would you describe your muscle recovery and strength maintenance?', category: 'Hormonal Health', icon: Dumbbell },
  m2: { question: 'Where do you tend to accumulate stubborn fat?', category: 'Body Composition', icon: Scale },
  m3: { question: 'How would you rate your overall energy, motivation, and drive throughout the day?', category: 'Energy & Drive', icon: Zap },
  u4: { question: 'How often do you experience energy crashes or brain fog between 2-4 PM?', category: 'Energy & Glucose', icon: Zap },
  u5: { question: 'How do you feel when you wake up in the morning?', category: 'Sleep & Recovery', icon: Moon },
  u6: { question: 'Can you comfortably go 4-5 hours between meals without feeling shaky, irritable, or "hangry"?', category: 'Hunger & Satiety', icon: Clock },
  u7: { question: 'How often do you experience strong cravings for sugar, carbs, or processed foods?', category: 'Cravings', icon: Flame },
  u8: { question: 'Do you track your body composition metrics (body fat %, visceral fat, lean mass)?', category: 'Visceral Fat Awareness', icon: Activity },
  u9: { question: 'How soon after waking do you consume 25-30g of protein?', category: 'Protein Timing', icon: Dumbbell },
  u10: { question: 'How would you describe your stress levels and their impact on your weight?', category: 'Stress & Cortisol', icon: Brain },
};

// Get score label and color based on points
const getScoreLabel = (points: number): { label: string; color: string } => {
  if (points === 10) return { label: 'Optimal', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' };
  if (points === 7) return { label: 'Good', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' };
  if (points === 4) return { label: 'Fair', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' };
  return { label: 'Needs Work', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' };
};

export function RosterPage() {
  const { data: user, isLoading: userLoading } = useUser();
  const { data: roster, isLoading: rosterLoading } = useTeamRoster();
  const { data: leads, isLoading: leadsLoading } = useCaptainLeads();
  const { data: openProjects } = useOpenProjects();
  const { data: activeEnrollment } = useMyActiveEnrollment();
  const { data: genealogy, isLoading: genealogyLoading } = useMyGenealogy();
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedRecruitId, setSelectedRecruitId] = useState<string | null>(null);
  const [selectedScreenshot, setSelectedScreenshot] = useState<{ url: string; label: string } | null>(null);
  const [selectedLead, setSelectedLead] = useState<QuizLead | null>(null);
  const [projectSelectorOpen, setProjectSelectorOpen] = useState(false);
  const [treeView, setTreeView] = useState<'tree' | 'list'>('list'); // Default to list for mobile-friendliness
  const { data: biometricsData, isLoading: biometricsLoading } = useTeamMemberBiometrics(selectedRecruitId);

  // Generate quiz link with referral code and optional project
  const generateQuizLink = (projectId?: string | null) => {
    if (!user?.referralCode) return '';
    const params = new URLSearchParams();
    params.set('ref', user.referralCode);
    if (projectId) {
      params.set('project', projectId);
    }
    return `${window.location.origin}/quiz?${params.toString()}`;
  };

  const copyQuizLink = (projectId?: string | null) => {
    if (!user?.referralCode) return;
    const link = generateQuizLink(projectId);
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    toast.success('Quiz link copied to clipboard!');
    setProjectSelectorOpen(false);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Quick copy: use active enrollment project or show selector
  const handleQuickCopy = () => {
    if (activeEnrollment?.projectId) {
      copyQuizLink(activeEnrollment.projectId);
    } else if (openProjects && openProjects.length === 1) {
      copyQuizLink(openProjects[0].id);
    } else if (openProjects && openProjects.length > 1) {
      setProjectSelectorOpen(true);
    } else {
      copyQuizLink(null);
    }
  };

  if (userLoading || rosterLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
      </div>
    );
  }
  if (user?.role !== 'coach') {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertTitle className="text-red-800 dark:text-red-300">Access Denied</AlertTitle>
          <AlertDescription className="text-red-700 dark:text-red-400">
            This page is only available to Coaches and Team Captains.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  const recruitCount = roster?.length || 0;
  const leadCount = leads?.length || 0;
  const qualificationThreshold = 10;
  const isQualified = recruitCount >= qualificationThreshold;
  const progressPercent = Math.min(100, (recruitCount / qualificationThreshold) * 100);
  const remaining = Math.max(0, qualificationThreshold - recruitCount);
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-navy-900 dark:text-white">Team Management</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your team and track quiz leads.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-navy-900 px-4 py-2 rounded-lg border border-slate-200 dark:border-navy-800 shadow-sm flex items-center gap-2 transition-colors">
            <Target className="h-5 w-5 text-blue-500" />
            <span className="font-bold text-navy-900 dark:text-white">{leadCount}</span>
            <span className="text-slate-500 dark:text-slate-400 text-sm">Leads</span>
          </div>
          <div className="bg-white dark:bg-navy-900 px-4 py-2 rounded-lg border border-slate-200 dark:border-navy-800 shadow-sm flex items-center gap-2 transition-colors">
            <Users className="h-5 w-5 text-gold-500" />
            <span className="font-bold text-navy-900 dark:text-white">{recruitCount}</span>
            <span className="text-slate-500 dark:text-slate-400 text-sm">Recruits</span>
          </div>
        </div>
      </div>
      {/* Prize Qualification Card */}
      <Card className={`border-0 shadow-md transition-all ${
        isQualified
          ? 'bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-900/20 dark:to-navy-900 border-l-4 border-l-yellow-500'
          : 'bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800'
      }`}>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 ${
              isQualified ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400' : 'bg-slate-100 dark:bg-navy-800 text-slate-400'
            }`}>
              {isQualified ? <Trophy className="h-8 w-8" /> : <Star className="h-8 w-8" />}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-bold text-navy-900 dark:text-white mb-2">
                {isQualified ? 'Prize Qualified!' : 'Prize Qualification Progress'}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                {isQualified
                  ? 'Congratulations! You have recruited 10+ members and are now eligible for the Captain\'s Prize Pool.'
                  : `Recruit ${remaining} more people to qualify for the Captain's Prize Pool.`}
              </p>
              {!isQualified && (
                <div className="w-full max-w-md">
                  <div className="flex justify-between text-xs mb-1 font-medium text-slate-500 dark:text-slate-400">
                    <span>{recruitCount} Recruits</span>
                    <span>Goal: {qualificationThreshold}</span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                </div>
              )}
            </div>
            {isQualified && (
              <div className="shrink-0">
                <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 text-sm font-bold shadow-lg">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  QUALIFIED
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {/* Quiz Link Share Card */}
      <Card className="border-slate-200 dark:border-navy-800 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-navy-900 shadow-sm transition-colors">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Link className="h-7 w-7" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-bold text-navy-900 dark:text-white mb-2">
                Share Your Quiz Link
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-3">
                Send this link to potential recruits. They'll take the metabolic age quiz and be attributed to you as leads.
              </p>
              <div className="flex flex-col items-stretch gap-3 w-full">
                <code className="bg-navy-900 dark:bg-navy-950 text-slate-300 px-4 py-3 rounded-lg text-xs sm:text-sm font-mono break-all w-full block">
                  {generateQuizLink(activeEnrollment?.projectId || openProjects?.[0]?.id)}
                </code>
                <Button
                  onClick={handleQuickCopy}
                  className="bg-blue-500 hover:bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] transition-all w-full sm:w-auto sm:self-start"
                >
                  {copiedLink ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  {copiedLink ? 'Copied!' : 'Copy Link'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Selector Dialog */}
      <Dialog open={projectSelectorOpen} onOpenChange={setProjectSelectorOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-700">
          <DialogHeader>
            <DialogTitle className="text-navy-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-gold-500" />
              Select a Project
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              Choose which project you want to refer leads to. They'll complete the metabolic quiz and can join your selected project.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {openProjects?.map((proj) => (
              <button
                key={proj.id}
                onClick={() => copyQuizLink(proj.id)}
                className="w-full p-4 rounded-xl border-2 border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:bg-slate-100 dark:hover:bg-navy-800/80 transition-all text-left group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-navy-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {proj.name}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Starts {new Date(proj.startDate).toLocaleDateString()}
                    </div>
                  </div>
                  <Copy className="h-5 w-5 text-slate-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                </div>
              </button>
            ))}
            {/* Option to copy without project */}
            <button
              onClick={() => copyQuizLink(null)}
              className="w-full p-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-navy-700 bg-slate-50/50 dark:bg-navy-900/50 hover:border-blue-500/30 transition-all text-left group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-500 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                    General Referral Link
                  </div>
                  <div className="text-sm text-slate-400 dark:text-slate-500">
                    Let them choose their project later
                  </div>
                </div>
                <Copy className="h-5 w-5 text-slate-400 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors" />
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tabs for Leads, Recruits, and Genealogy */}
      <Tabs defaultValue="leads" className="space-y-6">
        {/* Mobile Scrollable Tab Container */}
        <div className="relative">
          {/* Scroll fade indicator - left */}
          <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-slate-100 dark:from-navy-900 to-transparent z-10 pointer-events-none md:hidden" />
          {/* Scroll fade indicator - right */}
          <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-slate-100 dark:from-navy-900 to-transparent z-10 pointer-events-none md:hidden" />

          <div
            className="overflow-x-auto scrollbar-hide snap-x snap-mandatory touch-pan-x"
            style={{
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            <TabsList className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 transition-colors inline-flex w-auto min-w-full md:w-auto">
              <TabsTrigger value="leads" className="flex-shrink-0 snap-start data-[state=active]:bg-blue-500 data-[state=active]:text-white whitespace-nowrap">
                <Target className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">Quiz Leads</span>
                <span className="sm:hidden">Leads</span>
                <span className="ml-1">({leadCount})</span>
              </TabsTrigger>
              <TabsTrigger value="recruits" className="flex-shrink-0 snap-start data-[state=active]:bg-gold-500 data-[state=active]:text-navy-900 whitespace-nowrap">
                <Users className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">Team Recruits</span>
                <span className="sm:hidden">Team</span>
                <span className="ml-1">({recruitCount})</span>
              </TabsTrigger>
              <TabsTrigger value="genealogy" className="flex-shrink-0 snap-start data-[state=active]:bg-green-500 data-[state=active]:text-white whitespace-nowrap">
                <GitBranch className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">Genealogy</span>
                <span className="sm:hidden">Tree</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Leads Tab */}
        <TabsContent value="leads">
          <Card className="border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm transition-colors">
            <CardHeader>
              <CardTitle className="text-navy-900 dark:text-white">Quiz Leads</CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                People who took the metabolic age quiz using your referral link.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {leadsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : !leads || leads.length === 0 ? (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  <Target className="h-12 w-12 mx-auto mb-4 text-slate-300 dark:text-navy-700" />
                  <p className="mb-2">No quiz leads yet.</p>
                  <p className="text-sm">Share your quiz link to start capturing leads!</p>
                </div>
              ) : (
                <>
                  {/* Mobile Card Layout */}
                  <div className="space-y-3 sm:hidden">
                    {leads.map((lead) => (
                      <div
                        key={lead.id}
                        className="bg-slate-50 dark:bg-navy-800/50 rounded-xl p-4 border border-slate-200 dark:border-navy-700"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-navy-900 dark:text-white truncate">
                              {lead.name}
                            </h4>
                            <a
                              href={`tel:${lead.phone}`}
                              className="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Phone className="h-3 w-3" />
                              {lead.phone}
                            </a>
                          </div>
                          <Badge
                            variant={lead.convertedToUserId ? 'default' : 'outline'}
                            className={lead.convertedToUserId
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900 shrink-0 ml-2'
                              : 'text-slate-600 dark:text-slate-400 border-slate-200 dark:border-navy-700 shrink-0 ml-2'}
                          >
                            {lead.convertedToUserId ? 'Enrolled' : 'Pending'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-3 mb-3">
                          <div className="text-center">
                            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Age</div>
                            <div className="font-medium text-navy-900 dark:text-white">{lead.age}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Metabolic</div>
                            <Badge
                              className={`text-xs ${
                                lead.metabolicAge - lead.age >= 10
                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900'
                                  : lead.metabolicAge - lead.age >= 5
                                  ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900'
                                  : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900'
                              }`}
                            >
                              {lead.metabolicAge} (+{lead.metabolicAge - lead.age})
                            </Badge>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Score</div>
                            <div className="flex items-center justify-center gap-1">
                              <Activity className="h-3 w-3 text-slate-400" />
                              <span className="font-medium text-navy-900 dark:text-white">{lead.quizScore}/50</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1 pt-2 border-t border-slate-100 dark:border-navy-700 mb-3">
                          <Calendar className="h-3 w-3" />
                          Captured {new Date(lead.capturedAt).toLocaleDateString()}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedLead(lead)}
                          className="w-full text-blue-500 border-blue-200 dark:border-blue-900 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          <Activity className="h-4 w-4 mr-2" />
                          View Quiz Answers
                          <ChevronRight className="h-4 w-4 ml-auto" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table */}
                  <div className="hidden sm:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-200 dark:border-navy-800 hover:bg-slate-50 dark:hover:bg-navy-800/50">
                          <TableHead className="text-slate-500 dark:text-slate-400">Name</TableHead>
                          <TableHead className="text-slate-500 dark:text-slate-400">Phone</TableHead>
                          <TableHead className="text-slate-500 dark:text-slate-400">Age</TableHead>
                          <TableHead className="text-slate-500 dark:text-slate-400">Metabolic Age</TableHead>
                          <TableHead className="text-slate-500 dark:text-slate-400">Quiz Score</TableHead>
                          <TableHead className="text-slate-500 dark:text-slate-400">Status</TableHead>
                          <TableHead className="text-slate-500 dark:text-slate-400">Captured</TableHead>
                          <TableHead className="text-right text-slate-500 dark:text-slate-400">Answers</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {leads.map((lead) => (
                          <TableRow key={lead.id} className="border-slate-200 dark:border-navy-800 hover:bg-slate-50 dark:hover:bg-navy-800/50">
                            <TableCell className="font-medium text-navy-900 dark:text-white">{lead.name}</TableCell>
                            <TableCell className="text-slate-500 dark:text-slate-400">
                              <a href={`tel:${lead.phone}`} className="flex items-center gap-1 hover:text-blue-500">
                                <Phone className="h-3 w-3" />
                                {lead.phone}
                              </a>
                            </TableCell>
                            <TableCell className="text-slate-500 dark:text-slate-400">{lead.age}</TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  lead.metabolicAge - lead.age >= 10
                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900'
                                    : lead.metabolicAge - lead.age >= 5
                                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900'
                                    : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900'
                                }
                              >
                                {lead.metabolicAge} (+{lead.metabolicAge - lead.age})
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Activity className="h-4 w-4 text-slate-400" />
                                <span className="text-slate-600 dark:text-slate-300">{lead.quizScore}/50</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={lead.convertedToUserId ? 'default' : 'outline'}
                                className={lead.convertedToUserId
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900'
                                  : 'text-slate-600 dark:text-slate-400 border-slate-200 dark:border-navy-700'}
                              >
                                {lead.convertedToUserId ? 'Enrolled' : 'Pending'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-slate-500 dark:text-slate-400">
                              {new Date(lead.capturedAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedLead(lead)}
                                className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              >
                                <Activity className="h-4 w-4 mr-1" />
                                View
                                <ChevronRight className="h-4 w-4 ml-1" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recruits Tab */}
        <TabsContent value="recruits">
          <Card className="border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm transition-colors">
            <CardHeader>
              <CardTitle className="text-navy-900 dark:text-white">Your Team</CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                List of all challengers who have registered using your referral code.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!roster || roster.length === 0 ? (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  <Users className="h-12 w-12 mx-auto mb-4 text-slate-300 dark:text-navy-700" />
                  <p>No recruits yet. Share your referral code to grow your team!</p>
                  <div className="mt-4 inline-block bg-slate-100 dark:bg-navy-800 px-4 py-2 rounded-lg font-mono text-navy-900 dark:text-white font-bold">
                    {user.referralCode}
                  </div>
                </div>
              ) : (
                <>
                  {/* Mobile Card Layout */}
                  <div className="space-y-3 sm:hidden">
                    {roster.map((recruit) => (
                      <div
                        key={recruit.id}
                        className="bg-slate-50 dark:bg-navy-800/50 rounded-xl p-4 border border-slate-200 dark:border-navy-700"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-navy-900 dark:text-white truncate">
                              {recruit.name}
                            </h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                              {recruit.email}
                            </p>
                          </div>
                          <Badge
                            variant={recruit.isActive ? 'default' : 'secondary'}
                            className={recruit.isActive
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900 shrink-0 ml-2'
                              : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400 shrink-0 ml-2'}
                          >
                            {recruit.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-3 mb-3">
                          <div className="text-center">
                            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Points</div>
                            <div className="font-bold text-gold-600 dark:text-gold-400">{recruit.points}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Role</div>
                            <Badge variant="outline" className="capitalize text-navy-700 dark:text-slate-300 border-slate-200 dark:border-navy-700 text-xs">
                              {recruit.role}
                            </Badge>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Joined</div>
                            <div className="text-xs font-medium text-navy-900 dark:text-white">
                              {new Date(recruit.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedRecruitId(recruit.id)}
                          className="w-full text-blue-500 border-blue-200 dark:border-blue-900 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          <Scale className="h-4 w-4 mr-2" />
                          View Biometrics
                          <ChevronRight className="h-4 w-4 ml-auto" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table */}
                  <div className="hidden sm:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-200 dark:border-navy-800 hover:bg-slate-50 dark:hover:bg-navy-800/50">
                          <TableHead className="text-slate-500 dark:text-slate-400">Name</TableHead>
                          <TableHead className="text-slate-500 dark:text-slate-400">Email</TableHead>
                          <TableHead className="text-slate-500 dark:text-slate-400">Role</TableHead>
                          <TableHead className="text-slate-500 dark:text-slate-400">Points</TableHead>
                          <TableHead className="text-slate-500 dark:text-slate-400">Status</TableHead>
                          <TableHead className="text-slate-500 dark:text-slate-400">Joined</TableHead>
                          <TableHead className="text-right text-slate-500 dark:text-slate-400">Biometrics</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {roster.map((recruit) => (
                          <TableRow key={recruit.id} className="border-slate-200 dark:border-navy-800 hover:bg-slate-50 dark:hover:bg-navy-800/50">
                            <TableCell className="font-medium text-navy-900 dark:text-white">{recruit.name}</TableCell>
                            <TableCell className="text-slate-500 dark:text-slate-400">{recruit.email}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize text-navy-700 dark:text-slate-300 border-slate-200 dark:border-navy-700">
                                {recruit.role}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-bold text-gold-600 dark:text-gold-400">{recruit.points}</TableCell>
                            <TableCell>
                              <Badge
                                variant={recruit.isActive ? 'default' : 'secondary'}
                                className={recruit.isActive
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 border-green-200 dark:border-green-900'
                                  : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400'}
                              >
                                {recruit.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-slate-500 dark:text-slate-400">
                              {new Date(recruit.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedRecruitId(recruit.id)}
                                className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              >
                                <Scale className="h-4 w-4 mr-1" />
                                View
                                <ChevronRight className="h-4 w-4 ml-1" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Genealogy Tab */}
        <TabsContent value="genealogy">
          <Card className="border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm transition-colors">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-navy-900 dark:text-white flex items-center gap-2">
                    <GitBranch className="h-5 w-5 text-green-500" />
                    Referral Genealogy
                  </CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400">
                    Visual representation of your referral tree and team structure.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={treeView === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTreeView('list')}
                    className={treeView === 'list'
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-400'}
                  >
                    List View
                  </Button>
                  <Button
                    variant={treeView === 'tree' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTreeView('tree')}
                    className={treeView === 'tree'
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-400'}
                  >
                    Tree View
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {genealogyLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                </div>
              ) : !genealogy ? (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  <GitBranch className="h-12 w-12 mx-auto mb-4 text-slate-300 dark:text-navy-700" />
                  <p className="mb-2">No genealogy data available.</p>
                  <p className="text-sm">Start referring people to build your team tree!</p>
                </div>
              ) : treeView === 'tree' ? (
                <GenealogyTree data={genealogy} showStats={true} />
              ) : (
                <div className="space-y-4">
                  {/* Stats Summary for List View */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    <div className="bg-slate-50 dark:bg-navy-800 rounded-xl p-4 border border-slate-200 dark:border-navy-700">
                      <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium mb-1">Direct Referrals</div>
                      <div className="text-xl font-bold text-navy-900 dark:text-white">{genealogy.directReferrals}</div>
                    </div>
                    <div className="bg-slate-50 dark:bg-navy-800 rounded-xl p-4 border border-slate-200 dark:border-navy-700">
                      <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium mb-1">Total Team</div>
                      <div className="text-xl font-bold text-navy-900 dark:text-white">{genealogy.totalDownline}</div>
                    </div>
                    <div className="bg-slate-50 dark:bg-navy-800 rounded-xl p-4 border border-slate-200 dark:border-navy-700">
                      <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium mb-1">Your Points</div>
                      <div className="text-xl font-bold text-gold-600 dark:text-gold-400">{genealogy.points}</div>
                    </div>
                    <div className="bg-slate-50 dark:bg-navy-800 rounded-xl p-4 border border-slate-200 dark:border-navy-700">
                      <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium mb-1">Team Points</div>
                      <div className="text-xl font-bold text-green-600 dark:text-green-400">{genealogy.teamPoints}</div>
                    </div>
                  </div>
                  <GenealogyList data={genealogy} maxDepth={5} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Biometrics Detail Dialog - Full Screen */}
      <Dialog open={!!selectedRecruitId} onOpenChange={(open) => !open && setSelectedRecruitId(null)}>
        <DialogContent className="w-screen h-screen max-w-none max-h-none m-0 p-0 rounded-none bg-white dark:bg-navy-900 flex flex-col transition-colors">
          {/* Fixed Header */}
          <div className="sticky top-0 z-10 bg-white dark:bg-navy-900 border-b border-slate-200 dark:border-navy-800 px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                  <Scale className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <DialogTitle className="text-lg sm:text-xl font-bold text-navy-900 dark:text-white">
                    {biometricsData?.recruit?.name}'s Biometrics
                  </DialogTitle>
                  <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
                    28-day challenge progress
                  </DialogDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedRecruitId(null)}
                className="h-10 w-10 rounded-full hover:bg-slate-100 dark:hover:bg-navy-800 animate-pulse-subtle ring-2 ring-slate-200 dark:ring-navy-700 ring-offset-2 ring-offset-white dark:ring-offset-navy-900 transition-all hover:ring-blue-400 dark:hover:ring-blue-500 hover:animate-none"
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
            {biometricsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : !biometricsData?.biometrics || biometricsData.biometrics.length === 0 ? (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <Scale className="h-16 w-16 mx-auto mb-4 text-slate-300 dark:text-navy-700" />
                <p className="text-lg mb-2">No biometric data submitted yet.</p>
                <p className="text-sm">This team member hasn't recorded any weekly weigh-ins.</p>
              </div>
            ) : (
              <div className="space-y-6 max-w-4xl mx-auto">
                {/* Summary Cards */}
                {biometricsData.biometrics.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {(() => {
                      const sortedForSummary = [...biometricsData.biometrics].sort(
                        (a, b) => (a.submittedAt || 0) - (b.submittedAt || 0)
                      );
                      const first = sortedForSummary[0];
                      const latest = sortedForSummary[sortedForSummary.length - 1];
                      const weightChange = latest.weight - first.weight;
                      const bodyFatChange = latest.bodyFat - first.bodyFat;
                      return (
                        <>
                          <div className="bg-slate-50 dark:bg-navy-800 rounded-xl p-4 border border-slate-200 dark:border-navy-700 transition-colors">
                            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium mb-1">Current Weight</div>
                            <div className="text-xl sm:text-2xl font-bold text-navy-900 dark:text-white">{latest.weight} lbs</div>
                            <div className={`text-sm flex items-center gap-1 ${weightChange < 0 ? 'text-green-600' : weightChange > 0 ? 'text-red-500' : 'text-slate-500'}`}>
                              {weightChange < 0 ? <TrendingDown className="h-4 w-4" /> : weightChange > 0 ? <TrendingUp className="h-4 w-4" /> : null}
                              {weightChange !== 0 && `${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)} lbs`}
                              {weightChange === 0 && 'No change'}
                            </div>
                          </div>
                          <div className="bg-slate-50 dark:bg-navy-800 rounded-xl p-4 border border-slate-200 dark:border-navy-700 transition-colors">
                            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium mb-1">Body Fat</div>
                            <div className="text-xl sm:text-2xl font-bold text-navy-900 dark:text-white">{latest.bodyFat}%</div>
                            <div className={`text-sm flex items-center gap-1 ${bodyFatChange < 0 ? 'text-green-600' : bodyFatChange > 0 ? 'text-red-500' : 'text-slate-500'}`}>
                              {bodyFatChange < 0 ? <TrendingDown className="h-4 w-4" /> : bodyFatChange > 0 ? <TrendingUp className="h-4 w-4" /> : null}
                              {bodyFatChange !== 0 && `${bodyFatChange > 0 ? '+' : ''}${bodyFatChange.toFixed(1)}%`}
                              {bodyFatChange === 0 && 'No change'}
                            </div>
                          </div>
                          <div className="bg-slate-50 dark:bg-navy-800 rounded-xl p-4 border border-slate-200 dark:border-navy-700 transition-colors">
                            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium mb-1">Metabolic Age</div>
                            <div className="text-xl sm:text-2xl font-bold text-navy-900 dark:text-white">{latest.metabolicAge}</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">years</div>
                          </div>
                          <div className="bg-slate-50 dark:bg-navy-800 rounded-xl p-4 border border-slate-200 dark:border-navy-700 transition-colors">
                            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium mb-1">Progress</div>
                            <div className="text-xl sm:text-2xl font-bold text-navy-900 dark:text-white">{biometricsData.biometrics.length}/5</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">weigh-ins</div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}

                {/* Weekly Data - Mobile Card Layout */}
                <div className="space-y-3 sm:hidden">
                  <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Weigh-In History</h3>
                  {[0, 1, 2, 3, 4].map((entryIndex) => {
                    const sortedBiometrics = [...biometricsData.biometrics].sort(
                      (a, b) => (a.submittedAt || 0) - (b.submittedAt || 0)
                    );
                    const bio = sortedBiometrics[entryIndex];
                    const prevBio = entryIndex > 0 ? sortedBiometrics[entryIndex - 1] : null;
                    const weightDiff = bio && prevBio ? bio.weight - prevBio.weight : 0;
                    const entryLabel = entryIndex === 0 ? 'Initial' : `Week ${entryIndex}`;

                    if (!bio) {
                      return (
                        <div key={`mobile-pending-${entryIndex}`} className="bg-slate-50/50 dark:bg-navy-800/30 rounded-xl p-4 border border-dashed border-slate-200 dark:border-navy-700">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-slate-400 dark:text-slate-500">{entryLabel}</span>
                            <Badge variant="outline" className="text-slate-400 dark:text-slate-500 border-slate-300 dark:border-navy-700">
                              Pending
                            </Badge>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={bio.id} className="bg-white dark:bg-navy-800 rounded-xl p-4 border border-slate-200 dark:border-navy-700 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold text-navy-900 dark:text-white">{entryLabel}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {bio.submittedAt && bio.submittedAt > 0
                              ? new Date(bio.submittedAt).toLocaleDateString()
                              : '—'}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-center">
                          <div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Weight</div>
                            <div className="font-bold text-navy-900 dark:text-white">{bio.weight}</div>
                            <div className="text-xs text-slate-400">lbs</div>
                            {prevBio && weightDiff !== 0 && (
                              <div className={`text-xs mt-1 ${weightDiff < 0 ? 'text-green-600' : 'text-red-500'}`}>
                                {weightDiff > 0 ? '+' : ''}{weightDiff.toFixed(1)}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Body Fat</div>
                            <div className="font-bold text-navy-900 dark:text-white">{bio.bodyFat}</div>
                            <div className="text-xs text-slate-400">%</div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Met. Age</div>
                            <div className="font-bold text-navy-900 dark:text-white">{bio.metabolicAge}</div>
                            <div className="text-xs text-slate-400">yrs</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-100 dark:border-navy-700">
                          <div className="text-center">
                            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Visceral</div>
                            <div className="font-medium text-navy-900 dark:text-white">{bio.visceralFat}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Lean Mass</div>
                            <div className="font-medium text-navy-900 dark:text-white">{bio.leanMass} lbs</div>
                          </div>
                        </div>
                        {bio.screenshotUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedScreenshot({
                              url: bio.screenshotUrl,
                              label: entryLabel
                            })}
                            className="w-full mt-3 text-blue-500 border-blue-200 dark:border-blue-900 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            <Image className="h-4 w-4 mr-2" />
                            View Screenshot
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Weekly Data Table - Desktop Only */}
                <div className="hidden sm:block overflow-x-auto">
                  <Table>
                  <TableHeader>
                    <TableRow className="border-slate-200 dark:border-navy-800">
                      <TableHead className="text-slate-500 dark:text-slate-400">Entry</TableHead>
                      <TableHead className="text-slate-500 dark:text-slate-400">Weight</TableHead>
                      <TableHead className="text-slate-500 dark:text-slate-400">Body Fat</TableHead>
                      <TableHead className="text-slate-500 dark:text-slate-400">Visceral Fat</TableHead>
                      <TableHead className="text-slate-500 dark:text-slate-400">Lean Mass</TableHead>
                      <TableHead className="text-slate-500 dark:text-slate-400">Metabolic Age</TableHead>
                      <TableHead className="text-slate-500 dark:text-slate-400">Screenshot</TableHead>
                      <TableHead className="text-right text-slate-500 dark:text-slate-400">Submitted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Show all 5 entries: submitted ones first by order, then pending slots */}
                    {[0, 1, 2, 3, 4].map((entryIndex) => {
                      // Sort biometrics by submittedAt to get them in submission order
                      const sortedBiometrics = [...biometricsData.biometrics].sort(
                        (a, b) => (a.submittedAt || 0) - (b.submittedAt || 0)
                      );
                      const bio = sortedBiometrics[entryIndex];
                      const prevBio = entryIndex > 0 ? sortedBiometrics[entryIndex - 1] : null;
                      const weightDiff = bio && prevBio ? bio.weight - prevBio.weight : 0;
                      // First entry is always "Initial", rest are "Week 1", "Week 2", etc.
                      const entryLabel = entryIndex === 0 ? 'Initial' : `Week ${entryIndex}`;

                      if (!bio) {
                        // Pending entry - not yet submitted
                        return (
                          <TableRow key={`pending-${entryIndex}`} className="border-slate-200 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-800/30">
                            <TableCell className="font-medium text-slate-400 dark:text-slate-500">
                              {entryLabel}
                            </TableCell>
                            <TableCell colSpan={6} className="text-center">
                              <Badge variant="outline" className="text-slate-400 dark:text-slate-500 border-slate-300 dark:border-navy-700">
                                Pending
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right text-slate-400 dark:text-slate-500">
                              —
                            </TableCell>
                          </TableRow>
                        );
                      }

                      // Submitted entry
                      return (
                        <TableRow key={bio.id} className="border-slate-200 dark:border-navy-800 hover:bg-slate-50 dark:hover:bg-navy-800/50">
                          <TableCell className="font-medium text-navy-900 dark:text-white">
                            {entryLabel}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-navy-900 dark:text-white">{bio.weight} lbs</span>
                              {prevBio && weightDiff !== 0 && (
                                <span className={`text-xs ${weightDiff < 0 ? 'text-green-600' : 'text-red-500'}`}>
                                  ({weightDiff > 0 ? '+' : ''}{weightDiff.toFixed(1)})
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-600 dark:text-slate-300">{bio.bodyFat}%</TableCell>
                          <TableCell className="text-slate-600 dark:text-slate-300">{bio.visceralFat}</TableCell>
                          <TableCell className="text-slate-600 dark:text-slate-300">{bio.leanMass} lbs</TableCell>
                          <TableCell>
                            <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900">
                              {bio.metabolicAge} yrs
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {bio.screenshotUrl && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedScreenshot({
                                  url: bio.screenshotUrl,
                                  label: entryLabel
                                })}
                                className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 h-auto py-1 px-2"
                              >
                                <Image className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            )}
                          </TableCell>
                          <TableCell className="text-right text-slate-500 dark:text-slate-400">
                            {bio.submittedAt && bio.submittedAt > 0
                              ? new Date(bio.submittedAt).toLocaleDateString()
                              : '—'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Full-Screen Screenshot Viewer Dialog */}
      <Dialog open={!!selectedScreenshot} onOpenChange={(open) => !open && setSelectedScreenshot(null)}>
        <DialogContent className="w-screen h-screen max-w-none max-h-none m-0 p-0 rounded-none bg-black flex flex-col">
          {/* Fixed Header */}
          <div className="sticky top-0 z-10 bg-black/90 backdrop-blur-sm border-b border-white/10 px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <Image className="h-5 w-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-white">
                    {selectedScreenshot?.label} Weigh-In
                  </DialogTitle>
                  <DialogDescription className="text-sm text-white/60">
                    Scale screenshot proof
                  </DialogDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedScreenshot(null)}
                className="h-10 w-10 rounded-full text-white hover:bg-white/10 animate-pulse-subtle ring-2 ring-white/30 ring-offset-2 ring-offset-black transition-all hover:ring-white/60 hover:animate-none"
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </div>

          {/* Image Content - Centered */}
          <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
            {selectedScreenshot?.url && (
              <img
                src={selectedScreenshot.url}
                alt={`${selectedScreenshot.label} weigh-in screenshot`}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Quiz Answers Detail Dialog - Full Screen */}
      <Dialog open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <DialogContent className="w-screen h-screen max-w-none max-h-none m-0 p-0 rounded-none bg-white dark:bg-navy-900 flex flex-col transition-colors">
          {/* Fixed Header */}
          <div className="sticky top-0 z-10 bg-white dark:bg-navy-900 border-b border-slate-200 dark:border-navy-800 px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <DialogTitle className="text-lg sm:text-xl font-bold text-navy-900 dark:text-white">
                    {selectedLead?.name}'s Quiz Results
                  </DialogTitle>
                  <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
                    Metabolic age quiz answers and scores
                  </DialogDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedLead(null)}
                className="h-10 w-10 rounded-full hover:bg-slate-100 dark:hover:bg-navy-800 animate-pulse-subtle ring-2 ring-slate-200 dark:ring-navy-700 ring-offset-2 ring-offset-white dark:ring-offset-navy-900 transition-all hover:ring-blue-400 dark:hover:ring-blue-500 hover:animate-none"
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
            {selectedLead && (
              <div className="space-y-6 max-w-4xl mx-auto">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <div className="bg-slate-50 dark:bg-navy-800 rounded-xl p-4 border border-slate-200 dark:border-navy-700 transition-colors">
                    <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium mb-1">Actual Age</div>
                    <div className="text-xl sm:text-2xl font-bold text-navy-900 dark:text-white">{selectedLead.age}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">years</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-navy-800 rounded-xl p-4 border border-slate-200 dark:border-navy-700 transition-colors">
                    <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium mb-1">Metabolic Age</div>
                    <div className={`text-xl sm:text-2xl font-bold ${
                      selectedLead.metabolicAge - selectedLead.age >= 10 ? 'text-red-600 dark:text-red-400' :
                      selectedLead.metabolicAge - selectedLead.age >= 5 ? 'text-orange-600 dark:text-orange-400' :
                      'text-green-600 dark:text-green-400'
                    }`}>{selectedLead.metabolicAge}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">+{selectedLead.metabolicAge - selectedLead.age} years</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-navy-800 rounded-xl p-4 border border-slate-200 dark:border-navy-700 transition-colors">
                    <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium mb-1">Quiz Score</div>
                    <div className="text-xl sm:text-2xl font-bold text-navy-900 dark:text-white">{selectedLead.quizScore}/50</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">{Math.round((selectedLead.quizScore / 50) * 100)}%</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-navy-800 rounded-xl p-4 border border-slate-200 dark:border-navy-700 transition-colors">
                    <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium mb-1">Status</div>
                    <Badge
                      className={`mt-1 ${selectedLead.convertedToUserId
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900'
                        : 'bg-slate-100 dark:bg-navy-700 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-navy-600'}`}
                    >
                      {selectedLead.convertedToUserId ? 'Enrolled' : 'Pending'}
                    </Badge>
                    <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">{selectedLead.sex}</div>
                  </div>
                </div>

                {/* Result Type Badge */}
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Result Type:</div>
                  <Badge className={`capitalize ${
                    selectedLead.resultType === 'fatigue' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                    selectedLead.resultType === 'instability' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                    selectedLead.resultType === 'plateau' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                    'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  }`}>
                    {selectedLead.resultType === 'fatigue' ? 'Metabolic Fatigue' :
                     selectedLead.resultType === 'instability' ? 'Glucose Instability' :
                     selectedLead.resultType === 'plateau' ? 'Cortisol Plateau' : 'Optimized'}
                  </Badge>
                </div>

                {/* Quiz Answers */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Quiz Answers</h3>
                  <div className="space-y-3">
                    {Object.entries(selectedLead.quizAnswers || {}).map(([questionId, points]) => {
                      const questionData = quizQuestions[questionId];
                      if (!questionData) return null;
                      const scoreInfo = getScoreLabel(points as number);
                      const Icon = questionData.icon;
                      return (
                        <div key={questionId} className="bg-slate-50 dark:bg-navy-800 rounded-xl p-4 border border-slate-200 dark:border-navy-700 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-navy-700 flex items-center justify-center shrink-0">
                              <Icon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase">{questionData.category}</span>
                                <Badge className={scoreInfo.color}>
                                  {points}/10 - {scoreInfo.label}
                                </Badge>
                              </div>
                              <p className="text-sm text-navy-900 dark:text-white">
                                {questionData.question}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="bg-slate-50 dark:bg-navy-800 rounded-xl p-4 border border-slate-200 dark:border-navy-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium mb-1">Contact</div>
                      <a href={`tel:${selectedLead.phone}`} className="flex items-center gap-2 text-blue-500 hover:text-blue-600">
                        <Phone className="h-4 w-4" />
                        {selectedLead.phone}
                      </a>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium mb-1">Captured</div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Calendar className="h-4 w-4" />
                        {new Date(selectedLead.capturedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}