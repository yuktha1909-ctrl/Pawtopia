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
  const { bites, logBiteIncident, zones, animals } = useApp();
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FAF6EE] p-6 rounded-3xl border border-[#0B3E39]/15">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Radio className="w-5 h-5 text-rose-700 animate-pulse" />
            <h1 className="text-xl font-black text-[#0B3E39] uppercase tracking-wide">
              Bite Incident Surveillance &amp; Rabies Control Center
            </h1>
          </div>
          <p className="text-xs text-stone-600">
            WHO Post-Exposure Prophylaxis (PEP) triage, hospital referral routing, and 10-day animal quarantine tracking.
          </p>
        </div>

        <button
          onClick={() => setShowLogModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Log New Bite Incident</span>
        </button>
      </div>

      {/* WHO First-Aid & PEP Guidance Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Category I */}
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
          <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded-md">
            WHO Category I
          </span>
          <h4 className="text-xs font-bold text-emerald-950 mt-2">Touching / Feeding (Intact Skin)</h4>
          <p className="text-[11px] text-emerald-800 mt-1">Licking on intact skin. No exposure.</p>
          <div className="mt-2 text-[10px] font-semibold text-emerald-900 bg-white p-2 rounded-xl border border-emerald-200">
            Action: Wash exposed surface with soap and clean water. No PEP needed.
          </div>
        </div>

        {/* Category II */}
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
          <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-md">
            WHO Category II
          </span>
          <h4 className="text-xs font-bold text-amber-950 mt-2">Minor Scratches / Abrasions</h4>
          <p className="text-[11px] text-amber-800 mt-1">Nibbling of uncovered skin, minor scratches without bleeding.</p>
          <div className="mt-2 text-[10px] font-semibold text-amber-900 bg-white p-2 rounded-xl border border-amber-200">
            Action: Immediate thorough wound washing for 15 mins + Full Rabies Vaccine course (Days 0, 3, 7, 28).
          </div>
        </div>

        {/* Category III */}
        <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200">
          <span className="text-[10px] font-black uppercase text-rose-800 bg-rose-200/60 px-2 py-0.5 rounded-md">
            WHO Category III (Emergency)
          </span>
          <h4 className="text-xs font-bold text-rose-950 mt-2">Single / Multiple Transdermal Bites</h4>
          <p className="text-[11px] text-rose-800 mt-1">Bleeding punctures, contamination of mucous membranes.</p>
          <div className="mt-2 text-[10px] font-semibold text-rose-900 bg-white p-2 rounded-xl border border-rose-200">
            Action: 15-min soap wash + Rabies Immunoglobulin (RIG) infiltrated into wound + Full Vaccine series.
          </div>
        </div>
      </div>

      {/* Main Grid: Logged Bite Incidents & Nearest Anti-Rabies Clinics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Logged Bite Incidents (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-stone-800">
              Active Bite Incidents &amp; Surveillance
            </h2>
            <span className="text-[11px] font-bold text-stone-500">{bites.length} Cases Logged</span>
          </div>

          <div className="space-y-3">
            {bites.map((bite) => {
              const isCat3 = bite.biteCategory === 'category_3_deep_puncture';

              return (
                <div
                  key={bite.id}
                  className={`p-4 rounded-2xl border transition space-y-3 ${
                    bite.suspectedRabid ? 'bg-rose-50/70 border-rose-300' : 'bg-stone-50 border-stone-200'
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
                          ⚠️ Suspected Rabies
                        </span>
                      )}
                      <span className="text-xs font-bold text-stone-800">{bite.location.wardName}</span>
                    </div>

                    <span className="text-[10px] text-stone-500 font-semibold">Incident Date: {bite.incidentDate}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">Animal Involved:</span>
                      <span className="font-semibold text-stone-900">{bite.animalTagOrDescription}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">Quarantine Protocol:</span>
                      <span className="font-semibold text-stone-900 capitalize">
                        {bite.animalQuarantineStatus.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-stone-200 text-[11px] text-stone-700">
                    <strong>Medical Action &amp; PEP:</strong> {bite.actionsTaken}
                    <div className="text-stone-500 mt-0.5">Referred Facility: {bite.hospitalReferred}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Nearest Hospitals & Anti-Rabies Clinics (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b pb-3">
            <Hospital className="w-4 h-4 text-[#0B3E39]" />
            <h3 className="text-xs font-black uppercase tracking-wider text-stone-800">
              City Anti-Rabies Centers (24/7)
            </h3>
          </div>

          <div className="space-y-3">
            {hospitalsList.map((h, i) => (
              <div key={i} className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-1">
                <div className="font-black text-[#0B3E39] leading-tight">{h.name}</div>
                <div className="text-[11px] text-stone-500">{h.address}</div>
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-stone-200 mt-1">
                  <span className="text-emerald-700 font-bold">RIG &amp; Vaccine Stocked</span>
                  <a href={`tel:${h.emergencyContact}`} className="font-bold text-[#0B3E39] hover:underline">
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
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 p-6 my-8">
            <h3 className="text-sm font-black text-rose-950 uppercase tracking-wide mb-3">
              Log Bite Case &amp; Initiate PEP Protocol
            </h3>

            <form onSubmit={handleLog} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">WHO Bite Category</label>
                  <select
                    value={biteCat}
                    onChange={(e) => setBiteCat(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-semibold"
                  >
                    <option value="category_1_touch">Category I (Touch/No Blood)</option>
                    <option value="category_2_minor_scratch">Category II (Minor Scratch)</option>
                    <option value="category_3_deep_puncture">Category III (Deep Puncture/Bleed)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Victim Age Group</label>
                  <select
                    value={victimAge}
                    onChange={(e) => setVictimAge(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2"
                  >
                    <option value="child">Child (&lt; 14 yrs)</option>
                    <option value="adult">Adult</option>
                    <option value="senior">Senior (60+)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">Animal Description / Tag #</label>
                <input
                  type="text"
                  required
                  value={animalDesc}
                  onChange={(e) => setAnimalDesc(e.target.value)}
                  placeholder="E.g. Brown desi dog with clipped ear near bus stop"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Ward Location</label>
                  <select
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-semibold"
                  >
                    {zones.map((z) => (
                      <option key={z.id} value={z.wardName}>
                        {z.wardName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Quarantine Status</label>
                  <select
                    value={quarantineStatus}
                    onChange={(e) => setQuarantineStatus(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2"
                  >
                    <option value="monitoring_in_field">Field 10-Day Observation</option>
                    <option value="quarantined_10_days">Shelter Quarantine</option>
                    <option value="untraceable">Untraceable</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-rose-700 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={suspectedRabid}
                    onChange={(e) => setSuspectedRabid(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span>⚠️ Flag as Suspected Rabies (Aggression, foaming, unprovoked attack)</span>
                </label>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">Medical Hospital Referred</label>
                <input
                  type="text"
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 cursor-pointer"
                >
                  Save &amp; Broadcast Alert
                </button>
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2.5 border border-stone-200 text-stone-600 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
