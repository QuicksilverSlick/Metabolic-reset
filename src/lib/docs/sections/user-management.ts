import type { DocSection } from '../types';

export const userManagementSection: DocSection = {
  id: 'user-management',
  title: 'User Management',
  description: 'Managing users, roles, and permissions',
  icon: 'Users',
  order: 2,
  articles: [
    {
      id: 'user-roles',
      title: 'User Roles & Permissions',
      description: 'Understanding the different user types',
      tags: ['users', 'roles', 'permissions', 'security'],
      lastUpdated: '2024-12-23',
      content: `
# User Roles & Permissions

The platform has three distinct user roles with different capabilities.

## Role Hierarchy

\`\`\`
Administrator
    ↓
Coach (Group Leader)
    ↓
Participant
\`\`\`

## Participants

Standard users who enroll in challenges.

### Capabilities
- ✅ Enroll in projects (requires payment)
- ✅ Track daily habits
- ✅ Submit biometrics
- ✅ View course content
- ✅ See personal progress
- ✅ Submit bug reports

### Limitations
- ❌ Cannot access admin panel
- ❌ Cannot view other users' data
- ❌ Cannot manage content

### Identifying Fields
\`\`\`typescript
{
  isAdmin: false,
  isGroupLeader: false
}
\`\`\`

## Coaches (Group Leaders)

Team leaders who recruit participants.

### Capabilities
- ✅ All participant capabilities
- ✅ Free registration (no payment)
- ✅ Unique referral link
- ✅ View team roster
- ✅ Track leads and conversions
- ✅ See team leaderboard

### Limitations
- ❌ Cannot access admin panel
- ❌ Cannot view non-team members
- ❌ Cannot manage content

### Identifying Fields
\`\`\`typescript
{
  isAdmin: false,
  isGroupLeader: true,
  referralCode: "unique-code"
}
\`\`\`

## Administrators

Platform managers with full access.

### Capabilities
- ✅ All coach capabilities
- ✅ Access admin panel
- ✅ Manage all users
- ✅ Create/edit projects
- ✅ Manage content
- ✅ View all data
- ✅ Impersonate users
- ✅ Configure settings
- ✅ View audit logs

### Limitations
- ⚠️ Must follow audit procedures
- ⚠️ Actions are logged

### Identifying Fields
\`\`\`typescript
{
  isAdmin: true
}
\`\`\`

## Permission Matrix

| Action | Participant | Coach | Admin |
|--------|:-----------:|:-----:|:-----:|
| Enroll in project | ✅ | ✅ | ✅ |
| Track habits | ✅ | ✅ | ✅ |
| View own progress | ✅ | ✅ | ✅ |
| Get referral link | ❌ | ✅ | ✅ |
| View team roster | ❌ | ✅ | ✅ |
| Access admin panel | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |
| Impersonate users | ❌ | ❌ | ✅ |
| Manage content | ❌ | ❌ | ✅ |
      `.trim(),
      relatedArticles: ['managing-users', 'editing-users'],
    },
    {
      id: 'managing-users',
      title: 'Managing Users',
      description: 'How to view, search, and manage user accounts',
      tags: ['users', 'admin', 'management'],
      lastUpdated: '2024-12-23',
      content: `
# Managing Users

The Users tab in the Admin Panel provides comprehensive user management capabilities.

## User List View

The main view displays a paginated list of all users:

| Column | Description |
|--------|-------------|
| Avatar | User profile photo or initials |
| Name | Full name (clickable for details) |
| Contact | Email or phone number |
| Role | Participant, Coach, or Admin badge |
| Status | Active, Pending, or Inactive |
| Joined | Registration date |
| Last Active | Most recent login/activity |
| Actions | Quick action buttons |

## Searching Users

Use the search bar to find users by:
- Full name (partial matches work)
- Email address
- Phone number
- User ID

### Search Tips
- Searches are case-insensitive
- Use quotes for exact phrases
- Results update as you type

## Filtering Users

Filter the list by:
- **Role**: All, Participants, Coaches, Admins
- **Status**: All, Active, Pending, Inactive
- **Project**: Filter by enrolled project
- **Date Range**: Registration date range

## User Actions

Each user row has action buttons:

| Icon | Action |
|------|--------|
| 👁️ | Impersonate user |
| ✏️ | Edit user details |
| 📧 | Send notification |
| 🗑️ | Delete user |

## Viewing User Details

Click on a user's name to open the detail panel:

### Profile Tab
- Name, email, phone
- Registration date
- Last activity
- Role and status

### Progress Tab
- Habit completion rates
- Biometric history
- Points and streaks

### Enrollments Tab
- Project enrollments
- Payment history
- Completion status

### Activity Tab
- Login history
- Action timeline
- System events
      `.trim(),
      relatedArticles: ['user-roles', 'editing-users'],
    },
    {
      id: 'editing-users',
      title: 'Editing User Accounts',
      description: 'How to modify user information',
      tags: ['users', 'edit', 'admin'],
      lastUpdated: '2024-12-23',
      content: `
# Editing User Accounts

Administrators can modify user account details when needed.

## Accessing the Edit Panel

1. Navigate to **Admin Panel → Users**
2. Find the user to edit
3. Click the **✏️ (edit)** icon
4. The edit panel slides open

## Editable Fields

### Basic Information
- **Name**: First and last name
- **Email**: Email address (must be unique)
- **Phone**: Phone number (must be unique)

### Role Settings
- **Is Admin**: Toggle administrator access
- **Is Group Leader**: Toggle coach status
- **Referral Code**: Set/change referral code

### Status
- **Active**: Normal account access
- **Pending**: Awaiting verification
- **Inactive**: Suspended access

### Project Enrollments
- Add to project
- Remove from project
- Grant free access (bypass payment)

## Making Changes

1. Modify the desired fields
2. Click **Save Changes**
3. Confirmation toast appears
4. Changes take effect immediately

## Important Considerations

### Changing Emails/Phones
- System checks for uniqueness
- User will need to verify new contact
- Old contact info is logged

### Promoting to Admin
- Grant admin access carefully
- Actions are logged
- Consider principle of least privilege

### Demoting from Admin
- Remove admin access if no longer needed
- User loses access immediately
- Audit logs remain intact

### Deleting vs. Deactivating
- **Deactivate**: Preserves data, blocks access
- **Delete**: Soft-delete, can be restored
- Prefer deactivation for compliance

## Audit Trail

All user edits are logged:
- Who made the change
- What was changed
- Old value → New value
- Timestamp

Access logs in **Admin → Settings → Audit Logs**
      `.trim(),
      relatedArticles: ['user-roles', 'managing-users'],
    },
  ],
};
