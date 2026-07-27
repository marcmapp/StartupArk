import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchBillboard } from '../../services/hubBillboard';
import { getImageUrl } from '../../utils/imageUrls';
import ShowcaseImage from '../ShowcaseImage';
import LikeButton from '../LikeButton';
import CommentsPanel from '../CommentsPanel';
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
  const imgUrl = item.imageUrl ? getImageUrl(item.imageUrl) : null;
  const [imgError, setImgError] = useState(false);
  const typeLabel = item.updateType && (UPDATE_TYPE_LABEL[item.updateType] || item.updateType);
  const postedOn = new Date(item.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="glass-card overflow-hidden group hover:-translate-y-0.5 hover:border-zinc-400/60 dark:hover:border-white/25 transition-all duration-300">
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
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 line-clamp-2 min-h-[2.2em]">{item.snippet}</p>
        <div className="flex items-center gap-2 mt-3.5 pt-3 border-t border-black/[0.06] dark:border-white/10">
          <StartupAvatar name={item.startupName} logoUrl={item.startupLogoUrl} />
          <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">Posted by {item.startupName || 'a startup'}</span>
        </div>
      </div>
    </button>
      <div className="px-4 pb-4 flex items-center gap-4">
        <LikeButton updateId={item.id} liked={item.liked} likeCount={item.likeCount} compact />
        <CommentsPanel updateId={item.id} postedBy={item.postedBy} initialCount={item.commentCount} className="flex-1" />
      </div>
    </div>
  );
};

// ── event card ────────────────────────────────────────────────────────────────
// Events never carry an image (imageUrl is update-only per the hub billboard
// contract), so this stays a compact date-badge row rather than an image card.

const EventCard = ({ item, onOpen, featured }) => {
  const dp = dateParts(item.eventDate);
  return (
    <button
      onClick={() => onOpen(item)}
      className="glass-card text-left w-full p-4 flex items-center gap-4 group hover:-translate-y-0.5 hover:border-zinc-400/60 dark:hover:border-white/25 transition-all duration-300"
    >
      <div className="flex flex-col items-center justify-center flex-shrink-0 w-14 h-14 rounded-xl glass-inset">
        <span className="text-[9px] font-bold tracking-widest text-zinc-400 dark:text-zinc-500">{dp.weekday}</span>
        <span className="text-xl font-black tabular-nums leading-none my-0.5">{dp.day}</span>
        <span className="text-[9px] font-bold tracking-widest text-zinc-400 dark:text-zinc-500">{dp.month}</span>
      </div>
      <div className="min-w-0 flex-1">
        {featured && (
          <div className="flex items-center gap-1.5 mb-1">
            <PulseDot />
            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Next up</span>
          </div>
        )}
        <p className="text-sm font-bold text-zinc-900 dark:text-white leading-snug line-clamp-1">{item.title}</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1">{item.snippet}</p>
        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1.5">Hosted by: {item.startupName || 'a startup'}</p>
        <p className="text-[11px] text-zinc-400 dark:text-zinc-500">Hosted on: {dp.weekday}, {dp.month} {dp.day} · {dp.time}</p>
      </div>
      <box-icon
        name="chevron-right"
        size="18px"
        color="currentColor"
        class="text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors flex-shrink-0"
      ></box-icon>
    </button>
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
          <div>
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

          <div>
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
                  <EventCard key={item.id} item={item} onOpen={openItem} featured={i === 0} />
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
