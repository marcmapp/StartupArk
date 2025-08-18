import { FiX, FiClock, FiSave } from 'react-icons/fi';
import React, { useState, useEffect } from 'react';
const AvailabilityModal = ({
  isOpen,
  onClose,
  onSave,
  initialAvailability = [],
  isLoading = false
}) => {
  const [selectedDays, setSelectedDays] = useState([]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');

  useEffect(() => {
    if (initialAvailability.length > 0) {
      const firstSlot = initialAvailability[0];
      setSelectedDays(initialAvailability.map(slot => slot.day));
      setStartTime(firstSlot.startTime);
      setEndTime(firstSlot.endTime);
    } else {
      setSelectedDays([]);
      setStartTime('09:00');
      setEndTime('17:00');
    }
  }, [initialAvailability, isOpen]);

  const toggleDay = (day) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSave = () => {
    if (selectedDays.length === 0) {
      alert('Please select at least one day');
      return;
    }
    onSave(selectedDays.map(day => ({ day, startTime, endTime })));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-bold">Set Availability</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX size={24} />
          </button>
        </div>
        
        <div className="p-4 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Days
            </label>
            <div className="flex flex-wrap gap-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedDays.includes(day)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time
              </label>
              <div className="relative">
                <select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  disabled={isLoading}
                >
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour = i.toString().padStart(2, '0');
                    return [`${hour}:00`, `${hour}:30`];
                  }).flat().map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
                <FiClock className="absolute right-3 top-3 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time
              </label>
              <div className="relative">
                <select
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  disabled={isLoading}
                >
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour = i.toString().padStart(2, '0');
                    return [`${hour}:00`, `${hour}:30`];
                  }).flat().map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
                <FiClock className="absolute right-3 top-3 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : (<> <FiSave /> Save Availability </>)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityModal;