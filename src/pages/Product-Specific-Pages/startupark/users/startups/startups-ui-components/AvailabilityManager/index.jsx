import React, { useState, useEffect } from 'react';
import { FiX, FiLoader, FiAlertCircle, FiCheck } from 'react-icons/fi';
import axios from 'axios';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_FULL = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' };

const AvailabilityManager = ({ isOpen, onClose, startupData, onUpdate }) => {
  const [selectedDays, setSelectedDays] = useState([]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (isOpen && startupData?.availability) {
      const avail = startupData.availability;
      // Days might come back as full names, convert to short
      const shorts = (avail.days || []).map(d => {
        const found = Object.entries(DAY_FULL).find(([, full]) => full.toLowerCase() === d.toLowerCase());
        return found ? found[0] : d.substring(0, 3);
      });
      setSelectedDays(shorts);
      const tr = avail.timeRange;
      if (tr) {
        setStartTime(typeof tr === 'string' ? tr.split('-')[0]?.trim() : (tr.start || '09:00'));
        setEndTime(typeof tr === 'string' ? tr.split('-')[1]?.trim() : (tr.end || '17:00'));
      }
      setTimezone(avail.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
    }
  }, [isOpen, startupData]);

  const toggleDay = (day) => setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);

  const handleSave = async () => {
    if (selectedDays.length === 0) { setError('Select at least one day'); return; }
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      await axios.put(
        `${baseUrl}/startupark/api/profile/startup`,
        { availability: { days: selectedDays.map(d => DAY_FULL[d]), timeRange: { start: startTime, end: endTime }, timezone } },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      onUpdate?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Set Availability</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1">
            <FiX size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-start gap-2">
              <FiAlertCircle className="mt-0.5 flex-shrink-0" size={16} />
              {error}
            </div>
          )}

          {/* Days */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2.5">
              Available Days <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`w-11 h-11 rounded-xl text-sm font-semibold transition-all flex items-center justify-center ${
                    selectedDays.includes(day)
                      ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md'
                      : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {selectedDays.includes(day) && <FiCheck size={14} className="absolute" style={{ opacity: 0.2 }} />}
                  {day}
                </button>
              ))}
            </div>
            {selectedDays.length > 0 && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                {selectedDays.map(d => DAY_FULL[d]).join(', ')}
              </p>
            )}
          </div>

          {/* Time Range */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2.5">
              Time Range <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-3">
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                disabled={loading}
                className="flex-1 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-zinc-400/40 dark:focus:ring-white/20 focus:border-transparent outline-none"
              >
                {hours.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
              <span className="text-gray-400 dark:text-gray-500 text-sm font-medium">to</span>
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                disabled={loading}
                className="flex-1 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-zinc-400/40 dark:focus:ring-white/20 focus:border-transparent outline-none"
              >
                {hours.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2.5">Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-zinc-400/40 dark:focus:ring-white/20 focus:border-transparent outline-none"
            >
              {Intl.supportedValuesOf('timeZone').map(tz => (
                <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-zinc-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || selectedDays.length === 0}
            className="btn-mono px-5 py-2.5 text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <><FiLoader className="animate-spin" size={16} />Saving…</> : 'Save Availability'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityManager;
