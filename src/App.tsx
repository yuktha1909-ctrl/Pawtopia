import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { PawtopiaMap } from './components/Map/PawtopiaMap';
import { AnimalRegistry } from './components/AnimalRegistry';
import { ReportsManager } from './components/ReportsManager';
import { KanbanBoard } from './components/KanbanBoard';
import { ReadinessScoreCard } from './components/ReadinessScoreCard';
import { InventoryTracker } from './components/InventoryTracker';
import { BiteIncidentModule } from './components/BiteIncidentModule';
import { CampsAndFeeders } from './components/CampsAndFeeders';
import { PublicTransparencyView } from './components/PublicTransparencyView';
import { QRCardModal } from './components/QRCardModal';
import { EmergencyReportModal } from './components/EmergencyReportModal';
import { AIMatcherModal } from './components/AIMatcherModal';
import { MedicalActionModal } from './components/MedicalActionModal';
import { PawtopiaLogo } from './components/PawtopiaLogo';
import { Animal } from './types';
import { Heart, ShieldCheck, Phone, Mail, Award, Info } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { activeView, setActiveView, animals, selectedAnimalForQR, setSelectedAnimalForQR } = useApp();

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAIMatcherOpen, setIsAIMatcherOpen] = useState(false);
  const [medicalModalConfig, setMedicalModalConfig] = useState<{
    animal: Animal | null;
    mode: 'vaccination' | 'sterilization' | 'return_to_site';
  }>({ animal: null, mode: 'vaccination' });

  // Handle scanned QR code from URL param: ?animal=PAW-IND-001
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const animalTag = params.get('animal');
    if (animalTag) {
      const match = animals.find((a) => a.tagNumber.toLowerCase() === animalTag.toLowerCase());
      if (match) {
        setSelectedAnimalForQR(match);
      }
    }
  }, [animals, setSelectedAnimalForQR]);

  const handleOpenVaccination = (animal: Animal) => {
    setMedicalModalConfig({ animal, mode: 'vaccination' });
  };

  const handleOpenSterilization = (animal: Animal) => {
    setMedicalModalConfig({ animal, mode: 'sterilization' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F0] dark:bg-[#071715] text-stone-800 dark:text-stone-100 font-sans selection:bg-[#0B3E39] selection:text-[#FAF6EE] transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenAIMatcherModal={() => setIsAIMatcherOpen(true)}
      />

      {/* Main View Body */}
      <main className="flex-1">
        {activeView === 'map' && (
          <PawtopiaMap
            onSelectAnimal={(animal) => setSelectedAnimalForQR(animal)}
            onSelectReport={() => setActiveView('reports')}
          />
        )}

        {activeView === 'registry' && (
          <AnimalRegistry
            onSelectAnimal={(animal) => setSelectedAnimalForQR(animal)}
            onOpenAIMatcher={() => setIsAIMatcherOpen(true)}
          />
        )}

        {activeView === 'reports' && <ReportsManager />}

        {activeView === 'tasks' && <KanbanBoard />}

        {activeView === 'readiness' && <ReadinessScoreCard />}

        {activeView === 'inventory' && <InventoryTracker />}

        {activeView === 'bites' && <BiteIncidentModule />}

        {activeView === 'camps' && <CampsAndFeeders />}

        {activeView === 'transparency' && <PublicTransparencyView />}
      </main>

      {/* Footer */}
      <footer className="no-print bg-[#0B3E39] dark:bg-[#051412] text-[#FAF6EE] border-t border-[#0B3E39]/20 dark:border-teal-950/80 pt-12 pb-8 mt-12 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-teal-800/60">
            {/* Logo & Tagline */}
            <div className="space-y-3">
              <PawtopiaLogo variant="full" size="sm" inverted />
              <p className="text-xs text-stone-300 leading-relaxed">
                A unified, humane platform for municipal authorities, NGOs, veterinarians, and compassionate citizens to
                monitor stray animals, eliminate rabies, and safeguard community health.
              </p>
            </div>

            {/* Emergency Contacts */}
            <div className="space-y-2 text-xs">
              <div className="font-bold uppercase tracking-wider text-teal-300">24/7 Animal Emergency Helpline</div>
              <div className="flex items-center gap-2 text-stone-200">
                <Phone className="w-3.5 h-3.5 text-teal-400" />
                <span className="font-mono font-bold text-sm">1800-PAW-HELP / +91 80 2200 4400</span>
              </div>
              <div className="flex items-center gap-2 text-stone-200">
                <Mail className="w-3.5 h-3.5 text-teal-400" />
                <span>rescue-control@pawtopia.org</span>
              </div>
              <p className="text-[11px] text-stone-400 pt-1">
                Toll-free across Greater Bengaluru Municipal Zones (BBMP).
              </p>
            </div>

            {/* Humane Standards */}
            <div className="space-y-2 text-xs">
              <div className="font-bold uppercase tracking-wider text-teal-300">Humane Standards</div>
              <ul className="space-y-1 text-stone-300 text-[11px]">
                <li>• WHO Rabies Herd Immunity Target (70%)</li>
                <li>• Animal Birth Control (ABC) Rules 2023</li>
                <li>• Return-to-Site Geofence Audits (&le; 500m)</li>
                <li>• Cold-Chain Maintained Anti-Rabies Vaccines</li>
              </ul>
            </div>

            {/* Quick Links */}
            <div className="space-y-2 text-xs">
              <div className="font-bold uppercase tracking-wider text-teal-300">Platform Navigation</div>
              <div className="grid grid-cols-2 gap-1 text-[11px] text-stone-300">
                <button onClick={() => setActiveView('map')} className="text-left hover:text-white cursor-pointer">
                  Stray Map
                </button>
                <button onClick={() => setActiveView('readiness')} className="text-left hover:text-white cursor-pointer">
                  Readiness Score
                </button>
                <button onClick={() => setActiveView('registry')} className="text-left hover:text-white cursor-pointer">
                  QR Registry
                </button>
                <button onClick={() => setActiveView('transparency')} className="text-left hover:text-white cursor-pointer">
                  Public Portal
                </button>
                <button onClick={() => setActiveView('bites')} className="text-left hover:text-white cursor-pointer">
                  Bite &amp; PEP
                </button>
                <button onClick={() => setIsAIMatcherOpen(true)} className="text-left hover:text-white cursor-pointer">
                  AI Matcher
                </button>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-teal-400/80 gap-2">
            <div>&copy; {new Date().getFullYear()} Pawtopia Stray Dog &amp; Cat Management Platform. All rights reserved.</div>
            <div className="flex items-center gap-1 text-stone-300">
              Built with care for animals and city health <Heart className="w-3 h-3 text-rose-400 inline" />
            </div>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      {selectedAnimalForQR && (
        <QRCardModal
          animal={selectedAnimalForQR}
          onClose={() => setSelectedAnimalForQR(null)}
          onOpenVaccinationDialog={handleOpenVaccination}
          onOpenSterilizationDialog={handleOpenSterilization}
        />
      )}

      {isReportModalOpen && (
        <EmergencyReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} />
      )}

      {isAIMatcherOpen && (
        <AIMatcherModal
          isOpen={isAIMatcherOpen}
          onClose={() => setIsAIMatcherOpen(false)}
          onSelectAnimal={(animal) => setSelectedAnimalForQR(animal)}
        />
      )}

      {medicalModalConfig.animal && (
        <MedicalActionModal
          animal={medicalModalConfig.animal}
          mode={medicalModalConfig.mode}
          onClose={() => setMedicalModalConfig({ animal: null, mode: 'vaccination' })}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
