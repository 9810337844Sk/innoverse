const router = require("express").Router();
const Photo = require("../models/Photo");
const Event = require("../models/Event");
const { auth, requireRole } = require("../middleware/auth");
const { cloudinary } = require("../config/cloudinary");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const axios = require("axios");

/* ── Dynamic per-photographer Cloudinary storage ─────────────────────────── */
// Folder structure: snapfind/photographers/<photographerId>/events/<eventId>/
function makePhotoUploader(photographerId, eventId) {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `snapfind/photographers/${photographerId}/events/${eventId}`,
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    },
  });
  return multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });
}

/* ── Helper: verify event ownership ─────────────────────────────────────── */
async function getOwnedEvent(eventId, userId, userRole) {
  const event = await Event.findById(eventId);
  if (!event) return { error: "Event not found", status: 404 };
  if (userRole !== "admin" && String(event.photographerId) !== String(userId)) {
    return { error: "Access denied — this event belongs to another photographer", status: 403 };
  }
  return { event };
}

// GET /api/photos?eventId=xxx — only own events (or admin)
router.get("/", auth, requireRole("photographer", "admin"), async (req, res) => {
  try {
    const { eventId, page = 1, limit = 50 } = req.query;

    let filter = {};
    if (eventId) {
      // Verify ownership before returning photos
      const { event, error, status } = await getOwnedEvent(eventId, req.user._id, req.user.role);
      if (error) return res.status(status).json({ message: error });
      filter = { eventId: event._id };
    } else {
      // No eventId — scope to photographer's own events only
      if (req.user.role !== "admin") {
        const ownEvents = await Event.find({ photographerId: req.user._id }).select("_id");
        const ownEventIds = ownEvents.map(e => e._id);
        filter = { eventId: { $in: ownEventIds } };
      }
    }

    const photos = await Photo.find(filter)
      .select("-faces.embedding")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Photo.countDocuments(filter);
    res.json({ photos, total, page: parseInt(page) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/photos/upload — bulk upload into photographer's own Cloudinary folder
router.post(
  "/upload",
  auth,
  requireRole("photographer", "admin"),
  async (req, res, next) => {
    // We need eventId before multer runs so we can set the folder dynamically.
    // Parse it from the body first (multipart sends fields before files).
    // We use a temp memory storage just to read the field, then re-upload properly.
    const eventId = req.query.eventId || req.body?.eventId;
    if (!eventId) return res.status(400).json({ message: "eventId required" });

    const { event, error, status } = await getOwnedEvent(eventId, req.user._id, req.user.role);
    if (error) return res.status(status).json({ message: error });

    // Attach event to request so the next handler can use it
    req._event = event;

    // Build uploader scoped to this photographer + event
    const uploader = makePhotoUploader(String(req.user._id), String(event._id));
    uploader.array("photos", 100)(req, res, next);
  },
  async (req, res) => {
    try {
      const event = req._event;

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const photos = await Photo.insertMany(
        req.files.map((f) => ({
          eventId: event._id,
          url: f.path,
          publicId: f.filename,
          thumbnailUrl: f.path.replace("/upload/", "/upload/w_400,h_400,c_fill/"),
          width: f.width,
          height: f.height,
          uploadedBy: req.user._id,
        }))
      );

      await Event.findByIdAndUpdate(event._id, { $inc: { photoCount: photos.length } });

      res.status(201).json({ photos, count: photos.length });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// POST /api/photos/index/:eventId — trigger AI face indexing (own events only)
router.post("/index/:eventId", auth, requireRole("photographer", "admin"), async (req, res) => {
  try {
    const { event, error, status } = await getOwnedEvent(req.params.eventId, req.user._id, req.user.role);
    if (error) return res.status(status).json({ message: error });

    const photos = await Photo.find({ eventId: event._id, indexed: false });
    if (!photos.length) return res.json({ message: "All photos already indexed" });

    const aiUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";
    axios.post(`${aiUrl}/index`, {
      eventId: event._id,
      photos: photos.map(p => ({ id: p._id, url: p.url })),
    }).catch(err => console.error("AI indexing error:", err.message));

    res.json({ message: `Indexing ${photos.length} photos`, count: photos.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/photos/index-callback — called by AI service when done (internal)
router.post("/index-callback", async (req, res) => {
  try {
    const { photoId, faces, tags } = req.body;
    await Photo.findByIdAndUpdate(photoId, {
      faces,
      facesCount: faces.length,
      tags,
      indexed: true,
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/photos/:id — only owner or admin
router.delete("/:id", auth, requireRole("photographer", "admin"), async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) return res.status(404).json({ message: "Photo not found" });

    // Verify the event belongs to this photographer
    const { error, status } = await getOwnedEvent(photo.eventId, req.user._id, req.user.role);
    if (error) return res.status(status).json({ message: error });

    await photo.deleteOne();
    if (photo.publicId) await cloudinary.uploader.destroy(photo.publicId);
    await Event.findByIdAndUpdate(photo.eventId, { $inc: { photoCount: -1 } });

    res.json({ message: "Photo deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
