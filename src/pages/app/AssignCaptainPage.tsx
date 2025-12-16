import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rosterApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, UserPlus, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { User } from '@shared/types';
export function AssignCaptainPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userId = useAuthStore(s => s.userId);
  const updateUser = useAuthStore(s => s.updateUser);
  const [searchTerm, setSearchTerm] = useState('');
  const { data: captains, isLoading } = useQuery({
    queryKey: ['captains'],
    queryFn: rosterApi.searchCaptains,
  });
  const assignMutation = useMutation({
    mutationFn: (captainId: string) => {
      if (!userId) throw new Error('Not authenticated');
      return rosterApi.assignCaptain(userId, captainId);
    },
    onSuccess: (updatedUser) => {
      updateUser({ captainId: updatedUser.captainId });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('You have successfully joined a team!');
      navigate('/app');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to join team');
    }
  });
  const filteredCaptains = captains?.filter(captain =>
    captain.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    captain.referralCode.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
      </div>
    );
  }
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-display font-bold text-navy-900 dark:text-white mb-4">Find Your Team</h1>
        <p className="text-slate-600 dark:text-slate-300 text-lg">
          You are currently not assigned to a team. To participate fully in the challenge and be eligible for prizes, please select a Captain below.
        </p>
      </div>
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search by name or referral code..."
          className="pl-10 bg-white dark:bg-navy-950 border-slate-200 dark:border-navy-800 text-navy-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCaptains.length > 0 ? (
          filteredCaptains.map((captain) => (
            <Card key={captain.id} className="border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 hover:border-gold-200 dark:hover:border-gold-500/50 hover:shadow-md transition-all">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-navy-100 dark:bg-navy-800 rounded-full flex items-center justify-center mb-4 text-navy-700 dark:text-white font-bold text-xl">
                  {captain.name.charAt(0)}
                </div>
                <CardTitle className="text-lg text-navy-900 dark:text-white">{captain.name}</CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400">Code: <span className="font-mono font-bold text-gold-600 dark:text-gold-400">{captain.referralCode}</span></CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full bg-navy-900 hover:bg-navy-800 dark:bg-gold-500 dark:hover:bg-gold-600 text-white"
                  onClick={() => assignMutation.mutate(captain.id)}
                  disabled={assignMutation.isPending}
                >
                  {assignMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <UserPlus className="h-4 w-4 mr-2" />
                  )}
                  Join Team
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-slate-500 dark:text-slate-400">
            <p>No captains found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}