import React, { useState, useRef } from 'react';
import axios from 'axios';

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

export default function RoleApplyForm({ post, position, onSubmit, onClose, loading }) {
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeKey, setResumeKey] = useState('');
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState('');
  const fileInputRef = useRef(null);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token');

  async function handleResumeUpload(file) {
    try {
      setUploading(true);
      setErr('');

      const urlResponse = await axios.post(
        `${baseUrl}/startupark/api/student/upload`,
        { field: 'resume', filename: file.name, contentType: file.type },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { uploadUrl: url, key } = urlResponse.data;

      await axios.put(url, file, {
        headers: { 'Content-Type': file.type }
      });

      setResumeKey(key);
    } catch (e) {
      setErr(e.response?.data?.error || 'Failed to upload resume');
      setResumeFile(null);
    } finally {
      setUploading(false);
    }
  }

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setErr('Please upload a PDF or Word document');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErr('File size should be less than 5MB');
      return;
    }

    setResumeFile(file);
    setErr('');
    handleResumeUpload(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setErr('Please upload a PDF or Word document');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErr('File size should be less than 5MB');
      return;
    }
    setResumeFile(file);
    setErr('');
    handleResumeUpload(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!coverLetter.trim()) { setErr('Cover letter is required'); return; }
    if (!resumeKey) { setErr('Please upload your resume'); return; }
    if (uploading) { setErr('Resume upload still in progress'); return; }

    try {
      await onSubmit({ coverLetter: coverLetter.trim(), resume: resumeKey, positionId: position?._id });
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="glass-card w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-zinc-800/60">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              {position ? `Apply for: ${position.title}` : 'Apply Now'}
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{post.title}</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 text-lg leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">
              Cover Letter <span className="text-zinc-600">(required)</span>
            </label>
            <textarea
              value={coverLetter}
              onChange={e => { setCoverLetter(e.target.value); if (err) setErr(''); }}
              rows={5}
              maxLength={3000}
              placeholder="Tell us why you're a great fit for this role…"
              className="w-full bg-zinc-900 border border-zinc-700/60 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 resize-none"
            />
            <div className="text-right text-[10px] text-zinc-600 mt-1">{coverLetter.length}/3000</div>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">
              Resume <span className="text-zinc-600">(PDF or Word, max 5MB)</span>
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
              className="border border-dashed border-zinc-700/60 rounded-lg px-4 py-6 text-center cursor-pointer hover:border-zinc-500 transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
              />
              {uploading ? (
                <p className="text-xs text-zinc-400">Uploading…</p>
              ) : resumeFile && resumeKey ? (
                <p className="text-xs text-green-400">✓ {resumeFile.name}</p>
              ) : (
                <p className="text-xs text-zinc-500">Click or drag your resume here</p>
              )}
            </div>
          </div>

          {err && (
            <p className="text-xs text-red-400 bg-red-950/30 border border-red-800/40 rounded-lg px-3 py-2">{err}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-xs font-medium rounded-lg ring-1 ring-zinc-700 text-zinc-400 hover:ring-zinc-500 hover:text-zinc-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="flex-1 py-2 text-xs font-medium btn-mono rounded-lg disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
