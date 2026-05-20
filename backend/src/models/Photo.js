const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true, index: true },
  url: { type: String, required: true },
  publicId: String, // Cloudinary public ID
  thumbnailUrl: String,
  width: Number,
  height: Number,
  facesCount: { type: Number, default: 0 },
  // Face embeddings stored as array of face objects
  faces: [{
    faceId: String,
    embedding: [Number], // 128-dim FaceNet embedding
    bbox: { x: Number, y: Number, w: Number, h: Number },
  }],
  indexed: { type: Boolean, default: false },
  tags: [String], // AI-generated tags: smile, group, outdoor, etc.
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

photoSchema.index({ eventId: 1, indexed: 1 });

module.exports = mongoose.model("Photo", photoSchema);
