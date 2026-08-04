// pages/Product-Specific-Pages/flowboard/flowboardData.js
// Static content that isn't backend data: "Try:" sample text for the canvas,
// pipeline step labels for the extraction animation, and status-label copy.

// Flowboard's role vocabulary matches the backend's directly (manager/contributor)
// — the role is permanent, set once via /flowboard/setup (see useFlowboardUser.js).
export const SAMPLES = {
  manager: {
    sample:
      "Fix the login bug on checkout page — customers on mobile can't submit the OTP form. Assign to Arjun, needs to go out by Friday.\n\nAlso, the pricing page copy is stale, we changed the plans last week. Get Divya to rewrite it by Wednesday, review with me before it's live.",
    meeting:
      "Okay team, quick recap — the checkout OTP bug is still blocking mobile purchases, I need Arjun on that by Friday. Also the pricing page copy is out of date since we changed plans last week, let's get Divya to redo it by Wednesday and loop me in before it ships.",
  },
  contributor: {
    sample:
      "Got the OTP bug fixed, tested it on iOS and Android, should be good to close out.\n\nStill working through the pricing page rewrite — first draft is done, waiting on legal to confirm the new plan wording before I finalize.",
    meeting:
      "Quick update for the team — OTP bug's fixed, tested on iOS and Android, ready to close out. Pricing rewrite first draft is done but I'm blocked waiting on legal to confirm the new plan wording.",
  },
};

export const PIPELINE_LABELS = {
  manager: { base: ['Segment', 'Assign', 'Date', 'Ticket'], withAudio: ['Transcribe', 'Segment', 'Assign', 'Date', 'Ticket'] },
  contributor: { base: ['Topic', 'Match', 'Comment', 'Status'], withAudio: ['Transcribe', 'Topic', 'Match', 'Comment', 'Status'] },
};

export const STATUS_LABEL = {
  review: 'review',
  progress: 'in progress',
  done: 'done',
  draft: 'draft',
};
