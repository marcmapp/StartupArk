import React, { useState, useEffect } from 'react';
import { FiX, FiChevronDown, FiLoader, FiAlertCircle } from 'react-icons/fi';
import axios from 'axios';

const AvailabilityManager = ({ isOpen, onClose, startupData, onUpdate }) => {
  const [selectedDays, setSelectedDays] = useState([]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [availability, setAvailability] = useState({
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const getAuthToken = () => localStorage.getItem('token');

  useEffect(() => {
    if (isOpen && startupData?.availability) {
      const avail = startupData.availability;
      setSelectedDays(avail.days || []);
      if (avail.timeRange) {
        if (typeof avail.timeRange === 'string') {
          const [start, end] = avail.timeRange.split('-');
          setStartTime(start?.trim() || '09:00');
          setEndTime(end?.trim() || '17:00');
        } else {
          setStartTime(avail.timeRange.start || '09:00');
          setEndTime(avail.timeRange.end || '17:00');
        }
      }
      setAvailability(prev => ({
        ...prev,
        timezone: avail.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
      }));
    }
  }, [isOpen, startupData]);

  const toggleDay = (day) => {
    setSelectedDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleSaveAvailability = async () => {
    try {
      setLoading(true);
      setError(null);

      // Convert short day names to full names
      const fullDays = selectedDays.map(day => ({
        'Mon': 'Monday',
        'Tue': 'Tuesday',
        'Wed': 'Wednesday',
        'Thu': 'Thursday',
        'Fri': 'Friday',
        'Sat': 'Saturday',
        'Sun': 'Sunday'
      }[day]));

      // Validate time format
      if (!/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime)) {
        throw new Error("Time must be in HH:MM format");
      }

      const timezone = availability?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

      const availabilityData = {
        days: fullDays,
        timeRange: { start: startTime, end: endTime },
        timezone
      };

      const token = getAuthToken();
      const response = await axios.put(
        `${baseUrl}/smart/api/smart/availability`,
        availabilityData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      onUpdate?.();
      onClose();
    } catch (error) {
      console.error("Save failed:", error);
      setError(
        error.response?.data?.error ||
        error.message ||
        "Failed to save availability"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Set Your Availability</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
              aria-label="Close modal"
            >
              <FiX size={20} />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm flex items-start">
              <FiAlertCircle className="mr-2 mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-5">
            {/* Days Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Days <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${selectedDays.includes(day)
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Range <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <select
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="appearance-none border border-gray-300 rounded-lg px-3 py-2 w-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    disabled={loading}
                  >
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i < 10 ? `0${i}` : i;
                      return (
                        <option key={i} value={`${hour}:00`}>{`${hour}:00`}</option>
                      );
                    })}
                  </select>
                  <FiChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
                </div>
                <span className="text-gray-500">to</span>
                <div className="relative flex-1">
                  <select
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="appearance-none border border-gray-300 rounded-lg px-3 py-2 w-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    disabled={loading}
                  >
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i < 10 ? `0${i}` : i;
                      return (
                        <option key={i} value={`${hour}:00`}>{`${hour}:00`}</option>
                      );
                    })}
                  </select>
                  <FiChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Timezone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timezone <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={availability.timezone}
                  onChange={(e) => setAvailability(prev => ({
                    ...prev,
                    timezone: e.target.value
                  }))}
                  className="appearance-none border border-gray-300 rounded-lg px-3 py-2 w-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  {Intl.supportedValuesOf('timeZone').map(tz => (
                    <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium text-sm"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSaveAvailability}
            className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center justify-center transition-all ${loading || selectedDays.length === 0
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md'
              }`}
            disabled={loading || selectedDays.length === 0}
          >
            {loading ? (
              <>
                <FiLoader className="animate-spin mr-2" />
                Saving...
              </>
            ) : (
              'Save Availability'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityManager;