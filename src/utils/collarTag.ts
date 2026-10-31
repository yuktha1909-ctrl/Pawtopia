import { Animal } from '../types';

export type CollarTagPreset = 'standard_hanging' | 'collar_slide' | 'feline_compact' | 'sheet_grid';

export interface CollarTagDimensions {
  preset: CollarTagPreset;
  name: string;
  widthMm: number;
  heightMm: number;
  widthInches: number;
  heightInches: number;
  holePunch: 'single_top' | 'dual_slots' | 'keyring_loop' | 'none';
  recommendedFor: string;
  description: string;
}

export interface CollarTagOptions {
  includePhoto: boolean;
  includeHelpline: boolean;
  includeLegalNotice: boolean;
  highContrastMonochrome: boolean;
  twoSidedFold: boolean;
  emergencyPhone?: string;
  authorityName?: string;
}

export const COLLAR_TAG_PRESETS: Record<CollarTagPreset, CollarTagDimensions> = {
  standard_hanging: {
    preset: 'standard_hanging',
    name: 'Standard Hanging Collar Tag',
    widthMm: 65,
    heightMm: 42,
    widthInches: 2.56,
    heightInches: 1.65,
    holePunch: 'single_top',
    recommendedFor: 'Standard Dog Collars (Canvas / Nylon strap with split ring)',
    description: 'Universal municipal hanging tag with eyelet punch guide and high-contrast ARV status.',
  },
  collar_slide: {
    preset: 'collar_slide',
    name: 'Strap Slide-On Wrap Tag',
    widthMm: 80,
    heightMm: 30,
    widthInches: 3.15,
    heightInches: 1.18,
    holePunch: 'dual_slots',
    recommendedFor: '1" or 3/4" Reflective Webbing Collars (Snag-free for street dogs)',
    description: 'Flush-mount slide-on collar label with dual vertical slot cut lines to avoid snagging in shrubs.',
  },
  feline_compact: {
    preset: 'feline_compact',
    name: 'Feline Breakaway Mini-Tag',
    widthMm: 40,
    heightMm: 36,
    widthInches: 1.57,
    heightInches: 1.42,
    holePunch: 'keyring_loop',
    recommendedFor: 'Cats & Small Puppies (Lightweight breakaway safety collars)',
    description: 'Ultra-lightweight compact tag optimized for quick micro-QR scanning.',
  },
  sheet_grid: {
    preset: 'sheet_grid',
    name: 'Multi-Tag A4 Field Sheet (8 Tags)',
    widthMm: 210,
    heightMm: 297,
    widthInches: 8.27,
    heightInches: 11.69,
    holePunch: 'single_top',
    recommendedFor: 'Field ABC & Mass Vaccination Drives (Print 8 tags per page)',
    description: 'Grid of 8 standard tags with alignment crop marks for batch cutting and laminating.',
  },
};

export interface FormattedCollarTagData {
  tagId: string;
  displayName: string;
  speciesBadge: string;
  genderText: string;
  ageText: string;
  colorPattern: string;
  wardName: string;
  vaccineStatusLabel: string;
  vaccineStatusColor: 'green' | 'amber' | 'rose' | 'gray';
  vaccineExpiryFormatted: string;
  sterilizationText: string;
  earNotchIndicator: string | null;
  helpline: string;
  authority: string;
  legalNotice: string;
  publicScanUrl: string;
}

export function formatCollarTagData(
  animal: Animal,
  options?: Partial<CollarTagOptions>
): FormattedCollarTagData {
  const helpline = options?.emergencyPhone || '1800-PAW-HELP (24/7)';
  const authority = options?.authorityName || 'Bangalore Municipal Corp & Pawtopia';

  // Determine vaccination status color and label
  let vaccineStatusColor: 'green' | 'amber' | 'rose' | 'gray' = 'gray';
  let vaccineStatusLabel = 'Rabies Unknown';
  if (animal.vaccinationStatus === 'valid') {
    vaccineStatusColor = 'green';
    vaccineStatusLabel = 'ARV Vaccinated (Active)';
  } else if (animal.vaccinationStatus === 'due_soon') {
    vaccineStatusColor = 'amber';
    vaccineStatusLabel = 'ARV Due Soon';
  } else if (animal.vaccinationStatus === 'overdue') {
    vaccineStatusColor = 'rose';
    vaccineStatusLabel = 'ARV Overdue';
  } else {
    vaccineStatusColor = 'rose';
    vaccineStatusLabel = 'Unvaccinated';
  }

  const vaccineExpiryFormatted = animal.nextVaccinationDueDate
    ? `Exp: ${animal.nextVaccinationDueDate}`
    : animal.lastVaccinationDate
    ? `Vacc: ${animal.lastVaccinationDate}`
    : 'ARV Due Immediately';

  const isSterilized = animal.sterilizationStatus === 'sterilized';
  const sterilizationText = isSterilized ? 'ABC Sterilized' : 'ABC Intact / Pending';

  let earNotchIndicator: string | null = null;
  if (animal.earNotch && animal.earNotch !== 'none') {
    earNotchIndicator = `✂ ${animal.earNotch.toUpperCase().replace(/_/g, ' ')}`;
  }

  const publicScanUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?animal=${encodeURIComponent(animal.tagNumber)}`
    : `https://pawtopia.app/?animal=${encodeURIComponent(animal.tagNumber)}`;

  return {
    tagId: animal.tagNumber || 'PAW-UNTAGGED',
    displayName: animal.name?.trim() ? animal.name : `Community ${animal.species === 'cat' ? 'Cat' : 'Dog'}`,
    speciesBadge: animal.species === 'cat' ? '🐈 Cat' : '🐕 Dog',
    genderText: animal.gender ? animal.gender.toUpperCase() : 'UNKNOWN',
    ageText: animal.estimatedAgeYears ? `~${animal.estimatedAgeYears}y` : 'Age Unk',
    colorPattern: animal.colorPattern || 'Mixed Indie',
    wardName: animal.primaryLocation?.wardName || 'Municipal Zone',
    vaccineStatusLabel,
    vaccineStatusColor,
    vaccineExpiryFormatted,
    sterilizationText,
    earNotchIndicator,
    helpline,
    authority,
    legalNotice: 'Protected Community Stray under ABC Rules 2023. Do Not Relocate.',
    publicScanUrl,
  };
}

export function validateCollarTagAnimal(animal: Partial<Animal> | null | undefined): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (!animal) {
    return { isValid: false, errors: ['No animal record provided.'] };
  }
  if (!animal.tagNumber || animal.tagNumber.trim() === '') {
    errors.push('Animal is missing unique tag number.');
  }
  if (!animal.species) {
    errors.push('Species is not defined.');
  }
  if (!animal.primaryLocation?.wardName) {
    errors.push('Ward / Location is missing.');
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function chunkAnimalsForSheet(animals: Animal[], pageSize = 8): Animal[][] {
  if (!animals || animals.length === 0) return [];
  const pages: Animal[][] = [];
  for (let i = 0; i < animals.length; i += pageSize) {
    pages.push(animals.slice(i, i + pageSize));
  }
  return pages;
}
