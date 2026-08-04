import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchBillboard } from '../../services/hubBillboard';
import { getImageUrl } from '../../utils/imageUrls';
import ShowcaseImage from '../ShowcaseImage';
import LikeButton from '../LikeButton';
import { useCommentsThread, CommentsToggleButton, CommentsThread } from '../CommentsPanel';
import 'boxicons';

// Two independent lanes — newsletter/blog and events — each capped and each
// with its own local "See all" expand, so neither one piling up over time
// changes the other's layout or crowds it out.
const PREVIEW_COUNT = 2;
const FETCH_LIMIT = 6;

const UPDATE_TYPE_LABEL = {
  general: 'General',
  product_launch: 'Product Launch',
  funding: 'Funding',
  hiring: 'Hiring',
  milestone: 'Milestone',
};

// ── shared bits ──────────────────────────────────────────────────────────────

const StartupAvatar = ({ name, logoUrl }) => {
  const url = logoUrl ? getImageUrl(logoUrl) : null;
  return url ? (
    <img src={url} alt={name || 'Startup'} className="w-6 h-6 rounded-lg object-cover border border-black/10 dark:border-white/15 flex-shrink-0" />
  ) : (
    <div className="w-6 h-6 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
      {name?.charAt(0)?.toUpperCase() || '?'}
    </div>
  );
};

const PulseDot = () => (
  <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
    <span className="absolute inline-flex h-full w-full rounded-full bg-zinc-900 dark:bg-white animate-glow-pulse" />
  </span>
);

function dateParts(value) {
  const d = new Date(value);
  return {
    day: d.getDate(),
    month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
    time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
  };
}

// ── newsletter / blog card ───────────────────────────────────────────────────

const UpdateCard = ({ item, onOpen, featured }) => {
  const imgUrl = item.image ? getImageUrl(item.image) : null;
  const [imgError, setImgError] = useState(false);
  const typeLabel = item.meta.category && (UPDATE_TYPE_LABEL[item.meta.category] || item.meta.category);
  const postedOn = new Date(item.meta.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const thread = useCommentsThread(item.id, item.meta.commentCount);

  return (
    <div className="glass-card overflow-hidden group relative hover:-translate-y-0.5 hover:border-zinc-400/60 dark:hover:border-white/25 transition-all duration-300">
    <div className="absolute top-3 right-3 z-10 flex items-center gap-2 rounded-full pl-2.5 pr-3 py-1.5 shadow-lg backdrop-blur-sm bg-zinc-900/90 text-white dark:bg-white/90 dark:text-zinc-900">
      <LikeButton updateId={item.id} liked={item.meta.liked} likeCount={item.meta.likeCount} compact theme="onDark" />
      <span className="w-px h-3.5 bg-white/25 dark:bg-zinc-900/20" />
      <CommentsToggleButton thread={thread} compact theme="onDark" />
    </div>
    <button
      onClick={() => onOpen(item)}
      className="text-left w-full"
    >
      <div className="h-[140px] bg-black/[0.03] dark:bg-white/[0.04] relative overflow-hidden flex-shrink-0">
        {imgUrl && !imgError ? (
          <ShowcaseImage
            src={imgUrl}
            wrapperClassName="w-full h-full"
            imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-300 dark:text-zinc-700">
            <box-icon name="image" size="28px" color="currentColor"></box-icon>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          {typeLabel ? (
            <span className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full glass-inset text-zinc-500 dark:text-zinc-400">
              {typeLabel}
            </span>
          ) : <span />}
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500 flex-shrink-0">{postedOn}</span>
        </div>
        {featured && (
          <div className="flex items-center gap-1.5 mt-2">
            <PulseDot />
            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Fresh update</span>
          </div>
        )}
        <p className="text-sm font-bold text-zinc-900 dark:text-white leading-snug mt-2 line-clamp-1">{item.title}</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 line-clamp-2 min-h-[2.2em]">{item.description}</p>
        <div className="flex items-center gap-2 mt-3.5 pt-3 border-t border-black/[0.06] dark:border-white/10">
          <StartupAvatar name={item.author.name} logoUrl={item.author.logoUrl} />
          <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">Posted by {item.author.name || 'a startup'}</span>
        </div>
      </div>
    </button>
      {thread.expanded && (
        <div className="px-4 pb-4 pt-3 border-t border-black/[0.06] dark:border-white/10" onClick={(e) => e.stopPropagation()}>
          <CommentsThread thread={thread} postedBy={item.meta.postedBy} />
        </div>
      )}
    </div>
  );
};

// ── event card ────────────────────────────────────────────────────────────────
// Mirrors UpdateCard's visual weight (image-topped glass-card) rather than the
// old compact date-badge row. `image` is always the host's logo — Event has no
// hero-image field of its own yet, so this is the only source, not a fallback
// from something richer.

function eventCta(meta) {
  if (meta.isRegistered) return { label: "You're going", tone: 'positive' };
  if (meta.isFull) return { label: 'Full', tone: 'muted' };
  return { label: 'Register', tone: 'action' };
}

const EventCard = ({ item, featured }) => {
  const dp = dateParts(item.meta.eventDate);
  const logoUrl = item.image ? getImageUrl(item.image) : null;
  const cta = eventCta(item.meta);

  return (
    <Link
      to={item.deepLinkPath}
      className="glass-card overflow-hidden group relative block hover:-translate-y-0.5 hover:border-zinc-400/60 dark:hover:border-white/25 transition-all duration-300"
    >
      <div className="h-[140px] bg-black/[0.03] dark:bg-white/[0.04] relative overflow-hidden flex-shrink-0 flex items-center justify-center">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={item.author.name || 'Host'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-300 dark:text-zinc-700">
            <box-icon name="calendar-event" size="28px" color="currentColor"></box-icon>
          </div>
        )}
        {item.meta.isLive && (
          <span className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full pl-2 pr-2.5 py-1 shadow-lg backdrop-blur-sm bg-zinc-900/90 text-white dark:bg-white/90 dark:text-zinc-900">
            <PulseDot />
            <span className="text-[9px] font-bold uppercase tracking-widest">Live</span>
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
            {dp.weekday}, {dp.month} {dp.day} &middot; {dp.time}
          </span>
          {featured && !item.meta.isLive && (
            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 flex-shrink-0">Next up</span>
          )}
        </div>
        <p className="text-sm font-bold text-zinc-900 dark:text-white leading-snug mt-2 line-clamp-1">{item.title}</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 line-clamp-2 min-h-[2.2em]">{item.description}</p>
        <div className="flex items-center justify-between gap-2 mt-3.5 pt-3 border-t border-black/[0.06] dark:border-white/10">
          <div className="flex items-center gap-2 min-w-0">
            <StartupAvatar name={item.author.name} logoUrl={item.author.logoUrl} />
            <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">Hosted by {item.author.name || 'a startup'}</span>
          </div>
          <span
            className={
              'text-[11px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ' +
              (cta.tone === 'action'
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                : cta.tone === 'positive'
                ? 'glass-inset text-zinc-700 dark:text-zinc-300'
                : 'glass-inset text-zinc-400 dark:text-zinc-500')
            }
          >
            {cta.label}
          </span>
        </div>
      </div>
    </Link>
  );
};

// ── loading skeleton ─────────────────────────────────────────────────────────

const ColumnSkeleton = () => (
  <div className="flex flex-col gap-4">
    {[0, 1].map((i) => (
      <div key={i} className="h-40 rounded-2xl bg-black/[0.04] dark:bg-white/[0.05] animate-pulse" />
    ))}
  </div>
);

// ── main ──────────────────────────────────────────────────────────────────────

const BillboardSection = () => {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [showAllUpdates, setShowAllUpdates] = useState(false);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetchBillboard({ type: 'event', limit: FETCH_LIMIT }),
      fetchBillboard({ type: 'update', limit: FETCH_LIMIT }),
    ])
      .then(([eventsRes, updatesRes]) => {
        if (cancelled) return;
        setEvents(eventsRes.items || []);
        setUpdates(updatesRes.items || []);
      })
      .catch(() => {
        if (!cancelled) { setEvents([]); setUpdates([]); }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const openItem = (item) => navigate(item.deepLinkPath);
  const visibleUpdates = showAllUpdates ? updates : updates.slice(0, PREVIEW_COUNT);
  const visibleEvents = showAllEvents ? events : events.slice(0, PREVIEW_COUNT);

  return (
    <div>
      <div className="px-1 mb-5">
        <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
          Daily Dosage of MappArks
        </h2>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">Events and newsletter from across the ecosystem</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ColumnSkeleton />
          <ColumnSkeleton />
        </div>
      ) : events.length === 0 && updates.length === 0 ? (
        <div className="glass-panel p-8 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No events or newsletter posts yet — check back soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="order-2 lg:order-1">
            <div className="flex items-center justify-between mb-3 px-1">
              <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                Newsletter &amp; Announcements
              </p>
              {updates.length > PREVIEW_COUNT && (
                <button onClick={() => setShowAllUpdates((s) => !s)} className="btn-ghost px-3 py-1.5 text-xs flex-shrink-0">
                  {showAllUpdates ? 'Show less' : 'See all'}
                </button>
              )}
            </div>
            {updates.length === 0 ? (
              <div className="glass-inset rounded-2xl p-6 text-center">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">No newsletter posts yet.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {visibleUpdates.map((item, i) => (
                  <UpdateCard key={item.id} item={item} onOpen={openItem} featured={i === 0} />
                ))}
              </div>
            )}
          </div>

          <div className="order-1 lg:order-2">
            <div className="flex items-center justify-between mb-3 px-1">
              <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                Events Coming Up
              </p>
              {events.length > PREVIEW_COUNT && (
                <button onClick={() => setShowAllEvents((s) => !s)} className="btn-ghost px-3 py-1.5 text-xs flex-shrink-0">
                  {showAllEvents ? 'Show less' : 'See all'}
                </button>
              )}
            </div>
            {events.length === 0 ? (
              <div className="glass-inset rounded-2xl p-6 text-center">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">No upcoming events yet.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {visibleEvents.map((item, i) => (
                  <EventCard key={item.id} item={item} featured={i === 0} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BillboardSection;
