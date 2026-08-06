import express from "express";
import { isAuth } from "../middleware/isAuthenticated.js";
import {
  generateCertificate,
  getSessionCertificates,
  getMyCertificates,
  verifyCertificate,
} from "../controller/certificateController.js";

const router = express.Router();

router.post("/generate", isAuth, generateCertificate);
router.get("/my-certificates", isAuth, getMyCertificates);
router.get("/session/:roomId", isAuth, getSessionCertificates);

// Public verification — no login required
router.get("/verify/:certificateId", verifyCertificate);

export default router;
