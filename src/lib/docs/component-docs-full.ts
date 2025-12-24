/**
 * Complete Component Documentation
 *
 * This file contains comprehensive documentation for ALL 34 components
 * in the Metabolic Reset Platform, optimized for both human developers
 * and AI agents analyzing bugs.
 *
 * @generated 2025-12-23
 * @coverage 34/34 components (100%)
 */

import type { ComponentDoc } from './ai-types';

// ============================================================================
// APPLICATION LAYOUT COMPONENTS
// ============================================================================

export const APP_LAYOUT_COMPONENTS: ComponentDoc[] = [
  {
    name: 'AppLayout',
    filePath: 'src/components/layout/AppLayout.tsx',
    description: 'Main authenticated application layout wrapper. Provides sidebar, header with user info, day counter, notification bell, theme toggle, and onboarding gatekeeper logic. Handles impersonation session expiry and redirects unauthenticated users.',
    props: [
      { name: 'children', type: 'React.ReactNode', required: true, description: 'Page content to render in main area' },
      { name: 'container', type: 'boolean', required: false, defaultValue: 'false', description: 'Wrap content in max-width container' },
      { name: 'className', type: 'string', required: false, description: 'Additional classes for SidebarInset' },
      { name: 'contentClassName', type: 'string', required: false, description: 'Additional classes for content container' },
    ],
    hooks: ['useAuthStore', 'useEffect', 'useMyActiveEnrollment'],
    usedBy: ['Dashboard', 'BiometricsPage', 'ProfilePage', 'AdminPage', 'CoursePage', 'ProjectsPage'],
    uses: ['SidebarProvider', 'AppSidebar', 'ImpersonationBanner', 'NotificationBell', 'ThemeToggle', 'FloatingBugCapture', 'BugReportDialog', 'CohortIndicator'],
    stateManagement: 'Zustand (useAuthStore)',
  },
  {
    name: 'MarketingLayout',
    filePath: 'src/components/layout/MarketingLayout.tsx',
    description: 'Public marketing page layout with navigation header and footer. Used for landing page, registration, and public quiz pages.',
    props: [
      { name: 'children', type: 'React.ReactNode', required: true, description: 'Page content to render' },
    ],
    hooks: ['useNavigate', 'useState'],
    usedBy: ['LandingPage', 'RegistrationPage', 'QuizPage', 'TermsPage', 'PrivacyPage'],
    uses: ['Button', 'Link'],
    stateManagement: 'Local state for mobile menu',
  },
  {
    name: 'AppSidebar',
    filePath: 'src/components/app-sidebar.tsx',
    description: 'Main navigation sidebar for authenticated app. Shows Dashboard, Weekly Study, My Projects, Course links plus role-based links (Team Roster, Resources for coaches; Admin for admins).',
    props: [],
    hooks: ['useLocation', 'useAuthStore', 'useSidebar'],
    usedBy: ['AppLayout'],
    uses: ['Sidebar', 'SidebarHeader', 'SidebarContent', 'SidebarFooter', 'SidebarMenu', 'SidebarMenuItem', 'SidebarMenuButton', 'Avatar', 'Button'],
    stateManagement: 'Zustand (useAuthStore)',
  },
];

// ============================================================================
// ADMIN COMPONENTS
// ============================================================================

export const ADMIN_COMPONENTS: ComponentDoc[] = [
  {
    name: 'BugAIAnalysisPanel',
    filePath: 'src/components/admin/BugAIAnalysisPanel.tsx',
    description: 'AI-powered bug analysis panel shown in admin bug detail view. Triggers Gemini 3 Flash analysis of bug reports with optional screenshot/video analysis. Displays AI-generated summary, root cause, solutions with confidence levels, and related documentation links.',
    props: [
      { name: 'bugId', type: 'string', required: true, description: 'ID of the bug to analyze' },
      { name: 'hasScreenshot', type: 'boolean', required: true, description: 'Whether bug has screenshot attached' },
      { name: 'hasVideo', type: 'boolean', required: true, description: 'Whether bug has video recording attached' },
    ],
    hooks: ['useState', 'useBugAIAnalysis', 'useAnalyzeBug'],
    usedBy: ['BugDetailDialog (AdminPage)'],
    uses: ['Card', 'CardHeader', 'CardContent', 'Button', 'Badge', 'Collapsible', 'SolutionCard'],
    stateManagement: 'TanStack Query (useBugAIAnalysis)',
  },
  {
    name: 'ContentManager',
    filePath: 'src/components/admin/ContentManager.tsx',
    description: 'Admin interface for managing course content (videos, quizzes, resources) for each project. Supports CRUD operations, file uploads to R2/Cloudflare Stream, quiz question builder, and content analytics.',
    props: [],
    hooks: ['useProjects', 'useAuthStore', 'useState', 'useAdminProjectContent', 'useAdminContentAnalytics', 'useAdminCreateContent', 'useAdminUpdateContent', 'useAdminDeleteContent', 'useAdminCopyContent'],
    usedBy: ['AdminPage'],
    uses: ['Card', 'CardHeader', 'CardContent', 'Button', 'Input', 'Textarea', 'Select', 'Dialog', 'AlertDialog', 'Tabs', 'TabsContent', 'Accordion', 'Label', 'Switch', 'Badge'],
    stateManagement: 'Local state + TanStack Query mutations',
  },
  {
    name: 'PaymentsTab',
    filePath: 'src/components/admin/PaymentsTab.tsx',
    description: 'Admin payments management tab. Shows list of payments, allows filtering by user, creating manual payments, processing refunds via Stripe.',
    props: [
      { name: 'userId', type: 'string', required: false, description: 'Filter payments by user ID' },
      { name: 'users', type: 'User[]', required: false, description: 'Users list for user selector' },
    ],
    hooks: ['useQueryClient', 'useState', 'useQuery', 'useMutation'],
    usedBy: ['AdminPage'],
    uses: ['Card', 'CardHeader', 'CardContent', 'Button', 'Input', 'Select', 'Table', 'Badge', 'Dialog'],
    stateManagement: 'TanStack Query',
  },
  {
    name: 'DocsTab',
    filePath: 'src/components/admin/docs/DocsTab.tsx',
    description: 'Admin documentation browser tab. Three-column layout with sidebar navigation, article content, and search. Supports deep linking via URL params.',
    props: [
      { name: 'targetSection', type: 'string', required: false, description: 'Initial section to navigate to' },
      { name: 'targetArticle', type: 'string', required: false, description: 'Initial article to navigate to' },
      { name: 'onClearTarget', type: '() => void', required: false, description: 'Callback when target is cleared' },
    ],
    hooks: ['useState', 'useEffect'],
    usedBy: ['AdminPage'],
    uses: ['DocsSidebar', 'DocsArticle', 'DocsSearch'],
    stateManagement: 'Local state for navigation',
  },
  {
    name: 'DocsSidebar',
    filePath: 'src/components/admin/docs/DocsSidebar.tsx',
    description: 'Documentation sidebar with expandable sections and article links. Highlights active article.',
    props: [
      { name: 'sections', type: 'DocSection[]', required: true, description: 'All documentation sections' },
      { name: 'activeSection', type: 'string', required: false, description: 'Currently active section ID' },
      { name: 'activeArticle', type: 'string', required: false, description: 'Currently active article ID' },
      { name: 'expandedSections', type: 'string[]', required: true, description: 'IDs of expanded sections' },
      { name: 'onToggleSection', type: '(sectionId: string) => void', required: true, description: 'Toggle section expansion' },
      { name: 'onSelectArticle', type: '(sectionId: string, articleId: string) => void', required: true, description: 'Select an article' },
    ],
    hooks: [],
    usedBy: ['DocsTab'],
    uses: ['ScrollArea', 'Button', 'Collapsible'],
    stateManagement: 'Props from parent',
  },
  {
    name: 'DocsArticle',
    filePath: 'src/components/admin/docs/DocsArticle.tsx',
    description: 'Renders a documentation article with markdown-like formatting, code references, related links.',
    props: [
      { name: 'article', type: 'DocArticle', required: true, description: 'Article content to render' },
      { name: 'section', type: 'DocSection', required: true, description: 'Parent section' },
      { name: 'allSections', type: 'DocSection[]', required: true, description: 'All sections for related links' },
      { name: 'onNavigate', type: '(sectionId: string, articleId: string) => void', required: true, description: 'Navigate to related article' },
    ],
    hooks: [],
    usedBy: ['DocsTab'],
    uses: ['Card', 'CardContent', 'Badge', 'Button'],
    stateManagement: 'Stateless',
  },
  {
    name: 'DocsSearch',
    filePath: 'src/components/admin/docs/DocsSearch.tsx',
    description: 'Documentation search component with fuzzy matching across all sections and articles.',
    props: [
      { name: 'sections', type: 'DocSection[]', required: true, description: 'All sections to search' },
      { name: 'onSelectResult', type: '(sectionId: string, articleId: string) => void', required: true, description: 'Handle search result selection' },
    ],
    hooks: ['useState', 'useEffect'],
    usedBy: ['DocsTab'],
    uses: ['Input', 'Command', 'CommandInput', 'CommandList', 'CommandItem'],
    stateManagement: 'Local state for search query',
  },
];

// ============================================================================
// BUG REPORTING COMPONENTS
// ============================================================================

export const BUG_REPORTING_COMPONENTS: ComponentDoc[] = [
  {
    name: 'BugReportDialog',
    filePath: 'src/components/BugReportDialog.tsx',
    description: 'User-facing bug report dialog. Allows users to report bugs with title, description, severity, category, optional screenshot and video recording. Integrates with FloatingBugCapture for media capture.',
    props: [
      { name: 'trigger', type: 'React.ReactNode', required: false, description: 'Custom trigger element (defaults to floating bug icon)' },
    ],
    hooks: ['useAuthStore', 'useBugReportStore', 'useSubmitBugReport'],
    usedBy: ['AppLayout'],
    uses: ['Dialog', 'DialogContent', 'DialogHeader', 'DialogTitle', 'DialogDescription', 'DialogFooter', 'Button', 'Input', 'Textarea', 'Label', 'Select'],
    stateManagement: 'Zustand (useBugReportStore) + TanStack Query mutation',
  },
  {
    name: 'FloatingBugCapture',
    filePath: 'src/components/FloatingBugCapture.tsx',
    description: 'Global floating widget for screen recording and screenshot capture. Shows recording indicator and stop button during active recording. Exposes capture functions globally via window.__bugCapture.',
    props: [],
    hooks: ['useBugReportStore', 'useEffect', 'useCallback'],
    usedBy: ['AppLayout'],
    uses: ['Button'],
    stateManagement: 'Zustand (useBugReportStore)',
    examples: [
      'Automatically appears during screen capture',
      'Access via window.__bugCapture.captureScreenshot()',
      'Access via window.__bugCapture.startRecording()',
    ],
  },
];

// ============================================================================
// ERROR HANDLING COMPONENTS
// ============================================================================

export const ERROR_COMPONENTS: ComponentDoc[] = [
  {
    name: 'ErrorFallback',
    filePath: 'src/components/ErrorFallback.tsx',
    description: 'Generic error fallback component with retry and go home buttons. Shows error details in development mode.',
    props: [
      { name: 'title', type: 'string', required: false, defaultValue: '"Oops! Something went wrong"', description: 'Error title' },
      { name: 'message', type: 'string', required: false, description: 'User-friendly error message' },
      { name: 'error', type: 'Error | any', required: false, description: 'The actual error object' },
      { name: 'onRetry', type: '() => void', required: false, description: 'Custom retry handler (defaults to page reload)' },
      { name: 'onGoHome', type: '() => void', required: false, description: 'Custom go home handler (defaults to /)' },
      { name: 'showErrorDetails', type: 'boolean', required: false, defaultValue: 'true', description: 'Show error stack in dev mode' },
      { name: 'statusMessage', type: 'string', required: false, defaultValue: '"Our team has been notified"', description: 'Status indicator text' },
    ],
    hooks: [],
    usedBy: ['ErrorBoundary', 'RouteErrorBoundary'],
    uses: ['Card', 'CardContent', 'Button'],
    stateManagement: 'Stateless',
  },
  {
    name: 'RouteErrorBoundary',
    filePath: 'src/components/RouteErrorBoundary.tsx',
    description: 'React Router error boundary wrapper. Catches route-level errors and displays ErrorFallback.',
    props: [],
    hooks: ['useRouteError', 'useEffect'],
    usedBy: ['Router configuration'],
    uses: ['ErrorFallback'],
    stateManagement: 'Stateless',
  },
];

// ============================================================================
// PWA COMPONENTS
// ============================================================================

export const PWA_COMPONENTS: ComponentDoc[] = [
  {
    name: 'AddToHomeScreenModal',
    filePath: 'src/components/AddToHomeScreenModal.tsx',
    description: 'Progressive Web App install prompt modal. Shows after 35s engagement delay (Chrome requirement). Provides native install or manual instructions for iOS/Android/Desktop. Tracks install status.',
    props: [
      { name: 'onPromptShown', type: '() => void', required: false, description: 'Callback when prompt first appears' },
      { name: 'onDismissed', type: '() => void', required: false, description: 'Callback when user dismisses' },
      { name: 'onInstalled', type: '(source: InstallSource) => void', required: false, description: 'Callback when install completes' },
    ],
    hooks: ['useState', 'useUser', 'usePWAInstall', 'useEffect', 'useCallback'],
    usedBy: ['AppLayout (conditionally)'],
    uses: ['Dialog', 'DialogContent', 'DialogHeader', 'DialogTitle', 'DialogDescription', 'DialogFooter', 'Button'],
    stateManagement: 'Local state + TanStack Query (useUser)',
  },
];

// ============================================================================
// NOTIFICATION COMPONENTS
// ============================================================================

export const NOTIFICATION_COMPONENTS: ComponentDoc[] = [
  {
    name: 'NotificationBell',
    filePath: 'src/components/notification-bell.tsx',
    description: 'Header notification bell icon with unread count badge and dropdown popover. Shows recent notifications, mark as read functionality.',
    props: [],
    hooks: ['useState', 'useNotifications', 'useUnreadNotificationCount', 'useMarkNotificationRead', 'useMarkAllNotificationsRead'],
    usedBy: ['AppLayout'],
    uses: ['Button', 'Popover', 'PopoverTrigger', 'PopoverContent', 'ScrollArea'],
    stateManagement: 'TanStack Query for data, local state for popover open',
  },
];

// ============================================================================
// IMPERSONATION COMPONENTS
// ============================================================================

export const IMPERSONATION_COMPONENTS: ComponentDoc[] = [
  {
    name: 'ImpersonationBanner',
    filePath: 'src/components/impersonation-banner.tsx',
    description: 'Fixed top banner shown when admin is impersonating a user. Displays impersonated user name, countdown timer (60 min max), warning state at 5 min, and exit button.',
    props: [],
    hooks: ['useAuthStore', 'useState', 'useEffect'],
    usedBy: ['AppLayout'],
    uses: ['Button'],
    stateManagement: 'Zustand (useAuthStore) + local state for timer',
  },
];

// ============================================================================
// COHORT/BADGE COMPONENTS
// ============================================================================

export const COHORT_COMPONENTS: ComponentDoc[] = [
  {
    name: 'CohortBadge',
    filePath: 'src/components/cohort-badge.tsx',
    description: 'Visual badge indicating user cohort (GROUP_A = Protocol with Dna icon, GROUP_B = DIY with Wrench icon). Supports different sizes and optional label.',
    props: [
      { name: 'cohortId', type: 'CohortType | null | undefined', required: true, description: 'Cohort identifier' },
      { name: 'size', type: '"sm" | "md" | "lg"', required: false, defaultValue: '"md"', description: 'Badge size' },
      { name: 'showLabel', type: 'boolean', required: false, defaultValue: 'false', description: 'Show Protocol/DIY text label' },
      { name: 'className', type: 'string', required: false, description: 'Additional CSS classes' },
    ],
    hooks: [],
    usedBy: ['UserCard', 'TeamRoster', 'ProfilePage'],
    uses: [],
    stateManagement: 'Stateless',
  },
];

// ============================================================================
// REMINDER BANNER COMPONENTS
// ============================================================================

export const REMINDER_COMPONENTS: ComponentDoc[] = [
  {
    name: 'KitReminderBanner',
    filePath: 'src/components/kit-reminder-banner.tsx',
    description: 'Reminder banner for Group A users who have not received their nutrition kit. Shows order link via coach cart link or fallback phone number.',
    props: [],
    hooks: ['useMyActiveEnrollment', 'useSystemSettings', 'useUpdateOnboarding', 'useCoachInfo'],
    usedBy: ['Dashboard', 'ProfilePage'],
    uses: ['Button'],
    stateManagement: 'TanStack Query',
  },
  {
    name: 'ScaleReminderBanner',
    filePath: 'src/components/scale-reminder-banner.tsx',
    description: 'Reminder banner for users without a smart scale. Links to purchase page from system settings.',
    props: [],
    hooks: ['useAuthStore', 'useSystemSettings', 'useUpdateProfile'],
    usedBy: ['BiometricsPage'],
    uses: ['Button'],
    stateManagement: 'Zustand + TanStack Query',
  },
];

// ============================================================================
// LEAD GENERATION COMPONENTS
// ============================================================================

export const LEAD_GEN_COMPONENTS: ComponentDoc[] = [
  {
    name: 'LeadGenModal',
    filePath: 'src/components/lead-gen-modal.tsx',
    description: 'Email capture modal for marketing pages. Collects name and email, sends guide download. Uses react-hook-form with zod validation.',
    props: [
      { name: 'open', type: 'boolean', required: true, description: 'Control modal open state' },
      { name: 'onOpenChange', type: '(open: boolean) => void', required: true, description: 'Handle open state changes' },
    ],
    hooks: ['useState'],
    usedBy: ['LandingPage', 'MarketingLayout'],
    uses: ['Dialog', 'DialogContent', 'DialogHeader', 'DialogTitle', 'DialogDescription', 'Button', 'Input', 'Label'],
    stateManagement: 'Local state + react-hook-form',
  },
];

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

export const UTILITY_COMPONENTS: ComponentDoc[] = [
  {
    name: 'ScrollToTop',
    filePath: 'src/components/ScrollToTop.tsx',
    description: 'Utility component that scrolls to top on route changes. Uses custom useScrollToTop hook.',
    props: [],
    hooks: ['useLocation', 'useEffect', 'useScrollToTop'],
    usedBy: ['App router wrapper'],
    uses: [],
    stateManagement: 'Stateless',
  },
  {
    name: 'ThemeToggle',
    filePath: 'src/components/ThemeToggle.tsx',
    description: 'Light/dark theme toggle button using next-themes.',
    props: [
      { name: 'className', type: 'string', required: false, description: 'Additional CSS classes' },
    ],
    hooks: ['useTheme'],
    usedBy: ['AppLayout'],
    uses: ['Button'],
    stateManagement: 'next-themes',
  },
];

// ============================================================================
// UI PRIMITIVE COMPONENTS
// ============================================================================

export const UI_PRIMITIVE_COMPONENTS: ComponentDoc[] = [
  {
    name: 'AnimatedOrbs',
    filePath: 'src/components/ui/animated-orbs.tsx',
    description: 'Decorative animated floating orbs for background visual effects. Used on marketing pages.',
    props: [
      { name: 'className', type: 'string', required: false, description: 'Additional CSS classes' },
      { name: 'variant', type: '"default" | "subtle"', required: false, defaultValue: '"default"', description: 'Animation intensity' },
    ],
    hooks: [],
    usedBy: ['LandingPage', 'RegistrationPage'],
    uses: [],
    stateManagement: 'Stateless',
  },
  {
    name: 'AnimatedSteps',
    filePath: 'src/components/ui/animated-steps.tsx',
    description: 'Animated step-by-step progress indicator with intersection observer animations.',
    props: [
      { name: 'steps', type: 'Step[]', required: true, description: 'Array of step objects with title, description' },
      { name: 'className', type: 'string', required: false, description: 'Additional CSS classes' },
    ],
    hooks: ['useInView'],
    usedBy: ['LandingPage', 'OnboardingFlow'],
    uses: [],
    stateManagement: 'Stateless with animation state',
  },
  {
    name: 'BeamsBackground',
    filePath: 'src/components/ui/beams-background.tsx',
    description: 'Animated background with sweeping light beam effects. Uses CSS animations.',
    props: [
      { name: 'className', type: 'string', required: false, description: 'Container classes' },
      { name: 'children', type: 'React.ReactNode', required: false, description: 'Content to overlay' },
      { name: 'intensity', type: '"low" | "medium" | "high"', required: false, defaultValue: '"medium"', description: 'Beam intensity' },
    ],
    hooks: ['useEffect'],
    usedBy: ['LandingPage', 'RegistrationPage'],
    uses: [],
    stateManagement: 'Stateless',
  },
  {
    name: 'BorderBeam',
    filePath: 'src/components/ui/border-beam.tsx',
    description: 'Animated gradient border effect that travels around an element.',
    props: [
      { name: 'className', type: 'string', required: false, description: 'Additional classes' },
      { name: 'size', type: 'number', required: false, defaultValue: '200', description: 'Beam size in pixels' },
      { name: 'duration', type: 'number', required: false, defaultValue: '15', description: 'Animation duration in seconds' },
      { name: 'delay', type: 'number', required: false, defaultValue: '0', description: 'Animation delay' },
      { name: 'colorFrom', type: 'string', required: false, defaultValue: '"#ffaa40"', description: 'Gradient start color' },
      { name: 'colorTo', type: 'string', required: false, defaultValue: '"#9c40ff"', description: 'Gradient end color' },
      { name: 'borderWidth', type: 'number', required: false, defaultValue: '1.5', description: 'Border thickness' },
    ],
    hooks: ['useState', 'useId', 'useEffect'],
    usedBy: ['PricingCard', 'FeatureCard'],
    uses: [],
    stateManagement: 'Local state for animation',
  },
  {
    name: 'CircularProgress',
    filePath: 'src/components/ui/circular-progress.tsx',
    description: 'SVG-based circular progress indicator. Shows percentage completion with optional center content.',
    props: [
      { name: 'value', type: 'number', required: true, description: 'Progress value 0-100' },
      { name: 'size', type: 'number', required: false, defaultValue: '120', description: 'Circle diameter in pixels' },
      { name: 'strokeWidth', type: 'number', required: false, defaultValue: '10', description: 'Progress ring thickness' },
      { name: 'className', type: 'string', required: false, description: 'Additional classes' },
      { name: 'children', type: 'React.ReactNode', required: false, description: 'Center content (e.g., percentage text)' },
    ],
    hooks: [],
    usedBy: ['Dashboard', 'DailyScoreCard', 'ProgressWidget'],
    uses: [],
    stateManagement: 'Stateless',
  },
  {
    name: 'DotPattern',
    filePath: 'src/components/ui/dot-pattern.tsx',
    description: 'Decorative dot pattern background with optional fade effect.',
    props: [
      { name: 'className', type: 'string', required: false, description: 'Additional classes' },
      { name: 'dotColor', type: 'string', required: false, description: 'Dot color' },
      { name: 'dotSize', type: 'number', required: false, description: 'Dot size in pixels' },
      { name: 'gap', type: 'number', required: false, description: 'Gap between dots' },
      { name: 'fade', type: 'boolean', required: false, description: 'Enable fade effect' },
      { name: 'fadeDirection', type: '"top" | "bottom" | "left" | "right"', required: false, description: 'Fade direction' },
    ],
    hooks: [],
    usedBy: ['LandingPage sections'],
    uses: [],
    stateManagement: 'Stateless',
  },
  {
    name: 'FeatureCard',
    filePath: 'src/components/ui/feature-card.tsx',
    description: 'Interactive feature showcase card with icon, title, description, and optional stat.',
    props: [
      { name: 'icon', type: 'React.ReactNode', required: true, description: 'Feature icon' },
      { name: 'title', type: 'string', required: true, description: 'Feature title' },
      { name: 'description', type: 'string', required: true, description: 'Feature description' },
      { name: 'stat', type: 'object', required: false, description: 'Optional stat with value and label' },
    ],
    hooks: ['useState'],
    usedBy: ['LandingPage', 'FeaturesSection'],
    uses: ['Card', 'CardContent'],
    stateManagement: 'Local state for hover',
  },
  {
    name: 'FloatingParticles',
    filePath: 'src/components/ui/floating-particles.tsx',
    description: 'Animated floating particles background effect using canvas.',
    props: [
      { name: 'count', type: 'number', required: false, defaultValue: '50', description: 'Number of particles' },
      { name: 'colors', type: 'string[]', required: false, description: 'Particle colors array' },
      { name: 'className', type: 'string', required: false, description: 'Container classes' },
      { name: 'speed', type: 'number', required: false, description: 'Animation speed multiplier' },
      { name: 'minSize', type: 'number', required: false, description: 'Minimum particle size' },
      { name: 'maxSize', type: 'number', required: false, description: 'Maximum particle size' },
    ],
    hooks: ['useEffect'],
    usedBy: ['LandingPage hero'],
    uses: [],
    stateManagement: 'Stateless with canvas animation',
  },
  {
    name: 'GenealogyTree',
    filePath: 'src/components/ui/genealogy-tree.tsx',
    description: 'Interactive referral tree visualization. Shows hierarchical team structure with expandable nodes and stats.',
    props: [
      { name: 'data', type: 'GenealogyNode', required: true, description: 'Root node of the tree data' },
      { name: 'className', type: 'string', required: false, description: 'Container classes' },
      { name: 'onNodeClick', type: '(node: GenealogyNode) => void', required: false, description: 'Node click handler' },
      { name: 'showStats', type: 'boolean', required: false, defaultValue: 'true', description: 'Show node statistics' },
    ],
    hooks: ['useState', 'useMemo', 'useCallback'],
    usedBy: ['ReferralsPage', 'AdminUsersTab'],
    uses: ['Card', 'Avatar', 'Badge'],
    stateManagement: 'Local state for expansion',
  },
  {
    name: 'GlowWrapper',
    filePath: 'src/components/ui/glow-button.tsx',
    description: 'Wrapper component that adds a glowing effect around its children on hover.',
    props: [
      { name: 'children', type: 'React.ReactNode', required: true, description: 'Content to wrap' },
      { name: 'glowColor', type: 'string', required: false, description: 'Glow color' },
      { name: 'className', type: 'string', required: false, description: 'Additional classes' },
    ],
    hooks: [],
    usedBy: ['CTAButton', 'PricingCard'],
    uses: [],
    stateManagement: 'Stateless',
  },
  {
    name: 'NeuralNetworkBackground',
    filePath: 'src/components/ui/neural-network-background.tsx',
    description: 'Three.js based animated neural network visualization for backgrounds.',
    props: [],
    hooks: ['useFrame', 'useMemo'],
    usedBy: ['LandingPage hero (optional)'],
    uses: ['Three.js primitives'],
    stateManagement: 'React Three Fiber frame loop',
  },
];

// ============================================================================
// COMBINED EXPORT
// ============================================================================

export const ALL_COMPONENTS: ComponentDoc[] = [
  ...APP_LAYOUT_COMPONENTS,
  ...ADMIN_COMPONENTS,
  ...BUG_REPORTING_COMPONENTS,
  ...ERROR_COMPONENTS,
  ...PWA_COMPONENTS,
  ...NOTIFICATION_COMPONENTS,
  ...IMPERSONATION_COMPONENTS,
  ...COHORT_COMPONENTS,
  ...REMINDER_COMPONENTS,
  ...LEAD_GEN_COMPONENTS,
  ...UTILITY_COMPONENTS,
  ...UI_PRIMITIVE_COMPONENTS,
];

// ============================================================================
// COMPONENT LOOKUP HELPERS
// ============================================================================

/**
 * Find component by name
 */
export function findComponent(name: string): ComponentDoc | undefined {
  return ALL_COMPONENTS.find(c => c.name.toLowerCase() === name.toLowerCase());
}

/**
 * Find components by hook usage
 */
export function findComponentsByHook(hookName: string): ComponentDoc[] {
  return ALL_COMPONENTS.filter(c => c.hooks.some(h => h.toLowerCase().includes(hookName.toLowerCase())));
}

/**
 * Find components used by a specific parent
 */
export function findComponentsUsedBy(parentName: string): ComponentDoc[] {
  return ALL_COMPONENTS.filter(c => c.usedBy.some(u => u.toLowerCase().includes(parentName.toLowerCase())));
}

/**
 * Get component by file path
 */
export function findComponentByPath(filePath: string): ComponentDoc | undefined {
  const normalizedPath = filePath.replace(/\\/g, '/');
  return ALL_COMPONENTS.find(c => normalizedPath.includes(c.filePath.replace(/\\/g, '/')));
}

/**
 * Get all component names for quick reference
 */
export function getAllComponentNames(): string[] {
  return ALL_COMPONENTS.map(c => c.name);
}
