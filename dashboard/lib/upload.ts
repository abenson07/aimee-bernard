/** The host rejects request bodies over about 4.5 MB before the app sees them,
 *  so anything bigger has to be stopped on screen with a clear message. */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

/** An error message if the file is too big to upload here, otherwise null. */
export function fileTooBig(file: File | null | undefined): string | null {
  if (!file || file.size <= MAX_UPLOAD_BYTES) return null;
  const mb = (file.size / 1024 / 1024).toFixed(1);
  return `That file is ${mb} MB, and the most that can be uploaded here is 4 MB. Make it smaller, or put it online and add it as a link instead.`;
}

/** Photos bigger than this are shrunk in the browser before they are sent. */
const SHRINK_ABOVE_BYTES = 3 * 1024 * 1024;
/** The site shows photos at web sizes, so a long edge of 2400px loses nothing visible. */
const SHRINK_STEPS: { edge: number; quality: number }[] = [
  { edge: 2400, quality: 0.85 },
  { edge: 1800, quality: 0.8 },
  { edge: 1400, quality: 0.75 },
];

const toBlob = (canvas: HTMLCanvasElement, quality: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));

/** Gets a photo ready to upload. A phone photo (often 4–15 MB) is redrawn smaller as a JPEG, because the
 *  host refuses any upload over about 4.5 MB. Photos already small enough are sent untouched. The
 *  full-size original is not kept. Returns the file to send, or an error message to show. */
export async function preparePhoto(file: File): Promise<{ file: File; error?: undefined } | { file?: undefined; error: string }> {
  if (file.size <= SHRINK_ABOVE_BYTES) {
    const tooBig = fileTooBig(file);
    return tooBig ? { error: tooBig } : { file };
  }
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return { error: "That photo couldn’t be opened. Save or export it as a JPG or PNG and try again." };
  }
  try {
    for (const { edge, quality } of SHRINK_STEPS) {
      const scale = Math.min(1, edge / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      const context = canvas.getContext("2d");
      if (!context) break;
      /* JPEG has no transparency; a flat white behind it keeps a transparent PNG from going black. */
      context.fillStyle = "#fff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const blob = await toBlob(canvas, quality);
      if (blob && blob.size <= MAX_UPLOAD_BYTES) {
        const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
        return { file: new File([blob], name, { type: "image/jpeg" }) };
      }
    }
  } finally {
    bitmap.close();
  }
  return { error: "That photo is too big to shrink here. Try a smaller version of it." };
}
