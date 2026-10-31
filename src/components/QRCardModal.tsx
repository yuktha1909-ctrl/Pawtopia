import React, { useState } from 'react';
import { Animal } from '../types';
import { PawtopiaLogo } from './PawtopiaLogo';
import { useApp } from '../context/AppContext';
import { getVaccinationBadgeMeta } from '../utils/vaccination';
import {
  Printer,
  ShieldCheck,
  Calendar,
  MapPin,
  ExternalLink,
  X,
  Stethoscope,
  Scissors,
  CheckCircle2,
  AlertCircle,
  Share2,
} from 'lucide-react';

interface QRCardModalProps {
  animal: Animal | null;
  onClose: () => void;
  onOpenVaccinationDialog?: (animal: Animal) => void;
  onOpenSterilizationDialog?: (animal: Animal) => void;
}

export const QRCardModal: React.FC<QRCardModalProps> = ({
  animal,
  onClose,
  onOpenVaccinationDialog,
  onOpenSterilizationDialog,
}) => {
  const { role } = useApp();
  const [activeTab, setActiveTab] = useState<'card' | 'public_scan'>('card');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!animal) return null;

  const vaxMeta = getVaccinationBadgeMeta(animal.vaccinationStatus);
  const publicUrl = `${window.location.origin}/?animal=${animal.tagNumber}`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#071E1B] rounded-3xl shadow-2xl border border-stone-200 dark:border-teal-900/50 overflow-hidden my-8 transition-colors duration-200">
        {/* Header Bar */}
        <div className="no-print flex items-center justify-between px-6 py-4 bg-[#FAF6EE] dark:bg-[#051815] border-b border-stone-200 dark:border-teal-900/40">
          <div className="flex items-center gap-2">
            <PawtopiaLogo variant="icon" size="sm" />
            <div>
              <h2 className="text-sm font-black text-[#0B3E39] dark:text-[#FAF6EE] leading-tight">Digital Animal Health Identity</h2>
              <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">Collar ID #{animal.tagNumber}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-stone-200 dark:bg-teal-950/80 p-0.5 rounded-xl text-xs font-bold">
              <button
                onClick={() => setActiveTab('card')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  activeTab === 'card'
                    ? 'bg-[#0B3E39] dark:bg-teal-700 text-white'
                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                Collar Tag Card
              </button>
              <button
                onClick={() => setActiveTab('public_scan')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  activeTab === 'public_scan'
                    ? 'bg-[#0B3E39] dark:bg-teal-700 text-white'
                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                Public Scan Page
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-teal-950/60 transition cursor-pointer"
              aria-label="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab 1: Printable Collar-Tag / ID Card */}
        {activeTab === 'card' && (
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between no-print">
              <p className="text-xs text-stone-500">
                Print and laminate this collar card or QR tag for field teams, community feeders, and pet collars.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-stone-500" />
                  <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#0B3E39] text-[#FAF6EE] text-xs font-bold hover:bg-[#145E56] transition shadow-xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Collar Tag</span>
                </button>
              </div>
            </div>

            {/* THE PRINTABLE CARD */}
            <div className="printable-tag mx-auto max-w-md bg-[#FAF6EE] border-2 border-dashed border-[#0B3E39]/40 rounded-2xl p-5 shadow-sm relative">
              {/* Card Top Brand Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#0B3E39]/15">
                <PawtopiaLogo variant="full" size="sm" />
                <div className="text-right">
                  <span className="text-[9px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                    Rabies Surveillance Tag
                  </span>
                  <div className="text-[10px] font-bold text-stone-600 mt-0.5">Helpline: 1800-PAW-HELP</div>
                </div>
              </div>

              {/* Card Body */}
              <div className="grid grid-cols-12 gap-4 py-4 items-center">
                {/* Photo & Ear Notch */}
                <div className="col-span-4 flex flex-col items-center">
                  <div className="relative">
                    <img
                      src={animal.photoUrl}
                      alt={animal.name || animal.tagNumber}
                      className="w-24 h-24 rounded-xl object-cover border-2 border-[#0B3E39] shadow-xs"
                    />
                    {animal.earNotch !== 'none' && (
                      <span className="absolute -bottom-2 bg-[#0B3E39] text-[#FAF6EE] text-[9px] font-black px-1.5 py-0.5 rounded-md border border-white">
                        ✂ {animal.earNotch.replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-stone-600 mt-2 capitalize">
                    {animal.gender} • {animal.species}
                  </span>
                </div>

                {/* Main Animal Info */}
                <div className="col-span-5 space-y-1">
                  <div className="text-base font-black text-[#0B3E39] leading-tight">
                    {animal.name || 'Community Stray'}
                  </div>
                  <div className="text-xs font-bold text-stone-800">ID: {animal.tagNumber}</div>
                  <div className="text-[11px] text-stone-600">Ward: {animal.primaryLocation.wardName}</div>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border border-current">
                    <span className={`w-2 h-2 rounded-full ${vaxMeta.dotClass}`} />
                    <span>{vaxMeta.label}</span>
                  </div>
                  <div className="text-[10px] text-stone-500 mt-1">
                    Next Due: {animal.nextVaccinationDueDate || 'Schedule Pending'}
                  </div>
                </div>

                {/* QR Code */}
                <div className="col-span-3 flex flex-col items-center text-center">
                  {animal.qrCodeUrl ? (
                    <img
                      src={animal.qrCodeUrl}
                      alt={`QR Code for ${animal.tagNumber}`}
                      className="w-20 h-20 rounded-lg border border-[#0B3E39]/30 bg-white p-1"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-stone-100 rounded-lg flex items-center justify-center text-stone-400 text-xs">
                      QR Ready
                    </div>
                  )}
                  <span className="text-[9px] font-bold text-stone-500 mt-1 uppercase tracking-tight">
                    Scan for Health ID
                  </span>
                </div>
              </div>

              {/* Card Footer Warning */}
              <div className="pt-2 border-t border-[#0B3E39]/15 flex items-center justify-between text-[9px] text-stone-500">
                <span>Under Humane Animal Birth Control (ABC) Protection</span>
                <span className="font-mono font-bold">Bangalore Municipal Corp &amp; Pawtopia</span>
              </div>
            </div>

            {/* Quick Actions for NGO/Vet */}
            {(role === 'vet' || role === 'ngo' || role === 'admin') && (
              <div className="mt-6 p-4 bg-teal-50/60 rounded-2xl border border-teal-200 flex flex-wrap items-center justify-between gap-3 no-print">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-teal-800" />
                  <span className="text-xs font-bold text-[#0B3E39]">Veterinary Field Actions:</span>
                </div>
                <div className="flex items-center gap-2">
                  {onOpenVaccinationDialog && (
                    <button
                      onClick={() => onOpenVaccinationDialog(animal)}
                      className="px-3 py-1.5 bg-[#0B3E39] text-[#FAF6EE] text-xs font-bold rounded-xl hover:bg-[#145E56] transition cursor-pointer"
                    >
                      + Log Rabies Vaccine
                    </button>
                  )}
                  {onOpenSterilizationDialog && animal.sterilizationStatus !== 'sterilized' && (
                    <button
                      onClick={() => onOpenSterilizationDialog(animal)}
                      className="px-3 py-1.5 bg-amber-600 text-white text-xs font-bold rounded-xl hover:bg-amber-700 transition cursor-pointer"
                    >
                      ✂ Log ABC Sterilization
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Public Scan Page (Sanitized View - No Personal Data Exposed) */}
        {activeTab === 'public_scan' && (
          <div className="p-6 bg-stone-50">
            <div className="max-w-md mx-auto bg-white rounded-2xl p-6 shadow-md border border-stone-200">
              {/* Verification Stamp */}
              <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl text-xs font-bold mb-4">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Verified by Municipal Stray Surveillance Database</span>
              </div>

              <div className="text-center mb-4">
                <img
                  src={animal.photoUrl}
                  alt={animal.name || animal.tagNumber}
                  className="w-32 h-32 rounded-2xl mx-auto object-cover border-4 border-[#FAF6EE] shadow-md"
                />
                <h3 className="text-lg font-black text-stone-900 mt-2">
                  {animal.name || `Community ${animal.species.toUpperCase()}`}
                </h3>
                <p className="text-xs font-bold text-stone-500">Official Tag: {animal.tagNumber}</p>
              </div>

              {/* Public Safety & Health Badges */}
              <div className="space-y-3">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="text-[10px] uppercase font-bold text-stone-400">Rabies Immunity Status</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-bold text-stone-800">{vaxMeta.label}</span>
                    <span className={`w-3 h-3 rounded-full ${vaxMeta.dotClass}`} />
                  </div>
                  <div className="text-xs text-stone-500 mt-1">
                    Last Dose: {animal.lastVaccinationDate || 'Not on file'} • Next Booster Due:{' '}
                    {animal.nextVaccinationDueDate || 'Pending'}
                  </div>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="text-[10px] uppercase font-bold text-stone-400">Sterilization &amp; ABC Status</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-bold text-stone-800 capitalize">
                      {animal.sterilizationStatus === 'sterilized' ? 'Sterilized & Ear-Notched' : 'Intact / Unscheduled'}
                    </span>
                    {animal.earNotch !== 'none' && (
                      <span className="text-xs font-bold bg-[#0B3E39] text-[#FAF6EE] px-2 py-0.5 rounded-md">
                        {animal.earNotch.replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="text-[10px] uppercase font-bold text-stone-400">Registered Territory</div>
                  <div className="text-xs font-semibold text-stone-800 mt-1">
                    {animal.primaryLocation.wardName} (Safe Community Zone)
                  </div>
                </div>
              </div>

              {/* Privacy Notice Banner */}
              <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Privacy Protected:</strong> In compliance with Animal Welfare &amp; Privacy Acts, individual
                  feeder and rescuer personal contact information is redacted on public scan pages.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
