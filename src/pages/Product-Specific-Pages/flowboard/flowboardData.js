// pages/Product-Specific-Pages/flowboard/flowboardData.js
// Static mock content for the Flowboard prototype (frontend-only phase).
// Once the backend lands, SAMPLES/DEFAULT_TICKETS/DEFAULT_ACTIVITY are replaced
// by real transcription + extraction API responses — shape kept close to what
// that response will look like so the swap is mostly a data-source change.

// Flowboard's own role vocabulary: 'admin' (Manager) vs 'user' (Contributor).
// Set via Flowboard's own RoleSwitcher, independent of StartupArk's role —
// see flowboardStore.getFlowboardRole/setFlowboardRole.
export const SAMPLES = {
  admin: {
    sample:
      "Fix the login bug on checkout page — customers on mobile can't submit the OTP form. Assign to Arjun, needs to go out by Friday.\n\nAlso, the pricing page copy is stale, we changed the plans last week. Get Divya to rewrite it by Wednesday, review with me before it's live.",
    meeting:
      "Okay team, quick recap — the checkout OTP bug is still blocking mobile purchases, I need Arjun on that by Friday. Also the pricing page copy is out of date since we changed plans last week, let's get Divya to redo it by Wednesday and loop me in before it ships.",
  },
  user: {
    sample:
      "Got the OTP bug fixed, tested it on iOS and Android, should be good to close out.\n\nStill working through the pricing page rewrite — first draft is done, waiting on legal to confirm the new plan wording before I finalize.",
    meeting:
      "Quick update for the team — OTP bug's fixed, tested on iOS and Android, ready to close out. Pricing rewrite first draft is done but I'm blocked waiting on legal to confirm the new plan wording.",
  },
};

export const PIPELINE_LABELS = {
  admin: { base: ['Segment', 'Assign', 'Date', 'Ticket'], withAudio: ['Transcribe', 'Segment', 'Assign', 'Date', 'Ticket'] },
  user: { base: ['Topic', 'Match', 'Comment', 'Status'], withAudio: ['Transcribe', 'Topic', 'Match', 'Comment', 'Status'] },
};

export const DEFAULT_TICKETS = {
  admin: [
    {
      id: 'a1',
      code: 'DRAFT-014',
      title: "Checkout OTP form fails on mobile",
      description: "Login bug on checkout — mobile users can't submit OTP, blocking purchase.",
      assignee: 'Arjun',
      due: 'Fri',
      tag: 'bug',
      status: 'review',
      tracker: 'Jira',
      pushed: false,
    },
    {
      id: 'a2',
      code: 'DRAFT-015',
      title: 'Pricing page copy rewrite',
      description: 'Stale copy after plan changes. Divya to rewrite, manager review before go-live.',
      assignee: 'Divya',
      due: 'Wed',
      tag: 'content',
      status: 'review',
      tracker: 'Jira',
      pushed: false,
    },
  ],
  user: [
    {
      id: 'u1',
      code: 'TCK-014',
      title: 'Checkout OTP form fails on mobile',
      comment: 'Fixed and verified on iOS and Android. Ready to close.',
      status: 'done',
      pushed: false,
    },
    {
      id: 'u2',
      code: 'TCK-015',
      title: 'Pricing page copy rewrite',
      comment: 'First draft complete. Blocked on legal confirming new plan wording.',
      status: 'progress',
      pushed: false,
    },
  ],
};

export const DEFAULT_ACTIVITY = [
  { id: 'act-2', verb: 'Recorded and summarised a meeting into', count: 2, unit: 'tasks', role: 'Manager', when: 'Yesterday · 4:05 PM', audio: true },
  { id: 'act-1', verb: 'Posted a check-in update to', count: 2, unit: 'tasks', role: 'Contributor', when: 'Yesterday · 9:12 AM', audio: false },
];

export const STATUS_LABEL = {
  review: 'review',
  progress: 'in progress',
  done: 'done',
  draft: 'draft',
};
