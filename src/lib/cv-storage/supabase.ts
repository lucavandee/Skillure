import type { CvStorage, CvUploadResult, CvViewResult } from './types';

/**
 * Supabase Storage implementation of CvStorage.
 *
 * ─────────────────────────────────────────────────────────────────────
 * HOW TO SWITCH THIS ON
 * ─────────────────────────────────────────────────────────────────────
 *
 * 1. Install the Supabase client:
 *      npm install @supabase/supabase-js
 *
 * 2. Create a single shared Supabase client somewhere like
 *    `src/lib/supabase-client.ts`:
 *
 *      import { createClient } from '@supabase/supabase-js';
 *      export const supabase = createClient(
 *        import.meta.env.VITE_SUPABASE_URL,
 *        import.meta.env.VITE_SUPABASE_ANON_KEY,
 *      );
 *
 *    and add VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY to your .env.
 *
 * 3. In the Supabase dashboard, create a **private** Storage bucket
 *    called `cvs` (NOT public — CVs are AVG/GDPR-sensitive).
 *
 * 4. Create a `candidate_cvs` table (or add columns to `candidates`)
 *    with at minimum:
 *      - id            uuid primary key
 *      - candidate_id  uuid references candidates(id) on delete cascade
 *      - storage_path  text not null    -- matches the bucket path
 *      - file_name     text not null
 *      - uploaded_at   timestamptz default now()
 *      - uploaded_by   uuid references auth.users(id)
 *
 * 5. Enable Row Level Security on both the table and the bucket, and
 *    add policies so that only users from the owning organisation can
 *    read / insert / delete. Rough sketch:
 *
 *      -- table policy
 *      create policy "members can read own org cvs"
 *        on candidate_cvs for select
 *        using (
 *          exists (
 *            select 1 from organisation_members m
 *            where m.user_id = auth.uid()
 *              and m.organisation_id = candidate_cvs.organisation_id
 *          )
 *        );
 *
 *      -- storage policy (in the storage.objects table)
 *      create policy "members can read own org cv files"
 *        on storage.objects for select
 *        using (
 *          bucket_id = 'cvs'
 *          and exists (
 *            select 1 from candidate_cvs c
 *            join organisation_members m on m.organisation_id = c.organisation_id
 *            where c.storage_path = storage.objects.name
 *              and m.user_id = auth.uid()
 *          )
 *        );
 *
 * 6. Uncomment the implementation below, delete the `throw` statements,
 *    and swap the active storage in `./index.ts`.
 * ─────────────────────────────────────────────────────────────────────
 */

// import { supabase } from '../supabase-client';

const BUCKET = 'cvs';
const SIGNED_URL_TTL_SECONDS = 5 * 60; // 5 minutes

export class SupabaseCvStorage implements CvStorage {
  async upload(file: File, ownerId: string): Promise<CvUploadResult> {
    void file;
    void ownerId;
    void BUCKET;
    throw new Error(
      'SupabaseCvStorage is niet geactiveerd. Zie de instructies in dit bestand.'
    );

    /* Enable once the Supabase client is wired up:

    // Namespace uploads by candidate id so access control is simple.
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${ownerId}/${Date.now()}-${safeName}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || undefined,
      });

    if (error) {
      throw new Error(`Upload mislukt: ${error.message}`);
    }

    return { storagePath: path, fileName: file.name };
    */
  }

  async getViewUrl(storagePath: string): Promise<CvViewResult> {
    void storagePath;
    void SIGNED_URL_TTL_SECONDS;
    throw new Error(
      'SupabaseCvStorage is niet geactiveerd. Zie de instructies in dit bestand.'
    );

    /* Enable once the Supabase client is wired up:

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(storagePath, SIGNED_URL_TTL_SECONDS);

    if (error || !data?.signedUrl) {
      throw new Error(
        `Kon CV niet openen: ${error?.message ?? 'onbekende fout'}`
      );
    }

    // Signed URLs expire server-side — no client-side revocation needed.
    return { url: data.signedUrl, revocable: false };
    */
  }

  async remove(storagePath: string): Promise<void> {
    void storagePath;
    throw new Error(
      'SupabaseCvStorage is niet geactiveerd. Zie de instructies in dit bestand.'
    );

    /* Enable once the Supabase client is wired up:

    const { error } = await supabase.storage.from(BUCKET).remove([storagePath]);
    if (error) {
      throw new Error(`Verwijderen mislukt: ${error.message}`);
    }
    */
  }
}
