import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Database,
  CloudUpload,
  Layers,
  ChevronDown,
  Info,
  Clock,
} from 'lucide-react';

export const PWASyncStatusIndicator: React.FC = () => {
  const {
    isOnline,
    offlineQueue,
    offlineQueueCount,
    isSyncing,
    lastSyncTime,
    syncOfflineQueue,
    toggleSimulateOffline,
    t,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* The Small Status Pill in the Navbar */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all shadow-xs cursor-pointer select-none ${
          !isOnline
            ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200/80 ring-2 ring-amber-400/30'
            : isSyncing
            ? 'bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100'
            : offlineQueueCount > 0
            ? 'bg-teal-50 text-teal-800 border-teal-300 hover:bg-teal-100'
            : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
        }`}
        aria-expanded={isOpen}
        aria-label="PWA Offline Sync Status"
        title="Click to view PWA background sync and queued field records"
      >
        {/* Pulsing indicator dot */}
        <span className="relative flex h-2 w-2">
          {!isOnline ? (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600" />
            </>
          ) : isSyncing ? (
            <span className="animate-spin inline-flex rounded-full h-2 w-2 bg-blue-600" />
          ) : (
            <>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </>
          )}
        </span>

        {/* Icon */}
        {!isOnline ? (
          <WifiOff className="w-3.5 h-3.5 text-amber-700" />
        ) : isSyncing ? (
          <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
        ) : (
          <Wifi className="w-3.5 h-3.5 text-emerald-600" />
        )}

        {/* Label */}
        <span>
          {!isOnline
            ? t('syncOffline')
            : isSyncing
            ? t('syncingNow')
            : t('syncOnline')}
        </span>

        {/* Queue badge count */}
        {offlineQueueCount > 0 && (
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              !isOnline
                ? 'bg-amber-800 text-white'
                : 'bg-teal-700 text-white'
            }`}
          >
            {offlineQueueCount}
          </span>
        )}

        <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
      </button>

      {/* Dropdown / Reassurance Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-stone-200 p-4 z-50 text-xs text-stone-700 animate-in fade-in-50 zoom-in-95">
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#0B3E39]" />
              <h3 className="font-black text-stone-900 text-xs uppercase tracking-wide">
                PWA Field Offline Sync
              </h3>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                !isOnline
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}
            >
              {!isOnline ? 'Offline Storage Mode' : 'Cloud Connected'}
            </span>
          </div>

          {/* Reassurance Message */}
          <div className="my-3 p-2.5 bg-[#FAF6EE] rounded-xl border border-[#0B3E39]/15 text-[11px] text-[#0B3E39] leading-relaxed">
            <div className="font-bold flex items-center gap-1.5 mb-0.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-700 flex-shrink-0" />
              <span>Safe Field Work Guarantee</span>
            </div>
            All animal registrations, emergency reports, and rabies logs are safely cached in browser local storage.
            They will automatically push to Pawtopia Cloud the moment your device reconnects.
          </div>

          {/* Sync Status Counters */}
          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-[10px] text-stone-400 font-bold uppercase block">Queued Actions</span>
              <span className="text-base font-black text-stone-900">
                {offlineQueueCount} pending
              </span>
            </div>

            <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-[10px] text-stone-400 font-bold uppercase block">Last Cloud Sync</span>
              <span className="text-xs font-bold text-stone-800 block mt-1 truncate">
                {lastSyncTime}
              </span>
            </div>
          </div>

          {/* Pending Queue Items List */}
          {offlineQueue.length > 0 && (
            <div className="mb-3 space-y-1.5 max-h-36 overflow-y-auto pr-1">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">
                Pending Sync Actions ({offlineQueue.length})
              </span>
              {offlineQueue.map((item) => (
                <div
                  key={item.id}
                  className="p-2 bg-stone-50 rounded-lg border border-stone-200 text-[11px] flex items-center justify-between gap-2"
                >
                  <div className="truncate">
                    <span className="font-bold text-stone-800 block truncate">{item.title}</span>
                    <span className="text-[10px] text-stone-500 truncate">{item.payloadSummary}</span>
                  </div>
                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded">
                    Queued
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Actions & Simulation Controls */}
          <div className="pt-2 border-t border-stone-100 flex flex-col gap-2">
            {offlineQueueCount > 0 && isOnline && (
              <button
                type="button"
                onClick={syncOfflineQueue}
                disabled={isSyncing}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-[#0B3E39] text-[#FAF6EE] text-xs font-bold hover:bg-[#145E56] transition cursor-pointer disabled:opacity-50"
              >
                <CloudUpload className="w-3.5 h-3.5" />
                <span>{isSyncing ? 'Synchronizing with Cloud...' : 'Flush & Sync Queue Now'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={toggleSimulateOffline}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-50 text-[11px] font-bold transition cursor-pointer"
            >
              {!isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Restore Live Online Connection</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                  <span>Simulate Field Offline (Test Queueing)</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
