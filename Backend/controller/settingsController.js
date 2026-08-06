import bcrypt from "bcryptjs";
import User from "../model/user.js";

// GET /api/settings/me
export const getMySettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/settings/profile
export const updateProfile = async (req, res) => {
  try {
    const { name, username, phone, bio } = req.body;

    if (username) {
      const taken = await User.findOne({
        username: username.toLowerCase(),
        _id: { $ne: req.user._id },
      });
      if (taken) {
        return res.status(409).json({
          success: false,
          message: "Username already taken",
        });
      }
    }

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      {
        ...(name !== undefined && { name }),
        ...(username !== undefined && { username: username.toLowerCase() }),
        ...(phone !== undefined && { phone }),
        ...(bio !== undefined && { bio }),
      },
      { new: true, runValidators: true },
    ).select("-password");

    return res.status(200).json({
      success: true,
      message: "Profile updated",
      user: updated,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Username already taken",
      });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/settings/avatar   (multipart, field name: "avatar")
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }
    const avatarUrl = `/uploads/${req.file.filename}`;
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true },
    ).select("-password");

    return res.status(200).json({
      success: true,
      message: "Profile photo updated",
      avatar: avatarUrl,
      user: updated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/settings/cover-photo (multipart, field name: "cover")
export const uploadCoverPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }
    const coverUrl = `/uploads/${req.file.filename}`;
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { coverPhoto: coverUrl },
      { new: true },
    ).select("-password");

    return res.status(200).json({
      success: true,
      message: "Cover photo updated",
      coverPhoto: coverUrl,
      user: updated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/settings/password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters",
      });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/settings/preferences
export const updatePreferences = async (req, res) => {
  try {
    const { theme, language, timezone, notifications, privacy } = req.body;

    const user = await User.findById(req.user._id);

    if (theme) user.preferences.theme = theme;
    if (language) user.preferences.language = language;
    if (timezone) user.preferences.timezone = timezone;
    if (notifications) {
      user.preferences.notifications = {
        ...user.preferences.notifications.toObject(),
        ...notifications,
      };
    }
    if (privacy) {
      user.preferences.privacy = {
        ...user.preferences.privacy.toObject(),
        ...privacy,
      };
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Preferences updated",
      preferences: user.preferences,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/settings/meeting-preferences
export const updateMeetingPreferences = async (req, res) => {
  try {
    const {
      defaultCameraOn,
      defaultMicOn,
      preferredCameraId,
      preferredMicId,
      preferredSpeakerId,
      autoRecord,
      defaultPermissions,
    } = req.body;

    const user = await User.findById(req.user._id);
    const mp = user.meetingPreferences;

    if (defaultCameraOn !== undefined) mp.defaultCameraOn = defaultCameraOn;
    if (defaultMicOn !== undefined) mp.defaultMicOn = defaultMicOn;
    if (preferredCameraId !== undefined)
      mp.preferredCameraId = preferredCameraId;
    if (preferredMicId !== undefined) mp.preferredMicId = preferredMicId;
    if (preferredSpeakerId !== undefined)
      mp.preferredSpeakerId = preferredSpeakerId;
    if (autoRecord !== undefined) mp.autoRecord = autoRecord;
    if (defaultPermissions) {
      mp.defaultPermissions = {
        ...mp.defaultPermissions.toObject(),
        ...defaultPermissions,
      };
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Meeting preferences updated",
      meetingPreferences: user.meetingPreferences,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
