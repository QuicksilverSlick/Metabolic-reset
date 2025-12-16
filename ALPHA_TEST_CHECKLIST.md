# Alpha User Test Checklist
## The Metabolic Reset Challenge Platform

This checklist is designed for alpha testers to systematically test all features of the platform. Please go through each section and mark items as you test them. Report any bugs using the bug icon in the dashboard.

---

## 1. Registration & Onboarding

### 1.1 Quiz Funnel
- [ ] Access the quiz at the homepage
- [ ] Complete all quiz questions
- [ ] Verify metabolic age calculation displays correctly
- [ ] Verify quiz results page shows appropriate content
- [ ] Test "Start Challenge" button navigation

### 1.2 User Registration (Challenger)
- [ ] Navigate to registration page
- [ ] Fill out registration form with valid data
  - [ ] Name field accepts input
  - [ ] Email field validates email format
  - [ ] Phone field accepts phone numbers
- [ ] Test with referral code (if applicable)
- [ ] Test without referral code
- [ ] Verify timezone detection works correctly
- [ ] Complete Stripe payment flow (test mode)
- [ ] Verify successful registration redirects to dashboard

### 1.3 User Registration (Coach/Group Leader)
- [ ] Select "Coach" role during registration
- [ ] Verify coach registration does NOT require payment
- [ ] Verify referral code is generated after registration
- [ ] Verify referral link is visible in dashboard

### 1.4 Returning User Login
- [ ] Navigate to login page
- [ ] Enter existing email and phone
- [ ] Verify successful login
- [ ] Verify user data is restored correctly
- [ ] Test with incorrect credentials (should show error)

---

## 2. Dashboard Features

### 2.1 Main Dashboard View
- [ ] Dashboard loads without errors
- [ ] User name displays correctly in greeting
- [ ] Current project badge displays (if enrolled)
- [ ] Day/Week progress shows correctly
- [ ] Points total is visible and accurate

### 2.2 Daily Habits
- [ ] Water habit toggles on/off
- [ ] Steps habit toggles on/off
- [ ] Sleep habit toggles on/off
- [ ] Daily Lesson habit toggles on/off
- [ ] Points increment (+1) when completing habit
- [ ] Confetti animation fires on habit completion
- [ ] All-complete celebration fires when all 4 habits done
- [ ] Habits reset at midnight in user's timezone

### 2.3 Share & Earn Widget
- [ ] Referral code displays correctly
- [ ] "Copy Invite Link" button copies link to clipboard
- [ ] Toast notification confirms copy action
- [ ] Referral link includes project ID (if enrolled)

### 2.4 Weekly Biometrics Widget
- [ ] "Log Data" button navigates to biometrics page
- [ ] Widget displays correctly with styling

---

## 3. Biometrics Submission

### 3.1 Biometrics Form
- [ ] Week selector shows correct current week
- [ ] Weight field accepts numeric input
- [ ] Body fat percentage field accepts input
- [ ] Visceral fat field accepts input
- [ ] Lean mass field accepts input
- [ ] Metabolic age field accepts input
- [ ] Screenshot upload field works
- [ ] Form validates required fields

### 3.2 Biometrics Submission
- [ ] Submit biometrics for Week 0 (Initial)
- [ ] Submit biometrics for subsequent weeks (1-4)
- [ ] Verify +25 points awarded on submission
- [ ] Verify toast notification appears on success
- [ ] Verify previously submitted data shows in form

---

## 4. Coach/Group Leader Features

### 4.1 Team Roster
- [ ] Navigate to roster page
- [ ] Roster displays all recruited users
- [ ] User names and emails are visible
- [ ] User points are displayed
- [ ] "View Biometrics" button works for each recruit
- [ ] Recruit count matches actual recruits

### 4.2 Recruit Biometrics View
- [ ] Click on recruit to view their data
- [ ] All submitted biometric weeks are visible
- [ ] Weight, body fat, etc. data displays correctly
- [ ] Screenshot links work (if provided)

### 4.3 Leads Management (Quiz Leads)
- [ ] Navigate to leads tab/section
- [ ] Quiz leads captured by referral code are visible
- [ ] Lead names, phones, and ages display
- [ ] Metabolic age calculation shows correctly

### 4.4 Team Qualification Status
- [ ] Team size count shows in dashboard
- [ ] "QUALIFIED" badge shows at 10+ recruits
- [ ] Team card links to roster page

---

## 5. Orphan User Flow

### 5.1 Orphan Alert
- [ ] Alert shows for users without a captain/group leader
- [ ] "Find a Team" button navigates to assignment page

### 5.2 Captain Assignment
- [ ] Assignment page lists available group leaders
- [ ] Search/filter functionality works
- [ ] Can select and assign to a captain
- [ ] Success notification appears
- [ ] Orphan alert disappears after assignment

---

## 6. Reset Project Features

### 6.1 Project Enrollment
- [ ] View available/open projects
- [ ] Enroll in a project
- [ ] Project badge appears in dashboard
- [ ] Week/Day countdown reflects project dates

### 6.2 Project-Specific Features
- [ ] Habits are tracked per-project
- [ ] Points are tracked per-project
- [ ] Biometrics are linked to project

---

## 7. Bug Reporting

### 7.1 Bug Report Dialog
- [ ] Bug icon is visible in dashboard (bottom-right)
- [ ] Clicking icon opens bug report dialog
- [ ] Title field accepts input
- [ ] Description field accepts multi-line text
- [ ] Severity selector works (Low/Medium/High/Critical)
- [ ] Category selector works (UI/Functionality/Performance/Data/Other)
- [ ] Screenshot URL field accepts URLs
- [ ] Video URL field accepts Loom/Zoom links
- [ ] Submit button submits the report
- [ ] Success toast notification appears
- [ ] Dialog closes after submission

### 7.2 Bug Report Data
- [ ] Page URL is automatically captured
- [ ] Browser info is automatically captured
- [ ] User info is linked to report

---

## 8. Admin Dashboard (Admin Users Only)

### 8.1 Admin Access
- [ ] Admin dashboard accessible at /app/admin
- [ ] Non-admins are redirected away

### 8.2 User Management
- [ ] All users list displays
- [ ] Search/filter works
- [ ] Can view user details
- [ ] Can edit user points
- [ ] Can toggle user role (Challenger/Coach)
- [ ] Can toggle user active status
- [ ] Can grant/revoke admin access

### 8.3 Project Management
- [ ] Projects tab displays all projects
- [ ] Can create new project
- [ ] Can edit existing project
- [ ] Can update project status
- [ ] Can toggle registration open/closed
- [ ] Can view project participants
- [ ] Can delete project

### 8.4 Bug Report Management
- [ ] Bugs tab shows bug report count
- [ ] Can filter by status (All/Open/In Progress/Resolved/Closed)
- [ ] Bug cards show title, severity, status
- [ ] Can view bug details
- [ ] Can update bug status
- [ ] Can add admin notes
- [ ] Can delete bug reports
- [ ] Screenshot/video links open in new tab

### 8.5 User Enrollment Management
- [ ] Can view user's project enrollments
- [ ] Can enroll user in a project
- [ ] Can remove user from a project

---

## 9. Navigation & UI

### 9.1 Main Navigation
- [ ] All nav links work correctly
- [ ] Active page is highlighted
- [ ] Mobile menu opens/closes properly
- [ ] Logo links to appropriate page

### 9.2 Responsive Design
- [ ] Test on mobile viewport (< 640px)
- [ ] Test on tablet viewport (640px - 1024px)
- [ ] Test on desktop viewport (> 1024px)
- [ ] All elements are usable at each size

### 9.3 Dark Mode (if applicable)
- [ ] Toggle dark/light mode
- [ ] All text is readable in both modes
- [ ] All UI elements have appropriate contrast

---

## 10. Performance & Edge Cases

### 10.1 Performance
- [ ] Pages load within 3 seconds
- [ ] No visible lag when toggling habits
- [ ] No delay when navigating between pages

### 10.2 Error Handling
- [ ] Test with network disconnection
- [ ] Test form submission with missing fields
- [ ] Verify error messages are user-friendly

### 10.3 Edge Cases
- [ ] Test at day 0 (before project starts)
- [ ] Test at day 29 (after project ends)
- [ ] Test with 0 points
- [ ] Test with very long names/text
- [ ] Test duplicate submissions

---

## Reporting Issues

When you find a bug or issue:

1. **Click the bug icon** in the bottom-right corner of your dashboard
2. **Provide a clear title** describing the issue
3. **Describe what happened** and what you expected
4. **Select the severity**:
   - Low: Minor visual issue
   - Medium: Feature doesn't work as expected
   - High: Major functionality broken
   - Critical: App is unusable
5. **Attach screenshot/video** if possible (use Imgur for images, Loom for videos)
6. **Submit the report**

Thank you for helping us improve The Metabolic Reset Challenge!

---

## Test Session Log

| Date | Tester Name | Sections Tested | Bugs Found | Notes |
|------|-------------|-----------------|------------|-------|
|      |             |                 |            |       |
|      |             |                 |            |       |
|      |             |                 |            |       |
