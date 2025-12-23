import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CreditCard,
  Check,
  X,
  Link2,
  ExternalLink,
  Loader2,
  ChevronRight,
  Search,
  AlertCircle,
  RefreshCw
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { adminApi } from '@/lib/api';
import type { User } from '@shared/types';

interface PaymentsTabProps {
  userId: string;
  users: User[] | undefined;
}

export function PaymentsTab({ userId, users }: PaymentsTabProps) {
  const queryClient = useQueryClient();
  const [lastId, setLastId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<{
    id: string;
    amount: string;
    cardLast4: string | null;
    billingName: string | null;
  } | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  // Fetch Stripe payments
  const { data: paymentsData, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'stripe-payments', lastId],
    queryFn: () => adminApi.getStripePayments(userId, 50, lastId || undefined),
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

  // Filter payments by search term (card last4, name, email)
  const filteredPayments = paymentsData?.payments.filter(payment => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      payment.cardLast4?.includes(term) ||
      payment.billingName?.toLowerCase().includes(term) ||
      payment.billingEmail?.toLowerCase().includes(term) ||
      payment.metadata?.name?.toLowerCase().includes(term) ||
      payment.metadata?.phone?.includes(term) ||
      payment.receiptEmail?.toLowerCase().includes(term) ||
      payment.id.toLowerCase().includes(term)
    );
  }) || [];

  // Filter users for link dialog
  const filteredUsers = users?.filter(u => {
    if (!selectedPayment) return true;
    // Show all users but prioritize matches
    return true;
  }).sort((a, b) => {
    // Sort by name
    return a.name.localeCompare(b.name);
  }) || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <Badge className="bg-green-600 text-white">Succeeded</Badge>;
      case 'requires_payment_method':
      case 'requires_confirmation':
      case 'requires_action':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Pending</Badge>;
      case 'canceled':
        return <Badge variant="outline" className="border-red-500 text-red-600">Canceled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getCardIcon = (brand: string | null) => {
    // Simple card brand display
    const brandLower = brand?.toLowerCase() || '';
    if (brandLower === 'visa') return '💳 Visa';
    if (brandLower === 'mastercard') return '💳 MC';
    if (brandLower === 'amex') return '💳 Amex';
    if (brandLower === 'discover') return '💳 Disc';
    return '💳';
  };

  const openLinkDialog = (payment: typeof filteredPayments[0]) => {
    setSelectedPayment({
      id: payment.id,
      amount: payment.amountFormatted,
      cardLast4: payment.cardLast4,
      billingName: payment.billingName,
    });
    setLinkDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-red-500">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>Failed to load Stripe payments</p>
            <p className="text-sm text-slate-500">{(error as Error).message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-gold-500" />
                Stripe Payments
              </CardTitle>
              <CardDescription>
                View recent payments and link orphan payments to users
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by card last 4, name, email, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-50 dark:bg-navy-800 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">
                {paymentsData?.payments.filter(p => p.status === 'succeeded').length || 0}
              </div>
              <div className="text-xs text-slate-500">Succeeded</div>
            </div>
            <div className="bg-slate-50 dark:bg-navy-800 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {paymentsData?.payments.filter(p => p.status !== 'succeeded' && p.status !== 'canceled').length || 0}
              </div>
              <div className="text-xs text-slate-500">Pending</div>
            </div>
            <div className="bg-slate-50 dark:bg-navy-800 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">
                {paymentsData?.payments.filter(p => p.linkedUser).length || 0}
              </div>
              <div className="text-xs text-slate-500">Linked</div>
            </div>
            <div className="bg-slate-50 dark:bg-navy-800 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">
                {paymentsData?.payments.filter(p => p.status === 'succeeded' && !p.linkedUser).length || 0}
              </div>
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
                {filteredPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className={`border-b border-slate-100 dark:border-navy-800 hover:bg-slate-50 dark:hover:bg-navy-800/50 ${
                      payment.status === 'succeeded' && !payment.linkedUser ? 'bg-orange-50 dark:bg-orange-900/10' : ''
                    }`}
                  >
                    <td className="py-3 px-2">
                      <div className="text-sm">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-slate-400">
                        {new Date(payment.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span className="font-mono font-medium">{payment.amountFormatted}</span>
                    </td>
                    <td className="py-3 px-2">
                      {payment.cardLast4 ? (
                        <div>
                          <span className="text-xs text-slate-400">{getCardIcon(payment.cardBrand)}</span>
                          <span className="font-mono ml-1">****{payment.cardLast4}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      <div className="max-w-[200px]">
                        {payment.billingName || payment.metadata?.name ? (
                          <div className="font-medium truncate">
                            {payment.billingName || payment.metadata?.name}
                          </div>
                        ) : null}
                        {(payment.receiptEmail || payment.metadata?.email) && (
                          <div className="text-xs text-slate-400 truncate">
                            {payment.receiptEmail || payment.metadata?.email}
                          </div>
                        )}
                        {payment.metadata?.phone && (
                          <div className="text-xs text-slate-400 font-mono">
                            {payment.metadata.phone}
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
                          <span className="text-sm">{payment.linkedUser.name}</span>
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
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Link2 className="h-4 w-4 mr-1" />
                            Link
                          </Button>
                        )}
                        <a
                          href={`https://dashboard.stripe.com/payments/${payment.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-slate-600"
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

          {filteredPayments.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              {searchTerm ? 'No payments match your search' : 'No payments found'}
            </div>
          )}

          {/* Pagination */}
          {paymentsData?.hasMore && (
            <div className="mt-4 flex justify-center">
              <Button
                variant="outline"
                onClick={() => setLastId(paymentsData.lastId)}
              >
                Load More
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Link Payment Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link Payment to User</DialogTitle>
            <DialogDescription>
              Select a user to link this payment to. This will update their payment record.
            </DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="bg-slate-50 dark:bg-navy-800 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Payment:</span>
                <span className="font-mono text-sm">{selectedPayment.id.slice(0, 20)}...</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-slate-500">Amount:</span>
                <span className="font-medium text-green-600">{selectedPayment.amount}</span>
              </div>
              {selectedPayment.cardLast4 && (
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-slate-500">Card:</span>
                  <span className="font-mono">****{selectedPayment.cardLast4}</span>
                </div>
              )}
              {selectedPayment.billingName && (
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-slate-500">Billing Name:</span>
                  <span>{selectedPayment.billingName}</span>
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select User</label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a user..." />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {filteredUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <span>{user.name}</span>
                        <span className="text-xs text-slate-400">({user.phone})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedPayment && selectedUserId) {
                  linkMutation.mutate({
                    paymentIntentId: selectedPayment.id,
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
    </>
  );
}
