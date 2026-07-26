// Central copy + icon mapping for Project Ark — keeps terminology consistent across
// ProjectArk.jsx, WorkPostCard.jsx, WorkPostDetail.jsx, CreateWorkPost.jsx instead of
// duplicating literal strings. Internal enum values (engagementMode: 'gig'/'role', etc.)
// are unchanged on the backend — only the user-facing labels are renamed here, so no
// data migration is needed.
//
// Visual language follows the app's mono-glass design system: category differentiation
// comes from icons + typography, not a rainbow of badge colors. Color is reserved for
// genuine status (open/filled/closed, application pipeline), matching the rest of the app.
import {
  Rocket, Handshake, Briefcase, GraduationCap, BookOpen, Sparkles,
  Crown, Users, Users2, Lightbulb, Code2, MessageCircle, TrendingUp
} from 'lucide-react';

// C#8: the Talent Directory mode moved out of Project Ark entirely, onto the
// Students Hub page (see students-hub/StudentsHub.jsx) alongside the new
// self-marketing Talent Posts. Project Ark is now a two-level toggle, not three
// flat tabs — a flat gig/role/opportunity tab bar made "Jobs & Internships" (role)
// and "Opportunities" look like two competing versions of the same thing, when
// they're deliberately different: role postings live under a project, Opportunities
// don't. Top level: Projects (wraps gig + role) vs Opportunities. Second level,
// shown only inside Projects: gig vs role.
export const TAB_LABELS = {
  projects: 'Projects',
  opportunity: 'Opportunities',
};

export const TAB_HINTS = {
  projects: 'Startup projects, and the jobs/internships tied to them',
  opportunity: 'Standalone jobs, internships, courses & freelance work — not tied to a project',
};

export const TAB_ICONS = {
  projects: Rocket,
  opportunity: GraduationCap,
};

export const MODE_LABELS = {
  gig: 'Startup Projects',
  role: 'Jobs & Internships',
};

export const MODE_HINTS = {
  gig: 'Collaborative work — startup projects & the positions inside them',
  role: 'Structured jobs, internships, courses & freelance openings, tied to a project',
};

export const MODE_ICONS = {
  gig: Rocket,
  role: Briefcase,
};

export const POST_TYPE_LABELS = {
  project: 'Startup Projects',
  requirement: 'Talent Requests',
};

export const POST_TYPE_SHORT = {
  project: 'PROJECT',
  requirement: 'TALENT REQUEST',
};

export const POST_TYPE_HINTS = {
  project: 'startups looking for talent',
  requirement: 'talent looking for a startup',
};

export const POST_TYPE_ICONS = {
  project: Rocket,
  requirement: Handshake,
};

export const ROLE_TYPE_LABELS = {
  job: 'Job',
  internship: 'Internship',
  course: 'Course',
  freelance: 'Freelance',
};

export const ROLE_TYPE_ICONS = {
  job: Briefcase,
  internship: GraduationCap,
  course: BookOpen,
  freelance: Sparkles,
};

// requiredPositions.positionCategory metadata
export const POSITION_CATEGORY = {
  cofounder:      { label: 'Co-Founder', icon: Crown },
  'core-team':    { label: 'Core Team', icon: Users },
  advisor:        { label: 'Advisor', icon: Lightbulb },
  'freelance-gig':{ label: 'Freelance', icon: Sparkles },
  job:            { label: 'Job', icon: Briefcase },
  internship:     { label: 'Internship', icon: GraduationCap },
};

export const COMMITMENT_LABELS = {
  'full-time': 'Full-time',
  'part-time': 'Part-time',
  contract: 'Contract',
  'equity-only': 'Equity only',
};

export const COMPENSATION_LABELS = {
  salary: 'Salary',
  equity: 'Equity',
  stipend: 'Stipend',
  volunteer: 'Volunteer',
  'revenue-share': 'Revenue share',
};

// Status colors — the one place this module uses color, matching the rest of the app's
// "status colors only" rule.
export const POSITION_STATUS_STYLE = {
  open:   { label: 'Open', className: 'text-emerald-600 dark:text-emerald-400 ring-emerald-300 dark:ring-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/30' },
  filled: { label: 'Filled', className: 'text-zinc-500 dark:text-zinc-400 ring-black/10 dark:ring-zinc-700 bg-black/[0.04] dark:bg-zinc-800/60' },
  closed: { label: 'Closed', className: 'text-zinc-400 dark:text-zinc-500 ring-black/10 dark:ring-zinc-800 bg-black/[0.03] dark:bg-zinc-900/60' },
};

export const MessageIcon = MessageCircle;
export const InvestIcon = TrendingUp;
export const CodeIcon = Code2;
