import React, { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CreditCard,
  Check,
  Link2,
  Unlink,
  ExternalLink,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Search,
  AlertCircle,
  RefreshCw,
  X,
  Filter,
  User as UserIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { adminApi } from '@/lib/api';
import type { User } from '@shared/types';

interface PaymentsTabProps {
  userId: string;
  users: User[] | undefined;
}

type PaymentData = {
  id: string;
  paymentIntentId: string | null;
  amount: number;
  amountFormatted: string;
  status: string;
  createdAt: number;
  metadata: { name?: string; phone?: string; email?: string; role?: string };
  receiptEmail?: string;
  cardLast4: string | null;
  cardBrand: string | null;
  billingName: string | null;
  billingEmail: string | null;
  billingPhone: string | null;
  linkedUser: { id: string; name: string; phone: string } | null;
};

// Pagination cursor stack for back/forward navigation
interface PaginationState {
  cursors: string[]; // Stack of cursor IDs for going back
  currentIndex: number; // Current position in the stack (-1 = first page)
}

export function PaymentsTab({ userId, users }: PaymentsTabProps) {
  const queryClient = useQueryClient();

  // Mode: 'browse' for paginated list, 'search' for server-side search
  const [mode, setMode] = useState<'browse' | 'search'>('browse');

  // Search state
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState<{
    cardLast4?: string;
    status?: string;
  } | null>(null);
  const [searchPage, setSearchPage] = useState<string | null>(null);
  const [searchPageStack, setSearchPageStack] = useState<string[]>([]); // For search pagination back

  // Browse pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    cursors: [],
    currentIndex: -1,
  });

  // Link dialog state
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<{
    id: string;
    paymentIntentId: string | null;
    amount: string;
    cardLast4: string | null;
    billingName: string | null;
  } | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [userSearchTerm, setUserSearchTerm] = useState('');

  // Unlink dialog state
  const [unlinkDialogOpen, setUnlinkDialogOpen] = useState(false);
  const [paymentToUnlink, setPaymentToUnlink] = useState<{
    id: string;
    amount: string;
    linkedUser: { id: string; name: string; phone: string };
  } | null>(null);

  // Compute current cursor for browse mode
  const getCurrentBrowseCursor = useCallback(() => {
    if (pagination.currentIndex < 0) return undefined;
    return pagination.cursors[pagination.currentIndex];
  }, [pagination]);

  // Browse mode query - fetch paginated list
  const {
    data: browseData,
    isLoading: browseLoading,
    error: browseError,
    refetch: refetchBrowse
  } = useQuery({
    queryKey: ['admin', 'stripe-payments', 'browse', getCurrentBrowseCursor()],
    queryFn: () => adminApi.getStripePayments(userId, {
      limit: 25,
      startingAfter: getCurrentBrowseCursor(),
    }),
    enabled: mode === 'browse',
  });

  // Search mode query - server-side search
  const {
    data: searchData,
    isLoading: searchLoading,
    error: searchError,
    refetch: refetchSearch
  } = useQuery({
    queryKey: ['admin', 'stripe-payments', 'search', activeSearch, searchPage],
    queryFn: () => adminApi.searchStripePayments(userId, {
      cardLast4: activeSearch?.cardLast4,
      status: activeSearch?.status,
      limit: 25,
      page: searchPage || undefined,
    }),
    enabled: mode === 'search' && activeSearch !== null,
  });

  // Link payment mutation
  const linkMutation = useMutation({
    mutationFn: ({ paymentIntentId, targetUserId }: { paymentIntentId: string; targetUserId: string }) =>
      adminApi.linkStripePayment(userId, paymentIntentId, targetUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'stripe-payments'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setLinkDialogOpen(false);
      setSelectedPayment(null);
      setSelectedUserId('');
    },
  });

  // Unlink payment mutation
  const unlinkMutation = useMutation({
    mutationFn: (targetUserId: string) =>
      adminApi.unlinkStripePayment(userId, targetUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'stripe-payments'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setUnlinkDialogOpen(false);
      setPaymentToUnlink(null);
    },
  });

  // Handle search submission
  const handleSearch = useCallback(() => {
    const trimmed = searchInput.trim();
    if (!trimmed) {
      // Clear search, go back to browse
      setMode('browse');
      setActiveSearch(null);
      setSearchPage(null);
      setSearchPageStack([]);
      return;
    }

    // Determine if this is a card last4 search (4 digits)
    const isCardSearch = /^\d{4}$/.test(trimmed);

    setMode('search');
    setActiveSearch(isCardSearch ? { cardLast4: trimmed } : { status: 'succeeded' });
    setSearchPage(null);
    setSearchPageStack([]);
  }, [searchInput]);

  // Handle search on Enter key
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchInput('');
    setMode('browse');
    setActiveSearch(null);
    setSearchPage(null);
    setSearchPageStack([]);
  };

  // Browse pagination handlers
  const goToNextPage = () => {
    if (!browseData?.lastId) return;

    setPagination(prev => ({
      cursors: [...prev.cursors.slice(0, prev.currentIndex + 1), browseData.lastId!],
      currentIndex: prev.currentIndex + 1,
    }));
  };

  const goToPreviousPage = () => {
    if (pagination.currentIndex < 0) return;

    setPagination(prev => ({
      ...prev,
      currentIndex: prev.currentIndex - 1,
    }));
  };

  const goToFirstPage = () => {
    setPagination({
      cursors: [],
      currentIndex: -1,
    });
  };

  // Search pagination handlers
  const goToNextSearchPage = () => {
    if (!searchData?.nextPage) return;

    // Save current page to stack before moving forward
    if (searchPage) {
      setSearchPageStack(prev => [...prev, searchPage]);
    }
    setSearchPage(searchData.nextPage);
  };

  const goToPreviousSearchPage = () => {
    if (searchPageStack.length === 0) {
      // Go back to first page
      setSearchPage(null);
    } else {
      // Pop from stack
      const newStack = [...searchPageStack];
      const prevPage = newStack.pop();
      setSearchPageStack(newStack);
      setSearchPage(prevPage || null);
    }
  };

  // Current data based on mode
  const payments = mode === 'browse' ? browseData?.payments : searchData?.payments;
  const isLoading = mode === 'browse' ? browseLoading : searchLoading;
  const error = mode === 'browse' ? browseError : searchError;

  // Stats from current page
  const stats = {
    succeeded: payments?.filter(p => p.status === 'succeeded').length || 0,
    pending: payments?.filter(p => p.status !== 'succeeded' && p.status !== 'failed').length || 0,
    linked: payments?.filter(p => p.linkedUser).length || 0,
    orphaned: payments?.filter(p => p.status === 'succeeded' && !p.linkedUser).length || 0,
  };

  // Filter users for link dialog - use useMemo for reactivity
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    const term = userSearchTerm.toLowerCase().trim();
    if (!term) {
      return [...users].sort((a, b) => a.name.localeCompare(b.name));
    }
    return users
      .filter(u =>
        u.name.toLowerCase().includes(term) ||
        u.phone.includes(term) ||
        (u.email && u.email.toLowerCase().includes(term))
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [users, userSearchTerm]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <Badge className="bg-green-600 text-white">Succeeded</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Pending</Badge>;
      case 'failed':
        return <Badge variant="outline" className="border-red-500 text-red-600">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getCardDisplay = (brand: string | null, last4: string | null) => {
    if (!last4) return <span className="text-slate-400">-</span>;

    const brandLower = brand?.toLowerCase() || '';
    let brandIcon = '💳';
    let brandName = brand || '';

    if (brandLower === 'visa') { brandIcon = '💳'; brandName = 'Visa'; }
    else if (brandLower === 'mastercard') { brandIcon = '💳'; brandName = 'MC'; }
    else if (brandLower === 'amex') { brandIcon = '💳'; brandName = 'Amex'; }
    else if (brandLower === 'discover') { brandIcon = '💳'; brandName = 'Disc'; }

    return (
      <div className="flex items-center gap-1">
        <span className="text-xs">{brandIcon}</span>
        <span className="text-xs text-slate-500">{brandName}</span>
        <span className="font-mono">****{last4}</span>
      </div>
    );
  };

  const openLinkDialog = (payment: PaymentData) => {
    setSelectedPayment({
      id: payment.id,
      paymentIntentId: payment.paymentIntentId,
      amount: payment.amountFormatted,
      cardLast4: payment.cardLast4,
      billingName: payment.billingName,
    });
    setUserSearchTerm('');
    setSelectedUserId('');
    setLinkDialogOpen(true);
  };

  const openUnlinkDialog = (payment: PaymentData) => {
    if (!payment.linkedUser) return;
    setPaymentToUnlink({
      id: payment.id,
      amount: payment.amountFormatted,
      linkedUser: payment.linkedUser,
    });
    setUnlinkDialogOpen(true);
  };

  // Pagination info
  const pageNumber = pagination.currentIndex + 2; // +2 because index -1 = page 1
  const canGoPrevious = mode === 'browse'
    ? pagination.currentIndex >= 0
    : (searchPage !== null || searchPageStack.length > 0);
  const canGoNext = mode === 'browse'
    ? browseData?.hasMore
    : searchData?.hasMore;

  if (isLoading && !payments) {
    return (
      <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
        <CardContent className="py-12">
          <div className="text-center text-red-500">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>Failed to load Stripe payments</p>
            <p className="text-sm text-slate-500 mt-1">{(error as Error).message}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => mode === 'browse' ? refetchBrowse() : refetchSearch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                <CreditCard className="h-5 w-5 text-gold-500" />
                Stripe Payments
              </CardTitle>
              <CardDescription>
                {mode === 'search'
                  ? `Searching: ${activeSearch?.cardLast4 ? `Card ****${activeSearch.cardLast4}` : 'All succeeded'}`
                  : 'Browse and manage Stripe payments'
                }
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => mode === 'browse' ? refetchBrowse() : refetchSearch()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="mb-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Enter card last 4 digits (e.g., 4242) and press Enter to search..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="pl-10 pr-10 bg-white dark:bg-navy-800"
                />
                {searchInput && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Button onClick={handleSearch} disabled={isLoading}>
                <Filter className="h-4 w-4 mr-2" />
                Search
              </Button>
              {mode === 'search' && (
                <Button variant="outline" onClick={clearSearch}>
                  Clear
                </Button>
              )}
            </div>
            {mode === 'search' && searchData?.query && (
              <p className="text-xs text-slate-500 mt-2">
                Stripe query: <code className="bg-slate-100 dark:bg-navy-800 px-1 rounded">{searchData.query}</code>
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-50 dark:bg-navy-800 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{stats.succeeded}</div>
              <div className="text-xs text-slate-500">Succeeded</div>
            </div>
            <div className="bg-slate-50 dark:bg-navy-800 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-xs text-slate-500">Pending</div>
            </div>
            <div className="bg-slate-50 dark:bg-navy-800 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.linked}</div>
              <div className="text-xs text-slate-500">Linked</div>
            </div>
            <div className="bg-slate-50 dark:bg-navy-800 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.orphaned}</div>
              <div className="text-xs text-slate-500">Orphaned</div>
            </div>
          </div>

          {/* Payments Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-navy-700">
                  <th className="text-left py-3 px-2 font-medium text-slate-500">Date</th>
                  <th className="text-left py-3 px-2 font-medium text-slate-500">Amount</th>
                  <th className="text-left py-3 px-2 font-medium text-slate-500">Card</th>
                  <th className="text-left py-3 px-2 font-medium text-slate-500">Customer</th>
                  <th className="text-left py-3 px-2 font-medium text-slate-500">Status</th>
                  <th className="text-left py-3 px-2 font-medium text-slate-500">Linked User</th>
                  <th className="text-right py-3 px-2 font-medium text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments?.map((payment) => (
                  <tr
                    key={payment.id}
                    className={`border-b border-slate-100 dark:border-navy-800 hover:bg-slate-50 dark:hover:bg-navy-800/50 ${
                      payment.status === 'succeeded' && !payment.linkedUser ? 'bg-orange-50 dark:bg-orange-900/10' : ''
                    }`}
                  >
                    <td className="py-3 px-2">
                      <div className="text-sm text-slate-900 dark:text-white">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-slate-400">
                        {new Date(payment.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span className="font-mono font-medium text-slate-900 dark:text-white">
                        {payment.amountFormatted}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      {getCardDisplay(payment.cardBrand, payment.cardLast4)}
                    </td>
                    <td className="py-3 px-2">
                      <div className="max-w-[200px]">
                        {(payment.billingName || payment.metadata?.name) && (
                          <div className="font-medium truncate text-slate-900 dark:text-white">
                            {payment.billingName || payment.metadata?.name}
                          </div>
                        )}
                        {(payment.receiptEmail || payment.billingEmail || payment.metadata?.email) && (
                          <div className="text-xs text-slate-400 truncate">
                            {payment.receiptEmail || payment.billingEmail || payment.metadata?.email}
                          </div>
                        )}
                        {(payment.billingPhone || payment.metadata?.phone) && (
                          <div className="text-xs text-slate-400 font-mono">
                            {payment.billingPhone || payment.metadata?.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="py-3 px-2">
                      {payment.linkedUser ? (
                        <div className="flex items-center gap-1">
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-slate-900 dark:text-white">{payment.linkedUser.name}</span>
                        </div>
                      ) : payment.status === 'succeeded' ? (
                        <span className="text-orange-600 text-sm font-medium">Not linked</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {payment.status === 'succeeded' && !payment.linkedUser && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openLinkDialog(payment)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            <Link2 className="h-4 w-4 mr-1" />
                            Link
                          </Button>
                        )}
                        {payment.linkedUser && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openUnlinkDialog(payment)}
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                          >
                            <Unlink className="h-4 w-4 mr-1" />
                            Unlink
                          </Button>
                        )}
                        <a
                          href={`https://dashboard.stripe.com/payments/${payment.paymentIntentId || payment.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-slate-600"
                          title="View in Stripe"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {payments?.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              {mode === 'search' ? 'No payments match your search' : 'No payments found'}
            </div>
          )}

          {/* Pagination Controls */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-slate-500">
              {mode === 'browse' && `Page ${pageNumber}`}
              {mode === 'search' && payments && `${payments.length} results`}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={mode === 'browse' ? goToPreviousPage : goToPreviousSearchPage}
                disabled={!canGoPrevious || isLoading}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              {mode === 'browse' && pagination.currentIndex > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToFirstPage}
                >
                  First
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={mode === 'browse' ? goToNextPage : goToNextSearchPage}
                disabled={!canGoNext || isLoading}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Link Payment Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="bg-white dark:bg-navy-900 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">Link Payment to User</DialogTitle>
            <DialogDescription>
              Select a user to link this payment to. This will update their payment record.
            </DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="bg-slate-50 dark:bg-navy-800 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Charge ID:</span>
                <span className="font-mono text-sm text-slate-900 dark:text-white">{selectedPayment.id.slice(0, 20)}...</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-slate-500">Amount:</span>
                <span className="font-medium text-green-600">{selectedPayment.amount}</span>
              </div>
              {selectedPayment.cardLast4 && (
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-slate-500">Card:</span>
                  <span className="font-mono text-slate-900 dark:text-white">****{selectedPayment.cardLast4}</span>
                </div>
              )}
              {selectedPayment.billingName && (
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-slate-500">Billing Name:</span>
                  <span className="text-slate-900 dark:text-white">{selectedPayment.billingName}</span>
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block text-slate-900 dark:text-white">Search Users</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Type to search by name, phone, or email..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="pl-10 bg-white dark:bg-navy-800"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block text-slate-900 dark:text-white">
                {filteredUsers.length > 0
                  ? `Select User (${filteredUsers.length} ${userSearchTerm ? 'match' : 'total'}${filteredUsers.length !== 1 ? 'es' : ''})`
                  : 'No users found'
                }
              </label>
              <div className="border border-slate-200 dark:border-navy-700 rounded-lg max-h-[250px] overflow-y-auto scrollbar-styled">
                {filteredUsers.length === 0 ? (
                  <div className="p-4 text-center text-slate-500">
                    {userSearchTerm ? 'No users match your search' : 'No users available'}
                  </div>
                ) : (
                  filteredUsers.slice(0, 100).map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => setSelectedUserId(user.id)}
                      className={`w-full text-left px-4 py-3 border-b border-slate-100 dark:border-navy-800 last:border-b-0 hover:bg-slate-50 dark:hover:bg-navy-800 active:bg-slate-100 dark:active:bg-navy-700 transition-colors ${
                        selectedUserId === user.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500'
                          : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-navy-700 flex items-center justify-center">
                          <UserIcon className="h-4 w-4 text-slate-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-900 dark:text-white truncate">
                            {user.name}
                          </div>
                          <div className="text-xs text-slate-500 truncate">
                            {user.phone} {user.email && `• ${user.email}`}
                          </div>
                        </div>
                        {selectedUserId === user.id && (
                          <Check className="h-5 w-5 text-blue-500 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))
                )}
                {filteredUsers.length > 100 && (
                  <div className="px-4 py-2 text-xs text-slate-500 bg-slate-50 dark:bg-navy-800">
                    Showing first 100 results. Use search to narrow down.
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedPayment && selectedUserId) {
                  const idToLink = selectedPayment.paymentIntentId || selectedPayment.id;
                  linkMutation.mutate({
                    paymentIntentId: idToLink,
                    targetUserId: selectedUserId,
                  });
                }
              }}
              disabled={!selectedUserId || linkMutation.isPending}
            >
              {linkMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Link2 className="h-4 w-4 mr-2" />
              )}
              Link Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unlink Payment Dialog */}
      <Dialog open={unlinkDialogOpen} onOpenChange={setUnlinkDialogOpen}>
        <DialogContent className="bg-white dark:bg-navy-900">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">Unlink Payment from User</DialogTitle>
            <DialogDescription>
              Are you sure you want to unlink this payment? The user's payment verification will be removed.
            </DialogDescription>
          </DialogHeader>

          {paymentToUnlink && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Amount:</span>
                <span className="font-medium text-green-600">{paymentToUnlink.amount}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-slate-500">Currently Linked To:</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900 dark:text-white">{paymentToUnlink.linkedUser.name}</span>
                  <span className="text-xs text-slate-400">({paymentToUnlink.linkedUser.phone})</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setUnlinkDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (paymentToUnlink) {
                  unlinkMutation.mutate(paymentToUnlink.linkedUser.id);
                }
              }}
              disabled={unlinkMutation.isPending}
            >
              {unlinkMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Unlink className="h-4 w-4 mr-2" />
              )}
              Unlink Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
