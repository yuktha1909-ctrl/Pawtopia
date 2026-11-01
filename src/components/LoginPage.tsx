import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PawtopiaLogo } from './PawtopiaLogo';
import { Role } from '../types';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Mail,
  Lock,
  User,
  ArrowRight,
  RefreshCw,
  Send,
  Sparkles,
  Building2,
  Stethoscope,
  HeartHandshake,
  LogOut,
  Eye,
  EyeOff,
  MapPin,
  Tag,
  AlertTriangle,
  HelpCircle,
  Check,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const {
    authUser,
    authLoading,
    authError,
    authSuccessMsg,
    clearAuthError,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    sendVerificationEmail,
    reloadUserVerification,
    logout,
    loginAsVerifiedDemo,
    role,
    setRole,
    setActiveView,
    t,
  } = useApp();

  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [chosenRole, setChosenRole] = useState<Role>(role);
  const [localError, setLocalError] = useState<string | null>(null);
  const [localSuccess, setLocalSuccess] = useState<string | null>(null);
  const [isVerifyingRefresh, setIsVerifyingRefresh] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Standard email validation (friendly and permissive)
  const isValidEmail = (val: string): boolean => {
    const trimmed = val.trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();
    setLocalError(null);
    setLocalSuccess(null);

    if (!isValidEmail(email)) {
      setLocalError('Please enter a valid email address (e.g. yourname@gmail.com).');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password should be at least 6 characters.');
      return;
    }

    try {
      if (mode === 'register') {
        if (!displayName.trim()) {
          setLocalError('Please enter your name.');
          return;
        }
        await registerWithEmail(email, password, displayName, chosenRole);
      } else {
        await loginWithEmail(email, password);
      }
    } catch {
      // Error handled in AppContext
    }
  };

  const handleGoogleSignIn = async () => {
    clearAuthError();
    setLocalError(null);
    setLocalSuccess(null);
    try {
      await loginWithGoogle();
    } catch {
      // Error handled in AppContext
    }
  };

  const handleRefreshVerification = async () => {
    setIsVerifyingRefresh(true);
    await reloadUserVerification();
    setIsVerifyingRefresh(false);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(forgotEmail)) {
      setLocalError('Please enter a valid email to send the reset link.');
      return;
    }
    setForgotSent(true);
    setTimeout(() => {
      setShowForgotModal(false);
      setForgotSent(false);
      setLocalSuccess(t('passwordResetSent'));
    }, 1800);
  };

  const quickPersonas: {
    role: Role;
    name: string;
    email: string;
    title: string;
    desc: string;
    avatar: string;
    badgeBg: string;
    borderColor: string;
  }[] = [
    {
      role: 'citizen',
      name: 'Yuktha Sundaram',
      email: 'yuktha907@gmail.com',
      title: t('roleCitizen'),
      desc: 'Community caretaker & animal lover',
      avatar: '🐶',
      badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300',
      borderColor: 'hover:border-amber-400 dark:hover:border-amber-500',
    },
    {
      role: 'ngo',
      name: 'Dr. Ananya Sharma',
      email: 'ananya.sharma@bbmp-animalcare.gov.in',
      title: t('roleNGO'),
      desc: 'Ambulance triage & field rescue lead',
      avatar: '🚑',
      badgeBg: 'bg-teal-100 text-teal-800 dark:bg-teal-950/70 dark:text-teal-300',
      borderColor: 'hover:border-teal-400 dark:hover:border-teal-500',
    },
    {
      role: 'vet',
      name: 'Dr. Vivek Menon',
      email: 'dr.menon@pawtopia-health.org',
      title: t('roleVet'),
      desc: 'Anti-rabies vaccine & ABC surgeon',
      avatar: '🩺',
      badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300',
      borderColor: 'hover:border-emerald-400 dark:hover:border-emerald-500',
    },
    {
      role: 'admin',
      name: 'Ramesh Rao',
      email: 'ramesh.rao@bbmp.gov.in',
      title: t('roleAdmin'),
      desc: 'Ward rabies index & municipal budget',
      avatar: '🏛️',
      badgeBg: 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300',
      borderColor: 'hover:border-blue-400 dark:hover:border-blue-500',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10">
      {/* Brand & Friendly Greeting Header */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-block mb-3">
          <PawtopiaLogo variant="full" size="md" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B3E39] dark:text-teal-200 tracking-tight">
          {t('welcomeTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 mt-1.5 max-w-md mx-auto">
          {t('welcomeSubtitle')}
        </p>
      </div>

      {/* Main Container */}
      <div className="bg-white dark:bg-[#071E1B] rounded-3xl border border-stone-200 dark:border-teal-900/60 shadow-xl overflow-hidden">
        {/* ================= IF USER IS LOGGED IN ================= */}
        {authUser ? (
          <div className="p-6 sm:p-8 space-y-6">
            {/* User Profile Card */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#FAF6EE] dark:bg-[#0A2623] border border-stone-200/80 dark:border-teal-900/40">
              <div className="flex items-center gap-4">
                {authUser.photoUrl ? (
                  <img
                    src={authUser.photoUrl}
                    alt={authUser.displayName || 'User'}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-teal-500 shadow-sm"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-[#0B3E39] dark:bg-teal-700 text-white flex items-center justify-center font-extrabold text-xl shadow-md">
                    {authUser.displayName ? authUser.displayName.charAt(0).toUpperCase() : 'P'}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white">
                      {authUser.displayName || 'Pawtopia Member'}
                    </h2>
                    {authUser.emailVerified ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {t('verified')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                        {t('unverified')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400 font-mono mt-0.5">
                    {authUser.email}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-teal-50 dark:bg-[#071917] border border-teal-200 dark:border-teal-800 text-[#0B3E39] dark:text-teal-300">
                      {t('roleLabel')} {authUser.role.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sign Out Button */}
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-200 dark:border-teal-900/60 text-stone-600 dark:text-stone-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 text-xs font-bold transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('signOutButton')}</span>
              </button>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div>
              <label className="block text-xs font-bold text-stone-600 dark:text-stone-300 mb-2 uppercase tracking-wider">
                Where would you like to go?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveView('map')}
                  className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#0B3E39] hover:bg-[#135952] text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-teal-300" />
                  <div className="text-left">
                    <div className="text-xs font-bold">{t('goToMap')}</div>
                    <div className="text-[10px] text-teal-200 font-normal">Surveillance &amp; hotspots</div>
                  </div>
                  <ArrowRight className="w-4 h-4 ml-auto text-teal-300" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveView('registry')}
                  className="flex items-center gap-3 p-3.5 rounded-2xl bg-teal-50 dark:bg-[#0A2623] hover:bg-teal-100 dark:hover:bg-[#11332F] text-[#0B3E39] dark:text-teal-200 border border-teal-200 dark:border-teal-800 font-bold text-xs transition cursor-pointer"
                >
                  <Tag className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <div className="text-left">
                    <div className="text-xs font-bold">{t('goToRegistry')}</div>
                    <div className="text-[10px] text-stone-500 dark:text-stone-400 font-normal">QR tags &amp; health cards</div>
                  </div>
                  <ArrowRight className="w-4 h-4 ml-auto text-teal-600 dark:text-teal-400" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveView('reports')}
                  className="flex items-center gap-3 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-900 font-bold text-xs transition cursor-pointer"
                >
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <div className="text-left">
                    <div className="text-xs font-bold">{t('reportRescue')}</div>
                    <div className="text-[10px] text-rose-600/80 dark:text-rose-300/80 font-normal">Active triage dispatch</div>
                  </div>
                  <ArrowRight className="w-4 h-4 ml-auto text-rose-600 dark:text-rose-400" />
                </button>
              </div>
            </div>

            {/* Switch Active Role on the fly */}
            <div className="pt-2 border-t border-stone-200/80 dark:border-teal-900/40">
              <label className="block text-xs font-bold text-stone-600 dark:text-stone-300 mb-2 uppercase tracking-wider">
                Switch Role / Perspective
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'citizen' as Role, label: t('roleCitizen'), emoji: '🐶' },
                  { id: 'ngo' as Role, label: t('roleNGO'), emoji: '🚑' },
                  { id: 'vet' as Role, label: t('roleVet'), emoji: '🩺' },
                  { id: 'admin' as Role, label: t('roleAdmin'), emoji: '🏛️' },
                ].map((r) => {
                  const isCurrent = authUser.role === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id)}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                        isCurrent
                          ? 'bg-[#0B3E39] text-white border-[#0B3E39] dark:bg-teal-700 dark:border-teal-600 shadow-sm'
                          : 'bg-stone-50 dark:bg-[#071917] text-stone-700 dark:text-stone-300 border-stone-200 dark:border-teal-900/40 hover:bg-stone-100'
                      }`}
                    >
                      <span>{r.emoji}</span>
                      <span className="truncate">{r.label}</span>
                      {isCurrent && <Check className="w-3.5 h-3.5 ml-auto text-teal-300" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Email verification reminder (gentle, friendly) */}
            {!authUser.emailVerified && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Your email ({authUser.email}) is currently unverified.</span>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={sendVerificationEmail}
                    className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold transition cursor-pointer"
                  >
                    {t('resendVerificationButton')}
                  </button>
                  <button
                    type="button"
                    onClick={handleRefreshVerification}
                    disabled={isVerifyingRefresh}
                    className="p-1.5 rounded-lg bg-white dark:bg-[#071E1B] border border-amber-300 text-amber-900 dark:text-amber-200 transition cursor-pointer"
                    title="Refresh status"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isVerifyingRefresh ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ================= IF USER IS NOT LOGGED IN ================= */
          <div className="p-6 sm:p-8 space-y-6">
            {/* SECTION 1: INSTANT 1-CLICK ACCESS (THE EASIEST PATH) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50/80 via-teal-50/50 to-emerald-50/80 dark:from-[#0B2522] dark:via-[#071E1B] dark:to-[#082823] border border-teal-200/80 dark:border-teal-800/60 shadow-xs">
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles className="w-4 h-4 text-teal-700 dark:text-teal-300 animate-pulse" />
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#0B3E39] dark:text-teal-200">
                  {t('quickDemoTitle')}
                </h2>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 mb-3.5">
                {t('quickDemoSubtitle')}
              </p>

              {/* 4 Clean Persona Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {quickPersonas.map((p) => (
                  <button
                    key={p.role}
                    type="button"
                    onClick={() => loginAsVerifiedDemo(p.role)}
                    className={`flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-[#071917] border border-stone-200 dark:border-teal-900/60 text-left transition shadow-2xs group cursor-pointer ${p.borderColor}`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-[#0E2825] flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                      {p.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-stone-900 dark:text-white truncate group-hover:text-teal-600 dark:group-hover:text-teal-400">
                          {p.title}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${p.badgeBg}`}>
                          1-Click
                        </span>
                      </div>
                      <div className="text-[11px] font-medium text-stone-500 dark:text-stone-400 truncate">
                        {p.name}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-stone-300 dark:text-stone-600 group-hover:text-teal-600 dark:group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>

            {/* SECTION 2: GOOGLE SIGN IN (FAMILIAR & FAST) */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={authLoading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl border border-stone-300 dark:border-teal-800 bg-white dark:bg-[#0A2623] hover:bg-stone-50 dark:hover:bg-[#11332F] text-stone-800 dark:text-white font-bold text-xs sm:text-sm shadow-xs transition active:scale-[0.99] cursor-pointer disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{t('continueWithGoogle')}</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-stone-200 dark:border-teal-900/50 w-full" />
              <span className="bg-white dark:bg-[#071E1B] px-3 text-[11px] font-bold uppercase tracking-wider text-stone-400">
                {t('orUseEmail')}
              </span>
              <div className="border-t border-stone-200 dark:border-teal-900/50 w-full" />
            </div>

            {/* SECTION 3: SIMPLE EMAIL / PASSWORD SIGN-IN */}
            <div>
              {/* Tab Selector */}
              <div className="flex bg-stone-100 dark:bg-[#071917] p-1 rounded-xl mb-4 border border-stone-200/80 dark:border-teal-900/40">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    clearAuthError();
                    setLocalError(null);
                  }}
                  className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition cursor-pointer ${
                    mode === 'signin'
                      ? 'bg-white dark:bg-[#0B3E39] text-[#0B3E39] dark:text-white shadow-xs'
                      : 'text-stone-500 dark:text-stone-400 hover:text-stone-800'
                  }`}
                >
                  {t('signInTab')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    clearAuthError();
                    setLocalError(null);
                  }}
                  className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition cursor-pointer ${
                    mode === 'register'
                      ? 'bg-white dark:bg-[#0B3E39] text-[#0B3E39] dark:text-white shadow-xs'
                      : 'text-stone-500 dark:text-stone-400 hover:text-stone-800'
                  }`}
                >
                  {t('createAccountTab')}
                </button>
              </div>

              {/* Error messages */}
              {(localError || authError) && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{localError || authError}</span>
                </div>
              )}

              {/* Success messages */}
              {(localSuccess || authSuccessMsg) && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{localSuccess || authSuccessMsg}</span>
                </div>
              )}

              {/* Email Form */}
              <form onSubmit={handleEmailSubmit} className="space-y-3.5">
                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-200 mb-1">
                      {t('fullNameOrDesignation')}
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-stone-200 dark:border-teal-900/60 bg-stone-50 dark:bg-[#071917] text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-200 mb-1">
                    {t('emailAddressLabel')}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-stone-200 dark:border-teal-900/60 bg-stone-50 dark:bg-[#071917] text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-200">
                      {t('passwordLabel')}
                    </label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => {
                          setForgotEmail(email);
                          setShowForgotModal(true);
                        }}
                        className="text-[11px] text-teal-700 dark:text-teal-300 hover:underline font-semibold cursor-pointer"
                      >
                        {t('forgotPassword')}
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl border border-stone-200 dark:border-teal-900/60 bg-stone-50 dark:bg-[#071917] text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer p-0.5"
                      title={showPassword ? t('hidePassword') : t('showPassword')}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-200 mb-1">
                      Choose Your Role
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'citizen' as Role, label: t('roleCitizen'), emoji: '🐶' },
                        { id: 'ngo' as Role, label: t('roleNGO'), emoji: '🚑' },
                        { id: 'vet' as Role, label: t('roleVet'), emoji: '🩺' },
                        { id: 'admin' as Role, label: t('roleAdmin'), emoji: '🏛️' },
                      ].map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setChosenRole(r.id)}
                          className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                            chosenRole === r.id
                              ? 'bg-teal-50 dark:bg-teal-950/70 border-teal-600 dark:border-teal-400 text-[#0B3E39] dark:text-teal-200'
                              : 'bg-stone-50 dark:bg-[#071917] border-stone-200 dark:border-teal-900/40 text-stone-600 dark:text-stone-300'
                          }`}
                        >
                          <span>{r.emoji}</span>
                          <span className="truncate">{r.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 px-4 mt-2 rounded-xl bg-[#0B3E39] hover:bg-[#135952] text-white font-bold text-xs sm:text-sm shadow-md transition cursor-pointer active:scale-[0.99] disabled:opacity-50"
                >
                  {authLoading
                    ? 'Connecting...'
                    : mode === 'signin'
                    ? t('signInButton')
                    : t('createAccountButton')}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Forgot Password Friendly Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#071E1B] rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 dark:border-teal-900/60 animate-in fade-in zoom-in-95">
            <h3 className="text-sm font-bold text-stone-900 dark:text-white mb-1">
              Reset Your Password
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">
              Enter your email and we will send you a secure link to create a new password.
            </p>
            <form onSubmit={handleForgotPassword} className="space-y-3">
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-teal-900/60 bg-stone-50 dark:bg-[#071917] text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-teal-950/50 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotSent}
                  className="px-4 py-1.5 text-xs font-bold bg-[#0B3E39] text-white rounded-lg hover:bg-teal-900 transition cursor-pointer"
                >
                  {forgotSent ? 'Sending...' : 'Send Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
