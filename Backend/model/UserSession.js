import mongoose from "mongoose";

const UserSessionSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      index: true,
    },

    meetingTitle: {
      type: String,
      default: "Live Meeting",
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

    status: {
      type: String,
      enum: ["active", "ended"],
      default: "ended",
    },

    meetingType: {
      type: String,
      enum: ["public", "private"],
      default: "private",
    },

    maxParticipants: {
      type: Number,
      default: 100,
    },

    isRecording: {
      type: Boolean,
      default: false,
    },

    participants: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },

        userName: String,

        role: {
          type: String,
          enum: ["host", "guest"],
          default: "guest",
        },

        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    startedAt: {
      type: Date,
      default: Date.now,
    },

    endedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const UserSession = mongoose.model("UserSession", UserSessionSchema);

export default UserSession;
