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
  ExternalLink,
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
  } = useApp();

  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [chosenRole, setChosenRole] = useState<Role>(role);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isVerifyingRefresh, setIsVerifyingRefresh] = useState(false);

  // Validate email is genuine and properly formatted
  const isValidEmail = (val: string): boolean => {
    const trimmed = val.trim().toLowerCase();
    // Enforce basic standard email structure and reject suspicious random garbage
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmed)) return false;
    // Reject dummy placeholder domains
    if (trimmed.endsWith('@test.com') || trimmed.endsWith('@example.com') || trimmed.length < 6) {
      return false;
    }
    return true;
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();
    setLocalError(null);

    if (!isValidEmail(email)) {
      setLocalError('Please enter a valid, active email address (e.g. name@organization.org or name@gmail.com).');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must contain at least 6 characters.');
      return;
    }

    try {
      if (mode === 'register') {
        if (!displayName.trim()) {
          setLocalError('Please provide your full name or field handler designation.');
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

  const rolesConfig: { id: Role; label: string; desc: string; icon: any }[] = [
    { id: 'ngo', label: 'NGO Rescuer', desc: 'Field rescues, intake, and animal tagging', icon: ShieldCheck },
    { id: 'vet', label: 'Veterinarian', desc: 'Anti-rabies vaccine logs and ABC surgeries', icon: Stethoscope },
    { id: 'admin', label: 'Municipal Authority', desc: 'BBMP zone oversight & budget allocations', icon: Building2 },
    { id: 'citizen', label: 'Citizen Feeder', desc: 'Emergency reports & community feeding spots', icon: HeartHandshake },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-block mb-3">
          <PawtopiaLogo variant="full" size="lg" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B3E39] dark:text-teal-200 tracking-tight">
          Unified Stray Animal &amp; Rabies Portal
        </h1>
        <p className="text-sm text-stone-600 dark:text-stone-300 mt-2 max-w-lg mx-auto">
          Secure, authenticated access for municipal officers, field rescuers, veterinarians, and citizen guardians.
          Verified email addresses prevent unmonitored updates and ensure data integrity.
        </p>
      </div>

      {/* Main Auth Card */}
      <div className="bg-white dark:bg-[#071E1B] rounded-2xl border border-stone-200 dark:border-teal-900/60 shadow-xl overflow-hidden backdrop-blur-sm">
        {/* If user is logged in, show authenticated state & verification status */}
        {authUser ? (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-stone-200 dark:border-teal-900/40">
              <div className="flex items-center gap-4">
                {authUser.photoUrl ? (
                  <img
                    src={authUser.photoUrl}
                    alt={authUser.displayName || 'User'}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-500 shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-[#0B3E39] dark:bg-teal-800 text-white flex items-center justify-center font-bold text-xl shadow-md">
                    {authUser.displayName ? authUser.displayName.charAt(0).toUpperCase() : 'P'}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-stone-900 dark:text-white">
                      {authUser.displayName || 'Pawtopia Member'}
                    </h2>
                    {authUser.emailVerified ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        Verified Email
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        Unverified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400 font-mono mt-0.5">
                    {authUser.email}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded bg-teal-50 dark:bg-[#0E2825] border border-teal-200 dark:border-teal-900/60 text-[#0B3E39] dark:text-teal-300">
                      Role: {authUser.role.toUpperCase()}
                    </span>
                    <span className="text-[11px] text-stone-400">
                      Auth Method: {authUser.provider === 'google' ? 'Google OAuth' : authUser.provider === 'demo' ? 'Official Verified ID' : 'Email/Password'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setActiveView('map')}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B3E39] hover:bg-[#135952] text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  <span>Open Map &amp; Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={logout}
                  className="p-2.5 rounded-xl border border-stone-200 dark:border-teal-900/60 text-stone-600 dark:text-stone-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 transition cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Email Verification Banner if unverified */}
            {!authUser.emailVerified && (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 space-y-3">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-sm">Action Required: Verify Your Email Address</h3>
                    <p className="text-xs text-amber-800 dark:text-amber-300/90 mt-1">
                      To safeguard animal vaccination records, rabies logs, and return-to-site certificates, Pawtopia requires
                      a verified email address. Please click the link sent to <strong className="font-mono">{authUser.email}</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={sendVerificationEmail}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Resend Verification Email</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRefreshVerification}
                    disabled={isVerifyingRefresh}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#071E1B] border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 font-semibold text-xs hover:bg-amber-100/50 dark:hover:bg-amber-900/40 transition cursor-pointer disabled:opacity-60"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isVerifyingRefresh ? 'animate-spin' : ''}`} />
                    <span>I Clicked the Link — Refresh Status</span>
                  </button>
                </div>
              </div>
            )}

            {/* Success / Status Banner */}
            {authSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{authSuccessMsg}</span>
              </div>
            )}

            {/* Quick Role Switcher for Authorized Personnel */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-stone-600 dark:text-teal-200/80 mb-2 uppercase tracking-wider">
                Switch Active Field Role (RBAC)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {rolesConfig.map((r) => {
                  const Icon = r.icon;
                  const isCurrent = authUser.role === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id)}
                      className={`p-3 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between ${
                        isCurrent
                          ? 'bg-teal-50 dark:bg-teal-900/40 border-teal-600 dark:border-teal-400 text-teal-900 dark:text-teal-100 shadow-xs'
                          : 'bg-stone-50 dark:bg-[#0B2522] border-stone-200 dark:border-teal-900/40 text-stone-700 dark:text-stone-300 hover:border-teal-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Icon className={`w-4 h-4 ${isCurrent ? 'text-teal-700 dark:text-teal-300' : 'text-stone-400'}`} />
                        {isCurrent && <span className="w-2 h-2 rounded-full bg-teal-600 dark:bg-teal-400" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold">{r.label}</div>
                        <div className="text-[10px] text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">{r.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Not Logged In: Form with Google Sign-In & Email/Password */
          <div className="p-6 sm:p-10 space-y-6">
            {/* Mode tabs */}
            <div className="flex border-b border-stone-200 dark:border-teal-900/40">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  clearAuthError();
                  setLocalError(null);
                }}
                className={`flex-1 py-3 text-center text-xs sm:text-sm font-bold border-b-2 cursor-pointer transition ${
                  mode === 'signin'
                    ? 'border-[#0B3E39] dark:border-teal-400 text-[#0B3E39] dark:text-teal-200'
                    : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-700'
                }`}
              >
                Sign In to Pawtopia
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  clearAuthError();
                  setLocalError(null);
                }}
                className={`flex-1 py-3 text-center text-xs sm:text-sm font-bold border-b-2 cursor-pointer transition ${
                  mode === 'register'
                    ? 'border-[#0B3E39] dark:border-teal-400 text-[#0B3E39] dark:text-teal-200'
                    : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-700'
                }`}
              >
                Create Verified Account
              </button>
            </div>

            {/* Error notifications */}
            {(localError || authError) && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>{localError || authError}</span>
              </div>
            )}

            {/* Success message */}
            {authSuccessMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{authSuccessMsg}</span>
              </div>
            )}

            {/* Primary Option: Google Sign-In */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={authLoading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-stone-300 dark:border-teal-800/80 bg-white dark:bg-[#0A2623] hover:bg-stone-50 dark:hover:bg-[#12332F] text-stone-800 dark:text-white font-bold text-xs sm:text-sm shadow-xs transition active:scale-[0.99] cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                <span>Continue with Google (Verified Google Account)</span>
              </button>
              <p className="text-[11px] text-center text-stone-500 dark:text-stone-400">
                Google authentication automatically verifies your official email address.
              </p>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-stone-200 dark:border-teal-900/50 w-full" />
              <span className="bg-white dark:bg-[#071E1B] px-3 text-[11px] font-bold uppercase tracking-wider text-stone-400">
                or sign in with verified email
              </span>
              <div className="border-t border-stone-200 dark:border-teal-900/50 w-full" />
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {mode === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-200 mb-1">
                      Full Name / Officer Designation *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="e.g. Dr. Kavya Hegde or Officer Rajesh"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-teal-900/60 bg-stone-50 dark:bg-[#0A2623] text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-200 mb-1">
                      Platform Role (RBAC) *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {rolesConfig.map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setChosenRole(r.id)}
                          className={`p-2.5 rounded-xl border text-left text-xs transition cursor-pointer ${
                            chosenRole === r.id
                              ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-600 dark:border-teal-400 font-bold text-[#0B3E39] dark:text-teal-200'
                              : 'bg-stone-50 dark:bg-[#0A2623] border-stone-200 dark:border-teal-900/50 text-stone-600 dark:text-stone-300'
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-200 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="official.email@organization.org or personal email"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-teal-900/60 bg-stone-50 dark:bg-[#0A2623] text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                <span className="text-[10px] text-stone-500 dark:text-stone-400 mt-1 block">
                  Must be an active, legitimate email address to receive confirmation tokens.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-200 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-teal-900/60 bg-stone-50 dark:bg-[#0A2623] text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 px-4 rounded-xl bg-[#0B3E39] hover:bg-[#135952] text-white font-bold text-xs sm:text-sm shadow-md transition cursor-pointer active:scale-[0.99] disabled:opacity-50"
              >
                {authLoading
                  ? 'Connecting...'
                  : mode === 'signin'
                  ? 'Sign In to Account'
                  : 'Create Account & Send Verification Link'}
              </button>
            </form>
          </div>
        )}

        {/* Quick Testing & Official Roles Hub (Fast Evaluation) */}
        <div className="bg-[#FAF6EE] dark:bg-[#0B2522] p-5 sm:p-6 border-t border-stone-200 dark:border-teal-900/60">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-teal-700 dark:text-teal-300" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-teal-200">
              One-Click Verified Access (Official Sandbox &amp; Demo Roles)
            </h3>
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-300 mb-4">
            Test the platform instantly using pre-configured, verified email credentials across all 4 system roles:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => loginAsVerifiedDemo('ngo')}
              className="p-3 rounded-xl bg-white dark:bg-[#071E1B] border border-stone-200 dark:border-teal-900/50 hover:border-teal-500 text-left transition cursor-pointer shadow-2xs group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-900 dark:text-white group-hover:text-teal-600">
                  NGO Field Rescuer
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  Verified
                </span>
              </div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400 font-mono mt-1">
                ananya.sharma@bbmp-animalcare.gov.in
              </div>
            </button>

            <button
              type="button"
              onClick={() => loginAsVerifiedDemo('vet')}
              className="p-3 rounded-xl bg-white dark:bg-[#071E1B] border border-stone-200 dark:border-teal-900/50 hover:border-teal-500 text-left transition cursor-pointer shadow-2xs group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-900 dark:text-white group-hover:text-teal-600">
                  Veterinary Surgeon
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  Verified
                </span>
              </div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400 font-mono mt-1">
                dr.menon@pawtopia-health.org
              </div>
            </button>

            <button
              type="button"
              onClick={() => loginAsVerifiedDemo('admin')}
              className="p-3 rounded-xl bg-white dark:bg-[#071E1B] border border-stone-200 dark:border-teal-900/50 hover:border-teal-500 text-left transition cursor-pointer shadow-2xs group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-900 dark:text-white group-hover:text-teal-600">
                  Municipal Authority (BBMP)
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  Verified
                </span>
              </div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400 font-mono mt-1">
                ramesh.rao@bbmp.gov.in
              </div>
            </button>

            <button
              type="button"
              onClick={() => loginAsVerifiedDemo('citizen')}
              className="p-3 rounded-xl bg-white dark:bg-[#071E1B] border border-stone-200 dark:border-teal-900/50 hover:border-teal-500 text-left transition cursor-pointer shadow-2xs group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-900 dark:text-white group-hover:text-teal-600">
                  Community Feeder &amp; Citizen
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  Verified
                </span>
              </div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400 font-mono mt-1">
                kavitha.sundaram@gmail.com
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
