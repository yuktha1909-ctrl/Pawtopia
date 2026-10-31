import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Zone } from '../types';
import { PawtopiaLogo } from './PawtopiaLogo';
import {
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  FileDown,
  Printer,
  ChevronDown,
  ChevronUp,
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

export const ReadinessScoreCard: React.FC = () => {
  const { zones, getWardReadiness } = useApp();
  const [selectedWardId, setSelectedWardId] = useState<string>(zones[0]?.id || '');
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  // Compute readiness scores for all wards and sort descending
  const scoredWards = zones.map((zone) => ({
    zone,
    readiness: getWardReadiness(zone),
  }));

  scoredWards.sort((a, b) => b.readiness.overallScore - a.readiness.overallScore);

  const activeWardData = scoredWards.find((w) => w.zone.id === selectedWardId) || scoredWards[0];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Rabies Free Safe Zone':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Rabies Resilient':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'Good':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Moderate':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'High Risk':
      default:
        return 'bg-rose-100 text-rose-800 border-rose-300';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FAF6EE] p-6 rounded-3xl border border-[#0B3E39]/15 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-5 h-5 text-[#0B3E39]" />
            <h1 className="text-xl font-black text-[#0B3E39] uppercase tracking-wide">
              Ward Rabies-Free Readiness Index (0-100)
            </h1>
          </div>
          <p className="text-xs text-stone-600 max-w-2xl">
            Algorithmic readiness scoring combining vaccination herd immunity (70% target), humane sterilization rates,
            bite incident penalties, rescue response speed, and census freshness.
          </p>
        </div>

        <button
          onClick={() => setShowExportModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B3E39] text-[#FAF6EE] text-xs font-bold hover:bg-[#145E56] transition shadow-xs cursor-pointer self-start md:self-auto"
        >
          <FileDown className="w-4 h-4" />
          <span>Export Municipal PDF Report</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Ranked Ward Leaderboard (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-stone-800">
              City Ward Leaderboard (Ranked)
            </h2>
            <span className="text-[11px] font-bold text-stone-500">8 Municipal Wards</span>
          </div>

          <div className="space-y-2.5">
            {scoredWards.map(({ zone, readiness }, idx) => {
              const isSelected = zone.id === activeWardData?.zone.id;
              const isFirst = idx === 0;

              return (
                <button
                  key={zone.id}
                  onClick={() => setSelectedWardId(zone.id)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition text-left cursor-pointer ${
                    isSelected
                      ? 'bg-[#FAF6EE] border-[#0B3E39] shadow-xs ring-1 ring-[#0B3E39]/20'
                      : 'bg-stone-50 border-stone-200 hover:bg-stone-100/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                        isFirst ? 'bg-amber-400 text-stone-900' : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-stone-900">{zone.wardName}</div>
                      <div className="text-[10px] text-stone-500">
                        Pop: ~{zone.estimatedStrayPopulation} • Vax: {readiness.metrics.vaccinationCoveragePct}%
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-[#0B3E39]">{readiness.overallScore}/100</span>
                    <span
                      className={`block text-[9px] font-bold px-1.5 py-0.2 rounded-md border mt-0.5 ${getTierColor(
                        readiness.tier
                      )}`}
                    >
                      {readiness.tier}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Ward Breakdown & Gap Analysis (7 cols) */}
        {activeWardData && (
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Comprehensive Ward Analysis
                </span>
                <h2 className="text-lg font-black text-stone-900">{activeWardData.zone.wardName}</h2>
                <p className="text-xs text-stone-500">Zonal Lead: {activeWardData.zone.zoneOfficer}</p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-2xl font-black text-[#0B3E39]">
                  {activeWardData.readiness.overallScore}
                  <span className="text-sm font-bold text-stone-400">/100</span>
                </span>
                <span
                  className={`inline-block sm:block text-[10px] font-bold px-2 py-0.5 rounded-full border ml-2 sm:ml-0 mt-1 ${getTierColor(
                    activeWardData.readiness.tier
                  )}`}
                >
                  {activeWardData.readiness.tier}
                </span>
              </div>
            </div>

            {/* Score Component Breakdown Bar */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-stone-800">
                Evaluation Component Breakdown
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* 1. Vaccination Coverage */}
                <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-stone-700">Rabies Vaccination (Max 40)</span>
                    <span className="font-black text-[#0B3E39]">
                      {activeWardData.readiness.metrics.vaccinationScore} / 40 pts
                    </span>
                  </div>
                  <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden mb-1.5">
                    <div
                      className="bg-[#0B3E39] h-full rounded-full transition-all duration-500"
                      style={{ width: `${(activeWardData.readiness.metrics.vaccinationScore / 40) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-stone-500">
                    <span>Coverage: {activeWardData.readiness.metrics.vaccinationCoveragePct}%</span>
                    <span>Target: 70% (WHO Threshold)</span>
                  </div>
                </div>

                {/* 2. Sterilization Coverage */}
                <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-stone-700">Humane Sterilization (Max 30)</span>
                    <span className="font-black text-[#0B3E39]">
                      {activeWardData.readiness.metrics.sterilizationScore} / 30 pts
                    </span>
                  </div>
                  <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden mb-1.5">
                    <div
                      className="bg-teal-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(activeWardData.readiness.metrics.sterilizationScore / 30) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-stone-500">
                    <span>Coverage: {activeWardData.readiness.metrics.sterilizationCoveragePct}%</span>
                    <span>Target: 70% ABC</span>
                  </div>
                </div>

                {/* 3. Bite Safety Index */}
                <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-stone-700">Bite Safety (Max 15)</span>
                    <span className="font-black text-stone-800">
                      {15 - activeWardData.readiness.metrics.biteIncidentPenalty} / 15 pts
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-600 mt-1">
                    {activeWardData.zone.biteIncidentsLast90Days} bite incidents in last 90 days
                    {activeWardData.readiness.metrics.biteIncidentPenalty > 0 && (
                      <span className="text-rose-600 font-semibold block text-[10px]">
                        (-{activeWardData.readiness.metrics.biteIncidentPenalty} pts penalty applied)
                      </span>
                    )}
                  </div>
                </div>

                {/* 4. Response Time */}
                <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-stone-700">Ambulance Response Speed</span>
                    <span className="font-black text-stone-800">
                      {activeWardData.readiness.metrics.responseTimeScore} / 10 pts
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-600 mt-1">
                    Avg response time: <strong>{activeWardData.zone.avgResponseTimeHours} hours</strong>
                    <span className="text-stone-400 block text-[10px]">Municipal target: &lt; 4 hours</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Gap Analysis Box */}
            <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-rose-900 font-black text-xs">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>SPECIFIC ACTIONABLE GAPS IDENTIFIED</span>
              </div>
              <ul className="space-y-1.5 text-xs text-rose-800 pl-6 list-disc">
                {activeWardData.readiness.gaps.map((gap, gIdx) => (
                  <li key={gIdx} className="font-medium">
                    {gap}
                  </li>
                ))}
              </ul>
            </div>

            {/* Targeted Recommendations */}
            <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-[#0B3E39] font-black text-xs">
                <CheckCircle2 className="w-4 h-4 text-teal-700" />
                <span>RECOMMENDED FIELD DEPLOYMENT</span>
              </div>
              <ul className="space-y-1.5 text-xs text-teal-900 pl-6 list-disc">
                {activeWardData.readiness.recommendations.map((rec, rIdx) => (
                  <li key={rIdx} className="font-semibold">
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* PDF Export Modal / Printable Sheet */}
      {showExportModal && activeWardData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-stone-200 p-8 my-8">
            <div className="flex items-center justify-between border-b pb-4 mb-6 no-print">
              <h3 className="text-sm font-bold text-stone-800">Municipal Audit &amp; Funding Report Preview</h3>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-[#0B3E39] text-[#FAF6EE] text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save as PDF</span>
                </button>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="px-3 py-2 border rounded-xl text-xs font-bold text-stone-600 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Printable Report Document */}
            <div className="space-y-6 text-stone-900 font-sans">
              <div className="flex items-center justify-between border-b-2 border-[#0B3E39] pb-4">
                <PawtopiaLogo variant="full" size="md" />
                <div className="text-right text-xs">
                  <div className="font-bold text-[#0B3E39]">Bruhat Bengaluru Mahanagara Palike (BBMP)</div>
                  <div>Animal Welfare &amp; Rabies Eradication Task Force</div>
                  <div className="text-stone-500">Date: {new Date().toLocaleDateString()}</div>
                </div>
              </div>

              <div className="text-center py-2">
                <h2 className="text-lg font-black uppercase text-[#0B3E39]">
                  Official Rabies-Free Readiness Scorecard
                </h2>
                <p className="text-xs text-stone-600">
                  Target Evaluation for {activeWardData.zone.wardName} (Zone {activeWardData.zone.zoneNumber})
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 p-4 bg-[#FAF6EE] rounded-2xl border border-stone-300 text-center">
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-500 block">Overall Score</span>
                  <span className="text-2xl font-black text-[#0B3E39]">
                    {activeWardData.readiness.overallScore}/100
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-500 block">Readiness Tier</span>
                  <span className="text-sm font-black text-stone-800 block mt-1">
                    {activeWardData.readiness.tier}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-500 block">Est. Stray Population</span>
                  <span className="text-xl font-bold text-stone-800">
                    {activeWardData.zone.estimatedStrayPopulation} animals
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-stone-800 uppercase">Gaps Pulling Score Down</h4>
                <div className="p-3 bg-stone-50 border rounded-xl text-xs space-y-1">
                  {activeWardData.readiness.gaps.map((g, i) => (
                    <div key={i}>• {g}</div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-stone-800 uppercase">Recommended Budget &amp; Resource Allocation</h4>
                <div className="p-3 bg-stone-50 border rounded-xl text-xs space-y-1">
                  {activeWardData.readiness.recommendations.map((r, i) => (
                    <div key={i}>• {r}</div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t flex justify-between text-[11px] text-stone-500">
                <div>Verified by: {activeWardData.zone.zoneOfficer}</div>
                <div>Generated by Pawtopia Stray Intelligence Platform</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
