/**
 * CvStorage abstracts where and how a candidate's CV is stored and fetched.
 *
 * Two concrete implementations live next to this file:
 *   - local.ts    — browser localStorage, used today
 *   - supabase.ts — Supabase Storage, ready to switch on once the backend is live
 *
 * The rest of the app only knows about this interface. Swapping storage
 * back-ends is one line in index.ts — no UI changes.
 */

export interface CvUploadResult {
  /**
   * Opaque identifier that the owning CvStorage implementation can later
   * resolve to a viewable URL. For Local it's a localStorage key; for
   * Supabase it's the path inside the bucket (e.g. "candidate-uuid/cv.pdf").
   */
  storagePath: string;
  fileName: string;
}

export interface CvViewResult {
  /**
   * A URL that can be passed directly to window.open / <a href>.
   * - For Local this is a short-lived blob: URL created from the stored bytes.
   * - For Supabase this is a time-limited signed URL from the private bucket.
   */
  url: string;
  /**
   * Whether the consumer should call URL.revokeObjectURL(url) after use.
   * True for blob URLs (Local); false for Supabase signed URLs.
   */
  revocable: boolean;
}

export interface CvStorage {
  upload(file: File, ownerId: string): Promise<CvUploadResult>;
  getViewUrl(storagePath: string): Promise<CvViewResult>;
  remove(storagePath: string): Promise<void>;
}
