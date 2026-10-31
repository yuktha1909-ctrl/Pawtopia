import { VaccinationStatus } from '../types';

/**
 * Calculates rabies immunity status based on the expiration/due date.
 */
export function getVaccinationStatus(nextDueDateStr?: string, referenceDateStr: string = '2026-10-30'): VaccinationStatus {
  if (!nextDueDateStr) return 'unvaccinated';

  const nextDue = new Date(nextDueDateStr).getTime();
  const refDate = new Date(referenceDateStr).getTime();
  const diffDays = Math.ceil((nextDue - refDate) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 'overdue';
  } else if (diffDays <= 30) {
    return 'due_soon';
  } else {
    return 'valid';
  }
}

/**
 * Returns human-readable status badge configuration
 */
export function getVaccinationBadgeMeta(status: VaccinationStatus) {
  switch (status) {
    case 'valid':
      return {
        label: 'Protected (Valid)',
        colorClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800',
        dotClass: 'bg-emerald-500',
      };
    case 'due_soon':
      return {
        label: 'Booster Due Soon',
        colorClass: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800',
        dotClass: 'bg-amber-500',
      };
    case 'overdue':
      return {
        label: 'Booster Overdue',
        colorClass: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-800',
        dotClass: 'bg-rose-500',
      };
    case 'unvaccinated':
    default:
      return {
        label: 'Unvaccinated',
        colorClass: 'bg-stone-100 text-stone-800 border-stone-300 dark:bg-stone-900 dark:text-stone-300 dark:border-stone-700',
        dotClass: 'bg-stone-400',
      };
  }
}
