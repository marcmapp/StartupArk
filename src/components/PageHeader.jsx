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
import { deriveRole } from "../hooks/useNavPreferences";

const ALL_ROUTES = [
  ...Object.values(hubItems).flat(),
  ...Object.values(navRegistry).flat(),
  ...globalItems,
];

const HUB_ITEM = globalItems.find((item) => item.id === "hub");

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

// The product's own hub tile (e.g. "StartupArk"), so sub-pages like "My
// Startup" render as MappArks / StartupArk / My Startup instead of dropping
// the product context entirely. Each role has its own dashboard route for a
// given product (see hubItems), so this must resolve against the logged-in
// user's role — same safeRole fallback FloatingDock.tsx uses — or the crumb
// can point a non-startup user at the startup dashboard.
function findProductHubItem(product, role) {
  if (!product) return null;
  const safeRole = role && hubItems[role] ? role : "user";
  const match = hubItems[safeRole]?.find((item) => item.product === product);
  if (match) return match;
  for (const list of Object.values(hubItems)) {
    const fallback = list.find((item) => item.product === product);
    if (fallback) return fallback;
  }
  return null;
}

const PageHeader = ({ user }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const isHub = pathname === "/dashboard";
  if (isHub) return null;

  const section = findSection(pathname);
  const onSectionRoot = section && (pathname === section.route);

  // Only show the product crumb when it's distinct from the resolved section
  // (i.e. we're on a sub-page, not the product's own dashboard root).
  const role = deriveRole(user);
  const productHubItem = section && findProductHubItem(section.product, role);
  const showProductCrumb = productHubItem && productHubItem.route !== section.route;

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
          <Link to={HUB_ITEM.route} className="hover:text-zinc-900 dark:hover:text-white transition-colors flex-shrink-0">
            {HUB_ITEM.label}
          </Link>
          {showProductCrumb && (
            <>
              <span className="opacity-50 flex-shrink-0">/</span>
              <Link to={productHubItem.route} className="hover:text-zinc-900 dark:hover:text-white transition-colors flex-shrink-0">
                {productHubItem.label}
              </Link>
            </>
          )}
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
