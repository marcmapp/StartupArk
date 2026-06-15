import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Agreement from './Agreement';
import FormComponent from './FormComponent';

const baseUrl = import.meta.env.VITE_API_BASE_URL;

const STEPS = [
  { id: 1, title: 'Role' },
  { id: 2, title: 'Terms' },
  { id: 3, title: 'Profile' },
  { id: 4, title: 'Done' },
];

const ROLES = [
  {
    id: 'user',
    title: 'Explorer',
    subtitle: 'Discover & Connect',
    description: 'Browse startups, book meetings with founders, and explore investment opportunities.',
    icon: 'search',
    features: ['Browse startups', 'Book founder meetings', 'Explore deals'],
  },
  {
    id: 'startup',
    title: 'Founder',
    subtitle: 'Build & Grow',
    description: 'Showcase your startup, recruit talent, raise funding, and engage your audience.',
    icon: 'rocket',
    features: ['Showcase page', 'Post jobs', 'Investor connections'],
  },
  {
    id: 'student',
    title: 'Student',
    subtitle: 'Learn & Launch',
    description: 'Find internships, apply to cutting-edge startups, and build a standout portfolio.',
    icon: 'graduation',
    features: ['Find internships', 'Apply to startups', 'Career resources'],
  },
];

export default function StartuparkSetup() {
  const [loading, setLoading] = useState(true);
  const [savingRole, setSavingRole] = useState(null);
  const [role, setRole] = useState(null);
  const [agreementDone, setAgreementDone] = useState(false);
  const [formDone, setFormDone] = useState(false);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState(false);
  const contentRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  useEffect(() => {
    async function fetchRoleStatus() {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${baseUrl}/startupark/api/role`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { startuparkRole, agreements, profiles } = res.data;
        const targetRole = (location.state?.forceSetup && location.state?.role === 'startup')
          ? 'startup' : startuparkRole;

        if (targetRole) {
          setRole(targetRole);
          setSelectedRole(targetRole);
          const agreed = agreements?.[targetRole] === true;
          const hasProfile = profiles?.[targetRole] === true;
          setAgreementDone(agreed);
          setFormDone(hasProfile);
          setIsFirstTimeSetup(!hasProfile);
          if (hasProfile) setCurrentStep(4);
          else if (agreed) setCurrentStep(3);
          else setCurrentStep(2);
        }
      } catch {
        setError('Failed to load setup status');
      } finally {
        setLoading(false);
      }
    }
    fetchRoleStatus();
  }, [location.state]);

  useEffect(() => {
    if (!formDone) return;
    const routes = { user: '/startupark/user-dashboard', startup: '/startupark/startup-dashboard', student: '/startupark/student-dashboard' };
    const timer = setTimeout(() => navigate(routes[role] || '/startupark/user-dashboard'), isFirstTimeSetup ? 2000 : 0);
    return () => clearTimeout(timer);
  }, [formDone, navigate, role, isFirstTimeSetup]);

  // Auto-advance: selecting a role immediately saves it and moves to terms.
  async function handleRoleSelect(roleId) {
    if (savingRole) return;
    setSelectedRole(roleId);
    setSavingRole(roleId);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${baseUrl}/startupark/api/role`, { role: roleId }, { headers: { Authorization: `Bearer ${token}` } });
      setRole(roleId);
      setCurrentStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save role');
    } finally {
      setSavingRole(null);
    }
  }

  function handleAgree() {
    setAgreementDone(true);
    setCurrentStep(3);
    if (location.state?.forceSetup && !role) setRole('startup');
  }

  function handleFormSubmit() {
    setFormDone(true);
    setCurrentStep(4);
  }

  function handleBack() {
    if (currentStep > 1) setCurrentStep(s => s - 1);
  }

  if (loading && currentStep === 1 && !role) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-black/10 dark:border-white/15 border-t-zinc-900 dark:border-t-white rounded-full animate-spin" />
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">Loading your setup…</p>
        </div>
      </div>
    );
  }

  if (error && currentStep === 1) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 gap-5">
        <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <span className="text-3xl">⚠️</span>
        </div>
        <p className="text-zinc-700 dark:text-zinc-300 text-center max-w-sm">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-mono">Retry</button>
      </div>
    );
  }

  return (
    <div ref={contentRef} className="min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">

        {/* Top bar: compact stepper (top-left) + title */}
        <div className="mb-6">
          {/* Compact horizontal stepper, left-aligned */}
          <div className="flex items-center gap-2 mb-5">
            {STEPS.map((step, i) => {
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              return (
                <div key={step.id} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300 ${
                    isCompleted ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                    : isCurrent ? 'bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-white text-zinc-900 dark:text-white'
                    : 'bg-black/[0.04] dark:bg-white/[0.06] text-zinc-400 dark:text-zinc-600'
                  }`}>
                    {isCompleted ? '✓' : step.id}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${isCurrent || isCompleted ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-600'}`}>
                    {step.title}
                  </span>
                  {i < STEPS.length - 1 && <div className={`w-6 sm:w-10 h-px ${isCompleted ? 'bg-zinc-900 dark:bg-white' : 'bg-black/10 dark:bg-white/10'}`} />}
                </div>
              );
            })}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
            Let's set you up
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            A few quick steps to personalise your StartupArk experience.
          </p>
        </div>

        {/* Step content card — wide */}
        <div className="glass-card shadow-xl p-6 sm:p-8">
          {currentStep === 1 && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">Who are you?</h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">Pick a role to continue — we'll take you to the next step automatically.</p>

              {/* Wide horizontal role cards */}
              <div className="space-y-3">
                {ROLES.map((r) => {
                  const isSaving = savingRole === r.id;
                  const active = selectedRole === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => handleRoleSelect(r.id)}
                      disabled={!!savingRole}
                      className={`w-full text-left flex items-center gap-4 sm:gap-5 p-4 sm:p-5 rounded-2xl border transition-all duration-200 group ${
                        active
                          ? 'border-zinc-900 dark:border-white bg-black/[0.03] dark:bg-white/[0.06]'
                          : 'border-black/[0.08] dark:border-white/10 bg-black/[0.01] dark:bg-white/[0.02] hover:border-black/20 dark:hover:border-white/25 hover:bg-black/[0.03] dark:hover:bg-white/[0.05]'
                      } ${savingRole && !isSaving ? 'opacity-40' : ''}`}
                    >
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        active ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900' : 'bg-black/[0.05] dark:bg-white/[0.08] text-zinc-700 dark:text-zinc-200'
                      }`}>
                        <box-icon name={r.icon} type="solid" color="currentColor" size="26px" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-zinc-900 dark:text-white text-base sm:text-lg">{r.title}</h3>
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">{r.subtitle}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1 sm:line-clamp-none">{r.description}</p>
                        <div className="hidden sm:flex flex-wrap gap-1.5 mt-2">
                          {r.features.map((f) => (
                            <span key={f} className="text-[11px] glass-inset text-zinc-600 dark:text-zinc-300 px-2 py-0.5 rounded-full">{f}</span>
                          ))}
                        </div>
                      </div>

                      <div className="flex-shrink-0 text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                        {isSaving ? (
                          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <box-icon name="chevron-right" color="currentColor" size="22px" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
            </div>
          )}

          {currentStep === 2 && (
            <div className="animate-fade-in">
              <Agreement role={location.state?.forceSetup ? 'startup' : role} onAgree={handleAgree} />
              <button onClick={handleBack} className="mt-4 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition">
                ← Back
              </button>
            </div>
          )}

          {currentStep === 3 && (
            <div className="animate-fade-in">
              <FormComponent role={location.state?.forceSetup ? 'startup' : role} onSubmit={handleFormSubmit} />
              <button onClick={handleBack} className="mt-4 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition">
                ← Back
              </button>
            </div>
          )}

          {currentStep === 4 && (
            <div className="text-center py-10 animate-fade-in">
              <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center text-3xl shadow-lg">
                ✓
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">You're all set!</h2>
              <p className="text-zinc-500 dark:text-zinc-400 mb-6 max-w-sm mx-auto">
                Your {role} profile is ready. Taking you to your dashboard…
              </p>
              <div className="w-48 mx-auto bg-black/[0.06] dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div className="h-full bg-zinc-900 dark:bg-white rounded-full animate-pulse" style={{ width: '100%' }} />
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-zinc-400 dark:text-zinc-600 mt-6">
          Need help? Contact us at support@mapparks.com
        </p>
      </div>
    </div>
  );
}
