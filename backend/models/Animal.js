
const mongoose = require("mongoose");
const { randomUUID } = require("crypto");

const animalSchema = new mongoose.Schema(
  {
    animalId: {
      type: String,
      unique: true,
      default: () => randomUUID(),
    },

    name: {
      type: String,
      trim: true,
      default: "Unknown",
    },

    animalType: {
      type: String,
      enum: ["dog", "cat"],
      required: true,
    },

    breed: {
      type: String,
      default: "Unknown",
    },

    gender: {
      type: String,
      enum: ["male", "female", "unknown"],
      default: "unknown",
    },

    estimatedAge: {
      type: String,
      default: "Unknown",
    },

    color: {
      type: String,
      default: "Unknown",
    },

    description: {
      type: String,
      trim: true,
    },

    location: {
      latitude: {
        type: Number,
        required: true,
        min: -90,
        max: 90,
      },
      longitude: {
        type: Number,
        required: true,
        min: -180,
        max: 180,
      },
      address: {
        type: String,
        default: "",
      },
      ward: {
        type: String,
        default: "",
      },
    },

    vaccination: {
      isVaccinated: {
        type: Boolean,
        default: false,
      },
      vaccineName: String,
      vaccinationDate: Date,
      nextDueDate: Date,
    },

    sterilization: {
      isSterilized: {
        type: Boolean,
        default: false,
      },
      sterilizationDate: Date,
    },

    healthStatus: {
      type: String,
      enum: ["healthy", "injured", "sick", "critical", "unknown"],
      default: "unknown",
    },

    registeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    imageUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Geospatial index for location-based searches
animalSchema.index({
  "location.latitude": 1,
  "location.longitude": 1,
});

module.exports = mongoose.model("Animal", animalSchema);
