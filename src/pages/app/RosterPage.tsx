import React from 'react';
import { useTeamRoster, useUser } from '@/hooks/use-queries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Users, AlertCircle, Trophy, CheckCircle2, Star } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
export function RosterPage() {
  const { data: user, isLoading: userLoading } = useUser();
  const { data: roster, isLoading: rosterLoading } = useTeamRoster();
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
  const qualificationThreshold = 10;
  const isQualified = recruitCount >= qualificationThreshold;
  const progressPercent = Math.min(100, (recruitCount / qualificationThreshold) * 100);
  const remaining = Math.max(0, qualificationThreshold - recruitCount);
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-navy-900 dark:text-white">Team Roster</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your recruits and track their progress.</p>
        </div>
        <div className="bg-white dark:bg-navy-900 px-4 py-2 rounded-lg border border-slate-200 dark:border-navy-800 shadow-sm flex items-center gap-2 transition-colors">
          <Users className="h-5 w-5 text-gold-500" />
          <span className="font-bold text-navy-900 dark:text-white">{recruitCount}</span>
          <span className="text-slate-500 dark:text-slate-400 text-sm">Recruits</span>
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
      <Card className="border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm transition-colors">
        <CardHeader>
          <CardTitle className="text-navy-900 dark:text-white">Your Team</CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400">
            List of all challengers who have joined using your referral code.
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200 dark:border-navy-800 hover:bg-slate-50 dark:hover:bg-navy-800/50">
                    <TableHead className="text-slate-500 dark:text-slate-400">Name</TableHead>
                    <TableHead className="text-slate-500 dark:text-slate-400">Email</TableHead>
                    <TableHead className="text-slate-500 dark:text-slate-400">Role</TableHead>
                    <TableHead className="text-slate-500 dark:text-slate-400">Points</TableHead>
                    <TableHead className="text-slate-500 dark:text-slate-400">Status</TableHead>
                    <TableHead className="text-right text-slate-500 dark:text-slate-400">Joined</TableHead>
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
                      <TableCell className="text-right text-slate-500 dark:text-slate-400">
                        {new Date(recruit.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}