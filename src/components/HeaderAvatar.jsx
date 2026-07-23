// components/HeaderAvatar.jsx
// User avatar + account menu, now living in the fixed top Header instead of
// the bottom floating dock. Same menu contents/behavior as the old dock
// AvatarDockIcon (ui/floating-dock.tsx) — just re-anchored, no magnify spring.
import { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { getImageUrl } from "../utils/imageUrls";

const HeaderAvatar = ({ user }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ right: 0, top: 0 });
  const btnRef = useRef(null);
  const navigate = useNavigate();

  const avatarUrl =
    user?.profilePicture || user?.profileImage
      ? getImageUrl(user.profilePicture || user.profileImage, "")
      : null;

  const initials = (() => {
    const u = user?.username;
    if (!u || typeof u !== "string") return "?";
    const parts = u.trim().split(" ");
    return parts.length === 1
      ? (parts[0][0]?.toUpperCase() ?? "?")
      : (parts[0][0]?.toUpperCase() ?? "") + (parts[1][0]?.toUpperCase() ?? "");
  })();

  const openMenu = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setMenuPos({ right: Math.max(8, window.innerWidth - r.right), top: r.bottom + 8 });
    }
    setMenuOpen(true);
  };

  const handleLogout = () => {
    setMenuOpen(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  if (!user) return null;

  return (
    <div data-tour="header-avatar">
      <button
        ref={btnRef}
        onClick={openMenu}
        aria-label="Account menu"
        className="relative flex h-9 w-9 lg:h-10 lg:w-10 flex-shrink-0 cursor-pointer items-center justify-center rounded-full overflow-hidden bg-zinc-900 dark:bg-white transition-transform hover:scale-105"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={user?.username} className="h-full w-full object-cover" />
        ) : (
          <span className="text-white dark:text-zinc-900 font-bold text-sm leading-none select-none">
            {initials}
          </span>
        )}
      </button>

      {menuOpen &&
        createPortal(
          <>
            <div className="fixed inset-0 z-[150]" onClick={() => setMenuOpen(false)} />
            <div
              className="fixed z-[160] w-56 rounded-xl border border-gray-100 bg-white shadow-2xl dark:border-white/10 dark:bg-zinc-900"
              style={{ right: menuPos.right, top: menuPos.top }}
            >
              <div className="border-b border-gray-100 px-3 py-2.5 dark:border-white/10">
                <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                  {user?.username}
                </p>
                <p className="truncate text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
              </div>
              <div className="p-1.5">
                {[
                  { label: "Hub",           route: "/dashboard" },
                  { label: "My Profile",    route: "/profile"   },
                  { label: "Settings",      route: "/settings"  },
                  { label: "Subscription",  route: "/pricing"   },
                ].map(({ label, route }) => (
                  <button
                    key={route}
                    onClick={() => { setMenuOpen(false); navigate(route); }}
                    className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/[0.05]"
                  >
                    {label}
                  </button>
                ))}
                <div className="my-1 border-t border-gray-100 dark:border-white/10" />
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  Log out
                </button>
              </div>
            </div>
          </>,
          document.body,
        )}
    </div>
  );
};

export default HeaderAvatar;
