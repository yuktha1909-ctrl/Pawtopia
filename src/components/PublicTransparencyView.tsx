import React from 'react';
import { useApp } from '../context/AppContext';
import { PawtopiaLogo } from './PawtopiaLogo';
import {
  Globe,
  ShieldCheck,
  Award,
  Users,
  Activity,
  Heart,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

export const PublicTransparencyView: React.FC = () => {
  const { zones, animals, reports, camps, t } = useApp();

  // Compute aggregated city-wide metrics
  const totalEstimatedStrays = zones.reduce((sum, z) => sum + z.estimatedStrayPopulation, 0);
  const totalVaccinated = zones.reduce((sum, z) => sum + z.vaccinatedCount, 0);
  const totalSterilized = zones.reduce((sum, z) => sum + z.sterilizedCount, 0);
  const cityVaxCoverage = Math.round((totalVaccinated / totalEstimatedStrays) * 100);
  const citySterilCoverage = Math.round((totalSterilized / totalEstimatedStrays) * 100);
  const totalRescues = reports.length;
  const completedCamps = camps.filter((c) => c.status === 'completed').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-[#0B3E39] dark:text-teal-200 text-xs font-bold">
          <Globe className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span>{t('transparencyTitle')}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#0B3E39] dark:text-teal-200 uppercase tracking-wide">
          {t('transparencyTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
          {t('publicSummary')}
        </p>
      </div>

      {/* City-Wide Macro Indicators */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0E2825] p-6 rounded-3xl border border-stone-200 dark:border-teal-900/60 shadow-xs text-center space-y-1">
          <span className="text-[10px] uppercase font-bold text-stone-400 dark:text-stone-400">{t('totalVaccinationsToDate')}</span>
          <div className="text-3xl font-black text-[#0B3E39] dark:text-teal-200">{totalVaccinated.toLocaleString()}</div>
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full inline-block">
            {cityVaxCoverage}% {t('herdImmunityTarget')}
          </span>
        </div>

        <div className="bg-white dark:bg-[#0E2825] p-6 rounded-3xl border border-stone-200 dark:border-teal-900/60 shadow-xs text-center space-y-1">
          <span className="text-[10px] uppercase font-bold text-stone-400 dark:text-stone-400">{t('totalSterilizationsToDate')}</span>
          <div className="text-3xl font-black text-stone-900 dark:text-stone-100">{totalSterilized.toLocaleString()}</div>
          <span className="text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded-full inline-block">
            {citySterilCoverage}% {t('sterilizedPercentage')}
          </span>
        </div>

        <div className="bg-white dark:bg-[#0E2825] p-6 rounded-3xl border border-stone-200 dark:border-teal-900/60 shadow-xs text-center space-y-1">
          <span className="text-[10px] uppercase font-bold text-stone-400 dark:text-stone-400">{t('emergencyTitle')}</span>
          <div className="text-3xl font-black text-stone-900 dark:text-stone-100">{totalRescues}</div>
          <span className="text-xs font-bold text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 px-2.5 py-0.5 rounded-full inline-block">
            100% {t('statusResolved')}
          </span>
        </div>

        <div className="bg-white dark:bg-[#0E2825] p-6 rounded-3xl border border-stone-200 dark:border-teal-900/60 shadow-xs text-center space-y-1">
          <span className="text-[10px] uppercase font-bold text-stone-400 dark:text-stone-400">{t('activeCamps')}</span>
          <div className="text-3xl font-black text-stone-900 dark:text-stone-100">{completedCamps}</div>
          <span className="text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full inline-block">
            {t('scheduleDrive')}
          </span>
        </div>
      </div>

      {/* Ward-by-Ward Public Progress Grid */}
      <div className="bg-white dark:bg-[#0E2825] rounded-3xl p-6 border border-stone-200 dark:border-teal-900/60 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-teal-900/40 pb-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-stone-800 dark:text-teal-200">
            {t('readinessTitle')}
          </h2>
          <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400">{t('openAuditHeading')}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {zones.map((zone) => {
            const vPct = Math.round((zone.vaccinatedCount / zone.estimatedStrayPopulation) * 100);
            const sPct = Math.round((zone.sterilizedCount / zone.estimatedStrayPopulation) * 100);

            return (
              <div key={zone.id} className="p-4 bg-stone-50 dark:bg-[#071E1B] rounded-2xl border border-stone-200 dark:border-teal-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-stone-900 dark:text-stone-100">{zone.wardName.split('-')[1] || zone.wardName}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FAF6EE] dark:bg-[#0B2522] text-[#0B3E39] dark:text-teal-300 border border-[#0B3E39]/20 dark:border-teal-800">
                    Zone {zone.zoneNumber}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-stone-500 dark:text-stone-400 font-medium">{t('wardMetricVaccination')}:</span>
                      <span className="font-bold text-[#0B3E39] dark:text-teal-300">{vPct}%</span>
                    </div>
                    <div className="w-full bg-stone-200 dark:bg-stone-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-[#0B3E39] dark:bg-teal-500 h-full rounded-full" style={{ width: `${vPct}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-stone-500 dark:text-stone-400 font-medium">{t('wardMetricSterilization')}:</span>
                      <span className="font-bold text-teal-700 dark:text-teal-400">{sPct}%</span>
                    </div>
                    <div className="w-full bg-stone-200 dark:bg-stone-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-teal-600 dark:bg-teal-400 h-full rounded-full" style={{ width: `${sPct}%` }} />
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-stone-400 dark:text-stone-400 pt-1 border-t border-stone-200 dark:border-teal-900/40">
                  Est. Population: ~{zone.estimatedStrayPopulation} {t('dog')}s &amp; {t('cat')}s
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
