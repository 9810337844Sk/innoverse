const mongoose = require("mongoose");
const { customAlphabet } = require("nanoid");

const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 8);

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  code: { type: String, unique: true, uppercase: true },
  photographerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  description: String,
  coverImage: String,
  watermark: { enabled: { type: Boolean, default: false }, text: String, opacity: { type: Number, default: 0.3 } },
  paidDownloads: { enabled: { type: Boolean, default: false }, price: { type: Number, default: 0 } },
  photoCount: { type: Number, default: 0 },
  searchCount: { type: Number, default: 0 },
  downloadCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

eventSchema.pre("save", function (next) {
  if (!this.code) this.code = nanoid();
  next();
});

module.exports = mongoose.model("Event", eventSchema);
