import { Zone, ReadinessScoreResult } from '../types';

/**
 * Calculates Rabies-Free Readiness Score (0-100) according to WHO & ABC Guidelines.
 * Target herd immunity threshold for rabies control is >= 70% coverage.
 */
export function calculateWardReadinessScore(zone: Zone): ReadinessScoreResult {
  const pop = Math.max(1, zone.estimatedStrayPopulation);

  // 1. Vaccination Coverage (Weight: 40%)
  const vaccinationCoveragePct = Math.min(100, (zone.vaccinatedCount / pop) * 100);
  // Reaching 70% grants full 40 points; scaled linearly up to 70%
  const vaccinationScore = Math.min(40, (vaccinationCoveragePct / 70) * 40);

  // 2. Sterilization Coverage (Weight: 30%)
  const sterilizationCoveragePct = Math.min(100, (zone.sterilizedCount / pop) * 100);
  const targetSteril = zone.targetSterilizationRate || 70;
  const sterilizationScore = Math.min(30, (sterilizationCoveragePct / targetSteril) * 30);

  // 3. Bite Incident Safety (Weight: 15%)
  // 0 bites = 15 pts; each bite in last 90 days drops score by 1.5 pts down to 0
  const bitePenalty = Math.min(15, zone.biteIncidentsLast90Days * 1.5);
  const biteSafetyScore = Math.max(0, 15 - bitePenalty);

  // 4. Report Response Time (Weight: 10%)
  // Under 2 hrs = 10 pts, under 6 hrs = 8 pts, under 12 hrs = 5 pts, > 24 hrs = 1 pt
  let responseTimeScore = 1;
  if (zone.avgResponseTimeHours <= 2) responseTimeScore = 10;
  else if (zone.avgResponseTimeHours <= 6) responseTimeScore = 8;
  else if (zone.avgResponseTimeHours <= 12) responseTimeScore = 5;
  else if (zone.avgResponseTimeHours <= 24) responseTimeScore = 3;

  // 5. Data Freshness (Weight: 5%)
  const now = new Date('2026-10-30T19:29:28Z').getTime();
  const lastCensus = new Date(zone.lastCensusDate).getTime();
  const daysSinceCensus = (now - lastCensus) / (1000 * 60 * 60 * 24);
  const dataFreshnessScore = daysSinceCensus < 90 ? 5 : daysSinceCensus < 180 ? 3 : 1;

  const totalRaw = vaccinationScore + sterilizationScore + biteSafetyScore + responseTimeScore + dataFreshnessScore;
  const overallScore = Math.round(Math.min(100, Math.max(0, totalRaw)));

  // Tier assignment
  let tier: ReadinessScoreResult['tier'] = 'High Risk';
  if (overallScore >= 85) tier = 'Rabies Free Safe Zone';
  else if (overallScore >= 70) tier = 'Rabies Resilient';
  else if (overallScore >= 50) tier = 'Good';
  else if (overallScore >= 35) tier = 'Moderate';

  // Gap analysis
  const gaps: string[] = [];
  const targetVaccinatedCount = Math.ceil(pop * 0.7);
  const vGap = targetVaccinatedCount - zone.vaccinatedCount;
  if (vGap > 0) {
    gaps.push(`Needs ${vGap} more animal vaccinations to achieve 70% herd immunity threshold`);
  }

  const targetSterilizedCount = Math.ceil(pop * (targetSteril / 100));
  const sGap = targetSterilizedCount - zone.sterilizedCount;
  if (sGap > 0) {
    gaps.push(`Needs ${sGap} more sterilizations to stabilize the local population`);
  }

  if (zone.biteIncidentsLast90Days > 4) {
    gaps.push(`Elevated bite incidents (${zone.biteIncidentsLast90Days} reported) require targeted anti-rabies sweeps`);
  }

  if (zone.avgResponseTimeHours > 8) {
    gaps.push(`Emergency rescue response time (${zone.avgResponseTimeHours}h) exceeds municipal 4h target`);
  }

  // Recommendations
  const recommendations: string[] = [];
  if (vGap > 0) recommendations.push(`Schedule an intensive 2-day micro-camp in ${zone.wardName}`);
  if (sGap > 0) recommendations.push(`Deploy ABC catchers along primary feeder and market corridors`);
  if (zone.biteIncidentsLast90Days > 2) recommendations.push(`Verify biting animals quarantine & conduct door-to-door PEP awareness`);
  if (recommendations.length === 0) recommendations.push(`Maintain surveillance, annual booster reminders, and feeder check-ins`);

  return {
    wardName: zone.wardName,
    overallScore,
    tier,
    metrics: {
      vaccinationCoveragePct: Math.round(vaccinationCoveragePct * 10) / 10,
      vaccinationScore: Math.round(vaccinationScore * 10) / 10,
      sterilizationCoveragePct: Math.round(sterilizationCoveragePct * 10) / 10,
      sterilizationScore: Math.round(sterilizationScore * 10) / 10,
      biteIncidentPenalty: Math.round(bitePenalty * 10) / 10,
      responseTimeScore,
      dataFreshnessScore,
    },
    gaps,
    recommendations,
  };
}
