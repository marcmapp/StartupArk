import { useState, useEffect } from 'react';
import { FiClock, FiCalendar, FiX, FiCheck, FiChevronDown, FiUsers } from 'react-icons/fi';
import { MEETING_PURPOSES } from '../../../../services/bookingRatings';

// Instant meeting creation — scoped to existing chat conversations only (no
// cold-inviting a stranger). Mirrors BookingModal's form pattern, minus the
// startup-availability constraints, which don't apply to a 1:1 instant meeting.
const NewEventModal = ({ isOpen, onClose, onSuccess }) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(30);
  const [meetingPurpose, setMeetingPurpose] = useState('');
  const [purpose, setPurpose] = useState('');
  const [purposeOther, setPurposeOther] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      resetForm();
      fetchContacts();
    }
  }, [isOpen]);

  const resetForm = () => {
    setSelectedContactId('');
    setSelectedDate('');
    setSelectedTime('');
    setDuration(30);
    setMeetingPurpose('');
    setPurpose('');
    setPurposeOther('');
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const fetchContacts = async () => {
    setContactsLoading(true);
    try {
      const response = await fetch(`${baseUrl}/startupark/api/bookings/instant/contacts`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setContacts(data.contacts || []);
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
      setContacts([]);
    } finally {
      setContactsLoading(false);
    }
  };

  const isPurposeValid = purpose && (purpose !== 'other' || purposeOther.trim());
  const canSubmit = selectedContactId && selectedDate && selectedTime && meetingPurpose.trim() && isPurposeValid;

  const handleSubmit = async () => {
    if (!selectedContactId) return setSubmitError('Please select who you want to meet with');
    if (!selectedDate || !selectedTime) return setSubmitError('Please select both date and time');
    if (!meetingPurpose.trim()) return setSubmitError('Please provide a meeting purpose');
    if (!purpose) return setSubmitError('Please select the purpose of this meeting');
    if (purpose === 'other' && !purposeOther.trim()) return setSubmitError('Please specify the purpose of this meeting');

    try {
      setSubmitLoading(true);
      setSubmitError(null);

      const response = await fetch(`${baseUrl}/startupark/api/bookings/instant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          recipientId: selectedContactId,
          date: selectedDate,
          time: selectedTime,
          duration,
          meetingPurpose: meetingPurpose.trim(),
          purpose,
          ...(purpose === 'other' ? { purposeOther: purposeOther.trim() } : {})
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to schedule meeting');
      }

      setSubmitSuccess(true);
      if (onSuccess) onSuccess();
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 dark:border-zinc-700/60">
        {/* Header */}
        <div className="bg-white dark:bg-zinc-900 p-6 text-gray-900 dark:text-white border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {submitSuccess ? '🎉 Meeting Scheduled!' : 'New Instant Meeting'}
              </h2>
              <p className="mt-1 text-gray-600 dark:text-gray-400 text-sm">
                {submitSuccess
                  ? 'Your meeting has been confirmed and added to both calendars.'
                  : 'Schedule an auto-confirmed meeting with an existing conversation partner'}
              </p>
            </div>
            {!submitSuccess && (
              <button
                onClick={handleClose}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/[0.06]"
                aria-label="Close modal"
              >
                <FiX size={24} />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {submitError && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl text-red-700 dark:text-red-300 flex items-start">
              <div className="bg-red-100 p-2 rounded-lg mr-3">
                <FiClock className="text-red-600" />
              </div>
              <div>
                <p className="font-medium">Scheduling Error</p>
                <p className="text-sm mt-1">{submitError}</p>
              </div>
            </div>
          )}

          {submitSuccess ? (
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-6">
                <FiCheck className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
                Meeting Confirmed
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400">
                {selectedDate} at {selectedTime}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Contact Picker */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Meet with <span className="text-red-500">*</span>
                </label>
                {contactsLoading ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 py-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-zinc-900 dark:border-white" />
                    Loading conversations...
                  </div>
                ) : contacts.length === 0 ? (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl text-sm text-gray-500 dark:text-gray-400">
                    <FiUsers size={18} />
                    You don't have any conversations yet. Start a chat first to schedule an instant meeting.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {contacts.map(contact => {
                      const isSelected = selectedContactId === contact.userId;
                      return (
                        <button
                          key={contact.userId}
                          type="button"
                          disabled={!contact.eligible}
                          title={contact.reason || undefined}
                          onClick={() => setSelectedContactId(contact.userId)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                            !contact.eligible
                              ? 'opacity-50 cursor-not-allowed border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50'
                              : isSelected
                                ? 'border-zinc-900 dark:border-white bg-black/[0.04] dark:bg-white/[0.08]'
                                : 'border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800'
                          }`}
                        >
                          {contact.profilePicture ? (
                            <img src={contact.profilePicture} alt={contact.username} className="h-9 w-9 rounded-full object-cover" />
                          ) : (
                            <div className="h-9 w-9 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                              {contact.username?.[0]?.toUpperCase() || '?'}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white truncate">{contact.username}</p>
                            {!contact.eligible && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{contact.reason}</p>
                            )}
                          </div>
                          {isSelected && <FiCheck className="text-zinc-900 dark:text-white flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Meeting Purpose (free text) */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Meeting Purpose <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={meetingPurpose}
                  onChange={(e) => setMeetingPurpose(e.target.value)}
                  placeholder="Briefly describe what you'd like to discuss..."
                  rows={3}
                  className="input-mono resize-none"
                />
              </div>

              {/* Purpose (structured) */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Purpose of this meeting <span className="text-red-500">*</span>
                </label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="input-mono appearance-none"
                >
                  <option value="">Select a purpose…</option>
                  {MEETING_PURPOSES.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>

                {purpose === 'other' && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Please specify <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={purposeOther}
                      onChange={(e) => setPurposeOther(e.target.value.slice(0, 200))}
                      maxLength={200}
                      placeholder="Briefly describe the purpose"
                      className="input-mono"
                    />
                    <p className="text-xs text-gray-500 mt-1 text-right">{purposeOther.length}/200</p>
                  </div>
                )}
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Select Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="input-mono pl-12"
                  />
                </div>
              </div>

              {/* Time + Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Select Time <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiClock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                    <input
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="input-mono pl-12"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Duration
                  </label>
                  <div className="relative">
                    <select
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="input-mono pr-10 appearance-none"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={45}>45 minutes</option>
                      <option value={60}>60 minutes</option>
                    </select>
                    <FiChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!submitSuccess ? (
          <div className="bg-gray-50 dark:bg-zinc-800/50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200 dark:border-zinc-700">
            <button
              onClick={handleClose}
              className="px-6 py-3 border border-gray-300 dark:border-zinc-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-all font-medium text-sm disabled:opacity-50"
              disabled={submitLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitLoading || !canSubmit}
              className={`px-6 py-3 rounded-xl font-medium text-sm flex items-center justify-center transition-all ${
                submitLoading || !canSubmit
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-md'
              }`}
            >
              {submitLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Scheduling...
                </>
              ) : (
                'Schedule Meeting'
              )}
            </button>
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-zinc-800/50 px-6 py-4 flex justify-end border-t border-gray-200 dark:border-zinc-700">
            <button
              onClick={handleClose}
              className="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-xl font-medium text-sm transition-all"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewEventModal;
