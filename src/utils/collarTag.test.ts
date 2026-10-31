import { test } from 'node:test';
import assert from 'node:assert';
import {
  COLLAR_TAG_PRESETS,
  formatCollarTagData,
  validateCollarTagAnimal,
  chunkAnimalsForSheet,
} from './collarTag';
import { Animal } from '../types';

const mockDog: Animal = {
  id: 'dog-1',
  tagNumber: 'PAW-IND-001',
  name: 'Bruno',
  species: 'dog',
  breed: 'Indian Pariah Dog',
  gender: 'male',
  estimatedAgeYears: 3,
  photoUrl: 'https://example.com/dog.jpg',
  colorPattern: 'Tan with white paws',
  distinctiveMarks: 'Left ear notch',
  earNotch: 'left_v_notch',
  primaryLocation: {
    lat: 12.9716,
    lng: 77.5946,
    wardName: 'Ward 101 - Indiranagar',
    address: 'Near 100ft road',
  },
  vaccinationStatus: 'valid',
  lastVaccinationDate: '2025-01-10',
  nextVaccinationDueDate: '2026-01-10',
  sterilizationStatus: 'sterilized',
  sterilizationDate: '2024-05-15',
  registeredByRole: 'ngo',
  registeredByName: 'Care Rescue',
  adoptionStatus: 'stray_community',
  createdAt: '2024-05-15',
  updatedAt: '2025-01-10',
};

const mockCat: Animal = {
  id: 'cat-1',
  tagNumber: 'PAW-KOR-042',
  name: '',
  species: 'cat',
  breed: 'Indie Feline',
  gender: 'female',
  estimatedAgeYears: 1.5,
  photoUrl: 'https://example.com/cat.jpg',
  colorPattern: 'Calico tricolor',
  distinctiveMarks: 'Green eyes',
  earNotch: 'none',
  primaryLocation: {
    lat: 12.9352,
    lng: 77.6245,
    wardName: 'Ward 150 - Koramangala',
  },
  vaccinationStatus: 'due_soon',
  lastVaccinationDate: '2024-03-01',
  nextVaccinationDueDate: '2025-03-01',
  sterilizationStatus: 'intact',
  registeredByRole: 'citizen',
  registeredByName: 'Feeder Priya',
  adoptionStatus: 'stray_community',
  createdAt: '2024-03-01',
  updatedAt: '2024-03-01',
};

test('COLLAR_TAG_PRESETS provides dimensions and hole punch specifications', () => {
  assert.ok(COLLAR_TAG_PRESETS.standard_hanging);
  assert.strictEqual(COLLAR_TAG_PRESETS.standard_hanging.holePunch, 'single_top');
  assert.strictEqual(COLLAR_TAG_PRESETS.collar_slide.holePunch, 'dual_slots');
  assert.strictEqual(COLLAR_TAG_PRESETS.feline_compact.holePunch, 'keyring_loop');
  assert.strictEqual(COLLAR_TAG_PRESETS.sheet_grid.widthMm, 210);
});

test('formatCollarTagData extracts correctly formatted tag metadata for valid vaccinated dog', () => {
  const data = formatCollarTagData(mockDog);
  assert.strictEqual(data.tagId, 'PAW-IND-001');
  assert.strictEqual(data.displayName, 'Bruno');
  assert.strictEqual(data.speciesBadge, '🐕 Dog');
  assert.strictEqual(data.vaccineStatusColor, 'green');
  assert.ok(data.vaccineStatusLabel.includes('Active'));
  assert.strictEqual(data.vaccineExpiryFormatted, 'Exp: 2026-01-10');
  assert.strictEqual(data.sterilizationText, 'ABC Sterilized');
  assert.ok(data.earNotchIndicator?.includes('LEFT'));
  assert.ok(data.helpline.includes('1800-PAW-HELP'));
});

test('formatCollarTagData handles nameless cat with due soon status and no ear notch', () => {
  const data = formatCollarTagData(mockCat);
  assert.strictEqual(data.displayName, 'Community Cat');
  assert.strictEqual(data.speciesBadge, '🐈 Cat');
  assert.strictEqual(data.vaccineStatusColor, 'amber');
  assert.strictEqual(data.earNotchIndicator, null);
  assert.strictEqual(data.sterilizationText, 'ABC Intact / Pending');
});

test('validateCollarTagAnimal validates presence of critical tag identity information', () => {
  assert.strictEqual(validateCollarTagAnimal(mockDog).isValid, true);
  assert.strictEqual(validateCollarTagAnimal(null).isValid, false);
  
  const invalidAnimal = { name: 'Ghost' } as Partial<Animal>;
  const result = validateCollarTagAnimal(invalidAnimal);
  assert.strictEqual(result.isValid, false);
  assert.ok(result.errors.length >= 2);
});

test('chunkAnimalsForSheet chunks animals into batches of 8 for standard A4 printing', () => {
  const list = Array.from({ length: 19 }, (_, i) => ({ ...mockDog, id: `dog-${i}` }));
  const chunks = chunkAnimalsForSheet(list, 8);
  assert.strictEqual(chunks.length, 3);
  assert.strictEqual(chunks[0].length, 8);
  assert.strictEqual(chunks[1].length, 8);
  assert.strictEqual(chunks[2].length, 3);
});
