/**
 * Opens a CV (stored as a base64 data URL) in a new browser tab.
 *
 * Some browsers refuse to navigate to long data: URLs, so we convert
 * the data URL to a short-lived blob URL and open that instead. The
 * blob URL is revoked after a delay to let the new tab load the file.
 */
export function openCvInNewTab(dataUrl: string, fileName?: string): void {
  try {
    const [header, base64] = dataUrl.split(',');
    const mimeMatch = header.match(/data:([^;]+);base64/);
    const mime = mimeMatch?.[1] ?? 'application/octet-stream';

    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    const blob = new Blob([bytes], { type: mime });
    const blobUrl = URL.createObjectURL(blob);

    const opened = window.open(blobUrl, '_blank', 'noopener,noreferrer');

    if (!opened) {
      // Popup blocked — fall back to a triggered download so the user
      // at least gets access to their file.
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName ?? 'cv';
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    // Give the new tab (or download) time to pick up the URL before revoking.
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
  } catch (err) {
    console.error('Kon CV niet openen', err);
  }
}
