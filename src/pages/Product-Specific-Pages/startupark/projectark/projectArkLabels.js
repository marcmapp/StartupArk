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

// "Talent Requests" (postType:'requirement') and "Talent Directory" (this mode) are
// deliberately worded distinctly — the former is a demand-side post ("I need a
// startup"), the latter is a browsable list of people's skills/portfolios. Keep them
// visually and verbally separate; conflating them is the confusion that led to this
// feature being scoped out in the first place.
export const MODE_LABELS = {
  gig: 'Projects',
  role: 'Jobs & Internships',
  talent: 'Talent Directory',
};

export const MODE_HINTS = {
  gig: 'Collaborative work — startup projects & the positions inside them',
  role: 'Structured jobs, internships, courses & freelance openings',
  talent: 'Browse student & professional profiles — skills, portfolios, and how to reach them',
};

export const MODE_ICONS = {
  gig: Rocket,
  role: Briefcase,
  talent: Users2,
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
  open:   { label: 'Open', className: 'text-emerald-400 ring-emerald-800/60 bg-emerald-950/30' },
  filled: { label: 'Filled', className: 'text-zinc-400 ring-zinc-700 bg-zinc-800/60' },
  closed: { label: 'Closed', className: 'text-zinc-500 ring-zinc-800 bg-zinc-900/60' },
};

export const MessageIcon = MessageCircle;
export const InvestIcon = TrendingUp;
export const CodeIcon = Code2;
