// pages/Product-Specific-Pages/flowboard/flowboardApi.js
// Client for flowboard-service (FastAPI). Reuses StartupArk's own login token —
// flowboard-service verifies it directly and resolves Manager/Contributor from
// the account's persisted flowboardRole (see Backend/flowboard-service/app/auth.py),
// so no role needs to be sent from here.
import axios from 'axios';

const baseUrl = import.meta.env.VITE_FLOWBOARD_API_BASE_URL;

function client() {
  const token = localStorage.getItem('token');
  return axios.create({
    baseURL: baseUrl,
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function extractCanvas(text, hasAudio) {
  const { data } = await client().post('/api/canvas/extract', { text, has_audio: hasAudio });
  return data; // { pipeline, created, updated }
}

export async function fetchTasks() {
  const { data } = await client().get('/api/tasks');
  return data;
}

export async function editTask(id, patch) {
  const { data } = await client().patch(`/api/tasks/${id}`, patch);
  return data;
}

export async function pushTask(id, integration = 'jira') {
  const { data } = await client().post(`/api/tasks/${id}/push`, { integration });
  return data;
}

export async function postUpdate(id) {
  const { data } = await client().post(`/api/tasks/${id}/post`);
  return data;
}

export async function fetchActivity() {
  const { data } = await client().get('/api/activity');
  return data;
}

export function isAuthError(err) {
  return err?.response?.status === 401;
}

// Account is authenticated but hasn't completed /flowboard/setup (or the
// account's role was reset server-side) — send them back through onboarding.
export function needsOnboarding(err) {
  return err?.response?.status === 403;
}

export function apiErrorMessage(err) {
  return err?.response?.data?.detail || 'Something went wrong. Please try again.';
}

// ---- mapping: backend TaskOut -> frontend ticket shape (see flowboardData.js) ----

const DRAFT_STATUS_LABEL = { in_progress: 'progress', done: 'done', blocked: 'blocked' };

export function toTicket(task, isManager) {
  return {
    id: task.id,
    code: (isManager ? 'DRAFT-' : 'TCK-') + task.id.slice(-4).toUpperCase(),
    title: task.title,
    description: task.description,
    comment: task.comment ?? task.draft_comment ?? '',
    assignee: task.assignee,
    due: task.due_date,
    tag: task.tag,
    status: isManager ? task.status : (DRAFT_STATUS_LABEL[task.draft_status] ?? 'draft'),
    tracker: task.integration === 'linear' ? 'Linear' : 'Jira',
    pushed: isManager ? task.pushed : task.posted,
  };
}

export function toActivityEntry(entry) {
  return {
    id: entry.id,
    verb: entry.verb,
    count: entry.count,
    unit: entry.unit,
    role: entry.role === 'manager' ? 'Manager' : 'Contributor',
    audio: entry.audio,
    when: formatWhen(entry.when),
  };
}

function formatWhen(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}
