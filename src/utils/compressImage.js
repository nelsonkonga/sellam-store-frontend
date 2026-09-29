/**
 * Réduit une image avant envoi, sans changement visible à l'écran.
 * On ne ré-encode pas un fichier déjà petit et déjà aux bonnes dimensions.
 * Les photos trop grandes sont ramenées au côté utile, en JPEG de haute
 * qualité (0,92). Un PNG (logo, transparence) reste un PNG.
 * Si le navigateur ne peut pas traiter le fichier, l'original est envoyé :
 * le serveur applique la même règle.
 */

const LIMITS = {
  logo: { maxEdge: 512, skipBelowBytes: 200 * 1024 },
  profile: { maxEdge: 512, skipBelowBytes: 200 * 1024 },
  product: { maxEdge: 1600, skipBelowBytes: 700 * 1024 },
  attachment: { maxEdge: 1600, skipBelowBytes: 700 * 1024 },
};

const JPEG_QUALITY = 0.92;

export async function compressImageFile(file, kind = "product") {
  if (!file || !file.type?.startsWith("image/")) return file;
  const limit = LIMITS[kind] || LIMITS.product;

  try {
    if (typeof createImageBitmap !== "function") return file;
    const bitmap = await createImageBitmap(file);
    const longEdge = Math.max(bitmap.width, bitmap.height);
    const alreadyFits = longEdge <= limit.maxEdge && file.size <= limit.skipBelowBytes;
    if (alreadyFits) {
      bitmap.close?.();
      return file;
    }

    const scale = longEdge > limit.maxEdge ? limit.maxEdge / longEdge : 1;
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const keepPng = file.type === "image/png";
    const mime = keepPng ? "image/png" : "image/jpeg";
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, mime, keepPng ? undefined : JPEG_QUALITY));
    if (!blob || blob.size >= file.size) return file;

    const baseName = (file.name || "image").replace(/\.[^.]+$/, "");
    const extension = keepPng ? "png" : "jpg";
    return new File([blob], `${baseName}.${extension}`, { type: mime, lastModified: Date.now() });
  } catch {
    return file;
  }
}
