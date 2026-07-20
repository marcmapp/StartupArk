import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BASE = import.meta.env.VITE_API_BASE_URL;
const R2 = 'https://pub-96dbf4700a544b3b825b262291f6f0a7.r2.dev';

function r2Url(key) {
  if (!key) return null;
  if (key.startsWith('http') || key.startsWith('blob:')) return key;
  return `${R2}/${key}`;
}

const STAGE_STYLES = {
  launched: 'bg-green-900/40 text-green-400 ring-green-800',
  beta:     'bg-blue-900/40 text-blue-400 ring-blue-800',
  scaling:  'bg-amber-900/40 text-amber-400 ring-amber-800',
  concept:  'bg-zinc-800 text-zinc-400 ring-zinc-700',
};
const STAGE_LABEL = { concept: 'Concept', beta: 'Beta', launched: 'Launched', scaling: 'Scaling' };
const PRICING_LABEL = { free: 'Free', freemium: 'Freemium', paid: 'Paid', 'contact-us': 'Contact Us' };

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImg, setActiveImg] = useState(0);

  // Record an outbound CTA click. Fire-and-forget — never blocks navigation.
  const recordClick = () => {
    axios.post(`${BASE}/startupark/api/products/${id}/click`).catch(() => {});
  };

  useEffect(() => {
    axios.get(`${BASE}/startupark/api/products/${id}`)
      .then(res => {
        // Backend returns { product: {...} }
        setProduct(res.data.product || res.data);
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Failed to load product');
        if (err.response?.status === 404) navigate('/products', { replace: true });
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-zinc-700 border-t-zinc-300 animate-spin mx-auto" />
          <p className="text-sm text-zinc-500">Loading product…</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
        <div className="glass-card p-10 text-center max-w-md space-y-4">
          <div className="w-12 h-12 rounded-xl bg-red-900/30 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-zinc-300">{error || 'Product not found'}</p>
          <button onClick={() => navigate(-1)} className="btn-ghost text-sm px-5 py-2">← Go Back</button>
        </div>
      </div>
    );
  }

  // Build images list from gallery field
  const images = (product.gallery?.length > 0
    ? product.gallery
    : product.featuredImage
      ? [{ url: product.featuredImage, type: 'image' }]
      : []
  ).map(img => ({ ...img, url: r2Url(img.url) })).filter(img => img.url);

  const startup = product.startupId;
  const stage = product.stage || 'concept';
  const stageStyle = STAGE_STYLES[stage] || STAGE_STYLES.concept;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Top nav */}
      <div className="border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-10 px-4 md:px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <span className="text-xs text-zinc-600">/</span>
          <span className="text-xs text-zinc-400 truncate">{product.name}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6">

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── Left: Images ───────────────────────────────────── */}
          <div className="space-y-3">
            {/* Main image */}
            <div className="glass-card overflow-hidden aspect-video flex items-center justify-center bg-zinc-900">
              {images.length > 0 ? (
                <img
                  src={images[activeImg]?.url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={e => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div className="flex flex-col items-center gap-3 text-zinc-700">
                  <svg className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm">No images</span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-0.5">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden ring-1 transition-all ${
                      i === activeImg ? 'ring-zinc-300' : 'ring-zinc-800 opacity-50 hover:opacity-80'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Details ─────────────────────────────────── */}
          <div className="space-y-5">
            {/* Name + stage */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ring-1 ${stageStyle}`}>
                  {STAGE_LABEL[stage] || stage}
                </span>
                {product.category && (
                  <span className="text-[10px] text-zinc-500 capitalize">{product.category}</span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-zinc-100 leading-tight">{product.name}</h1>
              {product.shortDescription && (
                <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed">{product.shortDescription}</p>
              )}
            </div>

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {product.tags.map(t => (
                  <span key={t} className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 ring-1 ring-zinc-700">
                    {t}
                  </span>
                ))}
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              {product.website && (
                <a
                  href={product.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={recordClick}
                  className="btn-mono text-sm px-5 py-2 flex items-center gap-2"
                >
                  Visit Website
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
              {product.demoUrl && (
                <a
                  href={product.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={recordClick}
                  className="btn-ghost text-sm px-5 py-2 flex items-center gap-2"
                >
                  Live Demo
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </a>
              )}
            </div>

            {/* Meta grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Category', value: product.category, icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
                { label: 'Stage', value: STAGE_LABEL[product.stage] || product.stage, icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
                { label: 'Pricing', value: PRICING_LABEL[product.pricing] || product.pricing, icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                { label: 'Industry', value: product.industry, icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
              ].map(item => (
                <div key={item.label} className="glass-inset p-3 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-zinc-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                    </svg>
                    <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wide">{item.label}</span>
                  </div>
                  <p className="text-sm font-semibold text-zinc-200 capitalize">
                    {item.value || <span className="text-zinc-600 font-normal">—</span>}
                  </p>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-xs text-zinc-600 pt-1">
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {product.viewCount || 0} views
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
                </svg>
                {product.clickCount || 0} clicks
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="glass-card p-5 space-y-2">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">About</h2>
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">{product.description}</p>
          </div>
        )}

        {/* Startup card */}
        {startup && (
          <div className="glass-card p-5">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-4">Built by</h2>
            <div className="flex items-center gap-4">
              {/* Logo */}
              {startup.logo ? (
                <img
                  src={r2Url(startup.logo)}
                  alt={startup.companyName}
                  className="w-14 h-14 rounded-xl object-cover ring-1 ring-zinc-700 shrink-0"
                  onError={e => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-zinc-800 ring-1 ring-zinc-700 flex items-center justify-center shrink-0 text-lg font-bold text-zinc-400">
                  {startup.companyName?.[0] || 'S'}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-zinc-100 truncate">{startup.companyName || startup.name}</h3>
                {startup.tagline && (
                  <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{startup.tagline}</p>
                )}
                {startup.industry && (
                  <span className="text-[10px] text-zinc-600 mt-1 inline-block capitalize">{startup.industry}</span>
                )}
              </div>

              <Link
                to={`/startupark/startups/${startup._id}`}
                className="btn-ghost text-xs px-3 py-1.5 shrink-0"
              >
                View Profile →
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
