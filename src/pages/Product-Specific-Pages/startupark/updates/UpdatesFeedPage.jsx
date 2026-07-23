import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchUpdatesFeed, fetchMineUpdates, createUpdate, editUpdate, deleteUpdate,
  publishUpdate, uploadUpdateImage, UPDATE_TYPES
} from '../../../../services/startupUpdates';
import { getImageUrl } from '../../../../utils/imageUrls';
import { relativeTime } from '../../../../utils/relativeTime';
import Loader from '../../../../components/Loader';
import 'boxicons';

const TYPE_LABEL = Object.fromEntries(UPDATE_TYPES.map((t) => [t.value, t.label]));

function getUserRole() {
  try {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    return u.startuparkRole || u.role || (u.isStartup ? 'startup' : 'user');
  } catch {
    return 'user';
  }
}

// ── shared bits ──────────────────────────────────────────────────────────

const EmptyState = ({ icon, title, description, action }) => (
  <div className="glass-panel p-10 text-center flex flex-col items-center gap-3">
    <div className="w-12 h-12 rounded-2xl glass-inset flex items-center justify-center text-zinc-400 dark:text-zinc-500">
      <box-icon name={icon} size="22px" color="currentColor"></box-icon>
    </div>
    <div>
      <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{title}</p>
      <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">{description}</p>
    </div>
    {action}
  </div>
);

// ── Feed tab ─────────────────────────────────────────────────────────────

// Cover-image tile when the post has one, a compact avatar row when it
// doesn't — so the grid stays dense either way instead of leaving gaps next
// to text-only posts. Mirrors the card language on the Hub's newsletter lane.
const UpdateCard = ({ update }) => {
  const navigate = useNavigate();
  const startup = update.startupId || {};
  const logoUrl = startup.logo ? getImageUrl(startup.logo) : null;
  const imgUrl = update.imageUrl ? getImageUrl(update.imageUrl) : null;

  return (
    <button
      onClick={() => navigate(`/updates/${update._id}`)}
      className="glass-card overflow-hidden text-left flex flex-col group
                 hover:-translate-y-0.5 hover:border-zinc-400/60 dark:hover:border-white/25 transition-all duration-300"
    >
      {imgUrl ? (
        <div className="relative aspect-video w-full overflow-hidden flex-shrink-0">
          <img
            src={imgUrl}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center gap-2 min-w-0">
            {logoUrl ? (
              <img src={logoUrl} alt={startup.companyName} className="w-9 h-9 rounded-xl object-cover border border-white/20 flex-shrink-0" />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-white text-zinc-900 flex items-center justify-center text-sm font-bold flex-shrink-0">
                {startup.companyName?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
            <span className="text-xs font-semibold text-white truncate drop-shadow">
              {startup.companyName || 'A startup'}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 pb-0 flex-shrink-0">
          {logoUrl ? (
            <img src={logoUrl} alt={startup.companyName} className="w-9 h-9 rounded-xl object-cover border border-black/10 dark:border-white/15 flex-shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center text-sm font-bold flex-shrink-0">
              {startup.companyName?.charAt(0)?.toUpperCase() || '?'}
            </div>
          )}
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 truncate">
            {startup.companyName || 'A startup'}
          </span>
        </div>
      )}

      <div className="p-4 flex-1 flex flex-col">
        <p className="text-sm font-bold text-zinc-900 dark:text-white leading-snug line-clamp-1">{update.title}</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 line-clamp-2 flex-1">{update.body}</p>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded-full glass-inset text-zinc-500 dark:text-zinc-400 flex-shrink-0">
            {TYPE_LABEL[update.updateType] || update.updateType}
          </span>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 ml-auto flex-shrink-0">
            {relativeTime(update.publishedAt || update.createdAt)}
          </span>
        </div>
      </div>
    </button>
  );
};

const CardSkeleton = () => (
  <div className="h-52 rounded-2xl bg-black/[0.04] dark:bg-white/[0.05] animate-pulse" />
);

const FEED_PAGE_LIMIT = 20;

const FeedTab = () => {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeType, setActiveType] = useState(null);
  const [followedOnly, setFollowedOnly] = useState(false);

  // Filter/following changes always restart from page 1.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchUpdatesFeed({ type: activeType, followedOnly, page: 1, limit: FEED_PAGE_LIMIT })
      .then((r) => {
        if (cancelled) return;
        setUpdates(r.data || []);
        setPage(1);
        setTotalPages(r.pagination?.pages || 1);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [activeType, followedOnly]);

  const loadMore = () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    fetchUpdatesFeed({ type: activeType, followedOnly, page: nextPage, limit: FEED_PAGE_LIMIT })
      .then((r) => {
        setUpdates((prev) => [...prev, ...(r.data || [])]);
        setPage(nextPage);
        setTotalPages(r.pagination?.pages || nextPage);
      })
      .finally(() => setLoadingMore(false));
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <button
          onClick={() => setActiveType(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${!activeType ? 'btn-mono' : 'btn-ghost'}`}
        >
          All
        </button>
        {UPDATE_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setActiveType(t.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${activeType === t.value ? 'btn-mono' : 'btn-ghost'}`}
          >
            {t.label}
          </button>
        ))}
        <button
          onClick={() => setFollowedOnly((v) => !v)}
          className={`sm:ml-auto px-3 py-1.5 rounded-full text-xs font-medium transition-all inline-flex items-center gap-1.5 ${followedOnly ? 'btn-mono' : 'btn-ghost'}`}
        >
          <box-icon name="user-check" size="14px" color="currentColor"></box-icon>
          Following
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : updates.length === 0 ? (
        <EmptyState
          icon="news"
          title={followedOnly ? 'Nothing here yet' : 'No posts yet'}
          description={followedOnly ? 'Startups you follow haven\'t posted anything yet.' : 'Check back soon for announcements, launches, and milestones.'}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {updates.map((u) => <UpdateCard key={u._id} update={u} />)}
            {loadingMore && Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={`skeleton-${i}`} />)}
          </div>

          {page < totalPages && !loadingMore && (
            <div className="flex justify-center mt-6">
              <button onClick={loadMore} className="btn-ghost px-5 py-2 text-sm">
                Load more
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
};

// ── Mine tab (compose + manage) ─────────────────────────────────────────

const emptyForm = { title: '', body: '', updateType: 'general', imageFile: null, imagePreview: null, existingImageUrl: null };

const ComposeForm = ({ editing, onSaved, onCancel }) => {
  const [form, setForm] = useState(() => editing
    ? {
        title: editing.title, body: editing.body, updateType: editing.updateType,
        imageFile: null, imagePreview: editing.imageUrl ? getImageUrl(editing.imageUrl) : null,
        existingImageUrl: editing.imageUrl || null
      }
    : emptyForm);
  const [saving, setSaving] = useState(null); // 'draft' | 'publish' | null
  const [error, setError] = useState(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((f) => ({ ...f, imageFile: file, imagePreview: URL.createObjectURL(file) }));
  };

  // action: 'draft' (new, save as draft) | 'publish' (new, or promote a draft) | 'save' (edit an already-published post — never re-publishes)
  const save = async (action) => {
    if (!form.title.trim() || !form.body.trim()) return;
    setSaving(action);
    setError(null);
    try {
      const payload = { title: form.title.trim(), body: form.body.trim(), updateType: form.updateType };
      let update;
      if (editing) {
        update = (await editUpdate(editing._id, payload)).data;
      } else {
        update = (await createUpdate({ ...payload, imageUrl: form.existingImageUrl, status: action === 'draft' ? 'draft' : 'published' })).data;
      }

      if (form.imageFile) {
        const key = await uploadUpdateImage(update._id, form.imageFile);
        update = (await editUpdate(update._id, { imageUrl: key })).data;
      }

      // Promoting a draft goes through the dedicated publish action so the
      // follower-notification guard only lives in one place. Editing an
      // already-published post never re-publishes.
      if (editing && editing.status === 'draft' && action === 'publish') {
        update = (await publishUpdate(update._id)).data;
      }

      onSaved(update);
    } catch (err) {
      setError(err.message || 'Failed to save update');
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="glass-card p-5 mb-6 space-y-3">
      <p className="text-sm font-semibold text-zinc-900 dark:text-white">{editing ? 'Edit post' : 'New post'}</p>
      <input
        value={form.title}
        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        maxLength={140}
        placeholder="Title (e.g. We just closed our seed round!)"
        className="input-mono"
      />
      <textarea
        value={form.body}
        onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
        maxLength={2000}
        rows={4}
        placeholder="What's happening? (supports **bold**, *italic*, and line breaks)"
        className="input-mono resize-none"
      />
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={form.updateType}
          onChange={(e) => setForm((f) => ({ ...f, updateType: e.target.value }))}
          className="glass-inset px-3 py-2 text-sm text-zinc-900 dark:text-white [&>option]:bg-zinc-900 [&>option]:text-zinc-100"
        >
          {UPDATE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <label className="btn-ghost px-3 py-2 text-xs cursor-pointer">
          {form.imagePreview ? 'Change image' : 'Add image (optional)'}
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </label>
      </div>
      {form.imagePreview && (
        <img src={form.imagePreview} alt="Preview" className="w-full max-h-64 object-cover rounded-xl border border-black/10 dark:border-white/15" />
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex items-center gap-3 pt-1">
        {editing && editing.status === 'published' ? (
          <button onClick={() => save('save')} disabled={!!saving} className="btn-mono px-5 py-2 text-sm">
            {saving === 'save' ? 'Saving…' : 'Save changes'}
          </button>
        ) : (
          <>
            <button onClick={() => save('publish')} disabled={!!saving} className="btn-mono px-5 py-2 text-sm">
              {saving === 'publish' ? 'Publishing…' : 'Publish'}
            </button>
            <button onClick={() => save('draft')} disabled={!!saving} className="btn-ghost px-5 py-2 text-sm">
              {saving === 'draft' ? 'Saving…' : 'Save Draft'}
            </button>
          </>
        )}
        <button onClick={onCancel} disabled={!!saving} className="btn-ghost px-4 py-2 text-sm ml-auto">
          Cancel
        </button>
      </div>
    </div>
  );
};

const UpdateManageRow = ({ update, onEdit, onDelete, onPublish, navigate }) => (
  <div className="flex items-start gap-4 p-4 sm:p-5 glass-card">
    {update.imageUrl ? (
      <img src={getImageUrl(update.imageUrl)} alt="" className="w-12 h-12 rounded-xl object-cover border border-black/10 dark:border-white/15 flex-shrink-0" />
    ) : (
      <div className="w-12 h-12 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center text-xs font-bold flex-shrink-0">
        {TYPE_LABEL[update.updateType]?.charAt(0) || '?'}
      </div>
    )}
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => navigate(`/updates/${update._id}`)} className="text-sm font-semibold text-zinc-900 dark:text-white truncate hover:underline text-left">
          {update.title}
        </button>
        <span className={`text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded-full flex-shrink-0 ${update.status === 'draft' ? 'glass-inset text-amber-600 dark:text-amber-400' : 'glass-inset text-emerald-600 dark:text-emerald-400'}`}>
          {update.status}
        </span>
        <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded-full glass-inset text-zinc-500 dark:text-zinc-400 flex-shrink-0">
          {TYPE_LABEL[update.updateType] || update.updateType}
        </span>
      </div>
      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1.5">
        {update.status === 'published'
          ? `Published ${relativeTime(update.publishedAt || update.createdAt)}`
          : `Saved ${relativeTime(update.createdAt)}`}
      </p>
      <div className="flex items-center gap-2 mt-2.5">
        {update.status === 'draft' && (
          <button onClick={() => onPublish(update)} className="btn-mono px-3 py-1 text-xs">Publish</button>
        )}
        <button onClick={() => onEdit(update)} className="btn-ghost px-3 py-1 text-xs">Edit</button>
        <button onClick={() => onDelete(update)} className="btn-ghost px-3 py-1 text-xs text-red-500">Delete</button>
      </div>
    </div>
  </div>
);

const MineTab = () => {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [composing, setComposing] = useState(false);
  const navigate = useNavigate();

  const load = () => fetchMineUpdates({ page: 1, limit: 50 })
    .then((r) => { setUpdates(r.data || []); setError(null); })
    .catch((err) => setError(err.message || 'Failed to load'))
    .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleSaved = () => {
    setComposing(false);
    setEditing(null);
    setLoading(true);
    load();
  };

  const handlePublish = async (update) => {
    await publishUpdate(update._id);
    setLoading(true);
    load();
  };

  const handleDelete = async (update) => {
    if (!window.confirm(`Delete "${update.title}"? This can't be undone.`)) return;
    await deleteUpdate(update._id);
    setLoading(true);
    load();
  };

  if (error) {
    return <EmptyState icon="error" title="Couldn't load your posts" description={error} />;
  }

  const drafts = updates.filter((u) => u.status === 'draft');
  const published = updates.filter((u) => u.status === 'published');

  return (
    <>
      {editing ? (
        <ComposeForm editing={editing} onSaved={handleSaved} onCancel={() => setEditing(null)} />
      ) : composing ? (
        <ComposeForm onSaved={handleSaved} onCancel={() => setComposing(false)} />
      ) : (
        <button onClick={() => setComposing(true)} className="btn-mono px-5 py-2.5 text-sm mb-6 inline-flex items-center gap-2">
          <box-icon name="plus" size="16px" color="currentColor"></box-icon>
          New post
        </button>
      )}

      {loading ? (
        <Loader />
      ) : updates.length === 0 ? (
        <EmptyState icon="edit-alt" title="Nothing posted yet" description="Share a launch, a milestone, or a hiring update with the ecosystem." />
      ) : (
        <div className="space-y-6">
          {drafts.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2.5">Drafts</p>
              <div className="space-y-3">
                {drafts.map((u) => (
                  <UpdateManageRow key={u._id} update={u} onEdit={setEditing} onDelete={handleDelete} onPublish={handlePublish} navigate={navigate} />
                ))}
              </div>
            </div>
          )}
          {published.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2.5">Published</p>
              <div className="space-y-3">
                {published.map((u) => (
                  <UpdateManageRow key={u._id} update={u} onEdit={setEditing} onDelete={handleDelete} onPublish={handlePublish} navigate={navigate} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

// ── Page ─────────────────────────────────────────────────────────────────

const UpdatesFeedPage = () => {
  const canPost = getUserRole() === 'startup';
  const [tab, setTab] = useState('feed'); // 'feed' | 'mine'

  return (
    <div className="min-h-screen max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:ml-8">
      <div className="flex items-start sm:items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl glass-inset flex items-center justify-center text-zinc-500 dark:text-zinc-400 flex-shrink-0">
            <box-icon name="news" size="20px" color="currentColor"></box-icon>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white leading-tight">Newsletter</h1>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">Launches, funding, and milestones from across the ecosystem</p>
          </div>
        </div>

        {canPost && (
          <div className="glass-inset p-1 inline-flex items-center gap-1">
            {[
              { key: 'feed', label: 'Feed' },
              { key: 'mine', label: 'Mine' },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  tab === t.key
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {tab === 'mine' && canPost ? <MineTab /> : <FeedTab />}
    </div>
  );
};

export default UpdatesFeedPage;
