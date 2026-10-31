import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateWardReadinessScore } from './readiness';
import { getVaccinationStatus } from './vaccination';
import { calculateDistanceMeters, checkReturnToSiteCompliance } from './geo';
import { cosineSimilarity, generateFeatureVector } from './aiMatcher';
import { Zone } from '../types';

test('Readiness Score: high coverage ward achieves resilient tier', () => {
  const sampleZone: Zone = {
    id: 'z-01',
    wardName: 'Ward 101 - Indiranagar',
    zoneNumber: 101,
    zoneOfficer: 'Dr. Ramesh Kumar',
    estimatedStrayPopulation: 500,
    vaccinatedCount: 420, // 84% > 70% threshold
    sterilizedCount: 380, // 76% > 70% threshold
    biteIncidentsLast90Days: 1, // very low
    avgResponseTimeHours: 2.1,
    lastCensusDate: '2026-09-01',
    targetSterilizationRate: 70,
    center: [12.9784, 77.6408],
  };

  const scoreResult = calculateWardReadinessScore(sampleZone);
  assert.ok(scoreResult.overallScore >= 80, `Expected score >= 80, got ${scoreResult.overallScore}`);
  assert.equal(scoreResult.metrics.vaccinationScore, 40); // Capped at max 40 pts
  assert.equal(scoreResult.metrics.sterilizationScore, 30); // Capped at max 30 pts
  assert.ok(scoreResult.overallScore <= 100);
});

test('Readiness Score: low coverage ward identifies exact gaps', () => {
  const lowCoverageZone: Zone = {
    id: 'z-02',
    wardName: 'Ward 102 - Koramangala Outer',
    zoneNumber: 102,
    zoneOfficer: 'Ananya Sharma',
    estimatedStrayPopulation: 400,
    vaccinatedCount: 150, // 37.5% << 70% (target is 280)
    sterilizedCount: 120, // 30% << 70% (target is 280)
    biteIncidentsLast90Days: 7, // high bite count
    avgResponseTimeHours: 14.5,
    lastCensusDate: '2026-01-10',
    targetSterilizationRate: 70,
    center: [12.9352, 77.6245],
  };

  const result = calculateWardReadinessScore(lowCoverageZone);
  assert.ok(result.overallScore < 50, `Expected low score, got ${result.overallScore}`);
  // Gap analysis should state that 130 more vaccinations are needed (280 - 150)
  assert.ok(
    result.gaps.some((g) => g.includes('130 more animal vaccinations')),
    'Expected gap to quantify needed vaccinations'
  );
});

test('Vaccination Status evaluator correctly categorizes dates', () => {
  const refDate = '2026-10-30';
  // Valid: due in 60 days
  assert.equal(getVaccinationStatus('2026-12-30', refDate), 'valid');
  // Due soon: due in 15 days
  assert.equal(getVaccinationStatus('2026-11-14', refDate), 'due_soon');
  // Overdue: expired 5 days ago
  assert.equal(getVaccinationStatus('2026-10-25', refDate), 'overdue');
  // Unvaccinated: undefined date
  assert.equal(getVaccinationStatus(undefined, refDate), 'unvaccinated');
});

test('Geospatial Return-to-Site checks 500m humane ABC protocol', () => {
  const capturePoint = { lat: 12.9716, lng: 77.5946, wardName: 'Central' };
  // 150m away (compliant)
  const nearbyRelease = { lat: 12.9725, lng: 77.5952, wardName: 'Central' };
  const okCheck = checkReturnToSiteCompliance(capturePoint, nearbyRelease);
  assert.equal(okCheck.isCompliant, true);
  assert.ok(okCheck.distanceMeters < 500);

  // 1200m away (violation)
  const farRelease = { lat: 12.9820, lng: 77.5999, wardName: 'North' };
  const badCheck = checkReturnToSiteCompliance(capturePoint, farRelease);
  assert.equal(badCheck.isCompliant, false);
  assert.ok(badCheck.distanceMeters > 500);
  assert.ok(badCheck.violationReason?.includes('Humane ABC protocol violation'));
});

test('AI Matcher: Cosine similarity identifies identical and orthogonal vectors', () => {
  const v1 = [1, 0, 0, 0];
  const v2 = [1, 0, 0, 0];
  const v3 = [0, 1, 0, 0];

  assert.equal(cosineSimilarity(v1, v2), 1.0);
  assert.equal(cosineSimilarity(v1, v3), 0.0);

  const feature = generateFeatureVector('PAW-DOG-001');
  assert.equal(feature.length, 16);
});

test('PWA Offline Queue: correctly appends, counts, and clears pending items', async () => {
  const { createQueueItem, addToQueue, removeFromQueue, clearQueue } = await import('./syncQueue');
  
  let queue: any[] = [];
  assert.equal(queue.length, 0);

  const item1 = createQueueItem('emergency_report', 'Hit and Run near Indiranagar', 'Severity: Critical');
  queue = addToQueue(queue, item1);
  assert.equal(queue.length, 1);
  assert.equal(queue[0].title, 'Hit and Run near Indiranagar');

  const item2 = createQueueItem('vaccination', 'Administered Nobivac to PAW-IND-001', 'Batch NB-RB-2026A');
  queue = addToQueue(queue, item2);
  assert.equal(queue.length, 2);
  assert.equal(queue[0].id, item2.id); // Newest first

  queue = removeFromQueue(queue, item1.id);
  assert.equal(queue.length, 1);
  assert.equal(queue[0].id, item2.id);

  queue = clearQueue();
  assert.equal(queue.length, 0);
});

