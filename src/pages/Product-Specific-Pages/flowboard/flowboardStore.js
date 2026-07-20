// pages/Product-Specific-Pages/flowboard/flowboardStore.js
// Session-scoped state for the Flowboard prototype — mirrors what the prototype
// HTML kept in page-level JS variables, but persisted to sessionStorage so it
// survives navigating between the Canvas/Tasks/Activity routes (each of which
// is its own top-level route, not a shared layout). Backend wiring later will
// replace these reads/writes with real API calls without touching callers much.
import { DEFAULT_TICKETS, DEFAULT_ACTIVITY } from './flowboardData';

const DRAFT_KEY = 'flowboard_draft';
const TICKETS_KEY = 'flowboard_tickets';
const ACTIVITY_KEY = 'flowboard_activity';

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

export function getTickets() {
  return readJSON(TICKETS_KEY, DEFAULT_TICKETS);
}

export function setTickets(tickets) {
  writeJSON(TICKETS_KEY, tickets);
}

export function getActivity() {
  return readJSON(ACTIVITY_KEY, DEFAULT_ACTIVITY);
}

export function addActivity(entry) {
  const current = getActivity();
  const next = [{ id: `act-${Date.now()}`, when: 'Just now', ...entry }, ...current];
  writeJSON(ACTIVITY_KEY, next);
  return next;
}

// Flowboard's own role vocabulary ('admin' = Manager, 'user' = Contributor) is
// deliberately independent of StartupArk's `startuparkRole` — that field lives
// on the shared MappArks_User document but is StartupArk product data (only
// populated once a user completes StartupArk's Agreement flow), not a
// cross-product identity attribute. Flowboard should work standalone for an
// account that has never touched StartupArk, so it keeps its own role choice,
// scoped per account id, until a real backend concept exists.
const ROLE_KEY_PREFIX = 'flowboard_role_';

export function getFlowboardRole(userId) {
  if (!userId) return 'user';
  return localStorage.getItem(ROLE_KEY_PREFIX + userId) || 'user';
}

export function setFlowboardRole(userId, role) {
  if (!userId) return;
  localStorage.setItem(ROLE_KEY_PREFIX + userId, role);
}
