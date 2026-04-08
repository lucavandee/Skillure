import { Candidate } from '../types';
import { migrateLegacyDataUrl } from './cv-storage';

const STORAGE_KEY = 'skillure:candidates';

/**
 * Simple localStorage-backed store for user-added candidate records.
 *
 * The candidate JSON stays small: the actual CV file lives in the
 * CvStorage backend (see src/lib/cv-storage), and only a storage path
 * is kept on the candidate.
 */

// Older versions of this store inlined the CV as `cvDataUrl` on the
// candidate itself. We carry the type here only to migrate old records.
interface LegacyCandidate extends Candidate {
  cvDataUrl?: string;
}

let migrationHasRun = false;

function runLegacyMigration(raw: LegacyCandidate[]): Candidate[] {
  let changed = false;
  const migrated = raw.map((candidate) => {
    if (candidate.cvDataUrl && !candidate.cvStoragePath) {
      const newPath = migrateLegacyDataUrl(candidate.cvDataUrl);
      changed = true;
      const { cvDataUrl: _unused, ...rest } = candidate;
      void _unused;
      return newPath ? { ...rest, cvStoragePath: newPath } : rest;
    }
    if (candidate.cvDataUrl) {
      // Already has a new-style path too — drop the legacy field.
      changed = true;
      const { cvDataUrl: _unused, ...rest } = candidate;
      void _unused;
      return rest;
    }
    return candidate;
  });

  if (changed) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    } catch (err) {
      console.warn('Could not persist candidate migration', err);
    }
  }

  return migrated;
}

export function getStoredCandidates(): Candidate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    if (!migrationHasRun) {
      migrationHasRun = true;
      return runLegacyMigration(parsed as LegacyCandidate[]);
    }

    return parsed as Candidate[];
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
