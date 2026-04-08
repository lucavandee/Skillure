import { Candidate } from '../types';

const STORAGE_KEY = 'skillure:candidates';

/**
 * Simple localStorage-backed store for user-added candidates.
 * Candidates added via the manual entry form live here alongside
 * the CV file (as a base64 data URL) so they persist across reloads
 * and can be viewed from the dashboard.
 */

export function getStoredCandidates(): Candidate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Candidate[]) : [];
  } catch {
    return [];
  }
}

export function saveStoredCandidates(candidates: Candidate[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(candidates));
    window.dispatchEvent(new Event('skillure:candidates-updated'));
  } catch (err) {
    console.warn('Could not save candidates to localStorage', err);
    throw err;
  }
}

export function addStoredCandidate(candidate: Candidate): void {
  const existing = getStoredCandidates();
  saveStoredCandidates([candidate, ...existing]);
}

export function removeStoredCandidate(id: string): void {
  const existing = getStoredCandidates();
  saveStoredCandidates(existing.filter((c) => c.id !== id));
}

export function generateCandidateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `cand-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Onverwachte bestandsinhoud'));
      }
    };
    reader.onerror = () => reject(reader.error ?? new Error('Kon bestand niet lezen'));
    reader.readAsDataURL(file);
  });
}

export const MAX_CV_SIZE_BYTES = 2 * 1024 * 1024; // 2MB per CV (localStorage limit is ~5MB)

export const ALLOWED_CV_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
];

export const ALLOWED_CV_EXTENSIONS = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
