import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useApp } from '../../context/AppContext';
import { Animal, EmergencyReport, Zone } from '../../types';
import {
  Layers,
  Filter,
  Flame,
  ShieldCheck,
  AlertTriangle,
  Locate,
  Dog,
  Cat,
  Tag,
  CheckCircle2,
  Info,
} from 'lucide-react';

interface PawtopiaMapProps {
  onSelectAnimal: (animal: Animal) => void;
  onSelectReport?: (report: EmergencyReport) => void;
}

export const PawtopiaMap: React.FC<PawtopiaMapProps> = ({ onSelectAnimal, onSelectReport }) => {
  const { animals, reports, zones, getWardReadiness } = useApp();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const heatLayerRef = useRef<L.LayerGroup | null>(null);

  // Filters
  const [selectedSpecies, setSelectedSpecies] = useState<'all' | 'dog' | 'cat'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'valid' | 'due' | 'unvaccinated' | 'emergency'>('all');
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [selectedItemSummary, setSelectedItemSummary] = useState<Animal | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    // Center on Bangalore (Bangalore Metropolitan Stray & Rabies Control Hub)
    const map = L.map(mapContainerRef.current, {
      center: [12.9716, 77.5946],
      zoom: 12,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors | Pawtopia Stray Surveillance',
      maxZoom: 19,
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    heatLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers & Heatmap based on filters
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    const heatLayer = heatLayerRef.current;
    if (!map || !markersLayer || !heatLayer) return;

    markersLayer.clearLayers();
    heatLayer.clearLayers();

    // 1. Render Heatmap circles if enabled
    if (showHeatmap) {
      zones.forEach((zone) => {
        const readiness = getWardReadiness(zone);
        // Heat circle intensity based on unsterilized/unvaccinated density + bite incidents
        const radius = Math.min(2200, Math.max(900, zone.estimatedStrayPopulation * 2.8));
        const isHotspot = zone.biteIncidentsLast90Days >= 3 || readiness.overallScore < 55;
        const circleColor = isHotspot ? '#EF4444' : '#14B8A6';

        const heatCircle = L.circle(zone.center, {
          radius,
          color: circleColor,
          fillColor: circleColor,
          fillOpacity: isHotspot ? 0.22 : 0.12,
          weight: 1.5,
          dashArray: isHotspot ? '4, 6' : undefined,
        });

        heatCircle.bindTooltip(
          `<strong>${zone.wardName}</strong><br/>Readiness: ${readiness.overallScore}/100 (${readiness.tier})<br/>Estimated Strays: ${zone.estimatedStrayPopulation}<br/>Bites (90d): ${zone.biteIncidentsLast90Days}`,
          { permanent: false, direction: 'top', className: 'pawtopia-tooltip' }
        );

        heatCircle.addTo(heatLayer);
      });
    }

    // 2. Render Animal Markers
    const filteredAnimals = animals.filter((animal) => {
      if (selectedSpecies !== 'all' && animal.species !== selectedSpecies) return false;
      if (selectedWard !== 'all' && animal.primaryLocation.wardName !== selectedWard) return false;
      if (filterStatus === 'valid' && animal.vaccinationStatus !== 'valid') return false;
      if (filterStatus === 'due' && animal.vaccinationStatus !== 'due_soon') return false;
      if (filterStatus === 'unvaccinated' && animal.vaccinationStatus !== 'unvaccinated' && animal.vaccinationStatus !== 'overdue') return false;
      return true;
    });

    filteredAnimals.forEach((animal) => {
      const isDog = animal.species === 'dog';
      const isSterilized = animal.sterilizationStatus === 'sterilized';
      const isVaccinated = animal.vaccinationStatus === 'valid';
      const isDueSoon = animal.vaccinationStatus === 'due_soon';

      // Determine marker color
      let markerColor = '#10B981'; // Green for valid vaccination
      if (isDueSoon) markerColor = '#F59E0B'; // Amber
      else if (animal.vaccinationStatus === 'overdue' || animal.vaccinationStatus === 'unvaccinated') {
        markerColor = '#6B7280'; // Gray
      }

      // Ear notch badge icon indicator directly on marker so field teams see sterilization at a glance!
      const earNotchBadgeHtml =
        animal.earNotch !== 'none'
          ? `<span style="position:absolute;top:-4px;right:-4px;background:#0B3E39;color:#FAF6EE;font-size:9px;font-weight:900;border-radius:50%;width:16px;height:16px;display:flex;align-items:center;justify-content:center;border:1.5px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3);" title="Sterilized: ${animal.earNotch}">✂</span>`
          : '';

      const customIcon = L.divIcon({
        className: 'custom-animal-marker',
        html: `
          <div style="position:relative;display:flex;align-items:center;justify-content:center;width:34px;height:34px;background:${markerColor};border:2.5px solid white;border-radius:50%;box-shadow:0 3px 8px rgba(0,0,0,0.3);cursor:pointer;transition:transform 0.2s;">
            <span style="color:white;font-size:14px;font-weight:bold;">${isDog ? '🐕' : '🐈'}</span>
            ${earNotchBadgeHtml}
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const marker = L.marker([animal.primaryLocation.lat, animal.primaryLocation.lng], { icon: customIcon });

      marker.on('click', () => {
        setSelectedItemSummary(animal);
      });

      marker.addTo(markersLayer);
    });

    // 3. Render Emergency Rescue Reports
    if (filterStatus === 'all' || filterStatus === 'emergency') {
      const activeReports = reports.filter((r) => r.status !== 'resolved');
      activeReports.forEach((rep) => {
        const isCritical = rep.severity === 'critical' || rep.issueType === 'suspected_rabies';
        const repIcon = L.divIcon({
          className: 'custom-report-marker',
          html: `
            <div style="position:relative;display:flex;align-items:center;justify-content:center;width:38px;height:38px;background:${
              isCritical ? '#DC2626' : '#EA580C'
            };border:3px solid white;border-radius:50%;box-shadow:0 0 12px ${
            isCritical ? 'rgba(220,38,38,0.7)' : 'rgba(234,88,12,0.5)'
          };cursor:pointer;animation:pulse 1.8s infinite;">
              <span style="color:white;font-size:16px;">🚨</span>
            </div>
          `,
          iconSize: [38, 38],
          iconAnchor: [19, 19],
        });

        const repMarker = L.marker([rep.location.lat, rep.location.lng], { icon: repIcon });

        repMarker.bindPopup(`
          <div style="font-family:sans-serif;min-width:200px;">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
              <span style="background:#EF4444;color:white;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:bold;text-transform:uppercase;">${rep.severity} Emergency</span>
              <strong style="font-size:12px;color:#1F2937;">#${rep.reportNumber}</strong>
            </div>
            <p style="font-size:12px;color:#374151;margin:4px 0 8px 0;line-height:1.3;">${rep.description}</p>
            <div style="font-size:11px;color:#6B7280;margin-bottom:8px;">📍 ${rep.location.address || rep.location.wardName}</div>
            <span style="display:inline-block;padding:2px 8px;border-radius:9999px;font-size:10px;font-weight:600;background:#FEF3C7;color:#92400E;">Status: ${rep.status}</span>
          </div>
        `);

        repMarker.addTo(markersLayer);
      });
    }
  }, [animals, reports, zones, selectedSpecies, filterStatus, showHeatmap, selectedWard]);

  // Center on user GPS location
  const handleLocateMe = () => {
    if (!navigator.geolocation || !mapInstanceRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        mapInstanceRef.current?.flyTo([latitude, longitude], 15, { duration: 1.5 });
        L.circle([latitude, longitude], {
          radius: 80,
          color: '#0B3E39',
          fillColor: '#0B3E39',
          fillOpacity: 0.3,
        })
          .bindPopup('Your Current GPS Position')
          .addTo(mapInstanceRef.current!);
      },
      (err) => {
        console.warn('Geolocation failed:', err.message);
        // Default to Indiranagar center
        mapInstanceRef.current?.flyTo([12.9784, 77.6408], 14);
      }
    );
  };

  return (
    <div className="relative w-full h-[calc(100vh-130px)] min-h-[580px] bg-stone-100 overflow-hidden">
      {/* Map Element */}
      <div ref={mapContainerRef} className="w-full h-full z-0" tabIndex={0} aria-label="Interactive stray animal map" />

      {/* Floating Control & Filter Panel (Top Left) */}
      <div className="absolute top-4 left-4 z-10 max-w-sm w-full bg-[#FAF6EE]/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-[#0B3E39]/15">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#0B3E39]" />
            <h2 className="text-xs font-black uppercase tracking-wider text-[#0B3E39]">Stray Surveillance Map</h2>
          </div>
          <span className="text-[11px] font-bold text-stone-500 bg-white px-2 py-0.5 rounded-full border border-stone-200">
            {animals.length} Animals Tracked
          </span>
        </div>

        {/* Species Filter Buttons */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-white/80 rounded-xl border border-stone-200 mb-3">
          <button
            onClick={() => setSelectedSpecies('all')}
            className={`py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
              selectedSpecies === 'all' ? 'bg-[#0B3E39] text-white shadow-2xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All Species
          </button>
          <button
            onClick={() => setSelectedSpecies('dog')}
            className={`flex items-center justify-center gap-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
              selectedSpecies === 'dog' ? 'bg-[#0B3E39] text-white shadow-2xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Dog className="w-3.5 h-3.5" />
            <span>Dogs</span>
          </button>
          <button
            onClick={() => setSelectedSpecies('cat')}
            className={`flex items-center justify-center gap-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
              selectedSpecies === 'cat' ? 'bg-[#0B3E39] text-white shadow-2xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Cat className="w-3.5 h-3.5" />
            <span>Cats</span>
          </button>
        </div>

        {/* Status Category Filter */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {[
            { id: 'all', label: 'All Status' },
            { id: 'valid', label: '🟢 Vaccinated' },
            { id: 'due', label: '🟡 Due Soon' },
            { id: 'unvaccinated', label: '⚪ Unvaccinated' },
            { id: 'emergency', label: '🚨 Active Rescues' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setFilterStatus(st.id as any)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                filterStatus === st.id
                  ? 'bg-[#0B3E39] text-white'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Heatmap & Density Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-200/80">
          <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer">
            <Flame className={`w-4 h-4 ${showHeatmap ? 'text-rose-500' : 'text-stone-400'}`} />
            <span>Population & Hotspot Heatmap</span>
          </label>
          <input
            type="checkbox"
            checked={showHeatmap}
            onChange={(e) => setShowHeatmap(e.target.checked)}
            className="w-4 h-4 text-[#0B3E39] rounded border-stone-300 focus:ring-[#0B3E39] cursor-pointer"
          />
        </div>

        {/* Ward Filter Select */}
        <div className="mt-2.5">
          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="w-full text-xs font-medium text-stone-700 bg-white border border-stone-200 rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="all">All City Wards & Zones</option>
            {zones.map((z) => (
              <option key={z.id} value={z.wardName}>
                {z.wardName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Floating GPS Locate Button (Bottom Right) */}
      <button
        onClick={handleLocateMe}
        className="absolute bottom-6 right-6 z-10 flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white text-[#0B3E39] border border-stone-300 shadow-xl hover:bg-stone-50 active:scale-95 transition cursor-pointer text-xs font-bold"
        title="Find your current location"
      >
        <Locate className="w-4 h-4 text-[#0B3E39]" />
        <span className="hidden sm:inline">My Location</span>
      </button>

      {/* Quick Animal Detail Drawer (When Marker is Clicked) */}
      {selectedItemSummary && (
        <div className="absolute bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-20 bg-white rounded-2xl shadow-2xl border border-stone-200 p-4 animate-in slide-in-from-bottom-3">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <img
                src={selectedItemSummary.photoUrl}
                alt={selectedItemSummary.name || selectedItemSummary.tagNumber}
                className="w-14 h-14 rounded-xl object-cover border border-stone-200 shadow-xs"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-[#0B3E39] border border-teal-200">
                    {selectedItemSummary.tagNumber}
                  </span>
                  {selectedItemSummary.earNotch !== 'none' && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200 flex items-center gap-1">
                      ✂ {selectedItemSummary.earNotch.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-black text-stone-900 mt-0.5">
                  {selectedItemSummary.name || `${selectedItemSummary.species.toUpperCase()} (${selectedItemSummary.tagNumber})`}
                </h3>
                <p className="text-xs text-stone-500">{selectedItemSummary.breed || 'Indie'}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedItemSummary(null)}
              className="text-stone-400 hover:text-stone-700 text-sm font-bold p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-stone-100 my-2">
            <div>
              <span className="text-stone-400 block text-[10px] uppercase font-bold">Vaccination:</span>
              <span
                className={`font-semibold ${
                  selectedItemSummary.vaccinationStatus === 'valid'
                    ? 'text-emerald-700'
                    : selectedItemSummary.vaccinationStatus === 'due_soon'
                    ? 'text-amber-700'
                    : 'text-rose-700'
                }`}
              >
                {selectedItemSummary.vaccinationStatus.toUpperCase().replace(/_/g, ' ')}
              </span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px] uppercase font-bold">Sterilization:</span>
              <span className="font-semibold text-stone-800 capitalize">
                {selectedItemSummary.sterilizationStatus}
              </span>
            </div>
          </div>

          <div className="text-[11px] text-stone-500 mb-3 truncate">
            📍 {selectedItemSummary.primaryLocation.address || selectedItemSummary.primaryLocation.wardName}
          </div>

          <button
            onClick={() => {
              onSelectAnimal(selectedItemSummary);
              setSelectedItemSummary(null);
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0B3E39] text-[#FAF6EE] font-bold text-xs hover:bg-[#145E56] transition shadow-xs cursor-pointer"
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Open Health Identity &amp; Collar Tag</span>
          </button>
        </div>
      )}
    </div>
  );
};
