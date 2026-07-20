// components/PageHeader.jsx
// Back button + breadcrumb, mounted once in LayoutWrapper so every page under
// the unified dock gets in-app navigation without a sidebar.
//
// Breadcrumb labels are resolved from the same navRegistry/hubItems/globalItems
// the dock itself reads — never hand-authored per page, so they can't drift out
// of sync with the real nav labels. If the current path doesn't match any
// registered route (e.g. a deep detail page), only the Back button renders —
// no guessed breadcrumb label.
import { Link, useLocation, useNavigate } from "react-router-dom";
import { hubItems, navRegistry, globalItems } from "../Jsons/NavItems/navRegistry";

const ALL_ROUTES = [
  ...Object.values(hubItems).flat(),
  ...Object.values(navRegistry).flat(),
  ...globalItems,
];

// Longest-prefix match so nested/detail routes (e.g. a startup profile page
// reached from "Browse Startups") still resolve to their parent section.
function findSection(pathname) {
  let best = null;
  for (const item of ALL_ROUTES) {
    if (pathname === item.route || pathname.startsWith(item.route + "/")) {
      if (!best || item.route.length > best.route.length) best = item;
    }
  }
  return best;
}

const PageHeader = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const isHub = pathname === "/dashboard";
  if (isHub) return null;

  const section = findSection(pathname);
  const onSectionRoot = section && (pathname === section.route);

  return (
    <div className="flex items-center gap-3 mb-4 flex-wrap">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium glass-inset text-zinc-700 dark:text-zinc-300 hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition-colors flex-shrink-0"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      {section && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 min-w-0">
          <Link to="/dashboard" className="hover:text-zinc-900 dark:hover:text-white transition-colors flex-shrink-0">
            Hub
          </Link>
          <span className="opacity-50 flex-shrink-0">/</span>
          {onSectionRoot ? (
            <span className="text-zinc-900 dark:text-white font-medium truncate">{section.label}</span>
          ) : (
            <Link to={section.route} className="hover:text-zinc-900 dark:hover:text-white transition-colors truncate">
              {section.label}
            </Link>
          )}
        </nav>
      )}
    </div>
  );
};

export default PageHeader;
