// pages/Product-Specific-Pages/flowboard/flowboardStore.js
// Client-only state that has no backend concept: the in-progress canvas draft
// (autosave before extraction). Role now lives server-side on MappArks_User
// (flowboardRole, set once via the /flowboard/setup wizard — see
// useFlowboardUser.js and flowboardOnboardingApi.js) and tasks/activity come
// from flowboard-service — see flowboardApi.js.
const DRAFT_KEY = 'flowboard_draft';

function readJSON(key, fallback) {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  sessionStorage.setItem(key, JSON.stringify(value));
}

export function getDraft() {
  return readJSON(DRAFT_KEY, { text: '', hasAudio: false });
}

export function setDraft(draft) {
  writeJSON(DRAFT_KEY, draft);
}

export function clearDraft() {
  sessionStorage.removeItem(DRAFT_KEY);
}
