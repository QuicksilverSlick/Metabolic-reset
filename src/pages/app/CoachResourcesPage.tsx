import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Copy,
  Check,
  Link2,
  Mail,
  MessageSquare,
  Share2,
  Download,
  Play,
  Image as ImageIcon,
  ChevronDown,
  ChevronRight,
  Users,
  TrendingUp,
  Gift,
  Sparkles,
  FileText,
  ExternalLink,
  Facebook,
  Instagram,
  Video
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAuthStore } from '@/lib/auth-store';
import { useReferralStats, useMyActiveEnrollment } from '@/hooks/use-queries';
import { toast } from 'sonner';

// Helper to get first name
const getFirstName = (fullName: string): string => {
  return fullName?.split(' ')[0] || 'Coach';
};

// Helper to build quiz link with referral code and project ID
const getQuizLink = (referralCode: string, projectId?: string): string => {
  let link = `https://28dayreset.com/quiz?ref=${referralCode}`;
  if (projectId) {
    link += `&project=${projectId}`;
  }
  return link;
};

// Copy to clipboard with feedback
const useCopyToClipboard = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = useCallback(async (text: string, id: string, label?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success(label ? `${label} copied!` : 'Copied to clipboard!');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  }, []);

  return { copiedId, copyToClipboard };
};

// Copy button component with prominent mobile-friendly design
function CopyButton({
  text,
  id,
  label,
  variant = 'default',
  className = ''
}: {
  text: string;
  id: string;
  label?: string;
  variant?: 'default' | 'subject' | 'link';
  className?: string;
}) {
  const { copiedId, copyToClipboard } = useCopyToClipboard();
  const isCopied = copiedId === id;

  const baseClasses = "min-h-[48px] min-w-[48px] touch-manipulation transition-all duration-200";

  const variantClasses = {
    default: "bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold",
    subject: "bg-navy-700 hover:bg-navy-600 text-white",
    link: "bg-green-600 hover:bg-green-700 text-white"
  };

  return (
    <Button
      onClick={() => copyToClipboard(text, id, label)}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {isCopied ? (
        <>
          <Check className="h-5 w-5 mr-2" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="h-5 w-5 mr-2" />
          {label || 'Copy'}
        </>
      )}
    </Button>
  );
}

// Template card component
function TemplateCard({
  title,
  description,
  subjectLine,
  subjectLineAlt,
  bodyPlainText,
  bodyHtml,
  category
}: {
  title: string;
  description: string;
  subjectLine: string;
  subjectLineAlt?: string;
  bodyPlainText: string;
  bodyHtml: string;
  category: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { copiedId, copyToClipboard } = useCopyToClipboard();

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-navy-700 bg-navy-800/50 overflow-hidden">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-navy-800/80 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs border-gold-500/50 text-gold-400">
                    {category}
                  </Badge>
                </div>
                <CardTitle className="text-lg text-white">{title}</CardTitle>
                <CardDescription className="text-slate-400 mt-1">{description}</CardDescription>
              </div>
              <div className="ml-4 mt-1">
                {isOpen ? (
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* Subject Lines */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-slate-300">Subject Line</h4>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 p-3 bg-navy-900 rounded-lg text-sm text-slate-300 font-mono">
                  {subjectLine}
                </div>
                <CopyButton
                  text={subjectLine}
                  id={`${title}-subject`}
                  label="Copy Subject"
                  variant="subject"
                />
              </div>
              {subjectLineAlt && (
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 p-3 bg-navy-900 rounded-lg text-sm text-slate-300 font-mono">
                    {subjectLineAlt}
                  </div>
                  <CopyButton
                    text={subjectLineAlt}
                    id={`${title}-subject-alt`}
                    label="Copy Alt"
                    variant="subject"
                  />
                </div>
              )}
            </div>

            {/* Copy Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                onClick={() => copyToClipboard(bodyPlainText, `${title}-plain`, 'Plain text email')}
                className="flex-1 min-h-[56px] bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold text-base"
              >
                {copiedId === `${title}-plain` ? (
                  <><Check className="h-5 w-5 mr-2" /> Copied!</>
                ) : (
                  <><FileText className="h-5 w-5 mr-2" /> Copy Plain Text</>
                )}
              </Button>
              <Button
                onClick={() => copyToClipboard(bodyHtml, `${title}-html`, 'Rich HTML email')}
                className="flex-1 min-h-[56px] bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base"
              >
                {copiedId === `${title}-html` ? (
                  <><Check className="h-5 w-5 mr-2" /> Copied!</>
                ) : (
                  <><Mail className="h-5 w-5 mr-2" /> Copy Rich HTML</>
                )}
              </Button>
            </div>

            {/* Preview */}
            <details className="group">
              <summary className="cursor-pointer text-sm text-slate-400 hover:text-slate-300 flex items-center gap-2">
                <ChevronRight className="h-4 w-4 group-open:rotate-90 transition-transform" />
                Preview Email
              </summary>
              <div className="mt-3 p-4 bg-white rounded-lg text-navy-900 text-sm whitespace-pre-wrap max-h-64 overflow-y-auto">
                {bodyPlainText}
              </div>
            </details>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// Script card for shorter reach-out scripts
function ScriptCard({
  title,
  script
}: {
  title: string;
  script: string;
}) {
  const { copiedId, copyToClipboard } = useCopyToClipboard();

  return (
    <Card className="border-navy-700 bg-navy-800/50">
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-medium text-gold-400">{title}</h4>
          <p className="text-slate-300 text-sm">{script}</p>
          <Button
            onClick={() => copyToClipboard(script, title, 'Script')}
            className="w-full min-h-[48px] bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold"
          >
            {copiedId === title ? (
              <><Check className="h-5 w-5 mr-2" /> Copied!</>
            ) : (
              <><Copy className="h-5 w-5 mr-2" /> Copy Script</>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Viral social media post generator - video link first, then quiz link
const getViralPost = (quizLink: string, videoUrl: string, platform: 'facebook' | 'instagram' | 'tiktok' | 'general' = 'general'): string => {
  // StoryBrand 2.0 messaging focused on metabolic age and score - optimized for Dec 2025 social trends
  // Video link comes first, quiz link in the body
  const posts = {
    facebook: `🔥 I just took this 60-second Metabolic Age quiz and my results were eye-opening...

Here's what I learned: Your REAL metabolic age might be 10-15 years OLDER than your actual age. 😳

Mine was... well, let's just say I'm joining the 28-Day Metabolic Reset Project starting January 1st.

The quiz shows you:
✅ Your Metabolic Age Score
✅ Where your metabolism is struggling
✅ A clear path to reset it in 28 days

🎬 Watch the video:
${videoUrl}

Then take the free quiz 👇
${quizLink}

Drop your score in the comments! Let's compare. 👀`,

    instagram: `🔥 POV: You just found out your metabolism is 10+ years older than you... 😳

I took this 60-second Metabolic Age quiz and let's just say... I'm SHOOK.

The 28-Day Metabolic Reset Project starts January 1st and I'm ALL IN.

🎬 Watch the video:
${videoUrl}

Want to know YOUR metabolic age? Take the free quiz:
${quizLink}

Drop a 🔥 if you're joining me!

#metabolichealth #metabolicreset #healthjourney #newyeargoals #weightlossjourney #metabolicage #healthylifestyle #fitnessgoals #28daychallenge`,

    tiktok: `POV: Your metabolic age is WAY older than your real age 😳🔥

This 60-second quiz literally EXPOSED me...

The 28-Day Metabolic Reset starts Jan 1st - who's joining?!

🎬 Watch:
${videoUrl}

Take the quiz 👇
${quizLink}

Drop your score in the comments! 👀

#metabolicage #metabolicreset #healthtok #wellnesstok #newyeargoals #28daychallenge #metabolichealth #fyp #viral`,

    general: `🔥 Want to know your REAL metabolic age?

I just took this 60-second quiz and discovered my metabolism might be 10+ years older than I thought...

The quiz reveals:
✅ Your Metabolic Age Score
✅ What's slowing your metabolism
✅ How to reset it in 28 days

🎬 Watch the video:
${videoUrl}

Then take the free quiz here:
${quizLink}

Join me for the 28-Day Metabolic Reset starting January 1st! 💪`
  };

  return posts[platform];
};

// Media asset card with enhanced sharing
function MediaCard({
  title,
  description,
  type,
  embedUrl,
  downloadUrl,
  quizLink,
  showSocialPost = false
}: {
  title: string;
  description: string;
  type: 'video' | 'image';
  embedUrl: string;
  downloadUrl: string;
  quizLink?: string;
  showSocialPost?: boolean;
}) {
  const { copiedId, copyToClipboard } = useCopyToClipboard();

  // For social sharing, copy the viral post to clipboard
  const handleCopyForPlatform = async (platform: 'facebook' | 'instagram' | 'tiktok') => {
    if (!quizLink) return;
    const post = getViralPost(quizLink, downloadUrl, platform);
    const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
    await copyToClipboard(post, `${platform}-post-${title}`, `${platformName} post copied! Now paste in your ${platformName} post.`);
  };

  return (
    <Card className="border-navy-700 bg-navy-800/50 overflow-hidden">
      {/* Media Preview - auto-plays for videos via embed */}
      <div className="relative aspect-video bg-navy-900">
        {type === 'video' ? (
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
            title={title}
          />
        ) : (
          <img
            src={embedUrl}
            alt={title}
            className="w-full h-full object-contain bg-white"
            onError={(e) => {
              // Fallback if direct URL doesn't work
              (e.target as HTMLImageElement).src = downloadUrl;
            }}
          />
        )}
      </div>
      <CardContent className="p-4 space-y-4">
        <div>
          <h4 className="font-semibold text-white mb-1">{title}</h4>
          <p className="text-sm text-slate-400">{description}</p>
        </div>

        {/* Social Share with Viral Post */}
        {showSocialPost && quizLink && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-gold-500" />
              <span className="text-sm font-medium text-gold-400">Copy viral post for social media</span>
            </div>

            {/* Copy Post Buttons - Fixed CSS with proper grid and spacing */}
            <div className="grid grid-cols-3 gap-3">
              <Button
                onClick={() => handleCopyForPlatform('facebook')}
                className="h-14 bg-[#1877F2] hover:bg-[#1864D9] text-white flex flex-col items-center justify-center gap-1 p-2"
              >
                <Facebook className="h-5 w-5 shrink-0" />
                <span className="text-[10px] leading-tight">
                  {copiedId === `facebook-post-${title}` ? 'Copied!' : 'Facebook'}
                </span>
              </Button>
              <Button
                onClick={() => handleCopyForPlatform('instagram')}
                className="h-14 bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#F77737] hover:opacity-90 text-white flex flex-col items-center justify-center gap-1 p-2"
              >
                <Instagram className="h-5 w-5 shrink-0" />
                <span className="text-[10px] leading-tight">
                  {copiedId === `instagram-post-${title}` ? 'Copied!' : 'Instagram'}
                </span>
              </Button>
              <Button
                onClick={() => handleCopyForPlatform('tiktok')}
                className="h-14 bg-black hover:bg-gray-900 text-white flex flex-col items-center justify-center gap-1 p-2"
              >
                <Video className="h-5 w-5 shrink-0" />
                <span className="text-[10px] leading-tight">
                  {copiedId === `tiktok-post-${title}` ? 'Copied!' : 'TikTok'}
                </span>
              </Button>
            </div>

            {/* Generic copy button */}
            <Button
              onClick={() => copyToClipboard(getViralPost(quizLink, downloadUrl, 'general'), `viral-post-${title}`, 'Viral post')}
              className="w-full min-h-[52px] bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold"
            >
              {copiedId === `viral-post-${title}` ? (
                <><Check className="h-5 w-5 mr-2" /> Post Copied!</>
              ) : (
                <><Copy className="h-5 w-5 mr-2" /> Copy Generic Post</>
              )}
            </Button>

            <div className="text-xs text-slate-500 text-center space-y-1">
              <p><strong>How to share:</strong></p>
              <p>1. Download the video below</p>
              <p>2. Click a platform button above to copy the viral post</p>
              <p>3. Create a new post, upload the video, and paste the text</p>
            </div>
          </div>
        )}

        {/* Download Button - Prominent */}
        <Button
          asChild
          className="w-full min-h-[52px] bg-green-600 hover:bg-green-700 text-white font-semibold"
        >
          <a href={downloadUrl} target="_blank" rel="noopener noreferrer" download>
            <Download className="h-5 w-5 mr-2" /> Download {type === 'video' ? 'Video' : 'Image'}
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

export function CoachResourcesPage() {
  const user = useAuthStore(s => s.user);
  const { data: referralStats } = useReferralStats();
  const { data: activeEnrollment } = useMyActiveEnrollment();
  const { copiedId, copyToClipboard } = useCopyToClipboard();

  // User data for template tokens
  const coachName = user?.name || 'Your Name';
  const coachFirstName = getFirstName(coachName);
  const referralCode = user?.referralCode || '';
  // Include project ID in quiz link for proper referral tracking
  const projectId = activeEnrollment?.projectId;
  const quizLink = getQuizLink(referralCode, projectId);

  // Build templates with token replacement
  const buildTemplate = (template: string): string => {
    return template
      .replace(/\[Your Name\]/g, coachName)
      .replace(/\{coachName\}/g, coachName)
      .replace(/\{firstName\}/g, coachFirstName)
      .replace(/\[LINK: Take the Metabolic Quiz\]/g, quizLink)
      .replace(/\[INSERT YOUR MAGIC REGISTRATION LINK HERE\]/g, quizLink)
      .replace(/{{INSERT YOUR LINK FOR THE RESET PROJECT HERE}}/g, quizLink)
      .replace(/\(quiz link\)/g, quizLink);
  };

  // Email templates data
  const emailTemplates = [
    {
      title: "Past & Inactive Clients",
      description: "Re-engage clients who haven't been active recently",
      category: "Outreach",
      subjectLine: "Starts January 1st- Join the Metabolic Reset Project (Registration Opens Dec 20)",
      subjectLineAlt: "Jan 1st we start! Choose your Cohort: Protocol vs. Self-Directed",
      bodyPlainText: buildTemplate(`Hi [Client Name],

I am looking for participants for a new data-driven initiative starting on Jan. 1, 2026: The Metabolic Reset Project.

Registration officially opens on December 20th.

This is a 28-day clinical-style project designed to compare metabolic stability between two distinct cohorts. We will organize participants into mixed "Project Groups", but you will choose a specific Cohort Track:

- The Metabolic Protocol Cohort: Participants utilizing a structured, clinical nutrition protocol.
- The Self-Directed Cohort: Participants utilizing a DIY, grocery-store-based approach.

Project Scope & Resources: By joining the project ($28 fee), you will receive all the tools necessary to facilitate the data collection:

- Master Course in Metabolic Stability: Short daily education videos for 28 days.
- Incentives: Eligibility for Cash Prizes based on tracking Sleep, Steps, and Water.
- Data Analysis: We will track your specific metabolic markers (Visceral Fat, Metabolic Age) to measure results. You will get to see the results in real time for the different cohorts.

I invite you to select a Cohort and join the project when registration opens on the 20th.

Next Step: Take the baseline quiz to see where you stand.
${quizLink}

Best,
[Your Name]
Group Facilitator`),
      bodyHtml: buildTemplate(`<p>Hi [Client Name],</p>

<p>I am looking for participants for a new data-driven initiative starting on Jan. 1, 2026: <strong>The Metabolic Reset Project</strong>.</p>

<p>Registration officially opens on December 20th.</p>

<p>This is a 28-day clinical-style project designed to compare metabolic stability between two distinct cohorts. We will organize participants into mixed "Project Groups", but you will choose a specific Cohort Track:</p>

<ul>
<li><strong>The Metabolic Protocol Cohort:</strong> Participants utilizing a structured, clinical nutrition protocol.</li>
<li><strong>The Self-Directed Cohort:</strong> Participants utilizing a DIY, grocery-store-based approach.</li>
</ul>

<p><strong>Project Scope & Resources:</strong> By joining the project ($28 fee), you will receive all the tools necessary to facilitate the data collection:</p>

<ul>
<li>Master Course in Metabolic Stability: Short daily education videos for 28 days.</li>
<li>Incentives: Eligibility for Cash Prizes based on tracking Sleep, Steps, and Water.</li>
<li>Data Analysis: We will track your specific metabolic markers (Visceral Fat, Metabolic Age) to measure results.</li>
</ul>

<p>I invite you to select a Cohort and join the project when registration opens on the 20th.</p>

<p><strong>Next Step:</strong> <a href="${quizLink}">Take the baseline quiz</a> to see where you stand.</p>

<p>Best,<br/>${coachName}<br/>Group Facilitator</p>`)
    },
    {
      title: "New Prospects",
      description: "Reach out to people who haven't worked with you before",
      category: "Outreach",
      subjectLine: "Looking for participants in a data-driven Metabolic initiative (Registration Opens Dec 20)",
      subjectLineAlt: "You are eligible to participate in our data-driven Metabolic Initiative (Jan 1st start)",
      bodyPlainText: buildTemplate(`Hi [Name],

I am seeking participants for an upcoming 28-day data-driven initiative: The Metabolic Reset Project.

Registration opens on December 20th for our January 1st start date.

This is a 28-day clinical-style project designed to compare metabolic stability between two distinct cohorts. We will organize participants into mixed "Project Groups", but you will choose a specific Cohort Track:

- Cohort A: Metabolic Protocol (Protein-forward clinical nutrition provided for you @ ~$14/day, with support from a coach).
- Cohort B: Self-Directed (Your own nutrition from your local grocery store, with guidance from a coach).

Project Participation ($28): Your entry fee covers the full project ecosystem:

- 28 Daily Modules: Video coaching on metabolic health.
- Cash Awards: You can earn Cash Awards for tracking daily habits (Water, Sleep, Steps).
- Data Tracking: You will see your metabolic data in real time as it stacks up to other cohorts.

Project Goal: We simply want to see which cohort produces the most stable metabolic results.

To Participate: Start by taking the 1-minute baseline quiz.
${quizLink}

Best,
[Your Name]
Group Facilitator`),
      bodyHtml: buildTemplate(`<p>Hi [Name],</p>

<p>I am seeking participants for an upcoming 28-day data-driven initiative: <strong>The Metabolic Reset Project</strong>.</p>

<p>Registration opens on December 20th for our January 1st start date.</p>

<p>This is a 28-day clinical-style project designed to compare metabolic stability between two distinct cohorts:</p>

<ul>
<li><strong>Cohort A: Metabolic Protocol</strong> (Protein-forward clinical nutrition provided for you @ ~$14/day, with support from a coach).</li>
<li><strong>Cohort B: Self-Directed</strong> (Your own nutrition from your local grocery store, with guidance from a coach).</li>
</ul>

<p><strong>Project Participation ($28):</strong> Your entry fee covers the full project ecosystem:</p>

<ul>
<li>28 Daily Modules: Video coaching on metabolic health.</li>
<li>Cash Awards: You can earn Cash Awards for tracking daily habits (Water, Sleep, Steps).</li>
<li>Data Tracking: You will see your metabolic data in real time as it stacks up to other cohorts.</li>
</ul>

<p><strong>Project Goal:</strong> We simply want to see which cohort produces the most stable metabolic results.</p>

<p><strong>To Participate:</strong> Start by <a href="${quizLink}">taking the 1-minute baseline quiz</a>.</p>

<p>Best,<br/>${coachName}<br/>Group Facilitator</p>`)
    },
    {
      title: "Current Clients",
      description: "Invite clients already using the nutrition plan",
      category: "Outreach",
      subjectLine: "Starts Jan 1st- Join our Metabolic Reset Project (Registration Opens Dec 20)",
      subjectLineAlt: "Join the Project: a data-driven initiative starting Jan. 1 (We need you!)",
      bodyPlainText: buildTemplate(`Hi [Client Name],

We are launching the Metabolic Reset Project on Jan. 1, 2026. Because you are already utilizing the nutrition plan, you are a perfect candidate for this data set.

Please mark your calendar: Registration opens December 20th.

The Project compares results between two mixed cohorts:

- The Metabolic Protocol Cohort (You): Utilizing Optavia fuelings, Whey, & EAAs (I'll fill you in on the details!).
- The Self-Directed Cohort: This is the control group—they are utilizing only food they buy at the grocery store.

I invite you to represent the Metabolic Protocol Cohort with me. We will be gathering your metabolic data (Visceral Fat, Metabolic Age, Muscle Mass) to validate the efficacy of the Metabolic Protocol as it compares to the Self-Directed group.

Project Participation & Resources ($28): Even though you are already on the nutrition plan, joining the Project gives you:

- New Curriculum: 28 brand new daily videos on Metabolic Stability. This is a Master Course in Metabolic Health.
- Cash Incentives: Eligibility for Cash Awards based on your Steps, Sleep, and Water intake.

Action Items:
1. Maintain your Protocol: Keep doing what you are doing.
2. Check your Scale: Ensure you have a metabolic smart scale (like a Renpho) to track metabolic markers.
3. Take the 1-minute quiz: ${quizLink}

Are you open to joining the reset?

Best,
[Your Name]
Group Facilitator`),
      bodyHtml: buildTemplate(`<p>Hi [Client Name],</p>

<p>We are launching <strong>the Metabolic Reset Project</strong> on Jan. 1, 2026. Because you are already utilizing the nutrition plan, you are a perfect candidate for this data set.</p>

<p>Please mark your calendar: <strong>Registration opens December 20th.</strong></p>

<p>The Project compares results between two mixed cohorts:</p>

<ul>
<li><strong>The Metabolic Protocol Cohort (You):</strong> Utilizing Optavia fuelings, Whey, & EAAs.</li>
<li><strong>The Self-Directed Cohort:</strong> This is the control group—they are utilizing only food they buy at the grocery store.</li>
</ul>

<p>I invite you to represent the Metabolic Protocol Cohort with me. We will be gathering your metabolic data (Visceral Fat, Metabolic Age, Muscle Mass) to validate the efficacy of the Metabolic Protocol.</p>

<p><strong>Project Participation & Resources ($28):</strong></p>

<ul>
<li>New Curriculum: 28 brand new daily videos on Metabolic Stability.</li>
<li>Cash Incentives: Eligibility for Cash Awards based on your Steps, Sleep, and Water intake.</li>
</ul>

<p><strong>Action Items:</strong></p>
<ol>
<li>Maintain your Protocol: Keep doing what you are doing.</li>
<li>Check your Scale: Ensure you have a metabolic smart scale (like a Renpho).</li>
<li><a href="${quizLink}">Take the 1-minute quiz</a></li>
</ol>

<p>Are you open to joining the reset?</p>

<p>Best,<br/>${coachName}<br/>Group Facilitator</p>`)
    },
    {
      title: "Quiz Completers (Non-Registered)",
      description: "Follow up with people who took the quiz but didn't register",
      category: "Follow-up",
      subjectLine: "You have your baseline... now what? (Step 2)",
      subjectLineAlt: "Complete your registration for the Metabolic Reset Project",
      bodyPlainText: buildTemplate(`Hi [Name],

I saw that you completed the Metabolic Quiz. Great job taking that first step—now you have your baseline data.

However, I noticed you haven't officially secured your spot in the Metabolic Reset Project starting Jan 1st.

The quiz was just the diagnosis. The Project is the solution.

Why you need to finalize your enrollment: We are running a clinical-style comparison for 28 days to see which method produces better metabolic stability. You need to choose your track:

- Cohort A: The Metabolic Protocol (Structured Clinical Nutrition).
- Cohort B: Self-Directed (DIY / Grocery Store).

For the $28 Entry Fee, you unlock:

- The Master Course: 28 daily videos teaching you the science of metabolic stability.
- The Gamification: Eligibility for Cash Awards for tracking simple habits (Sleep, Water, Steps).
- The Data: Real-time comparison of how your metabolic markers change over 28 days.

SECURE YOUR SPOT: Use the link below to finalize your registration. This "Magic Link" will automatically connect you to my Group so we can track your data together.

${quizLink}

We kick off January 1st. Let's turn that baseline data into a success story.

Best,
[Your Name]
Group Facilitator`),
      bodyHtml: buildTemplate(`<p>Hi [Name],</p>

<p>I saw that you completed the Metabolic Quiz. Great job taking that first step—now you have your baseline data.</p>

<p>However, I noticed you haven't officially secured your spot in the <strong>Metabolic Reset Project</strong> starting Jan 1st.</p>

<p><em>The quiz was just the diagnosis. The Project is the solution.</em></p>

<p><strong>Why you need to finalize your enrollment:</strong> We are running a clinical-style comparison for 28 days to see which method produces better metabolic stability. You need to choose your track:</p>

<ul>
<li><strong>Cohort A:</strong> The Metabolic Protocol (Structured Clinical Nutrition).</li>
<li><strong>Cohort B:</strong> Self-Directed (DIY / Grocery Store).</li>
</ul>

<p><strong>For the $28 Entry Fee, you unlock:</strong></p>

<ul>
<li>The Master Course: 28 daily videos teaching you the science of metabolic stability.</li>
<li>The Gamification: Eligibility for Cash Awards for tracking simple habits.</li>
<li>The Data: Real-time comparison of how your metabolic markers change over 28 days.</li>
</ul>

<p><strong>SECURE YOUR SPOT:</strong> <a href="${quizLink}">Use this link to finalize your registration</a>. This "Magic Link" will automatically connect you to my Group.</p>

<p>We kick off January 1st. Let's turn that baseline data into a success story.</p>

<p>Best,<br/>${coachName}<br/>Group Facilitator</p>`)
    }
  ];

  // Cold market scripts
  const coldScripts = [
    {
      title: "1. Curiosity + Permission",
      script: buildTemplate(`Hi [Name], I have a quick 1 minute metabolism quiz that gives a helpful snapshot of how the metabolism is functioning. If I send it to you, would you be open to taking a look?`)
    },
    {
      title: "2. Classic 'If I... Would You'",
      script: buildTemplate(`Hi [Name], if I send you a short metabolic quiz that helps identify basic wellness patterns, would you be willing to complete it?`)
    },
    {
      title: "3. Value-First",
      script: buildTemplate(`Hi [Name], I'm sharing a simple metabolic quiz that many people have found insightful. Would you like the link?`)
    },
    {
      title: "4. Professional Offer",
      script: buildTemplate(`Hi [Name], I have a brief metabolic quiz that provides a clear overview of metabolic health. If you're open to it, I can send it over.`)
    },
    {
      title: "5. Curiosity-Driven",
      script: buildTemplate(`Hi [Name], I'm sharing a short metabolism quiz with people who want a simple starting point for understanding their wellness. Would you be open to trying it?`)
    },
    {
      title: "6. Neutral & Safe",
      script: buildTemplate(`Hi [Name], I have a quick quiz that gives basic insight into how the metabolism is working. Would you like to take a look at it?`)
    },
    {
      title: "7. Cold → Warm Introduction",
      script: buildTemplate(`Hi [Name], we haven't connected before, but I'm sharing a 60-second metabolism quiz that helps people get a quick snapshot of their health. If I send it, would you check it out?`)
    },
    {
      title: "8. Direct & Duplicatable",
      script: buildTemplate(`Hi [Name], I'm passing around a short metabolism quiz that gives a snapshot of overall metabolic health. Would you like the link?`)
    }
  ];

  // Warm leads scripts
  const warmScripts = [
    {
      title: "Thinking of You",
      script: buildTemplate(`Hey [Name] I was thinking about you today and I hope you are doing well! I just added a new 1 min metabolic quiz that shows where your metabolism is right now and what could help next. Want me to send it to you?`)
    },
    {
      title: "Following Up on Goals",
      script: buildTemplate(`Hey [Name] I was thinking about you today and I hope you are doing well! I just added a new 1 min metabolic quiz that shows where your metabolism is right now and what habits would move the needle fastest. I thought of you since we chatted about your goals back then. Want to take it?`)
    },
    {
      title: "Reconnecting",
      script: buildTemplate(`I have been reconnecting with a few people that I have talked to in the past and wanted to share. I have a 1 min metabolic quiz that shows how your metabolism is doing. Would you like to take it? I can send it over.`)
    },
    {
      title: "Health Goals",
      script: buildTemplate(`Hey [Name] since you mentioned wanting to improve your health, I wanted to share my 1 min metabolic quiz that gives you a good snapshot on where you are now. Want the link?`)
    },
    {
      title: "Follow-Up",
      script: buildTemplate(`No rush at all. Just wanted to offer the quiz. It has been eye opening for most people. Want the link?`)
    },
    {
      title: "When They Say YES",
      script: buildTemplate(`Great, here you go: ${quizLink}\n\nWhen you are done I will see your results and we can connect and discuss them.`)
    },
    {
      title: "When They Say NO",
      script: buildTemplate(`All good. If you ever want a quick snapshot of your metabolism I am here for you!`)
    }
  ];

  // Media assets - using Google Drive direct URLs for better embedding
  // Video embed: /file/d/{ID}/preview | Download: /uc?export=download&id={ID}
  // Image direct: https://lh3.googleusercontent.com/d/{ID}
  const mediaAssets = [
    {
      title: "Promotional Video (with your link)",
      description: "Share this video with your viral post - includes your quiz referral link",
      type: "video" as const,
      fileId: "1CtColKeyRbrVVN24nUC2sFv776X9jCmE",
      embedUrl: "https://drive.google.com/file/d/1CtColKeyRbrVVN24nUC2sFv776X9jCmE/preview",
      downloadUrl: "https://drive.google.com/uc?export=download&id=1CtColKeyRbrVVN24nUC2sFv776X9jCmE",
      showSocialPost: true
    },
    {
      title: "Promotional Video (generic)",
      description: "General promotional video without coach-specific URL",
      type: "video" as const,
      fileId: "1yDUDbirheQa8fw6Uq_SQq6HSl-rO2v5v",
      embedUrl: "https://drive.google.com/file/d/1yDUDbirheQa8fw6Uq_SQq6HSl-rO2v5v/preview",
      downloadUrl: "https://drive.google.com/uc?export=download&id=1yDUDbirheQa8fw6Uq_SQq6HSl-rO2v5v",
      showSocialPost: true
    },
    {
      title: "Metabolic Reset Project Logo",
      description: "Web-ready 4K logo (Black font) for emails and social media",
      type: "image" as const,
      fileId: "1ErjO-G-oYH1AaCgwgSnRcDRX93pscEzF",
      embedUrl: "https://lh3.googleusercontent.com/d/1ErjO-G-oYH1AaCgwgSnRcDRX93pscEzF",
      downloadUrl: "https://drive.google.com/uc?export=download&id=1ErjO-G-oYH1AaCgwgSnRcDRX93pscEzF",
      showSocialPost: false
    }
  ];

  return (
    <div className="space-y-8">
        {/* Header with Stats */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Coach Resources</h1>
            <p className="text-slate-400">
              Everything you need to grow your team and share the Metabolic Reset Project.
            </p>
          </div>

          {/* Referral Stats Card */}
          <Card className="border-gold-500/30 bg-gradient-to-br from-gold-500/10 to-navy-800 lg:min-w-[300px]">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gold-500/20">
                  <TrendingUp className="h-5 w-5 text-gold-500" />
                </div>
                <h3 className="font-semibold text-white">Your Impact</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-3xl font-bold text-gold-500">
                    {referralStats?.totalReferred || 0}
                  </div>
                  <div className="text-sm text-slate-400">People Signed Up</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-400">
                    {referralStats?.totalReferred || 0}
                  </div>
                  <div className="text-sm text-slate-400">Points Earned</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Your Quiz Link */}
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Link2 className="h-5 w-5 text-green-500" />
                  <h3 className="font-semibold text-white">Your Personal Quiz Link</h3>
                </div>
                <p className="text-sm text-slate-400 mb-3">
                  Share this link to automatically connect signups to your team.
                </p>
                <code className="block p-3 bg-navy-900 rounded-lg text-green-400 text-sm break-all">
                  {quizLink}
                </code>
              </div>
              <Button
                onClick={() => copyToClipboard(quizLink, 'quiz-link', 'Quiz link')}
                className="min-h-[56px] min-w-[140px] bg-green-600 hover:bg-green-700 text-white font-semibold text-base"
              >
                {copiedId === 'quiz-link' ? (
                  <><Check className="h-5 w-5 mr-2" /> Copied!</>
                ) : (
                  <><Copy className="h-5 w-5 mr-2" /> Copy Link</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Why Share Section */}
        <Card className="border-navy-700 bg-navy-800/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-gold-500" />
              <CardTitle className="text-white">Why Share?</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-gold-500/20 shrink-0">
                  <Gift className="h-5 w-5 text-gold-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Earn Points</h4>
                  <p className="text-sm text-slate-400">
                    Get 1 point for every person who signs up through your link.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20 shrink-0">
                  <Users className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Build Your Team</h4>
                  <p className="text-sm text-slate-400">
                    Grow your group and create accountability partners for your participants.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-green-500/20 shrink-0">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Track Results</h4>
                  <p className="text-sm text-slate-400">
                    See your team's progress and celebrate their metabolic improvements together.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="templates" className="space-y-6">
          <TabsList className="bg-navy-800 border border-navy-700 p-1 h-auto flex-wrap">
            <TabsTrigger
              value="templates"
              className="data-[state=active]:bg-gold-500 data-[state=active]:text-navy-900 min-h-[44px] px-4"
            >
              <Mail className="h-4 w-4 mr-2" />
              Email Templates
            </TabsTrigger>
            <TabsTrigger
              value="scripts"
              className="data-[state=active]:bg-gold-500 data-[state=active]:text-navy-900 min-h-[44px] px-4"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Scripts
            </TabsTrigger>
            <TabsTrigger
              value="media"
              className="data-[state=active]:bg-gold-500 data-[state=active]:text-navy-900 min-h-[44px] px-4"
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Media
            </TabsTrigger>
          </TabsList>

          {/* Email Templates Tab */}
          <TabsContent value="templates" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Email Templates</h2>
              <Badge variant="outline" className="text-slate-400 border-slate-600">
                {emailTemplates.length} templates
              </Badge>
            </div>
            <p className="text-slate-400 text-sm">
              Click to expand, then copy the subject line and body. Replace [Client Name] or [Name] with your recipient's name.
            </p>
            <div className="space-y-4">
              {emailTemplates.map((template, index) => (
                <TemplateCard key={index} {...template} />
              ))}
            </div>
          </TabsContent>

          {/* Scripts Tab */}
          <TabsContent value="scripts" className="space-y-6">
            {/* Cold Market */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xl font-semibold text-white">Cold Market Scripts</h2>
                <Badge variant="outline" className="text-blue-400 border-blue-500/50">Cold</Badge>
              </div>
              <p className="text-slate-400 text-sm mb-4">
                For people who don't know you yet. Short, value-first messages to open conversations.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {coldScripts.map((script, index) => (
                  <ScriptCard key={index} {...script} />
                ))}
              </div>
            </div>

            {/* Warm Leads */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xl font-semibold text-white">Warm Lead Scripts</h2>
                <Badge variant="outline" className="text-orange-400 border-orange-500/50">Warm</Badge>
              </div>
              <p className="text-slate-400 text-sm mb-4">
                For people you've talked to before. Personal, reconnecting messages.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {warmScripts.map((script, index) => (
                  <ScriptCard key={index} {...script} />
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Media Tab */}
          <TabsContent value="media" className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Media Assets</h2>
            <p className="text-slate-400 text-sm">
              Videos and images to use in your outreach. Download the video, then use the viral post to share on social media.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mediaAssets.map((asset, index) => (
                <MediaCard key={index} {...asset} quizLink={quizLink} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
    </div>
  );
}
