// components/FavoritesBell.jsx
// Header icon + dropdown panel for favorited startups (Tier 3 C#5) — replaces
// "Saved" as a standalone nav item. Mirrors NotificationBell's exact
// interaction pattern (inline header trigger, ref-positioned portal dropdown,
// backdrop click-to-close) for consistency rather than inventing a new one.
import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { FiBookmark } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { getImageUrl } from "../utils/imageUrls";
import DefaultLogo from "../assets/MP-white-bg.png";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

const FavoritesBell = ({ user }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ right: 0, top: 0 });
  const btnRef = useRef(null);
  const navigate = useNavigate();

  const loadFavorites = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${baseUrl}/startupark/api/favorites?entityType=startup`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavorites(res.data?.favorites || []);
    } catch (err) {
      console.error("Failed to load favorites:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) loadFavorites();
  }, [user, loadFavorites]);

  // Refresh whenever the panel is opened, so a favorite toggled elsewhere
  // (e.g. from the Startup List grid) shows up without a full page reload.
  useEffect(() => {
    if (open) loadFavorites();
  }, [open, loadFavorites]);

  if (!user) return null;

  const toggleOpen = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setMenuPos({ right: Math.max(8, window.innerWidth - r.right), top: r.bottom + 8 });
    }
    setOpen((v) => !v);
  };

  return (
    <>
      <button
        ref={btnRef}
        onClick={toggleOpen}
        className="relative flex items-center justify-center w-9 h-9 lg:w-10 lg:h-10 rounded-full
                  glass-inset transition-colors hover:bg-black/[0.06] dark:hover:bg-white/[0.08]"
        aria-label="Favorites"
      >
        <FiBookmark className="h-5 w-5 text-zinc-700 dark:text-zinc-200" />
        {favorites.length > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] font-semibold">
            {favorites.length > 9 ? "9+" : favorites.length}
          </span>
        )}
      </button>

      {open &&
        createPortal(
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div
              className="glass-card fixed z-50 w-80 max-h-[70vh] overflow-y-auto"
              style={{ right: menuPos.right, top: menuPos.top }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-white/10">
                <span className="font-semibold text-sm">Favorites</span>
                <Link
                  to="/startupark/favorites"
                  onClick={() => setOpen(false)}
                  className="text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:underline"
                >
                  View all
                </Link>
              </div>
              <div className="p-2 space-y-1.5">
                {loading ? (
                  <p className="px-2 py-6 text-sm text-center text-zinc-500 dark:text-zinc-400">Loading…</p>
                ) : favorites.length === 0 ? (
                  <p className="px-2 py-6 text-sm text-center text-zinc-500 dark:text-zinc-400">
                    No favorites yet
                  </p>
                ) : (
                  favorites.map((fav) => {
                    const startup = fav.entity || fav;
                    return (
                      <button
                        key={fav._id}
                        onClick={() => {
                          setOpen(false);
                          navigate(`/startupark/startups/${fav.entityId}`);
                        }}
                        className="glass-inset w-full flex items-center gap-3 text-left px-3 py-2.5 transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                      >
                        <img
                          src={getImageUrl(startup?.logo, baseUrl) || DefaultLogo}
                          alt=""
                          className="h-8 w-8 rounded-lg object-contain bg-white dark:bg-zinc-800 p-1 flex-shrink-0"
                          onError={(e) => { e.target.src = DefaultLogo; }}
                        />
                        <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                          {startup?.companyName || "Startup"}
                        </p>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </>,
          document.body
        )}
    </>
  );
};

export default FavoritesBell;
