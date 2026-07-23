// components/Header.jsx
// Fixed top app header — replaces the old "free-winged" scattered floating
// widgets (search top-left, notification/favorites bells top-right, theme
// toggle top-right, avatar in the bottom dock) with one consolidated bar.
// The bottom FloatingDock now carries navigation shortcuts only; account
// actions (profile, settings, logout) live here via HeaderAvatar.
import { Link } from "react-router-dom";
import GlobalSearch from "./GlobalSearch";
import NotificationBell from "./NotificationBell";
import FavoritesBell from "./FavoritesBell";
import HeaderAvatar from "./HeaderAvatar";
import Logo from "../assets/MP-white-bg.png";

const ThemeToggleButton = ({ darkMode, toggleTheme }) => (
  <button
    onClick={toggleTheme}
    className="flex items-center justify-center w-9 h-9 lg:w-10 lg:h-10 rounded-full
              glass-inset transition-colors hover:bg-black/[0.06] dark:hover:bg-white/[0.08]"
    aria-label={`Switch to ${darkMode ? "light" : "dark"} mode`}
  >
    {darkMode ? (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-zinc-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    )}
  </button>
);

const Header = ({ user, darkMode, toggleTheme, showProductWidgets }) => {
  return (
    <header className="fixed top-0 inset-x-0 z-50 h-16 flex items-center gap-3 px-4 lg:px-6
                       bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl
                       border-b border-zinc-200 dark:border-white/10">
      <Link to="/dashboard" className="flex items-center gap-2 shrink-0">
        <img src={Logo} alt="StartupArk" className="h-8 w-8 rounded-lg object-contain bg-white" />
      </Link>

      <div className="flex-1 flex justify-center min-w-0 px-2">
        <GlobalSearch />
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {showProductWidgets && <FavoritesBell user={user} />}
        {showProductWidgets && <NotificationBell user={user} />}
        <ThemeToggleButton darkMode={darkMode} toggleTheme={toggleTheme} />
        <HeaderAvatar user={user} />
      </div>
    </header>
  );
};

export default Header;
