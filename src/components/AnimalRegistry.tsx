import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Animal, Species, Gender, VaccinationStatus, SterilizationStatus, EarNotchStatus } from '../types';
import { getVaccinationBadgeMeta } from '../utils/vaccination';
import {
  QrCode,
  Search,
  Filter,
  Plus,
  Tag,
  Dog,
  Cat,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  Camera,
} from 'lucide-react';

interface AnimalRegistryProps {
  onSelectAnimal: (animal: Animal) => void;
  onOpenAIMatcher: () => void;
}

export const AnimalRegistry: React.FC<AnimalRegistryProps> = ({ onSelectAnimal, onOpenAIMatcher }) => {
  const { animals, registerAnimal, zones, role } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState<'all' | 'dog' | 'cat'>('all');
  const [vaxFilter, setVaxFilter] = useState<string>('all');
  const [sterilFilter, setSterilFilter] = useState<string>('all');
  const [wardFilter, setWardFilter] = useState<string>('all');

  // Register Modal
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [newSpecies, setNewSpecies] = useState<Species>('dog');
  const [newName, setNewName] = useState('');
  const [newBreed, setNewBreed] = useState('Indian Pariah (Indie)');
  const [newGender, setNewGender] = useState<Gender>('male');
  const [newAge, setNewAge] = useState<number>(2);
  const [newColor, setNewColor] = useState('Fawn with white chest');
  const [newMarks, setNewMarks] = useState('Playful, white tip tail');
  const [newEarNotch, setNewEarNotch] = useState<EarNotchStatus>('none');
  const [newWard, setNewWard] = useState(zones[0]?.wardName || 'Ward 101 - Indiranagar');
  const [newVaxStatus, setNewVaxStatus] = useState<VaccinationStatus>('valid');
  const [newSterilStatus, setNewSterilStatus] = useState<SterilizationStatus>('sterilized');
  const [newPhotoUrl, setNewPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80'
  );

  const filteredAnimals = animals.filter((animal) => {
    if (speciesFilter !== 'all' && animal.species !== speciesFilter) return false;
    if (vaxFilter !== 'all' && animal.vaccinationStatus !== vaxFilter) return false;
    if (sterilFilter !== 'all' && animal.sterilizationStatus !== sterilFilter) return false;
    if (wardFilter !== 'all' && animal.primaryLocation.wardName !== wardFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTag = animal.tagNumber.toLowerCase().includes(q);
      const matchName = animal.name?.toLowerCase().includes(q);
      const matchWard = animal.primaryLocation.wardName.toLowerCase().includes(q);
      const matchColor = animal.colorPattern.toLowerCase().includes(q);
      return matchTag || matchName || matchWard || matchColor;
    }
    return true;
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date().toISOString().split('T')[0];
    const nextYear = new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0];

    const registered = await registerAnimal({
      name: newName || undefined,
      species: newSpecies,
      breed: newBreed,
      gender: newGender,
      estimatedAgeYears: Number(newAge),
      photoUrl: newPhotoUrl,
      colorPattern: newColor,
      distinctiveMarks: newMarks,
      earNotch: newEarNotch,
      primaryLocation: {
        lat: 12.9784,
        lng: 77.6408,
        wardName: newWard,
        address: `${newWard} community center`,
      },
      vaccinationStatus: newVaxStatus,
      lastVaccinationDate: newVaxStatus === 'valid' ? today : undefined,
      nextVaccinationDueDate: newVaxStatus === 'valid' ? nextYear : undefined,
      sterilizationStatus: newSterilStatus,
      sterilizationDate: newSterilStatus === 'sterilized' ? today : undefined,
      registeredByRole: role,
      registeredByName: 'Pawtopia Field Lead',
      adoptionStatus: 'stray_community',
    });

    setShowRegisterModal(false);
    onSelectAnimal(registered);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FAF6EE] p-6 rounded-3xl border border-[#0B3E39]/15">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Tag className="w-5 h-5 text-[#0B3E39]" />
            <h1 className="text-xl font-black text-[#0B3E39] uppercase tracking-wide">
              Animal Health Identity &amp; QR Registry
            </h1>
          </div>
          <p className="text-xs text-stone-600">
            Official municipal database of vaccinated, sterilized, and community-protected dogs and cats.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenAIMatcher}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-50 border border-teal-200 text-[#0B3E39] text-xs font-bold hover:bg-teal-100 transition shadow-2xs cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>AI Photo Search</span>
          </button>

          <button
            onClick={() => setShowRegisterModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B3E39] text-[#FAF6EE] text-xs font-bold hover:bg-[#145E56] transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Animal</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs flex flex-col md:flex-row gap-3">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by tag # (PAW-IND-001), name, ward, color..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3E39]/20"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={speciesFilter}
            onChange={(e) => setSpeciesFilter(e.target.value as any)}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-semibold text-stone-700 cursor-pointer focus:outline-none"
          >
            <option value="all">All Species</option>
            <option value="dog">🐕 Dogs</option>
            <option value="cat">🐈 Cats</option>
          </select>

          <select
            value={vaxFilter}
            onChange={(e) => setVaxFilter(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-semibold text-stone-700 cursor-pointer focus:outline-none"
          >
            <option value="all">All Vaccination</option>
            <option value="valid">Protected (Valid)</option>
            <option value="due_soon">Due Soon (&lt; 30d)</option>
            <option value="overdue">Overdue</option>
            <option value="unvaccinated">Unvaccinated</option>
          </select>

          <select
            value={sterilFilter}
            onChange={(e) => setSterilFilter(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-semibold text-stone-700 cursor-pointer focus:outline-none"
          >
            <option value="all">All Sterilization</option>
            <option value="sterilized">Sterilized</option>
            <option value="intact">Intact</option>
          </select>

          <select
            value={wardFilter}
            onChange={(e) => setWardFilter(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-semibold text-stone-700 cursor-pointer focus:outline-none"
          >
            <option value="all">All Wards</option>
            {zones.map((z) => (
              <option key={z.id} value={z.wardName}>
                {z.wardName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Animals Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredAnimals.map((animal) => {
          const vaxMeta = getVaccinationBadgeMeta(animal.vaccinationStatus);

          return (
            <div
              key={animal.id}
              className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col group"
            >
              {/* Photo & Badges */}
              <div className="relative h-44 bg-stone-100 overflow-hidden">
                <img
                  src={animal.photoUrl}
                  alt={animal.name || animal.tagNumber}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Ear Notch Badge on Photo */}
                {animal.earNotch !== 'none' && (
                  <span className="absolute top-3 left-3 bg-[#0B3E39]/90 backdrop-blur-xs text-[#FAF6EE] text-[9px] font-black px-2 py-0.5 rounded-md border border-white/40 shadow-xs flex items-center gap-1">
                    ✂ {animal.earNotch.replace(/_/g, ' ')}
                  </span>
                )}

                {/* QR Mini Pill */}
                <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-[#0B3E39] text-[9px] font-bold px-2 py-0.5 rounded-md border border-stone-200 shadow-2xs">
                  {animal.species === 'dog' ? '🐕 Canine' : '🐈 Feline'}
                </span>

                <div className="absolute bottom-2 left-3 right-3 flex justify-between items-center text-[10px] text-white font-bold drop-shadow-md">
                  <span>{animal.tagNumber}</span>
                  <span>~{animal.estimatedAgeYears} yrs old</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-sm font-black text-stone-900 truncate">
                    {animal.name || `Community ${animal.species.toUpperCase()}`}
                  </h3>
                  <p className="text-[11px] text-stone-500 truncate">{animal.breed || 'Indie'}</p>
                  <p className="text-[11px] text-stone-400 mt-1 truncate">📍 {animal.primaryLocation.wardName}</p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-stone-100 text-[11px]">
                  {/* Rabies Status Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400 font-bold uppercase text-[9px]">Rabies:</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold border text-[10px] ${vaxMeta.colorClass}`}>
                      {vaxMeta.label}
                    </span>
                  </div>

                  {/* Sterilization */}
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400 font-bold uppercase text-[9px]">ABC Steril:</span>
                    <span className="font-semibold text-stone-700 capitalize">
                      {animal.sterilizationStatus === 'sterilized' ? 'Sterilized' : 'Intact'}
                    </span>
                  </div>
                </div>

                {/* Open Card Button */}
                <button
                  onClick={() => onSelectAnimal(animal)}
                  className="w-full py-2 bg-stone-50 hover:bg-[#0B3E39] text-[#0B3E39] hover:text-[#FAF6EE] border border-stone-200 hover:border-[#0B3E39] rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>View QR Health Tag</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAnimals.length === 0 && (
        <div className="p-12 text-center text-xs text-stone-400 bg-white rounded-3xl border border-dashed border-stone-300">
          No animals match the active search criteria.
        </div>
      )}

      {/* Register New Animal Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 p-6 my-8">
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-wide mb-3">
              Register Community Stray Animal
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Creates a cryptographic QR identity, generates visual embedding for duplicate checking, and updates ward
              records.
            </p>

            <form onSubmit={handleRegister} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Species</label>
                  <select
                    value={newSpecies}
                    onChange={(e) => setNewSpecies(e.target.value as Species)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-semibold"
                  >
                    <option value="dog">🐕 Stray Dog</option>
                    <option value="cat">🐈 Stray Cat</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Name (or Nickname)</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="E.g. Rocky"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Gender</label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as Gender)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Est. Age (Years)</label>
                  <input
                    type="number"
                    min={0.5}
                    max={15}
                    step={0.5}
                    value={newAge}
                    onChange={(e) => setNewAge(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Ear Notch</label>
                  <select
                    value={newEarNotch}
                    onChange={(e) => setNewEarNotch(e.target.value as EarNotchStatus)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-semibold"
                  >
                    <option value="none">None</option>
                    <option value="right_v_notch">Right V-Notch</option>
                    <option value="left_v_notch">Left V-Notch</option>
                    <option value="tipped">Tipped (Cats)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Rabies Status</label>
                  <select
                    value={newVaxStatus}
                    onChange={(e) => setNewVaxStatus(e.target.value as VaccinationStatus)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-semibold"
                  >
                    <option value="valid">Protected (Valid)</option>
                    <option value="due_soon">Due Soon</option>
                    <option value="unvaccinated">Unvaccinated</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Sterilization Status</label>
                  <select
                    value={newSterilStatus}
                    onChange={(e) => setNewSterilStatus(e.target.value as SterilizationStatus)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-semibold"
                  >
                    <option value="sterilized">Sterilized</option>
                    <option value="intact">Intact</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">Primary Territory / Ward</label>
                <select
                  value={newWard}
                  onChange={(e) => setNewWard(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-semibold"
                >
                  {zones.map((z) => (
                    <option key={z.id} value={z.wardName}>
                      {z.wardName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0B3E39] text-[#FAF6EE] font-bold rounded-xl hover:bg-[#145E56] cursor-pointer"
                >
                  Register &amp; Mint QR Tag
                </button>
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
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
