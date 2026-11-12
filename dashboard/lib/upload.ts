/** The host rejects request bodies over about 4.5 MB before the app sees them,
 *  so anything bigger has to be stopped on screen with a clear message. */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

/** An error message if the file is too big to upload here, otherwise null. */
export function fileTooBig(file: File | null | undefined): string | null {
  if (!file || file.size <= MAX_UPLOAD_BYTES) return null;
  const mb = (file.size / 1024 / 1024).toFixed(1);
  return `That file is ${mb} MB, and the most that can be uploaded here is 4 MB. Make it smaller, or put it online and add it as a link instead.`;
}
