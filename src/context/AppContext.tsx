import React, { createContext, useContext, useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Animal,
  EmergencyReport,
  Task,
  Zone,
  Camp,
  BiteIncident,
  InventoryItem,
  Expense,
  FeederSpot,
  Role,
  AuditLog,
  VaccinationStatus,
  ReadinessScoreResult,
  OfflineQueueItem,
} from '../types';
import {
  INITIAL_ANIMALS,
  INITIAL_REPORTS,
  INITIAL_TASKS,
  INITIAL_ZONES,
  INITIAL_CAMPS,
  INITIAL_BITE_INCIDENTS,
  INITIAL_INVENTORY,
  INITIAL_EXPENSES,
  INITIAL_FEEDERS,
} from '../data/seedData';
import { calculateWardReadinessScore } from '../utils/readiness';
import { generateFeatureVector } from '../utils/aiMatcher';
import { createQueueItem } from '../utils/syncQueue';

export type Language = 'en' | 'kn' | 'hi';

export interface AppContextType {
  role: Role;
  setRole: (role: Role) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  lang: Language;
  setLang: (lang: Language) => void;
  animals: Animal[];
  setAnimals: React.Dispatch<React.SetStateAction<Animal[]>>;
  reports: EmergencyReport[];
  tasks: Task[];
  zones: Zone[];
  camps: Camp[];
  bites: BiteIncident[];
  inventory: InventoryItem[];
  expenses: Expense[];
  feeders: FeederSpot[];
  auditLogs: AuditLog[];
  offlineQueueCount: number;
  offlineQueue: OfflineQueueItem[];
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: string;
  toggleSimulateOffline: () => void;
  syncOfflineQueue: () => Promise<void>;
  addEmergencyReport: (report: Omit<EmergencyReport, 'id' | 'reportNumber' | 'reportedAt' | 'priorityScore'>) => Promise<EmergencyReport>;
  updateReportStatus: (id: string, status: EmergencyReport['status'], assignedNGO?: string, notes?: string) => void;
  registerAnimal: (animalData: Omit<Animal, 'id' | 'tagNumber' | 'createdAt' | 'updatedAt' | 'qrCodeUrl' | 'featureEmbedding'>) => Promise<Animal>;
  recordVaccination: (animalId: string, vaccineName: string, batchNumber: string, vetName: string, nextDue: string) => void;
  recordSterilization: (animalId: string, surgeonName: string, clinic: string, earNotch: Animal['earNotch']) => void;
  recordReturnToSite: (animalId: string, releaseLat: number, releaseLng: number, driverName: string) => { isCompliant: boolean; distanceMeters: number };
  updateTaskStatus: (taskId: string, newStatus: Task['status']) => void;
  addTask: (task: Omit<Task, 'id'>) => void;
  logBiteIncident: (incident: Omit<BiteIncident, 'id'>) => void;
  updateInventoryStock: (itemId: string, deltaQuantity: number) => void;
  selectedAnimalForQR: Animal | null;
  setSelectedAnimalForQR: (animal: Animal | null) => void;
  activeView: string;
  setActiveView: (view: string) => void;
  getWardReadiness: (zone: Zone) => ReadinessScoreResult;
  t: (key: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Simple multilingual strings dictionary
const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    appTitle: 'Pawtopia',
    tagline: 'A better world for every paw',
    subtitle: 'Stray Dog & Cat Management and Rabies Control',
    reportEmergency: 'Emergency Rescue Report',
    publicMap: 'Stray & Health Map',
    registry: 'Animal Health Identity',
    readinessScore: 'Ward Rabies Readiness',
    ngoTasks: 'Rescuer Taskboard',
    inventoryBudget: 'Vaccine Stock & Grants',
    biteControl: 'Bite & Rabies Center',
    campsFeeders: 'Camps & Feeder Network',
    transparency: 'Public City Transparency',
    findAnimalAI: 'AI Photo Matcher',
    roleCitizen: 'Citizen / Volunteer',
    roleNGO: 'NGO Rescuer',
    roleVet: 'Veterinarian',
    roleAdmin: 'Municipal Authority',
    vaccinated: 'Vaccinated',
    sterilized: 'Sterilized',
    unvaccinated: 'Unvaccinated',
    injured: 'Emergency / Injured',
    printCollarTag: 'Print QR Collar Tag',
  },
  kn: {
    appTitle: 'ಪಾಟೋಪಿಯಾ (Pawtopia)',
    tagline: 'ಪ್ರತಿಯೊಂದು ಪ್ರಾಣಿಗೂ ಸುಂದರ ಜಗತ್ತು',
    subtitle: 'ಬೀದಿ ನಾಯಿ ಮತ್ತು ಬೆಕ್ಕುಗಳ ನಿರ್ವಹಣೆ ಹಾಗೂ ರೇಬೀಸ್ ನಿಯಂತ್ರಣ',
    reportEmergency: 'ತುರ್ತು ರಕ್ಷಣಾ ವರದಿ',
    publicMap: 'ಪ್ರಾಣಿಗಳ ಆರೋಗ್ಯ ನಕ್ಷೆ',
    registry: 'ಪ್ರಾಣಿ ಆರೋಗ್ಯ ಗುರುತು',
    readinessScore: 'ವಾರ್ಡ್ ರೇಬೀಸ್ ಸಿದ್ಧತಾ ಅಂಕ',
    ngoTasks: 'ಕಾರ್ಯ ನಿರ್ವಹಣೆ ಫೀಡ್',
    inventoryBudget: 'ಲಸಿಕೆ ದಾಸ್ತಾನು ಮತ್ತು ವೆಚ್ಚ',
    biteControl: 'ಕಡಿತ ಪ್ರಕರಣ ಮತ್ತು ರೇಬೀಸ್ ಘಟಕ',
    campsFeeders: 'ಲಸಿಕಾ ಶಿಬಿರ ಮತ್ತು ಪೋಷಕರು',
    transparency: 'ಸಾರ್ವಜನಿಕ ನಗರ ಪ್ರಗತಿ',
    findAnimalAI: 'AI ಫೋಟೋ ಹುಡುಕಾಟ',
    roleCitizen: 'ನಾಗರಿಕ / ಸ್ವಯಂಸೇವಕ',
    roleNGO: 'ಎನ್‌ಜಿಒ ರಕ್ಷಕ',
    roleVet: 'ಪಶುವೈದ್ಯರು',
    roleAdmin: 'ನಗರ ಪಾಲಿಕೆ ಪ್ರಾಧಿಕಾರ',
    vaccinated: 'ಲಸಿಕೆ ಪಡೆದಿದೆ',
    sterilized: 'ಸಂತಾನಹರಣ ಮಾಡಲಾಗಿದೆ',
    unvaccinated: 'ಲಸಿಕೆ ಪಡೆದಿಲ್ಲ',
    injured: 'ತುರ್ತು / ಗಾಯಗೊಂಡಿದೆ',
    printCollarTag: 'QR ಕಾಲರ್ ಟ್ಯಾಗ್ ಪ್ರಿಂಟ್',
  },
  hi: {
    appTitle: 'पॉपिया (Pawtopia)',
    tagline: 'हर बेजुबान के लिए एक बेहतर संसार',
    subtitle: 'आवारा श्वान एवं बिल्ली प्रबंधन तथा रेबीज नियंत्रण',
    reportEmergency: 'आपातकालीन बचाव रिपोर्ट',
    publicMap: 'आवारा पशु एवं स्वास्थ्य मानचित्र',
    registry: 'पशु स्वास्थ्य पहचान (QR)',
    readinessScore: 'वार्ड रेबीज-मुक्त स्कोर',
    ngoTasks: 'कार्य बोर्ड (टास्क)',
    inventoryBudget: 'वैक्सीन स्टॉक एवं बजट',
    biteControl: 'श्वान दंश एवं रेबीज केंद्र',
    campsFeeders: 'टीकाकरण शिविर व फीडर नेटवर्क',
    transparency: 'सार्वजनिक नगर पारदर्शिता',
    findAnimalAI: 'AI फोटो मिलान',
    roleCitizen: 'नागरिक / स्वयंसेवक',
    roleNGO: 'एनजीओ / बचाव दल',
    roleVet: 'पशु चिकित्सक',
    roleAdmin: 'नगर निगम / प्रशासन',
    vaccinated: 'टीकाकृत (सुरक्षित)',
    sterilized: 'नसबंदी संपन्न',
    unvaccinated: 'टीकाकरण शेष',
    injured: 'आपातकाल / घायल',
    printCollarTag: 'QR कॉलर टैग प्रिंट करें',
  },
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role>('ngo');
  const [lang, setLang] = useState<Language>('en');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('pawtopia_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  // Sync theme with document root class & body
  useEffect(() => {
    try {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
      }
      localStorage.setItem('pawtopia_theme', theme);
    } catch (e) {
      console.warn('Could not persist theme', e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const [activeView, setActiveView] = useState<string>('map');
  const [animals, setAnimals] = useState<Animal[]>(INITIAL_ANIMALS);
  const [reports, setReports] = useState<EmergencyReport[]>(INITIAL_REPORTS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [zones, setZones] = useState<Zone[]>(INITIAL_ZONES);
  const [camps, setCamps] = useState<Camp[]>(INITIAL_CAMPS);
  const [bites, setBites] = useState<BiteIncident[]>(INITIAL_BITE_INCIDENTS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [feeders, setFeeders] = useState<FeederSpot[]>(INITIAL_FEEDERS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: 'log-1',
      timestamp: '2026-10-30T17:40:00Z',
      action: 'EMERGENCY_REPORT_CREATED',
      userId: 'usr-cit-101',
      userName: 'Anand Nair',
      userRole: 'citizen',
      details: 'Reported hit-and-run indie dog at Indiranagar 12th Main',
    },
  ]);
  const [selectedAnimalForQR, setSelectedAnimalForQR] = useState<Animal | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');
  const [offlineQueue, setOfflineQueue] = useState<OfflineQueueItem[]>(() => {
    try {
      const saved = localStorage.getItem('pawtopia_pwa_queue');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const offlineQueueCount = offlineQueue.length;

  // Persist queue to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pawtopia_pwa_queue', JSON.stringify(offlineQueue));
    } catch (e) {
      console.warn('Could not save queue to localStorage', e);
    }
  }, [offlineQueue]);

  // Monitor real browser network status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto trigger background sync on reconnect if queue has pending items
      if (offlineQueue.length > 0) {
        syncOfflineQueue();
      }
    };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [offlineQueue.length]);

  const toggleSimulateOffline = () => {
    setIsOnline((prev) => !prev);
  };

  const syncOfflineQueue = async () => {
    if (offlineQueue.length === 0) return;
    setIsSyncing(true);
    // Simulate PWA service worker background sync flush
    await new Promise((resolve) => setTimeout(resolve, 900));
    setOfflineQueue([]);
    setIsSyncing(false);
    setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  };

  // Pre-generate QR code data URLs for seed animals if missing
  useEffect(() => {
    async function attachQRs() {
      const updated = await Promise.all(
        animals.map(async (animal) => {
          if (animal.qrCodeUrl) return animal;
          const publicUrl = `${window.location.origin}/?animal=${animal.tagNumber}`;
          try {
            const dataUrl = await QRCode.toDataURL(publicUrl, {
              margin: 1,
              width: 256,
              color: { dark: '#0B3E39', light: '#FAF6EE' },
            });
            return { ...animal, qrCodeUrl: dataUrl };
          } catch (e) {
            return animal;
          }
        })
      );
      setAnimals(updated);
    }
    attachQRs();
  }, []);

  const t = (key: string): string => {
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en[key] || key;
  };

  const getWardReadiness = (zone: Zone): ReadinessScoreResult => {
    return calculateWardReadinessScore(zone);
  };

  // Add Emergency Report with auto-routing
  const addEmergencyReport = async (
    reportData: Omit<EmergencyReport, 'id' | 'reportNumber' | 'reportedAt' | 'priorityScore'>
  ): Promise<EmergencyReport> => {
    const reportNum = `REP-2026-${String(reports.length + 90).padStart(3, '0')}`;
    let priority = 50;
    if (reportData.severity === 'critical' || reportData.issueType === 'suspected_rabies') priority = 98;
    else if (reportData.severity === 'high') priority = 80;
    else if (reportData.severity === 'medium') priority = 60;

    const newReport: EmergencyReport = {
      ...reportData,
      id: `rep-${Date.now()}`,
      reportNumber: reportNum,
      reportedAt: new Date().toISOString(),
      priorityScore: priority,
      status: 'reported',
      notes: [`Report received via Pawtopia mobile intake. Routed to nearest response zone.`],
    };

    setReports((prev) => [newReport, ...prev]);

    // Automatically spawn task for field NGO
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: `Rescue: ${newReport.issueType.replace(/_/g, ' ')} (${newReport.location.wardName})`,
      type: 'rescue',
      priority: newReport.severity === 'critical' ? 'urgent' : newReport.severity === 'high' ? 'high' : 'medium',
      status: 'todo',
      assignedTo: 'Rapid Response Team',
      ngoName: 'Bangalore Animal Care Network',
      reportId: newReport.id,
      wardName: newReport.location.wardName,
      dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    };
    setTasks((prev) => [newTask, ...prev]);

    // Log audit
    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'EMERGENCY_REPORT_FILED',
        userId: role,
        userName: reportData.isAnonymous ? 'Anonymous Citizen' : reportData.reporterName,
        userRole: role,
        details: `Filed emergency report #${reportNum} for ${reportData.species} in ${reportData.location.wardName}`,
      },
      ...prev,
    ]);

    // Queue item if offline
    if (!isOnline) {
      const qItem = createQueueItem(
        'emergency_report',
        `Rescue #${reportNum}: ${reportData.species} in ${reportData.location.wardName}`,
        reportData.description.slice(0, 60)
      );
      setOfflineQueue((prev) => [qItem, ...prev]);
    }

    return newReport;
  };

  const updateReportStatus = (id: string, status: EmergencyReport['status'], assignedNGO?: string, notes?: string) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updatedNotes = notes ? [...(r.notes || []), notes] : r.notes;
        return {
          ...r,
          status,
          assignedNGO: assignedNGO || r.assignedNGO,
          resolvedAt: status === 'resolved' ? new Date().toISOString() : r.resolvedAt,
          notes: updatedNotes,
        };
      })
    );
  };

  // Register Animal
  const registerAnimal = async (
    animalData: Omit<Animal, 'id' | 'tagNumber' | 'createdAt' | 'updatedAt' | 'qrCodeUrl' | 'featureEmbedding'>
  ): Promise<Animal> => {
    const count = animals.length + 1;
    const wardShort = animalData.primaryLocation.wardName.slice(5, 8).toUpperCase() || 'BLR';
    const tagNumber = `PAW-${wardShort}-${String(count).padStart(3, '0')}`;
    const publicUrl = `${window.location.origin}/?animal=${tagNumber}`;

    let qrCodeUrl = '';
    try {
      qrCodeUrl = await QRCode.toDataURL(publicUrl, {
        margin: 1,
        width: 256,
        color: { dark: '#0B3E39', light: '#FAF6EE' },
      });
    } catch (e) {
      console.error('Error generating QR', e);
    }

    const featureEmbedding = generateFeatureVector(
      `${tagNumber}-${animalData.species}-${animalData.colorPattern}-${animalData.distinctiveMarks}`
    );

    const newAnimal: Animal = {
      ...animalData,
      id: `paw-${Date.now()}`,
      tagNumber,
      qrCodeUrl,
      featureEmbedding,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    setAnimals((prev) => [newAnimal, ...prev]);

    // Update zone stats
    setZones((prev) =>
      prev.map((z) => {
        if (z.wardName === animalData.primaryLocation.wardName) {
          return {
            ...z,
            vaccinatedCount: animalData.vaccinationStatus === 'valid' ? z.vaccinatedCount + 1 : z.vaccinatedCount,
            sterilizedCount: animalData.sterilizationStatus === 'sterilized' ? z.sterilizedCount + 1 : z.sterilizedCount,
          };
        }
        return z;
      })
    );

    // Queue item if offline
    if (!isOnline) {
      const qItem = createQueueItem(
        'animal_registration',
        `New Registration: ${animalData.name || 'Indie'} (${tagNumber})`,
        `${animalData.species} • ${animalData.primaryLocation.wardName}`
      );
      setOfflineQueue((prev) => [qItem, ...prev]);
    }

    return newAnimal;
  };

  const recordVaccination = (
    animalId: string,
    vaccineName: string,
    batchNumber: string,
    vetName: string,
    nextDue: string
  ) => {
    const today = new Date().toISOString().split('T')[0];
    setAnimals((prev) =>
      prev.map((a) => {
        if (a.id !== animalId) return a;
        return {
          ...a,
          vaccinationStatus: 'valid' as VaccinationStatus,
          lastVaccinationDate: today,
          nextVaccinationDueDate: nextDue,
          updatedAt: today,
        };
      })
    );

    // Consume 1 vaccine dose from inventory
    setInventory((prev) =>
      prev.map((item) => {
        if (item.category === 'vaccine' && item.remainingQuantity > 0) {
          return { ...item, remainingQuantity: item.remainingQuantity - 1 };
        }
        return item;
      })
    );

    // Queue item if offline
    if (!isOnline) {
      const qItem = createQueueItem(
        'vaccination',
        `Vaccination Log: ${vaccineName}`,
        `Batch #${batchNumber} • Next Due: ${nextDue}`
      );
      setOfflineQueue((prev) => [qItem, ...prev]);
    }
  };

  const recordSterilization = (
    animalId: string,
    surgeonName: string,
    clinic: string,
    earNotch: Animal['earNotch']
  ) => {
    const today = new Date().toISOString().split('T')[0];
    setAnimals((prev) =>
      prev.map((a) => {
        if (a.id !== animalId) return a;
        return {
          ...a,
          sterilizationStatus: 'sterilized',
          sterilizationDate: today,
          earNotch,
          updatedAt: today,
        };
      })
    );

    if (!isOnline) {
      const qItem = createQueueItem(
        'sterilization',
        `ABC Surgery Log`,
        `Ear-Notch: ${earNotch} • Center: ${clinic}`
      );
      setOfflineQueue((prev) => [qItem, ...prev]);
    }
  };

  const recordReturnToSite = (animalId: string, releaseLat: number, releaseLng: number, driverName: string) => {
    const animal = animals.find((a) => a.id === animalId);
    if (!animal) return { isCompliant: true, distanceMeters: 0 };

    // Calculate distance
    const R = 6371e3;
    const phi1 = (animal.primaryLocation.lat * Math.PI) / 180;
    const phi2 = (releaseLat * Math.PI) / 180;
    const deltaPhi = ((releaseLat - animal.primaryLocation.lat) * Math.PI) / 180;
    const deltaLambda = ((releaseLng - animal.primaryLocation.lng) * Math.PI) / 180;
    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = Math.round(R * c);

    const isCompliant = dist <= 500;
    return { isCompliant, distanceMeters: dist };
  };

  const updateTaskStatus = (taskId: string, newStatus: Task['status']) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
  };

  const addTask = (taskData: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const logBiteIncident = (incidentData: Omit<BiteIncident, 'id'>) => {
    const newIncident: BiteIncident = {
      ...incidentData,
      id: `bite-${Date.now()}`,
    };
    setBites((prev) => [newIncident, ...prev]);

    // Increment ward bite incidents
    setZones((prev) =>
      prev.map((z) => {
        if (z.wardName === incidentData.location.wardName) {
          return { ...z, biteIncidentsLast90Days: z.biteIncidentsLast90Days + 1 };
        }
        return z;
      })
    );

    if (!isOnline) {
      const qItem = createQueueItem(
        'bite_incident',
        `Bite Incident: ${incidentData.animalTagOrDescription}`,
        `Location: ${incidentData.location.wardName}`
      );
      setOfflineQueue((prev) => [qItem, ...prev]);
    }
  };

  const updateInventoryStock = (itemId: string, deltaQuantity: number) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const updated = Math.max(0, item.remainingQuantity + deltaQuantity);
          return { ...item, remainingQuantity: updated };
        }
        return item;
      })
    );
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        theme,
        toggleTheme,
        lang,
        setLang,
        animals,
        setAnimals,
        reports,
        tasks,
        zones,
        camps,
        bites,
        inventory,
        expenses,
        feeders,
        auditLogs,
        offlineQueueCount,
        offlineQueue,
        isOnline,
        isSyncing,
        lastSyncTime,
        toggleSimulateOffline,
        syncOfflineQueue,
        addEmergencyReport,
        updateReportStatus,
        registerAnimal,
        recordVaccination,
        recordSterilization,
        recordReturnToSite,
        updateTaskStatus,
        addTask,
        logBiteIncident,
        updateInventoryStock,
        selectedAnimalForQR,
        setSelectedAnimalForQR,
        activeView,
        setActiveView,
        getWardReadiness,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
