import mongoose from "mongoose";

const userschema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
      minlength: [3, "Username must be at least 3 characters"],
      match: [
        /^[a-z0-9_.]+$/,
        "Username can only contain letters, numbers, dots and underscores",
      ],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    bio: {
      type: String,
      maxlength: 200,
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
    coverPhoto: {
      type: String,
      default: "",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    preferences: {
      theme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "dark",
      },
      language: {
        type: String,
        default: "en",
      },
      timezone: {
        type: String,
        default: "Asia/Kolkata",
      },
      notifications: {
        meetingReminders: { type: Boolean, default: true },
        chatMessages: { type: Boolean, default: true },
        emailDigest: { type: Boolean, default: true },
        participantJoined: { type: Boolean, default: true },
        marketing: { type: Boolean, default: false },
      },
      privacy: {
        showOnlineStatus: { type: Boolean, default: true },
        allowDirectMessages: { type: Boolean, default: true },
        profileVisibility: {
          type: String,
          enum: ["public", "contacts", "private"],
          default: "public",
        },
      },
    },
    meetingPreferences: {
      defaultCameraOn: { type: Boolean, default: true },
      defaultMicOn: { type: Boolean, default: true },
      preferredCameraId: { type: String, default: "" },
      preferredMicId: { type: String, default: "" },
      preferredSpeakerId: { type: String, default: "" },
      autoRecord: { type: Boolean, default: false },
      defaultPermissions: {
        allowScreenShare: { type: Boolean, default: true },
        allowChat: { type: Boolean, default: true },
        allowParticipantUnmute: { type: Boolean, default: false },
      },
    },
    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userschema);

export default User;
