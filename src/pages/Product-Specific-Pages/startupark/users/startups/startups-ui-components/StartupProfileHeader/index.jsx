import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEdit2, FiCalendar, FiClock, FiMessageCircle, FiCheckCircle, FiLoader } from 'react-icons/fi';
import { formatAvailability } from '../../shared/utils/startupDataFormatter';
import axios from 'axios';
import BookingModal from '../../../../bookings/BookingModal';
import FollowButton from '../../../../../../../components/FollowButton';
import TrustBadge from '../../../../../../../components/TrustBadge';

const baseUrl = import.meta.env.VITE_API_BASE_URL;

const StartupProfileHeader = ({ startupData, onEdit, onEditAvailability, isPublicView = false }) => {
  const navigate = useNavigate();
  const [chatLoading, setChatLoading] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [activeBooking, setActiveBooking] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  const companyName = startupData.companyName || startupData.startupName || 'Unnamed Startup';
  const hasAvailability = startupData?.availability?.days?.length > 0;

  // Fetch the caller's active booking with this startup (public view only).
  const fetchBookingStatus = useCallback(async () => {
    if (!isPublicView || !startupData?._id) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    setStatusLoading(true);
    try {
      const res = await axios.get(`${baseUrl}/startupark/api/bookings/status/${startupData._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setActiveBooking(res.data?.booking || null);
    } catch {
      setActiveBooking(null);
    } finally {
      setStatusLoading(false);
    }
  }, [isPublicView, startupData?._id]);

  useEffect(() => { fetchBookingStatus(); }, [fetchBookingStatus]);

  const handleLogoError = (e) => { e.target.onerror = null; e.target.className = 'hidden'; };

  const handleChat = async () => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    setChatLoading(true);
    try {
      // Backend resolves the recipient from the startup id (contextId).
      await axios.post(
        `${baseUrl}/startupark/api/chat/initiate`,
        { recipientId: startupData.userId?._id || startupData.userId, contextType: 'startup', contextId: startupData._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (e) {
      console.warn('initiate failed, navigating anyway', e?.response?.status);
    } finally {
      setChatLoading(false);
      navigate(`/startupark/chat/${startupData._id}`);
    }
  };

  const fmtDate = (d) => { try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); } catch { return ''; } };

  const statusStyles = {
    pending:   'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50',
    confirmed: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50',
  };

  return (
    <>
      <div className="glass-card overflow-hidden mb-6 sm:mb-10">
        <div className="p-5 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            {/* Left: Logo + Info */}
            <div className="flex items-start space-x-4 sm:space-x-5">
              {startupData.logo ? (
                <img
                  src={startupData.logo}
                  alt={`${companyName} logo`}
                  className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl object-cover border border-black/10 dark:border-white/15 shadow-sm flex-shrink-0"
                  onError={handleLogoError}
                  loading="lazy"
                />
              ) : (
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl bg-zinc-900 dark:bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                  <span className="text-2xl sm:text-3xl font-bold text-white dark:text-zinc-900">
                    {companyName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white truncate">{companyName}</h1>
                  <TrustBadge userId={startupData.userId?._id || startupData.userId} />
                </div>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm sm:text-base line-clamp-2">
                  {startupData.tagline || 'Building the future'}
                </p>

                {/* Availability — mono pill with a live (emerald) status dot */}
                {hasAvailability ? (
                  <div className="flex items-center mt-2">
                    <div className="inline-flex items-center glass-inset rounded-full px-3 py-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-2" />
                      <FiClock className="text-zinc-500 dark:text-zinc-400 mr-1.5 flex-shrink-0" size={13} />
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-200 truncate max-w-xs">
                        {formatAvailability(startupData.availability)}
                      </span>
                      {!isPublicView && (
                        <button onClick={onEditAvailability} className="ml-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                          <FiEdit2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  !isPublicView && (
                    <button onClick={onEditAvailability} className="mt-2 inline-flex items-center text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors">
                      <FiCalendar className="mr-1.5" size={13} />
                      Set Availability
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex flex-col items-stretch gap-2.5 w-full sm:w-44 mt-2 sm:mt-0 flex-shrink-0">
              {isPublicView ? (
                <>
                  <button onClick={handleChat} disabled={chatLoading} className="btn-mono w-full">
                    {chatLoading ? <FiLoader className="animate-spin" size={15} /> : <FiMessageCircle size={15} />}
                    {chatLoading ? 'Opening…' : 'Chat'}
                  </button>

                  <FollowButton
                    targetUserId={startupData.userId?._id || startupData.userId}
                    className="w-full"
                  />

                  {hasAvailability && (
                    activeBooking ? (
                      <div className={`rounded-xl border px-3 py-2.5 text-center ${statusStyles[activeBooking.status] || statusStyles.pending}`}>
                        <div className="flex items-center justify-center gap-1.5 text-xs font-semibold capitalize">
                          <FiCheckCircle size={13} />
                          Meeting {activeBooking.status}
                        </div>
                        <p className="text-[11px] mt-0.5 opacity-80">
                          {fmtDate(activeBooking.date)} · {activeBooking.time}
                        </p>
                      </div>
                    ) : (
                      <button onClick={() => setShowBooking(true)} disabled={statusLoading} className="btn-ghost w-full">
                        <FiCalendar size={15} />
                        Book Meeting
                      </button>
                    )
                  )}
                </>
              ) : (
                <>
                  {!hasAvailability && (
                    <button onClick={onEditAvailability} className="btn-mono w-full">
                      <FiCalendar size={14} />
                      Set Availability
                    </button>
                  )}
                  <button onClick={onEdit} className="btn-ghost w-full">
                    <FiEdit2 size={14} />
                    Edit Profile
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Active-booking helper note */}
          {isPublicView && activeBooking && (
            <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
              <FiClock size={12} />
              You have an active meeting with this startup. You can book again once it's completed or its time has passed.
            </p>
          )}
        </div>
      </div>

      {showBooking && (
        <BookingModal
          startup={startupData}
          isOpen={showBooking}
          onClose={() => setShowBooking(false)}
          onBookingSuccess={() => { setShowBooking(false); fetchBookingStatus(); }}
        />
      )}
    </>
  );
};

export default StartupProfileHeader;
