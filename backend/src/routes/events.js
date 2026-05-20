const router = require("express").Router();
const Event = require("../models/Event");
const { auth, requireRole } = require("../middleware/auth");

// GET /api/events — photographer's events
router.get("/", auth, requireRole("photographer", "admin"), async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : { photographerId: req.user._id };
    const limit = parseInt(req.query.limit) || 50;
    const events = await Event.find(filter).sort({ createdAt: -1 }).limit(limit);
    res.json({ events });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/events/:id — only owner or admin
router.get("/:id", auth, requireRole("photographer", "admin"), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Non-admin photographers can only view their own events
    if (req.user.role !== "admin" && String(event.photographerId) !== String(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/events/code/:code — public lookup by code
router.get("/code/:code", async (req, res) => {
  try {
    const event = await Event.findOne({ code: req.params.code.toUpperCase(), isActive: true })
      .select("name date code coverImage");
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/events
router.post("/", auth, requireRole("photographer", "admin"), async (req, res) => {
  try {
    const { name, date, description } = req.body;
    const event = await Event.create({ name, date, description, photographerId: req.user._id });
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/events/:id
router.patch("/:id", auth, requireRole("photographer", "admin"), async (req, res) => {
  try {
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, photographerId: req.user._id },
      req.body,
      { new: true }
    );
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/events/:id
router.delete("/:id", auth, requireRole("photographer", "admin"), async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? { _id: req.params.id } : { _id: req.params.id, photographerId: req.user._id };
    const event = await Event.findOneAndDelete(filter);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json({ message: "Event deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
