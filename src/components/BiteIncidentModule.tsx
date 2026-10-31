import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BiteIncident, Species } from '../types';
import {
  Radio,
  AlertTriangle,
  Plus,
  ShieldAlert,
  Hospital,
  HeartPulse,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export const BiteIncidentModule: React.FC = () => {
  const { bites, logBiteIncident, zones, animals, t } = useApp();
  const [showLogModal, setShowLogModal] = useState(false);

  // Form state
  const [victimAge, setVictimAge] = useState<BiteIncident['victimAgeCategory']>('adult');
  const [biteCat, setBiteCat] = useState<BiteIncident['biteCategory']>('category_2_minor_scratch');
  const [animalSpecies, setAnimalSpecies] = useState<Species>('dog');
  const [animalDesc, setAnimalDesc] = useState('');
  const [ward, setWard] = useState(zones[0]?.wardName || 'Ward 101 - Indiranagar');
  const [address, setAddress] = useState('');
  const [isVaxKnown, setIsVaxKnown] = useState(false);
  const [quarantineStatus, setQuarantineStatus] = useState<BiteIncident['animalQuarantineStatus']>('monitoring_in_field');
  const [suspectedRabid, setSuspectedRabid] = useState(false);
  const [pepGiven, setPepGiven] = useState(true);
  const [hospital, setHospital] = useState('St. John’s Medical College Hospital Anti-Rabies Clinic');
  const [actions, setActions] = useState('Immediate soap wash for 15 minutes. Administered PEP dose 0.');

  const hospitalsList = [
    { name: 'St. John’s Medical College Hospital Anti-Rabies Clinic', address: 'Sarjapur Road, Koramangala', emergencyContact: '+91 80 2206 5000', rigAvailable: true },
    { name: 'Bowring and Lady Curzon Hospital', address: 'Shivajinagar, Central Bengaluru', emergencyContact: '+91 80 2559 1325', rigAvailable: true },
    { name: 'Vydehi Institute of Medical Sciences Rabies Care', address: 'Whitefield Main Road', emergencyContact: '+91 80 2841 3308', rigAvailable: true },
    { name: 'KC General Hospital Anti-Rabies Wing', address: 'Malleshwaram 5th Cross', emergencyContact: '+91 80 2334 1771', rigAvailable: true },
  ];

  const handleLog = (e: React.FormEvent) => {
    e.preventDefault();
    logBiteIncident({
      incidentDate: new Date().toISOString().split('T')[0],
      victimAgeCategory: victimAge,
      biteCategory: biteCat,
      location: {
        lat: 12.9784,
        lng: 77.6408,
        address: address || `${ward} street`,
        wardName: ward,
      },
      animalSpecies,
      animalTagOrDescription: animalDesc || 'Unidentified street dog',
      animalVaccinationStatusKnown: isVaxKnown,
      animalQuarantineStatus: quarantineStatus,
      suspectedRabid,
      pepAdministered: pepGiven,
      hospitalReferred: hospital,
      reportedBy: 'Field Rescuer / Citizen Intake',
      actionsTaken: actions,
    });
    setShowLogModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FAF6EE] dark:bg-[#0E2825] p-6 rounded-3xl border border-[#0B3E39]/15 dark:border-teal-900/50">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Radio className="w-5 h-5 text-rose-700 dark:text-rose-400 animate-pulse" />
            <h1 className="text-xl font-black text-[#0B3E39] dark:text-teal-200 uppercase tracking-wide">
              {t('biteTitle')}
            </h1>
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-300">
            {t('biteSubtitle')}
          </p>
        </div>

        <button
          onClick={() => setShowLogModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t('logBiteReport')}</span>
        </button>
      </div>

      {/* WHO First-Aid & PEP Guidance Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Category I */}
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800">
          <span className="text-[10px] font-black uppercase text-emerald-800 dark:text-emerald-300 bg-emerald-200/60 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md">
            WHO Category I
          </span>
          <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-200 mt-2">{t('biteCat1')}</h4>
          <p className="text-[11px] text-emerald-800 dark:text-emerald-300 mt-1">Licking on intact skin. No exposure.</p>
          <div className="mt-2 text-[10px] font-semibold text-emerald-900 dark:text-emerald-200 bg-white dark:bg-[#0E2825] p-2 rounded-xl border border-emerald-200 dark:border-emerald-800">
            Action: Wash exposed surface with soap and clean water. No PEP needed.
          </div>
        </div>

        {/* Category II */}
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800">
          <span className="text-[10px] font-black uppercase text-amber-800 dark:text-amber-300 bg-amber-200/60 dark:bg-amber-900/60 px-2 py-0.5 rounded-md">
            WHO Category II
          </span>
          <h4 className="text-xs font-bold text-amber-950 dark:text-amber-200 mt-2">{t('biteCat2')}</h4>
          <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-1">Nibbling of uncovered skin, minor scratches without bleeding.</p>
          <div className="mt-2 text-[10px] font-semibold text-amber-900 dark:text-amber-200 bg-white dark:bg-[#0E2825] p-2 rounded-xl border border-amber-200 dark:border-amber-800">
            Action: Immediate thorough wound washing for 15 mins + Full Rabies Vaccine course.
          </div>
        </div>

        {/* Category III */}
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-800">
          <span className="text-[10px] font-black uppercase text-rose-800 dark:text-rose-300 bg-rose-200/60 dark:bg-rose-900/60 px-2 py-0.5 rounded-md">
            WHO Category III (Emergency)
          </span>
          <h4 className="text-xs font-bold text-rose-950 dark:text-rose-200 mt-2">{t('biteCat3')}</h4>
          <p className="text-[11px] text-rose-800 dark:text-rose-300 mt-1">Bleeding punctures, contamination of mucous membranes.</p>
          <div className="mt-2 text-[10px] font-semibold text-rose-900 dark:text-rose-200 bg-white dark:bg-[#0E2825] p-2 rounded-xl border border-rose-200 dark:border-rose-800">
            Action: 15-min soap wash + Rabies Immunoglobulin (RIG) + Full Vaccine series.
          </div>
        </div>
      </div>

      {/* Main Grid: Logged Bite Incidents & Nearest Anti-Rabies Clinics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Logged Bite Incidents (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-[#0E2825] rounded-3xl p-6 border border-stone-200 dark:border-teal-900/60 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 dark:border-teal-900/40 pb-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-stone-800 dark:text-teal-200">
              {t('biteTitle')}
            </h2>
            <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400">{bites.length} Cases Logged</span>
          </div>

          <div className="space-y-3">
            {bites.map((bite) => {
              const isCat3 = bite.biteCategory === 'category_3_deep_puncture';

              return (
                <div
                  key={bite.id}
                  className={`p-4 rounded-2xl border transition space-y-3 ${
                    bite.suspectedRabid
                      ? 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800'
                      : 'bg-stone-50 dark:bg-[#071E1B] border-stone-200 dark:border-teal-900/40'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                          isCat3 ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                        }`}
                      >
                        {bite.biteCategory.replace(/_/g, ' ')}
                      </span>
                      {bite.suspectedRabid && (
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-rose-700 text-white animate-pulse">
                          ⚠️ {t('suspectedRabidCases')}
                        </span>
                      )}
                      <span className="text-xs font-bold text-stone-800 dark:text-stone-200">{bite.location.wardName}</span>
                    </div>

                    <span className="text-[10px] text-stone-500 dark:text-stone-400 font-semibold">{t('timestamp')}: {bite.incidentDate}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-stone-400 dark:text-stone-400 block text-[10px] uppercase font-bold">{t('species')}:</span>
                      <span className="font-semibold text-stone-900 dark:text-stone-100">{bite.animalTagOrDescription}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 dark:text-stone-400 block text-[10px] uppercase font-bold">{t('quarantineStatus')}:</span>
                      <span className="font-semibold text-stone-900 dark:text-stone-100 capitalize">
                        {bite.animalQuarantineStatus.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-white dark:bg-[#0E2825] rounded-xl border border-stone-200 dark:border-teal-900/40 text-[11px] text-stone-700 dark:text-stone-300">
                    <strong>{t('actionsTaken')}:</strong> {bite.actionsTaken}
                    <div className="text-stone-500 dark:text-stone-400 mt-0.5">{t('hospitalName')}: {bite.hospitalReferred}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Nearest Hospitals & Anti-Rabies Clinics (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#0E2825] rounded-3xl p-6 border border-stone-200 dark:border-teal-900/60 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-200 dark:border-teal-900/40 pb-3">
            <Hospital className="w-4 h-4 text-[#0B3E39] dark:text-teal-400" />
            <h3 className="text-xs font-black uppercase tracking-wider text-stone-800 dark:text-teal-200">
              City Anti-Rabies Centers (24/7)
            </h3>
          </div>

          <div className="space-y-3">
            {hospitalsList.map((h, i) => (
              <div key={i} className="p-3 bg-stone-50 dark:bg-[#071E1B] rounded-2xl border border-stone-200 dark:border-teal-900/40 text-xs space-y-1">
                <div className="font-black text-[#0B3E39] dark:text-teal-200 leading-tight">{h.name}</div>
                <div className="text-[11px] text-stone-500 dark:text-stone-400">{h.address}</div>
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-stone-200 dark:border-teal-900/40 mt-1">
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">RIG &amp; Vaccine Stocked</span>
                  <a href={`tel:${h.emergencyContact}`} className="font-bold text-[#0B3E39] dark:text-teal-300 hover:underline">
                    {h.emergencyContact}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Log Bite Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#0B2522] rounded-3xl shadow-2xl border border-stone-200 dark:border-teal-900/60 p-6 my-8">
            <h3 className="text-sm font-black text-rose-950 dark:text-rose-300 uppercase tracking-wide mb-3">
              {t('logBiteReport')}
            </h3>

            <form onSubmit={handleLog} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1">{t('biteCategory')}</label>
                  <select
                    value={biteCat}
                    onChange={(e) => setBiteCat(e.target.value as any)}
                    className="w-full bg-stone-50 dark:bg-[#071B19] border border-stone-200 dark:border-teal-900/50 rounded-xl p-2 font-semibold text-stone-800 dark:text-stone-200"
                  >
                    <option value="category_1_touch">Category I (Touch/No Blood)</option>
                    <option value="category_2_minor_scratch">Category II (Minor Scratch)</option>
                    <option value="category_3_deep_puncture">Category III (Deep Puncture/Bleed)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1">{t('victimCategory')}</label>
                  <select
                    value={victimAge}
                    onChange={(e) => setVictimAge(e.target.value as any)}
                    className="w-full bg-stone-50 dark:bg-[#071B19] border border-stone-200 dark:border-teal-900/50 rounded-xl p-2 text-stone-800 dark:text-stone-200"
                  >
                    <option value="child">Child (&lt; 14 yrs)</option>
                    <option value="adult">Adult</option>
                    <option value="senior">Senior (60+)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1">{t('distinctiveMarks')}</label>
                <input
                  type="text"
                  required
                  value={animalDesc}
                  onChange={(e) => setAnimalDesc(e.target.value)}
                  placeholder="E.g. Brown desi dog with clipped ear near bus stop"
                  className="w-full bg-stone-50 dark:bg-[#071B19] border border-stone-200 dark:border-teal-900/50 rounded-xl p-2 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1">{t('primaryTerritory')}</label>
                  <select
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-[#071B19] border border-stone-200 dark:border-teal-900/50 rounded-xl p-2 font-semibold text-stone-800 dark:text-stone-200"
                  >
                    {zones.map((z) => (
                      <option key={z.id} value={z.wardName}>
                        {z.wardName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1">{t('quarantineStatus')}</label>
                  <select
                    value={quarantineStatus}
                    onChange={(e) => setQuarantineStatus(e.target.value as any)}
                    className="w-full bg-stone-50 dark:bg-[#071B19] border border-stone-200 dark:border-teal-900/50 rounded-xl p-2 text-stone-800 dark:text-stone-200"
                  >
                    <option value="monitoring_in_field">{t('fieldMonitoring')}</option>
                    <option value="quarantined_10_days">{t('quarantine10Days')}</option>
                    <option value="untraceable">{t('untraceable')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={suspectedRabid}
                    onChange={(e) => setSuspectedRabid(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span>⚠️ {t('suspectedRabidCases')}</span>
                </label>
              </div>

              <div>
                <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1">{t('hospitalName')}</label>
                <input
                  type="text"
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-[#071B19] border border-stone-200 dark:border-teal-900/50 rounded-xl p-2 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 cursor-pointer"
                >
                  {t('save')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2.5 border border-stone-200 dark:border-teal-900/50 text-stone-600 dark:text-stone-300 font-bold rounded-xl cursor-pointer"
                >
                  {t('cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
