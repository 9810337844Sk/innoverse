const router = require("express").Router();
const Event = require("../models/Event");
const Photo = require("../models/Photo");
const SearchLog = require("../models/SearchLog");
const { auth, requireRole } = require("../middleware/auth");

// GET /api/photographer/stats
router.get("/stats", auth, requireRole("photographer", "admin"), async (req, res) => {
  try {
    const photographerId = req.user._id;
    const events = await Event.find({ photographerId });
    const eventIds = events.map((e) => e._id);

    const [totalPhotos, totalSearches] = await Promise.all([
      Photo.countDocuments({ eventId: { $in: eventIds } }),
      SearchLog.countDocuments({ eventId: { $in: eventIds } }),
    ]);

    const totalDownloads = events.reduce((sum, e) => sum + (e.downloadCount || 0), 0);

    res.json({
      totalEvents: events.length,
      totalPhotos,
      totalSearches,
      totalDownloads,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
