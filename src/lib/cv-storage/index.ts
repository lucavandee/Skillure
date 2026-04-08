import { LocalCvStorage } from './local';
// import { SupabaseCvStorage } from './supabase';
import type { CvStorage } from './types';

export type { CvStorage, CvUploadResult, CvViewResult } from './types';
export { migrateLegacyDataUrl, isLocalCvKey } from './local';

/**
 * The single CV storage backend the rest of the app talks to.
 *
 * To migrate to Supabase:
 *   1. Follow the setup steps in ./supabase.ts
 *   2. Swap the line below to `new SupabaseCvStorage()`
 *   3. Bump the limits below — Supabase Storage caps at 50MB per file
 *      on the free tier, far higher than the 2MB localStorage ceiling.
 *   4. Optionally write a one-shot migration that moves rows from the
 *      Local store into Supabase Storage and updates candidate.cvStoragePath
 *
 * No component code needs to change.
 */
export const cvStorage: CvStorage = new LocalCvStorage();
// export const cvStorage: CvStorage = new SupabaseCvStorage();

/**
 * Limits and accepted types for the currently active CvStorage backend.
 * Kept here (not inside each implementation) so the upload form has one
 * place to read from regardless of backend. When you swap to Supabase,
 * bump MAX_CV_SIZE_BYTES to e.g. 20 * 1024 * 1024.
 */
export const MAX_CV_SIZE_BYTES = 2 * 1024 * 1024;

export const ALLOWED_CV_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
];

export const ALLOWED_CV_EXTENSIONS = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
