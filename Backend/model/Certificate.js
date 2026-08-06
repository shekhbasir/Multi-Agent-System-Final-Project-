import mongoose from "mongoose";

const CertificateSchema = new mongoose.Schema(
  {
    certificateId: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      index: true,
    },

    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserSession",
      required: true,
    },

    roomId: {
      type: String,
      required: true,
      trim: true,
    },

    meetingTitle: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    hostName: {
      type: String,
      required: true,
    },

    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    participantName: {
      type: String,
      required: true,
    },

    meetingDate: {
      type: Date,
      required: true,
    },

    durationMinutes: {
      type: Number,
      required: true,
      default: 0,
    },

    issuedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// one certificate per participant per session — generating twice just returns it
CertificateSchema.index({ session: 1, participant: 1 }, { unique: true });

const Certificate = mongoose.model("Certificate", CertificateSchema);

export default Certificate;
