import React, { useState, useRef } from 'react';
import axios from 'axios';

const BASE = import.meta.env.VITE_API_BASE_URL;
const R2 = 'https://pub-96dbf4700a544b3b825b262291f6f0a7.r2.dev';

const STAGES = [
  { v: 'concept', label: 'Concept' },
  { v: 'beta', label: 'Beta' },
  { v: 'launched', label: 'Launched' },
  { v: 'scaling', label: 'Scaling' },
];
const PRICINGS = [
  { v: 'free', label: 'Free' },
  { v: 'freemium', label: 'Freemium' },
  { v: 'paid', label: 'Paid' },
  { v: 'contact-us', label: 'Contact Us' },
];

function r2Url(key) {
  if (!key) return null;
  if (key.startsWith('http') || key.startsWith('blob:')) return key;
  return `${R2}/${key}`;
}

function authHeaders() {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

const SEL = 'input-mono text-sm w-full [&>option]:bg-zinc-900 [&>option]:text-zinc-100';

export default function AddProductForm({ onSuccess, isEdit, initialData, onCancel }) {
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(() => {
    const d = {
      name: '', shortDescription: '', description: '',
      category: '', stage: 'concept', pricing: 'free',
      website: '', demoUrl: '', tags: [],
      images: [],
    };
    if (!initialData) return d;
    return {
      ...d,
      name: initialData.name || '',
      shortDescription: initialData.shortDescription || '',
      description: initialData.description || '',
      category: initialData.category || '',
      stage: initialData.stage || 'concept',
      pricing: initialData.pricing || 'free',
      website: initialData.website || '',
      demoUrl: initialData.demoUrl || '',
      tags: initialData.tags || [],
      images: (initialData.gallery || []).map(img => ({
        url: img.url,
        type: img.type || 'image',
        caption: img.caption || '',
        order: img.order || 0,
        isFeatured: initialData.featuredImage === img.url,
        isNew: false,
      })),
    };
  });

  const [newTag, setNewTag] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  function setField(key, val) {
    setForm(f => ({ ...f, [key]: val }));
  }

  // ── Images ────────────────────────────────────────────────────
  function handleFiles(files) {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxMB = 10 * 1024 * 1024;
    const valid = [];
    for (const f of files) {
      if (f.size > maxMB) { setError(`${f.name}: max 10 MB`); continue; }
      if (!allowed.includes(f.type)) { setError(`${f.name}: unsupported type`); continue; }
      valid.push(f);
    }
    if (!valid.length) return;
    setError(null);
    const newImgs = valid.map((f, i) => ({
      url: URL.createObjectURL(f),
      type: 'image',
      caption: '',
      order: form.images.length + i,
      isFeatured: form.images.length === 0 && i === 0,
      isNew: true,
      file: f,
    }));
    setForm(prev => ({ ...prev, images: [...prev.images, ...newImgs] }));
  }

  function removeImage(idx) {
    setForm(prev => {
      const imgs = prev.images.filter((_, i) => i !== idx);
      if (imgs.length > 0 && !imgs.some(im => im.isFeatured)) {
        imgs[0].isFeatured = true;
      }
      return { ...prev, images: imgs };
    });
  }

  function setFeatured(idx) {
    setForm(prev => ({
      ...prev,
      images: prev.images.map((img, i) => ({ ...img, isFeatured: i === idx })),
    }));
  }

  function updateCaption(idx, caption) {
    setForm(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === idx ? { ...img, caption } : img),
    }));
  }

  // ── Tags ──────────────────────────────────────────────────────
  function addTag() {
    const t = newTag.trim();
    if (t && !form.tags.includes(t)) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, t] }));
    }
    setNewTag('');
  }

  function removeTag(t) {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(x => x !== t) }));
  }

  // ── Submit ────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Product name is required'); return; }
    if (!form.shortDescription.trim()) { setError('Short description is required'); return; }
    if (!form.description.trim()) { setError('Description is required'); return; }
    if (!form.category.trim()) { setError('Category is required'); return; }

    setSubmitting(true);
    setError(null);
    setUploadProgress(0);

    try {
      const hdrs = authHeaders();

      // Phase 1 — save text data
      const textPayload = {
        name: form.name.trim(),
        shortDescription: form.shortDescription.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        stage: form.stage,
        pricing: form.pricing,
        tags: form.tags.filter(Boolean),
        website: form.website.trim() || undefined,
        demoUrl: form.demoUrl.trim() || undefined,
      };

      let productId;
      if (isEdit) {
        const { data } = await axios.put(`${BASE}/startupark/api/products/${initialData._id}`, textPayload, { headers: hdrs });
        productId = initialData._id;
      } else {
        const { data } = await axios.post(`${BASE}/startupark/api/products`, textPayload, { headers: hdrs });
        productId = data.product._id;
      }

      setUploadProgress(20);

      // Phase 2 — upload new image files via presigned URLs
      const gallery = [];

      // Carry over existing (already-uploaded) images
      form.images
        .filter(img => !img.isNew && img.url)
        .forEach((img, i) => {
          gallery.push({ url: img.url, type: img.type || 'image', caption: img.caption || '', order: i });
        });

      const newFiles = form.images.filter(img => img.isNew && img.file);
      for (let i = 0; i < newFiles.length; i++) {
        const img = newFiles[i];
        const isFeat = img.isFeatured || (gallery.length === 0 && i === 0);

        const { data: meta } = await axios.post(
          `${BASE}/startupark/api/products/${productId}/upload`,
          { filename: img.file.name, contentType: img.file.type, kind: isFeat ? 'featured' : 'gallery' },
          { headers: hdrs }
        );

        await fetch(meta.uploadUrl, {
          method: 'PUT',
          body: img.file,
          headers: { 'Content-Type': img.file.type },
        });

        gallery.push({ url: meta.key, type: 'image', caption: img.caption || '', order: gallery.length });
        setUploadProgress(20 + Math.round(((i + 1) / newFiles.length) * 60));
      }

      // Phase 3 — update product with gallery array
      if (gallery.length > 0) {
        await axios.put(
          `${BASE}/startupark/api/products/${productId}`,
          { gallery, featuredImage: gallery[0].url },
          { headers: hdrs }
        );
      }

      setUploadProgress(100);

      // Fetch final product and return to parent
      const { data: final } = await axios.get(`${BASE}/startupark/api/products/${productId}`, { headers: { Authorization: hdrs.Authorization } });
      onSuccess(final.product);

    } catch (err) {
      console.error('Product save error', err);
      setError(err.response?.data?.error || err.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  }

  return (
    <div className="glass-card p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-zinc-100">{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Fill in the details for your product listing</p>
        </div>
        <button type="button" onClick={onCancel} className="btn-ghost text-xs px-3 py-1.5">Cancel</button>
      </div>

      {error && (
        <div className="glass-inset p-3 text-red-400 text-sm flex items-start gap-2">
          <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Name + Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Product Name *</label>
            <input
              type="text"
              placeholder="My Awesome Product"
              value={form.name}
              onChange={e => setField('name', e.target.value)}
              className="input-mono text-sm w-full"
              maxLength={100}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Category *</label>
            <input
              type="text"
              placeholder="e.g. SaaS, Mobile App, API"
              value={form.category}
              onChange={e => setField('category', e.target.value)}
              className="input-mono text-sm w-full"
              required
            />
          </div>
        </div>

        {/* Short Description */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Short Description *</label>
          <input
            type="text"
            placeholder="One-liner that hooks users (max 160 chars)"
            value={form.shortDescription}
            onChange={e => setField('shortDescription', e.target.value)}
            className="input-mono text-sm w-full"
            maxLength={160}
            required
          />
          <p className="text-[10px] text-zinc-600 text-right">{form.shortDescription.length}/160</p>
        </div>

        {/* Full Description */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Full Description *</label>
          <textarea
            rows={4}
            placeholder="Detailed description — features, problem it solves, target audience…"
            value={form.description}
            onChange={e => setField('description', e.target.value)}
            className="input-mono text-sm w-full resize-none"
            required
          />
        </div>

        {/* Stage + Pricing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Stage</label>
            <div className="grid grid-cols-2 gap-2">
              {STAGES.map(s => (
                <button
                  key={s.v}
                  type="button"
                  onClick={() => setField('stage', s.v)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium ring-1 transition-all ${
                    form.stage === s.v
                      ? 'ring-zinc-400 bg-zinc-700 text-zinc-100'
                      : 'ring-zinc-800 bg-zinc-900 text-zinc-500 hover:ring-zinc-600 hover:text-zinc-300'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Pricing</label>
            <div className="grid grid-cols-2 gap-2">
              {PRICINGS.map(p => (
                <button
                  key={p.v}
                  type="button"
                  onClick={() => setField('pricing', p.v)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium ring-1 transition-all ${
                    form.pricing === p.v
                      ? 'ring-zinc-400 bg-zinc-700 text-zinc-100'
                      : 'ring-zinc-800 bg-zinc-900 text-zinc-500 hover:ring-zinc-600 hover:text-zinc-300'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Website + Demo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Website</label>
            <input
              type="url"
              placeholder="https://yourproduct.com"
              value={form.website}
              onChange={e => setField('website', e.target.value)}
              className="input-mono text-sm w-full"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Demo URL</label>
            <input
              type="url"
              placeholder="https://demo.yourproduct.com"
              value={form.demoUrl}
              onChange={e => setField('demoUrl', e.target.value)}
              className="input-mono text-sm w-full"
            />
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Tags</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add tag, press Enter"
              value={newTag}
              onChange={e => setNewTag(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
              className="input-mono text-sm flex-1"
            />
            <button type="button" onClick={addTag} className="btn-ghost text-xs px-3">Add</button>
          </div>
          {form.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {form.tags.map(t => (
                <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-xs ring-1 ring-zinc-700">
                  {t}
                  <button type="button" onClick={() => removeTag(t)} className="text-zinc-500 hover:text-zinc-300">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Images */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Product Images</label>

          {/* Drop zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="glass-inset rounded-xl p-6 text-center cursor-pointer hover:ring-zinc-500 ring-1 ring-zinc-800 transition-all"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => handleFiles(Array.from(e.target.files))}
            />
            <svg className="mx-auto w-8 h-8 text-zinc-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-zinc-400">Click to upload images</p>
            <p className="text-xs text-zinc-600 mt-1">JPG, PNG, GIF, WEBP — max 10 MB each</p>
          </div>

          {/* Image grid */}
          {form.images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {form.images.map((img, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden ring-1 ring-zinc-800 bg-zinc-900">
                  <img
                    src={r2Url(img.url) || '/default-product.png'}
                    alt={`img-${idx}`}
                    className="w-full h-28 object-cover"
                    onError={e => { e.target.src = '/default-product.png'; e.target.onerror = null; }}
                  />

                  {/* Badges */}
                  <div className="absolute top-1.5 left-1.5 flex gap-1">
                    {img.isFeatured && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-zinc-900/90 text-zinc-300 ring-1 ring-zinc-600">
                        Featured
                      </span>
                    )}
                    {img.isNew && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-zinc-800/90 text-zinc-400">
                        New
                      </span>
                    )}
                  </div>

                  {/* Overlay actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {!img.isFeatured && (
                      <button
                        type="button"
                        onClick={() => setFeatured(idx)}
                        className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700"
                        title="Set as featured"
                      >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="p-1.5 rounded-lg bg-red-900/80 text-red-300 hover:bg-red-800"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Caption */}
                  <div className="p-1.5 border-t border-zinc-800">
                    <input
                      type="text"
                      placeholder="Caption…"
                      value={img.caption}
                      onChange={e => updateCaption(idx, e.target.value)}
                      className="w-full text-[10px] bg-transparent text-zinc-400 placeholder-zinc-600 focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upload progress */}
        {submitting && uploadProgress > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-zinc-500">
              <span>{uploadProgress < 20 ? 'Saving…' : uploadProgress < 90 ? 'Uploading images…' : 'Finalising…'}</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-zinc-800">
              <div
                className="h-1.5 rounded-full bg-zinc-300 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onCancel} className="btn-ghost flex-1 py-2.5 text-sm">
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn-mono flex-1 py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            {submitting ? 'Saving…' : isEdit ? 'Update Product' : 'Add Product'}
          </button>
        </div>

      </form>
    </div>
  );
}
