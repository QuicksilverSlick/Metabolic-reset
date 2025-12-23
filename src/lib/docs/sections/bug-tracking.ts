import type { DocSection } from '../types';

export const bugTrackingSection: DocSection = {
  id: 'bug-tracking',
  title: 'Bug Tracking',
  description: 'Managing bug reports and issue tracking',
  icon: 'Bug',
  order: 5,
  articles: [
    {
      id: 'bug-overview',
      title: 'Bug Tracking Overview',
      description: 'How the bug reporting system works',
      tags: ['bugs', 'overview', 'support'],
      lastUpdated: '2024-12-23',
      content: `
# Bug Tracking System

The platform includes a built-in bug reporting system that allows users to submit issues with screenshots and screen recordings.

## How It Works

### User Perspective
1. User encounters an issue
2. Clicks the **bug icon** floating button
3. Fills out bug report form
4. Optionally captures screenshot or recording
5. Submits the report

### Admin Perspective
1. Bug appears in Admin → Bugs tab
2. Admin reviews details and media
3. Triages and assigns priority
4. Investigates and resolves
5. Updates status

## Bug Report Contents

Each bug report contains:

| Field | Description |
|-------|-------------|
| Title | Brief summary of the issue |
| Description | Detailed explanation |
| Severity | Critical, High, Medium, Low |
| Category | UI, Performance, Data, Other |
| Screenshot | Visual capture of the issue |
| Video | Screen recording (if provided) |
| Page URL | Where the issue occurred |
| User Agent | Browser/device information |
| Submitted By | User who reported it |
| Created At | When report was submitted |

## Severity Levels

| Level | Definition | Response Time |
|-------|------------|---------------|
| **Critical** | App crash, data loss, security | Immediate |
| **High** | Major feature broken | Same day |
| **Medium** | Feature partially working | This week |
| **Low** | Minor UI/UX issue | Backlog |

## Bug Status Flow

\`\`\`
Open → In Progress → Resolved → Closed
         ↓
     Cannot Reproduce
         ↓
       Closed
\`\`\`
      `.trim(),
      relatedArticles: ['managing-bugs', 'bug-triage'],
    },
    {
      id: 'managing-bugs',
      title: 'Managing Bug Reports',
      description: 'How to review and process bug reports',
      tags: ['bugs', 'admin', 'management'],
      lastUpdated: '2024-12-23',
      content: `
# Managing Bug Reports

The Bugs tab in Admin Panel provides tools for reviewing and managing submitted bug reports.

## Bug List View

The main view shows all submitted bugs:

| Column | Description |
|--------|-------------|
| Status | Current status badge |
| Severity | Priority indicator |
| Title | Brief description |
| Reporter | Who submitted it |
| Page | Where it occurred |
| Media | Icons for screenshot/video |
| Date | Submission date |

## Filtering & Sorting

### Filter Options
- **Status**: Open, In Progress, Resolved, Closed
- **Severity**: Critical, High, Medium, Low
- **Category**: UI, Performance, Data, Other
- **Date Range**: Custom date filter

### Sort Options
- Newest first (default)
- Oldest first
- Severity (high to low)
- Status

## Viewing Bug Details

Click on a bug to open the detail panel:

### Information Panel
- Full description
- User and device info
- Timestamps

### Media Panel
- Screenshot viewer (zoomable)
- Video player (if recording attached)
- Download options

### Admin Notes Panel
- Add internal notes
- Track investigation progress
- Not visible to users

### History Panel
- Status change log
- Who made changes
- When changes occurred

## Bulk Actions

Select multiple bugs for:
- Bulk status update
- Bulk assignment
- Export to CSV
      `.trim(),
      relatedArticles: ['bug-overview', 'bug-triage'],
    },
    {
      id: 'bug-triage',
      title: 'Bug Triage Process',
      description: 'How to prioritize and categorize bugs',
      tags: ['bugs', 'triage', 'process'],
      lastUpdated: '2024-12-23',
      content: `
# Bug Triage Process

Effective bug triage ensures critical issues are addressed promptly while maintaining a manageable backlog.

## Daily Triage Routine

1. **Check new submissions** (Status: Open)
2. **Review severity** - Is it correctly categorized?
3. **Assess impact** - How many users affected?
4. **Verify reproduction** - Can you reproduce it?
5. **Set priority** - Update severity if needed
6. **Add notes** - Document findings

## Severity Assessment

### Critical
- Application crashes
- Data loss or corruption
- Security vulnerabilities
- Payment processing failures
- Users cannot log in

### High
- Major feature completely broken
- Significant data display errors
- Performance severely degraded
- Affects majority of users

### Medium
- Feature partially broken
- Minor data display issues
- Performance somewhat degraded
- Workaround exists

### Low
- Cosmetic/UI issues
- Minor UX improvements
- Edge case bugs
- Enhancement requests

## Reproduction Steps

When triaging, always try to reproduce:

1. Read the description carefully
2. Check the page URL where it occurred
3. Review screenshot/video for context
4. Try to recreate on same device/browser
5. Document reproduction steps or "Cannot Reproduce"

## Common Triage Outcomes

### Confirmed Bug
- Status: In Progress
- Add reproduction steps to notes
- Assign to fix in upcoming sprint

### Cannot Reproduce
- Status: Cannot Reproduce
- Request more info from reporter
- Keep in backlog for monitoring

### Duplicate
- Status: Closed
- Link to original bug in notes
- Merge any new info into original

### User Error
- Status: Closed
- Add clarifying documentation
- Consider UX improvement if common

### Feature Request
- Status: Closed
- Move to feature request system
- Thank user for feedback
      `.trim(),
      relatedArticles: ['bug-overview', 'managing-bugs'],
    },
  ],
};
