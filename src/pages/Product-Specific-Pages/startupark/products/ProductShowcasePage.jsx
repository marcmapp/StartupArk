import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const BASE = import.meta.env.VITE_API_BASE_URL;
const R2 = 'https://pub-96dbf4700a544b3b825b262291f6f0a7.r2.dev';

function r2Url(key) {
  if (!key) return null;
  if (key.startsWith('http') || key.startsWith('blob:')) return key;
  return `${R2}/${key}`;
}

function getThumb(product) {
  if (product.gallery?.length > 0) return r2Url(product.gallery[0].url);
  if (product.featuredImage) return r2Url(product.featuredImage);
  return null;
}

const STAGE_STYLES = {
  launched: 'bg-green-900/50 text-green-400 ring-green-800',
  beta:     'bg-blue-900/50 text-blue-400 ring-blue-800',
  scaling:  'bg-amber-900/50 text-amber-400 ring-amber-800',
  concept:  'bg-zinc-800 text-zinc-400 ring-zinc-700',
};
const STAGE_LABELS = { concept: 'Concept', beta: 'Beta', launched: 'Launched', scaling: 'Scaling' };
const PRICING_LABELS = { free: 'Free', freemium: 'Freemium', paid: 'Paid', 'contact-us': 'Contact Us' };

export default function ProductShowcase() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ industry: '', stage: '', tags: [] });
  const [availableTags, setAvailableTags] = useState([]);
  const [availableIndustries, setAvailableIndustries] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    axios.get(`${BASE}/startupark/api/products`)
      .then(res => {
        const all = res.data.products || res.data || [];
        setProducts(all);

        const tagSet = new Set();
        const indSet = new Set();
        all.forEach(p => {
          p.tags?.forEach(t => tagSet.add(t));
          if (p.industry) indSet.add(p.industry);
        });
        setAvailableTags([...tagSet]);
        setAvailableIndustries([...indSet]);
      })
      .catch(err => setError(err.response?.data?.error || 'Failed to load products'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let results = products;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      results = results.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.shortDescription?.toLowerCase().includes(q)
      );
    }
    if (filters.industry) results = results.filter(p => p.industry === filters.industry);
    if (filters.stage) results = results.filter(p => p.stage === filters.stage);
    if (filters.tags.length > 0) {
      results = results.filter(p => p.tags && filters.tags.some(t => p.tags.includes(t)));
    }

    setFilteredProducts(results);
  }, [searchTerm, filters, products]);

  const clearFilters = () => {
    setFilters({ industry: '', stage: '', tags: [] });
    setSearchTerm('');
  };

  const toggleTag = tag =>
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag]
    }));

  const activeFilterCount = [
    filters.industry ? 1 : 0,
    filters.stage ? 1 : 0,
    filters.tags.length
  ].reduce((a, b) => a + b, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-zinc-700 border-t-zinc-300 animate-spin mx-auto" />
          <p className="text-sm text-zinc-500">Loading products…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
        <div className="glass-card p-10 text-center max-w-md space-y-4">
          <div className="w-12 h-12 rounded-xl bg-red-900/30 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-zinc-300">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-mono text-sm px-5 py-2">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6">

        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Product Showcase</h1>
            <p className="text-sm text-zinc-500 mt-0.5">Discover products from across the StartupArk ecosystem</p>
          </div>
          <Link to="/startupark/products/manage" className="btn-ghost text-xs px-4 py-2 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Manage My Products
          </Link>
        </div>

        {/* Search + filter bar */}
        <div className="glass-card p-4 space-y-4">
          <div className="flex gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search products…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="input-mono w-full pl-9 text-sm"
              />
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(v => !v)}
              className={`btn-ghost text-xs px-4 py-2 flex items-center gap-2 ${showFilters ? 'ring-1 ring-zinc-600' : ''}`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-zinc-200 text-zinc-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {(activeFilterCount > 0 || searchTerm) && (
              <button onClick={clearFilters} className="btn-ghost text-xs px-3 py-2 text-zinc-500">
                Clear
              </button>
            )}
          </div>

          {/* Expanded filters */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-zinc-800">
              {/* Industry */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 uppercase tracking-wide font-medium">Industry</label>
                <select
                  value={filters.industry}
                  onChange={e => setFilters(f => ({ ...f, industry: e.target.value }))}
                  className="input-mono w-full text-sm"
                >
                  <option value="">All Industries</option>
                  {availableIndustries.map(ind => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>

              {/* Stage */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 uppercase tracking-wide font-medium">Stage</label>
                <select
                  value={filters.stage}
                  onChange={e => setFilters(f => ({ ...f, stage: e.target.value }))}
                  className="input-mono w-full text-sm"
                >
                  <option value="">All Stages</option>
                  <option value="concept">Concept</option>
                  <option value="beta">Beta</option>
                  <option value="launched">Launched</option>
                  <option value="scaling">Scaling</option>
                </select>
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 uppercase tracking-wide font-medium">Tags</label>
                <div className="flex flex-wrap gap-1.5">
                  {availableTags.slice(0, 8).map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`text-xs px-2.5 py-1 rounded-full ring-1 transition-all ${
                        filters.tags.includes(tag)
                          ? 'bg-zinc-200 text-zinc-900 ring-zinc-400'
                          : 'bg-zinc-900 text-zinc-400 ring-zinc-700 hover:ring-zinc-500'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>
            Showing <span className="text-zinc-300 font-semibold">{filteredProducts.length}</span>
            {filteredProducts.length !== products.length && ` of ${products.length}`} products
          </span>
          <span>Sorted by latest</span>
        </div>

        {/* Product grid */}
        {filteredProducts.length === 0 ? (
          <div className="glass-card py-16 text-center space-y-4">
            <div className="w-14 h-14 rounded-xl bg-zinc-800 flex items-center justify-center mx-auto">
              <svg className="w-7 h-7 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <p className="text-zinc-300 font-medium">No products found</p>
              <p className="text-xs text-zinc-600 mt-1">Try adjusting your search or filters</p>
            </div>
            <button onClick={clearFilters} className="btn-ghost text-xs px-4 py-2">Clear filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

function ProductCard({ product }) {
  const thumb = getThumb(product);
  const startup = product.startupId || product.startup;
  const stage = product.stage || 'concept';
  const stageStyle = STAGE_STYLES[stage] || STAGE_STYLES.concept;
  const [imgErr, setImgErr] = useState(false);

  return (
    <Link
      to={`/products/${product._id}`}
      className="group glass-card overflow-hidden flex flex-col hover:ring-1 hover:ring-zinc-600 transition-all duration-200"
    >
      {/* Image */}
      <div className="relative h-44 bg-zinc-900 overflow-hidden">
        {thumb && !imgErr ? (
          <img
            src={thumb}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgErr(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-10 h-10 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Stage badge */}
        <div className="absolute top-2.5 right-2.5">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ring-1 ${stageStyle}`}>
            {STAGE_LABELS[stage] || stage}
          </span>
        </div>

        {/* Dark gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-transparent to-transparent" />

        {/* Startup badge */}
        {startup && (
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5">
            {startup.logo ? (
              <img
                src={r2Url(startup.logo)}
                alt=""
                className="w-5 h-5 rounded-full ring-1 ring-zinc-700 object-cover"
                onError={e => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-zinc-700 flex items-center justify-center text-[9px] font-bold text-zinc-300 ring-1 ring-zinc-600">
                {(startup.companyName || startup.name)?.[0] || 'S'}
              </div>
            )}
            <span className="text-[10px] text-zinc-300 font-medium">
              {startup.companyName || startup.name}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 space-y-3">
        <div>
          <h3 className="font-semibold text-zinc-100 text-sm leading-tight line-clamp-2 group-hover:text-white transition-colors">
            {product.name}
          </h3>
          {product.shortDescription && (
            <p className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
              {product.shortDescription}
            </p>
          )}
        </div>

        {/* Tags */}
        {product.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.tags.slice(0, 3).map((t, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500 ring-1 ring-zinc-700">
                {t}
              </span>
            ))}
            {product.tags.length > 3 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-600">
                +{product.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Bottom row */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-zinc-800">
          <span className="text-[10px] text-zinc-600 capitalize">{product.industry || product.category}</span>
          {product.pricing && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ring-1 ${
              product.pricing === 'free'
                ? 'bg-emerald-900/40 text-emerald-400 ring-emerald-800'
                : 'bg-zinc-800 text-zinc-400 ring-zinc-700'
            }`}>
              {PRICING_LABELS[product.pricing] || product.pricing}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
