import { LocationCoordinates } from '../types';

/**
 * Calculates distance between two coordinates in meters using the Haversine formula.
 */
export function calculateDistanceMeters(coord1: { lat: number; lng: number }, coord2: { lat: number; lng: number }): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (coord1.lat * Math.PI) / 180;
  const phi2 = (coord2.lat * Math.PI) / 180;
  const deltaPhi = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const deltaLambda = ((coord2.lng - coord1.lng) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Checks compliance with Humane Animal Birth Control (ABC) Return-to-Site rule.
 * An animal MUST be released back to the exact territory where captured (threshold <= 500m).
 */
export function checkReturnToSiteCompliance(
  capture: LocationCoordinates,
  release: LocationCoordinates,
  maxAllowedDistanceMeters: number = 500
): { isCompliant: boolean; distanceMeters: number; violationReason?: string } {
  const distance = calculateDistanceMeters(capture, release);
  const isCompliant = distance <= maxAllowedDistanceMeters;

  return {
    isCompliant,
    distanceMeters: distance,
    violationReason: isCompliant
      ? undefined
      : `Release location is ${distance}m away from original capture territory (Limit is ${maxAllowedDistanceMeters}m). Humane ABC protocol violation flagged for municipal audit.`,
  };
}
