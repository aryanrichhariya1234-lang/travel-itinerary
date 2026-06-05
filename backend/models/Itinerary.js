const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// ─── Sub-schemas ──────────────────────────────────────────────────────────────

const flightSchema = new mongoose.Schema({
  airline: String,
  flightNumber: String,
  from: String,
  to: String,
  departureDate: String,
  departureTime: String,
  arrivalDate: String,
  arrivalTime: String,
  class: String,
  pnr: String,
  terminal: String,
});

const hotelSchema = new mongoose.Schema({
  name: String,
  address: String,
  city: String,
  checkIn: String,
  checkOut: String,
  roomType: String,
  confirmationNumber: String,
  nights: Number,
});

const activitySchema = new mongoose.Schema({
  day: Number,
  date: String,
  time: String,
  title: { type: String, required: true },
  description: String,
  location: String,
  duration: String,
  category: {
    type: String,
    enum: ['travel', 'accommodation', 'sightseeing', 'dining', 'leisure', 'transport', 'other'],
    default: 'other',
  },
  tips: [String],
});

const uploadedDocumentSchema = new mongoose.Schema({
  originalName: String,
  cloudinaryUrl: String,
  cloudinaryPublicId: String,
  fileType: String, // 'pdf' | 'image'
  uploadedAt: { type: Date, default: Date.now },
});

// ─── Main Schema ──────────────────────────────────────────────────────────────

const itinerarySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    destination: {
      type: String,
      required: true,
    },

    startDate: String,
    endDate: String,
    totalDays: Number,

    summary: String,
    highlights: [String],

    flights: [flightSchema],
    hotels: [hotelSchema],
    activities: [activitySchema],

    documents: [uploadedDocumentSchema],

    // Share functionality
    shareToken: {
      type: String,
      unique: true,
      sparse: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    shareViewCount: {
      type: Number,
      default: 0,
    },

    // Raw extracted text (for debugging / re-processing)
    extractedText: {
      type: String,
      select: false,
    },

    status: {
      type: String,
      enum: ['processing', 'ready', 'failed'],
      default: 'processing',
    },

    tags: [String],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Virtual: share URL
itinerarySchema.virtual('shareUrl').get(function () {
  if (this.shareToken) {
    return `${process.env.APP_BASE_URL}/share/${this.shareToken}`;
  }
  return null;
});

// Generate share token
itinerarySchema.methods.generateShareToken = function () {
  this.shareToken = uuidv4();
  this.isPublic = true;
  return this.shareToken;
};

// Index for share token lookups
itinerarySchema.index({ shareToken: 1 });
itinerarySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Itinerary', itinerarySchema);
