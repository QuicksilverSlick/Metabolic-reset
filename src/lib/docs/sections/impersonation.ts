import type { DocSection } from '../types';

export const impersonationSection: DocSection = {
  id: 'impersonation',
  title: 'User Impersonation',
  description: 'Secure admin tool for viewing the app as any user',
  icon: 'UserCog',
  order: 6,
  articles: [
    {
      id: 'overview',
      title: 'Impersonation Overview',
      description: 'What is user impersonation and when to use it',
      tags: ['security', 'admin', 'impersonation', 'debugging'],
      lastUpdated: '2024-12-23',
      content: `
# User Impersonation System

The User Impersonation feature allows administrators to securely view the application exactly as a specific user sees it. This is an essential debugging and support tool that maintains strict security controls.

## Purpose

- **Customer Support**: Diagnose issues users report by seeing exactly what they see
- **Testing**: Verify user-specific features work correctly
- **Debugging**: Investigate bugs in the context of a user's actual data
- **Quality Assurance**: Ensure the experience is consistent across different user types

## Key Security Features

| Feature | Description |
|---------|-------------|
| **Admin-Only Access** | Only users with \`isAdmin: true\` can initiate impersonation |
| **60-Minute Timeout** | Sessions automatically expire after one hour |
| **View-Only Mode** | All data-modifying actions are blocked during impersonation |
| **Visual Indicator** | A persistent banner shows impersonation is active |
| **Audit Logging** | Every session is recorded with full metadata |
| **Countdown Timer** | Real-time display of remaining session time |

## How It Works

1. Admin navigates to **Admin Panel → Users**
2. Admin clicks the **👁️ (eye)** icon on any user row
3. A confirmation dialog appears with security reminder
4. Upon confirmation, admin's view switches to the target user's perspective
5. The impersonation banner appears at the top with countdown
6. Admin can browse the app as the user (read-only)
7. Session ends via **Exit Impersonation** button or timeout
      `.trim(),
      relatedArticles: ['starting-session', 'audit-logs', 'troubleshooting'],
    },
    {
      id: 'starting-session',
      title: 'Starting an Impersonation Session',
      description: 'Step-by-step guide to impersonate a user',
      tags: ['howto', 'admin', 'impersonation'],
      lastUpdated: '2024-12-23',
      content: `
# Starting an Impersonation Session

This guide walks through the process of safely initiating a user impersonation session.

## Prerequisites

- You must have **admin privileges** (\`isAdmin: true\`)
- The target user must exist in the system
- No existing impersonation session should be active

## Step-by-Step Process

### 1. Navigate to User Management

Go to the **Admin Panel** and select the **Users** tab. You'll see a list of all registered users.

### 2. Locate the Target User

Use the search functionality or scroll to find the user you need to impersonate. You can search by:
- Name
- Email/Phone
- User ID

### 3. Initiate Impersonation

Click the **👁️ (eye icon)** in the Actions column for the target user.

\`\`\`
+----------------+-------------+--------+-----------+
| User           | Email       | Status | Actions   |
+----------------+-------------+--------+-----------+
| John Smith     | john@...    | Active | 👁️ ✏️ 🗑️ |
+----------------+-------------+--------+-----------+
\`\`\`

### 4. Confirm the Action

A confirmation dialog will appear:

> **Impersonate User?**
>
> You are about to view the application as **[User Name]**.
>
> - Session will last 60 minutes maximum
> - All actions are view-only (no modifications allowed)
> - This session will be logged for audit purposes
>
> [Cancel] [Confirm Impersonation]

### 5. Session Begins

Upon confirmation:
- Your view immediately switches to the user's perspective
- The **Impersonation Banner** appears at the top of the screen
- A 60-minute countdown timer begins
- An audit log entry is created

## The Impersonation Banner

The banner displays:

\`\`\`
┌─────────────────────────────────────────────────────────┐
│ 👁️ Viewing as: John Smith (john@example.com)  [45:32]  │
│                                    [Exit Impersonation] │
└─────────────────────────────────────────────────────────┘
\`\`\`

- **User Info**: Name and email of impersonated user
- **Timer**: Countdown showing remaining time (turns orange when <5 min)
- **Exit Button**: End the session immediately

## What You Can Do

✅ **Allowed Actions:**
- View dashboard and all user data
- Navigate between pages
- View habit tracking history
- View biometric submissions
- Access course content as the user sees it

❌ **Blocked Actions (View-Only):**
- Submit daily habits
- Submit biometric data
- Update profile information
- Make any data modifications
- Access admin panel features
      `.trim(),
      relatedArticles: ['overview', 'view-only-mode'],
    },
    {
      id: 'view-only-mode',
      title: 'View-Only Mode',
      description: 'Understanding the restrictions during impersonation',
      tags: ['security', 'impersonation', 'restrictions'],
      lastUpdated: '2024-12-23',
      content: `
# View-Only Mode

During impersonation, all data-modifying actions are blocked to protect user data integrity. This is enforced at multiple levels.

## Why View-Only?

1. **Data Integrity**: Prevents accidental modifications to user data
2. **Audit Trail**: All changes should be attributable to the actual user
3. **Trust**: Users can trust their data won't be altered without consent
4. **Legal Compliance**: Maintains clear boundaries for data access

## Technical Implementation

The view-only mode is enforced through the \`assertNotImpersonating()\` guard in the React Query hooks:

\`\`\`typescript
// Example: Habit submission is blocked
const submitHabit = useMutation({
  mutationFn: async (data) => {
    assertNotImpersonating(); // Throws if impersonating
    return api.submitHabit(data);
  }
});
\`\`\`

## Protected Mutations

The following actions are blocked during impersonation:

### User Profile
- Update profile information
- Change avatar
- Update notification preferences

### Daily Tracking
- Submit water intake
- Log steps
- Record sleep hours
- Mark lessons complete

### Biometrics
- Submit weekly weigh-in
- Upload measurement photos
- Record body measurements

### Administrative
- Any admin-only actions
- Project enrollment changes
- Payment submissions

## User Experience

When an impersonating admin attempts a blocked action:

1. The action is prevented from executing
2. A toast notification appears:
   > ⚠️ "Cannot perform this action while impersonating"
3. The UI may show disabled states on action buttons

## Button States

Many action buttons will appear in a disabled or modified state:

| Normal State | Impersonating State |
|--------------|---------------------|
| "Submit Habits" (enabled) | "Submit Habits" (disabled/grayed) |
| "Save Profile" (enabled) | "Save Profile" (disabled/grayed) |

## Edge Cases

### What if I need to make changes for a user?

End the impersonation session first, then use admin tools to make modifications. This ensures:
- Changes are logged under your admin account
- Proper audit trail is maintained
- User can be notified of changes
      `.trim(),
      relatedArticles: ['overview', 'starting-session'],
    },
    {
      id: 'audit-logs',
      title: 'Audit Logging',
      description: 'How impersonation sessions are tracked and logged',
      tags: ['security', 'audit', 'logging', 'compliance'],
      lastUpdated: '2024-12-23',
      content: `
# Audit Logging

Every impersonation session is comprehensively logged for security, compliance, and accountability purposes.

## What Gets Logged

Each impersonation session creates an \`ImpersonationSessionEntity\` record containing:

| Field | Description |
|-------|-------------|
| \`id\` | Unique session identifier |
| \`adminId\` | ID of the admin who initiated |
| \`adminEmail\` | Email of the initiating admin |
| \`targetUserId\` | ID of the impersonated user |
| \`targetUserEmail\` | Email of the impersonated user |
| \`startedAt\` | Timestamp when session began |
| \`endedAt\` | Timestamp when session ended (null if active) |
| \`expiresAt\` | Auto-expiration timestamp (60 min from start) |
| \`reason\` | Optional reason provided by admin |

## Session Lifecycle

### Session Start
\`\`\`
POST /api/admin/impersonate/:userId

Log Entry Created:
{
  adminId: "admin-123",
  adminEmail: "admin@company.com",
  targetUserId: "user-456",
  targetUserEmail: "user@example.com",
  startedAt: 1703318400000,
  expiresAt: 1703322000000, // +60 minutes
  endedAt: null
}
\`\`\`

### Session End
\`\`\`
POST /api/admin/end-impersonation

Log Entry Updated:
{
  ...existing,
  endedAt: 1703319200000 // Actual end time
}
\`\`\`

## Viewing Audit Logs

Audit logs can be accessed through:

1. **Admin Panel → Settings → Audit Logs** (if implemented)
2. **Direct database query** (Cloudflare D1/Durable Objects)
3. **API endpoint**: \`GET /api/admin/impersonation-logs\`

## Log Retention

- Logs are retained indefinitely by default
- Logs can be exported for compliance reporting
- Consider implementing retention policies based on regulatory requirements

## Security Considerations

### Who Can View Logs?
- Only admins can view impersonation logs
- Logs are filtered to show only relevant information

### Log Tampering Prevention
- Logs are append-only
- No mechanism exists to delete or modify log entries
- Timestamps are server-generated (not client-provided)

## Compliance Benefits

The audit logging system helps with:

- **GDPR**: Documenting data access for subject access requests
- **SOC 2**: Demonstrating access controls and monitoring
- **HIPAA**: If handling health data, tracking who accessed what
- **Internal Policy**: Ensuring staff follow proper procedures
      `.trim(),
      relatedArticles: ['overview', 'session-timeout'],
    },
    {
      id: 'session-timeout',
      title: 'Session Timeout & Auto-Expire',
      description: 'How the 60-minute timeout works',
      tags: ['security', 'timeout', 'session'],
      lastUpdated: '2024-12-23',
      content: `
# Session Timeout & Auto-Expire

Impersonation sessions are designed to be temporary, with automatic expiration to prevent prolonged unauthorized access.

## The 60-Minute Rule

All impersonation sessions automatically expire after **60 minutes**. This is enforced at multiple levels:

### Frontend Timer

The \`ImpersonationBanner\` component maintains a real-time countdown:

\`\`\`typescript
const IMPERSONATION_DURATION_MS = 60 * 60 * 1000; // 60 minutes

// Timer updates every second
useEffect(() => {
  const interval = setInterval(() => {
    const remaining = expiresAt - Date.now();
    if (remaining <= 0) {
      endImpersonation();
      toast({ title: "Session Expired", ... });
    }
  }, 1000);
}, [expiresAt]);
\`\`\`

### Backend Validation

The server also validates session expiration:

\`\`\`typescript
// On every impersonated request
if (session.expiresAt < Date.now()) {
  throw new Error("Impersonation session expired");
}
\`\`\`

## Visual Indicators

### Normal State (>5 minutes remaining)
\`\`\`
┌────────────────────────────────────────┐
│ 👁️ Viewing as: John Smith      [32:15] │
└────────────────────────────────────────┘
   ↑ Navy blue/gold styling
\`\`\`

### Warning State (<5 minutes remaining)
\`\`\`
┌────────────────────────────────────────┐
│ ⚠️ Viewing as: John Smith      [04:32] │
└────────────────────────────────────────┘
   ↑ Orange/amber warning styling
\`\`\`

## What Happens on Timeout

When the session expires:

1. **Frontend State Cleared**
   - \`useAuthStore\` impersonation state is reset
   - Local storage is updated

2. **User Notified**
   - Toast notification: "Impersonation session has expired"
   - Automatic redirect to admin panel

3. **Audit Log Updated**
   - \`endedAt\` timestamp recorded
   - Reason: "auto-expired"

## Extending Sessions

Sessions **cannot** be extended. If you need more time:

1. End the current session
2. Start a new session with the same user
3. A new 60-minute window begins
4. A new audit log entry is created

This design ensures:
- Regular audit trail checkpoints
- No indefinite access periods
- Clear session boundaries

## Edge Cases

### Browser Closed During Session
- Session continues server-side until timeout
- Re-opening app shows admin view (not impersonated)
- Audit log shows session as expired

### Multiple Tabs
- All tabs share the same impersonation state
- Ending in one tab ends in all tabs
- Timer stays synchronized via localStorage events

### Network Disconnection
- Frontend timer continues independently
- On reconnect, server validates session
- Expired sessions are cleaned up
      `.trim(),
      relatedArticles: ['overview', 'audit-logs'],
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      description: 'Common issues and solutions',
      tags: ['troubleshooting', 'help', 'faq'],
      lastUpdated: '2024-12-23',
      content: `
# Troubleshooting Impersonation

Common issues and their solutions when using the user impersonation feature.

## Common Issues

### "Cannot impersonate user" Error

**Possible Causes:**
1. You don't have admin privileges
2. The target user doesn't exist
3. There's already an active session

**Solutions:**
1. Verify your account has \`isAdmin: true\`
2. Refresh the user list and try again
3. End any existing impersonation session first

---

### Timer Not Showing

**Symptom:** Impersonation is active but no countdown timer visible

**Possible Causes:**
1. Legacy session without \`expiresAt\` field
2. Browser cache showing old components
3. Session started before timer feature was added

**Solutions:**
1. End the current session and start a new one
2. Hard refresh the page (Ctrl+Shift+R / Cmd+Shift+R)
3. Clear browser cache and reload

---

### Actions Still Working During Impersonation

**Symptom:** Expected view-only mode, but buttons are enabled

**Possible Causes:**
1. Mutation guard not implemented for that action
2. Component not checking impersonation state
3. Stale React Query cache

**Solutions:**
1. Report as a bug - mutations should be guarded
2. Refresh the page to reset state
3. This is a code issue requiring developer fix

---

### Session Ended Unexpectedly

**Possible Causes:**
1. 60-minute timeout reached
2. Another tab ended the session
3. Server restart cleared session state
4. Browser storage was cleared

**Solutions:**
1. Check the timestamp - may have exceeded timeout
2. Start a new session if needed
3. This is expected behavior

---

### Impersonation Banner Persists After Logout

**Symptom:** Banner shows even after logging out

**Possible Causes:**
1. State not properly cleared on logout
2. Race condition in state management

**Solutions:**
1. Hard refresh the page
2. Clear localStorage manually:
   \`\`\`javascript
   localStorage.removeItem('auth-storage');
   \`\`\`
3. Use incognito mode to verify it's a cache issue

---

## Best Practices

### Before Starting a Session
- ✅ Document why you need to impersonate
- ✅ Inform the user if required by policy
- ✅ Use for legitimate support purposes only

### During a Session
- ✅ Take screenshots/notes of issues found
- ✅ Don't leave session idle for extended periods
- ✅ End session as soon as you're done

### After a Session
- ✅ Document findings
- ✅ Follow up with user if needed
- ✅ Verify audit log was created

## Getting Help

If you encounter persistent issues:

1. Check the browser console for errors
2. Review network requests for API failures
3. Submit a bug report with:
   - Steps to reproduce
   - Screenshots of the issue
   - Browser/device information
   - Console error messages
      `.trim(),
      relatedArticles: ['overview', 'starting-session', 'session-timeout'],
    },
  ],
};
