// components/GlobalSearch.jsx — Tier 3 C#9
// Header search input, debounced, categorized results dropdown. Mounted once
// inside Header (like NotificationBell/FavoritesBell) so it's available on
// every role/page. Sits inline in the header's flex row; the results dropdown
// is absolutely positioned relative to this component's own container.
import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Search, X } from "lucide-react";
import { globalSearch } from "../services/search";
import { getImageUrl } from "../utils/imageUrls";

const SECTIONS = [
  { key: "startups", label: "Startups" },
  { key: "products", label: "Products" },
  { key: "talent", label: "Talent" },
  { key: "events", label: "Events" },
  { key: "newsletter", label: "Newsletter" },
];

function ResultRow({ item, onNavigate }) {
  return (
    <Link
      to={item.routePath}
      onClick={onNavigate}
      className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition-colors"
    >
      {item.image ? (
        <img src={getImageUrl(item.image)} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
      ) : (
        <div className="w-8 h-8 rounded-full bg-zinc-800 shrink-0" />
      )}
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-zinc-100 truncate">{item.title}</div>
        {item.subtitle && <div className="text-[11px] text-zinc-500 truncate">{item.subtitle}</div>}
      </div>
    </Link>
  );
}

const GlobalSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const abortRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(() => {
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();
      globalSearch(query, { signal: abortRef.current.signal })
        .then(setResults)
        .catch(err => { if (err.name !== "AbortError") console.error("Global search failed:", err); })
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const closeAndClear = useCallback(() => {
    setOpen(false);
    setQuery("");
    setResults(null);
  }, []);

  const hasResults = results && SECTIONS.some(s => results[s.key]?.length > 0);

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="glass-card flex items-center gap-2 h-9 lg:h-10 w-full px-3 rounded-full">
        <Search className="w-4 h-4 text-zinc-500 shrink-0" strokeWidth={2} />
        <input
          type="text"
          value={query}
          onFocus={() => setOpen(true)}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          placeholder="Search…"
          className="bg-transparent outline-none text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 w-full min-w-0"
        />
        {query && (
          <button onClick={closeAndClear} className="shrink-0 text-zinc-500 hover:text-zinc-200">
            <X className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
        )}
      </div>

      {open && query.trim() && (
        <div className="glass-card absolute top-12 left-0 w-full sm:w-80 max-h-[70vh] overflow-y-auto p-2 shadow-2xl">
          {loading ? (
            <div className="px-3 py-6 text-center text-xs text-zinc-500">Searching…</div>
          ) : !hasResults ? (
            <div className="px-3 py-6 text-center text-xs text-zinc-500">No results for "{query}"</div>
          ) : (
            SECTIONS.map(section => {
              const items = results[section.key];
              if (!items || items.length === 0) return null;
              return (
                <div key={section.key} className="mb-1.5 last:mb-0">
                  <div className="px-3 pt-1.5 pb-1 text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">
                    {section.label}
                  </div>
                  {items.map(item => (
                    <ResultRow key={`${section.key}-${item.id}`} item={item} onNavigate={closeAndClear} />
                  ))}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
