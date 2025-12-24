/**
 * Admin Push Notifications Tab
 * Allows admins to test push notifications and view subscription stats
 */

import { useState } from 'react';
import { Bell, Send, Users, Loader2, AlertCircle, CheckCircle, Search, User as UserIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { useAdminUsers } from '@/hooks/use-queries';

interface TestPushResult {
  success: boolean;
  sent?: number;
  failed?: number;
  error?: string;
}

export function PushNotificationsTab() {
  const { data: usersData } = useAdminUsers();
  const users = usersData?.users || [];

  // Test notification state
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [title, setTitle] = useState('Test Notification');
  const [body, setBody] = useState('This is a test push notification from the admin panel.');
  const [url, setUrl] = useState('/app');
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<TestPushResult | null>(null);
  const [userSearch, setUserSearch] = useState('');

  // Filter users for search
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.phone.includes(userSearch) ||
    user.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  // Send test notification
  const handleSendTest = async () => {
    if (!selectedUserId) {
      toast.error('Please select a user');
      return;
    }

    if (!title.trim() || !body.trim()) {
      toast.error('Title and body are required');
      return;
    }

    setIsSending(true);
    setResult(null);

    try {
      const response = await api<TestPushResult>('/api/admin/push/test', {
        method: 'POST',
        body: JSON.stringify({
          userId: selectedUserId,
          title: title.trim(),
          body: body.trim(),
          url: url.trim() || '/app',
        }),
      });

      setResult(response);

      if (response.success && response.sent && response.sent > 0) {
        toast.success(`Push sent successfully to ${response.sent} device(s)`);
      } else if (response.sent === 0) {
        toast.warning('User has no push subscriptions');
      } else {
        toast.error(response.error || 'Failed to send push');
      }
    } catch (error: any) {
      setResult({ success: false, error: error.message });
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  // Send system announcement
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementBody, setAnnouncementBody] = useState('');
  const [isSendingAnnouncement, setIsSendingAnnouncement] = useState(false);

  const handleSendAnnouncement = async () => {
    if (!announcementTitle.trim() || !announcementBody.trim()) {
      toast.error('Title and message are required');
      return;
    }

    const confirmed = window.confirm(
      `This will send a push notification to ALL users with push enabled.\n\nTitle: ${announcementTitle}\nMessage: ${announcementBody}\n\nAre you sure?`
    );

    if (!confirmed) return;

    setIsSendingAnnouncement(true);

    try {
      const response = await api<{ sent: number; failed: number }>('/api/admin/push/broadcast', {
        method: 'POST',
        body: JSON.stringify({
          title: announcementTitle.trim(),
          body: announcementBody.trim(),
          url: '/app',
        }),
      });

      toast.success(`Announcement sent to ${response.sent} users (${response.failed} failed)`);
      setAnnouncementTitle('');
      setAnnouncementBody('');
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsSendingAnnouncement(false);
    }
  };

  const selectedUser = users.find(u => u.id === selectedUserId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Bell className="h-6 w-6" />
          Push Notifications
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Test push notifications and send system announcements
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Notification Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send Test Notification
            </CardTitle>
            <CardDescription>
              Send a test push notification to a specific user
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* User Selection */}
            <div className="space-y-2">
              <Label>Select User</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a user" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {filteredUsers.slice(0, 50).map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4" />
                        <span>{user.name}</span>
                        <span className="text-slate-400 text-xs">{user.phone}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedUser && (
                <p className="text-xs text-slate-500">
                  Selected: {selectedUser.name} ({selectedUser.email || selectedUser.phone})
                </p>
              )}
            </div>

            {/* Notification Fields */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Notification title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Message</Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Notification message"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">Click URL (optional)</Label>
              <Input
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="/app"
              />
            </div>

            {/* Result Display */}
            {result && (
              <div className={`p-3 rounded-lg ${result.success ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                <div className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    {result.success ? (
                      <p className="text-sm font-medium text-green-700 dark:text-green-400">
                        Sent: {result.sent} | Failed: {result.failed}
                      </p>
                    ) : (
                      <p className="text-sm font-medium text-red-700 dark:text-red-400">
                        {result.error || 'Failed to send'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={handleSendTest}
              disabled={isSending || !selectedUserId}
              className="w-full"
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Test Push
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* System Announcement Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              System Announcement
            </CardTitle>
            <CardDescription>
              Send a push notification to all users with push enabled
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="announcement-title">Title</Label>
              <Input
                id="announcement-title"
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
                placeholder="Announcement title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="announcement-body">Message</Label>
              <Textarea
                id="announcement-body"
                value={announcementBody}
                onChange={(e) => setAnnouncementBody(e.target.value)}
                placeholder="Announcement message"
                rows={4}
              />
            </div>

            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                This will send to ALL users with push enabled. Use sparingly.
              </p>
            </div>

            <Button
              onClick={handleSendAnnouncement}
              disabled={isSendingAnnouncement || !announcementTitle || !announcementBody}
              variant="outline"
              className="w-full border-amber-500 text-amber-600 hover:bg-amber-50"
            >
              {isSendingAnnouncement ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Broadcasting...
                </>
              ) : (
                <>
                  <Users className="h-4 w-4 mr-2" />
                  Broadcast Announcement
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Push Notification Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li className="flex items-start gap-2">
              <Badge variant="outline" className="shrink-0">Tip</Badge>
              Users must enable push notifications in their profile settings to receive them
            </li>
            <li className="flex items-start gap-2">
              <Badge variant="outline" className="shrink-0">iOS</Badge>
              iOS users must add the app to their Home Screen (PWA) before push notifications work
            </li>
            <li className="flex items-start gap-2">
              <Badge variant="outline" className="shrink-0">Limit</Badge>
              Avoid sending too many notifications - users may disable them if overwhelmed
            </li>
            <li className="flex items-start gap-2">
              <Badge variant="outline" className="shrink-0">TTL</Badge>
              Push notifications expire after 24 hours if the user's device is offline
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
