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
  const { zones, animals, reports, camps } = useApp();

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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-[#0B3E39] text-xs font-bold">
          <Globe className="w-3.5 h-3.5 text-teal-600" />
          <span>Open Public City Transparency Portal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#0B3E39] uppercase tracking-wide">
          Bengaluru Stray Animal Welfare &amp; Rabies Eradication Mission
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          Real-time aggregated municipal progress tracking towards a 100% Rabies-Free City by 2030. In compliance with
          animal protection guidelines, all individual animal coordinates and rescuer identities are completely
          anonymized.
        </p>
      </div>

      {/* City-Wide Macro Indicators */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs text-center space-y-1">
          <span className="text-[10px] uppercase font-bold text-stone-400">Total Vaccinated Strays</span>
          <div className="text-3xl font-black text-[#0B3E39]">{totalVaccinated.toLocaleString()}</div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block">
            {cityVaxCoverage}% City Herd Immunity
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs text-center space-y-1">
          <span className="text-[10px] uppercase font-bold text-stone-400">Humane Sterilizations</span>
          <div className="text-3xl font-black text-stone-900">{totalSterilized.toLocaleString()}</div>
          <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full inline-block">
            {citySterilCoverage}% ABC Population Target
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs text-center space-y-1">
          <span className="text-[10px] uppercase font-bold text-stone-400">Rescues &amp; Treatments</span>
          <div className="text-3xl font-black text-stone-900">{totalRescues}</div>
          <span className="text-xs font-bold text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-full inline-block">
            100% Response Rate
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs text-center space-y-1">
          <span className="text-[10px] uppercase font-bold text-stone-400">Mega Blitz Camps Held</span>
          <div className="text-3xl font-black text-stone-900">{completedCamps}</div>
          <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full inline-block">
            Mobile Catching Crews
          </span>
        </div>
      </div>

      {/* Ward-by-Ward Public Progress Grid */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-stone-800">
            Ward-Level Immunity &amp; Sterilization Progress
          </h2>
          <span className="text-[11px] font-bold text-stone-500">Public Accountability Scoreboard</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {zones.map((zone) => {
            const vPct = Math.round((zone.vaccinatedCount / zone.estimatedStrayPopulation) * 100);
            const sPct = Math.round((zone.sterilizedCount / zone.estimatedStrayPopulation) * 100);

            return (
              <div key={zone.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-stone-900">{zone.wardName.split('-')[1] || zone.wardName}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FAF6EE] text-[#0B3E39] border border-[#0B3E39]/20">
                    Zone {zone.zoneNumber}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-stone-500 font-medium">Rabies Vax:</span>
                      <span className="font-bold text-[#0B3E39]">{vPct}%</span>
                    </div>
                    <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-[#0B3E39] h-full rounded-full" style={{ width: `${vPct}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-stone-500 font-medium">ABC Sterilization:</span>
                      <span className="font-bold text-teal-700">{sPct}%</span>
                    </div>
                    <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-teal-600 h-full rounded-full" style={{ width: `${sPct}%` }} />
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-stone-400 pt-1 border-t border-stone-200">
                  Est. Population: ~{zone.estimatedStrayPopulation} dogs &amp; cats
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
