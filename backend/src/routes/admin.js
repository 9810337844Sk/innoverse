const router = require("express").Router();
const User = require("../models/User");
const Event = require("../models/Event");
const Photo = require("../models/Photo");
const { auth, requireRole } = require("../middleware/auth");

const adminOnly = [auth, requireRole("admin")];

// GET /api/admin/stats
router.get("/stats", ...adminOnly, async (req, res) => {
  try {
    const [totalUsers, totalPhotographers, totalEvents, totalPhotos] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "photographer" }),
      Event.countDocuments(),
      Photo.countDocuments(),
    ]);

    res.json({
      totalUsers,
      totalPhotographers,
      totalEvents,
      totalPhotos,
      totalRevenue: 4820, // TODO: integrate Stripe
      storageUsedGB: Math.round(totalPhotos * 0.003), // ~3MB avg per photo
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/users
router.get("/users", ...adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 50, role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));
    const total = await User.countDocuments(filter);
    res.json({ users, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/admin/users/:id/ban
router.patch("/users/:id/ban", ...adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { banned: req.body.banned }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/admin/users/:id
router.delete("/users/:id", ...adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/events
router.get("/events", ...adminOnly, async (req, res) => {
  try {
    const events = await Event.find().populate("photographerId", "name email").sort({ createdAt: -1 }).limit(100);
    res.json({ events });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
