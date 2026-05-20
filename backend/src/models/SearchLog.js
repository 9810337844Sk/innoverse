const mongoose = require("mongoose");

const searchLogSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  selfieUrl: String,
  matchCount: { type: Number, default: 0 },
  ipAddress: String,
}, { timestamps: true });

module.exports = mongoose.model("SearchLog", searchLogSchema);
