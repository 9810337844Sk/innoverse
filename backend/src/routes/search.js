const router = require("express").Router();
const multer = require("multer");
const axios = require("axios");
const Event = require("../models/Event");
const Photo = require("../models/Photo");
const SearchLog = require("../models/SearchLog");

// Use memory storage for selfie (don't persist, just process)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// POST /api/search/face
router.post("/face", upload.single("selfie"), async (req, res) => {
  try {
    const { eventCode } = req.body;
    if (!req.file) return res.status(400).json({ message: "Selfie required" });
    if (!eventCode) return res.status(400).json({ message: "Event code required" });

    // Find event
    const event = await Event.findOne({ code: eventCode.toUpperCase(), isActive: true });
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Send selfie to AI service for face search
    const aiUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";
    const FormData = require("form-data");
    const form = new FormData();
    form.append("selfie", req.file.buffer, { filename: "selfie.jpg", contentType: req.file.mimetype });
    form.append("event_id", event._id.toString());
    form.append("threshold", "0.6");

    const { data } = await axios.post(`${aiUrl}/search`, form, {
      headers: form.getHeaders(),
      timeout: 30000,
    });

    // Fetch matched photos with URLs
    const matchedPhotoIds = data.matches.map((m) => m.photo_id);
    const photos = await Photo.find({ _id: { $in: matchedPhotoIds } }).select("url thumbnailUrl tags");

    const matches = data.matches.map((m) => {
      const photo = photos.find((p) => p._id.toString() === m.photo_id);
      return photo ? { ...photo.toObject(), similarity: m.similarity } : null;
    }).filter(Boolean);

    // Log search
    await SearchLog.create({
      eventId: event._id,
      matchCount: matches.length,
      ipAddress: req.ip,
    });
    await Event.findByIdAndUpdate(event._id, { $inc: { searchCount: 1 } });

    res.json({ matches, eventName: event.name, total: matches.length });
  } catch (err) {
    console.error("Search error:", err.message);
    res.status(500).json({ message: "Face search failed. Please try again." });
  }
});

module.exports = router;
