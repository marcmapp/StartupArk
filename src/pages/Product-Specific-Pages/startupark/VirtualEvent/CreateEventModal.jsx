import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';

const CreateEventModal = ({ onClose, onSubmit, editingEvent = null }) => {
  const [formData, setFormData] = useState({
    title: editingEvent?.title || '',
    description: editingEvent?.description || '',
    date: editingEvent?.date ? new Date(editingEvent.date).toISOString().split('T')[0] : '',
    time: editingEvent?.date ? new Date(editingEvent.date).toTimeString().split(':').slice(0, 2).join(':') : '',
    duration: editingEvent?.duration || '1 hour',
    maxAttendees: editingEvent?.maxAttendees || 50,
    eventType: editingEvent?.eventType || 'conference',
    invitees: editingEvent?.invitees || [],
    settings: {
      allowRecording: editingEvent?.settings?.allowRecording || false,
      requireRegistration: editingEvent?.settings?.requireRegistration || true,
      enableChat: editingEvent?.settings?.enableChat || true
    }
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.time) newErrors.time = 'Time is required';
    if (!formData.duration) newErrors.duration = 'Duration is required';
    if (formData.maxAttendees < 1) newErrors.maxAttendees = 'Must have at least 1 attendee';
    if (formData.invitees.length === 0) newErrors.invitees = 'Select at least one invitee type';

    // Validate date is not in the past
    const eventDateTime = new Date(`${formData.date}T${formData.time}`);
    if (eventDateTime < new Date()) {
      newErrors.date = 'Event date cannot be in the past';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const eventDateTime = new Date(`${formData.date}T${formData.time}`);

    const submitData = {
      ...formData,
      date: eventDateTime.toISOString()
    };

    onSubmit(submitData);
  };

  const toggleInvitee = (type) => {
    setFormData(prev => ({
      ...prev,
      invitees: prev.invitees.includes(type)
        ? prev.invitees.filter(t => t !== type)
        : [...prev.invitees, type]
    }));
  };

  const handleSettingToggle = (setting) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [setting]: !prev.settings[setting]
      }
    }));
  };

  const checkboxClass = 'h-4 w-4 rounded border-zinc-300 dark:border-white/20 accent-zinc-900 dark:accent-white focus:ring-2 focus:ring-zinc-400/40 dark:focus:ring-white/20';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden border border-zinc-200 dark:border-white/10 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-white/10 flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
            {editingEvent ? 'Edit Event' : 'Create New Event'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors p-2 rounded-full hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
            aria-label="Close modal"
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          {/* Content */}
          <div className="p-6 space-y-4 overflow-y-auto">
            {/* Event Title */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Event Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className={`input-mono ${errors.title ? '!border-red-500' : ''}`}
                placeholder="Enter event title"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1.5">{errors.title}</p>}
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className={`input-mono ${errors.date ? '!border-red-500' : ''}`}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.date && <p className="text-red-500 text-xs mt-1.5">{errors.date}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Time *
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  className={`input-mono ${errors.time ? '!border-red-500' : ''}`}
                />
                {errors.time && <p className="text-red-500 text-xs mt-1.5">{errors.time}</p>}
              </div>
            </div>

            {/* Duration and Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Duration *
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  className={`input-mono appearance-none ${errors.duration ? '!border-red-500' : ''}`}
                >
                  <option value="30 minutes">30 minutes</option>
                  <option value="1 hour">1 hour</option>
                  <option value="1.5 hours">1.5 hours</option>
                  <option value="2 hours">2 hours</option>
                  <option value="3 hours">3 hours</option>
                  <option value="Half day">Half day</option>
                  <option value="Full day">Full day</option>
                </select>
                {errors.duration && <p className="text-red-500 text-xs mt-1.5">{errors.duration}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Event Type
                </label>
                <select
                  value={formData.eventType}
                  onChange={(e) => setFormData({...formData, eventType: e.target.value})}
                  className="input-mono appearance-none"
                >
                  <option value="conference">Conference</option>
                  <option value="networking">Networking</option>
                  <option value="workshop">Workshop</option>
                  <option value="webinar">Webinar</option>
                  <option value="demo">Product Demo</option>
                  <option value="qna">Q&A Session</option>
                </select>
              </div>
            </div>

            {/* Max Attendees */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Maximum Attendees *
              </label>
              <input
                type="number"
                value={formData.maxAttendees}
                onChange={(e) => setFormData({...formData, maxAttendees: parseInt(e.target.value)})}
                className={`input-mono ${errors.maxAttendees ? '!border-red-500' : ''}`}
                min="1"
                max="500"
              />
              {errors.maxAttendees && <p className="text-red-500 text-xs mt-1.5">{errors.maxAttendees}</p>}
            </div>

            {/* Invitees */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Invite User Types *
              </label>
              <div className="glass-inset p-3 space-y-2.5">
                {['startups', 'students', 'users'].map((type) => (
                  <label key={type} className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.invitees.includes(type)}
                      onChange={() => toggleInvitee(type)}
                      className={checkboxClass}
                    />
                    <span className="text-sm text-zinc-700 dark:text-zinc-300 capitalize">{type}</span>
                  </label>
                ))}
              </div>
              {errors.invitees && <p className="text-red-500 text-xs mt-1.5">{errors.invitees}</p>}
            </div>

            {/* Event Settings */}
            <div className="border-t border-zinc-200 dark:border-white/10 pt-4">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">Event Settings</h3>
              <div className="glass-inset p-3 space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">Require Registration</span>
                  <input
                    type="checkbox"
                    checked={formData.settings.requireRegistration}
                    onChange={() => handleSettingToggle('requireRegistration')}
                    className={checkboxClass}
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">Enable Chat</span>
                  <input
                    type="checkbox"
                    checked={formData.settings.enableChat}
                    onChange={() => handleSettingToggle('enableChat')}
                    className={checkboxClass}
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">Allow Recording</span>
                  <input
                    type="checkbox"
                    checked={formData.settings.allowRecording}
                    onChange={() => handleSettingToggle('allowRecording')}
                    className={checkboxClass}
                  />
                </label>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows="4"
                className={`input-mono resize-none ${errors.description ? '!border-red-500' : ''}`}
                placeholder="Describe your event, agenda, and what attendees can expect..."
              />
              {errors.description && <p className="text-red-500 text-xs mt-1.5">{errors.description}</p>}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 border-t border-zinc-200 dark:border-white/10 flex gap-3 flex-shrink-0">
            <button type="submit" className="btn-mono flex-1">
              {editingEvent ? 'Update Event' : 'Create Event'}
            </button>
            <button type="button" onClick={onClose} className="btn-ghost flex-1">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventModal;
