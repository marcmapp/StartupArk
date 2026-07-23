import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchFollowers, fetchFollowing } from '../services/follow';
import { resolveProfileLink } from '../services/profileResolver';

// Serves both /startupark/users/:userId/followers and /.../following — the
// `type` prop picks the initial tab, in-page tabs switch by navigating to the
// sibling route so the URL always reflects what's shown.
const FollowersPage = ({ type = 'followers' }) => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [links, setLinks] = useState({}); // userId -> routePath, populated as resolves land
  const [linksResolved, setLinksResolved] = useState(false); // guards the "unavailable" flash while resolving
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [type, userId]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    setLinks({});
    setLinksResolved(false);
    try {
      const fetcher = type === 'following' ? fetchFollowing : fetchFollowers;
      const res = await fetcher(userId, { page, limit: 20 });
      const list = res.data || [];
      setRows(list);
      setPagination({ total: res.total || 0, page: res.page || 1, pages: res.pages || 1 });

      // Resolve each row's profile link in parallel — list pages are capped at 20,
      // so this stays a small burst rather than needing a batch endpoint.
      Promise.all(list.map(async person => {
        const routePath = await resolveProfileLink(person._id);
        return [person._id, routePath];
      })).then(pairs => {
        setLinks(Object.fromEntries(pairs.filter(([, routePath]) => routePath)));
        setLinksResolved(true);
      });
    } catch (err) {
      setError(err.message || 'Failed to load list');
    } finally {
      setLoading(false);
    }
  }, [type, userId, page]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 space-y-5">
      <div className="glass-card p-1.5 flex gap-1 w-fit">
        <button
          onClick={() => navigate(`/startupark/users/${userId}/followers`)}
          className={`text-sm px-4 py-1.5 rounded-xl transition-colors ${type === 'followers' ? 'btn-mono' : 'text-zinc-500 hover:text-zinc-200'}`}
        >
          Followers
        </button>
        <button
          onClick={() => navigate(`/startupark/users/${userId}/following`)}
          className={`text-sm px-4 py-1.5 rounded-xl transition-colors ${type === 'following' ? 'btn-mono' : 'text-zinc-500 hover:text-zinc-200'}`}
        >
          Following
        </button>
      </div>

      {!loading && <p className="text-xs text-zinc-500">{pagination.total} {type}</p>}

      {error && <div className="glass-inset p-4 text-red-400 text-sm">{error}</div>}

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass-card p-3 flex items-center gap-3 animate-pulse">
              <div className="w-11 h-11 rounded-full bg-zinc-800" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-1/3 rounded bg-zinc-800" />
                <div className="h-2.5 w-1/4 rounded bg-zinc-800" />
              </div>
            </div>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="glass-inset flex flex-col items-center justify-center py-16 gap-2">
          <p className="text-zinc-300 font-semibold text-sm">No {type} yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map(person => {
            const routePath = links[person._id];
            const RowTag = routePath ? Link : 'div';
            const rowProps = routePath ? { to: routePath } : {};
            return (
              <RowTag
                key={person._id}
                {...rowProps}
                className={`glass-card p-3 flex items-center gap-3 ${routePath ? 'hover:ring-zinc-600 transition-all' : ''}`}
              >
                {person.profilePicture ? (
                  <img src={person.profilePicture} alt="" className="w-11 h-11 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-zinc-800 flex items-center justify-center text-sm text-zinc-400 shrink-0">
                    {person.username?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-zinc-100 truncate">{person.username || 'Member'}</div>
                  {person.startuparkRole && (
                    <div className="text-[11px] text-zinc-500 capitalize">{person.startuparkRole}</div>
                  )}
                </div>
                {!routePath && linksResolved && (
                  <span className="text-[11px] text-zinc-600 shrink-0">Profile unavailable</span>
                )}
              </RowTag>
            );
          })}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn-ghost text-xs px-4 py-2 disabled:opacity-40">
            ← Prev
          </button>
          <span className="text-xs text-zinc-500 px-2">{page} / {pagination.pages}</span>
          <button disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)} className="btn-ghost text-xs px-4 py-2 disabled:opacity-40">
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default FollowersPage;
