export type Role = 'citizen' | 'ngo' | 'vet' | 'admin';

export type Species = 'dog' | 'cat';
export type Gender = 'male' | 'female' | 'unknown';
export type VaccinationStatus = 'valid' | 'due_soon' | 'overdue' | 'unvaccinated';
export type SterilizationStatus = 'sterilized' | 'intact' | 'scheduled';
export type ReportStatus = 'reported' | 'assigned' | 'in_progress' | 'resolved';
export type ReportSeverity = 'low' | 'medium' | 'high' | 'critical';
export type EarNotchStatus = 'left_v_notch' | 'right_v_notch' | 'tipped' | 'none';

export interface LocationCoordinates {
  lat: number;
  lng: number;
  address?: string;
  wardName: string;
}

export interface Animal {
  id: string;
  tagNumber: string; // e.g. PAW-BLR-0482
  name?: string;
  species: Species;
  breed?: string;
  gender: Gender;
  estimatedAgeYears: number;
  photoUrl: string;
  colorPattern: string;
  distinctiveMarks: string;
  earNotch: EarNotchStatus;
  primaryLocation: LocationCoordinates;
  vaccinationStatus: VaccinationStatus;
  lastVaccinationDate?: string;
  nextVaccinationDueDate?: string;
  sterilizationStatus: SterilizationStatus;
  sterilizationDate?: string;
  registeredByRole: Role;
  registeredByName: string;
  ngoAffiliation?: string;
  qrCodeUrl?: string;
  microchipId?: string;
  featureEmbedding?: number[]; // simulated 16-dim visual feature vector for AI matching
  adoptionStatus?: 'available' | 'fostered' | 'adopted' | 'stray_community';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VaccinationRecord {
  id: string;
  animalId: string;
  vaccineName: string; // e.g. Rabigen Mono / Nobivac Rabies
  batchNumber: string;
  administeredDate: string;
  nextDueDate: string;
  veterinarianName: string;
  vetLicenseNumber: string;
  clinicOrNgo: string;
  adverseReactions?: string;
  certificateNumber: string;
}

export interface SterilizationRecord {
  id: string;
  animalId: string;
  procedureType: 'ABC_Ovariohysterectomy' | 'ABC_Castration';
  surgeryDate: string;
  surgeonName: string;
  clinicOrCenter: string;
  earNotchApplied: EarNotchStatus;
  postOpRecoveryDays: number;
  complications?: string;
  fitnessForRelease: boolean;
}

export interface ReleaseLog {
  id: string;
  animalId: string;
  captureLocation: LocationCoordinates;
  captureDate: string;
  releaseLocation: LocationCoordinates;
  releaseDate: string;
  handledByNGO: string;
  driverOrOfficer: string;
  distanceFromCaptureMeters: number;
  protocolCompliant: boolean; // Flagged if released outside original territory (>500m)
  releasePhotoUrl?: string;
  notes?: string;
}

export interface EmergencyReport {
  id: string;
  reportNumber: string; // e.g. REP-2026-089
  reporterName: string;
  reporterPhone?: string;
  isAnonymous: boolean;
  species: Species;
  severity: ReportSeverity;
  issueType: 'injured' | 'suspected_rabies' | 'aggressive_pack' | 'sick_puppies' | 'hit_and_run' | 'cruelty';
  description: string;
  location: LocationCoordinates;
  photoUrl?: string;
  status: ReportStatus;
  assignedNGO?: string;
  assignedTeamMember?: string;
  reportedAt: string;
  resolvedAt?: string;
  priorityScore: number;
  notes?: string[];
}

export interface Task {
  id: string;
  title: string;
  type: 'rescue' | 'vaccination' | 'sterilization' | 'followup' | 'release';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'review' | 'done';
  assignedTo: string;
  ngoName: string;
  animalId?: string;
  reportId?: string;
  wardName: string;
  dueDate: string;
}

export interface Zone {
  id: string;
  wardName: string;
  zoneNumber: number;
  zoneOfficer: string;
  estimatedStrayPopulation: number;
  vaccinatedCount: number;
  sterilizedCount: number;
  biteIncidentsLast90Days: number;
  avgResponseTimeHours: number;
  lastCensusDate: string;
  targetSterilizationRate: number; // e.g. 70%
  center: [number, number];
  bounds?: [number, number][];
}

export interface Camp {
  id: string;
  title: string;
  zoneName: string;
  startDate: string;
  endDate: string;
  targetAnimals: number;
  vaccinatedAchieved: number;
  sterilizedAchieved: number;
  leadNGO: string;
  leadVet: string;
  status: 'planned' | 'active' | 'completed';
  catchingRouteNotes: string;
}

export interface BiteIncident {
  id: string;
  incidentDate: string;
  victimAgeCategory: 'child' | 'adult' | 'senior';
  biteCategory: 'category_1_touch' | 'category_2_minor_scratch' | 'category_3_deep_puncture';
  location: LocationCoordinates;
  animalSpecies: Species;
  animalTagOrDescription: string;
  knownAnimalId?: string;
  animalVaccinationStatusKnown: boolean;
  animalQuarantineStatus: 'quarantined_10_days' | 'monitoring_in_field' | 'untraceable' | 'deceased';
  suspectedRabid: boolean;
  pepAdministered: boolean; // Post-Exposure Prophylaxis
  hospitalReferred: string;
  reportedBy: string;
  actionsTaken: string;
}

export interface InventoryItem {
  id: string;
  name: string; // e.g. Anti-Rabies Vaccine (Nobivac 10-dose)
  category: 'vaccine' | 'microchip' | 'surgical' | 'first_aid' | 'sedative';
  batchNumber: string;
  totalQuantity: number;
  remainingQuantity: number;
  unit: string; // vials, units, kits
  unitCost: number;
  supplier: string;
  expiryDate: string;
  storageRequirement: string; // e.g. 2°C to 8°C Cold Chain
  lowStockThreshold: number;
}

export interface Expense {
  id: string;
  date: string;
  category: 'vaccines' | 'surgeries' | 'ambulance_fuel' | 'post_op_care' | 'staff_honorarium';
  description: string;
  amount: number;
  grantOrDonorFund: string;
  animalsCoveredCount: number;
  costPerAnimal: number;
}

export interface FeederSpot {
  id: string;
  spotName: string;
  feederName: string;
  wardName: string;
  coordinates: LocationCoordinates;
  scheduleTime: string;
  regularAnimalCount: number;
  badgeLevel: 'Bronze Feeder' | 'Silver Guardian' | 'Gold Pack Protector';
  lastFedDate: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  userId: string;
  userName: string;
  userRole: Role;
  details: string;
}

export interface OfflineQueueItem {
  id: string;
  type: 'emergency_report' | 'animal_registration' | 'vaccination' | 'sterilization' | 'bite_incident';
  title: string;
  timestamp: string;
  payloadSummary: string;
}

export interface ReadinessScoreResult {
  wardName: string;
  overallScore: number; // 0 - 100
  tier: 'High Risk' | 'Moderate' | 'Good' | 'Rabies Resilient' | 'Rabies Free Safe Zone';
  metrics: {
    vaccinationCoveragePct: number;
    vaccinationScore: number;
    sterilizationCoveragePct: number;
    sterilizationScore: number;
    biteIncidentPenalty: number;
    responseTimeScore: number;
    dataFreshnessScore: number;
  };
  gaps: string[];
  recommendations: string[];
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoUrl: string | null;
  emailVerified: boolean;
  role: Role;
  provider: 'google' | 'password' | 'demo';
}

