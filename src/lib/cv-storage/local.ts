import type { CvStorage, CvUploadResult, CvViewResult } from './types';

/**
 * Local, browser-only implementation of CvStorage.
 *
 * Stores each CV as a base64 data URL under its own localStorage key
 * (one key per CV, kept separate from the candidate records so the
 * candidate list JSON stays small).
 *
 * Intended for development and small demos only. When the real Supabase
 * backend is hooked up, this implementation can be left in place as a
 * fallback or removed entirely.
 */

const KEY_PREFIX = 'skillure:cv:';

function makeKey(id: string): string {
  return `${KEY_PREFIX}${id}`;
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `cv-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Onverwachte bestandsinhoud'));
      }
    };
    reader.onerror = () =>
      reject(reader.error ?? new Error('Kon bestand niet lezen'));
    reader.readAsDataURL(file);
  });
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(',');
  const mimeMatch = header.match(/data:([^;]+);base64/);
  const mime = mimeMatch?.[1] ?? 'application/octet-stream';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

export class LocalCvStorage implements CvStorage {
  async upload(file: File, ownerId: string): Promise<CvUploadResult> {
    // ownerId is unused locally (Supabase needs it for bucket pathing)
    void ownerId;
    const dataUrl = await readFileAsDataUrl(file);
    const id = generateId();
    const key = makeKey(id);

    try {
      localStorage.setItem(key, dataUrl);
    } catch {
      throw new Error(
        'Kon CV niet opslaan — mogelijk is het bestand te groot voor lokale opslag.'
      );
    }

    return {
      storagePath: key,
      fileName: file.name,
    };
  }

  async getViewUrl(storagePath: string): Promise<CvViewResult> {
    const dataUrl = localStorage.getItem(storagePath);
    if (!dataUrl) {
      throw new Error('CV niet gevonden in lokale opslag');
    }
    const blob = dataUrlToBlob(dataUrl);
    const url = URL.createObjectURL(blob);
    return { url, revocable: true };
  }

  async remove(storagePath: string): Promise<void> {
    localStorage.removeItem(storagePath);
  }
}

/**
 * Migration helper for candidates that were saved under the previous
 * inline-dataUrl schema (before the CvStorage abstraction existed).
 *
 * Takes an old-style `cvDataUrl` value, writes it under a fresh CV key,
 * and returns the new storage path. Safe to call once per candidate at
 * load time.
 */
export function migrateLegacyDataUrl(dataUrl: string): string | null {
  try {
    const id = generateId();
    const key = makeKey(id);
    localStorage.setItem(key, dataUrl);
    return key;
  } catch {
    return null;
  }
}

export function isLocalCvKey(storagePath: string): boolean {
  return storagePath.startsWith(KEY_PREFIX);
}
