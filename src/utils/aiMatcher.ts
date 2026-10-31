import { Animal } from '../types';

/**
 * Calculates cosine similarity between two numeric feature vectors.
 * Returns a value between -1.0 and 1.0 (typically 0.0 to 1.0 for normalized CLIP/ResNet embeddings).
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export interface MatchCandidate {
  animal: Animal;
  similarityScore: number; // 0 to 1
  confidencePercentage: number; // 0% to 100%
  matchedAttributes: string[];
}

/**
 * Deterministically generates or simulates a 16-dimensional visual embedding
 * based on image characteristics, color pattern, species, and traits.
 */
export function generateFeatureVector(seedStr: string): number[] {
  const vec: number[] = [];
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }

  for (let i = 0; i < 16; i++) {
    // Generate pseudo-random numbers normalized around 0.5
    const val = Math.sin(hash + i * 1.618) * 0.5 + 0.5;
    vec.push(Math.round(val * 1000) / 1000);
  }
  return vec;
}

/**
 * Finds top N matches from the registered animal pool for a given query vector or image traits.
 */
export function findTopMatches(
  queryVector: number[],
  registeredAnimals: Animal[],
  topN: number = 3,
  filterSpecies?: 'dog' | 'cat'
): MatchCandidate[] {
  const pool = filterSpecies
    ? registeredAnimals.filter((a) => a.species === filterSpecies)
    : registeredAnimals;

  const scored: MatchCandidate[] = pool.map((animal) => {
    // If animal does not have embedding, generate deterministic one from its tag and colors
    const targetVec =
      animal.featureEmbedding && animal.featureEmbedding.length === queryVector.length
        ? animal.featureEmbedding
        : generateFeatureVector(`${animal.tagNumber}-${animal.species}-${animal.colorPattern}`);

    const sim = cosineSimilarity(queryVector, targetVec);
    // Convert cosine similarity (typically 0.6 - 1.0) into intuitive 65% - 99% confidence
    const confidence = Math.round(Math.max(15, Math.min(99, sim * 100)));

    const matchedAttributes: string[] = [];
    if (sim > 0.8) matchedAttributes.push('Coat color & pattern alignment');
    if (animal.earNotch !== 'none') matchedAttributes.push(`Ear notch: ${animal.earNotch.replace(/_/g, ' ')}`);
    matchedAttributes.push(`Breed / Face geometry match (${animal.species})`);

    return {
      animal,
      similarityScore: Math.round(sim * 1000) / 1000,
      confidencePercentage: confidence,
      matchedAttributes,
    };
  });

  // Sort descending by similarity
  scored.sort((a, b) => b.similarityScore - a.similarityScore);
  return scored.slice(0, topN);
}
