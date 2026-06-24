/**
 * Cloudinary server-side helper.
 * Import ONLY in Next.js API routes — never in client components.
 */
import { v2 as cloudinary } from "cloudinary";

const CLOUD_NAME  = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY     = process.env.CLOUDINARY_API_KEY;
const API_SECRET  = process.env.CLOUDINARY_API_SECRET;

if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
  throw new Error(
    "Missing Cloudinary env vars. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, " +
    "and CLOUDINARY_API_SECRET to .env.local"
  );
}

cloudinary.config({ cloud_name: CLOUD_NAME, api_key: API_KEY, api_secret: API_SECRET });

export { cloudinary };

/**
 * Upload a Buffer to Cloudinary.
 * @param buffer   Raw file bytes
 * @param publicId Desired public_id (path inside Cloudinary, no extension)
 * @param folder   Cloudinary folder, e.g. "photofly/events/WEDDING2026"
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  publicId: string,
  folder: string,
  options: { overwrite?: boolean } = {}
): Promise<{ url: string; thumbnailUrl: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        folder,
        resource_type: "image",
        overwrite: options.overwrite ?? false,
        invalidate: options.overwrite ?? false,
        // Auto-quality + format for delivery
        transformation: [{ quality: "auto", fetch_format: "auto" }],
        // Generate an eager thumbnail at 400×400 (async so upload returns faster)
        eager: [{ width: 400, height: 400, crop: "fill", gravity: "auto", quality: "auto", fetch_format: "auto" }],
        eager_async: true,
      },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error("Cloudinary upload failed"));
        const thumbnailUrl =
          (result.eager?.[0]?.secure_url as string | undefined) ??
          cloudinary.url(result.public_id, {
            width: 400, height: 400, crop: "fill", gravity: "auto",
            quality: "auto", fetch_format: "auto", secure: true,
          });
        resolve({
          url:          result.secure_url,
          thumbnailUrl,
          publicId:     result.public_id,
        });
      }
    );
    stream.end(buffer);
  });
}

/**
 * Delete a photo from Cloudinary by its public_id.
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
}
