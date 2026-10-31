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
  const { camps, feeders } = useApp();
  const [activeTab, setActiveTab] = useState<'camps' | 'feeders'>('camps');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FAF6EE] p-6 rounded-3xl border border-[#0B3E39]/15">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-[#0B3E39]" />
            <h1 className="text-xl font-black text-[#0B3E39] uppercase tracking-wide">
              Vaccination Camps &amp; Feeder Network
            </h1>
          </div>
          <p className="text-xs text-stone-600">
            Coordinated mobile catching routes, mass rabies blitzes, and verified community feeders leaderboard.
          </p>
        </div>

        <div className="flex bg-stone-200 p-0.5 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('camps')}
            className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'camps' ? 'bg-[#0B3E39] text-white' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Mass Vaccination Camps ({camps.length})
          </button>
          <button
            onClick={() => setActiveTab('feeders')}
            className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'feeders' ? 'bg-[#0B3E39] text-white' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Feeder Spots &amp; Badges ({feeders.length})
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
              <div key={camp.id} className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {camp.status.toUpperCase()}
                    </span>
                    <h3 className="text-sm font-black text-stone-900 mt-1">{camp.title}</h3>
                    <p className="text-xs text-stone-500">📍 {camp.zoneName}</p>
                  </div>

                  <span className="text-[11px] font-bold text-stone-600 bg-stone-50 px-2.5 py-1 rounded-xl border border-stone-200">
                    {camp.startDate} to {camp.endDate}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-bold text-stone-600">Target Achievement:</span>
                    <span className="font-black text-[#0B3E39]">
                      {camp.vaccinatedAchieved} / {camp.targetAnimals} animals ({progressPct}%)
                    </span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#0B3E39] h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, progressPct)}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <Compass className="w-3.5 h-3.5 text-[#0B3E39]" />
                    <span className="font-bold text-stone-800">Catching Routes &amp; Team:</span>
                  </div>
                  <p className="text-[11px] text-stone-600 leading-relaxed">{camp.catchingRouteNotes}</p>
                  <div className="text-[10px] text-stone-400 pt-1">
                    Lead: {camp.leadVet} • Partner NGO: {camp.leadNGO}
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
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-stone-800">
                Verified Community Animal Feeders Leaderboard
              </h2>
              <span className="text-[11px] font-bold text-stone-500">Care in Every Neighborhood</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {feeders.map((feeder, idx) => (
                <div
                  key={feeder.id}
                  className="p-4 bg-stone-50 rounded-2xl border border-stone-200 hover:border-[#0B3E39]/40 transition space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-stone-900">{feeder.feederName}</span>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                      🏆 {feeder.badgeLevel}
                    </span>
                  </div>

                  <div className="text-xs text-stone-600 space-y-1">
                    <div className="font-semibold text-stone-800">{feeder.spotName}</div>
                    <div className="text-[11px] text-stone-500">📍 {feeder.wardName}</div>
                    <div className="text-[11px] text-stone-500">Schedule: {feeder.scheduleTime}</div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-stone-200">
                    <span className="font-bold text-[#0B3E39]">{feeder.regularAnimalCount} Regular Animals</span>
                    <span className="text-stone-400">Last fed: {feeder.lastFedDate}</span>
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
