import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps';
import { useApp } from '../../context/AppContext';
import { Animal, EmergencyReport, Zone } from '../../types';
import {
  Layers,
  Flame,
  Locate,
  Dog,
  Cat,
  Tag,
  AlertTriangle,
  MapPin,
  ExternalLink,
} from 'lucide-react';

interface PawtopiaMapProps {
  onSelectAnimal: (animal: Animal) => void;
  onSelectReport?: (report: EmergencyReport) => void;
}

// Google Maps API Key from env (with provisioned fallback)
const GOOGLE_MAPS_API_KEY =
  (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) ||
  'AIzaSyDuJYGjA7vc_iLzjcxSL6Tx7XlFHL5kcTQ';

// Sub-component to manage real Google Maps circles for Rabies & Stray Population Hotspots
const WardHotspotCircles: React.FC<{
  zones: Zone[];
  getWardReadiness: (zone: Zone) => any;
  visible: boolean;
  onSelectWard: (wardName: string) => void;
}> = ({ zones, getWardReadiness, visible, onSelectWard }) => {
  const map = useMap();
  const circlesRef = useRef<google.maps.Circle[]>([]);

  useEffect(() => {
    if (!map) return;

    // Clear previous circles
    circlesRef.current.forEach((c) => c.setMap(null));
    circlesRef.current = [];

    if (!visible) return;

    zones.forEach((zone) => {
      const readiness = getWardReadiness(zone);
      const isHotspot = zone.biteIncidentsLast90Days >= 3 || readiness.overallScore < 55;
      const radius = Math.min(2200, Math.max(900, zone.estimatedStrayPopulation * 2.8));
      const color = isHotspot ? '#EF4444' : '#14B8A6';

      const circle = new google.maps.Circle({
        strokeColor: color,
        strokeOpacity: 0.85,
        strokeWeight: isHotspot ? 2 : 1.5,
        fillColor: color,
        fillOpacity: isHotspot ? 0.22 : 0.12,
        map,
        center: { lat: zone.center[0], lng: zone.center[1] },
        radius,
      });

      circle.addListener('click', () => {
        onSelectWard(zone.wardName);
      });

      circlesRef.current.push(circle);
    });

    return () => {
      circlesRef.current.forEach((c) => c.setMap(null));
      circlesRef.current = [];
    };
  }, [map, zones, visible, getWardReadiness, onSelectWard]);

  return null;
};

// Internal map controller for GPS locate & panning
const MapController: React.FC<{
  targetLocation: { lat: number; lng: number } | null;
}> = ({ targetLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (map && targetLocation) {
      map.panTo(targetLocation);
      map.setZoom(15);
    }
  }, [map, targetLocation]);

  return null;
};

export const PawtopiaMap: React.FC<PawtopiaMapProps> = ({ onSelectAnimal, onSelectReport }) => {
  const { animals, reports, zones, getWardReadiness, theme, t } = useApp();

  // Filters
  const [selectedSpecies, setSelectedSpecies] = useState<'all' | 'dog' | 'cat'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'valid' | 'due' | 'unvaccinated' | 'emergency'>('all');
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [selectedReport, setSelectedReport] = useState<EmergencyReport | null>(null);
  const [targetGPS, setTargetGPS] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Filter animals based on active controls
  const filteredAnimals = useMemo(() => {
    return animals.filter((animal) => {
      if (selectedSpecies !== 'all' && animal.species !== selectedSpecies) return false;
      if (selectedWard !== 'all' && animal.primaryLocation.wardName !== selectedWard) return false;
      if (filterStatus === 'valid' && animal.vaccinationStatus !== 'valid') return false;
      if (filterStatus === 'due' && animal.vaccinationStatus !== 'due_soon') return false;
      if (
        filterStatus === 'unvaccinated' &&
        animal.vaccinationStatus !== 'unvaccinated' &&
        animal.vaccinationStatus !== 'overdue'
      )
        return false;
      return true;
    });
  }, [animals, selectedSpecies, selectedWard, filterStatus]);

  // Filter emergency rescue markers
  const activeReports = useMemo(() => {
    if (filterStatus !== 'all' && filterStatus !== 'emergency') return [];
    return reports.filter((r) => r.status !== 'resolved');
  }, [reports, filterStatus]);

  // Center on Bangalore (Bangalore Metropolitan Stray & Rabies Control Hub)
  const defaultCenter = useMemo(() => ({ lat: 12.9716, lng: 77.5946 }), []);

  // Handle Locate Me
  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setTargetGPS({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation capture failed:', err.message);
        // Default to Indiranagar center
        setTargetGPS({ lat: 12.9784, lng: 77.6408 });
        setIsLocating(false);
      }
    );
  };

  return (
    <div className="relative w-full h-[calc(100vh-130px)] min-h-[580px] bg-stone-100 dark:bg-[#061412] overflow-hidden">
      {/* Official Google Maps Platform Container */}
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={['marker', 'geometry']}>
        <Map
          defaultCenter={defaultCenter}
          defaultZoom={12}
          mapId="pawtopia_stray_surveillance_map"
          gestureHandling="greedy"
          disableDefaultUI={false}
          className="w-full h-full"
          colorScheme={theme === 'dark' ? 'DARK' : 'LIGHT'}
        >
          {/* Sub-component for Rabies Hotspot & Safe Ward buffer circles */}
          <WardHotspotCircles
            zones={zones}
            getWardReadiness={getWardReadiness}
            visible={showHeatmap}
            onSelectWard={(wName) => setSelectedWard(wName)}
          />

          {/* Sub-component for smooth camera fly-to on GPS location */}
          <MapController targetLocation={targetGPS} />

          {/* Animal Identity Advanced Markers */}
          {filteredAnimals.map((animal) => {
            const isDog = animal.species === 'dog';
            const isVaccinated = animal.vaccinationStatus === 'valid';
            const isDueSoon = animal.vaccinationStatus === 'due_soon';

            // Distinctive status border color
            let borderColor = '#10B981'; // Green
            let bgColor = '#ECFDF5';
            if (isDueSoon) {
              borderColor = '#F59E0B'; // Amber
              bgColor = '#FFFBEB';
            } else if (animal.vaccinationStatus === 'overdue' || animal.vaccinationStatus === 'unvaccinated') {
              borderColor = '#6B7280'; // Slate
              bgColor = '#F3F4F6';
            }

            return (
              <AdvancedMarker
                key={animal.id}
                position={{ lat: animal.primaryLocation.lat, lng: animal.primaryLocation.lng }}
                title={`${animal.name || animal.tagNumber} (${animal.vaccinationStatus})`}
                onClick={() => {
                  setSelectedAnimal(animal);
                  setSelectedReport(null);
                }}
              >
                <div
                  className="relative flex items-center justify-center w-9 h-9 rounded-full shadow-lg cursor-pointer transition-transform duration-200 hover:scale-125"
                  style={{
                    backgroundColor: bgColor,
                    border: `2.5px solid ${borderColor}`,
                  }}
                >
                  <span className="text-base leading-none select-none">{isDog ? '🐕' : '🐈'}</span>
                  {animal.earNotch !== 'none' && (
                    <span
                      className="absolute -top-1.5 -right-1.5 bg-[#0B3E39] text-amber-300 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-xs"
                      title={`Sterilized: ${animal.earNotch}`}
                    >
                      ✂
                    </span>
                  )}
                </div>
              </AdvancedMarker>
            );
          })}

          {/* Emergency Rescue Advanced Markers */}
          {activeReports.map((rep) => {
            const isCritical = rep.severity === 'critical' || rep.issueType === 'suspected_rabies';
            return (
              <AdvancedMarker
                key={rep.id}
                position={{ lat: rep.location.lat, lng: rep.location.lng }}
                title={`Emergency #${rep.reportNumber}: ${rep.issueType}`}
                onClick={() => {
                  setSelectedReport(rep);
                  setSelectedAnimal(null);
                }}
              >
                <div
                  className={`relative flex items-center justify-center w-10 h-10 rounded-full cursor-pointer shadow-xl animate-bounce ${
                    isCritical
                      ? 'bg-rose-600 border-2 border-white text-white ring-4 ring-rose-500/50'
                      : 'bg-amber-600 border-2 border-white text-white ring-2 ring-amber-500/40'
                  }`}
                >
                  <span className="text-lg leading-none">🚨</span>
                  <span className="absolute -bottom-2 bg-black/85 text-[8px] font-bold text-white px-1 py-0.2 rounded-full whitespace-nowrap">
                    #{rep.reportNumber.slice(-3)}
                  </span>
                </div>
              </AdvancedMarker>
            );
          })}

          {/* Emergency Report InfoWindow */}
          {selectedReport && (
            <InfoWindow
              position={{ lat: selectedReport.location.lat, lng: selectedReport.location.lng }}
              onCloseClick={() => setSelectedReport(null)}
              pixelOffset={[0, -25]}
            >
              <div className="p-1 min-w-[210px] text-stone-800">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                    {selectedReport.severity}
                  </span>
                  <span className="text-xs font-mono font-bold text-stone-600">
                    #{selectedReport.reportNumber}
                  </span>
                </div>
                <p className="text-xs font-semibold text-stone-900 mb-1.5 line-clamp-2">
                  {selectedReport.description}
                </p>
                <div className="text-[11px] text-stone-600 flex items-center gap-1 mb-2">
                  <MapPin className="w-3 h-3 text-stone-400" />
                  <span className="truncate">{selectedReport.location.address || selectedReport.location.wardName}</span>
                </div>
                {onSelectReport && (
                  <button
                    onClick={() => {
                      onSelectReport(selectedReport);
                      setSelectedReport(null);
                    }}
                    className="w-full py-1 text-center text-xs font-bold bg-[#0B3E39] text-white rounded-lg hover:bg-teal-900 transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>View Rescue Details</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>

      {/* Floating Control & Filter Panel (Top Left) */}
      <div className="absolute top-4 left-4 z-10 max-w-sm w-full bg-[#FAF6EE]/95 dark:bg-[#0A221F]/90 backdrop-blur-md rounded-2xl p-4 shadow-xl dark:shadow-[0_12px_36px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.06)] border border-[#0B3E39]/15 dark:border-teal-500/25 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#0B3E39] dark:text-teal-300" />
            <h2 className="text-xs font-black uppercase tracking-wider text-[#0B3E39] dark:text-teal-200">
              {t('publicMap')}
            </h2>
          </div>
          <span className="text-[11px] font-bold text-stone-600 dark:text-teal-200 bg-white dark:bg-[#071917] px-2 py-0.5 rounded-full border border-stone-200 dark:border-teal-500/20 shadow-2xs">
            {filteredAnimals.length} {t('allSpecies')}
          </span>
        </div>

        {/* Species Filter Buttons */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-white/80 dark:bg-[#071917]/90 rounded-xl border border-stone-200 dark:border-teal-500/20 mb-3">
          <button
            onClick={() => setSelectedSpecies('all')}
            className={`py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
              selectedSpecies === 'all'
                ? 'bg-[#0B3E39] dark:bg-teal-600 text-white shadow-2xs dark:shadow-[0_0_12px_rgba(20,184,166,0.3)]'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            {t('allSpecies')}
          </button>
          <button
            onClick={() => setSelectedSpecies('dog')}
            className={`flex items-center justify-center gap-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
              selectedSpecies === 'dog'
                ? 'bg-[#0B3E39] dark:bg-teal-600 text-white shadow-2xs dark:shadow-[0_0_12px_rgba(20,184,166,0.3)]'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Dog className="w-3.5 h-3.5" />
            <span>{t('dog')}</span>
          </button>
          <button
            onClick={() => setSelectedSpecies('cat')}
            className={`flex items-center justify-center gap-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
              selectedSpecies === 'cat'
                ? 'bg-[#0B3E39] dark:bg-teal-600 text-white shadow-2xs dark:shadow-[0_0_12px_rgba(20,184,166,0.3)]'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Cat className="w-3.5 h-3.5" />
            <span>{t('cat')}</span>
          </button>
        </div>

        {/* Status Category Filter */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {[
            { id: 'all', label: t('all') },
            { id: 'valid', label: `🟢 ${t('vaccinated')}` },
            { id: 'due', label: `🟡 ${t('dueSoon')}` },
            { id: 'unvaccinated', label: `⚪ ${t('unvaccinated')}` },
            { id: 'emergency', label: `🚨 ${t('injured')}` },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setFilterStatus(st.id as any)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                filterStatus === st.id
                  ? 'bg-[#0B3E39] dark:bg-teal-600 text-white dark:shadow-[0_0_12px_rgba(20,184,166,0.3)]'
                  : 'bg-white dark:bg-[#0E2C28] text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-teal-500/20 hover:bg-stone-50 dark:hover:bg-[#133A35]'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Heatmap & Density Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-200/80 dark:border-teal-500/20">
          <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 dark:text-stone-200 cursor-pointer">
            <Flame className={`w-4 h-4 ${showHeatmap ? 'text-rose-500 animate-pulse' : 'text-stone-400'}`} />
            <span>{t('mapTitle')}</span>
          </label>
          <input
            type="checkbox"
            checked={showHeatmap}
            onChange={(e) => setShowHeatmap(e.target.checked)}
            className="w-4 h-4 text-teal-600 rounded border-stone-300 dark:border-teal-500/30 dark:bg-[#071917] focus:ring-teal-500 cursor-pointer"
          />
        </div>

        {/* Ward Filter Select */}
        <div className="mt-2.5">
          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="w-full text-xs font-medium text-stone-700 dark:text-stone-200 bg-white dark:bg-[#0E2C28] border border-stone-200 dark:border-teal-500/20 rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="all">{t('allWards')}</option>
            {zones.map((z) => (
              <option key={z.id} value={z.wardName} className="dark:bg-[#0A221F]">
                {z.wardName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Floating GPS Locate Button (Bottom Right) */}
      <button
        onClick={handleLocateMe}
        disabled={isLocating}
        className="absolute bottom-6 right-6 z-10 flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white dark:bg-[#0A221F] text-[#0B3E39] dark:text-teal-200 border border-stone-300 dark:border-teal-500/30 shadow-xl dark:shadow-[0_8px_25px_rgba(0,0,0,0.6)] hover:bg-stone-50 dark:hover:bg-[#0E2C28] active:scale-95 transition cursor-pointer text-xs font-bold"
        title="Find your current location"
      >
        <Locate className={`w-4 h-4 text-[#0B3E39] dark:text-teal-300 ${isLocating ? 'animate-spin' : ''}`} />
        <span className="hidden sm:inline">My Location</span>
      </button>

      {/* Quick Animal Detail Drawer (When Marker is Clicked) */}
      {selectedAnimal && (
        <div className="absolute bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-20 bg-white dark:bg-[#0A221F]/95 backdrop-blur-md rounded-2xl shadow-2xl dark:shadow-[0_16px_40px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.06)] border border-stone-200 dark:border-teal-500/30 p-4 animate-in slide-in-from-bottom-3 text-stone-900 dark:text-stone-100">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <img
                src={selectedAnimal.photoUrl}
                alt={selectedAnimal.name || selectedAnimal.tagNumber}
                className="w-14 h-14 rounded-xl object-cover border border-stone-200 dark:border-teal-500/30 shadow-xs"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/80 text-[#0B3E39] dark:text-teal-200 border border-teal-200 dark:border-teal-500/30">
                    {selectedAnimal.tagNumber}
                  </span>
                  {selectedAnimal.earNotch !== 'none' && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-stone-100 dark:bg-[#071917] text-stone-700 dark:text-teal-300 border border-stone-200 dark:border-teal-500/20 flex items-center gap-1">
                      ✂ {selectedAnimal.earNotch.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-black text-stone-900 dark:text-white mt-0.5">
                  {selectedAnimal.name || `${selectedAnimal.species.toUpperCase()} (${selectedAnimal.tagNumber})`}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-300">{selectedAnimal.breed || 'Indie'}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedAnimal(null)}
              className="text-stone-400 dark:text-stone-400 hover:text-stone-700 dark:hover:text-white text-sm font-bold p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-stone-100 dark:border-teal-500/20 my-2">
            <div>
              <span className="text-stone-400 dark:text-stone-400 block text-[10px] uppercase font-bold">Vaccination:</span>
              <span
                className={`font-semibold ${
                  selectedAnimal.vaccinationStatus === 'valid'
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : selectedAnimal.vaccinationStatus === 'due_soon'
                    ? 'text-amber-700 dark:text-amber-300'
                    : 'text-rose-700 dark:text-rose-300'
                }`}
              >
                {selectedAnimal.vaccinationStatus.toUpperCase().replace(/_/g, ' ')}
              </span>
            </div>
            <div>
              <span className="text-stone-400 dark:text-stone-400 block text-[10px] uppercase font-bold">Sterilization:</span>
              <span className="font-semibold text-stone-800 dark:text-stone-200 capitalize">
                {selectedAnimal.sterilizationStatus}
              </span>
            </div>
          </div>

          <div className="text-[11px] text-stone-500 dark:text-stone-400 mb-3 truncate">
            📍 {selectedAnimal.primaryLocation.address || selectedAnimal.primaryLocation.wardName}
          </div>

          <button
            onClick={() => {
              onSelectAnimal(selectedAnimal);
              setSelectedAnimal(null);
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0B3E39] dark:bg-gradient-to-r dark:from-teal-600 dark:to-emerald-600 text-[#FAF6EE] font-bold text-xs hover:bg-[#145E56] dark:hover:from-teal-500 dark:hover:to-emerald-500 transition shadow-xs dark:shadow-[0_0_15px_rgba(20,184,166,0.3)] cursor-pointer"
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Open Health Identity &amp; Collar Tag</span>
          </button>
        </div>
      )}
    </div>
  );
};
