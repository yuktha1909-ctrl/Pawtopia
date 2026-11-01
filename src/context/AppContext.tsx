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
  AuthUser,
} from '../types';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  onAuthStateChanged,
} from '../firebase';
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
import { TRANSLATIONS } from '../data/translations';

export type Language = 'en' | 'kn' | 'hi';

export interface AppContextType {
  role: Role;
  setRole: (role: Role) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  lang: Language;
  setLang: (lang: Language) => void;
  // Auth state and actions
  authUser: AuthUser | null;
  authLoading: boolean;
  authError: string | null;
  authSuccessMsg: string | null;
  clearAuthError: () => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, displayName: string, chosenRole: Role) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  reloadUserVerification: () => Promise<boolean>;
  logout: () => Promise<void>;
  loginAsVerifiedDemo: (role: Role) => void;
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


export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role>('ngo');
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('pawtopia_lang');
      if (saved === 'kn' || saved === 'hi' || saved === 'en') return saved;
    } catch {}
    return 'en';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem('pawtopia_lang', newLang);
      document.documentElement.lang = newLang;
    } catch {}
  };

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

  const [activeView, setActiveView] = useState<string>('login');
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

  // Authentication State: default to null so the Login page is presented first
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('pawtopia_auth_user');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  });
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);

  const clearAuthError = () => {
    setAuthError(null);
    setAuthSuccessMsg(null);
  };

  // Sync role with authUser
  useEffect(() => {
    if (authUser && authUser.role !== role) {
      setAuthUser((prev) => (prev ? { ...prev, role } : null));
    }
  }, [role]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const isGoogle = fbUser.providerData.some((p) => p.providerId === 'google.com');
        const updated: AuthUser = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : 'Pawtopia Member'),
          photoUrl: fbUser.photoURL,
          // Google accounts are inherently verified in Firebase
          emailVerified: isGoogle || fbUser.emailVerified,
          role: role,
          provider: isGoogle ? 'google' : 'password',
        };
        setAuthUser(updated);
        try {
          localStorage.setItem('pawtopia_auth_user', JSON.stringify(updated));
        } catch {
          // ignore
        }
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [role]);

  // Google Login (Auto-verified email)
  const loginWithGoogle = async () => {
    setAuthLoading(true);
    setAuthError(null);
    setAuthSuccessMsg(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const verifiedUser: AuthUser = {
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName || 'Google Verified User',
        photoUrl: fbUser.photoURL,
        emailVerified: true, // Google accounts come pre-verified
        role: role,
        provider: 'google',
      };
      setAuthUser(verifiedUser);
      try {
        localStorage.setItem('pawtopia_auth_user', JSON.stringify(verifiedUser));
      } catch {
        // ignore
      }
      setAuthSuccessMsg(`Signed in with verified Google account: ${verifiedUser.email}`);
      setActiveView('map');
    } catch (err: any) {
      console.error('Google sign in error:', err);
      // Fallback friendly message for popup blockers or domain restrictions
      if (err?.code === 'auth/popup-blocked') {
        setAuthError('Sign-in popup was blocked by browser. Please allow popups for Pawtopia or use email sign-in.');
      } else if (err?.code === 'auth/unauthorized-domain') {
        // Handled gracefully with fallback
        setAuthError('Firebase domain not yet whitelisted in Google Cloud Console. You can use verified demo roles or email sign-in.');
      } else {
        setAuthError(err?.message || 'Google sign-in could not be completed.');
      }
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  // Email / Password Login
  const loginWithEmail = async (email: string, pass: string) => {
    setAuthLoading(true);
    setAuthError(null);
    setAuthSuccessMsg(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const fbUser = cred.user;
      const loggedUser: AuthUser = {
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName || email.split('@')[0],
        photoUrl: fbUser.photoURL,
        emailVerified: fbUser.emailVerified,
        role: role,
        provider: 'password',
      };
      setAuthUser(loggedUser);
      try {
        localStorage.setItem('pawtopia_auth_user', JSON.stringify(loggedUser));
      } catch {
        // ignore
      }
      setAuthSuccessMsg(`Logged in successfully as ${loggedUser.email}`);
      setActiveView('map');
    } catch (err: any) {
      console.error('Email login error:', err);
      if (err?.code === 'auth/user-not-found' || err?.code === 'auth/invalid-credential') {
        setAuthError('No account found with these credentials. Please check your email or click "Create Account".');
      } else if (err?.code === 'auth/wrong-password') {
        setAuthError('Incorrect password. Please try again.');
      } else {
        setAuthError(err?.message || 'Failed to sign in.');
      }
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  // Register with Email and send verification email
  const registerWithEmail = async (email: string, pass: string, displayName: string, chosenRole: Role) => {
    setAuthLoading(true);
    setAuthError(null);
    setAuthSuccessMsg(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      const fbUser = cred.user;
      // Send real Firebase verification email
      try {
        await sendEmailVerification(fbUser);
      } catch (verifyErr) {
        console.warn('Could not dispatch sendEmailVerification immediately', verifyErr);
      }
      const newUser: AuthUser = {
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: displayName.trim() || email.split('@')[0],
        photoUrl: null,
        emailVerified: fbUser.emailVerified,
        role: chosenRole,
        provider: 'password',
      };
      setRole(chosenRole);
      setAuthUser(newUser);
      try {
        localStorage.setItem('pawtopia_auth_user', JSON.stringify(newUser));
      } catch {
        // ignore
      }
      setAuthSuccessMsg(`Account created for ${newUser.email}! A verification link has been sent to your inbox.`);
      setActiveView('map');
    } catch (err: any) {
      console.error('Registration error:', err);
      if (err?.code === 'auth/email-already-in-use') {
        setAuthError('An account with this email already exists. Please switch to "Sign In".');
      } else if (err?.code === 'auth/weak-password') {
        setAuthError('Password should be at least 6 characters.');
      } else {
        setAuthError(err?.message || 'Could not create account.');
      }
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  // Send or resend verification email
  const sendVerificationEmail = async () => {
    setAuthError(null);
    setAuthSuccessMsg(null);
    if (auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
        setAuthSuccessMsg(`Verification email successfully sent to ${auth.currentUser.email}. Please check your inbox.`);
      } catch (err: any) {
        console.error('Send verification error', err);
        setAuthError(err?.message || 'Could not send verification email.');
      }
    } else {
      setAuthError('No active user logged in to verify.');
    }
  };

  // Reload user status from Firebase to check if user verified email
  const reloadUserVerification = async (): Promise<boolean> => {
    setAuthError(null);
    setAuthSuccessMsg(null);
    if (auth.currentUser) {
      try {
        await auth.currentUser.reload();
        const isVerified = auth.currentUser.emailVerified;
        setAuthUser((prev) => {
          if (!prev) return null;
          const updated = { ...prev, emailVerified: isVerified };
          try {
            localStorage.setItem('pawtopia_auth_user', JSON.stringify(updated));
          } catch {
            // ignore
          }
          return updated;
        });
        if (isVerified) {
          setAuthSuccessMsg('Email verified successfully! You have full verified credentials.');
        } else {
          setAuthError('Your email address has not been verified yet. Please click the link sent to your inbox.');
        }
        return isVerified;
      } catch (err: any) {
        console.error('Reload verification error', err);
        setAuthError(err?.message || 'Could not refresh verification status.');
      }
    }
    return false;
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Signout warning', e);
    }
    setAuthUser(null);
    try {
      localStorage.removeItem('pawtopia_auth_user');
    } catch {
      // ignore
    }
    setAuthSuccessMsg('You have been logged out.');
    setActiveView('login');
  };

  // Instant switch to verified role (for municipal officers, vets, rescuers, citizens)
  const loginAsVerifiedDemo = (targetRole: Role) => {
    clearAuthError();
    const roleProfiles: Record<Role, { name: string; email: string }> = {
      admin: { name: 'Dr. Ramesh Rao (BBMP Joint Commissioner)', email: 'ramesh.rao@bbmp.gov.in' },
      ngo: { name: 'Dr. Ananya Sharma (Lead Field Rescuer)', email: 'ananya.sharma@bbmp-animalcare.gov.in' },
      vet: { name: 'Dr. Vivek Menon, MVSc (Chief Veterinary Surgeon)', email: 'dr.menon@pawtopia-health.org' },
      citizen: { name: 'Yuktha Sundaram (Active Community Feeder)', email: 'yuktha907@gmail.com' },
    };
    const profile = roleProfiles[targetRole];
    const verifiedUser: AuthUser = {
      uid: `verified-staff-${targetRole}`,
      displayName: profile.name,
      email: profile.email,
      photoUrl: null,
      emailVerified: true,
      role: targetRole,
      provider: 'demo',
    };
    setRole(targetRole);
    setAuthUser(verifiedUser);
    try {
      localStorage.setItem('pawtopia_auth_user', JSON.stringify(verifiedUser));
    } catch {
      // ignore
    }
    setAuthSuccessMsg(`Switched to verified ${targetRole.toUpperCase()} account: ${profile.email}`);
    setActiveView('map');
  };

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
        authUser,
        authLoading,
        authError,
        authSuccessMsg,
        clearAuthError,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        sendVerificationEmail,
        reloadUserVerification,
        logout,
        loginAsVerifiedDemo,
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
