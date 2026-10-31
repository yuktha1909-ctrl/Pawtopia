import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Camp, FeederSpot } from '../types';
import {
  Users,
  Calendar,
  Award,
  MapPin,
  CheckCircle2,
  Clock,
  Compass,
  Heart,
  Plus,
} from 'lucide-react';

export const CampsAndFeeders: React.FC = () => {
  const { camps, feeders, t } = useApp();
  const [activeTab, setActiveTab] = useState<'camps' | 'feeders'>('camps');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FAF6EE] dark:bg-[#0E2825] p-6 rounded-3xl border border-[#0B3E39]/15 dark:border-teal-900/50">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-[#0B3E39] dark:text-teal-400" />
            <h1 className="text-xl font-black text-[#0B3E39] dark:text-teal-200 uppercase tracking-wide">
              {t('campsTitle')}
            </h1>
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-300">
            {t('campsSubtitle')}
          </p>
        </div>

        <div className="flex bg-stone-200 dark:bg-[#071E1B] p-0.5 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('camps')}
            className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'camps' ? 'bg-[#0B3E39] dark:bg-teal-700 text-white' : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            {t('activeCamps')} ({camps.length})
          </button>
          <button
            onClick={() => setActiveTab('feeders')}
            className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'feeders' ? 'bg-[#0B3E39] dark:bg-teal-700 text-white' : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            {t('registeredFeeders')} ({feeders.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Camps */}
      {activeTab === 'camps' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {camps.map((camp) => {
            const isCompleted = camp.status === 'completed';
            const progressPct = Math.round((camp.vaccinatedAchieved / camp.targetAnimals) * 100);

            return (
              <div key={camp.id} className="bg-white dark:bg-[#0E2825] rounded-3xl p-6 border border-stone-200 dark:border-teal-900/60 shadow-xs space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-800'
                      }`}
                    >
                      {isCompleted ? t('statusResolved') : t('statusInProgress')}
                    </span>
                    <h3 className="text-sm font-black text-stone-900 dark:text-stone-100 mt-1">{camp.title}</h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400">📍 {camp.zoneName}</p>
                  </div>

                  <span className="text-[11px] font-bold text-stone-600 dark:text-stone-300 bg-stone-50 dark:bg-[#071E1B] px-2.5 py-1 rounded-xl border border-stone-200 dark:border-teal-900/40">
                    {camp.startDate} to {camp.endDate}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-bold text-stone-600 dark:text-stone-400">{t('targetAnimals')}:</span>
                    <span className="font-black text-[#0B3E39] dark:text-teal-300">
                      {camp.vaccinatedAchieved} / {camp.targetAnimals} ({progressPct}%)
                    </span>
                  </div>
                  <div className="w-full bg-stone-100 dark:bg-[#071E1B] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#0B3E39] dark:bg-teal-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, progressPct)}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 bg-stone-50 dark:bg-[#071E1B] rounded-2xl border border-stone-200 dark:border-teal-900/40 text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <Compass className="w-3.5 h-3.5 text-[#0B3E39] dark:text-teal-400" />
                    <span className="font-bold text-stone-800 dark:text-stone-200">{t('targetZone')}:</span>
                  </div>
                  <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed">{camp.catchingRouteNotes}</p>
                  <div className="text-[10px] text-stone-400 dark:text-stone-400 pt-1">
                    {t('leadVet')}: {camp.leadVet} • {t('leadNGO')}: {camp.leadNGO}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Feeders */}
      {activeTab === 'feeders' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#0E2825] rounded-3xl p-6 border border-stone-200 dark:border-teal-900/60 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-teal-900/40 pb-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-stone-800 dark:text-teal-200">
                {t('registeredFeeders')}
              </h2>
              <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400">{t('tagline')}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {feeders.map((feeder) => (
                <div
                  key={feeder.id}
                  className="p-4 bg-stone-50 dark:bg-[#071E1B] rounded-2xl border border-stone-200 dark:border-teal-900/40 hover:border-[#0B3E39]/40 transition space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-stone-900 dark:text-stone-100">{feeder.feederName}</span>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                      🏆 {feeder.badgeLevel}
                    </span>
                  </div>

                  <div className="text-xs text-stone-600 dark:text-stone-400 space-y-1">
                    <div className="font-semibold text-stone-800 dark:text-stone-200">{feeder.spotName}</div>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400">📍 {feeder.wardName}</div>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400">Schedule: {feeder.scheduleTime}</div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-stone-200 dark:border-teal-900/40">
                    <span className="font-bold text-[#0B3E39] dark:text-teal-300">{feeder.regularAnimalCount} {t('regularPackCount')}</span>
                    <span className="text-stone-400 dark:text-stone-400">Last fed: {feeder.lastFedDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
