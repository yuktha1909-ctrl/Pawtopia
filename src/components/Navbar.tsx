import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PawtopiaLogo } from './PawtopiaLogo';
import { PWASyncStatusIndicator } from './PWASyncStatusIndicator';
import { Role } from '../types';
import {
  MapPin,
  ShieldCheck,
  AlertTriangle,
  QrCode,
  Kanban,
  BarChart3,
  Package,
  HeartHandshake,
  Users,
  Search,
  Globe,
  Radio,
  Wifi,
  WifiOff,
  Menu,
  X,
  Stethoscope,
  Building2,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react';

interface NavbarProps {
  onOpenReportModal: () => void;
  onOpenAIMatcherModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenReportModal, onOpenAIMatcherModal }) => {
  const { role, setRole, theme, toggleTheme, lang, setLang, activeView, setActiveView, isOnline, t, reports } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pendingEmergencies = reports.filter((r) => r.status === 'reported' || r.status === 'in_progress').length;

  const roles: { id: Role; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'citizen', label: t('roleCitizen'), icon: <HeartHandshake className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />, desc: 'Report, scan QR, adopt' },
    { id: 'ngo', label: t('roleNGO'), icon: <ShieldCheck className="w-4 h-4 text-teal-700 dark:text-teal-400" />, desc: 'Rescue, triage, tasks, releases' },
    { id: 'vet', label: t('roleVet'), icon: <Stethoscope className="w-4 h-4 text-blue-600 dark:text-blue-400" />, desc: 'Vaccinate, sterilize, PEP' },
    { id: 'admin', label: t('roleAdmin'), icon: <Building2 className="w-4 h-4 text-amber-700 dark:text-amber-400" />, desc: 'Readiness scores, zones, audits' },
  ];

  const navItems = [
    { id: 'map', label: t('publicMap'), icon: MapPin },
    { id: 'registry', label: t('registry'), icon: QrCode },
    { id: 'reports', label: 'Emergency Queue', icon: AlertTriangle, badge: pendingEmergencies },
    { id: 'tasks', label: t('ngoTasks'), icon: Kanban, roles: ['ngo', 'admin', 'vet'] },
    { id: 'readiness', label: t('readinessScore'), icon: BarChart3 },
    { id: 'inventory', label: t('inventoryBudget'), icon: Package, roles: ['ngo', 'vet', 'admin'] },
    { id: 'bites', label: t('biteControl'), icon: Radio },
    { id: 'camps', label: t('campsFeeders'), icon: Users },
    { id: 'transparency', label: t('transparency'), icon: Globe },
  ];

  const visibleNavItems = navItems.filter((item) => !item.roles || item.roles.includes(role));

  return (
    <header className="sticky top-0 z-40 bg-[#FAF6EE]/95 dark:bg-[#071E1B]/95 backdrop-blur-md border-b border-[#0B3E39]/10 dark:border-teal-900/40 shadow-xs transition-colors duration-200">
      {/* Top Banner / Brand + Role & Fast Action Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Tagline */}
          <button
            onClick={() => setActiveView('map')}
            className="flex items-center text-left focus:outline-none group cursor-pointer"
            aria-label="Pawtopia Home"
          >
            <PawtopiaLogo variant="full" size="md" />
          </button>

          {/* Right Header Controls (Desktop) */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* AI Image Matcher Quick Launcher */}
            <button
              onClick={onOpenAIMatcherModal}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-teal-50 dark:bg-[#0E2825] border border-teal-200 dark:border-teal-900/60 text-[#0B3E39] dark:text-teal-200 hover:bg-teal-100 dark:hover:bg-[#133532] transition shadow-xs cursor-pointer"
              title="Search animal registry by uploaded photo"
            >
              <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400 animate-pulse" />
              <span>{t('findAnimalAI')}</span>
            </button>

            {/* Emergency Report Action Button */}
            <button
              onClick={onOpenReportModal}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl bg-[#E63946] text-white hover:bg-rose-700 transition shadow-md shadow-rose-600/20 active:scale-95 cursor-pointer"
              aria-label="Report Injured or Sick Animal"
            >
              <AlertTriangle className="w-4 h-4 text-white animate-bounce" />
              <span>{t('reportEmergency')}</span>
            </button>

            {/* Language Selector */}
            <div className="relative inline-flex items-center bg-white dark:bg-[#0E2825] border border-stone-200 dark:border-teal-900/60 rounded-xl px-2.5 py-1.5 shadow-2xs">
              <Globe className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400 mr-1.5" />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as any)}
                className="text-xs font-medium text-stone-700 dark:text-stone-200 bg-transparent focus:outline-none cursor-pointer"
                aria-label="Select Language"
              >
                <option value="en" className="dark:bg-[#0B2522]">English (EN)</option>
                <option value="kn" className="dark:bg-[#0B2522]">ಕನ್ನಡ (KN)</option>
                <option value="hi" className="dark:bg-[#0B2522]">हिन्दी (HI)</option>
              </select>
            </div>

            {/* RBAC Role Selector Dropdown */}
            <div className="relative inline-flex items-center bg-white dark:bg-[#0E2825] border border-[#0B3E39]/20 dark:border-teal-900/60 rounded-xl p-1 shadow-xs">
              <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 px-2 uppercase tracking-wider">Role:</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="text-xs font-bold text-[#0B3E39] dark:text-teal-200 bg-stone-50 dark:bg-[#071B19] border border-stone-200 dark:border-teal-900/50 rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer"
                aria-label="Active User Role"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id} className="dark:bg-[#0B2522]">
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Theme Toggle Button (Light / Dark Mode) */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-white dark:bg-[#0E2825] border border-stone-200 dark:border-teal-900/60 text-stone-700 dark:text-amber-300 hover:bg-stone-50 dark:hover:bg-[#12332F] transition shadow-2xs cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-stone-700" />}
            </button>

            {/* PWA Offline / Online Background Sync Indicator */}
            <PWASyncStatusIndicator />
          </div>

          {/* Mobile Actions: Theme Toggle + PWA Sync Indicator + Emergency + Menu */}
          <div className="flex lg:hidden items-center gap-1.5">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-white dark:bg-[#0E2825] border border-stone-200 dark:border-teal-900/60 text-stone-700 dark:text-amber-300 cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-stone-700" />}
            </button>
            <PWASyncStatusIndicator />
            <button
              onClick={onOpenReportModal}
              className="p-2 rounded-lg bg-rose-600 text-white shadow-xs cursor-pointer"
              aria-label="Emergency Report"
            >
              <AlertTriangle className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-white dark:bg-[#0E2825] border border-stone-200 dark:border-teal-900/60 text-stone-700 dark:text-stone-200 cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Sub-Bar (Desktop Tabs) */}
      <div className="hidden lg:block bg-white/70 dark:bg-[#0A2623]/80 border-t border-[#0B3E39]/5 dark:border-teal-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 py-1.5 overflow-x-auto no-scrollbar" aria-label="Main Navigation">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#0B3E39] dark:bg-teal-700 text-[#FAF6EE] shadow-xs'
                      : 'text-stone-700 dark:text-stone-300 hover:text-[#0B3E39] dark:hover:text-white hover:bg-stone-100/80 dark:hover:bg-teal-950/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#FAF6EE]' : 'text-stone-500 dark:text-stone-400'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-[#071E1B] border-b border-stone-200 dark:border-teal-900/50 px-4 pt-3 pb-6 space-y-4 shadow-xl animate-in slide-in-from-top-2">
          {/* Role selector for mobile */}
          <div className="p-3 bg-[#FAF6EE] dark:bg-[#0B2925] rounded-xl border border-stone-200 dark:border-teal-900/40">
            <label className="block text-xs font-bold text-stone-600 dark:text-teal-200/80 mb-1.5">USER ROLE SWITCHER (RBAC)</label>
            <div className="grid grid-cols-2 gap-2">
              {roles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    setRole(r.id);
                  }}
                  className={`flex items-center gap-1.5 p-2 rounded-lg text-xs font-semibold border text-left cursor-pointer transition ${
                    role === r.id
                      ? 'bg-[#0B3E39] dark:bg-teal-700 text-white border-[#0B3E39] dark:border-teal-600'
                      : 'bg-white dark:bg-[#08201D] text-stone-700 dark:text-stone-300 border-stone-200 dark:border-teal-900/40'
                  }`}
                >
                  {r.icon}
                  <span className="truncate">{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* AI Matcher button for mobile */}
          <button
            onClick={() => {
              onOpenAIMatcherModal();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-[#0B3E39] dark:text-teal-200 font-semibold text-xs cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>{t('findAnimalAI')}</span>
          </button>

          {/* Navigation Links */}
          <div className="space-y-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left cursor-pointer transition ${
                    isActive
                      ? 'bg-[#0B3E39] dark:bg-teal-700 text-white'
                      : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-teal-950/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-teal-900/40 text-xs text-stone-500 dark:text-stone-400">
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as any)}
                className="bg-transparent font-medium text-stone-700 dark:text-stone-300 focus:outline-none"
              >
                <option value="en" className="dark:bg-[#071E1B]">English (EN)</option>
                <option value="kn" className="dark:bg-[#071E1B]">ಕನ್ನಡ (KN)</option>
                <option value="hi" className="dark:bg-[#071E1B]">हिन्दी (HI)</option>
              </select>
            </div>
            <span>v1.2 Production Ready</span>
          </div>
        </div>
      )}
    </header>
  );
};
