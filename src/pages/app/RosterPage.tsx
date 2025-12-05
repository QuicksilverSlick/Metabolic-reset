import React from 'react';
import { useTeamRoster, useUser } from '@/hooks/use-queries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
export function RosterPage() {
  const { data: user, isLoading: userLoading } = useUser();
  const { data: roster, isLoading: rosterLoading } = useTeamRoster();
  if (userLoading || rosterLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }
  if (user?.role !== 'coach') {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            This page is only available to Coaches and Team Captains.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-navy-900">Team Roster</h1>
          <p className="text-slate-500">Manage your recruits and track their progress.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2">
          <Users className="h-5 w-5 text-orange-500" />
          <span className="font-bold text-navy-900">{roster?.length || 0}</span>
          <span className="text-slate-500 text-sm">Recruits</span>
        </div>
      </div>
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Your Team</CardTitle>
          <CardDescription>
            List of all challengers who have joined using your referral code.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!roster || roster.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p>No recruits yet. Share your referral code to grow your team!</p>
              <div className="mt-4 inline-block bg-slate-100 px-4 py-2 rounded-lg font-mono text-navy-900 font-bold">
                {user.referralCode}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roster.map((recruit) => (
                    <TableRow key={recruit.id}>
                      <TableCell className="font-medium text-navy-900">{recruit.name}</TableCell>
                      <TableCell className="text-slate-500">{recruit.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {recruit.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold text-orange-600">{recruit.points}</TableCell>
                      <TableCell>
                        <Badge variant={recruit.isActive ? 'default' : 'secondary'} className={recruit.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200' : ''}>
                          {recruit.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-slate-500">
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