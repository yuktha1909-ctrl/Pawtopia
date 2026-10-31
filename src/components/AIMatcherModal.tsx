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
  const { animals } = useApp();
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
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-teal-50 border-b border-teal-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#0B3E39] text-[#FAF6EE] rounded-xl shadow-xs">
              <Sparkles className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <h2 className="text-sm font-black text-[#0B3E39] uppercase tracking-wide">
                AI Visual Animal Matcher &amp; Duplicate Checker
              </h2>
              <span className="text-[11px] font-semibold text-teal-800">
                ResNet / CLIP Feature Embedding &amp; Cosine Similarity Search
              </span>
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

        <div className="p-6 space-y-6">
          {/* Upload / Selector Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-stone-700">Upload Animal Photo to Identify or Check Duplicates:</label>
              <div className="flex gap-1 text-[11px] font-bold">
                <button
                  onClick={() => {
                    setSpeciesFilter('dog');
                    if (photoPreview) runAIMatch(photoPreview, 'dog');
                  }}
                  className={`px-2.5 py-0.5 rounded-md cursor-pointer ${
                    speciesFilter === 'dog' ? 'bg-[#0B3E39] text-white' : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  Dogs
                </button>
                <button
                  onClick={() => {
                    setSpeciesFilter('cat');
                    if (photoPreview) runAIMatch(photoPreview, 'cat');
                  }}
                  className={`px-2.5 py-0.5 rounded-md cursor-pointer ${
                    speciesFilter === 'cat' ? 'bg-[#0B3E39] text-white' : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  Cats
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Photo Preview Container */}
              <div className="w-32 h-32 rounded-2xl bg-stone-100 border-2 border-dashed border-stone-300 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                {photoPreview ? (
                  <img src={photoPreview} alt="Target animal" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-8 h-8 text-stone-400" />
                )}
                {isProcessing && (
                  <div className="absolute inset-0 bg-[#0B3E39]/70 flex flex-col items-center justify-center text-white">
                    <Loader2 className="w-6 h-6 animate-spin text-teal-300 mb-1" />
                    <span className="text-[10px] font-bold">Vectorizing...</span>
                  </div>
                )}
              </div>

              {/* Upload controls & Sample quick tests */}
              <div className="flex-1 w-full space-y-2">
                <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-[#0B3E39]/30 rounded-xl bg-[#FAF6EE] hover:bg-stone-100 cursor-pointer text-[#0B3E39] font-bold text-xs transition">
                  <Upload className="w-4 h-4" />
                  <span>Choose Photo from Device / Camera</span>
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
            <div className="flex items-center justify-between mb-3 border-b border-stone-100 pb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-stone-800">
                Top Visual Matches (Ranked by Cosine Confidence)
              </h3>
              {matches && (
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {matches.length} Candidates Screened
                </span>
              )}
            </div>

            {matches && matches.length > 0 ? (
              <div className="space-y-3">
                {matches.map((match, idx) => (
                  <div
                    key={match.animal.id}
                    className="p-3.5 bg-stone-50 hover:bg-white rounded-2xl border border-stone-200 hover:border-[#0B3E39]/40 transition shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={match.animal.photoUrl}
                          alt={match.animal.name || match.animal.tagNumber}
                          className="w-16 h-16 rounded-xl object-cover border border-stone-200 shadow-2xs"
                        />
                        <span className="absolute -top-1.5 -left-1.5 bg-[#0B3E39] text-[#FAF6EE] text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                          #{idx + 1}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-[#0B3E39]">
                            {match.animal.tagNumber}
                          </span>
                          <span className="text-[11px] font-bold text-stone-800">
                            {match.animal.name || 'Community Indie'}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500">
                          {match.animal.primaryLocation.wardName} • {match.animal.colorPattern}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {match.matchedAttributes.map((attr, aIdx) => (
                            <span
                              key={aIdx}
                              className="text-[9px] font-semibold bg-stone-200/80 text-stone-700 px-1.5 py-0.2 rounded"
                            >
                              ✓ {attr}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-stone-400 block">AI Confidence</span>
                        <span className="text-base font-black text-emerald-700">
                          {match.confidencePercentage}%
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          onSelectAnimal(match.animal);
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-[#0B3E39] text-[#FAF6EE] rounded-xl text-xs font-bold hover:bg-[#145E56] transition cursor-pointer flex items-center gap-1"
                      >
                        <Tag className="w-3 h-3" />
                        <span>View Identity</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : !isProcessing && (
              <div className="p-8 text-center text-stone-400 text-xs bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                Upload a photo or select a test case above to run visual neural network matching.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
