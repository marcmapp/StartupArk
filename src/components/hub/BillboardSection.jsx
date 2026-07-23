import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchBillboard } from '../../services/hubBillboard';
import { getImageUrl } from '../../utils/imageUrls';
import { relativeTime } from '../../utils/relativeTime';
import 'boxicons';

// Events and updates are fundamentally different shapes (dated vs. a
// continuous feed) and, unlike the old single-spotlight design, don't compete
// for one slot. Each gets its own lane, each lane is independently capped, and
// each has its own dedicated "see all" destination — so neither one piling up
// over time changes the Hub's height or crowds the other out.
const EVENTS_PREVIEW_LIMIT = 8;
const UPDATES_PREVIEW_LIMIT = 6;

const UPDATE_TYPE_LABEL = {
  general: 'General',
  product_launch: 'Product Launch',
  funding: 'Funding',
  hiring: 'Hiring',
  milestone: 'Milestone',
};

// ── shared bits ──────────────────────────────────────────────────────────────

const AVATAR_SIZES = {
  sm: 'w-9 h-9 text-sm',
  lg: 'w-14 h-14 text-lg',
};

const StartupAvatar = ({ name, logoUrl, size = 'sm' }) => {
  const url = logoUrl ? getImageUrl(logoUrl) : null;
  const dim = AVATAR_SIZES[size];
  return url ? (
    <img src={url} alt={name || 'Startup'} className={`${dim} rounded-xl object-cover border border-black/10 dark:border-white/15 flex-shrink-0`} />
  ) : (
    <div className={`${dim} rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center font-bold flex-shrink-0`}>
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

// ── events lane — horizontal scroller of ticket cards ───────────────────────
// Fixed-width cards + overflow-x scroll means this lane's footprint never
// grows no matter how many events exist upstream.

const EventTicketCard = ({ item, onOpen, featured }) => {
  const dp = dateParts(item.eventDate);
  return (
    <button
      onClick={() => onOpen(item)}
      className="glass-card flex-shrink-0 w-[250px] sm:w-[270px] snap-start text-left p-4 relative overflow-hidden
                 hover:border-zinc-400/60 dark:hover:border-white/25 hover:-translate-y-0.5 transition-all duration-300 group"
    >
      {featured && (
        <div className="absolute top-0 left-0 right-0 h-px overflow-hidden">
          <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-zinc-900/40 dark:via-white/50 to-transparent animate-hud-sweep" />
        </div>
      )}
      <div className="flex items-center gap-3 mb-3">
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
          <StartupAvatar name={item.startupName} logoUrl={item.startupLogoUrl} />
        </div>
      </div>
      <p className="text-sm font-bold text-zinc-900 dark:text-white leading-snug line-clamp-2 mb-1 min-h-[2.5em]">
        {item.title}
      </p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
        {dp.time} · {item.startupName || 'A startup'}
      </p>
      <box-icon
        name="chevron-right"
        size="16px"
        color="currentColor"
        class="absolute bottom-3 right-3 text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors"
      ></box-icon>
    </button>
  );
};

// ── newsletter lane — responsive grid, image-first when a cover photo exists ─
// Cards with a newsletter image get a full cover tile; text-only updates fall
// back to a compact card so the grid never has empty gaps either way.

const UpdateRichCard = ({ item, onOpen, delay, featured }) => {
  const imgUrl = item.imageUrl ? getImageUrl(item.imageUrl) : null;
  const typeLabel = item.updateType && (UPDATE_TYPE_LABEL[item.updateType] || item.updateType);

  return (
    <button
      onClick={() => onOpen(item)}
      style={{ animationDelay: `${delay}ms` }}
      className="animate-fade-in glass-card overflow-hidden text-left flex flex-col group
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
            <StartupAvatar name={item.startupName} logoUrl={item.startupLogoUrl} />
            <span className="text-xs font-semibold text-white truncate drop-shadow">
              {item.startupName || 'A startup'}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 pb-0 flex-shrink-0">
          <StartupAvatar name={item.startupName} logoUrl={item.startupLogoUrl} />
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 truncate">
            {item.startupName || 'A startup'}
          </span>
        </div>
      )}

      <div className="p-4 flex-1 flex flex-col">
        {featured && (
          <div className="flex items-center gap-1.5 mb-1.5">
            <PulseDot />
            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Fresh update</span>
          </div>
        )}
        <p className="text-sm font-bold text-zinc-900 dark:text-white leading-snug line-clamp-1">{item.title}</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2 flex-1">{item.snippet}</p>
        <div className="flex items-center gap-2 mt-3">
          {typeLabel && (
            <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded-full glass-inset text-zinc-500 dark:text-zinc-400 flex-shrink-0">
              {typeLabel}
            </span>
          )}
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 ml-auto flex-shrink-0">
            {relativeTime(item.publishedAt)}
          </span>
        </div>
      </div>
    </button>
  );
};

// ── loading skeleton ─────────────────────────────────────────────────────────

const Skeleton = () => (
  <div className="space-y-6">
    <div className="flex gap-4 overflow-hidden">
      {[0, 1, 2].map((i) => (
        <div key={i} className="w-[260px] h-[150px] flex-shrink-0 rounded-2xl bg-black/[0.04] dark:bg-white/[0.05] animate-pulse" />
      ))}
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-52 rounded-2xl bg-black/[0.04] dark:bg-white/[0.05] animate-pulse" />
      ))}
    </div>
  </div>
);

// ── main ──────────────────────────────────────────────────────────────────────

const BillboardSection = () => {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [updates, setUpdates] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetchBillboard({ type: 'event', limit: EVENTS_PREVIEW_LIMIT }),
      fetchBillboard({ type: 'update', limit: UPDATES_PREVIEW_LIMIT }),
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">Happening on MappArks</h2>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">Events and newsletter from across the ecosystem</p>
        </div>
      </div>

      {loading ? (
        <Skeleton />
      ) : events.length === 0 && updates.length === 0 ? (
        <div className="glass-panel p-8 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No events or newsletter posts yet — check back soon.</p>
        </div>
      ) : (
        <>
          {events.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <box-icon name="calendar-event" size="16px" color="currentColor" class="text-zinc-400 dark:text-zinc-500"></box-icon>
                  <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Upcoming events</p>
                </div>
                <button onClick={() => navigate('/startupark/events')} className="btn-ghost px-3 py-1.5 text-xs flex-shrink-0">
                  See all events
                </button>
              </div>
              <div className="flex gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-1 -mx-1 px-1">
                {events.map((item, i) => (
                  <EventTicketCard key={item.id} item={item} onOpen={openItem} featured={i === 0} />
                ))}
              </div>
            </div>
          )}

          {updates.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <box-icon name="news" size="16px" color="currentColor" class="text-zinc-400 dark:text-zinc-500"></box-icon>
                  <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">More from the newsletter</p>
                </div>
                <button onClick={() => navigate('/startupark/updates')} className="btn-ghost px-3 py-1.5 text-xs flex-shrink-0">
                  See newsletter
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {updates.map((item, i) => (
                  <UpdateRichCard key={item.id} item={item} onOpen={openItem} delay={i * 60} featured={i === 0} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BillboardSection;
