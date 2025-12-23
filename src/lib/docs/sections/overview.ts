import type { DocSection } from '../types';

export const overviewSection: DocSection = {
  id: 'overview',
  title: 'Getting Started',
  description: 'Platform overview and quick start guides',
  icon: 'BookOpen',
  order: 1,
  articles: [
    {
      id: 'introduction',
      title: 'Platform Introduction',
      description: 'Overview of the Metabolic Reset Challenge platform',
      tags: ['overview', 'introduction', 'getting-started'],
      lastUpdated: '2024-12-23',
      content: `
# Metabolic Reset Challenge Platform

Welcome to the admin documentation for the Metabolic Reset Challenge platform. This living documentation system provides comprehensive guides for managing all aspects of the platform.

## What is This Platform?

The Metabolic Reset Challenge is a 28-day health transformation program that combines:

- **Daily Habit Tracking**: Water intake, steps, sleep, and lesson completion
- **Weekly Biometrics**: Weight and measurement tracking with photo evidence
- **Educational Content**: Video courses and quizzes
- **Community Support**: Coach-led teams and accountability groups
- **Gamification**: Points, streaks, and leaderboards

## Platform Architecture

| Component | Technology |
|-----------|------------|
| Frontend | React + Vite + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Cloudflare Workers + Durable Objects |
| Database | Cloudflare D1 (SQLite) |
| Storage | Cloudflare R2 (images/videos) |
| Payments | Stripe (one-time $28 per project) |
| Auth | Phone-based OTP via Twilio |

## Key User Roles

### Participants
Regular users who enroll in challenges. They:
- Pay $28 per project enrollment
- Track daily habits
- Submit weekly biometrics
- Complete course content

### Coaches (Group Leaders)
Team leaders who recruit participants. They:
- Register for free (no payment required)
- Get unique referral links
- View their team roster
- Track team progress and leads

### Administrators
Platform managers with full access. They:
- Manage all users and projects
- View system-wide analytics
- Configure content and settings
- Access impersonation and debugging tools

## About This Documentation

This documentation is:

- **Living**: Updated alongside code changes
- **Code-Based**: Version controlled with the application
- **Searchable**: Full-text search across all articles
- **Admin-Only**: Only visible to administrators
      `.trim(),
      relatedArticles: ['navigation', 'admin-quick-start'],
    },
    {
      id: 'navigation',
      title: 'Admin Panel Navigation',
      description: 'Guide to navigating the admin interface',
      tags: ['navigation', 'admin', 'ui'],
      lastUpdated: '2024-12-23',
      content: `
# Admin Panel Navigation

The Admin Panel is your central hub for managing the Metabolic Reset platform.

## Accessing the Admin Panel

1. Log in with an admin account
2. Click **Admin Panel** in the sidebar menu
3. Only users with \`isAdmin: true\` will see this option

## Admin Tabs Overview

| Tab | Purpose |
|-----|---------|
| **Users** | Manage participant and coach accounts |
| **Projects** | Create and configure challenge cohorts |
| **Content** | Manage videos, lessons, and quizzes |
| **Bugs** | Review and triage user-submitted bug reports |
| **Genealogy** | View referral relationships and team structures |
| **Settings** | Configure system-wide settings |
| **Deleted** | View and restore soft-deleted items |
| **Duplicates** | Identify and merge duplicate accounts |
| **Docs** | Access this documentation system |

## Tab Details

### Users Tab
- View all registered users
- Search and filter by name, email, role
- Edit user details
- Impersonate users for debugging
- Soft-delete accounts

### Projects Tab
- Create new challenge projects
- Set start/end dates
- Configure enrollment settings
- View project statistics

### Content Tab
- Upload and organize video content
- Create quiz questions
- Manage lesson sequences
- Preview content as users see it

### Bugs Tab
- View submitted bug reports
- See screenshots and recordings
- Update status and add notes
- Prioritize issues

### Genealogy Tab
- Visualize referral trees
- Track coach recruitment success
- Identify top recruiters
- Analyze network growth

### Settings Tab
- System configuration options
- Feature flags
- Notification settings
- Integration configurations

### Docs Tab
- You are here!
- Searchable documentation
- Updated with each feature change
      `.trim(),
      relatedArticles: ['introduction', 'admin-quick-start'],
    },
    {
      id: 'admin-quick-start',
      title: 'Admin Quick Start',
      description: '5-minute guide to essential admin tasks',
      tags: ['quick-start', 'admin', 'tutorial'],
      lastUpdated: '2024-12-23',
      content: `
# Admin Quick Start Guide

Get up and running with essential admin tasks in 5 minutes.

## Task 1: Check Today's Activity

1. Go to **Admin Panel → Users**
2. Sort by "Last Active" to see recent logins
3. Check habit submission rates for today

## Task 2: Review New Signups

1. Go to **Admin Panel → Users**
2. Filter by "Created Date: Today"
3. Verify new users have completed onboarding
4. Check payment status (paid vs pending)

## Task 3: Manage Bug Reports

1. Go to **Admin Panel → Bugs**
2. Review new submissions (status: "Open")
3. Triage by severity:
   - **Critical**: App crash, data loss
   - **High**: Major feature broken
   - **Medium**: Feature partially working
   - **Low**: Minor UI/UX issues
4. Add admin notes and update status

## Task 4: Create a New Project

1. Go to **Admin Panel → Projects**
2. Click **Create Project**
3. Set project name and dates
4. Configure enrollment settings
5. Publish when ready

## Task 5: Support a User

1. Go to **Admin Panel → Users**
2. Search for the user
3. Click the **👁️** icon to impersonate
4. View the app as they see it
5. Identify their issue
6. Exit impersonation
7. Make changes or contact user

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| \`/\` | Focus search |
| \`Esc\` | Close modals/dialogs |
| \`↑/↓\` | Navigate lists |
| \`Enter\` | Select/confirm |

## Common Actions Quick Reference

| I want to... | Go to... |
|--------------|----------|
| See all users | Admin → Users |
| Check someone's progress | Admin → Users → [User] → View |
| See bug screenshots | Admin → Bugs → [Bug] → View |
| Debug as a user | Admin → Users → [User] → 👁️ Impersonate |
| Create new challenge | Admin → Projects → Create |
| Update lesson content | Admin → Content |
      `.trim(),
      relatedArticles: ['introduction', 'navigation'],
    },
  ],
};
