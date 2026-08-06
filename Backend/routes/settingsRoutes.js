import express from "express";
import { isAuth } from "../middleware/isAuthenticated.js";
import upload from "../middleware/upload.js";
import {
  getMySettings,
  updateProfile,
  uploadAvatar,
  uploadCoverPhoto,
  changePassword,
  updatePreferences,
  updateMeetingPreferences,
} from "../controller/settingsController.js";

const router = express.Router();

router.get("/me", isAuth, getMySettings);
router.put("/profile", isAuth, updateProfile);
router.post("/avatar", isAuth, upload.single("avatar"), uploadAvatar);
router.post("/cover-photo", isAuth, upload.single("cover"), uploadCoverPhoto);
router.put("/password", isAuth, changePassword);
router.put("/preferences", isAuth, updatePreferences);
router.put("/meeting-preferences", isAuth, updateMeetingPreferences);

export default router;
