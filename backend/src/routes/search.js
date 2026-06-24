const router = require("express").Router();
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const Event = require("../models/Event");
const Photo = require("../models/Photo");
const SearchLog = require("../models/SearchLog");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const AI_URL = () => (process.env.AI_SERVICE_URL || "http://localhost:8000").replace(/\/+$/, "");

// POST /api/search/face
router.post("/face", upload.single("selfie"), async (req, res) => {
  try {
    const { eventCode } = req.body;
    if (!req.file)    return res.status(400).json({ error: "bad_request",  message: "Selfie file is required" });
    if (!eventCode)   return res.status(400).json({ error: "bad_request",  message: "eventCode is required" });

    // Resolve event
    const event = await Event.findOne({
      code: eventCode.toUpperCase().trim(),
      isActive: true,
    });
    if (!event) {
      return res.status(404).json({ error: "not_found", message: "Event not found. Check the event code and try again." });
    }

    // Forward selfie to Python AI service
    const form = new FormData();
    form.append("selfie",   req.file.buffer, { filename: "selfie.jpg", contentType: req.file.mimetype });
    form.append("event_id", event._id.toString());
    form.append("threshold", "0.6");

    let aiData;
    try {
      const { data } = await axios.post(`${AI_URL()}/search`, form, {
        headers:        form.getHeaders(),
        timeout:        28_000,
        maxContentLength: Infinity,
        maxBodyLength:    Infinity,
      });
      aiData = data;
    } catch (axiosErr) {
      if (axiosErr.code === "ECONNABORTED" || axiosErr.code === "ETIMEDOUT") {
        return res.status(503).json({
          error:   "server_unavailable",
          message: "AI search timed out — falling back to client search",
        });
      }
      if (axiosErr.code === "ECONNREFUSED" || axiosErr.code === "ENOTFOUND") {
        return res.status(503).json({
          error:   "server_unavailable",
          message: "AI service unavailable — falling back to client search",
        });
      }
      if (axiosErr.response?.status === 400) {
        return res.status(400).json({
          error:   "no_face",
          message: axiosErr.response.data?.detail || "No face detected in selfie",
        });
      }
      throw axiosErr;
    }

    // Enrich match stubs with full photo documents
    const matchedIds = (aiData.matches || []).map((m) => m.photo_id || m._id);
    const photos     = await Photo.find({ _id: { $in: matchedIds } })
      .select("url thumbnailUrl tags facesCount name");

    const photoIndex = Object.fromEntries(photos.map((p) => [p._id.toString(), p]));

    const matches = (aiData.matches || [])
      .map((m) => {
        const id    = m.photo_id || m._id;
        const photo = photoIndex[id];
        if (!photo) return null;
        return {
          _id:          photo._id,
          url:          photo.url,
          thumbnailUrl: photo.thumbnailUrl || null,
          name:         photo.name || id,
          tags:         photo.tags || [],
          facesCount:   photo.facesCount ?? m.facesCount ?? 1,
          similarity:   m.similarity,
        };
      })
      .filter(Boolean);

    // Log asynchronously — don't block response
    Promise.all([
      SearchLog.create({ eventId: event._id, matchCount: matches.length, ipAddress: req.ip }),
      Event.findByIdAndUpdate(event._id, { $inc: { searchCount: 1 } }),
    ]).catch((e) => console.error("Search log error:", e));

    return res.json({ matches, eventName: event.name, total: matches.length });

  } catch (err) {
    console.error("Search route error:", err.message);
    return res.status(500).json({
      error:   "server_error",
      message: "Face search failed. Please try again.",
    });
  }
});

module.exports = router;
