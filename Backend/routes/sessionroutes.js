// backend/routes/sessionroutes.js
import express from "express";
import { isAuth } from "../middleware/isAuthenticated.js";
import {
  createSession,
  joinSession,
  leaveSession,
  endSession,
  getMySessions,
  getActiveSessions,
  searchSessions,
  getSession,
  getSessionParticipants,
} from "../controller/sessionController.js";

const router = express.Router();
router.post("/create", isAuth, createSession);

router.post("/join/:roomId", isAuth, joinSession);

router.post("/leave/:roomId", isAuth, leaveSession);

router.post("/end/:roomId", isAuth, endSession);

router.get("/my-sessions", isAuth, getMySessions);

router.get("/active", isAuth, getActiveSessions);

// must come before "/:roomId" or "search" gets swallowed as a roomId
router.get("/search", isAuth, searchSessions);

router.get("/participants/:roomId", isAuth, getSessionParticipants);

router.get("/:roomId", isAuth, getSession);

export default router;
