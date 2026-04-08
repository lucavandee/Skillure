import { cvStorage } from './cv-storage';

/**
 * Resolves a stored CV to a viewable URL and opens it in a new browser tab.
 *
 * Works with any CvStorage backend: LocalCvStorage returns a short-lived
 * blob URL (revoked after use), SupabaseCvStorage returns a time-limited
 * signed URL (nothing to clean up).
 *
 * Falls back to a forced download when the browser blocks the popup.
 */
export async function viewCv(
  storagePath: string,
  fileName?: string
): Promise<void> {
  let view: Awaited<ReturnType<typeof cvStorage.getViewUrl>>;
  try {
    view = await cvStorage.getViewUrl(storagePath);
  } catch (err) {
    console.error('Kon CV niet laden', err);
    alert(
      err instanceof Error && err.message
        ? `Kon CV niet openen: ${err.message}`
        : 'Kon CV niet openen'
    );
    return;
  }

  const opened = window.open(view.url, '_blank', 'noopener,noreferrer');

  if (!opened) {
    // Popup blocked — fall back to a triggered download so the user
    // at least gets access to their file.
    const a = document.createElement('a');
    a.href = view.url;
    a.download = fileName ?? 'cv';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  if (view.revocable) {
    // Give the new tab (or download) time to pick up the URL before revoking.
    setTimeout(() => URL.revokeObjectURL(view.url), 60_000);
  }
}
