import express from "express";
import { isAuth } from "../middleware/isAuthenticated.js";
import upload from "../middleware/upload.js";
import {
  getWhiteboard,
  saveWhiteboard,
  uploadWhiteboardFile,
} from "../controller/whiteboardController.js";

const router = express.Router();

router.get("/:roomId", isAuth, getWhiteboard);
router.post("/save", isAuth, saveWhiteboard);
router.post("/upload", isAuth, upload.single("file"), uploadWhiteboardFile);

export default router;
