import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Species, ReportSeverity } from '../types';
import {
  AlertTriangle,
  Camera,
  MapPin,
  CheckCircle2,
  X,
  ShieldAlert,
  Loader2,
  Upload,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface EmergencyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyReportModal: React.FC<EmergencyReportModalProps> = ({ isOpen, onClose }) => {
  const { addEmergencyReport, zones, t } = useApp();

  const [species, setSpecies] = useState<Species>('dog');
  const [severity, setSeverity] = useState<ReportSeverity>('high');
  const [issueType, setIssueType] = useState<
    'injured' | 'suspected_rabies' | 'aggressive_pack' | 'sick_puppies' | 'hit_and_run' | 'cruelty'
  >('injured');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [wardName, setWardName] = useState(zones[0]?.wardName || 'Ward 101 - Indiranagar');
  const [lat, setLat] = useState<number>(12.9784);
  const [lng, setLng] = useState<number>(77.6408);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string>('https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80');
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedReportCode, setSubmittedReportCode] = useState<string | null>(null);

  if (!isOpen) return null;

  // Auto capture GPS coordinates
  const handleCaptureGPS = () => {
    setLocating(true);
    if (!navigator.geolocation) {
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(Number(pos.coords.latitude.toFixed(6)));
        setLng(Number(pos.coords.longitude.toFixed(6)));
        setAddress(`GPS Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)}`);
        setLocating(false);
      },
      (err) => {
        console.warn('Geolocation capture failed:', err);
        setLocating(false);
      }
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPhotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setSubmitting(true);
    try {
      const rep = await addEmergencyReport({
        reporterName: isAnonymous ? 'Anonymous Citizen' : reporterName || 'Concerned Citizen',
        reporterPhone: isAnonymous ? undefined : reporterPhone,
        isAnonymous,
        species,
        severity,
        issueType,
        description,
        location: {
          lat,
          lng,
          address: address || `${wardName} street corner`,
          wardName,
        },
        photoUrl,
        status: 'reported',
      });

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#0B3E39', '#14B8A6', '#FAF6EE', '#E63946'],
      });

      setSubmittedReportCode(rep.reportNumber);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedReportCode(null);
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-rose-50 border-b border-rose-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-600 text-white rounded-xl shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-rose-950 uppercase tracking-wide">
                Emergency Animal Rescue Intake
              </h2>
              <span className="text-[11px] font-semibold text-rose-700">Immediate routing to nearest NGO ambulance</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {submittedReportCode ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl mx-auto flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="text-xl font-black text-stone-900">Rescue Report Logged!</h3>
            <p className="text-xs text-stone-600 max-w-sm mx-auto">
              Your report has been broadcast to the on-duty rescue ambulance and municipal triage coordinator for{' '}
              <strong>{wardName}</strong>.
            </p>

            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 inline-block">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Tracking Reference Code</span>
              <span className="text-xl font-black text-[#0B3E39] font-mono tracking-wider">{submittedReportCode}</span>
            </div>

            <div>
              <button
                onClick={handleReset}
                className="w-full py-3 rounded-xl bg-[#0B3E39] text-[#FAF6EE] font-bold text-xs hover:bg-[#145E56] transition shadow-md cursor-pointer"
              >
                Done &amp; Return to Map
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            {/* Species & Severity */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-700 font-bold mb-1">Species</label>
                <select
                  value={species}
                  onChange={(e) => setSpecies(e.target.value as Species)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-semibold focus:outline-none"
                >
                  <option value="dog">🐕 Stray Dog</option>
                  <option value="cat">🐈 Stray Cat</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">Urgency / Severity</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as ReportSeverity)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-semibold focus:outline-none"
                >
                  <option value="critical">🚨 Critical / Life Threatening</option>
                  <option value="high">⚠️ High Urgency</option>
                  <option value="medium">🟡 Medium Urgency</option>
                  <option value="low">🟢 Low / Non-Urgent</option>
                </select>
              </div>
            </div>

            {/* Emergency Issue Type */}
            <div>
              <label className="block text-stone-700 font-bold mb-1">Incident Classification</label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value as any)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-semibold focus:outline-none"
              >
                <option value="injured">Severe Physical Injury / Open Wound</option>
                <option value="hit_and_run">Vehicle Hit &amp; Run Collision</option>
                <option value="suspected_rabies">⚠️ Suspected Rabies (Aggression, Salivation)</option>
                <option value="sick_puppies">Abandoned / Sick Litter of Puppies/Kittens</option>
                <option value="aggressive_pack">Aggressive Pack Confrontation</option>
                <option value="cruelty">Animal Abuse / Cruelty Incident</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-stone-700 font-bold mb-1">
                Description of Animal &amp; Condition <span className="text-rose-600">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="E.g. Brown dog limping with bleeding paw near metro pillar 42. Unable to bear weight."
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#0B3E39]/30"
              />
            </div>

            {/* Location & GPS Auto-capture */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-stone-700 font-bold">Location &amp; Ward</label>
                <button
                  type="button"
                  onClick={handleCaptureGPS}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0B3E39] hover:underline cursor-pointer"
                >
                  {locating ? <Loader2 className="w-3 h-3 animate-spin" /> : <MapPin className="w-3 h-3" />}
                  <span>{locating ? 'Capturing GPS...' : 'Auto-Capture My GPS'}</span>
                </button>
              </div>

              <select
                value={wardName}
                onChange={(e) => setWardName(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-semibold focus:outline-none"
              >
                {zones.map((z) => (
                  <option key={z.id} value={z.wardName}>
                    {z.wardName}
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Specific landmark or street address (e.g. Opposite State Bank, 100ft Rd)"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 focus:outline-none"
              />
            </div>

            {/* Photo Attachment */}
            <div>
              <label className="block text-stone-700 font-bold mb-1">Photo Attachment</label>
              <div className="flex items-center gap-3">
                <img
                  src={photoUrl}
                  alt="Incident Preview"
                  className="w-14 h-14 rounded-xl object-cover border border-stone-200"
                />
                <label className="flex-1 flex items-center justify-center gap-2 p-2.5 border border-dashed border-stone-300 rounded-xl bg-stone-50 hover:bg-stone-100 cursor-pointer text-stone-600 font-semibold">
                  <Camera className="w-4 h-4 text-[#0B3E39]" />
                  <span>Upload Incident Photo</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* Anonymous Toggle & Reporter Info */}
            <div className="pt-2 border-t border-stone-100 space-y-2">
              <label className="flex items-center gap-2 text-stone-700 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded text-[#0B3E39] focus:ring-[#0B3E39]"
                />
                <span>Submit Anonymously (Hide my contact details from logs)</span>
              </label>

              {!isAnonymous && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <input
                    type="text"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    placeholder="Your Name (Optional)"
                    className="bg-stone-50 border border-stone-200 rounded-xl p-2"
                  />
                  <input
                    type="tel"
                    value={reporterPhone}
                    onChange={(e) => setReporterPhone(e.target.value)}
                    placeholder="Phone for updates"
                    className="bg-stone-50 border border-stone-200 rounded-xl p-2"
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-[#E63946] text-white font-bold text-xs uppercase tracking-wider hover:bg-rose-700 transition shadow-md shadow-rose-600/20 active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
              <span>{submitting ? 'Broadcasting Rescue Alert...' : 'Broadcast Emergency Rescue Request'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
