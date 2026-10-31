import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Animal } from '../types';
import { PawtopiaLogo } from './PawtopiaLogo';
import {
  CollarTagPreset,
  COLLAR_TAG_PRESETS,
  CollarTagOptions,
  formatCollarTagData,
  FormattedCollarTagData,
  chunkAnimalsForSheet,
} from '../utils/collarTag';
import {
  Printer,
  Download,
  Scissors,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Layers,
  Copy,
  ExternalLink,
  X,
  Phone,
  ShieldCheck,
  Tag,
  CircleDot,
  Settings2,
} from 'lucide-react';

interface CollarTagLabelGeneratorProps {
  animal: Animal | null;
  allAnimals: Animal[];
  isOpen: boolean;
  onClose: () => void;
  onSelectAnimal?: (animal: Animal) => void;
}

export const CollarTagLabelGenerator: React.FC<CollarTagLabelGeneratorProps> = ({
  animal,
  allAnimals,
  isOpen,
  onClose,
  onSelectAnimal,
}) => {
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>(animal?.id || allAnimals[0]?.id || '');
  const [preset, setPreset] = useState<CollarTagPreset>('standard_hanging');
  const [isBatchMode, setIsBatchMode] = useState<boolean>(false);
  const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>(
    animal ? [animal.id] : allAnimals.slice(0, 8).map((a) => a.id)
  );

  const [options, setOptions] = useState<CollarTagOptions>({
    includePhoto: true,
    includeHelpline: true,
    includeLegalNotice: true,
    highContrastMonochrome: false,
    twoSidedFold: false,
    emergencyPhone: '1800-PAW-HELP',
    authorityName: 'Bangalore Municipal Corp & Pawtopia',
  });

  const [qrCodeMap, setQrCodeMap] = useState<Record<string, string>>({});
  const [copiedLink, setCopiedLink] = useState(false);
  const printableRef = useRef<HTMLDivElement>(null);

  // Sync selected animal ID when prop changes
  useEffect(() => {
    if (animal) {
      setSelectedAnimalId(animal.id);
      if (!selectedBatchIds.includes(animal.id)) {
        setSelectedBatchIds((prev) => [animal.id, ...prev.filter((id) => id !== animal.id)]);
      }
    }
  }, [animal]);

  // Current primary animal
  const currentAnimal = allAnimals.find((a) => a.id === selectedAnimalId) || animal || allAnimals[0];

  // Batch animals list
  const batchAnimals = allAnimals.filter((a) => selectedBatchIds.includes(a.id));

  // Generate QR code data URLs for active animals
  useEffect(() => {
    const animalsToGenerate = isBatchMode ? batchAnimals : currentAnimal ? [currentAnimal] : [];

    animalsToGenerate.forEach(async (anim) => {
      if (anim && !qrCodeMap[anim.id]) {
        try {
          const publicUrl = `${window.location.origin}/?animal=${encodeURIComponent(anim.tagNumber)}`;
          const qrUrl = await QRCode.toDataURL(publicUrl, {
            margin: 1,
            width: 320,
            errorCorrectionLevel: 'H',
            color: options.highContrastMonochrome
              ? { dark: '#000000', light: '#ffffff' }
              : { dark: '#0B3E39', light: '#FAF6EE' },
          });
          setQrCodeMap((prev) => ({ ...prev, [anim.id]: qrUrl }));
        } catch (err) {
          console.error('Error generating QR for collar tag:', err);
        }
      }
    });
  }, [currentAnimal, batchAnimals, isBatchMode, options.highContrastMonochrome]);

  if (!isOpen || !currentAnimal) return null;

  const currentFormatted = formatCollarTagData(currentAnimal, options);
  const currentPresetMeta = COLLAR_TAG_PRESETS[preset];

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(currentFormatted.publicScanUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const toggleBatchAnimal = (id: string) => {
    setSelectedBatchIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white dark:bg-[#071E1B] rounded-3xl shadow-2xl border border-stone-200 dark:border-teal-900/50 overflow-hidden my-4 flex flex-col max-h-[92vh] transition-colors duration-200">
        {/* Modal Top Header (Hidden on Print) */}
        <div className="no-print flex items-center justify-between px-6 py-4 bg-[#FAF6EE] dark:bg-[#051815] border-b border-stone-200 dark:border-teal-900/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0B3E39] text-[#FAF6EE] rounded-2xl shadow-xs">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-[#0B3E39] dark:text-[#FAF6EE]">
                  Collar Tag &amp; Field Label Generator
                </h2>
                <span className="text-[10px] font-black uppercase tracking-wider bg-teal-100 dark:bg-teal-900/80 text-[#0B3E39] dark:text-teal-200 px-2 py-0.5 rounded-full border border-teal-300 dark:border-teal-700">
                  Standard Format
                </span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                Printable, tamper-resistant QR collar tags for newly registered strays with hole-punch &amp; strap-slot cut lines.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B3E39] text-[#FAF6EE] hover:bg-[#145E56] text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print {isBatchMode ? `Batch (${batchAnimals.length})` : 'Collar Tag'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-teal-950/60 transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content Grid */}
        <div className="no-print grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto divide-y lg:divide-y-0 lg:divide-x divide-stone-200 dark:divide-teal-900/40">
          {/* Left Column: Generator Controls & Options */}
          <div className="lg:col-span-4 p-5 space-y-5 bg-stone-50/70 dark:bg-[#071E1B]/50 overflow-y-auto">
            {/* Mode Switcher: Single vs Batch */}
            <div>
              <label className="block text-[11px] font-black text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">
                Printing Mode
              </label>
              <div className="grid grid-cols-2 gap-2 bg-stone-200 dark:bg-teal-950/80 p-1 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setIsBatchMode(false)}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    !isBatchMode
                      ? 'bg-[#0B3E39] dark:bg-teal-700 text-white shadow-xs'
                      : 'text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>Single Animal</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsBatchMode(true);
                    setPreset('sheet_grid');
                  }}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    isBatchMode
                      ? 'bg-[#0B3E39] dark:bg-teal-700 text-white shadow-xs'
                      : 'text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Batch Sheet (A4)</span>
                </button>
              </div>
            </div>

            {/* Animal Selection */}
            {!isBatchMode ? (
              <div>
                <label className="block text-[11px] font-black text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5">
                  Select Registered Animal
                </label>
                <select
                  value={selectedAnimalId}
                  onChange={(e) => setSelectedAnimalId(e.target.value)}
                  className="w-full bg-white dark:bg-[#051815] border border-stone-300 dark:border-teal-800 rounded-xl px-3 py-2 text-xs font-bold text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#0B3E39] cursor-pointer"
                >
                  {allAnimals.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.tagNumber} - {a.name || `Community ${a.species}`} ({a.primaryLocation.wardName})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-black text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    Select Strays for Batch ({selectedBatchIds.length} chosen)
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedBatchIds(
                        selectedBatchIds.length === allAnimals.length
                          ? []
                          : allAnimals.map((a) => a.id)
                      )
                    }
                    className="text-[10px] font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                  >
                    {selectedBatchIds.length === allAnimals.length ? 'Clear All' : 'Select All'}
                  </button>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1.5 p-2 bg-white dark:bg-[#051815] rounded-xl border border-stone-200 dark:border-teal-850">
                  {allAnimals.map((a) => {
                    const isChecked = selectedBatchIds.includes(a.id);
                    return (
                      <label
                        key={a.id}
                        className={`flex items-center gap-2 p-1.5 rounded-lg text-xs cursor-pointer transition ${
                          isChecked
                            ? 'bg-teal-50 dark:bg-teal-950/60 font-bold text-[#0B3E39] dark:text-teal-200'
                            : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-teal-950/30'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleBatchAnimal(a.id)}
                          className="rounded text-[#0B3E39] focus:ring-[#0B3E39]"
                        />
                        <span className="truncate flex-1">
                          {a.tagNumber} - {a.name || a.species}
                        </span>
                        <span className="text-[9px] px-1 py-0.5 rounded bg-stone-100 dark:bg-teal-900/60 text-stone-500 dark:text-stone-300">
                          {a.vaccinationStatus}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Standard Collar Tag Preset Selector */}
            <div>
              <label className="block text-[11px] font-black text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">
                Standard Collar Tag Dimensions
              </label>
              <div className="space-y-2">
                {(Object.keys(COLLAR_TAG_PRESETS) as CollarTagPreset[]).map((key) => {
                  const p = COLLAR_TAG_PRESETS[key];
                  const isSelected = preset === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setPreset(key)}
                      className={`w-full text-left p-3 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? 'border-[#0B3E39] dark:border-teal-500 bg-teal-50/70 dark:bg-teal-950/60 shadow-2xs'
                          : 'border-stone-200 dark:border-teal-900/40 bg-white dark:bg-[#051815] hover:border-stone-300 dark:hover:border-teal-800'
                      }`}
                    >
                      <div
                        className={`p-1.5 rounded-xl shrink-0 ${
                          isSelected
                            ? 'bg-[#0B3E39] text-[#FAF6EE]'
                            : 'bg-stone-100 dark:bg-teal-900/50 text-stone-500 dark:text-stone-400'
                        }`}
                      >
                        {key === 'standard_hanging' && <CircleDot className="w-4 h-4" />}
                        {key === 'collar_slide' && <Scissors className="w-4 h-4" />}
                        {key === 'feline_compact' && <Sparkles className="w-4 h-4" />}
                        {key === 'sheet_grid' && <Layers className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-black truncate ${
                              isSelected
                                ? 'text-[#0B3E39] dark:text-teal-200'
                                : 'text-stone-800 dark:text-stone-200'
                            }`}
                          >
                            {p.name}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-stone-500 dark:text-stone-400 shrink-0">
                            {p.widthMm} × {p.heightMm} mm
                          </span>
                        </div>
                        <p className="text-[10.5px] text-stone-500 dark:text-stone-400 line-clamp-2 mt-0.5">
                          {p.recommendedFor}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Customization Toggles */}
            <div className="pt-2 border-t border-stone-200 dark:border-teal-900/40 space-y-2">
              <label className="block text-[11px] font-black text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">
                Collar Tag Specifications &amp; Field Settings
              </label>

              <label className="flex items-center justify-between text-xs text-stone-700 dark:text-stone-300 cursor-pointer p-1">
                <span>Include Animal Photo</span>
                <input
                  type="checkbox"
                  checked={options.includePhoto}
                  onChange={(e) => setOptions({ ...options, includePhoto: e.target.checked })}
                  className="rounded text-[#0B3E39] focus:ring-[#0B3E39]"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-stone-700 dark:text-stone-300 cursor-pointer p-1">
                <span>24/7 Helpline &amp; Authority Seal</span>
                <input
                  type="checkbox"
                  checked={options.includeHelpline}
                  onChange={(e) => setOptions({ ...options, includeHelpline: e.target.checked })}
                  className="rounded text-[#0B3E39] focus:ring-[#0B3E39]"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-stone-700 dark:text-stone-300 cursor-pointer p-1">
                <span>Humane ABC Legal Protection Notice</span>
                <input
                  type="checkbox"
                  checked={options.includeLegalNotice}
                  onChange={(e) => setOptions({ ...options, includeLegalNotice: e.target.checked })}
                  className="rounded text-[#0B3E39] focus:ring-[#0B3E39]"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-stone-700 dark:text-stone-300 cursor-pointer p-1">
                <span>Double-Sided Fold-Over Layout</span>
                <input
                  type="checkbox"
                  checked={options.twoSidedFold}
                  onChange={(e) => setOptions({ ...options, twoSidedFold: e.target.checked })}
                  className="rounded text-[#0B3E39] focus:ring-[#0B3E39]"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-stone-700 dark:text-stone-300 cursor-pointer p-1">
                <span>High-Contrast Black &amp; White (Thermal / Vinyl)</span>
                <input
                  type="checkbox"
                  checked={options.highContrastMonochrome}
                  onChange={(e) =>
                    setOptions({ ...options, highContrastMonochrome: e.target.checked })
                  }
                  className="rounded text-[#0B3E39] focus:ring-[#0B3E39]"
                />
              </label>
            </div>

            {/* Quick Action Links */}
            <div className="pt-2 border-t border-stone-200 dark:border-teal-900/40 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={handleCopyLink}
                className="text-stone-600 dark:text-stone-400 hover:text-[#0B3E39] dark:hover:text-teal-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedLink ? 'Copied Public URL!' : 'Copy Public Health URL'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Live Tag Render & Scale Preview */}
          <div className="lg:col-span-8 p-6 bg-stone-100 dark:bg-[#051815] flex flex-col items-center justify-center min-h-[460px] overflow-y-auto">
            {/* Top Toolbar / Spec Badge */}
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-stone-600 dark:text-stone-300">
                  Physical Scale Spec:
                </span>
                <span className="text-xs font-mono font-black text-[#0B3E39] dark:text-teal-300 bg-white dark:bg-teal-950/80 px-2.5 py-1 rounded-lg border border-stone-200 dark:border-teal-800">
                  {currentPresetMeta.widthMm}mm × {currentPresetMeta.heightMm}mm ({currentPresetMeta.widthInches}" × {currentPresetMeta.heightInches}")
                </span>
                <span className="text-[10px] text-stone-500 dark:text-stone-400">
                  Hole Punch: {currentPresetMeta.holePunch.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400">
                <Scissors className="w-3.5 h-3.5 text-stone-400" />
                <span>Standard Cut &amp; Eyelet Guides Active</span>
              </div>
            </div>

            {/* Live Interactive Tag Preview Box */}
            <div className="w-full flex flex-col items-center justify-center p-4">
              {preset === 'sheet_grid' || isBatchMode ? (
                /* Multi-Tag Sheet Preview */
                <div className="w-full max-w-2xl bg-white text-stone-900 p-6 rounded-2xl shadow-lg border border-stone-300 space-y-4">
                  <div className="flex items-center justify-between border-b pb-2 text-xs">
                    <div className="flex items-center gap-2">
                      <PawtopiaLogo variant="full" size="sm" />
                      <span className="font-bold text-stone-600">| Field Batch Tag Sheet</span>
                    </div>
                    <span className="text-[10px] font-mono text-stone-400">
                      Standard A4 Adhesive Grid (8 Tags/Page)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {(batchAnimals.length > 0 ? batchAnimals : [currentAnimal]).slice(0, 8).map((anim) => (
                      <SingleCollarTagItem
                        key={anim.id}
                        animal={anim}
                        formatted={formatCollarTagData(anim, options)}
                        qrUrl={qrCodeMap[anim.id] || anim.qrCodeUrl}
                        preset="standard_hanging"
                        options={options}
                        isSheetMode={true}
                      />
                    ))}
                  </div>

                  <div className="text-center pt-2 border-t border-dashed border-stone-200 text-[10px] text-stone-400">
                    ✂ Cut along outer border lines. Punch 4mm hole at top center circle for split ring attachment.
                  </div>
                </div>
              ) : (
                /* Single Tag Layout Preview */
                <div className="flex flex-col items-center">
                  <SingleCollarTagItem
                    animal={currentAnimal}
                    formatted={currentFormatted}
                    qrUrl={qrCodeMap[currentAnimal.id] || currentAnimal.qrCodeUrl}
                    preset={preset}
                    options={options}
                    isSheetMode={false}
                  />

                  {/* Attachment Instructions */}
                  <div className="mt-5 max-w-md text-center space-y-1">
                    <p className="text-xs font-semibold text-stone-600 dark:text-stone-300">
                      Attachment Guide for Field Workers:
                    </p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      {preset === 'collar_slide'
                        ? 'Cut along the dual vertical dashed slots on both sides and slide onto a 1" or 3/4" collar strap.'
                        : preset === 'feline_compact'
                        ? 'Punch hole at top eyelet and attach with mini safety ring to feline breakaway collar.'
                        : 'Punch 4mm eyelet at marked center circle and attach using tamper-proof split ring or zip-tie.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer (Hidden on Print) */}
        <div className="no-print flex items-center justify-between px-6 py-3 bg-[#FAF6EE] dark:bg-[#051815] border-t border-stone-200 dark:border-teal-900/40 text-xs">
          <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
            <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Compliant with Municipal Animal Welfare &amp; Rabies Surveillance Rules 2023</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-300 dark:border-teal-800 text-stone-700 dark:text-stone-200 font-bold hover:bg-stone-100 dark:hover:bg-teal-950/60 transition cursor-pointer"
            >
              Done
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2 rounded-xl bg-[#0B3E39] text-[#FAF6EE] font-bold hover:bg-[#145E56] transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Collar Tag</span>
            </button>
          </div>
        </div>
      </div>

      {/* PRINT-ONLY CONTAINER (This is styled specifically for @media print in global CSS) */}
      <div id="pawtopia-printable-collar-tags" className="hidden print:block fixed inset-0 bg-white p-4 z-[99999]">
        <style dangerouslySetInnerHTML={{
          __html: `
            @media print {
              body * {
                visibility: hidden;
              }
              #pawtopia-printable-collar-tags, #pawtopia-printable-collar-tags * {
                visibility: visible;
              }
              #pawtopia-printable-collar-tags {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                background: white !important;
                color: black !important;
              }
              .no-print {
                display: none !important;
              }
            }
          `
        }} />
        <div className="max-w-[210mm] mx-auto p-2">
          {preset === 'sheet_grid' || isBatchMode ? (
            <div className="grid grid-cols-2 gap-4">
              {(batchAnimals.length > 0 ? batchAnimals : [currentAnimal]).map((anim) => (
                <SingleCollarTagItem
                  key={`print-${anim.id}`}
                  animal={anim}
                  formatted={formatCollarTagData(anim, options)}
                  qrUrl={qrCodeMap[anim.id] || anim.qrCodeUrl}
                  preset="standard_hanging"
                  options={options}
                  isSheetMode={true}
                />
              ))}
            </div>
          ) : (
            <div className="flex justify-center p-8">
              <SingleCollarTagItem
                animal={currentAnimal}
                formatted={currentFormatted}
                qrUrl={qrCodeMap[currentAnimal.id] || currentAnimal.qrCodeUrl}
                preset={preset}
                options={options}
                isSheetMode={false}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* INDIVIDUAL COLLAR TAG COMPONENT IMPLEMENTING STANDARD FORMAT SPECIFICATIONS */
interface SingleCollarTagItemProps {
  animal: Animal;
  formatted: FormattedCollarTagData;
  qrUrl?: string;
  preset: CollarTagPreset;
  options: CollarTagOptions;
  isSheetMode?: boolean;
}

const SingleCollarTagItem: React.FC<SingleCollarTagItemProps> = ({
  animal,
  formatted,
  qrUrl,
  preset,
  options,
  isSheetMode,
}) => {
  const isMono = options.highContrastMonochrome;
  const isSlide = preset === 'collar_slide';
  const isCompact = preset === 'feline_compact';

  // Background and border styling
  const containerClasses = isMono
    ? 'bg-white text-black border-2 border-black'
    : 'bg-[#FAF6EE] text-[#0B3E39] border-2 border-[#0B3E39] shadow-md';

  return (
    <div className="relative inline-block select-none">
      {/* Outer Crop & Cut Guidelines */}
      <div
        className={`relative ${containerClasses} rounded-2xl overflow-hidden transition-all`}
        style={{
          width: isSlide ? '360px' : isCompact ? '240px' : isSheetMode ? '310px' : '360px',
          minHeight: isSlide ? '135px' : isCompact ? '175px' : '220px',
        }}
      >
        {/* Hole Punch Eyelet Indicator (Top Center) */}
        {!isSlide && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
            <div
              className={`w-4 h-4 rounded-full border-2 border-dashed ${
                isMono ? 'border-black bg-white' : 'border-[#0B3E39] bg-white'
              } flex items-center justify-center shadow-xs`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${isMono ? 'bg-black' : 'bg-[#0B3E39]'}`} />
            </div>
            <span className="text-[7px] font-black uppercase tracking-tighter opacity-70 mt-0.5">
              ⨀ Punch Hole
            </span>
          </div>
        )}

        {/* Dual Slide Slots (For Slide-On Webbing Collar Tag Preset) */}
        {isSlide && (
          <>
            <div className="absolute left-3 top-4 bottom-4 w-1.5 border-2 border-dashed border-stone-800 bg-white/70 rounded-full z-20" />
            <div className="absolute right-3 top-4 bottom-4 w-1.5 border-2 border-dashed border-stone-800 bg-white/70 rounded-full z-20" />
          </>
        )}

        {/* Tag Header: Brand & Emergency Hotline */}
        <div
          className={`px-3 py-1.5 border-b ${
            isMono ? 'border-black bg-stone-100' : 'border-[#0B3E39]/20 bg-[#0B3E39] text-[#FAF6EE]'
          } flex items-center justify-between`}
        >
          <div className="flex items-center gap-1.5">
            <PawtopiaLogo variant="icon" size="sm" />
            <span className={`text-[11px] font-black tracking-wide ${isMono ? 'text-black' : 'text-[#FAF6EE]'}`}>
              PAWTOPIA
            </span>
          </div>

          <div className="text-right">
            <span
              className={`text-[8.5px] font-black uppercase px-1.5 py-0.2 rounded ${
                formatted.vaccineStatusColor === 'green'
                  ? isMono
                    ? 'border border-black'
                    : 'bg-emerald-500 text-white'
                  : isMono
                  ? 'border border-black'
                  : 'bg-rose-500 text-white'
              }`}
            >
              {formatted.vaccineStatusLabel}
            </span>
          </div>
        </div>

        {/* Tag Body Layout */}
        <div className={`p-3 grid ${isSlide ? 'grid-cols-12 pl-6 pr-6' : 'grid-cols-12'} gap-2.5 items-center`}>
          {/* Left Column: Photo (if enabled) & Ear Notch */}
          {options.includePhoto && !isCompact && (
            <div className="col-span-4 flex flex-col items-center">
              <div className="relative">
                <img
                  src={animal.photoUrl}
                  alt={formatted.displayName}
                  className={`w-16 h-16 rounded-xl object-cover border ${
                    isMono ? 'border-black' : 'border-[#0B3E39]'
                  } shadow-xs`}
                />
                {formatted.earNotchIndicator && (
                  <span
                    className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 text-[7.5px] font-black px-1 py-0.2 rounded whitespace-nowrap shadow-xs ${
                      isMono ? 'bg-black text-white' : 'bg-[#0B3E39] text-[#FAF6EE]'
                    }`}
                  >
                    {formatted.earNotchIndicator}
                  </span>
                )}
              </div>
              <span className="text-[8.5px] font-bold mt-1.5 opacity-80 capitalize">
                {animal.gender} • {animal.species}
              </span>
            </div>
          )}

          {/* Center Column: Identification & Health Data */}
          <div className={`${options.includePhoto && !isCompact ? 'col-span-5' : 'col-span-7'} space-y-0.5`}>
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-black tracking-wider uppercase opacity-70">TAG ID:</span>
              <span className="text-xs font-mono font-black tracking-wide">
                {formatted.tagId}
              </span>
            </div>

            <div className="text-sm font-black truncate leading-tight">
              {formatted.displayName}
            </div>

            <div className="text-[9.5px] font-semibold opacity-85 truncate">
              📍 {formatted.wardName}
            </div>

            <div className="text-[9px] font-bold text-emerald-800 dark:text-emerald-700">
              ✓ {formatted.sterilizationText}
            </div>

            <div className="text-[9px] font-bold opacity-80">
              📅 {formatted.vaccineExpiryFormatted}
            </div>
          </div>

          {/* Right Column: High Density QR Code */}
          <div className={`${options.includePhoto && !isCompact ? 'col-span-3' : 'col-span-5'} flex flex-col items-center text-center`}>
            {qrUrl ? (
              <img
                src={qrUrl}
                alt={`QR Code for ${animal.tagNumber}`}
                className={`w-16 h-16 rounded-lg p-0.5 bg-white border ${
                  isMono ? 'border-black' : 'border-[#0B3E39]/30'
                }`}
              />
            ) : (
              <div className="w-16 h-16 bg-stone-100 rounded-lg flex items-center justify-center text-[9px] text-stone-400">
                Generating QR...
              </div>
            )}
            <span className="text-[7.5px] font-black uppercase tracking-tight mt-0.5 opacity-80">
              Scan For Emergency ID
            </span>
          </div>
        </div>

        {/* Tag Footer: Helpline & Protection Clause */}
        <div
          className={`px-3 py-1 border-t text-[8px] flex items-center justify-between ${
            isMono ? 'border-black bg-stone-100' : 'border-[#0B3E39]/15 bg-[#FAF6EE]'
          }`}
        >
          {options.includeHelpline && (
            <div className="flex items-center gap-1 font-bold">
              <Phone className="w-2.5 h-2.5" />
              <span>Helpline: {formatted.helpline}</span>
            </div>
          )}

          <div className="font-mono font-bold opacity-75">
            {isSlide ? 'SLIDE COLLAR TAG' : 'BBMP & PAWTOPIA'}
          </div>
        </div>

        {options.includeLegalNotice && !isCompact && (
          <div className="px-3 pb-1 text-[7.5px] opacity-70 text-center border-t border-dashed border-stone-300">
            {formatted.legalNotice}
          </div>
        )}
      </div>

      {/* Fold-Over Reverse Side Preview (if twoSidedFold is enabled) */}
      {options.twoSidedFold && !isSheetMode && (
        <div
          className={`mt-2 relative ${containerClasses} rounded-2xl overflow-hidden p-3 space-y-1.5`}
          style={{ width: isSlide ? '360px' : '360px' }}
        >
          <div className="text-center border-b pb-1">
            <span className="text-[9px] font-black uppercase tracking-wider">
              --- FOLD REVERSE SIDE (COLLAR BACK) ---
            </span>
          </div>
          <div className="text-[9.5px] space-y-1">
            <div className="flex justify-between">
              <span className="font-bold">Rabies Vaccine Batch:</span>
              <span className="font-mono">NOBIVAC-R-8842</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">Registered Care NGO:</span>
              <span>Bangalore Animal Care Network</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">Ear Notch Verification:</span>
              <span>{formatted.earNotchIndicator || 'None / Intact'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">Return-to-Site Lat/Lng:</span>
              <span className="font-mono">{animal.primaryLocation.lat.toFixed(4)}, {animal.primaryLocation.lng.toFixed(4)}</span>
            </div>
          </div>
          <div className="text-[8px] text-center opacity-70 pt-1 border-t border-dashed">
            Under Section 11 of Prevention of Cruelty to Animals Act &amp; ABC Rules 2023
          </div>
        </div>
      )}
    </div>
  );
};
