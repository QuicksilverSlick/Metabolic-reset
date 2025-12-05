import React from 'react';
import { useUser } from '@/hooks/use-queries';
import { useAuthStore } from '@/lib/auth-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, LogOut, User, Shield, Award, Copy } from 'lucide-react';
import { toast } from 'sonner';
export function ProfilePage() {
  const { data: user, isLoading } = useUser();
  const logout = useAuthStore(s => s.logout);
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }
  if (!user) return null;
  const copyReferralCode = () => {
    navigator.clipboard.writeText(user.referralCode);
    toast.success('Referral code copied to clipboard!');
  };
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-3xl font-display font-bold text-navy-900">My Profile</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Info Card */}
        <Card className="md:col-span-2 border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your account details and contact info.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={user.name} readOnly className="bg-slate-50" />
              </div>
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input value={user.email} readOnly className="bg-slate-50" />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input value={user.phone} readOnly className="bg-slate-50" />
              </div>
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Input value={user.timezone} readOnly className="bg-slate-50" />
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Status Card */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <Shield className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-sm text-slate-500">Role</div>
                <div className="font-bold capitalize text-navy-900">{user.role}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Award className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-slate-500">Total Points</div>
                <div className="font-bold text-navy-900">{user.points}</div>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <Label className="text-xs text-slate-500 uppercase tracking-wider">Referral Code</Label>
              <div className="mt-1 flex gap-2">
                <div className="flex-1 bg-slate-100 rounded px-3 py-2 font-mono font-bold text-center text-navy-900 border border-slate-200">
                  {user.referralCode}
                </div>
                <Button variant="outline" size="icon" onClick={copyReferralCode}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="destructive" className="w-full" onClick={() => logout()}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}