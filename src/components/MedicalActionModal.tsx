import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Animal, EarNotchStatus } from '../types';
import { checkReturnToSiteCompliance } from '../utils/geo';
import {
  Stethoscope,
  Scissors,
  Compass,
  AlertTriangle,
  CheckCircle2,
  X,
  Calendar,
} from 'lucide-react';

interface MedicalActionModalProps {
  animal: Animal | null;
  mode: 'vaccination' | 'sterilization' | 'return_to_site';
  onClose: () => void;
}

export const MedicalActionModal: React.FC<MedicalActionModalProps> = ({ animal, mode, onClose }) => {
  const { recordVaccination, recordSterilization, recordReturnToSite, inventory } = useApp();

  // Vaccination state
  const [vaccineName, setVaccineName] = useState('Nobivac Anti-Rabies (10-dose vial)');
  const [batchNum, setBatchNum] = useState('NB-RB-2026A');
  const [vetName, setVetName] = useState('Dr. Ramesh Kumar (Reg #VET-KA-8819)');
  const [nextDueDate, setNextDueDate] = useState('2027-10-30');

  // Sterilization state
  const [surgeonName, setSurgeonName] = useState('Dr. Anita Desai (ABC Specialist)');
  const [clinicName, setClinicName] = useState('Bangalore ABC Veterinary Surgical Center');
  const [earNotch, setEarNotch] = useState<EarNotchStatus>('right_v_notch');

  // Return to site state
  const [releaseLat, setReleaseLat] = useState<number>(animal ? animal.primaryLocation.lat + 0.001 : 12.9784);
  const [releaseLng, setReleaseLng] = useState<number>(animal ? animal.primaryLocation.lng + 0.001 : 77.6408);
  const [driverName, setDriverName] = useState('Driver Suresh & Catching Officer Sneha');
  const [complianceResult, setComplianceResult] = useState<{ isCompliant: boolean; distanceMeters: number } | null>(null);

  if (!animal) return null;

  const handleVaccinationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    recordVaccination(animal.id, vaccineName, batchNum, vetName, nextDueDate);
    onClose();
  };

  const handleSterilizationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    recordSterilization(animal.id, surgeonName, clinicName, earNotch);
    onClose();
  };

  const handleReturnToSiteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = recordReturnToSite(animal.id, releaseLat, releaseLng, driverName);
    setComplianceResult(result);
    if (result.isCompliant) {
      setTimeout(() => onClose(), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 p-6 my-8">
        <div className="flex items-center justify-between pb-3 border-b mb-4">
          <div className="flex items-center gap-2">
            {mode === 'vaccination' ? (
              <Stethoscope className="w-5 h-5 text-[#0B3E39]" />
            ) : mode === 'sterilization' ? (
              <Scissors className="w-5 h-5 text-amber-600" />
            ) : (
              <Compass className="w-5 h-5 text-blue-600" />
            )}
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-wide">
              {mode === 'vaccination'
                ? 'Administer Anti-Rabies Vaccination'
                : mode === 'sterilization'
                ? 'Log ABC Sterilization & Ear Notch'
                : 'Return-to-Site Release Verification'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs text-stone-500 mb-4">
          Patient: <strong>{animal.name || 'Community Stray'}</strong> ({animal.tagNumber}) • {animal.primaryLocation.wardName}
        </div>

        {/* Mode 1: Vaccination Form */}
        {mode === 'vaccination' && (
          <form onSubmit={handleVaccinationSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-stone-700 font-bold mb-1">Vaccine Brand &amp; Batch</label>
              <select
                value={batchNum}
                onChange={(e) => setBatchNum(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-semibold"
              >
                {inventory
                  .filter((i) => i.category === 'vaccine')
                  .map((v) => (
                    <option key={v.id} value={v.batchNumber}>
                      {v.name} (Batch #{v.batchNumber} - Exp: {v.expiryDate})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">Veterinarian Name &amp; License</label>
              <input
                type="text"
                required
                value={vetName}
                onChange={(e) => setVetName(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">Next Annual Booster Due Date</label>
              <input
                type="date"
                required
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-semibold"
              />
            </div>

            <div className="flex gap-2 pt-3">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-[#0B3E39] text-[#FAF6EE] font-bold rounded-xl hover:bg-[#145E56] cursor-pointer"
              >
                Certify &amp; Update Immunity Status
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 border border-stone-200 text-stone-600 font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Mode 2: Sterilization Form */}
        {mode === 'sterilization' && (
          <form onSubmit={handleSterilizationSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-stone-700 font-bold mb-1">Surgeon In-Charge</label>
              <input
                type="text"
                required
                value={surgeonName}
                onChange={(e) => setSurgeonName(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">ABC Surgical Facility</label>
              <input
                type="text"
                required
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">Ear-Notch Applied (Humane Protocol)</label>
              <select
                value={earNotch}
                onChange={(e) => setEarNotch(e.target.value as EarNotchStatus)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-semibold"
              >
                <option value="right_v_notch">Right V-Notch (Standard ABC)</option>
                <option value="left_v_notch">Left V-Notch</option>
                <option value="tipped">Ear Tipped (Standard for Felines)</option>
              </select>
              <span className="text-[10px] text-stone-400 block mt-1">
                Visual identifier so field teams recognize sterilized animals without scanning.
              </span>
            </div>

            <div className="flex gap-2 pt-3">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 cursor-pointer"
              >
                Save ABC Surgery Record
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 border border-stone-200 text-stone-600 font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Mode 3: Return-to-Site Protocol Check */}
        {mode === 'return_to_site' && (
          <form onSubmit={handleReturnToSiteSubmit} className="space-y-3 text-xs">
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <div className="text-[10px] uppercase font-bold text-stone-400">Original Capture Location:</div>
              <div className="font-semibold text-stone-800">
                Lat: {animal.primaryLocation.lat}, Lng: {animal.primaryLocation.lng} ({animal.primaryLocation.wardName})
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-stone-700 font-bold mb-1">Release Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={releaseLat}
                  onChange={(e) => setReleaseLat(Number(e.target.value))}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2"
                />
              </div>
              <div>
                <label className="block text-stone-700 font-bold mb-1">Release Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={releaseLng}
                  onChange={(e) => setReleaseLng(Number(e.target.value))}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">Transport Officer &amp; Driver</label>
              <input
                type="text"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2"
              />
            </div>

            {complianceResult && (
              <div
                className={`p-3 rounded-xl border text-xs font-semibold ${
                  complianceResult.isCompliant
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-rose-50 text-rose-800 border-rose-300'
                }`}
              >
                {complianceResult.isCompliant ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Compliant with ABC Guidelines (Distance: {complianceResult.distanceMeters}m &lt;= 500m)</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>
                      Violation: Release distance ({complianceResult.distanceMeters}m) exceeds 500m territory limit!
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-3">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 cursor-pointer"
              >
                Validate Return-to-Site Geofence
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 border border-stone-200 text-stone-600 font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
