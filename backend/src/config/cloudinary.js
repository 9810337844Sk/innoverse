const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Selfie storage (shared, no per-photographer isolation needed) ──────────
const selfieStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "snapfind/selfies",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
  },
});

const uploadSelfie = multer({
  storage: selfieStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// ── Photo storage is built dynamically per photographer in photos.js ───────
// Folder pattern: snapfind/photographers/<photographerId>/events/<eventId>/
// This ensures complete isolation — one photographer cannot access another's
// Cloudinary folder even if they somehow obtained a public_id.

module.exports = { cloudinary, uploadSelfie };
