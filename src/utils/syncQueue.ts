import { OfflineQueueItem } from '../types';

/**
 * Pure functions for managing PWA offline action queue
 */

export function createQueueItem(
  type: OfflineQueueItem['type'],
  title: string,
  payloadSummary: string
): OfflineQueueItem {
  return {
    id: `queue-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type,
    title,
    timestamp: new Date().toISOString(),
    payloadSummary,
  };
}

export function addToQueue(
  queue: OfflineQueueItem[],
  item: OfflineQueueItem
): OfflineQueueItem[] {
  return [item, ...queue];
}

export function removeFromQueue(
  queue: OfflineQueueItem[],
  itemId: string
): OfflineQueueItem[] {
  return queue.filter((i) => i.id !== itemId);
}

export function clearQueue(): OfflineQueueItem[] {
  return [];
}
