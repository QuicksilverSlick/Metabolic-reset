import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rosterApi, GroupLeaderWithSize } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search, UserPlus, Users, ArrowUpDown, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

// Debounce hook for search input
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

type SortOption = 'name-asc' | 'name-desc' | 'group-size-asc' | 'group-size-desc';
export function AssignCaptainPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userId = useAuthStore(s => s.userId);
  const updateUser = useAuthStore(s => s.updateUser);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: captains, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['captains'],
    queryFn: rosterApi.searchCaptains,
    refetchInterval: 30000, // Refresh every 30 seconds for live updates
    staleTime: 10000,       // Consider data stale after 10 seconds
    refetchOnWindowFocus: true,
  });
  const assignMutation = useMutation({
    mutationFn: (captainId: string) => {
      if (!userId) throw new Error('Not authenticated');
      return rosterApi.assignCaptain(userId, captainId);
    },
    onSuccess: (updatedUser) => {
      updateUser({ captainId: updatedUser.captainId });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('You have successfully joined a group!');
      navigate('/app');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to join group');
    }
  });
  // Filter and sort captains with memoization for performance
  const filteredAndSortedCaptains = useMemo(() => {
    if (!captains) return [];

    // Filter by debounced search term
    let filtered = captains.filter((captain: GroupLeaderWithSize) =>
      captain.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      captain.referralCode.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );

    // Sort based on selected option
    return filtered.sort((a: GroupLeaderWithSize, b: GroupLeaderWithSize) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'group-size-asc':
          return (a.groupSize || 0) - (b.groupSize || 0);
        case 'group-size-desc':
          return (b.groupSize || 0) - (a.groupSize || 0);
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [captains, debouncedSearchTerm, sortBy]);
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
        <h1 className="text-3xl font-display font-bold text-navy-900 dark:text-white mb-4">Find Your Group</h1>
        <p className="text-slate-600 dark:text-slate-300 text-lg">
          You are currently not assigned to a group. To participate fully in the project and be eligible for awards, please select a Group Facilitator below.
        </p>
      </div>

      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name or referral code..."
            className="pl-10 bg-white dark:bg-navy-950 border-slate-200 dark:border-navy-800 text-navy-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Sort Dropdown */}
        <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
          <SelectTrigger className="w-full sm:w-48 bg-white dark:bg-navy-950 border-slate-200 dark:border-navy-800 text-navy-900 dark:text-white">
            <ArrowUpDown className="h-4 w-4 mr-2 text-slate-400" />
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
            <SelectItem value="group-size-desc">Group Size (Largest)</SelectItem>
            <SelectItem value="group-size-asc">Group Size (Smallest)</SelectItem>
          </SelectContent>
        </Select>

        {/* Refresh Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => refetch()}
          disabled={isFetching}
          className="shrink-0 border-slate-200 dark:border-navy-800"
          title="Refresh list"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Results count and live indicator */}
      <div className="flex items-center justify-between max-w-2xl mx-auto text-sm text-slate-500 dark:text-slate-400">
        <span>
          {filteredAndSortedCaptains.length} group facilitator{filteredAndSortedCaptains.length !== 1 ? 's' : ''} found
          {debouncedSearchTerm && ` for "${debouncedSearchTerm}"`}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Live updates
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedCaptains.length > 0 ? (
          filteredAndSortedCaptains.map((captain: GroupLeaderWithSize) => (
            <Card key={captain.id} className="border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 hover:border-gold-200 dark:hover:border-gold-500/50 hover:shadow-md transition-all">
              <CardHeader className="pb-4">
                {captain.avatarUrl ? (
                  <img
                    src={captain.avatarUrl}
                    alt={captain.name}
                    className="w-12 h-12 rounded-full object-cover mb-4"
                  />
                ) : (
                  <div className="w-12 h-12 bg-navy-100 dark:bg-navy-800 rounded-full flex items-center justify-center mb-4 text-navy-700 dark:text-white font-bold text-xl">
                    {captain.name.charAt(0)}
                  </div>
                )}
                <CardTitle className="text-lg text-navy-900 dark:text-white">{captain.name}</CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400">
                  <span>Code: <span className="font-mono font-bold text-gold-600 dark:text-gold-400">{captain.referralCode}</span></span>
                  {captain.groupSize !== undefined && (
                    <span className="flex items-center gap-1 mt-1">
                      <Users className="h-3.5 w-3.5" />
                      {captain.groupSize} member{captain.groupSize !== 1 ? 's' : ''}
                    </span>
                  )}
                </CardDescription>
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
                  Join Group
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-slate-500 dark:text-slate-400">
            <p>No group facilitators found matching your search.</p>
            {debouncedSearchTerm && (
              <Button
                variant="link"
                onClick={() => setSearchTerm('')}
                className="mt-2 text-gold-600 dark:text-gold-400"
              >
                Clear search
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}