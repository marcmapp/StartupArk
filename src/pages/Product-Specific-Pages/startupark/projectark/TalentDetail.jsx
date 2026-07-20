import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, ExternalLink } from 'lucide-react';
import { useTalentDirectory } from './useTalentDirectory';
import TrustBadge from './TrustBadge';
import { MessageIcon } from './projectArkLabels';

function getCurrentUserId() {
  try {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    return u._id || u.id;
  } catch { return null; }
}

export default function TalentDetail() {
  const { profileType, id } = useParams();
  const navigate = useNavigate();
  const { fetchTalentProfile, initiateProfileConversation } = useTalentDirectory();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [messaging, setMessaging] = useState(false);

  useEffect(() => {
    fetchTalentProfile(profileType, id)
      .then(setProfile)
      .catch(e => setErr(e.response?.data?.error || e.message))
      .finally(() => setLoading(false));
  }, [profileType, id, fetchTalentProfile]);

  const isOwnProfile = profile && String(profile.userId) === String(getCurrentUserId());

  async function handleMessage() {
    setMessaging(true);
    try {
      await initiateProfileConversation({ userId: profile.userId, profileId: profile.id, profileType: profile.profileType });
      navigate(`/startupark/chat/${profile.id}`);
    } catch {
      navigate(`/startupark/chat/${profile.id}`);
    } finally {
      setMessaging(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-600 text-sm">Loading...</div>
      </div>
    );
  }

  if (err || !profile) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-3">
        <p className="text-sm text-red-400">{err || 'Profile not found'}</p>
        <button onClick={() => navigate('/startupark/projectark?mode=talent')} className="text-xs text-zinc-500 hover:text-zinc-300">
          Back to Talent Directory
        </button>
      </div>
    );
  }

  const isStudent = profile.profileType === 'student';
  const headline = isStudent
    ? [profile.course, profile.institution].filter(Boolean).join(' · ')
    : profile.profession;
  const skills = isStudent ? profile.skills : profile.expertise;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-10 px-4 md:px-6 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate('/startupark/projectark?mode=talent')}
            className="text-zinc-500 hover:text-zinc-300 text-xs transition-colors"
          >
            ← Talent Directory
          </button>
          <span className="text-zinc-700">/</span>
          <span className="text-xs text-zinc-400 line-clamp-1 flex-1">{profile.username}</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* Header */}
        <div className="glass-card p-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            {profile.profilePicture ? (
              <img src={profile.profilePicture} alt="" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center text-xl text-zinc-400">
                {profile.username?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            <div>
              <h1 className="text-lg font-bold text-zinc-100">{profile.username}</h1>
              {headline && <p className="text-sm text-zinc-500">{headline}</p>}
              {(profile.city || profile.state) && (
                <p className="text-xs text-zinc-600 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" strokeWidth={2} />
                  {[profile.city, profile.state].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {profile.posterTrust && <TrustBadge trust={profile.posterTrust} size="sm" />}
            {!isOwnProfile && (
              <button
                onClick={handleMessage}
                disabled={messaging}
                className="btn-mono text-sm px-4 py-2 flex items-center gap-1.5 disabled:opacity-50"
              >
                <MessageIcon className="w-4 h-4" strokeWidth={2} />
                {messaging ? 'Opening…' : 'Message'}
              </button>
            )}
          </div>
        </div>

        {/* Skills */}
        {skills?.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              {isStudent ? 'Skills' : 'Expertise'}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {skills.map(s => (
                <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-zinc-800/80 text-zinc-300 ring-1 ring-zinc-700/60">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Interests (student only) */}
        {isStudent && profile.interests?.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Interests</h3>
            <div className="flex flex-wrap gap-1.5">
              {profile.interests.map(s => (
                <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-zinc-800/80 text-zinc-300 ring-1 ring-zinc-700/60">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Details grid (professional-only fields) */}
        {!isStudent && (profile.experience || profile.education || profile.mentorshipAvailability) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Experience', value: profile.experience },
              { label: 'Education', value: profile.education },
              { label: 'Mentorship Availability', value: profile.mentorshipAvailability },
            ].filter(i => i.value).map(item => (
              <div key={item.label} className="glass-card px-3 py-2.5">
                <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5">{item.label}</div>
                <div className="text-xs text-zinc-300">{item.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Portfolio */}
        {isStudent ? (
          profile.portfolio?.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Portfolio</h3>
              <div className="space-y-2">
                {profile.portfolio.map((item, i) => (
                  <div key={i} className="glass-card px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-medium text-zinc-200">{item.title}</div>
                      {item.link && (
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-zinc-200 shrink-0">
                          <ExternalLink className="w-3.5 h-3.5" strokeWidth={2} />
                        </a>
                      )}
                    </div>
                    {item.description && <p className="text-xs text-zinc-500 mt-1">{item.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )
        ) : (
          profile.portfolio && (
            <div>
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Portfolio</h3>
              <p className="text-sm text-zinc-300">{profile.portfolio}</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
