import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Animal } from '../types';
import { findTopMatches, generateFeatureVector, MatchCandidate } from '../utils/aiMatcher';
import {
  Sparkles,
  Camera,
  Upload,
  CheckCircle2,
  X,
  ExternalLink,
  Tag,
  Search,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface AIMatcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAnimal: (animal: Animal) => void;
}

export const AIMatcherModal: React.FC<AIMatcherModalProps> = ({ isOpen, onClose, onSelectAnimal }) => {
  const { animals, t } = useApp();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [speciesFilter, setSpeciesFilter] = useState<'dog' | 'cat'>('dog');
  const [isProcessing, setIsProcessing] = useState(false);
  const [matches, setMatches] = useState<MatchCandidate[] | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPhotoPreview(reader.result);
          runAIMatch(reader.result, speciesFilter);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const runAIMatch = (photoSrc: string, species: 'dog' | 'cat') => {
    setIsProcessing(true);
    setMatches(null);

    // Simulate CLIP / ResNet deep image feature extraction
    setTimeout(() => {
      // Deterministic query vector generated from photo string hash + species
      const queryVec = generateFeatureVector(`query-photo-${photoSrc.slice(0, 80)}-${species}`);
      const results = findTopMatches(queryVec, animals, 3, species);
      setMatches(results);
      setIsProcessing(false);
    }, 600);
  };

  const handleSamplePhoto = (sampleUrl: string, sampleSpecies: 'dog' | 'cat') => {
    setPhotoPreview(sampleUrl);
    setSpeciesFilter(sampleSpecies);
    runAIMatch(sampleUrl, sampleSpecies);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#071E1B] rounded-3xl shadow-2xl border border-stone-200 dark:border-teal-900/60 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-teal-50 dark:bg-[#0E2825] border-b border-teal-100 dark:border-teal-900/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#0B3E39] dark:bg-teal-700 text-[#FAF6EE] rounded-xl shadow-xs">
              <Sparkles className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <h2 className="text-sm font-black text-[#0B3E39] dark:text-teal-200 uppercase tracking-wide">
                {t('aiMatcherTitle')}
              </h2>
              <span className="text-[11px] font-semibold text-teal-800 dark:text-teal-300">
                {t('aiMatcherSubtitle')}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Upload / Selector Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300">{t('photoUpload')}:</label>
              <div className="flex gap-1 text-[11px] font-bold">
                <button
                  onClick={() => {
                    setSpeciesFilter('dog');
                    if (photoPreview) runAIMatch(photoPreview, 'dog');
                  }}
                  className={`px-2.5 py-0.5 rounded-md cursor-pointer ${
                    speciesFilter === 'dog' ? 'bg-[#0B3E39] dark:bg-teal-700 text-white' : 'bg-stone-100 dark:bg-[#0B2522] text-stone-600 dark:text-stone-300'
                  }`}
                >
                  {t('dog')}
                </button>
                <button
                  onClick={() => {
                    setSpeciesFilter('cat');
                    if (photoPreview) runAIMatch(photoPreview, 'cat');
                  }}
                  className={`px-2.5 py-0.5 rounded-md cursor-pointer ${
                    speciesFilter === 'cat' ? 'bg-[#0B3E39] dark:bg-teal-700 text-white' : 'bg-stone-100 dark:bg-[#0B2522] text-stone-600 dark:text-stone-300'
                  }`}
                >
                  {t('cat')}
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Photo Preview Container */}
              <div className="w-32 h-32 rounded-2xl bg-stone-100 dark:bg-[#0E2825] border-2 border-dashed border-stone-300 dark:border-teal-900/60 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                {photoPreview ? (
                  <img src={photoPreview} alt="Target animal" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-8 h-8 text-stone-400 dark:text-stone-500" />
                )}
                {isProcessing && (
                  <div className="absolute inset-0 bg-[#0B3E39]/70 flex flex-col items-center justify-center text-white">
                    <Loader2 className="w-6 h-6 animate-spin text-teal-300 mb-1" />
                    <span className="text-[10px] font-bold">{t('analyzingPhoto')}</span>
                  </div>
                )}
              </div>

              {/* Upload controls & Sample quick tests */}
              <div className="flex-1 w-full space-y-2">
                <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-[#0B3E39]/30 dark:border-teal-800 rounded-xl bg-[#FAF6EE] dark:bg-[#0E2825] hover:bg-stone-100 dark:hover:bg-[#12332F] cursor-pointer text-[#0B3E39] dark:text-teal-200 font-bold text-xs transition">
                  <Upload className="w-4 h-4" />
                  <span>{t('selectPhoto')}</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>

                <div className="pt-1">
                  <span className="text-[10px] font-bold text-stone-500 uppercase block mb-1">
                    Or try instant field test cases:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        handleSamplePhoto(
                          'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80',
                          'dog'
                        )
                      }
                      className="px-2.5 py-1 text-[11px] font-semibold bg-stone-100 hover:bg-stone-200 rounded-lg text-stone-700 cursor-pointer"
                    >
                      🐕 Bruno (Indiranagar)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleSamplePhoto(
                          'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
                          'cat'
                        )
                      }
                      className="px-2.5 py-1 text-[11px] font-semibold bg-stone-100 hover:bg-stone-200 rounded-lg text-stone-700 cursor-pointer"
                    >
                      🐈 Mimi (Calico Cat)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleSamplePhoto(
                          'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80',
                          'dog'
                        )
                      }
                      className="px-2.5 py-1 text-[11px] font-semibold bg-stone-100 hover:bg-stone-200 rounded-lg text-stone-700 cursor-pointer"
                    >
                      🐕 Sheru (Black &amp; Tan)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Match Results */}
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-stone-100 dark:border-teal-900/40 pb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-stone-800 dark:text-teal-200">
                {t('topMatchingAnimals')}
              </h3>
              {matches && (
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  {matches.length} Candidates Screened
                </span>
              )}
            </div>

            {matches && matches.length > 0 ? (
              <div className="space-y-3">
                {matches.map((match, idx) => (
                  <div
                    key={match.animal.id}
                    className="p-3.5 bg-stone-50 dark:bg-[#071E1B] hover:bg-white dark:hover:bg-[#0E2825] rounded-2xl border border-stone-200 dark:border-teal-900/50 hover:border-[#0B3E39]/40 transition shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={match.animal.photoUrl}
                          alt={match.animal.name || match.animal.tagNumber}
                          className="w-16 h-16 rounded-xl object-cover border border-stone-200 dark:border-teal-900/50 shadow-2xs"
                        />
                        <span className="absolute -top-1.5 -left-1.5 bg-[#0B3E39] dark:bg-teal-700 text-[#FAF6EE] text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                          #{idx + 1}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-[#0B3E39] dark:text-teal-300">
                            {match.animal.tagNumber}
                          </span>
                          <span className="text-[11px] font-bold text-stone-800 dark:text-stone-100">
                            {match.animal.name || (match.animal.species === 'dog' ? t('dog') : t('cat'))}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400">
                          {match.animal.primaryLocation.wardName} • {match.animal.colorPattern}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {match.matchedAttributes.map((attr, aIdx) => (
                            <span
                              key={aIdx}
                              className="text-[9px] font-semibold bg-stone-200/80 dark:bg-teal-900/60 text-stone-700 dark:text-teal-200 px-1.5 py-0.2 rounded"
                            >
                              ✓ {attr}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-stone-400 dark:text-stone-400 block">{t('similarityScore')}</span>
                        <span className="text-base font-black text-emerald-700 dark:text-emerald-400">
                          {match.confidencePercentage}%
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          onSelectAnimal(match.animal);
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-[#0B3E39] dark:bg-teal-700 text-[#FAF6EE] rounded-xl text-xs font-bold hover:bg-[#145E56] transition cursor-pointer flex items-center gap-1"
                      >
                        <Tag className="w-3 h-3" />
                        <span>{t('openFoundAnimalCard')}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : !isProcessing && (
              <div className="p-8 text-center text-stone-400 dark:text-stone-500 text-xs bg-stone-50 dark:bg-[#071E1B] rounded-2xl border border-dashed border-stone-200 dark:border-teal-900/40">
                {t('dragOrUploadPhoto')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
