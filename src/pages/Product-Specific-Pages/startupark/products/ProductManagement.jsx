import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AddProductForm from './AddProductForm';
import axios from 'axios';

const BASE = import.meta.env.VITE_API_BASE_URL;
const R2 = 'https://pub-96dbf4700a544b3b825b262291f6f0a7.r2.dev';

function r2Url(key) {
  if (!key) return null;
  if (key.startsWith('http') || key.startsWith('blob:')) return key;
  return `${R2}/${key}`;
}

function authGet() {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
}

const STAGE_STYLES = {
  launched: 'bg-green-900/40 text-green-400 ring-green-800',
  beta:     'bg-blue-900/40 text-blue-400 ring-blue-800',
  scaling:  'bg-amber-900/40 text-amber-400 ring-amber-800',
  concept:  'bg-zinc-800 text-zinc-400 ring-zinc-700',
};
const STAGE_LABEL = { concept: 'Concept', beta: 'Beta', launched: 'Launched', scaling: 'Scaling' };

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [hasStartup, setHasStartup] = useState(false);
  const [startupProfile, setStartupProfile] = useState(null);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => { checkProfile(); }, []);

  async function checkProfile() {
    try {
      const { data } = await axios.get(`${BASE}/startupark/api/profile/startup`, { headers: authGet() });
      if (data?.profile) {
        setHasStartup(true);
        setStartupProfile(data.profile);
        await fetchProducts();
      } else {
        setHasStartup(false);
        setLoading(false);
      }
    } catch (e) {
      setHasStartup(e.response?.status !== 404 ? false : false);
      setLoading(false);
    }
  }

  async function fetchProducts() {
    setLoading(true);
    try {
      const { data } = await axios.get(`${BASE}/startupark/api/products?mine=true`, { headers: authGet() });
      setProducts(data?.products || []);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }

  async function deleteProduct(id) {
    try {
      await axios.delete(`${BASE}/startupark/api/products/${id}`, { headers: authGet() });
      setProducts(prev => prev.filter(p => p._id !== id));
      setDeleteConfirm(null);
    } catch (e) {
      setError('Failed to delete product');
    }
  }

  function handleSuccess(product) {
    setShowForm(false);
    setEditing(null);
    if (!product) return;
    if (editing) {
      setProducts(prev => prev.map(p => p._id === product._id ? product : p));
    } else {
      setProducts(prev => [product, ...prev]);
    }
  }

  function getThumb(product) {
    if (product.featuredImage) return r2Url(product.featuredImage);
    const first = product.gallery?.[0];
    if (first?.url) return r2Url(first.url);
    return null;
  }

  const filtered = search
    ? products.filter(p =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.shortDescription?.toLowerCase().includes(search.toLowerCase()) ||
        p.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
      )
    : products;

  const stats = {
    total: products.length,
    launched: products.filter(p => p.stage === 'launched').length,
    beta: products.filter(p => p.stage === 'beta').length,
    withSite: products.filter(p => p.website).length,
  };

  // ── Loading ──────────────────────────────────────────────────
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

  // ── No startup profile ────────────────────────────────────────
  if (!hasStartup) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
        <div className="glass-card p-10 text-center max-w-md space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto">
            <svg className="w-7 h-7 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold">Startup Profile Required</h2>
            <p className="text-sm text-zinc-500 mt-1">Create a startup profile before adding products.</p>
          </div>
          <Link to="/startupark/startup-edit-profile" className="btn-mono text-sm px-6 py-2.5 inline-block">
            Create Profile
          </Link>
        </div>
      </div>
    );
  }

  // ── Form view ─────────────────────────────────────────────────
  if (showForm) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setShowForm(false); setEditing(null); }}
              className="btn-ghost text-xs px-3 py-1.5"
            >
              ← Back
            </button>
            <span className="text-sm text-zinc-400">{editing ? 'Edit Product' : 'New Product'}</span>
          </div>
          <AddProductForm
            onSuccess={handleSuccess}
            isEdit={!!editing}
            initialData={editing}
            onCancel={() => { setShowForm(false); setEditing(null); }}
          />
        </div>
      </div>
    );
  }

  // ── Main view ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <div className="border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-10 px-4 md:px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold">Product Management</h1>
            {startupProfile && (
              <p className="text-xs text-zinc-500 mt-0.5">
                Portfolio for <span className="text-zinc-300">{startupProfile.companyName || startupProfile.name}</span>
              </p>
            )}
          </div>
          <button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="btn-mono text-sm px-4 py-2 shrink-0"
          >
            + Add Product
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-5 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Products', value: stats.total, icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
            { label: 'Launched', value: stats.launched, icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
            { label: 'In Beta', value: stats.beta, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
            { label: 'With Website', value: stats.withSite, icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9' },
          ].map(stat => (
            <div key={stat.label} className="glass-card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stat.icon} />
                </svg>
              </div>
              <div>
                <p className="text-xl font-bold text-zinc-100">{stat.value}</p>
                <p className="text-xs text-zinc-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="glass-card p-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, description, or tags…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-mono text-sm w-full pl-9 h-10"
            />
          </div>
        </div>

        {error && (
          <div className="glass-inset p-3 text-red-400 text-sm">{error}</div>
        )}

        {/* Delete confirm modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="glass-card p-6 max-w-sm w-full space-y-4">
              <h3 className="font-bold text-zinc-100">Delete Product?</h3>
              <p className="text-sm text-zinc-400">This will soft-delete the product and hide it from users. This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="btn-ghost flex-1 py-2 text-sm">Cancel</button>
                <button
                  onClick={() => deleteProduct(deleteConfirm)}
                  className="flex-1 py-2 text-sm font-semibold rounded-lg bg-red-900/60 text-red-300 ring-1 ring-red-800 hover:bg-red-900"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="glass-inset flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center">
              <svg className="w-7 h-7 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-zinc-300 font-medium">
                {search ? 'No matching products' : 'No products yet'}
              </p>
              <p className="text-xs text-zinc-600 mt-1">
                {search ? 'Try different keywords' : 'Start building your product portfolio'}
              </p>
            </div>
            {!search && (
              <button
                onClick={() => { setEditing(null); setShowForm(true); }}
                className="btn-mono text-sm px-5 py-2"
              >
                + Add First Product
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(product => (
              <ProductCard
                key={product._id}
                product={product}
                thumb={getThumb(product)}
                onEdit={() => { setEditing(product); setShowForm(true); }}
                onDelete={() => setDeleteConfirm(product._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product, thumb, onEdit, onDelete }) {
  const stage = product.stage || 'concept';
  const stageStyle = STAGE_STYLES[stage] || STAGE_STYLES.concept;

  return (
    <div className="glass-card overflow-hidden group flex flex-col hover:ring-zinc-600 transition-all">
      {/* Thumbnail */}
      <div className="relative h-44 bg-zinc-900 overflow-hidden">
        {thumb ? (
          <img
            src={thumb}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={e => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-10 h-10 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Stage badge */}
        <div className="absolute top-3 left-3">
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full ring-1 ${stageStyle}`}>
            {STAGE_LABEL[stage] || stage}
          </span>
        </div>

        {/* Hover actions */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button
            onClick={onEdit}
            className="px-4 py-2 rounded-lg bg-zinc-100 text-zinc-900 text-xs font-semibold hover:bg-white"
          >
            Edit
          </button>
          <Link
            to={`/products/${product._id}`}
            className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-100 text-xs font-semibold hover:bg-zinc-700"
          >
            View
          </Link>
        </div>

        {/* Delete */}
        <button
          onClick={onDelete}
          className="absolute top-3 right-3 p-1.5 rounded-lg bg-red-900/70 text-red-300 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-800"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div>
          <h3 className="font-semibold text-sm text-zinc-100 line-clamp-1">{product.name}</h3>
          <p className="text-xs text-zinc-500 line-clamp-2 mt-0.5 leading-relaxed">{product.shortDescription}</p>
        </div>

        {/* Tags */}
        {product.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.tags.slice(0, 3).map(t => (
              <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 ring-1 ring-zinc-700">
                {t}
              </span>
            ))}
            {product.tags.length > 3 && (
              <span className="text-[10px] text-zinc-600 self-center">+{product.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-zinc-800/60">
          <div className="flex items-center gap-3 text-xs text-zinc-500">
            <span className="capitalize">{product.pricing || 'free'}</span>
            {product.website && (
              <a href={product.website} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-zinc-600">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {product.viewCount || 0}
          </div>
        </div>
      </div>
    </div>
  );
}
