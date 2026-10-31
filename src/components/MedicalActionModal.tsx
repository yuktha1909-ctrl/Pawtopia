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
  const { recordVaccination, recordSterilization, recordReturnToSite, inventory, t } = useApp();

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
      <div className="relative w-full max-w-lg bg-white dark:bg-[#071E1B] rounded-3xl shadow-2xl border border-stone-200 dark:border-teal-900/60 p-6 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-teal-900/40 mb-4">
          <div className="flex items-center gap-2">
            {mode === 'vaccination' ? (
              <Stethoscope className="w-5 h-5 text-[#0B3E39] dark:text-teal-400" />
            ) : mode === 'sterilization' ? (
              <Scissors className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            ) : (
              <Compass className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            )}
            <h3 className="text-sm font-black text-stone-900 dark:text-stone-100 uppercase tracking-wide">
              {mode === 'vaccination'
                ? t('recordARVTitle')
                : mode === 'sterilization'
                ? t('recordABCTitle')
                : t('recordReturnTitle')}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs text-stone-500 dark:text-stone-400 mb-4">
          {t('name')}: <strong>{animal.name || (animal.species === 'dog' ? t('dog') : t('cat'))}</strong> ({animal.tagNumber}) • {animal.primaryLocation.wardName}
        </div>

        {/* Mode 1: Vaccination Form */}
        {mode === 'vaccination' && (
          <form onSubmit={handleVaccinationSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1">{t('vaccineBatch')}</label>
              <select
                value={batchNum}
                onChange={(e) => setBatchNum(e.target.value)}
                className="w-full bg-stone-50 dark:bg-[#0E2825] border border-stone-200 dark:border-teal-900/50 rounded-xl p-2 font-semibold text-stone-900 dark:text-stone-100"
              >
                {inventory
                  .filter((i) => i.category === 'vaccine')
                  .map((v) => (
                    <option key={v.id} value={v.batchNumber}>
                      {v.name} ({t('batchNumber')} #{v.batchNumber} - Exp: {v.expiryDate})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1">{t('veterinarianName')}</label>
              <input
                type="text"
                required
                value={vetName}
                onChange={(e) => setVetName(e.target.value)}
                className="w-full bg-stone-50 dark:bg-[#0E2825] border border-stone-200 dark:border-teal-900/50 rounded-xl p-2 text-stone-900 dark:text-stone-100"
              />
            </div>

            <div>
              <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1">{t('nextDoseDue')}</label>
              <input
                type="date"
                required
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
                className="w-full bg-stone-50 dark:bg-[#0E2825] border border-stone-200 dark:border-teal-900/50 rounded-xl p-2 font-semibold text-stone-900 dark:text-stone-100"
              />
            </div>

            <div className="flex gap-2 pt-3">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-[#0B3E39] dark:bg-teal-700 text-[#FAF6EE] font-bold rounded-xl hover:bg-[#145E56] cursor-pointer"
              >
                {t('saveProcedure')}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 border border-stone-200 dark:border-teal-900/50 text-stone-600 dark:text-stone-300 font-bold rounded-xl cursor-pointer"
              >
                {t('cancel')}
              </button>
            </div>
          </form>
        )}

        {/* Mode 2: Sterilization Form */}
        {mode === 'sterilization' && (
          <form onSubmit={handleSterilizationSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1">{t('surgeonName')}</label>
              <input
                type="text"
                required
                value={surgeonName}
                onChange={(e) => setSurgeonName(e.target.value)}
                className="w-full bg-stone-50 dark:bg-[#0E2825] border border-stone-200 dark:border-teal-900/50 rounded-xl p-2 text-stone-900 dark:text-stone-100"
              />
            </div>

            <div>
              <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1">{t('surgeryCenter')}</label>
              <input
                type="text"
                required
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="w-full bg-stone-50 dark:bg-[#0E2825] border border-stone-200 dark:border-teal-900/50 rounded-xl p-2 text-stone-900 dark:text-stone-100"
              />
            </div>

            <div>
              <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1">{t('earNotchApplied')}</label>
              <select
                value={earNotch}
                onChange={(e) => setEarNotch(e.target.value as EarNotchStatus)}
                className="w-full bg-stone-50 dark:bg-[#0E2825] border border-stone-200 dark:border-teal-900/50 rounded-xl p-2 font-semibold text-stone-900 dark:text-stone-100"
              >
                <option value="right_v_notch">{t('rightVNotch')}</option>
                <option value="left_v_notch">{t('leftVNotch')}</option>
                <option value="tipped">{t('tipped')}</option>
              </select>
              <span className="text-[10px] text-stone-400 dark:text-stone-400 block mt-1">
                Visual identifier so field teams recognize sterilized animals without scanning.
              </span>
            </div>

            <div className="flex gap-2 pt-3">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-amber-600 dark:bg-amber-700 text-white font-bold rounded-xl hover:bg-amber-700 dark:hover:bg-amber-600 cursor-pointer"
              >
                {t('saveProcedure')}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 border border-stone-200 dark:border-teal-900/50 text-stone-600 dark:text-stone-300 font-bold rounded-xl cursor-pointer"
              >
                {t('cancel')}
              </button>
            </div>
          </form>
        )}

        {/* Mode 3: Return-to-Site Protocol Check */}
        {mode === 'return_to_site' && (
          <form onSubmit={handleReturnToSiteSubmit} className="space-y-3 text-xs">
            <div className="p-3 bg-stone-50 dark:bg-[#0E2825] rounded-xl border border-stone-200 dark:border-teal-900/50">
              <div className="text-[10px] uppercase font-bold text-stone-400 dark:text-stone-400">Original Capture Location:</div>
              <div className="font-semibold text-stone-800 dark:text-stone-200">
                Lat: {animal.primaryLocation.lat}, Lng: {animal.primaryLocation.lng} ({animal.primaryLocation.wardName})
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1">Release Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={releaseLat}
                  onChange={(e) => setReleaseLat(Number(e.target.value))}
                  className="w-full bg-stone-50 dark:bg-[#0E2825] border border-stone-200 dark:border-teal-900/50 rounded-xl p-2 text-stone-900 dark:text-stone-100"
                />
              </div>
              <div>
                <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1">Release Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={releaseLng}
                  onChange={(e) => setReleaseLng(Number(e.target.value))}
                  className="w-full bg-stone-50 dark:bg-[#0E2825] border border-stone-200 dark:border-teal-900/50 rounded-xl p-2 text-stone-900 dark:text-stone-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1">{t('driverName')}</label>
              <input
                type="text"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="w-full bg-stone-50 dark:bg-[#0E2825] border border-stone-200 dark:border-teal-900/50 rounded-xl p-2 text-stone-900 dark:text-stone-100"
              />
            </div>

            {complianceResult && (
              <div
                className={`p-3 rounded-xl border text-xs font-semibold ${
                  complianceResult.isCompliant
                    ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/70 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-800'
                }`}
              >
                {complianceResult.isCompliant ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{t('compliantRelease')} ({complianceResult.distanceMeters}m &lt;= 500m)</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    <span>
                      {t('nonCompliantRelease')} ({complianceResult.distanceMeters}m &gt; 500m)
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-3">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-blue-700 dark:bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-800 cursor-pointer"
              >
                {t('returnGeofenceCheck')}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 border border-stone-200 dark:border-teal-900/50 text-stone-600 dark:text-stone-300 font-bold rounded-xl cursor-pointer"
              >
                {t('cancel')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
